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

///<reference path="../../Doc/DocumentManager.ts" />
///<reference path="../ViewModel/ViewComponentManager.ts" />

/**
 * View namespace is dedicated to view and its exceptions only
 */
namespace Ajs.MVVM.View {

    "use strict";

    /**
     * View class represents a view composed from the view components. It manages the tree of instanced view components to be displayed.
     * <p>
     * It is recommended to keep just one view for one render target (and basically, only one view for the whole HTML document) as
     * it the code is not designed to exchange the data between multiple views and also interferrences can occur during the style sheet
     * management if multiple views are trying to add / remove style sheets.
     * </p>
     * <p>
     * Automatically builds the view component tree based on the passed rootViewComponentName. It automatically instantiates the root
     * component which takes care of instantiating children view components. The initial state of the root component must be set in this
     * component as it is not possible to pass the default state from the View.
     * </p>
     * <p>
     * View also catches state changes occured in the children view components and initiates the ViewComponent tree rendering
     * to the shadow DOM it manages and performs the final DOM update (using the DocumentManager) at the end of the state change.
     * Rendering and the DOM update occurs only if the state of the "state change" root component or its children was really changed.
     * This is evaluated in the particular view component. If only one of children view components of the root state change components
     * was changed the whole state chane root view component will get rendered to the shadow DOM but only changed nodes are transferred
     * to the render target so the target DOM manipulation is minimized as much as possible.
     * </p>
     */
    export class ViewManager implements IViewManager {

        /** Reference to the document manager */
        private __documentManager: Doc.IDocumentManager;

        /**
         * Sets the name of the root view component and internally instantiates it and its tree.
         * Additionally, it destroys the previously assigned root component and its tree and performs necessary cleanup
         */

        /** Root view component currently in use */
        private __rootViewComponent: Ajs.MVVM.ViewModel.IViewComponent;
        public set rootViewComponent(value: Ajs.MVVM.ViewModel.IViewComponent) { this.__rootViewComponent = value; }

        /** Specifies the root component for the current state change. Component is then rendered (including its children) if neccessary. */
        private __stateChangeRootComponent: Ajs.MVVM.ViewModel.IViewComponent;

        /** Specifies all components which state has changed during the last root component state change */
        private __stateChangedComponents: Ajs.MVVM.ViewModel.IViewComponent[];

        /** Used for rendering of view components after the state change and applying the changes to the render target */
        private __shadowDom: Document;

        /** Notifies subcribers (usually view components) the rendering of the component is finished */
        private __renderDoneNotifier: Ajs.Events.Notifier<IViewManager>;
        public get renderDoneNotifier(): Ajs.Events.Notifier<IViewManager> { return this.__renderDoneNotifier; }

        /** Unique component ID generator -> increments by 1 every time it is asked for the new value */
        private __lastComponentId: number;
        /** Returns unique ID number each time it is asked for it. Currently, the view component
         *  is using this generator to assign view component unique identification, but this identification is not in use now
         */
        public getNewComponentId(): number { this.__lastComponentId++; return this.__lastComponentId; }

        /**
         * Constructs a view. This constructor is called from the ajs.Framework during initialization
         * <p>
         * View is supposed to be just one in the application. All the "view" functionality should be
         * in view components itself.
         * </p>
         * @param templateManager template manager must be instantiated before the view
         * @param viewComponentManager view component manager must be instantiated before the view
         */
        public constructor(
            documentManager?: Doc.IDocumentManager) {

            Ajs.Dbg.log(Dbg.LogType.Constructor, 0, "ajs.mvvm.view", this, "", documentManager);

            // instantiate notifiers
            this.__renderDoneNotifier = new Ajs.Events.Notifier<IViewManager>();

            // store the document manager
            this.__documentManager = documentManager;

            // basic initialization of the view
            this.__rootViewComponent = null;
            this.__stateChangeRootComponent = null;
            this.__stateChangedComponents = [];

            // prepare shadow DOM as a ViewComponent render target
            this.__shadowDom = document.implementation.createHTMLDocument("shadowDom");
            this.__shadowDom.body.innerHTML = "";

            this.__lastComponentId = 0;

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);
        }

        /**
         * Cleans the target document before the new root component is set (called from VCM)
         */
        public cleanTargetDocument(): void {
            // clean the target document (styles + render target)
            this.__documentManager.clean(this.__documentManager.renderTarget);
        }

