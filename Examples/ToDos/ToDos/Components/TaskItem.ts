/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface IViewComponentEventHandlers extends ajs.mvvm.viewmodel.ViewComponent {
    }

    export interface IViewComponentState {
    }

    export interface IViewComponentEventHandler extends Function {
        (...params: any[]): void;
    }

    export interface IViewComponentEvents {
    }


    export interface ITaskItemEventHandlers extends IViewComponentEventHandlers  {
        onTaskItemEdit: (key: number) => void;
        onTaskItemDelete: (key: number) => void;
        onTaskItemDoneChanged: (key: number, state: boolean) => void;
    }

    export interface ITaskItem extends IViewComponentState {
        key?: number;
        done?: boolean;
        description?: string;
    }

    export class TaskItem
        extends ajs.mvvm.viewmodel.ViewComponent/*<ITaskItem, ITaskItemEventHandlers>*/
        implements ITaskItem {

        public key: number;
        public done: boolean;
        public description: string;

        protected _fireEvent(handler: IViewComponentEventHandler, ...params: any[]): void {
            let component: ajs.mvvm.viewmodel.ViewComponent = this.ajs.parentComponent;

            if (handler && handler !== undefined) {
                handler.apply(this.ajs.parentComponent, params);
            }
        }

        protected _getAttributeValueFromEventElement(e: Event, property: string): string {
            if (e.target instanceof HTMLElement) {
                if (e.target.hasAttribute(property)) {
                    return e.target.getAttribute(property);
                }
            }
            return null;
        }

        public editTask(e: Event): void {
            let keyStr: string = this._getAttributeValueFromEventElement(e, "key");
            if (keyStr !== null) {
                let key: number = parseInt(keyStr, 10);
                this._fireEvent((<ITaskItemEventHandlers>this.ajs.parentComponent).onTaskItemEdit, key);
            }
        }

        public deleteTask(e: Event): void {
            let keyStr: string = this._getAttributeValueFromEventElement(e, "key");
            if (keyStr !== null) {
                let key: number = parseInt(keyStr, 10);
                this._fireEvent((<ITaskItemEventHandlers>this.ajs.parentComponent).onTaskItemDelete, key);
            }
        }

        public doneChanged(e: Event): void {
            let keyStr: string = this._getAttributeValueFromEventElement(e, "key");
            if (keyStr !== null) {
                let key: number = parseInt(keyStr, 10);
                if (e.target instanceof HTMLInputElement && e.target.type.toLowerCase() === "checkbox") {
                    this._fireEvent((<ITaskItemEventHandlers>this.ajs.parentComponent).onTaskItemDoneChanged, key, e.target.checked);
                }
            }
        }

    }

    ajs.Framework.viewComponentManager.registerComponents(TaskItem);

}
