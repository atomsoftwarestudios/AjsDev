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

///<reference path="../DI/ServiceAsyncInit.ts" />

namespace Ajs.AjsIndexedDb {

    "use strict";

    /**
     * AjsIndexedDB is used for internal purposes of AJs Framework. Its a wrapper for the IndexedDB browsers feature
     * <p>
     * It is not supposed to be used by the application as it can be slow for multi-store configurations / multi-data per
     * request operations.
     * </p>
     * <p>
     * Ajs IndexedDB is asynchronous Promise wrapper of IndexedDB implementing only functionalities required by the Ajs Framework.
     * Currently, it provides functionality of creating a store, configuring  it and simple methods to manipulate values in the store.
     * The database is always opened once the initialize method is called. Even if the request to reconfigure the DB is made
     * the database is closed and reopenned again.
     * </p>
     * When create store request is made the database is closed and reopened with a new version for configuration if the store does not exist.
     * Once the store is created the DB is closed and reopenned for standard DB operations. It is not supported creation of multiple
     * stores per a single create store request and multiple requests always follows the described process (so can be slow).
     * <p>
     * Calling the store request (such as read / update value operations) always creates a new transaction for given request. Multiple
     * requests per single transactions are not supported now (so multiple operations can be slow).
     * </p>
     * <p>
     * Use the following example carefully. If support of pre-2.0 IndexDB implementation is required the store.count will not work. In such case
     * use #see [countItemsUsingCursor]{Ajs.AjsIndexedDb.IAjsIndexedDb.countItemsUsingCursor} instead. It is highly recommended to test
     * all required functionalities on all targeted platform before release.
     * </p>
     * #example [Usage of the AjsIndexedDb]{/ajsIndexedDbUsage.ts}
     */
    export class AjsIndexedDb extends DI.ServiceAsyncInit implements IAjsIndexedDb {

        /** Stores the name of the IndexedDB used by the service (confrigurable through the constructor) */
        private __dbName: string;

        /** Reference to the IDBDatabase database object */
        private __db: IDBDatabase;

        /** Return information if the IndexedDB implementation is pre-2.0 standard */
        public get isOldIDbImplementation(): boolean {
            if (this.__db && this.__db !== null) {
                return typeof (<any>this.__db).setVersion === "function";
            } else {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_INITIALIZED);
                throw new IndexedDbNotInitializedException();
            }
        }

        /**
         * Constructs Ajs Wrapper service for the IndexedDb stroage
         * @param dbName Name of the DB to be openned / created later during the init phase
         */
        constructor(dbName: string) {
            super();
            this.__dbName = dbName;
            this.__db = null;
        }

