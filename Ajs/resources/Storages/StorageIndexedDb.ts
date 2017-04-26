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

namespace Ajs.Resources.Storages {

    "use strict";

    /**
     * Represents the browser local storage (persistent until explicitly cleared)
     */
    export class StorageIndexedDb extends AjsStorage {

        /** Returns type of the storage */
        public get type(): StorageType { return StorageType.IndexedDb; }

        /** Constructs the StorageLocal object */
        public async initialize(): Promise<void> {

            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRESSTOR, this);

            this._supported = window.indexedDB !== undefined;
            
            if (this._supported) {

                // todo: resolve dependency somewhere above
                let db: AjsIndexedDb.IAjsIndexedDb = container.resolve<AjsIndexedDb.IAjsIndexedDb>(AjsIndexedDb.IIAjsIndexedDB);

                this._storageProvider = new StorageProviders.IndexedDbStorageProvider(db);
                await this._storageProvider.initialize();

                this._usedSpace = 0;
                this._resources = await this._getResourcesInfo();

            } else {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRESSTOR, this, LOG_INDEXEDDB_STORAGE_NOT_SUPPORTED);
                throw new IndexedDbStorageNotSupportedException();
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRESSTOR, this);

        }

    }
}
