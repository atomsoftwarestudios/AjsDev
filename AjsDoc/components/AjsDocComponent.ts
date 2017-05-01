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

namespace AjsDoc.Components {

    "use strict";

    export interface IAjsDocComponentState extends Ajs.MVVM.ViewModel.IViewComponentState {
        ajsDocLayout?: IAjsDocLayoutComponentState;
    }

    export interface ICPAjsDocComponent {
        programModel: typeof Models.ProgramModel.IIProgramModel;
        contentModel: typeof Models.ContentModel.IIContentModel;
    }

    @Ajs.viewcomponent()
    export class AjsDocComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<IAjsDocComponentState, any>
        implements IAjsDocComponentState {

        /** Layout view component state */
        public ajsDocLayout: IAjsDocLayoutComponentState;

        /** Program tree parsed from the JSON file generated with the TypeDoc */
        private __progModel: Models.ProgramModel.IProgramModel;

        /** Content model */
        private __contentModel: Models.ContentModel.IContentModel;

        /** Listener to the browser navigation event */
        private __navigatedListener: Ajs.Events.IListener<Ajs.MVVM.ViewModel.IViewComponentManager>;

        /**
         * Sets the empty state to the whole layout
         */
        protected _onDefaultState(): IAjsDocComponentState {
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

        protected async _onConfigure(
            programModel: Models.ProgramModel.IProgramModel,
            contentModel: Models.ContentModel.IContentModel
        ): Promise<void> {

            this.__progModel = programModel;
            this.__contentModel = contentModel;
        }

        /**
         * Synchronous initialization of the view component
         * Subscribes to the navigation notifier
         */
        protected async _onInitialize(): Promise<void> {

            this.__navigatedListener = (sender: Ajs.MVVM.View.IViewManager): boolean => {
                this.__updateView();
                return true;
            };

            this.ajs.viewComponentManager.navigationNotifier.subscribe(this.__navigatedListener);

        }

        /**
         * Unsubscribe event listeners and frees models
         */
        protected async _onFinalize(): Promise<void> {
            this.ajs.viewComponentManager.navigationNotifier.unsubscribe(this.__navigatedListener);

            this.__progModel.release();
            this.__progModel = null;

            this.__contentModel.release();
            this.__contentModel = null;
        }

        /**
         * updates the view based on the navigation path
         * @param updateLayout Specifies if the full layout render should be performed at once or if separate components should be rendered
         */
        private async __updateView(): Promise<void> {

            let path: string;
            let routeInfo: Ajs.Routing.IRouteInfo = this.ajs.router.currentRoute;

            let menuState: IAjsDocMenuComponentState;
            let navBarItems: IAjsDocNavBarItemComponentState[];
            let articleState: IAjsDocArticleComponentState;

            if (routeInfo.base.substr(0, 3) === "ref") {

                // prog model requires the path without ref so strip it out

                if (routeInfo.base.substr(3, 1) === "/") {
                    path = routeInfo.base.substr(4);
                } else {
                    path = routeInfo.base.substr(3);
                }

                menuState = await this.__progModel.getMenu(path);
                navBarItems = await this.__progModel.getNavBar(path);
                articleState = await this.__progModel.getContent(path);

            } else {

                menuState = await this.__contentModel.getMenu(routeInfo.base);
                navBarItems = await this.__contentModel.getNavBar(routeInfo.base);
                articleState = await this.__contentModel.getContent(routeInfo.base);

                articleState = {
                    description: <string>articleState
                };

            }

            let navBarState: any = {
                items: navBarItems
            };

            await this.ajsDocLayout.ajsDocMenu.setState(menuState);
            await Ajs.Utils.nextTickAsync(10);

            await this.ajsDocLayout.ajsDocNavBar.setState(navBarState);
            await Ajs.Utils.nextTickAsync(10);

            this.ajsDocLayout.ajsDocArticle.clearState(false);
            await this.ajsDocLayout.ajsDocArticle.setState(articleState);
            await Ajs.Utils.nextTickAsync(10);
        }


    }


}

