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
     * Local Storage Async Wrapper
     */
    export class LocalStorageProvider implements IStorageProvider {

        /** Returns numer of items stored in local storage */
        public get length(): number { return window.localStorage.length; }

        /** Initializes the local storage wrapper */
        public async initialize(): Promise<void> {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_INITIALIZING_LOCAL_STORAGE);
            return;
        }

        /** Clears the local storage */
        public async clear(): Promise<void> {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_CLEARING_LOCAL_STORAGE);
            window.localStorage.clear();
        }

        /**
         * Sets the specified string data under specified key
         * @param key Key to be used to store the data
         * @param data Data to be stored
         */
        public async setItem(key: string, data: string): Promise<void> {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_SETTING_LOCAL_STORAGE_ITEM + key, data);
            window.localStorage.setItem(key, data);
        }

        /**
         * Returns the string data for specified key or null if the key does not exist
         * @param key The key which data should be returned
         */
        public async getItem(key: string): Promise<string> {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_GETTING_LOCAL_STORAGE_ITEM + key);
            return window.localStorage.getItem(key);
        }

        /**
         * Removes the item from the key/value store
         * @param key Key of the item to be removed
         */
        public async removeItem(key: string): Promise<void> {
            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 3, LOG_AJSRESSTORP, this, LOG_REMOVING_LOCAL_STORAGE_ITEM + key);
            window.localStorage.removeItem(key);
        }

    }
}
