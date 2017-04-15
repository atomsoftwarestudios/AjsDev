/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface ITaskItemComponentEvents extends Ajs.MVVM.ViewModel.IParentViewComponent  {
        onTaskItemEdit: (key: number) => void;
        onTaskItemDelete: (key: number) => void;
        onTaskItemDoneChanged: (key: number, state: boolean) => void;
    }

    export interface ITaskItemComponentState extends Ajs.MVVM.ViewModel.IViewComponentState {
        key?: number;
        done?: boolean;
        description?: string;
    }

    export class TaskItemComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<ITaskItemComponentState, ITaskItemComponentEvents>
        implements ITaskItemComponentState {

        public key: number;
        public done: boolean;
        public description: string;

        public editTask(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemEdit(key);
        }

        public deleteTask(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDelete(key);
        }

        public doneChanged(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDoneChanged(key, (<HTMLInputElement>e.target).checked);
        }

    }

    Ajs.Framework.viewComponentManager.registerComponents(TaskItemComponent);

}
