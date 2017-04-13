/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface ITaskItemComponentEvents extends ajs.mvvm.viewmodel.IParentViewComponent  {
        onTaskItemEdit: (key: number) => void;
        onTaskItemDelete: (key: number) => void;
        onTaskItemDoneChanged: (key: number, state: boolean) => void;
    }

    export interface ITaskItemComponentState extends ajs.mvvm.viewmodel.IViewComponentState {
        key?: number;
        done?: boolean;
        description?: string;
    }

    export class TaskItemComponent
        extends ajs.mvvm.viewmodel.ViewComponent<ITaskItemComponentState, ITaskItemComponentEvents>
        implements ITaskItemComponentState {

        public key: number;
        public done: boolean;
        public description: string;

        public editTask(e: Event): void {
            let key: number = ajs.utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemEdit(key);
        }

        public deleteTask(e: Event): void {
            let key: number = ajs.utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDelete(key);
        }

        public doneChanged(e: Event): void {
            let key: number = ajs.utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDoneChanged(key, (<HTMLInputElement>e.target).checked);
        }

    }

    ajs.Framework.viewComponentManager.registerComponents(TaskItemComponent);

}