        /**
         * Initializes the IdexedDB service
         * <p>If the service was initialized already it resolves immediately.</p>
         * <p>If initialization is already in progress, resolves once the first initiated initialization request is done</p>
         * <p>DB object is stored internally only and is not published to service consumers.</p>
         * @returns Promise to be resolved or rejected based on the initialization result
         */
        protected async _onInitializeAsync(): Promise<void> {

            if (!window.indexedDB) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_SUPPORTED);
                throw new IndexedDBNotSupportedException();
            }

            try {
                await this.__openDb();
            } catch (e) {
                throw new InitializationFailedException(e);
            }

        }

        /**
         * Prepares a store and calls the requestCb function to perform acions above the store
         * @param name Name of the store to be used to perform the request
         * @param mode Access mode to the store
         * @param requestCb Callback performing the action above the store (i.e. store.clear());
         * @returns Promise which will be resolved with the store request result or rejected when the request will fail
         */
        public doStoreRequest(
            name: string,
            mode: "readonly" | "readwrite" = "readwrite",
            requestCb: (store: IDBObjectStore) => IDBRequest
        ): Promise<any> {

            return new Promise<any>(
                (resolve: (value: any) => void, reject: (reason: any) => void) => {
                    this.__doStoreRequest(name, mode, requestCb, resolve, reject);
                });
        }

        /**
         * Opens a store and performs the data operation implemented in the callback.
         * <p>Called internally from #see [doStoreRequest]{Ajs.AjsIndexedDb.AjsIndexedDb.doStoreRequest} to perform the store request</p>
         * <p>See #see [doStoreRequest]{Ajs.AjsIndexedDb.AjsIndexedDb.doStoreRequest} promise executor implementation for details.</p>
         * @param name Name of the store to be used to perform the request
         * @param mode Access mode to the store
         * @param requestCb Callback performing the action above the store (i.e. store.clear());
         * @param resolve Resolver to be called when store request is successfully created
         * @param reject Rejector to be called when store request fails
         */
        private __doStoreRequest(
            name: string,
            mode: "readonly" | "readwrite" = "readwrite",
            requestCb: (store: IDBObjectStore) => IDBRequest,
            resolve: (result: any) => void,
            reject: (reason: any) => void
        ): void {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_GETTING_STORE + name + ", ", mode);

            if (!this.initialized || this.__db === null) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_INITIALIZED);
                reject(new IndexedDbNotInitializedException());
                return;
            }

            if (!this.__db.objectStoreNames.contains(name)) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_STORE_NOT_EXIST + name);
                reject(new StoreNotExitsException());
                return;
            }

            try {
                // this is because of old chromiums and ff'es
                if (typeof (<any>this.__db).setVersion === "function") {
                    mode = <any>(mode === "readwrite" ? 0 : 1);
                }

                let tx: IDBTransaction = this.__db.transaction(name, mode);

                tx.onerror = (e: Event) => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_PERFORM_STORE_REQ, e);
                    reject(new IndexedDbStoreRequestFailedException());
                }

                let dbr: IDBRequest = requestCb(tx.objectStore(name));

                dbr.onsuccess = (e: Event) => {
                    resolve(dbr.result);
                };

                dbr.onerror = (e: Event) => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_PERFORM_STORE_REQ, e);
                    reject(new IndexedDbStoreRequestFailedException());
                };

            } catch (e) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_PERFORM_STORE_REQ, e);
                reject(new IndexedDbStoreRequestFailedException(e));
            }
        }

        /**
         * For older browsers it is neccessary to count items using cursors as there is not store.count available
         * @param storeName Name of the store which items has to be counted
         */
        public async countItemsUsingCursor(storeName: string): Promise<number> {
            return new Promise<number>(
                (resolve: (value: number) => void, reject: (reason: any) => void) => {
                    this.__countItemsUsingCursor(storeName, resolve, reject);
                }
            );
        }

        /**
         * Counts items in the store by iterating all items in the store
         * @param storeName Name of the store which items has to be counted
         * @param resolve Resolver to be called when items are counted
         * @param reject Rejector to be called when items counting fails
         */
        private __countItemsUsingCursor(
            storeName: string,
            resolve: (value: number) => void,
            reject: (reason: any) => void
        ): void {

            if (!this.initialized || this.__db === null) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_NOT_INITIALIZED);
                reject(new IndexedDbNotInitializedException());
                return;
            }

            if (!this.__db.objectStoreNames.contains(storeName)) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_STORE_NOT_EXIST + storeName);
                reject(new StoreNotExitsException());
                return;
            }

            let count: number = 0;

            try {

                let tx: IDBTransaction = this.__db.transaction(storeName, "readonly");

                tx.onerror = (e: Event) => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_COUNT_ITEMS_USING_CURSOR, e);
                    reject(new IndexedDbStoreRequestFailedException(tx.error.toString()));
                }

                let dbr: IDBRequest = tx.objectStore(storeName).openCursor();

                dbr.onsuccess = (e: Event) => {

                    if (!(<any>e.target).result) {
                        resolve(count);
                        return;
                    }

                    count++;
                    (<IDBCursor>(<any>e.target).result).continue();
                };

                dbr.onerror = (e: Event) => {
                    console.error("Failed to open cursor! " + dbr.error);
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_COUNT_ITEMS_USING_CURSOR, e);
                    reject(new IndexedDbStoreRequestFailedException(dbr.error.toString()));
                };

            } catch(e) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_TO_COUNT_ITEMS_USING_CURSOR, e);
                reject(new IndexedDbStoreRequestFailedException(e));
            }
        }

        /**
         * Creates a store with passed parameters and calls the callback to configure it
         * <p>If the store exists already it is returned, not recreated.</p>
         * <p>The callback is called with created store instance to configure the store parameters, such as keys, indexes and so on.</p>
         * <p>For details reffer to #see [MDN]{https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore}</p>
         * @param name Name of the store to be created
         * @param params Parameters of the store to be set.
         * @param configureStore Callback to be called to configure the store
         * @returns Promise which will be resolved when the store will be successfully created and configured and rejected if creation or configuration will fail
         */
        public async createStore(
            name: string,
            params: IDBObjectStoreParameters,
            configureStore: (store: IDBObjectStore) => void
        ): Promise<void> {

            return new Promise<void>(
                (resolve: () => void, reject: (reason: any) => void) => {
                    this.__createStore(name, params, configureStore, resolve, reject);
                }
            );

        }

        /**
         * Created a indexed DB store
         * <p>Called from #see [createStore]{Ajs.AjsIndexedDb.AjsIndexedDb.createStore} to perform the store creation and configuration tasks</p>
         * @param name Name of the store to be created
         * @param params Parameters of the store to be set.
         * @param configureStore Callback to be called with created store instance to configure the store
         * @param resolve Resolver to be called when the store is successfuly created and initialized
         * @param reject Rejector to be called when creation or configuration of the store will fail
         * @returns The return value is not important as rejector or resolver is called instead
         */
        private async __createStore(
            name: string,
            params: IDBObjectStoreParameters,
            configureStore: (store: IDBObjectStore) => void,
            resolve: () => void,
            reject: (reason: any) => void
        ): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_CREATING_STORE + name);

            // don't create store if it exists
            if (this.__db.objectStoreNames.contains(name)) {
                resolve();
                return;
            }

            // it is definitely neccessary to change DB version and reopen it to get the upgradeneeded event
            let version: number = this.__db.version;
            if (<any>version === "") {
                version = 1;
            }
            version++;

            // close the db
            this.__db.close();
            this.__db = null;

            // wait some time to give the DB chance to get closed
            // next tick was not enough during tests
            await Utils.nextTickAsync();

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_NEW_DB_VER + version);

            // reopen the DB with new version and callback to create a store and action on that store
            await this.__openDb(
                version,
                () => { this.__dbUpgradeCreateStore(name, params, configureStore); }
            );

            // close db after upgrade and reopen for standard operations
            // close the db
            this.__db.close();
            this.__db = null;

            // wait some time to give the DB chance to get closed
            // next tick was not enough during tests
            await Utils.nextTickAsync();

            await this.__openDb();

            // resolve createStore promise
            resolve();

        }


        /**
         * Creates a store and calls the callback to configure it
         * <p>Called internally from #see [createStore]{Ajs.AjsIndexedDb.AjsIndexedDb.createStore} to perform the store request</p>
         * @param name Name of the store to be created
         * @param mode Mode in which the store should be oppened and returned to caller
         * @param configureStore Callback to be called with the newly created store instance to configure it (i.e. create indexes)
         */
        private __dbUpgradeCreateStore(
            name: string,
            params: IDBObjectStoreParameters,
            configureStore: (store: IDBObjectStore) => void,
        ): void {

            // create the store to the newly oppened DB
            let store: IDBObjectStore = this.__db.createObjectStore(name, params);

            // if store configuration callback was passed in, call it now
            if (configureStore) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_CONF_STORE);
                configureStore(store);
                Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_CONF_STORE_DONE);
            }

        }

        /**
         * Opens a IndexedDB
         * <p>Opens the DB and eventually calls the upgrade callback to upgrade the database layout when the version changes</p>
         * @param version Optional value of the version of the DB to be openned. If it is higher than currently existing DB the upgrade callback is called. If ommited the last recent version of the db will be openned.
         * @param upgrade Callback to be called when the database layout needs to be upgraded (i.e. new stores created or old ones reconfigured)
         */
        private __openDb(
            version?: number,
            upgradeCb?: () => void
        ): Promise<void> {

            return new Promise<void>(
                (resolve: () => void, reject: (reason: any) => void) => {
                    this.__openDbExecutor(version, upgradeCb, resolve, reject);
                }
            );

        }

        /**
         * Opens the indexed DB and eventually upgrades its version and calls a new version configuration callback, if specified
         * @param version Version of the DB to be openned. If undefined the current version is openned or DB created if it does not exist
         * @param upgradeCb Callback to configure upgraded DB
         * @param resolve Resolver to be called when the DB is openned
         * @param reject Rejector to be called when open of the DB fails
         */
        private __openDbExecutor(
            version: number,
            upgradeCb: () => void,
            resolve: () => void, 
            reject: (reason: any) => void
        ): void {

            try {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_IDB, this);

                // this is because of IE11, it can't handle undefined version

                let dbOpen: IDBOpenDBRequest;
                if (version) {
                    dbOpen = window.indexedDB.open(this.__dbName, version);
                } else {
                    dbOpen = window.indexedDB.open(this.__dbName);
                }

                dbOpen.onerror = (e: Event) => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_OPEN_DB, e);
                    reject(new IndexedDBFailedToOpenException());
                };

                dbOpen.onsuccess = (e: Event) => {
                    this.__dbOpenSuccess(e, upgradeCb, version, resolve, reject);
                };

                dbOpen.onupgradeneeded = (e: Event) => {
                    this.__upgradeDb(e, upgradeCb, resolve);
                };

            } catch (e) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_FAILED_OPEN_DB, e);
                reject(new IndexedDBFailedToOpenException(e));
            }

        }

        /**
         * dbOpen.onupgradeneeded event processor
         * Calls upgrade callback if necessary and resolves the openDb promise
         * @param e onupgradeneeded event data
         * @param upgradeCb Callback to be called when the new version of DB was opened
         * @param resolve Resolver of the openDb promise
         */
        private __upgradeDb(
            e: Event,
            upgradeCb: Function,
            resolve: () => void
        ): void {

            this.__db = (<IDBOpenDBRequest>e.target).result;

            (<IDBOpenDBRequest>e.target).onsuccess = null;
            (<IDBOpenDBRequest>e.target).onupgradeneeded = null;
            (<IDBOpenDBRequest>e.target).onerror = null;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_UPGRADING_DB + this.__db.version);

            if (upgradeCb) {
                upgradeCb();
            }

            resolve();
        }

        /**
         * dbOpen.onsuccess event processor
         * Called when DB wasa sucesfully openned. If specified it calls the upgrade callback to configure the new version of the DB
         * @param e onsucess event data
         * @param upgradeCb Callback to be calle to configure the DB (i.e. create and configure stores)
         * @param newVersion New version of the database
         * @param resolve Resolver to be called when the DB is succesfully open
         * @param reject Rejector to be called when try to open the DB fails
         */
        private __dbOpenSuccess(
            e: Event,
            upgradeCb: Function,
            newVersion: number,
            resolve: () => void,
            reject: (reason: any) => void,
        ): void {

            this.__db = (<IDBOpenDBRequest>e.target).result;

            (<IDBOpenDBRequest>e.target).onsuccess = null;
            (<IDBOpenDBRequest>e.target).onupgradeneeded = null;
            (<IDBOpenDBRequest>e.target).onerror = null;

            // this is because of old chromium webviews on android

            if (typeof (<any>this.__db).setVersion === "function") {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, LOG_IDB, this, LOG_OLD_INDEXEDDB_IMPLEMENTATION);

                if (newVersion) {

                    let oldVersion: number = this.__db.version;
                    if (<any>oldVersion === "") {
                        oldVersion = 1;
                    }

                    if (newVersion > oldVersion && upgradeCb !== undefined) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_UPGRADING_VERSION + newVersion);
                        let vch: { onsuccess: Function, onerror: Function } = (<any>this.__db).setVersion(newVersion);

                        vch.onsuccess = async (e: Event) => {
                            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_VERSION_UPGRADED);

                            await upgradeCb();

                            resolve();
                        }

                        vch.onerror = (e: Event) => {

                            Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, LOG_IDB, this, LOG_UPGRADE_FAILED);
                            reject(new IndexedDbOldFailedToSetVersionException());

                        }

                        return;

                    }

                }

                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_IDB, this);
                resolve();
                return;

            }

            // this is standard db behaviour
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, LOG_IDB, this, LOG_DB_OPENED + this.__db.version);
            resolve();

        }

    }

}
