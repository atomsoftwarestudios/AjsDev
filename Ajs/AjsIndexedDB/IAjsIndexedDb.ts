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

    /**
     * IAjsIndexedDb interface unique identifier generated using DI.II when constant is initialized at runtime
     */
    export let IIAjsIndexedDB: IAjsIndexedDb = DI.II;

    /**
     * Interface of the IAjsIndexedDb service
     * <p>
     * For example implementation refer to #see [AjsIndexedDb class]{Ajs.AjsIndexedDb.AjsIndexedDb}
     * </p>
     */
    export interface IAjsIndexedDb {

        /**
         * When implemented it should return true when the IndexedDB implementation is pre-2.0 version
         */
        readonly isOldIDbImplementation: boolean;

        /**
         * Should initialize the database an open it for further operations
         * <p>If the DB does not exist the empty DB should be created</p>
         */
        initialize(): Promise<void>;

        /**
         * When implemented it must take care of creating the IndexedDB store.
         * <p>
         * If the store exist already is should be just returned in the resolved promise
         * </p>
         * <p>
         * This would probably require closing of the DB, reopening it with a new version, creation
         * of the store, closing the DB after structure update and reopening for further operations
         * </p>
         */
        createStore(

            /** Name of the store to be created */
            name: string,

            /** Parameters of the store. These are standard IDB store creation parameters.
             * #see [MDN]{https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API} for details
             */
            params: IDBObjectStoreParameters,

            /**
             * Callback to be called when the store is created
             * This callback should configure the store before it is used (i.e. it should add indexes)
             */
            configureStore: (store: IDBObjectStore) => void,

        ): Promise<void>;

        /**
         * When implemented it should provide a service to perform the single DB store operation
         * <p>
         * The callback provided to the method is actually supposes to perform the action itself with
         * returning the DBRequest objec back to the routine. Once the operation will be done the
         * promise should be returned with the value or rejected with the reason why the operation has
         * failed.
         * </p>
         */
        doStoreRequest(

            /** Name of the store to be used for the request */
            name: string,

            /** Mode in which the store should be opened */
            mode: "readonly" | "readwrite",

            /** Callback to be called to perform the store request (i.e. read, add, delete or update records) */
            requestCb: (store: IDBObjectStore) => IDBRequest

        ): Promise<any>;

        /**
         * Implementation should provide functionality to count records in the store using the cursor.
         * As it is not possible to count item using the store.count method for pre-2.0 IDB implementations
         * the interface implementation should provide the possibility to count records in the store by
         * traversing and counting all records in the DB using the cursor.
         */
        countItemsUsingCursor: (storeName: string) => Promise<number>;

    }

}
