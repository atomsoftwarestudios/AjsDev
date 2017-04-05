/* *************************************************************************
Copyright (c)Year, Company
**************************************************************************** */

namespace simpleapp.models {

    "use strict";

    export interface IDefaultModelData {
        firstName: string;
        lastName: string;
    }

    export class DefaultModelNotInitializedException extends ajs.Exception { }

    export class Default extends ajs.mvvm.model.Model<IDefaultModelData> {

        /*
        Model members (such as data types) should be defined here
        */

        protected _people: IDefaultModelData[];

        protected _initialize(): void {

            /*
            Model intialization code including async loading of the initial data from the server.
            Mnce the initialization of the model is done the this._initialized flag should be set to true
            */

            this._people = [];
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

                    this._people.push({ firstName: "Bill", lastName: "Gates" });
                    this._people.push({ firstName: "Steave", lastName: "Jobs" });
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

        /**
         * Returns the data processed by model to the view component (or another caller)
         * This example is for async data loadable from server but the model can also return the data instantly
         * It depends on what the ViewComponent expects but it is recommended to use async code all the time
         * in order to avoid possible problems during conversions of the code
         */
        public getData(): Promise<IDefaultModelData[]> {

            return new Promise<IDefaultModelData[]>(
                (resolve: (data: IDefaultModelData[]) => void, reject: (reason: ajs.Exception) => void) => {

                    this._checkInitialized(
                        new DefaultModelNotInitializedException,
                        () => {
                            resolve(this._people);
                        }
                    );

                }
            );

        }

    }

}
