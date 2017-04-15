﻿/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Components {

    "use strict";

    export interface ITasksState {
        tasks?: ToDos.Models.ITask[];
        taskDescription?: string;
        actionLabel?: string;
        filter?: "All" | "Done" | "Undone";
    }

    export class TasksComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<ITasksState, ITaskItemComponentEvents>
        implements ITasksState, ITaskItemComponentEvents {

        protected _tasksModel: ToDos.Models.TasksModel;

        protected _currentItem: number;

        protected _inputField: HTMLInputElement;
        public setInputField(value: HTMLInputElement): void { this._inputField = value; }

        public tasks: ToDos.Models.ITask[];
        public taskDescription: string;
        public actionLabel: string;
        public filter: "All" | "Done" | "Undone";

        protected _defaultState(): ITasksState {
            return({
                tasks: [],
                taskDescription: "",
                actionLabel: "Add",
                filter: "All"
            });
        }

        protected _initialize(): void {
            this._tasksModel = <ToDos.Models.TasksModel>Ajs.Framework.modelManager.getModelInstance(ToDos.Models.TasksModel);

            this._currentItem = -1;
            this._inputField = null;

            this._update(true);
        }

        protected _finalize(): void {
            Ajs.Framework.modelManager.freeModelInstance(ToDos.Models.TasksModel);
            delete this._tasksModel;
        }

        public onTaskItemEdit(key: number): void {
            let task: ToDos.Models.ITask = this._tasksModel.getTaskByKey(key);
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

        protected _update(focus: boolean): void {
            this._tasksModel.getTasks(this.filter)
                .then((data: ToDos.Models.ITask[]) => {

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

        public textChanged(e: Event): void {
            if (e.target instanceof HTMLInputElement) {
                let input: HTMLInputElement = e.target;
                this.setState({
                    taskDescription: input.value
                });
            }
        }

        public addUpdateTask(e: Event): void {
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

        public submitOnEnter(e: KeyboardEvent): void {
            if (e.keyCode === 13) {
                this.addUpdateTask(e);
            }
        }

        public cancelUpdate(e: Event): void {
            this._currentItem = -1;
            this.taskDescription = "";
            this._update(true);
        }

        public setFilter(e: Event): void {
            this.filter = <any>(<HTMLSelectElement>e.target).value;
            this._update(false);
        }

    }

    Ajs.Framework.viewComponentManager.registerComponents(TasksComponent);

}