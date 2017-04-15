/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

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

namespace AjsDoc {

    "use strict";

    export interface IAjsDocComponentState extends Ajs.MVVM.ViewModel.IViewComponentState {
        ajsDocLayout?: IAjsDocLayoutComponentState;
    }

    export class AjsDocComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<IAjsDocComponentState, any>
        implements IAjsDocComponentState {

        /** Layout view component state */
        public ajsDocLayout: IAjsDocLayoutComponentState;

        /** Program tree parsed from the JSON file generated with the TypeDoc */
        protected _progModel: ProgramModel;

        /** Content model */
        protected _contentModel: ContentModel;

        /** Listener to the browser navigation event */
        protected _navigatedListener: Ajs.Events.IListener<void>;

        /** Program data ready listener */
        protected _programDataReady: Ajs.Events.IListener<IProgramDataReadyData>;

        /** Content data ready listener */
        protected _contentDataReady: Ajs.Events.IListener<IContentDataReadyData>;


        protected _defaultState(): IAjsDocComponentState {
            return {
                ajsDocLayout: {
                    ajsDocLayoutMenuButton: {},
                    ajsDocHeader: {},
                    ajsDocContextSwitcher: {},
                    ajsDocMenu: {},
                    ajsDocNavBar: {},
                    ajsDocArticle: {},
                    ajsDocFooter: {}
                }
            };
        }

        /**
         * Synchronous initialization of the view component
         * Subscribes to the navigation notifier, inititalizes the view component and
         * initiates loading of resources. Once resources are loaded the _initAsync
         * method is called to finish the initialization and perform initial state
         * set call
         */
        protected _initialize(): void {

            // create models
            this._progModel = Ajs.Framework.modelManager.getModelInstance<IProgramDataReadyData>(ProgramModel) as ProgramModel;
            this._contentModel = Ajs.Framework.modelManager.getModelInstance<IContentDataReadyData>(ContentModel) as ContentModel;

            // subscribe to program model data ready notifier
            this._programDataReady = (sender: ProgramModel, data: IProgramDataReadyData) => {
                this._processProgramData(data);
                return true;
            };
            this._progModel.dataReadyNotifier.subscribe(this._programDataReady);

            // subscribe to content model data ready notifier
            this._contentDataReady = (sender: ContentModel, data: IContentDataReadyData) => {
                this._processContentData(data);
                return true;
            };
            this._contentModel.dataReadyNotifier.subscribe(this._contentDataReady);

            // subscribe to _navigated event
            this._navigatedListener = (sender: Ajs.MVVM.ViewModel.ViewComponent<any, any>) => {
                this._navigated();
                return true;
            };
            this.ajs.view.navigationNotifier.subscribe(this._navigatedListener);
        }

        /**
         * Unsubscribe event listeners and frees models
         */
        protected _finalize(): void {
            this.ajs.view.navigationNotifier.unsubscribe(this._navigatedListener);
            this._progModel.dataReadyNotifier.unsubscribe(this._programDataReady);
            this._contentModel.dataReadyNotifier.unsubscribe(this._contentDataReady);
            Ajs.Framework.modelManager.freeModelInstance(ProgramModel);
            Ajs.Framework.modelManager.freeModelInstance(ContentModel);
        }

        /**
         * Executed when the browser navigation occurs
         * This method is called from the notifier registered in the _initialize method
         */
        protected _navigated(): void {
            this._updateView();
        }

        /**
         * updates the view based on the navigation path
         * @param updateLayout Specifies if the full layout render should be performed at once or if separate components should be rendered
         */
        protected _updateView(): void {

            let path: string;
            let routeInfo: Ajs.Routing.IRouteInfo = Ajs.Framework.router.currentRoute;

            if (routeInfo.base.substr(0, 3) === "ref") {

                if (routeInfo.base.substr(3, 1) === "/") {
                    path = routeInfo.base.substr(4);
                } else {
                    path = routeInfo.base.substr(3);
                }

                this._progModel.getMenu(path);
                this._progModel.getNavBar(path);
                this._progModel.getContent(path);
            } else {
                this._contentModel.getMenu(routeInfo.base);
                this._contentModel.getNavBar(routeInfo.base);
                this._contentModel.getContent(routeInfo.base);
            }

        }

        /**
         * Called when the ProgramModel asynchronously prepares the state to be set
         * @param data State to be set. Can be a menuState, navBarState or a contentState
         */
        protected _processProgramData(data: IProgramDataReadyData): void {

            if (data.menuState) {
                this.ajsDocLayout.ajsDocMenu.setState(data.menuState);
            }

            if (data.navBarState) {
                let navBarState: any = {
                    items: data.navBarState
                };
                this.ajsDocLayout.ajsDocNavBar.setState(navBarState);
            }

            if (data.articleState) {
                this.ajsDocLayout.ajsDocArticle.clearState(false);
                this.ajsDocLayout.ajsDocArticle.setState(data.articleState);
            }

        }

        /**
         * Called when the ContentModel asynchronously prepares the state to be set
         * @param data State to be set. Can be a menuState or a contentState
         */
        protected _processContentData(data: IContentDataReadyData): void {

            if (data.menuState) {
                this.ajsDocLayout.ajsDocMenu.setState(data.menuState);
            }

            if (data.navBarState) {
                let navBarState: any = {
                    items: data.navBarState
                };
                this.ajsDocLayout.ajsDocNavBar.setState(navBarState);
            }

            if (data.articleState) {
                this.ajsDocLayout.ajsDocArticle.clearState(false);
                this.ajsDocLayout.ajsDocArticle.setState(data.articleState);
            }

        }

    }

    /** Register the component to ViewComponentManager */
    Ajs.Framework.viewComponentManager.registerComponents(AjsDocComponent);


}

