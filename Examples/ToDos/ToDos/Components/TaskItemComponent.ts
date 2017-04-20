/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface ITaskItemComponentCommands extends Ajs.MVVM.ViewModel.IParentViewComponent  {
        onTaskItemEdit: (key: number) => void;
        onTaskItemDelete: (key: number) => void;
        onTaskItemDoneChanged: (key: number, state: boolean) => void;
    }

    export interface ITaskItemComponentState extends Ajs.MVVM.ViewModel.IViewComponentState {
        key?: number;
        done?: boolean;
        description?: string;
    }

    @Ajs.viewcomponent()
    export class TaskItemComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<ITaskItemComponentState, ITaskItemComponentCommands>
        implements ITaskItemComponentState {

        public key: number;
        public done: boolean;
        public description: string;

        protected _editTask(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemEdit(key);
        }

        protected _deleteTask(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDelete(key);
        }

        protected _doneChanged(e: Event): void {
            let key: number = Ajs.Utils.getDomEventTargetOwnerComponent<TaskItemComponent>(e.target).key;
            this.ajs.parentComponent.onTaskItemDoneChanged(key, (<HTMLInputElement>e.target).checked);
        }

    }

}
