﻿/* *************************************************************************
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

    export const LOG_AJSRESSTOR: string = "Ajs.Resources.Storages";
    export const LOG_LOCAL_STORAGE_NOT_SUPPORTED: string = "Local storage is not supported!";
    export const LOG_SESSION_STORAGE_NOT_SUPPORTED: string = "Session storage is not supported!";
    export const LOG_INDEXEDDB_STORAGE_NOT_SUPPORTED: string = "IndexedDb storage is not supported!";
    export const LOG_CLEARING_STORAGE: string = "Clearing storage";
    export const LOG_ADDING_RESOSURCE: string = "Adding cached resource to the storage ";
    export const LOG_NOT_ENOUGH_SPACE: string = "Not enough space in the storage";
    export const LOG_NOT_ENOUGH_SPACE_META: string = "Not enough space for metadata in the storage";
    export const LOG_GETTING_RESOURCE: string = "Getting cached resource from the storage: ";
    export const LOG_REMOVING_RESOURCE: string = "Removing cached resource: ";
    export const LOG_GETTING_INFO: string = "Getting resources info";
    export const LOG_RES_NOT_FOUND: string = "Cached resource not found in the storage: ";
    export const LOG_UPDATE_RESOURCE: string = "Updating cached resource: ";
    export const LOG_CACHE_CLEAN: string = "Cleaning resource cache. Required space: ";
    export const LOG_CLEAN_ALL: string = "Complete clean";
    export const LOG_AJSINDEXEDDBNOTSET: string = "Ajs Idexed DB must be set before initializing IndexedDB provider!";

}
