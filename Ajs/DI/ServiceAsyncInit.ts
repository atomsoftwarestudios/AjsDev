/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace Ajs.DI {

    "use strict";

    export abstract class ServiceAsyncInit {

        /**
         * Stores promise resolvers to be executed when the service is initialized
         * For every call of init function the promise is created and its resolver is stored to this
         * array in order to be possible to notify all callers at the end of initialization and avoid
         * multiple initializations of the class instance
         */
        private __onInitializedPromiseResolvers: (() => void)[];

        /**
         * Stores promise rejectors to be executed when the service initialization fails
         * For every call of init function the promise is created and its rejector is stored to this
         * array in order to be possible to reject all callers at once and avoid multiple
         * initializations of the class instance
         */
        private __onInitializedPromiseRejectors: ((reason: any) => void)[];

        /**
         * Flag indicating the initialization has started and no other initialization calls are allowed
         * When this flag is set to true and #see [Initialize]{Ajs.DI.ServiceAsyncInit} is called
         * it immediately returns with the unresolved promise. The promise will be resolved when
         * the service initialization is done or rejected when it fails
         */
        private __initializing: boolean;

        /**
         * Flag indicating the service was initialized successfully
         */
        private __initialized: boolean;
        /**
         * Getter of the flag indicating the service was initialized successfully
         */
        public get initialized(): boolean { return this.__initialized; }

        /**
         * Constructs the asynchronously initializable service and initializes required internal properties
         */
        public constructor() {
            this.__initialized = false;
            this.__initializing = false;
            this.__onInitializedPromiseResolvers = [];
            this.__onInitializedPromiseRejectors = [];
        }

        /**
         * Initializes the service asynchronously
         * Returns the promise which will be resolved or rejected based on initialization
         * result. Internally calls the _onInitialize method which can be overriden by the
         * inherited class in order to perform the service intialization. Overriden method
         * is supposed to return the Promise and resove/reject it once the initialization
         * is done or fails.
         */
        public initialize(): Promise<void> {

            // if the service was already initialized, retur resolved promise immediately
            if (this.__initialized) {
                return Promise.resolve();
            }

            // prepare initialization promise to be resolved
            let initPromise: Promise<void> = new Promise<void>(
                (resolve: () => void, reject: (reason: any) => void) => {
                    this.__registerResolverRejector(resolve, reject);
            });

            // if initialization has started in different call just return prepared promise
            if (this.__initializing) {
                return initPromise;
            }

            // set flag informing the initialization started
            this.__initializing = true;

            // initialize service and perform appropriate action with init result
            this._onInitializeAsync()
                .then(() => {
                    this.__initDone();
                })
                .catch((reason: any) => {
                    this.__initFail(reason);
                });

            return initPromise;

        }

        /**
         * Performs the asynchronous service initialization
         */
        protected abstract async _onInitializeAsync(): Promise<void>;

        /**
         * Registers resolver and rejector to be called when service intialization is done or if it fails
         */
        private __registerResolverRejector(resolve: () => void, reject: (reason: any) => void): void {
            this.__onInitializedPromiseResolvers.push(resolve);
            this.__onInitializedPromiseRejectors.push(reject);
        }

        /**
         * Called when the service was successfully initialized to resolve all initialization promises 
         */
        private __initDone(): void {
            for (let resolver of this.__onInitializedPromiseResolvers) {
                resolver();
            }
            this.__onInitializedPromiseResolvers = [];
            this.__onInitializedPromiseRejectors = [];
        }

        /**
         * Called when the service fails to initialize to reject all initialization promises 
         */
        private __initFail(reason: any): void {
            for (let rejector of this.__onInitializedPromiseRejectors) {
                rejector(reason);
            }
            this.__onInitializedPromiseResolvers = [];
            this.__onInitializedPromiseRejectors = [];
        }

    }

}