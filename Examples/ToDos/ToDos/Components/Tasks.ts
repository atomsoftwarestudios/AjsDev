/* *************************************************************************
Copyright (c)Year, Company
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface ITasksState {
        tasks?: ToDos.Models.ITask[];
        taskDescription?: string;
        actionLabel?: string;
    }

    export class Tasks
        extends ajs.mvvm.viewmodel.ViewComponent/*<ITasksState, ITaskItemEventHandlers>*/
        implements ITasksState, ITaskItemEventHandlers {

        protected _tasksModel: ToDos.Models.Tasks;

        protected _currentItem: number;
        protected _descriptionValue: string;

        public tasks: ToDos.Models.ITask[];
        public taskDescription: string;
        public actionLabel: string;

        protected _defaultState(): ajs.mvvm.viewmodel.IViewStateSet {
            return {
                tasks: [],
                taskDescription: this._descriptionValue,
                actionLabel: "Add"
            };
        }

        protected _initialize(): void {
            this._tasksModel = <ToDos.Models.Tasks>ajs.Framework.modelManager.getModelInstance(ToDos.Models.Tasks);
            this._currentItem = -1;
            this._descriptionValue = "";
            this._update();
        }

        protected _finalize(): void {
            ajs.Framework.modelManager.freeModelInstance(ToDos.Models.Tasks);
            delete this._tasksModel;
        }

        public onTaskItemEdit(key: number): void {
            let task: ToDos.Models.ITask = this._tasksModel.getTaskByKey(key);
            this._currentItem = key;
            this._descriptionValue = task.description;
            this._update();
        }

        public onTaskItemDelete(key: number): void {
            this._tasksModel.deleteTask(key);
            this._currentItem = -1;
            this._descriptionValue = "";
            this._update();
        }

        public onTaskItemDoneChanged(key: number, state: boolean): void {
            this._tasksModel.taskDone(key, state);
            this._update();
        }

        protected _update(): void {
            this._tasksModel.getTasks()
                .then((data: ToDos.Models.ITask[]) => {

                    let actionLabel: string = this._currentItem === -1 ? "Add" : "Update";

                    this.setState({
                        tasks: data,
                        taskDescription: this._descriptionValue,
                        actionLabel: actionLabel
                    });
                })
                .catch((reason: ajs.Exception) => {
                    throw new ajs.Exception("Unable to get the model data", reason);
                });
        }

        public textChanged(e: Event): void {
            if (e.target instanceof HTMLInputElement) {
                let input: HTMLInputElement = e.target;
                this._descriptionValue = input.value;
                this.setState({
                    taskDescription: this._descriptionValue
                });
            }
        }

        public addUpdateTask(e: Event): void {
            if (this._descriptionValue !== "") {
                if (this._currentItem === -1) {
                    this._tasksModel.addTask(this._descriptionValue);
                } else {
                    this._tasksModel.updateTaskDescription(this._currentItem, this._descriptionValue);
                }
                this._currentItem = -1;
                this._descriptionValue = "";
                this._update();
            }
        }

        public submitOnEnter(e: KeyboardEvent): void {
            if (e.keyCode === 13) {
                this.addUpdateTask(e);
            }
        }

        public cancelUpdate(e: Event): void {
            this._currentItem = -1;
            this._descriptionValue = "";
            this._update();
        }


    }

    ajs.Framework.viewComponentManager.registerComponents(Tasks);

}