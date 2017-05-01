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

    import IVisualComponent = Ajs.Templating.IVisualComponent;

    export interface IViewComponentProperties
        <State extends IViewComponentState, ParentViewComponent extends IParentViewComponent> {

        // --- dependencies
        router: Routing.IRouter;
        navigator: Navigation.INavigator;
        documentManager: Doc.IDocumentManager;
        templateManager: Templating.ITemplateManager;
        viewManager: MVVM.View.IViewManager;
        viewComponentManager: IViewComponentManager;

        // --- identification properties

        /** Stores the id of the component defined in the template */
        id: string;

        // initialization related properties

        stylesheetsApplied: boolean;
        initialized: boolean;

        // --- parent component and visual component instances

        parentComponent: ParentViewComponent;
        visualComponent: Ajs.Templating.IVisualComponent;
        templateElement: HTMLElement;

        // --- state related properties

        stateChangePrevented: boolean;
        stateKeys: string[];
        stateQueue: IStateChangeInfo[];
        processingStateQueue: boolean;
        stateChanged: boolean;

        // --- state transition properties

        hasVisualStateTransition: boolean;
        visualStateTransitionRunning: boolean;
        transitionOldElement: Element;
        transitionNewElement: Element;
        visualStateTransitionBeginHandler: ITransitionBeginHandler;

        // --- attribute processors
        attributeProcessors: IAttributeProcessorsCollection;

        /** Prepared for arrayed components but never initialized so hasOwnProperty must be used to check */
        key: string;


        stateToApply: any;
        parentComponentInitStateNotify: IViewComponent;
    }

    export class ViewComponent<State extends IViewComponentState, ParentViewComponent extends IParentViewComponent>
        implements Ajs.Doc.IComponent, IViewComponent, IViewComponentStateMethods, IParentViewComponent {

        /** Stores the unique instance ID of the component assigned by the view when the component is instantiated */
        protected _componentViewId: number;
        public get componentViewId(): number { return this._componentViewId; };

        // properties are defined like this to minimize displayed items by the intellisense in user view components
        public ajs: IViewComponentProperties<State, ParentViewComponent>;

        public constructor(
            navigator: Navigation.INavigator,
            router: Routing.IRouter,
            documentManager: Doc.IDocumentManager,
            templateManager: Templating.ITemplateManager,
            viewManager: View.IViewManager,
            viewComponentManager: IViewComponentManager,
            id: string,
            componentViewId: number,
            parentComponent: ParentViewComponent,
            visualComponent: Ajs.Templating.IVisualComponent,
            state?: State,
            parentComponentInitStateNotify?: IViewComponent) {

            // throw exception if the visual component was not assigned
            if (visualComponent === null) {
                throw new Ajs.MVVM.View.VisualComponentNotRegisteredException(null);
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Constructor, 0, "ajs.mvvm.viewmodel", this);

            // initialize properties
            this._componentViewId = componentViewId;

            this.ajs = {
                stylesheetsApplied: false,
                initialized: false,

                id: id,

                navigator: navigator,
                router: router,
                documentManager: documentManager,
                templateManager: templateManager,
                viewComponentManager: viewComponentManager,
                viewManager: viewManager,

                parentComponent: parentComponent,

                visualComponent: visualComponent,
                templateElement: visualComponent.component,

                stateToApply: state,
                parentComponentInitStateNotify: parentComponentInitStateNotify,

                key: null,
                stateChanged: false,
                stateKeys: [],
                stateChangePrevented: false,
                stateQueue: [],
                processingStateQueue: false,

                hasVisualStateTransition: false,
                visualStateTransitionRunning: false,
                visualStateTransitionBeginHandler: null,
                transitionNewElement: null,
                transitionOldElement: null,

                // setup tag attribute processors for the_processAttributes method
                attributeProcessors: {
                    __default: <IAttributeProcessor>this.__attrDefault,
                    component: <IAttributeProcessor>this.__attrComponent,
                    if: <IAttributeProcessor>this.__attrIf,
                    onclick: <IAttributeProcessor>this.__attrEventHandler,
                    onmousedown: <IAttributeProcessor>this.__attrEventHandler,
                    onmouseup: <IAttributeProcessor>this.__attrEventHandler,
                    onkeydown: <IAttributeProcessor>this.__attrEventHandler,
                    onkeyup: <IAttributeProcessor>this.__attrEventHandler,
                    onkeypress: <IAttributeProcessor>this.__attrEventHandler,
                    onchange: <IAttributeProcessor>this.__attrEventHandler,
                    oninput: <IAttributeProcessor>this.__attrEventHandler,

                    // non-standard tag events
                    ontouchmove_ajs: <IAttributeProcessor>this.__attrEventHandler,
                    onanimationend: <IAttributeProcessor>this.__attrEventHandler,
                    onstatetransitionbegin: <IAttributeProcessor>this.__attrTransitionBeginHanler
                }

            };


            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        public configure(...services: any[]): Promise<void> {
            return this._onConfigure.apply(this, services);
        }

        public async initialize(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            // apply passed or default state
            if (this.ajs.stateToApply && this.ajs.stateToApply !== null) {
                let newState: IViewComponentState = Ajs.Utils.DeepMerge.merge(this._onDefaultState(), this.ajs.stateToApply);
                Ajs.Utils.Obj.assign(this.ajs.stateToApply, newState);
                await this.__applyState({
                    component: this,
                    stateChangeRoot: this.ajs.parentComponentInitStateNotify,
                    state: this.ajs.stateToApply
                });
            } else {
                await this.__applyState({
                    component: this,
                    stateChangeRoot: this.ajs.parentComponentInitStateNotify || null,
                    state: this._onDefaultState()
                });
            }

            this.ajs.parentComponentInitStateNotify = undefined;
            this.ajs.stateToApply = undefined;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

            return this.__initialize();
        }

        public destroy(): Promise<void> {
            return this.__destroy();
        };

        public setState(state: State, stateChangeRootComponent: IViewComponent = null): Promise<void> {
            return this.__setState(state, stateChangeRootComponent);
        }

        public clearState(render: boolean): void {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            this.__clearState(render);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        public render(parentElement: HTMLElement, clearStateChangeOnly: boolean, attributes?: NamedNodeMap): HTMLElement {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            let element: HTMLElement = this.__render(parentElement, clearStateChangeOnly, attributes);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

            return element;
        }

        public ajsVisualStateTransitionBegin(newElement: Element): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            this._ajsVisualStateTransitionBegin(newElement);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        public insertChildComponent(
            viewComponentName: string,
            id: string,
            state: IViewComponentState,
            placeholder: string,
            index?: number): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            this.__insertChildComponent(
                viewComponentName,
                id,
                state,
                placeholder,
                index
            );

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        public removeChildComponent(placeholder: string, id: string): void {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            this.__removeChildComponent(placeholder, id);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        public set preventStateChange(value: boolean) {
            this._setPreventStateChange(value);
        }

        protected _onDefaultState(): State {
            return <any>{};
        }

        protected _onConfigure(...params: any[]): Promise<void> {
            return Promise.resolve();
        }

        protected _onInitialize(): Promise<void> {
            return Promise.resolve();
        }

        protected _onFinalize(): Promise<void> {
            return;
        }

        /**
         * This method can be overriden to filter the full state before it is applied
         * @param state
         */
        protected _filterState(state: State): IViewComponentFilteredState {
            return state;
        }

        /**
         * This method can be overriden to remap the state key or modify the state value
         * @param key name of the key
         * @param state state
         */
        protected _filterStateKey(key: string, value: any): IFilteredState {
            return {
                filterApplied: false,
                key: null,
                state: null
            };
        }

        /**
         * This method can be overriden to remap the array state key or modify the state value
         * @param state
         */
        protected _filterStateArrayItem(key: string, index: number, length: number, state: State): IFilteredState {
            return {
                filterApplied: false,
                key: null,
                state: null
            };
        }

        protected _setPreventStateChange(value: boolean): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                "Setting prevent state change to " + value +
                " (" + Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId + ")"
            );

            this.ajs.stateChangePrevented = value;
            let children: IViewComponent[] = <IViewComponent[]>this.ajs.viewComponentManager.getChildrenComponentInstances(this);
            for (let i: number = 0; i < children.length; i++) {
                children[i].preventStateChange = value;
            }

            if (!value) {
                this.__processStateQueue();
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        protected async _ajsVisualStateTransitionBegin(newElement: Element): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            if (this.ajs.visualStateTransitionRunning) {
                this._ajsVisualStateTransitionCancel();
            }

            this.ajs.visualStateTransitionRunning = true;

            this.ajs.transitionNewElement = newElement;

            if (typeof this.ajs.visualStateTransitionBeginHandler === "function") {
                let transitionType: ITransitionType = await this.ajs.visualStateTransitionBeginHandler.call(this);
                if (transitionType !== null) {
                    this.__ajsVisualStateTransitionStart(transitionType);
                } else {
                    this._ajsVisualStateTransitionEnd();
                }
            } else {
                this._ajsVisualStateTransitionEnd();
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        protected _ajsVisualStateTransitionCancel(): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            if (this.ajs.transitionNewElement) {
                this._ajsVisualStateTransitionEnd();
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        protected _ajsVisualStateTransitionEnd(): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            if (this.ajs.visualStateTransitionRunning &&
                this.ajs.transitionOldElement instanceof HTMLElement &&
                this.__childElementExists(this.ajs.transitionOldElement.parentElement, this.ajs.transitionOldElement)) {

                this.ajs.transitionOldElement.removeAttribute("statetransitiontypeold");
                this.ajs.transitionNewElement.removeAttribute("statetransitiontypenew");
            }

            this.ajs.documentManager.removeNode(this.ajs.transitionOldElement);

            this.ajs.transitionOldElement = null;
            this.ajs.transitionNewElement = null;

            this.ajs.visualStateTransitionRunning = false;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        private async __initialize(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            await this.__applyTemplateStylesheets();
            await this._onInitialize();
            this.ajs.stateChanged = true;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        private async __destroy(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            // remove all children components
            this.clearState(false);

            // finalize the component
            await this._onFinalize();

            // if the component was rendered, remove it from the DOM tree
            this.ajs.documentManager.removeNodeByUniqueId(this.componentViewId);

            // unregister component instance from ViewComponent manager
            this.ajs.viewComponentManager.removeComponentInstance(this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        private async __applyTemplateStylesheets(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            // apply style sheets from the view component template to the target document
            await
                this.ajs.documentManager.applyStyleSheetsFromTemplate(this.ajs.visualComponent.template);
            this.ajs.stylesheetsApplied = true;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        private async __setState(state: State, stateChangeRootComponent: IViewComponent): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                "Setting component state: " + Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId,
                state
            );

            if (this.ajs.visualStateTransitionRunning) {
                this._ajsVisualStateTransitionCancel();
            }

            this.ajs.stateQueue.push({
                component: this,
                stateChangeRoot: stateChangeRootComponent,
                state: state
            });

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

            return this.__processStateQueue();
        }

        /**
         * 
         */
        private async __processStateQueue(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            if (this.ajs.stateQueue.length === 0) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                return;
            }

            if (this.ajs.processingStateQueue) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, "ajs.mvvm.viewmodel", this,
                    "Processing state already running!");
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                return;
            }

            if (this.ajs.stateChangePrevented) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, "ajs.mvvm.viewmodel", this,
                    "State change is prevented: " +
                    Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId);
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                return;
            }

            this.ajs.processingStateQueue = true;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                "Processing state queue: " +
                Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId + ", " +
                this.ajs.stateQueue.length + " state changes queued",
                State
            );

            while (this.ajs.stateQueue.length > 0) {

                if (this.ajs.stateChangePrevented) {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, "ajs.mvvm.viewmodel", this,
                        "State change is prevented: " +
                        Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId);
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                    return;
                }

                let stateInfo: IStateChangeInfo = this.ajs.stateQueue.shift();

                Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.mvvm.viewmodel", this,
                    "Setting component state: " +
                    Ajs.Utils.getClassName(this) + ", id: " + this.ajs.id, ", viewId: " + this.componentViewId + ", " +
                    this.ajs.stateQueue.length + " state changes queued",
                    stateInfo.state
                );

                if (this.ajs.hasVisualStateTransition) {

                    let node: Doc.INode = this.ajs.documentManager.getTargetNodeByUniqueId(this.componentViewId);
                    this.ajs.transitionOldElement = <HTMLElement>node.cloneNode(true);
                }

                this.ajs.viewManager.stateChangeBegin(stateInfo);
                await this.__applyState(stateInfo);
                this.ajs.viewManager.stateChangeEnd(stateInfo);

            }

            this.ajs.processingStateQueue = false;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
        }

        /**
         * Removes all state properties and destroys children component tree
         * @param render
         */
        private __clearState(render: boolean): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            let schi: IStateChangeInfo = {
                component: this,
                stateChangeRoot: null,
                state: null
            };

            if (render) {
                this.ajs.viewManager.stateChangeBegin(schi);
            }

            while (this.ajs.stateKeys.length > 0) {
                if (this[this.ajs.stateKeys[0]] instanceof ViewComponent) {
                    (<IViewComponent>this[this.ajs.stateKeys[0]]).destroy();
                }
                if (this[this.ajs.stateKeys[0]] instanceof Array) {
                    for (let i: number = 0; i < this[this.ajs.stateKeys[0]].length; i++) {
                        if (this[this.ajs.stateKeys[0]][i] instanceof ViewComponent) {
                            (<IViewComponent>this[this.ajs.stateKeys[0]][i]).destroy();
                        }
                    }
                }
                delete (this[this.ajs.stateKeys[0]]);
                this.ajs.stateKeys.splice(0, 1);
            }

            if (render) {
                this.ajs.stateChanged = true;
                this.ajs.viewManager.stateChangeEnd(schi);
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        /**
         * Applies a state to the view component
         * <p>
         * State can contain a base type (string, number, boolean), children view component state object or Array of children view component
         * states.
         * Other object types, such as Date must be coverted as they can't be later applied directly to HTML and can't be converted by
         * the state manager itself.
         * </p>
         * <p>
         * If the state key matches the Id of the children Visual Component defined by the template and if the current view state
         * does not contain the appropriate property the ViewComponenManager is asked to find the related ViewComponent implementation.
         * If it is found it is instanced and state specified by the state key is applied to it. If it is not found the base ViewComponent
         * class is instanced and the state is applied to it. If the VC was created previously it is just asked to update its state.
         * </p>
         * <p>
         * For arrays it is neccessary to have a 'key' property defined in order to be possible to effectively update the state and later
         * the DOM structure.:
         * </p>
         * <p>
         * The correct mapping of the list of users state to userList to children user component:
         * <pre>{ users: [
         *    { key: 1, username: "bill", email: "bg@ms.com" },
         *    { key: 2, username: "steeve, email: "sj@ac.com" }
         * ]}</pre>
         * to the Visual components declared in the template:
         * <pre>   &lt;component name="userList"&gt;
         *      &lt;div component="user" id="users"&gt;&lt;span&gt;{username}&lt;/span&gt; &lt;span&gt;{email}&lt;/span&gt;&lt;/div&gt;
         *   &lt;/component&gt;
         * </pre>
         * Arrays are automatically recognized and converted to list of view components defined in the template identified by the
         * key name of the state which defines the array.
         * </p>
         * <p>
         * As children view components could be created automatically during the state application and dependecies of them are resolved
         * asynchronously (because i.e. models could load some data from server during the initialization pass) the whole state
         * application procedure is asynchronous.
         * </p>
         * @param state State object to be applied
         * @returns promise to be resolved once the state is applied or rejected when application of the state fails.
         */
        private async __applyState(stateChangeInfo: IStateChangeInfo): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            let state: State = <State>stateChangeInfo.state;

            if (state === undefined || state === null) {
                return;
            }

            // perform component level the state filtering 
            state = <any>this._filterState(state);

            // state can be fully rejected by returning null or undefined from the filter so check it here
            if (state === undefined || state === null) {
                return;
            }

            // apply the filtered state (all properties)
            for (let key in state) {

                // this is just safety check. it should never happen the state is inherited and
                // the property is defined somewhere in the prototype chain
                if (!state.hasOwnProperty(key)) {
                    continue;
                }

                // this is required as filter can change both, key and value of the current state property
                let filteredKey: string = key;

                // perform the state key/value filtering
                let filteredState: IFilteredState = this._filterStateKey(filteredKey, state[filteredKey]);

                // check if filter was applied
                if (filteredState.filterApplied) {

                    // check if the key was modified by the filter
                    if (filteredState.key !== key) {
                        // set new key name and delete old key state 
                        filteredKey = filteredState.key;
                        // delete previous state
                        delete state[key];
                    }

                    // apply new value to the old or new state identified by the key
                    state[filteredKey] = filteredState.state;
                }

                // if the state property exists in this ViewComponent, update it
                if (this.hasOwnProperty(filteredKey)) {

                    await this.__updateExistingStateKey(filteredKey, {
                        component: stateChangeInfo.component,
                        stateChangeRoot: stateChangeInfo.stateChangeRoot,
                        state: state
                    });

                // if the property does not exist, create it
                } else {

                    await this.__createNewStateKey(filteredKey, {
                        component: stateChangeInfo.component,
                        stateChangeRoot: stateChangeInfo.stateChangeRoot,
                        state: state
                    });

                }

            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

        }

        /**
         * 
         * @param key
         * @param state
         */
        private async __createNewStateKey(key: string, stateChangeInfo: IStateChangeInfo): Promise<void> {

            let state: State = <State>stateChangeInfo.state;

            // if the state is setting state of children component
            if (this.ajs.visualComponent.children.hasOwnProperty(key)) {

                // create array of components
                if (state[key] instanceof Array) {

                    await this.__createComponentsArray(key, stateChangeInfo);

                    // create a component and apply a state to it
                } else {
                    this[key] = await this.__createViewComponent(key, this.ajs.visualComponent.children[key], state[key]);
                    this.ajs.stateKeys.push(key);

                }

                return;

            }

            // if the state is array, try to filter the array and check if the state is applicable after array filtering
            let filteredStates: IFilteredState[] = [];
            if (state[key] instanceof Array) {
                for (let i: number = 0; i < state[key].length; i++) {
                    let filteredState: IFilteredState = this._filterStateArrayItem(key, i, state[key].length, state[key][i]);
                    if (filteredState.filterApplied) {
                        if (filteredState.key !== key) {
                            filteredStates.push(filteredState);
                        }
                    }
                }
            }

            // build a new filtered state
            if (filteredStates.length > 0) {

                let filteredState: IViewComponentState = {};
                for (let i: number = 0; i < filteredStates.length; i++) {
                    if (filteredState[filteredStates[i].key] === undefined) {
                        filteredState[filteredStates[i].key] = [];
                    }
                    if (filteredStates[i].state instanceof Array) {
                        for (let j: number = 0; j < (<IViewComponentState[]>filteredStates[i].state).length; j++) {
                            filteredState[filteredStates[i].key].push(filteredStates[i].state[j]);
                        }
                    } else {
                        filteredState[filteredStates[i].key].push(filteredStates[i].state);
                    }
                }

                // try to reapply the filtered state
                await this.__applyState(<any>filteredState);

                return;

            }

            this[key] = state[key];
            this.ajs.stateKeys.push(key);
            this.ajs.stateChanged = true;

            if (stateChangeInfo.stateChangeRoot !== null) {
                let c: IViewComponent = this;
                while (c !== stateChangeInfo.stateChangeRoot) {
                    c = c.ajs.parentComponent;
                    c.ajs.stateChanged = true;
                }
            }

        }

        /**
         * 
         * @param key
         * @param state
         */
        private async __createComponentsArray(key: string, stateChangeInfo: IStateChangeInfo): Promise<void> {

            let state: State = <State>stateChangeInfo.state;

            this.ajs.stateKeys.push(key);

            this[key] = [];

            for (let i: number = 0; i < state[key].length; i++) {

                //  filter array state

                let filteredState: IFilteredState = this._filterStateArrayItem(key, i, state[key].length, state[key][i]);

                // if the state was not filtered or filtering result is not another array just process the current array item

                if (!filteredState.filterApplied || !(filteredState.state instanceof Array)) {
                    let newViewComponent: IViewComponent;
                    newViewComponent = await this.__createViewComponent(
                        key,
                        this.ajs.visualComponent.children[key],
                        filteredState.filterApplied && filteredState.key === key ? filteredState.state : state[key][i]);
                    this[key][i] = newViewComponent;

                    continue;
                }

                // if the state was filtered and the result was another array it is neccessary to process the newly created array

                let j: number = 0;
                while (j < filteredState.state.length) {

                    let newViewComponent: IViewComponent;

                    newViewComponent = await this.__createViewComponent(
                        key,
                        this.ajs.visualComponent.children[key],
                        filteredState.state[j]
                    );

                    if (j === 0) {
                        this[key][i] = newViewComponent;
                        continue;
                    }

                    if (i < state[key].length - 1) {
                        this[key].splice(i + 1, 0, newViewComponent);
                    } else {
                        this[key].push(newViewComponent);
                    }

                    i++;
                    j++;

                }

            }
        }

        /**
         * 
         * @param key
         * @param state
         */
        private async __updateExistingStateKey(key: string, stateChangeInfo: IStateChangeInfo): Promise<void> {

            let state: State = <State>stateChangeInfo.state;

            // update children component state
            if (this[key] instanceof ViewComponent) {
                await (<IViewComponent>this[key]).setState(state[key],
                    stateChangeInfo.stateChangeRoot !== null ? stateChangeInfo.stateChangeRoot : this);
                return;
            }

            // set or update array of children components
            if (state[key] instanceof Array &&
                this.ajs.visualComponent.children.hasOwnProperty(key) &&
                this[key] instanceof Array) {

                await this.__updateArrayState(key, stateChangeInfo);
                return;
            }

            // update list of state keys
            if (this.ajs.stateKeys.indexOf(key) === -1) {
                this.ajs.stateKeys.push(key);
            }

            // update the existing state value
            if (this[key] !== state[key]) {
                this[key] = state[key];
                this.ajs.stateChanged = true;

                if (stateChangeInfo.stateChangeRoot !== null) {
                    let c: IViewComponent = this;
                    while (c !== stateChangeInfo.stateChangeRoot) {
                        c = c.ajs.parentComponent;
                        c.ajs.stateChanged = true;
                    }
                }

            }

        }

        /**
         * 
         * @param key
         * @param state
         */
        private async __updateArrayState(key: string, stateChangeInfo: IStateChangeInfo): Promise<void> {

            let state: State = <State>stateChangeInfo.state;

            // delete all components which does not exist in the array anymore

            let i: number = 0;

            while (i < this[key].length) {
                let del: boolean = true;

                // check if component still should exist
                for (let j: number = 0; j < state[key].length; j++) {
                    if (this[key][i].key === state[key][j].key) {
                        del = false;
                        break;
                    }
                }

                // if it still should exist continue with next component

                if (!del) {
                    i++;
                    continue;
                }

                // destory the component
                (<IViewComponent>this[key][i]).destroy();

                if (stateChangeInfo.stateChangeRoot !== null) {
                    let c: IViewComponent = this;
                    while (c !== stateChangeInfo.stateChangeRoot) {
                        c = c.ajs.parentComponent;
                        c.ajs.stateChanged = true;
                    }
                }

                this[key].splice(i, 1);

                if (this[key].length === 0) {
                    this.ajs.stateKeys.splice(this.ajs.stateKeys.indexOf(key), 1);
                }
            }

            // update the array and insert new components

            if (this.ajs.stateKeys.indexOf(key) === -1) {
                this.ajs.stateKeys.push(key);
            }

            for (i = 0; i < state[key].length; i++) {

                // update component state
                if (this[key].length > i && this[key][i].key === state[key][i].key) {
                    await (<IViewComponent>this[key][i]).setState(state[key][i],
                        stateChangeInfo.stateChangeRoot !== null ? stateChangeInfo.stateChangeRoot : this);
                    continue;
                }

                // create new component
                let newViewComponent: IViewComponent = await this.__createViewComponent(
                    key,
                    this.ajs.visualComponent.children[key],
                    state[key][i]
                );

                // replace old compnent with the new one (it was destoryed previously but reference still remains in the array)
                this[key].splice(i, 0, newViewComponent);
            }

        }

        /**
         * 
         * @param id
         * @param viewComponentInfo
         * @param state
         */
        private __createViewComponent(
            id: string,
            viewComponentInfo: Ajs.Templating.IVisualComponentChildInfo,
            state: IViewComponentState
        ): Promise<IViewComponent> {

            let name: string = viewComponentInfo.tagName;
            if (name === "COMPONENT" && viewComponentInfo.nameAttribute) {
                name = viewComponentInfo.nameAttribute;
            }

            return this.ajs.viewComponentManager.createViewComponent(name, id, this, state, this);
        }

        /**
         * render the ViewComponent to the target element (appenChild is used to add the element)
         * @param parentElement element to be used as a parent for the component
         * @param usingShadowDom information if the render is performed to the main DOM or shadow DOM
         * @param clearStateChangeOnly informs renderer that rendering should not be done, just state changed flag should be cleared
         */
        private __render(parentElement: HTMLElement, clearStateChangeOnly: boolean, attributes?: NamedNodeMap): HTMLElement {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.mvvm.viewmodel", this);

            let node: Node;

            // render the tree of the visual component related to the current view component
            node = this.__renderTree(this.ajs.visualComponent.component, parentElement, clearStateChangeOnly, attributes);

            // reset the dirty state after change
            this.ajs.stateChanged = false;

            // if the render was not called just because of reseting the state change flag
            // set view component data and return the view component
            if (clearStateChangeOnly) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                return null;
            }

            if (!(node instanceof HTMLElement)) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);
                return null;
            }

            let componentNode: Doc.INode = <Doc.INode>(<Node>node);
            componentNode.ajsData = componentNode.ajsData || <any>{};
            componentNode.ajsData.component = this;
            componentNode.ajsData.ownerComponent = this;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.mvvm.viewmodel", this);

            return node;
        }

        /**
         * 
         * @param sourceNode
         * @param targetNode
         * @param clearStateChangeOnly
         * @param attributes
         */
        private __renderTree(sourceNode: Node, targetNode: Node, clearStateChangeOnly: boolean, attributes?: NamedNodeMap): Node {

            let id: string = null;
            if (sourceNode.nodeType === Node.ELEMENT_NODE) {
                id = (<HTMLElement>sourceNode).getAttribute("id");
            }

            // if the tag has attribute id, check if it is component or array of components
            if (id !== null && this[id] !== undefined && (this[id] instanceof ViewComponent || this[id] instanceof Array)) {

                // if it is a view component, render it
                if (this[id] instanceof ViewComponent) {
                    (<IViewComponent>this[id]).render(<HTMLElement>targetNode, clearStateChangeOnly, sourceNode.attributes);
                } else {
                    // if it is an array
                    if (this[id] instanceof Array) {
                        // go through it and render all view components existing in the array
                        for (let i: number = 0; i < this[id].length; i++) {
                            if (this[id][i] instanceof ViewComponent) {
                                (<IViewComponent>this[id][i]).render(<HTMLElement>targetNode, clearStateChangeOnly, sourceNode.attributes);
                            }
                        }
                    }
                }

            } else {
                // add node to target document (according to rules in the template)
                let addedNode: Node;

                if (clearStateChangeOnly) {
                    addedNode = null;
                } else {
                    addedNode = this.__renderNode(sourceNode, targetNode, attributes);
                }

                // check if the node is root node of the view component and if the component and its
                // children components didn't change, just render it with skip flag and don't render
                // children tags

                let skip: boolean = sourceNode === this.ajs.visualComponent.component && !this.ajs.stateChanged;

                if (addedNode !== null && skip) {
                    (<Doc.INode>addedNode).ajsData = (<Doc.INode>addedNode).ajsData || <any>{};
                    (<Doc.INode>addedNode).ajsData.skipUpdate = true;
                }

                // if the node was added, go through all its children
                if (addedNode !== null && !skip) {
                    for (let i: number = 0; i < sourceNode.childNodes.length; i++) {
                        this.__renderTree(sourceNode.childNodes.item(i), addedNode, false);
                    }
                // otherwise, no children compnents in this children branch will be rendered but it is necessary to
                // clear the _stateChange property on them
                } else {
                    for (let i: number = 0; i < sourceNode.childNodes.length; i++) {
                        this.__renderTree(sourceNode.childNodes.item(i), null, true);
                    }
                }

                // return the added node - for the top level call it will be a root node of the view component
                return addedNode;
            }
        }

        /**
         * clone/adopt/process the node from the template and add it to the document
         * @param sourceNode node in the VisualComponent template
         * @param targetNode node in the targer document
         */
        private __renderNode(sourceNode: Node, targetNode: Node, attributes?: NamedNodeMap): Node {
            let clonedNode: Node = sourceNode.cloneNode(false);
            let adoptedNode: Node = targetNode.ownerDocument.adoptNode(clonedNode);

            if (attributes) {
                this.__mergeAttributes(adoptedNode, attributes);
            }

            let processedNode: Node = this.__processNode(adoptedNode);
            if (processedNode && processedNode !== null) {
                if (processedNode instanceof HTMLElement) {
                    (<Doc.INode>(<Node>processedNode)).ajsData = (<Doc.INode>(<Node>processedNode)).ajsData || <any>{};
                    (<Doc.INode>(<Node>processedNode)).ajsData.ownerComponent = this;
                }
                targetNode.appendChild(processedNode);
            }
            return processedNode;
        }

        /**
         * Merges attributes from source to adopted node
         * @param targetNode Adopted node to be populated with attributes collected from the component implementation node
         * @param attributes Attributes collected from the component implementation node
         */
        private __mergeAttributes(targetNode: Node, attributes?: NamedNodeMap): void {
            if (!(targetNode instanceof Element)) {
                return;
            }

            for (let i: number = 0; i < attributes.length; i++) {

                switch (attributes[i].nodeName.toLowerCase()) {
                    case "class":
                        if ((<Element>targetNode).hasAttribute("class")) {
                            if ((<Element>targetNode).getAttribute("class").indexOf(attributes[i].nodeValue) === -1) {
                                (<Element>targetNode).setAttribute(
                                    attributes[i].nodeName,
                                    (<Element>targetNode).getAttribute("class") + " " + attributes[i].nodeValue);
                            }
                        } else {
                            (<Element>targetNode).setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
                        }
                        break;
                    case "id":
                        break;
                    default:
                        (<Element>targetNode).setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
                        break;
                }
            }
        }

        /**
         * process the node - see _processText and _processElement methods bellow for detail
         * @param node The node in the template to be processed
         */
        private __processNode(node: Node): Node {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    return this.__processElement(<HTMLElement>node);
                case Node.TEXT_NODE:
                    return this.__processText(node);
                default:
                    return null;
            }
        }

        /**
         * replace all template {} tags with the state value from the ViewComponent appropriate property
         * @param node
         */
        private __processText(node: Node): Node {
            // extract all state property names from the template tag
            let props: string[] = node.nodeValue.match(/{(.*?)}/g);
            // and if any, locate them in state and replace the template text to state data
            if (props !== null) {
                // for all discovered state property names
                for (let i: number = 0; i < props.length; i++) {
                    // use only the name without {} characters
                    let propName: string = props[i].substring(1, props[i].length - 1);
                    // locate the property name in the view component and set the correct value to the text node
                    if (this[propName] !== undefined && this[propName] !== null) {
                        node.nodeValue = node.nodeValue.replace(props[i], this[propName]);
                    } else {
                        node.nodeValue = node.nodeValue.replace(props[i], "");
                    }
                }
            }
            // if there is HTML in the node, replace the node by the HTML
            if (node.nodeValue.substr(0, 8) === "#ASHTML:") {
                let asHtml: HTMLElement = document.createElement("ashtml");
                asHtml.innerHTML = node.nodeValue.substr(8);
                node = asHtml;

                // for asHtml nodes it is neccessary to find all a hrefs and process them as in case of normal processing
                let ahrefs: NodeListOf<HTMLAnchorElement> = asHtml.getElementsByTagName("a");
                for (let i: number = 0; i < ahrefs.length; i++) {
                    this.__processElement(ahrefs.item(i));
                }
            }

            return node;
        }

        private __linkMouseDown(e: MouseEvent): void {

            e.returnValue = this.ajs.navigator.linkClicked(e);
            if (!e.returnValue) {
                e.cancelBubble = true;
                e.preventDefault();
                e.stopPropagation();
            }

        }

        /**
         * process the template tag
         * @param element Template element to be processed
         */
        private __processElement(element: HTMLElement): HTMLElement {
            element = this.__processAttributes(element);

            if (element instanceof HTMLAnchorElement) {

                if (element.hasAttribute("href")) {

                    let href: string = element.getAttribute("href");
                    if (href.substr(0, 4) !== "http") {

                        let domEventListenerInfo: Doc.INodeEventListenerInfo = {
                            source: <Doc.INode>(<Node>this.ajs.templateElement),
                            eventType: "mousedown",
                            eventListener: (e: MouseEvent): void => { this.__linkMouseDown(e); }
                        };

                        let node: Doc.INode = <Doc.INode>(<Node>element);
                        node.ajsData = node.ajsData || <any>{};

                        if (!(node.ajsData.eventListeners instanceof Array)) {
                            node.ajsData.eventListeners = [];
                        }

                        node.ajsData.eventListeners.push(domEventListenerInfo);

                        domEventListenerInfo = {
                            source: <Doc.INode>(<Node>this.ajs.templateElement),
                            eventType: "click",
                            eventListener: (e: MouseEvent): void => {
                                e.returnValue = false;
                                e.cancelBubble = true;
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        };

                        node.ajsData.eventListeners.push(domEventListenerInfo);
                    }
                }
            }

            return element;
        }

        /**
         * process the template tag attributes
         * if the attribute processor returns false the element will be removed from further rendering
         * @param element
         */
        private __processAttributes(element: HTMLElement): HTMLElement {
            let toRemove: string[] = [];
            for (let i: number = 0; i < element.attributes.length; i++) {
                if (this.ajs.attributeProcessors[element.attributes[i].nodeName] !== undefined) {
                    if (!this.ajs.attributeProcessors[element.attributes[i].nodeName].call(this, toRemove, element.attributes[i])) {
                        return null;
                    }
                } else {
                    if (!this.ajs.attributeProcessors.__default.call(this, toRemove, element.attributes[i])) {
                        return null;
                    }
                }
            }

            for (let i: number = 0; i < toRemove.length; i++) {
                element.removeAttribute(toRemove[i]);
                if (element.hasOwnProperty(toRemove[i])) {
                    element[toRemove[i]] = null;
                }
            }
            return element;
        }

        private __attrComponent(toRemove: string[], attr: Attr): boolean {
            toRemove.push(attr.nodeName);
            return true;
        }

        private __attrIf(toRemove: string[], attr: Attr): boolean {

            let condition: string = attr.nodeValue;
            try {
                /* tslint:disable */
                if (!eval(condition)) {
                /* tslint:enable */
                    return false;
                }
            } catch (e) {
                throw new InvalidAttributeIfValueException(e);
            }
            toRemove.push(attr.nodeName);
            return true;
        }

        private __attrDefault(toRemove: string[], attr: Attr): boolean {
            let props: string[] = attr.nodeValue.match(/{(.*?)}/);
            if (props !== null) {
                let propName: string = props[1];
                if (this[propName] !== undefined && this[propName] !== null) {
                    attr.nodeValue = attr.nodeValue.replace(props[0], this[propName]);
                } else {
                    toRemove.push(attr.nodeName);
                }
            }
            return true;
        }

        private __attrEventHandler(toRemove: string[], attr: Attr): boolean {
            toRemove.push(attr.nodeName);
            if ((this[attr.nodeValue] !== undefined && typeof this[attr.nodeValue] === "function") ||
                (this["_" + attr.nodeValue] !== undefined && typeof this["_" + attr.nodeValue] === "function") ||
                (this["__" + attr.nodeValue] !== undefined && typeof this["__" + attr.nodeValue] === "function")) {

                let eventType: string = attr.nodeName.substring(2);

                if (eventType.indexOf("_ajs") !== -1) {
                    eventType = eventType.substr(0, eventType.indexOf("_ajs"));
                }

                let eventHandlerName: string = attr.nodeValue;
                if (!(this[attr.nodeValue] !== undefined && typeof this[attr.nodeValue] === "function")) {
                    if ((this["_" + attr.nodeValue] !== undefined && typeof this["_" + attr.nodeValue] === "function")) {
                        eventHandlerName = "_" + eventHandlerName;
                    } else {
                        eventHandlerName = "__" + eventHandlerName;
                    }
                }

                let listener: EventListener = (e: Event): void => {
                    this[eventHandlerName](e);
                };

                let domEventListenerInfo: Doc.INodeEventListenerInfo = {
                    source: <Doc.INode>(<Node>this.ajs.templateElement),
                    eventType: eventType,
                    eventListener: listener
                };

                let node: Doc.INode = <Doc.INode>(<Node>attr.ownerElement);
                node.ajsData = node.ajsData || <any>{};

                if (!(node.ajsData.eventListeners instanceof Array)) {

                    node.ajsData.eventListeners = [];
                }

                node.ajsData.eventListeners.push(domEventListenerInfo);
            }
            return true;
        }

        private __attrTransitionBeginHanler(toRemove: string[], attr: Attr): boolean {
            if (this[attr.nodeValue] !== undefined && typeof this[attr.nodeValue] === "function") {
                this.ajs.hasVisualStateTransition = true;
                this.ajs.visualStateTransitionBeginHandler = this[attr.nodeValue];
            }
            toRemove.push(attr.nodeName);
            return true;
        }

        private __insertChildComponent(
            viewComponentName: string,
            id: string,
            state: IViewComponentState,
            placeholder: string,
            index?: number): void {

            if (state === null) {
                state = {};
            }

            let visualComponent: IVisualComponent;
            visualComponent = this.ajs.templateManager.getVisualComponent(viewComponentName);

            if (visualComponent === null) {
                throw new Ajs.MVVM.View.VisualComponentNotRegisteredException(viewComponentName);
            }

            this.__visualComponentInsertChild(placeholder, viewComponentName, id, index);

            let thisState: State = <any>{};
            thisState[id] = state;

            this.setState(thisState, this);
        }

        private __removeChildComponent(placeholder: string, id: string): void {

            if (this.hasOwnProperty(id) && this[id] instanceof ViewComponent) {

                this.__visualComponentRemoveChild(placeholder, id);

                this[id]._destroy();
                delete this[id];
                let i: number = this.ajs.stateKeys.indexOf(id);
                if (i !== -1) {
                    this.ajs.stateKeys.splice(i, 1);
                }
            }
        }

        private __visualComponentInsertChild(placeholder: string, componentName: string, id: string, index?: number): void {

            if (this.ajs.visualComponent.placeholders.hasOwnProperty(placeholder)) {

                let ph: HTMLElement = this.ajs.visualComponent.placeholders[placeholder].placeholder;

                let vc: HTMLElement = ph.ownerDocument.createElement(componentName);
                vc.setAttribute("id", id);

                if (index !== undefined) {
                    // !!!!!!
                } else {
                    ph.appendChild(vc);
                }

                this.ajs.visualComponent.children[id] = {
                    tagName: componentName,
                    nameAttribute: null
                };
            }
        }

        private __visualComponentRemoveChild(placeholder: string, id: string): void {

            if (this.ajs.visualComponent.placeholders.hasOwnProperty(placeholder)) {

                let ph: HTMLElement = this.ajs.visualComponent.placeholders[placeholder].placeholder;
                let vc: HTMLElement = null;

                for (let i: number = 0; i < ph.childElementCount; i++) {
                    if (ph.children.item(i).hasAttribute("id") && ph.children.item(i).getAttribute("id") === id) {
                        vc = <HTMLElement>ph.children.item(i);
                        break;
                    }
                }

                if (vc !== null) {
                    ph.removeChild(vc);
                    delete this.ajs.visualComponent.children[id];
                }

            }
        }

        private __ajsVisualStateTransitionStart(transitionType: ITransitionType): void {

            if (this.ajs.transitionOldElement instanceof HTMLElement &&
                this.ajs.transitionNewElement instanceof HTMLElement) {

                this.ajs.transitionNewElement.parentElement.insertBefore(
                    this.ajs.transitionOldElement,
                    this.ajs.transitionNewElement
                );

                this.ajs.transitionOldElement.setAttribute("statetransitiontypeold", transitionType.oldComponent);
                this.ajs.transitionNewElement.setAttribute("statetransitiontypenew", transitionType.newComponent);

            }
        }

        private __childElementExists(parent: HTMLElement, child: HTMLElement): boolean {
            if (parent instanceof HTMLElement) {
                for (let i: number = 0; i < parent.childNodes.length; i++) {
                    if (parent.childNodes.item(i) === child) {
                        return true;
                    }
                }
            }
            return false;
        }

    }

}
