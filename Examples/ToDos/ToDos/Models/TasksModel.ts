/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Models {

    "use strict";

    export interface ITask {
        key: number;
        done: boolean;
        description: string;
    }

    export class DefaultModelNotInitializedException extends Ajs.Exception { }

    export class TasksModel extends Ajs.MVVM.Model.Model<ITask> {

        /*
        Model members (such as data types) should be defined here
        */

        protected _lastKey: number;
        protected _tasks: ITask[];

        protected _initialize(): void {

            /*
            Model intialization code including async loading of the initial data from the server.
            Mnce the initialization of the model is done the this._initialized flag should be set to true
            */

            this._tasks = [{
                key: 0,
                done: false,
                description: "Test",
            }];
            this._lastKey = 1;
            this._loadDataAsync();

            /*
            if no async actions are required the the _initialized flag can be set to true at this place
            */

            // this._initialized = true;
        }

        protected _loadDataAsync(): void {

            // simulate async code by creating a promise which is resolved immediately
            // in a real application the request to server resource or data cache returning the 
            // promise with the appropriate data type can be here
            let dataResolverPromise: Promise<void> = new Promise<void>(
                (resolve: () => void, reject: (reason: Ajs.Exception) => void) => {
                    resolve();
                }
            );

            // define actions for the promise returned by the data resolver
            dataResolverPromise

                // resolved -> module is initialized
                .then((): void => {
                    this._initialized = true;
                })

                // failed from whatever reason (i.e. server down)
                .catch((reason: Ajs.Exception): void => {
                    throw new Ajs.Exception("Unable to initialize default model", reason);
                });

        }

        /**
         * Returns the task from the task list identified by key
         * @param key Key identifier of the task
         */
        protected _getTaskByKey(key: number): ITask {
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
        protected _getTaskIndexByKey(key: number): number {
            for (let i: number = 0; i < this._tasks.length; i++) {
                if (this._tasks[i].key === key) {
                    return i;
                }
            }
            return null;
        }

        /**
         * Returns the data processed by model to the view component (or another caller)
         * This example is for async data loadable from server but the model can also return the data instantly
         * It depends on what the ViewComponent expects but it is recommended to use async code all the time
         * in order to avoid possible problems during conversions of the code
         * @param filter Used to filter tasks returned by their state (possible values: All, Done, Undone)
         */
        public getTasks(filter: "All" | "Done" | "Undone"): Promise<ITask[]> {

            return new Promise<ITask[]>(
                (resolve: (data: ITask[]) => void, reject: (reason: Ajs.Exception) => void) => {

                    this._checkInitialized(
                        new DefaultModelNotInitializedException,
                        () => {
                            let filteredItems: ITask[] = [];

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
        public getTaskByKey(key: number): ITask {
            return this._getTaskByKey(key);
        }

        /**
         * Adds a new task to the taks list
         * @param description Description of the task
         */
        public addTask(description: string): void {
            let task: ITask = {
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
            let taskIndex: number = this._getTaskIndexByKey(key);
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
            let task: ITask = this._getTaskByKey(key);
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
            let task: ITask = this._getTaskByKey(key);
            if (task !== null) {
                task.done = done;
            }
        }

    }

}
