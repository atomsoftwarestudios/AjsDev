/*! ************************************************************************
License
Copyright (c)Year, Company. All rights reserved.
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    import viewModel = Ajs.MVVM.ViewModel;

    export interface IClockComponentState extends viewModel.IViewComponentState {
        time?: string;
    }

    @Ajs.viewcomponent()
    export class ClockComponent extends viewModel.ViewComponent<IClockComponentState, any> {

        private __navigatedListener: Ajs.Events.IListener<any>;
        private __timer: number;

        public time: string;

        public get isTimeSet(): boolean {
            return this.time && this.time !== null;
        }

        protected async _onInitialize(): Promise<void> {

            this.__navigatedListener = (sender: any): boolean => {
                this.__navigated();
                return true;
            };

            this.ajs.viewComponentManager.navigationNotifier.subscribe(this.__navigatedListener);
        }

        protected async _onFinalize(): Promise<void> {

            this.ajs.viewComponentManager.navigationNotifier.unsubscribe(this.__navigatedListener);

            clearInterval(this.__timer);
        }

        private __navigated(): void {
            if (this.__timer === undefined) {
                this.__timer = setInterval(() => this.__update(), 200);
            }
        }

        private __update(): void {

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

}