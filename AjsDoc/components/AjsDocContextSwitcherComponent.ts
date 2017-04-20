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

    const sessionStateGuidePath: string = "ajsDocGuidePath";
    const sessionStateReferencePath: string = "ajsDocReferencePath";

    export interface IAjsDocContextSwitcherState extends Ajs.MVVM.ViewModel.IViewComponentState {
        guides?: boolean;
        references: boolean;
    }

    export interface ICPAjsDocContextSwitcherComponent {
        stateManager: typeof Ajs.State.IIStateManager;
    }

    @Ajs.viewcomponent()
    export class AjsDocContextSwitcherComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<IAjsDocContextSwitcherState, any>
        implements IAjsDocContextSwitcherState {

        private __stateManager: Ajs.State.IStateManager;

        protected _lastGuidePath: string;
        protected _lastReferencePath: string;

        public guides: boolean;
        public references: boolean;

        protected _navigatedListener: Ajs.Events.IListener<Ajs.MVVM.View.ViewManager>;

        protected _onDefaultState(): IAjsDocContextSwitcherState {
            return this._prepareState();
        }

        protected _onConfigure(stateManager: Ajs.State.IStateManager): void {
            this.__stateManager = stateManager;
        }

        protected _onInitialize(): void {

            this._lastGuidePath = this.__stateManager.getSessionState(sessionStateGuidePath);
            if (this._lastGuidePath === null) {
                this._lastGuidePath = "";
            }

            this._lastReferencePath = this.__stateManager.getSessionState(sessionStateReferencePath);
            if (this._lastReferencePath === null) {
                this._lastReferencePath = "ref";
            }

            this._navigatedListener = (sender: Ajs.MVVM.View.ViewManager) => {
                this._navigated();
                return true;
            };

            this.ajs.viewManager.navigationNotifier.subscribe(this._navigatedListener);
        }

        protected _finalize(): void {
            this.ajs.viewManager.navigationNotifier.unsubscribe(this._navigatedListener);
        }

        protected _prepareState(): IAjsDocContextSwitcherState {
            let routeInfo: Ajs.Routing.IRouteInfo = this.ajs.router.currentRoute;

            if (routeInfo.base.substr(0, 4) === "ref/" || routeInfo.base === "ref") {
                this.__stateManager.setSessionState(sessionStateReferencePath, routeInfo.base);
                this._lastReferencePath = routeInfo.base;
                return {
                    guides: false,
                    references: true
                };
            } else {
                this.__stateManager.setSessionState(sessionStateGuidePath, routeInfo.base);
                this._lastGuidePath = routeInfo.base;
                return{
                    guides: true,
                    references: false
                };
            }
        }

        protected _navigated(): void {
            this.setState(this._prepareState());
        }

        public onGuidesClick(e: Event): void {
            if (this.references) {
                this.ajs.navigator.navigate(this._lastGuidePath !== "" ? "/" + this._lastGuidePath : "/");
            }
        }

        public onReferenceGuideClick(e: Event): void {
            if (this.guides) {
                this.ajs.navigator.navigate(this._lastReferencePath !== "" ? "/" + this._lastReferencePath : "/ref");
            }
        }

    }

}