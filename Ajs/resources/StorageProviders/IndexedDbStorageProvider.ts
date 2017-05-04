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

namespace Ajs.Resources.StorageProviders {

    "use strict";

    /**
     * Indexed DB implementation of the Key/Value storage for the resource manager support
     */
    export class IndexedDbStorageProvider implements IStorageProvider {

        private __initialized: boolean;

        /** Stores numer of items in the storage */
        private __length: number;
        /** Returns numer of items in the storage */
        public get length(): number { return this.__length; }

        /** Key/value storage */
        private __db: AjsIndexedDb.IAjsIndexedDb;

        /** Constructs the IndexedDB implementation of the key/value storage */
        constructor(db: AjsIndexedDb.IAjsIndexedDb) {
            this.__db = db;
        }

        public async initialize(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_AJSRESSTORP, this);

            if (this.__initialized) {
                return;
            }

            this.__initialized = true;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_INITIALIZING_INDEXEDDB_STORAGE);

            await this.__db.initialize();

            await this.__db.createStore(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                { keyPath: "key", autoIncrement: false },
                (store: IDBObjectStore): void => {
                }
            );

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, LOG_AJSRESSTORP, this);
        }

        /** Clears the storage */
        public clear(): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_AJSRESSTORP, this);

            this.__length = 0;

            return this.__db.doStoreRequest(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                "readwrite",
                (store: IDBObjectStore): IDBRequest => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_CLEARING_INDEXEDDB_STORAGE);
                    return store.clear();
                }
            );

        }

        /**
         * Sets the specified string data under specified key
         * @param key Key to be used to store the data
         * @param data Data to be stored
         */
        public async setItem(key: string, value: string): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, LOG_AJSRESSTORP, this);

            let oldItem = await this.getItem(key);

            await this.__db.doStoreRequest(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                "readwrite",
                (store: IDBObjectStore): IDBRequest => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this,
                        LOG_SETTING_INDEXEDDB_STORAGE_ITEM + " " + key + ": " + value, value);
                    return store.put({ key: key, value: value });
                }
            );

            if (oldItem === null) {
                this.__length++;
            }

        }

        /**
         * Returns the string data for specified key or null if the key does not exist
         * @param key The key which data should be returned
         */
        public async getItem(key: string): Promise<string> {

            let obj: { key: string, value: string } = await this.__db.doStoreRequest(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                "readonly",
                (store: IDBObjectStore): IDBRequest => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_GETTING_INDEXEDDB_STORAGE_ITEM + " " + key);
                    let dbr: IDBRequest = store.get(key);
                    return dbr;
                }
            );

            if (obj === undefined) {
                return null;
            }

            return obj.value;

        }

        /**
         * Removes the item from the key/value store
         * @param key Key of the item to be removed
         */
        public async removeItem(key: string): Promise<void> {

            await this.__db.doStoreRequest(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                "readonly",
                (store: IDBObjectStore): IDBRequest => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_REMOVING_INDEXEDDB_STORAGE_ITEM + " " + key);
                    return store.delete(key);
                }
            );

            this.__length--;

        }

        private async __count(): Promise<number> {

            let c: number;

            if (this.__db.isOldIDbImplementation) {
                c = await this.__db.countItemsUsingCursor(INDEXDB_STORAGE_PROVIDER_STORAGE_NAME);
                return c;
            }

            c = await this.__db.doStoreRequest(
                INDEXDB_STORAGE_PROVIDER_STORAGE_NAME,
                "readonly",
                (store: IDBObjectStore): IDBRequest => {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_COUNTING_INDEXEDDB_ITEMS);
                        return store.count();
                }
            );

            return c;

        }

    }
}
