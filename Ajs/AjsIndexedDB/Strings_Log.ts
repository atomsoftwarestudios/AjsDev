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

    export const LOG_IDB: string = "Ajs.AjsIndexedDb";

    export const LOG_NOT_SUPPORTED: string = "IndexeDB is not supported";
    export const LOG_INIT_FAILED: string = "Failed to initialize AjsIndexedDb";
    export const LOG_DB_OPENED: string = "DB Opened. Version: ";
    export const LOG_CREATING_STORE: string = "Creating store ";
    export const LOG_UPGRADING_DB: string = "Upgrading DB. Current version: ";
    export const LOG_GETTING_STORE: string = "Getting store ";
    export const LOG_NOT_INITIALIZED: string = "AjsIndexedDb or IndexedDB not initialized";
    export const LOG_STORE_NOT_EXIST: string = "Store not exist ";
    export const LOG_FAILED_TO_PERFORM_STORE_REQ: string = "Failed to perform DB Store request";
    export const LOG_NEW_DB_VER: string = "New db version: ";
    export const LOG_CONF_STORE: string = "Configuring store";
    export const LOG_CONF_STORE_DONE: string = "Configuring store done";
    export const LOG_FAILED_OPEN_DB: string = "Failed to open indexed DB";
    export const LOG_OLD_INDEXEDDB_IMPLEMENTATION: string = "Old IndexedDB implementation detected";
    export const LOG_UPGRADING_VERSION: string = "Setting new version ";
    export const LOG_VERSION_UPGRADED: string = "Version successfuly set";
    export const LOG_UPGRADE_FAILED: string = "Failed to upgrade DB";

}
