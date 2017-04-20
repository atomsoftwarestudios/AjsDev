/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    import ITask = DTO.ITask;
    import ITasksModel = Models.Tasks.ITasksModel;

    export interface ITasksState {
        tasks?: DTO.ITask[];
        taskDescription?: string;
        actionLabel?: string;
        filter?: "All" | "Done" | "Undone";
    }

    export interface ITaskComponent {
    }

    export interface ITaskComponentConfigParams {
        tasksModel: Models.Tasks.ITasksModel;
    }

    @Ajs.viewcomponent()
    export class TasksComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<ITasksState, ITaskItemComponentCommands>
        implements ITasksState, ITaskItemComponentCommands {

        protected _tasksModel: ITasksModel;

        protected _currentItem: number;

        protected _inputField: HTMLInputElement;
        public setInputField(value: HTMLInputElement): void { this._inputField = value; }

        public tasks: ITask[];
        public taskDescription: string;
        public actionLabel: string;
        public filter: "All" | "Done" | "Undone";

        public onTaskItemEdit(key: number): void {
            let task: ITask = this._tasksModel.getTaskByKey(key);
            this._currentItem = key;
            this.setState({
                taskDescription: task.description
            });
            this._update(true);
        }

        public onTaskItemDelete(key: number): void {
            this._tasksModel.deleteTask(key);
            this._currentItem = -1;
            this.setState({
                taskDescription: ""
            });
            this._update(false);
        }

        public onTaskItemDoneChanged(key: number, state: boolean): void {
            this._tasksModel.taskDone(key, state);
            this._update(false);
        }

        protected _onConfigure(tasksModel: ITasksModel) {

            this._tasksModel = tasksModel;
            this._tasksModel.initialize()
                .then(() => {
                    this._update(true)
                });

        }

        protected _onDefaultState(): ITasksState {
            return ({
                tasks: [],
                taskDescription: "",
                actionLabel: "Add",
                filter: "All"
            });
        }

        protected _onInitialize(): void {
            this._currentItem = -1;
            this._inputField = null;
        }

        protected _onFinalize(): void {
            this._tasksModel.release();
            this._tasksModel = null;
        }

        private _update(focus: boolean): void {
            this._tasksModel.getTasks(this.filter)
                .then((data: ITask[]) => {

                    let actionLabel: string = this._currentItem === -1 ? "Add" : "Update";

                    this.setState({
                        tasks: data,
                        actionLabel: actionLabel
                    });

                    if (focus && this._inputField !== null) {
                        this._inputField.focus();
                    }

                })
                .catch((reason: Ajs.Exception) => {
                    throw new Ajs.Exception("Unable to get the model data", reason);
                });
        }


        protected _textChanged(e: Event): void {
            if (e.target instanceof HTMLInputElement) {
                let input: HTMLInputElement = e.target;
                this.setState({
                    taskDescription: input.value
                });
            }
        }

        protected _addUpdateTask(e: Event): void {
            if (this.taskDescription !== "") {
                if (this._currentItem === -1) {
                    this._tasksModel.addTask(this.taskDescription);
                } else {
                    this._tasksModel.updateTaskDescription(this._currentItem, this.taskDescription);
                }
                this.setState({
                    taskDescription: ""
                });
                this._currentItem = -1;
                this._update(true);
            }
        }

        protected _submitOnEnter(e: KeyboardEvent): void {
            if (e.keyCode === 13) {
                this._addUpdateTask(e);
            }
        }

        protected _cancelUpdate(e: Event): void {
            this._currentItem = -1;
            this.taskDescription = "";
            this._update(true);
        }

        protected _setFilter(e: Event): void {
            this.filter = <any>(<HTMLSelectElement>e.target).value;
            this._update(false);
        }

    }

}