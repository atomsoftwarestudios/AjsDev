/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace Ajs.MVVM.ViewModel {

    "use strict";

    /**
     * Default time to wait for initialization of newly created view component
     * <p>
     * Once the view component is created it needs to be initialized (ie. by data provided by some Model). It is asynchronous operation
     * as it may be necessary to download some data from the server. The createViewComponent method is checking in
     * @see {ajs.mvvm.view.COMPONENT_INITIALIZATION_CHECK_INTERVAL} intervals if the component is initialized and if so it continues with
     * the standard component processing (like rendering). This constant is used to determine if initialization of the component does not
     * take too long and interrupts waiting after defined amount of time in specified in miliseconds.
     * </p>
     */
    // const COMPONENT_INITILAIZATION_TIMEOUT: number = 30000;

    export class ViewComponentManager implements IViewComponentManager {

        private __container: DI.IContainer;
        private __documentManager: Doc.IDocumentManager;
        private __templateManager: Templating.ITemplateManager;
        private __viewManager: View.IViewManager;

        private __components: IRegisteredViewComponentsDict;
        public get components(): IRegisteredViewComponentsDict { return this.__components; }

        private __componentDependencies: IViewComponentDependencies[];
        private __componentInstances: IInstancedViewComponentsCollection;

        private __rootViewComponent: IViewComponent;

        /** Notifies subscribers (usually view components) the Navigation event occured */
        private __navigationNotifier: Ajs.Events.Notifier<IViewComponentManager>;
        public get navigationNotifier(): Ajs.Events.Notifier<IViewComponentManager> { return this.__navigationNotifier; }

        public constructor(
            container: DI.IContainer,
            documentManager: Doc.IDocumentManager,
            templateManager: Templating.ITemplateManager,
            viewManager: View.IViewManager) {

            this.__container = container;
            this.__documentManager = documentManager;
            this.__templateManager = templateManager;
            this.__viewManager = viewManager;
            this.__components = {};
            this.__componentDependencies = [];
            this.__componentInstances = {};
            this.__rootViewComponent = null;

            this.__navigationNotifier = new Ajs.Events.Notifier<IViewComponentManager>();

            // to review
            if (Ajs.viewComponentsToRegister instanceof Array) {
                this.registerComponents.apply(this, Ajs.viewComponentsToRegister);
            }
        }

        /**
         * 
         * @param componentConstructor
         */
        public registerComponents(...componentConstructor: CtorTyped<IViewComponent>[]): void {
            for (let i: number = 0; i < componentConstructor.length; i++) {
                if (!this.__isComponentConstructorRegistered(componentConstructor[i])) {
                    this.__registerComponent(componentConstructor[i]);
                } else {
                    throw new SameViewComponentRegisteredAlreadyException();
                }
            }
        }

        public addComponentDependencies<ConfigParams>(
            component: CtorTyped<Ajs.MVVM.ViewModel.IViewComponent>,
            ...dependencies: any[]): IViewComponentManager {

            this.__addComponentDependencies(component, dependencies);
            return this;

        }

        /**
         * 
         * @param name
         * @param id
         * @param parentComponent
         * @param state
         */
        public async createViewComponent(
            name: string,
            id: string,
            parentComponent: IParentViewComponent,
            state?: IViewComponentState,
            parentComponentInitStateNotify?: IViewComponent
        ): Promise<IViewComponent> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            // get the visual component for the view component
            let visualComponent: Templating.IVisualComponent;
            visualComponent = this.__templateManager.getVisualComponent(name);

            // throw error if it does not exist
            if (visualComponent === null) {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                    "Visual component is not defined (probably the appropriate template is not loaded): " + name);
                throw new VisualComponentNotRegisteredException(name);

            }

            // get ViewComponent constructor from the vire component name
            let viewComponentConstructor: CtorTyped<IViewComponent>;
            if (this.__components.hasOwnProperty(name.toUpperCase())) {
                viewComponentConstructor = this.__components[name.toUpperCase()];
            } else {
                viewComponentConstructor = ViewComponent;
            }

            // resolve construction dependencies
            let navigator: Navigation.INavigator = await this.__container.resolve<Navigation.INavigator>(Navigation.IINavigator);
            let router: Routing.IRouter = await this.__container.resolve<Routing.IRouter>(Routing.IIRouter);

            // get new unique id for the new component
            let componentViewId: number = this.__viewManager.getNewComponentId();

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                "Creating the view component instance: " +
                Ajs.Utils.getClassName(
                    viewComponentConstructor) + "[" + componentViewId + "]:" + id, this.__viewManager, parentComponent, state);

            // create view component and store its instance to the collection identified by id
            let viewComponent: IViewComponent;
            viewComponent = new viewComponentConstructor(
                navigator,
                router,
                this.__documentManager,
                this.__templateManager,
                this.__viewManager,
                this,
                id,
                componentViewId,
                parentComponent,
                visualComponent,
                state,
                parentComponentInitStateNotify
            );

            this.__componentInstances[componentViewId] = viewComponent;

            // resolve configuration dependencies (like modules)
            let dependencies: any[] = await this.__resolveComponentDependencies(viewComponent);

            // configure component with resolved dependencies
            await viewComponent.configure.apply(viewComponent, dependencies);

            // initialize constructed and configured component
            await viewComponent.initialize();

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

            return viewComponent;
        }

        /**
         * 
         * @param component
         */
        public removeComponentInstance(component: IViewComponent): void {
            delete (this.__componentInstances[component.componentViewId]);
        }

        // remove
        public getComponentConstructorByName(name: string): CtorTyped<IViewComponent> {
            if (this.__components.hasOwnProperty(name.toUpperCase())) {
                return this.__components[name.toUpperCase()];
            }
            return null;
        }
        public getComponentInstanceByComponentId(componentId: number): IViewComponent {
            if (this.__componentInstances.hasOwnProperty(componentId.toString())) {
                return this.__componentInstances[componentId];
            }
            return null;
        }

        /**
         * 
         * @param component
         */
        public getChildrenComponentInstances(component: IViewComponent): IViewComponent[] {
            let childrenInstances: IViewComponent[] = [];
            for (let key in this.__componentInstances) {
                if (this.__componentInstances.hasOwnProperty(key)) {
                    if (this.__componentInstances[key].ajs.parentComponent === component) {
                        childrenInstances.push(component);
                    }
                }
            }
            return childrenInstances;
        }

        /**
         * 
         * @param component
         * @param id
         * @param userKey
         */
        public getComponentInstances(component: typeof ViewComponent, id?: string, userKey?: string): IViewComponent[] {

            let viewComponentInstances: IViewComponent[] = [];

            let componentConstructorName: string = Ajs.Utils.getClassName(component);

            for (let key in this.__componentInstances) {
                if (this.__componentInstances.hasOwnProperty(key)) {
                    let constructorName: string = Ajs.Utils.getClassName(this.__componentInstances[key]);
                    if (constructorName === componentConstructorName) {
                        if (id) {
                            if (this.__componentInstances[key].ajs.id === id) {
                                if (userKey) {
                                    if (this.__componentInstances[key].hasOwnProperty("key")) {
                                        if (this.__componentInstances[key].ajs.key === userKey) {
                                            viewComponentInstances.push(this.__componentInstances[key]);
                                        }
                                    }
                                } else {
                                    viewComponentInstances.push(this.__componentInstances[key]);
                                }
                            }
                        } else {
                            viewComponentInstances.push(this.__componentInstances[key]);
                        }
                    }
                }
            }

            return viewComponentInstances;
        }

        /**
         * 
         * @param component
         * @param id
         * @param userKey
         */
        public getFirstComponentInstance<T extends IViewComponent>(
            component: typeof ViewComponent,
            id?: string, userKey?: string): T {

            let componentConstructorName: string = Ajs.Utils.getClassName(component);

            for (let key in this.__componentInstances) {
                if (this.__componentInstances.hasOwnProperty(key)) {
                    let constructorName: string = Ajs.Utils.getClassName(this.__componentInstances[key]);
                    if (constructorName === componentConstructorName) {
                        if (id) {
                            if (this.__componentInstances[key].ajs.id === id) {
                                if (userKey) {
                                    if (this.__componentInstances[key].hasOwnProperty("key")) {
                                        if (this.__componentInstances[key].ajs.key === userKey) {
                                            return <T>this.__componentInstances[key];
                                        }
                                    }
                                } else {
                                    return <T>this.__componentInstances[key];
                                }
                            }
                        } else {
                            return <T>this.__componentInstances[key];
                        }
                    }
                }
            }

            return null;
        }

        public async setRootViewComponent(name: string): Promise<void> {

            // at least Visual component must exist for given root component name
            let visualComponent: Templating.IVisualComponent;
            visualComponent = this.__templateManager.getVisualComponent(name);

            // throw error if it does not 
            if (visualComponent === null) {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                    "Visual component is not defined (probably the appropriate template is not loaded): " + name);
                throw new VisualComponentNotRegisteredException(name);
            }

            // destroy the previous root component (including all its children)
            if (this.__rootViewComponent !== null) {
                this.__rootViewComponent.destroy();
            }

            // prepare target for new VC
            this.__viewManager.cleanTargetDocument();

            // create VC and store root component locally
            this.__rootViewComponent = await this.createViewComponent(name, "rootViewComponent", null);

            // update view manager root component
            this.__viewManager.rootViewComponent = this.__rootViewComponent;

            // call onNavigate
            this.__navigationNotifier.notify(this);

            // render
            this.__viewManager.render(this.__rootViewComponent);
        }

        public onNavigate(): void {
            this.__navigationNotifier.notify(this);
        }

        /**
         * 
         * @param componentConstructor
         */
        private __registerComponent(componentConstructor: CtorTyped<IViewComponent>): void {
            if (componentConstructor instanceof Function) {

                let componentName: string = Utils.getClassName(componentConstructor).toUpperCase();

                if (this.__components[componentName] === undefined) {
                    this.__components[componentName] = componentConstructor;
                }

            }
        }

        /**
         * 
         * @param componentConstructor
         */
        private __isComponentConstructorRegistered(componentConstructor: CtorTyped<IViewComponent>): boolean {
            for (let key in this.__components) {
                if (this.__components[key] === componentConstructor) {
                    return true;
                }
            }

            return false;
        }

        private __addComponentDependencies<ConfigParams>(
            componentCtor: CtorTyped<IViewComponent>,
            ...dependencies: any[]): void {

            let deps: IViewComponentDependencies = this.__getComponentDependencies(componentCtor);

            if (deps === null) {
                this.__componentDependencies.push({
                    viewComponentCtor: componentCtor,
                    dependencies: dependencies[0]
                });
            } else {
                throw new ComponentDependenciesConfiguredAlreadyException();
            }

        }

        private __getComponentDependencies(componentCtor: CtorTyped<IViewComponent>): IViewComponentDependencies {
            for (let cd of this.__componentDependencies) {
                if (cd.viewComponentCtor === componentCtor) {
                    return cd;
                }
            }
            return null;
        }

        private async __resolveComponentDependencies(viewComponent: IViewComponent): Promise<any[]> {

            let proto: any = Object.getPrototypeOf(viewComponent);
            if (proto === null) {
                return [];
            }

            let ctor: CtorTyped<IViewComponent>;
            if (proto instanceof Function) {
                ctor = proto;
            } else {
                if (proto.constructor) {
                    ctor = proto.constructor;
                } else {
                    return [];
                }
            }

            let deps: IViewComponentDependencies = this.__getComponentDependencies(ctor);
            if (deps === null) {
                return [];
            }

            if (!("_onConfigure" in viewComponent)) {
                return [];
            }

            let params: any[] = [];

            if (deps.dependencies.length === 0) {
                return params;
            }

            let i: number = 0;
            for (let parameter of deps.dependencies) {

                let instance: any = await this.__container.resolve(parameter, false);
                if (instance !== null) {
                    params.push(instance);
                } else {
                    if (parameter && typeof parameter === "object" && parameter !== null && "__diService__" in parameter) {
                        throw new InvalidViewComponentConfigurationArgumentException(
                            "Component: '" + Utils.getClassName(viewComponent) + "', parameter index: '" + i+ "'");
                    }
                    params.push(parameter);
                }
                i++;
            }

            return params;
        }

    }

}
