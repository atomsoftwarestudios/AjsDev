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

namespace Ajs.AjsIndexedDb {

    "use strict";

    export interface ICPAjsIndexedDb {
        dbName: string;
    }

    /**
     * AjsIndexedDB is used for internal purposes of AJs Framework.
     * <p>It is not supposed to be used by the application.</p>
     * <p>
     * Ajs IndexedDB is asynchronous Promise wrapper of IndexedDB implementing only
     * functionalities require by the Ajs Framework. Currently, it provides
     * functionality of creating a store, configuring it and simple methods to
     * manipulate values it stores.
     * </p>
     */
    export class AjsIndexedDb implements IAjsIndexedDb {

        /** Stores promises to be resolved once the service is initialized */
        private __onInitializedPromiseResolvers: (() => void)[];
        private __onInitializedPromiseRejectors: ((reason: any) => void)[];

        /** Stores information if the service was initialized already */
        private __initializing: boolean;
        private __initialized: boolean;

        /** Stores the name of the database */
        private __dbName: string;

        /** Reference to the database object */
        private __db: IDBDatabase;

        /**
         * Constructs Ajs Wrapper service for the IndexedDb stroage
         * @param dbName Name of the DB to be openned / created later during the init phase
         */
        constructor(dbName: string) {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Constructor, 0, LOG_IDB, this);

            this.__onInitializedPromiseResolvers = [];
            this.__onInitializedPromiseRejectors = [];

            this.__initializing = false;
            this.__initialized = false;
            this.__dbName = dbName;
            this.__db = null;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
        }

        /**
         * Initializes the IdexedDB service
         * <p>If the service was initialized already it resolves immediately.</p>
         * <p>If initialization is already in progress, resolves once the first initiated initialization request is done</p>
         * <p>DB object is stored internally only and is not published to service consumers.</p>
         */
        public initialize(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

            if (!window.indexedDB) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_SUPPORTED);
                return Promise.reject(new IndexedDBNotSupportedException());
            }

            if (this.__initialized) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                return Promise.resolve();
            }

            let initPromise = new Promise<void>(
                (resolve: () => void, reject: (rason: any) => void) => {
                    this.__onInitializedPromiseResolvers.push(resolve);
                    this.__onInitializedPromiseRejectors.push(reject);
                }
            );

            if (this.__initializing) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                return initPromise;
            }

            this.__initializing = true;
            this.__db = null;

            this.__openDb()
                .then((): void => {
                    this.__initializing = false;
                    this.__initialized = true;

                    for (let resolver of this.__onInitializedPromiseResolvers) {
                        resolver();
                    }

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                })
                .catch((reason: any): void => {
                    this.__initializing = false;
                    this.__initialized = false;

                    let fail: InitializationFailedException = new InitializationFailedException(reason);

                    for (let rejector of this.__onInitializedPromiseRejectors) {
                        rejector(fail);
                    }

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_INIT_FAILED, reason);
                });

            return initPromise;
        }

        /**
         * Prepares a store and calls the requestCb function to perform acions with the openned store
         * @param name Name of the store to be opened
         * @param mode Mode of the store depending on actions to be prfromed (readonly/readwrite)
         * @param requestCb Callback function containing actions to be performed on the store
         */
        public doStoreRequest(
            name: string,
            mode: "readonly" | "readwrite" = "readwrite",
            requestCb: (store: IDBObjectStore) => IDBRequest
        ): Promise<any> {

            return new Promise<any>(

                (resolve: (result: any) => void, reject: (reason: any) => void) => {

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_GETTING_STORE + name + ", ", mode);

                    if (!this.__initialized || this.__db === null) {
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_INITIALIZED);
                        reject(new IndexedDbNotInitializedException());
                    }

                    if (!this.__db.objectStoreNames.contains(name)) {
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_STORE_NOT_EXIST + name);
                        reject(new StoreNotExitsException());
                    }

                    try {
                        let tx: IDBTransaction = this.__db.transaction(name, mode);
                        let dbr = requestCb(tx.objectStore(name));

                        dbr.onsuccess = (e: Event) => {
                            resolve(dbr.result);
                        }

                        dbr.onerror = (e: Event) => {
                            Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_PERFORM_STORE_REQ, e);
                            reject(new IndexedDbStoreRequestFailedException());
                        }

                    } catch (e) {
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_PERFORM_STORE_REQ, e);
                        reject(new IndexedDbStoreRequestFailedException(e));
                    }

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                }
            );

        }

        /**
         * Creates a store with passed parameters and eventually calls a callback to configure it
         * There is no check if the store exist, it must be done in caller function.
         * This function is supposed to be called from getStore method only.
         * @param name Name of the store to be created
         * @param mode Mode in which the store should be oppened and returned to caller
         * @param params Parameters of the store
         * @param configureStore Callback to be called to configure the store
         */
        public async createStore(
            name,
            params,
            configureStore: (store: IDBObjectStore) => void,
        ): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

            // don't create store if it exists
            if (this.__db.objectStoreNames.contains(name)) {
                return;
            }

            // it is definitely neccessary to change DB version and reopen it to get the upgradeneeded event
            let version = this.__db.version;
            version++;

            // close the db
            this.__db.close();
            this.__db = null;

            // wait for next js eloop tick (give a chance to the DB to get closed)
            await Utils.nextTickAsync();

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_NEW_DB_VER + version);

            // reopen the DB with new version and callback to create a store and action on that store
            await this.__openDb(
                version,
                (): void => {

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

                    // create the store to the newly oppened DB
                    let store: IDBObjectStore = this.__db.createObjectStore(name, params);

                    // if store configuration callback was passed in, call it now
                    if (configureStore) {
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_CONF_STORE);
                        configureStore(store);
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_CONF_STORE_DONE);
                    }

                }
            );

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
        }

        /**
         * Opens a IndexedDB
         * The update of DB is forced by createStore only
         * @param version Optional value of the version to be openned
         * @param upgrade Callback to be called when the database needs an update
         */
        private __openDb(
            version?: number,
            upgrade?: () => void
        ): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

            return new Promise<void>(

                (resolve: () => void, reject: (reason: any) => void) => {

                    try {
                        let ignoreError: boolean = false;

                        // this is because of IE11, it can't handle undefined version
                        let dbOpen: IDBOpenDBRequest;
                        if (version) {
                             dbOpen = window.indexedDB.open(this.__dbName, version);
                        } else {
                             dbOpen = window.indexedDB.open(this.__dbName);
                        }

                        dbOpen.onerror = (e: Event) => {
                            Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_OPEN_DB, e);
                            if (!ignoreError) {
                                reject(new IndexedDBFailedToOpenException());
                            }
                        };

                        dbOpen.onsuccess = async (e: Event) => {
                            this.__db = (<IDBOpenDBRequest>e.target).result;
                            await Utils.nextTickAsync();
                            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                            resolve();
                        };

                        dbOpen.onupgradeneeded = async (e: Event) => {
                            this.__db = (<IDBOpenDBRequest>e.target).result;

                            if (upgrade) {
                                ignoreError = true;
                                await upgrade();
                            }

                            await Utils.nextTickAsync(50);

                            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                            resolve();
                        }

                    } catch (e) {
                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_OPEN_DB, e);
                        reject(new IndexedDBFailedToOpenException(e));
                    }

                }

            );

        }

    }

}
