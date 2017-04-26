/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Models.Tasks {

    "use strict";

    export class TasksModel extends Ajs.MVVM.Model.Model implements ITasksModel {

        /*
        Model members (such as service dependancies, data members, whatever) are defined here
        */

        private _lastKey: number;
        protected _tasks: DTO.ITask[];

        /**
         * Returns the data processed by model to the view component (or another caller)
         * This example is for async data loadable from server but the model can also return the data instantly
         * It depends on what the ViewComponent expects but it is recommended to use async code all the time
         * in order to avoid possible problems during conversions of the code
         * @param filter Used to filter tasks returned by their state (possible values: All, Done, Undone)
         */
        public getTasks(filter: "All" | "Done" | "Undone"): Promise<DTO.ITask[]> {

            return new Promise<DTO.ITask[]>(
                (resolve: (data: DTO.ITask[]) => void, reject: (reason: Ajs.Exception) => void) => {

                    this._checkInitialized(
                        new TasksModelNotInitializedException,
                        () => {
                            let filteredItems: DTO.ITask[] = [];

                            for (let task of this._tasks) {
                                if (filter === "All" ||
                                    (filter === "Done" && task.done) ||
                                    (filter === "Undone" && !task.done)) {
                                    filteredItems.push(task);
                                }
                            }

                            resolve(filteredItems);
                        }
                    );

                }
            );

        }

        /**
         * Returns a task identified by the key from the task list
         * @param key Key of the task to be returned
         */
        public getTaskByKey(key: number): DTO.ITask {
            return this.__getTaskByKey(key);
        }

        /**
         * Adds a new task to the taks list
         * @param description Description of the task
         */
        public addTask(description: string): void {
            let task: DTO.ITask = {
                key: this._lastKey,
                done: false,
                description: description
            };
            this._tasks.push(task);
            this._lastKey++;
        }

        /**
         * Deletes a task identified by the key from the task list
         * @param key Key of the task to be deleted
         */
        public deleteTask(key: number): void {
            let taskIndex: number = this.__getTaskIndexByKey(key);
            if (taskIndex !== null) {
                this._tasks.splice(taskIndex, 1);
            }
        }

        /**
         * Updates a task description
         * @param key Key of the task to be updated
         * @param description New description of the task
         */
        public updateTaskDescription(key: number, description: string): void {
            let task: DTO.ITask = this.__getTaskByKey(key);
            if (task !== null) {
                task.description = description;
            }
        }

        /**
         * Sets or unsets the Done flag of the task
         * @param key Key of the task which done flag should be set
         * @param done The value to be set (done = true, undone = false)
         */
        public taskDone(key: number, done: boolean): void {
            let task: DTO.ITask = this.__getTaskByKey(key);
            if (task !== null) {
                task.done = done;
            }
        }

        /**
         * Called from the view model (view component) to initialize the model
         * The mechanism to prevent multiple model initialization is implemented internally
         */
        protected _onInitialize(): Promise<any> {

            /*
            Model intialization code including async loading of the initial data from the server.
            Once the initialization of the model is done the promise must be resolved
            */

            this._tasks = [{
                key: 0,
                done: false,
                description: "Test",
            }];
            this._lastKey = 1;

            return this.__loadDataAsync();

            /*
            if no async actions are required the fullfiled promise can be returned
            */

            // return Promise.resolve();
        }

        // async code returning a promise which is resolved immediately
        // in a real application the request to server resource or data cache will be returning the 
        // promise with the appropriate data
        private __loadDataAsync(): Promise<any> {

            return new Promise<void>(
                (resolve: () => void, reject: (reason: Ajs.Exception) => void) => {
                    try {
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }
            );

        }

        /**
         * Returns the task from the task list identified by key
         * @param key Key identifier of the task
         */
        private __getTaskByKey(key: number): DTO.ITask {
            for (const task of this._tasks) {
                if (task.key === key) {
                    return task;
                }
            }
            return null;
        }

        /**
         * Returns the index of the task identified by the key from the task list
         * @param key Key to be serched for
         */
        private __getTaskIndexByKey(key: number): number {
            for (let i: number = 0; i < this._tasks.length; i++) {
                if (this._tasks[i].key === key) {
                    return i;
                }
            }
            return null;
        }

    }

}
