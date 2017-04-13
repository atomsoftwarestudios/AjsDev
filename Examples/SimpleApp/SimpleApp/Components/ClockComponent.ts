/*! ************************************************************************
License
Copyright (c)Year, Company. All rights reserved.
**************************************************************************** */

namespace SimpleApp.Components {

    "use strict";

    import viewModel = ajs.mvvm.viewmodel;

    export interface IClockComponentState extends viewModel.IViewComponentState {
        time?: string;
    }

    export class ClockComponent extends viewModel.ViewComponent<IClockComponentState, any> {

        protected _navigatedListener: ajs.events.IListener<void>;
        protected _timer: number;

        public time: string;

        protected _initialize(): void {

            this._navigatedListener = (sender: any) => {
                this._navigated();
                return true;
            };

            this.ajs.view.navigationNotifier.subscribe(this._navigatedListener);
        }

        protected _finalize(): void {
            this.ajs.view.navigationNotifier.unsubscribe(this._navigatedListener);
            clearInterval(this._timer);
        }

        protected _navigated(): void {
            if (this._timer === undefined) {
                this._timer = setInterval(() => this._update(), 200);
            }
        }

        protected _update(): void {

            let d: Date = new Date();
            let t: string =
                ("0" + d.getDate()).slice(-2) + "-" +
                ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
                d.getFullYear() + " " +
                ("0" + d.getHours()).slice(-2) + ":" +
                ("0" + d.getMinutes()).slice(-2) + ":" +
                ("0" + d.getSeconds()).slice(-2) + ":" +
                d.getMilliseconds();

            this.setState({
                time: t
            });
        }

    }

    ajs.Framework.viewComponentManager.registerComponents(ClockComponent);

}