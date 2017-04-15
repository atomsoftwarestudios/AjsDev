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

    export class ViewComponentManager {

        /** Reference to the template manager */
        protected _templateManager: Templating.TemplateManager;
        /** Returns reference to the template manager used during the view construction */
        public get templateManager(): Templating.TemplateManager { return this._templateManager; }

        protected _components: IRegisteredViewComponentsDict;
        public get components(): IRegisteredViewComponentsDict { return this._components; }

        protected _componentInstances: IInstancedViewComponentsCollection;

        public constructor(templateManager: Templating.TemplateManager) {
            this._templateManager = templateManager;
            this._components = {};
            this._componentInstances = {};
        }

        public registerComponents(...componentConstructor: typeof ViewComponent[]): void {
            for (let i: number = 0; i < componentConstructor.length; i++) {
                if (componentConstructor[i] instanceof Function) {
                    this._registerComponent(componentConstructor[i]);
                }
            }
        }

        /**
         * @param name Name of registered view component to be created
         * @param id Id of the component (usually the id from the template)
         * @param view View to which the view component relates
         * @param parentComponent Parent view component
         * @param state Initial state to be set
         */
        public createViewComponent(
            name: string,
            id: string,
            view: View.View,
            parentComponent: IParentViewComponent,
            state?: IViewComponentState): ViewComponent<any, any> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            // get the visual component for the view component
            let visualComponent: Templating.IVisualComponent;
            visualComponent = this._templateManager.getVisualComponent(name);

            // throw error if it does not exist
            if (visualComponent === null) {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                    "Visual component is not defined (probably the appropriate template is not loaded): " + name);
                throw new VisualComponentNotRegisteredException(name);

            }

            // get ViewComponent constructor from the vire component name
            let viewComponentConstructor: typeof ViewComponent;
            if (this._components.hasOwnProperty(name.toUpperCase())) {
                viewComponentConstructor = this._components[name.toUpperCase()];
            } else {
                viewComponentConstructor = ViewComponent;
            }

            // get new unique id for the new component
            let componentViewId: number = view.getNewComponentId();

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                "Creating the view component instance: " +
                Ajs.Utils.getFunctionName(viewComponentConstructor) + "[" + componentViewId + "]:" + id, view, parentComponent, state);

            // create view component and store its instance to the collection identified by id
            let viewComponent: ViewComponent<any, any>;
            viewComponent = new viewComponentConstructor(view, this, id, componentViewId, parentComponent, visualComponent, state);
            this._componentInstances[componentViewId] = viewComponent;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            return viewComponent;
        }

        public removeComponentInstance(component: ViewComponent<any, any>): void {
            delete (this._componentInstances[component.componentViewId]);
        }

        // remove
        public getComponentConstructorByName(name: string): typeof ViewComponent {
            if (this._components.hasOwnProperty(name.toUpperCase())) {
                return this._components[name.toUpperCase()];
            }
            return null;
        }
        public getComponentInstanceByComponentId(componentId: number): ViewComponent<any, any> {
            if (this._componentInstances.hasOwnProperty(componentId.toString())) {
                return this._componentInstances[componentId];
            }
            return null;
        }

        protected _registerComponent(componentConstructor: typeof ViewComponent): void {
            if (componentConstructor instanceof Function) {
                let componentName: string = "";
                let parseName: string[] = /^function\s+([\w\$]+)\s*\(/.exec(componentConstructor.toString());
                componentName = parseName ? parseName[1] : "";
                componentName = componentName.toUpperCase();

                if (this._components[componentName] === undefined) {
                    this._components[componentName] = componentConstructor;
                }
            }
        }

        protected isComponentConstructorRegistered(componentConstructor: typeof ViewComponent): boolean {
            for (let key in this._components) {
                if (this._components[key] === componentConstructor) {
                    return true;
                }
            }

            return false;
        }

        public getChildrenComponentInstances(component: ViewComponent<any, any>): ViewComponent<any, any>[] {
            let childrenInstances: ViewComponent<any, any>[] = [];
            for (let key in this._componentInstances) {
                if (this._componentInstances.hasOwnProperty(key)) {
                    if (this._componentInstances[key].ajs.parentComponent === component) {
                        childrenInstances.push(component);
                    }
                }
            }
            return childrenInstances;
        }

        public getComponentInstance(component: typeof ViewComponent, id?: string, userKey?: string): ViewComponent<any, any>[] {

            let viewComponentInstances: ViewComponent<any, any>[] = [];

            let componentConstructorName: string = Ajs.Utils.getFunctionName(component);

            for (let key in this._componentInstances) {
                if (this._componentInstances.hasOwnProperty(key)) {
                    let constructorName: string = Ajs.Utils.getClassName(this._componentInstances[key]);
                    if (constructorName === componentConstructorName) {
                        if (id) {
                            if (this._componentInstances[key].ajs.id === id) {
                                if (userKey) {
                                    if (this._componentInstances[key].hasOwnProperty("key")) {
                                        if (this._componentInstances[key].ajs.key === userKey) {
                                            viewComponentInstances.push(this._componentInstances[key]);
                                        }
                                    }
                                } else {
                                    viewComponentInstances.push(this._componentInstances[key]);
                                }
                            }
                        } else {
                            viewComponentInstances.push(this._componentInstances[key]);
                        }
                    }
                }
            }

            return viewComponentInstances;
        }

        public getFirstComponentInstance<T extends ViewComponent<any, any>>(component: typeof ViewComponent, id?: string, userKey?: string): T {

            let componentConstructorName: string = Ajs.Utils.getFunctionName(component);

            for (let key in this._componentInstances) {
                if (this._componentInstances.hasOwnProperty(key)) {
                    let constructorName: string = Ajs.Utils.getClassName(this._componentInstances[key]);
                    if (constructorName === componentConstructorName) {
                        if (id) {
                            if (this._componentInstances[key].ajs.id === id) {
                                if (userKey) {
                                    if (this._componentInstances[key].hasOwnProperty("key")) {
                                        if (this._componentInstances[key].ajs.key === userKey) {
                                            return this._componentInstances[key] as T;
                                        }
                                    }
                                } else {
                                    return this._componentInstances[key] as T;
                                }
                            }
                        } else {
                            return this._componentInstances[key] as T;
                        }
                    }
                }
            }

            return null;
        }

    }

}