        /**
         * Called from the view component when it is requested to set the new state
         * <p>
         * This information must be passed in order to be possible to recognize the
         * state change root in order to be possible to update just the correct DOM
         * tree.
         * </p>
         * @param viewComponent
         */
        public stateChangeBegin(viewComponent: Ajs.MVVM.ViewModel.ViewComponent<any, any>): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.mvvm.view", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.mvvm.view", this,
                "State change begun (" + Ajs.Utils.getClassName(viewComponent) + "), " +
                "id: " + viewComponent.ajs.id + ", viewId: " + viewComponent.componentViewId,
                viewComponent);

            // if there is no root assigned to the change, the passed component is the root of the change
            if (this.__stateChangeRootComponent === null) {

                Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.mvvm.view", this,
                    "The " + Ajs.Utils.getClassName(viewComponent) + ":" + viewComponent.ajs.id + " is root of the state change");

                this.__stateChangeRootComponent = viewComponent;

            } else {
                this.__stateChangedComponents.push(viewComponent);
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);
        }

        /**
         * Called from the view component when it finishes the state change
         * @param viewComponent
         */
        public stateChangeEnd(viewComponent: Ajs.MVVM.ViewModel.ViewComponent<any, any>): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.mvvm.view", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.mvvm.view", this,
                "State change end (" + Ajs.Utils.getClassName(viewComponent) + "), " +
                "id: " + viewComponent.ajs.id + ", viewId: " + viewComponent.componentViewId +
                ", state changed: " + viewComponent.ajs.stateChanged,
                viewComponent);

            if (this.__stateChangeRootComponent === viewComponent) {

                // render only if the root view component was rendered already
                // initial rendering of the root component is ensured from the _rootUpdated method
                if (this.__rootViewComponent !== null) {

                    // render the root change view component
                    let targetNewNode: Element = this.render(viewComponent);

                    // notify registered subscribers the rendering is over
                    this.__renderDoneNotifier.notify(this);

                    // begin the visual transition
                    for (let c of this.__stateChangedComponents) {
                        if (c.ajs.hasVisualStateTransition) {
                            c.ajsVisualStateTransitionBegin(
                                <any>this.__documentManager.getTargetNodeByUniqueId(c.componentViewId)
                            );
                        }
                    }

                }

                // finish the state change by clearing of the root component
                this.__stateChangeRootComponent = null;
                this.__stateChangedComponents = [];

            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);
        }

        /**
         * Called from the view component to inform all parents in the tree (up to state change root) the state of it has changed
         * <p>
         * This is necessary to inform the state change root component it has to render the tree of components the changed component
         * relates to. Basically, it will render all children but those trees roots which state was not changed will be marked with the
         * skip flag (and children not rendered at all) to inform DOM updater is is not necessary to update these nodes
         * </p>
         * @param viewComponent
         */
        public notifyParentsChildrenStateChange(parentViewComponent: Ajs.MVVM.ViewModel.IParentViewComponent): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.mvvm.view", this);

            let vc: Ajs.MVVM.ViewModel.ViewComponent<any, any> = <any>parentViewComponent;

            if (vc !== null && this.__stateChangeRootComponent !== null) {

                Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.mvvm.view", this,
                    "Notifying parents about the component change: " + vc.ajs.id + " " + vc.componentViewId);

                while (vc !== this.__stateChangeRootComponent.ajs.parentComponent && vc !== null) {
                    vc.ajs.stateChanged = true;
                    vc = vc.ajs.parentComponent;
                }
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);
        }

        /**
         * Renders a viewComponent to the view
         * @param viewComponent
         */
        public render(viewComponent: Ajs.MVVM.ViewModel.IViewComponent): Element {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.mvvm.view", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.mvvm.view", this,
                "Rendering component, id: " + viewComponent.ajs.id + ", viewId: " + viewComponent.componentViewId,
                viewComponent);

            // try to locate the target root - if null is returned this is complete new render
            let targetUpdateRoot: Node = this.__documentManager.getTargetNodeByUniqueId(viewComponent.componentViewId);

            // try to locate the template element in the target DOM
            // if it is there we are updating a DOM, otherwise render parent first
            if (targetUpdateRoot === null) {
                if (viewComponent.ajs.parentComponent === null) {
                    targetUpdateRoot = this.__documentManager.renderTarget;
                } else {
                    this.render(viewComponent.ajs.parentComponent);
                    return;
                }
            }

            // render the view component to shadow DOM
            let componentElement: HTMLElement = viewComponent.render(this.__shadowDom.body, false);

            // if the component was rendered to shadow DOM, update the target DOM
            if (componentElement !== null) {

                try {

                    // update target DOM from shadow DOM
                    this.__documentManager.updateDom(componentElement, targetUpdateRoot);

                } catch (e) {
                    this.__shadowDom.body.innerHTML = "";

                    Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                        "Error while updating the DOM!", e);

                    throw new Error(e);

                } finally {

                    // clean up the shadow DOM
                    this.__shadowDom.body.innerHTML = "";
                }

                // target root should be always element
                if (targetUpdateRoot instanceof Element) {

                    // we need to return root node of the component, not render target
                    if (targetUpdateRoot === this.__documentManager.renderTarget) {
                        targetUpdateRoot = this.__documentManager.getTargetNodeByUniqueId(viewComponent.componentViewId);
                    }

                    if (targetUpdateRoot !== null) {

                        Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);

                        return <Element>targetUpdateRoot;

                    } else {

                        Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                            "Something went wrong during the DOM update as the root element of the view component can't be located!");

                        throw new Error("Unrecoverable internal error. \
                            Something went wrong during the DOM update as the root element of the view component can't be located!");
                    }

                } else {

                    Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.mvvm.view", this,
                        "Root of the component must be always element!");

                    throw new Error("Unrecoverable internal error. Root of the component must be always element!");
                }

            } else {
                // here is some bullshit, who knows what is used to be for. If null is returned no change was made at all or error occured
                // lets test first

                // if it was not rendered it should be removed from the target
                /*if (targetUpdateRoot !== null) {
                    this._documentManager.removeNode(targetUpdateRoot);
                }*/
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.mvvm.view", this);

        }

    }

}
