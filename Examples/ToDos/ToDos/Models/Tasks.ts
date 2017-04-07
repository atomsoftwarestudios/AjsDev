/* *************************************************************************
Copyright (c)Year, Company
**************************************************************************** */

namespace ToDos.Models {

    "use strict";

    export interface ITask {
        key: number;
        done: boolean;
        description: string;
    }

    export class DefaultModelNotInitializedException extends ajs.Exception { }

    export class Tasks extends ajs.mvvm.model.Model<ITask> {

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
            let promise: Promise<void> = new Promise<void>(
                (resolve: () => void, reject: (reason: ajs.Exception) => void) => {
                    resolve();
                }
            );

            // define actions for the promise returned by the data resolver
            promise

                // resolved -> module is initialized
                .then((): void => {
                    this._initialized = true;
                })

                // failed from whatever reason (i.e. server down)
                .catch((reason: ajs.Exception): void => {
                    throw new ajs.Exception("Unable to initialize default model", reason);
                });
        }

        protected _getTaskByKey(key: number): ITask {
            for (const task of this._tasks) {
                if (task.key === key) {
                    return task;
                }
            }
            return null;
        }

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
         */
        public getTasks(filter: string): Promise<ITask[]> {

            return new Promise<ITask[]>(
                (resolve: (data: ITask[]) => void, reject: (reason: ajs.Exception) => void) => {

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

        public getTaskByKey(key: number): ITask {
            return this._getTaskByKey(key);
        }

        public addTask(description: string): void {
            let task: ITask = {
                key: this._lastKey,
                done: false,
                description: description
            };
            this._tasks.push(task);
            this._lastKey++;
        }

        public deleteTask(key: number): void {
            let taskIndex: number = this._getTaskIndexByKey(key);
            if (taskIndex !== null) {
                this._tasks.splice(taskIndex, 1);
            }
        }

        public updateTaskDescription(key: number, description: string): void {
            let task: ITask = this._getTaskByKey(key);
            if (task !== null) {
                task.description = description;
            }
        }

        public taskDone(key: number, done: boolean): void {
            let task: ITask = this._getTaskByKey(key);
            if (task !== null) {
                task.done = done;
            }
        }

    }

}
