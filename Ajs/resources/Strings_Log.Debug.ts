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

namespace Ajs.Resources {

    "use strict";

    export const LOG_AJSRES: string = "Ajs.Resources";

    export const LOG_LOCAL_STORAGE_USED_SPACE: string = "Local storage used space: ";
    export const LOG_LOCAL_STORAGE_RES_COUNT: string = "Local storage managed resources count: ";
    export const LOG_SESSION_STORAGE_USED_SPACE: string = "Session storage used space: ";
    export const LOG_SESSION_STORAGE_RES_COUNT: string = "Session storage managed resources count: ";
    export const LOG_INDEXEDDB_STORAGE_USED_SPACE: string = "IndexedDb storage used space: ";
    export const LOG_INDEXEDDB_STORAGE_RES_COUNT: string = "IndexedDb storage managed resources count: ";
    export const LOG_MEMORY_STORAGE_USED_SPACE: string = "Memory storage used space: ";
    export const LOG_MEMORY_STORAGE_RES_COUNT: string = "Memory storage managed resources count: ";

    export const LOG_DEFAULT_CONFIG: string = "ResourceManager configuration not provided, fallback to default";

    export const LOG_LIST_OF_MANAGED_RESOURCES: string = "Getting list of previously managed resources";
    export const LOG_NUM_MANAGED_RESOURCES_LOCAL: string = "Number of previously managed resources [local storage]: ";
    export const LOG_NUM_MANAGED_RESOURCES_SESSION: string = "Number of previously managed resources [session storage]: ";
    export const LOG_NUM_MANAGED_RESOURCES_INDEXEDDB: string = "Number of previously managed resources [indexedDb storage]: ";

    export const LOG_REGISTER_MANAGED_RESOURCES: string = "Restering managed resource (count): ";
    export const LOG_REGISTER_MANAGED_RESOURCE: string = "Restering managed resource: ";

    export const LOG_GETTING_CACHED_RESOURCE: string = "Getting cached resource: ";
    export const LOG_SETTING_CACHED_RESOURCE: string = "Setting cached resource: ";
    export const LOG_REMOVING_CAHCED_RESOURCE: string = "Removing the cached resource: ";

    export const LOG_INVALID_STORAGE_TYPE: string = "Invalid storage type!";

    export const LOG_GETTING_RESOURCE: string = "Getting resource: ";
    export const LOG_LOCAL_RESOURCE_NOT_CACHED: string = "Local resource requested but not exists in cache";
    export const LOG_RESOURCE_NOT_CACHED: string = "Resource not cached, trying to load it from server";

    export const LOG_GETTING_MULTIPLE: string = "Getting multiple resources: ";
    export const LOG_LOADING_RESOURCE: string = "Loading resource: ";

    export const LOG_INVALID_CACHE_POLICY: string = "Cache policy not set";
    export const LOG_FALLBACK_POLICY: string = "Fallback to CACHE_POLICY.NONE";

    export const LOG_PROCESSING_RESOURCE: string = "Processing loaded resource ";
    export const LOG_BINARY_LOADED: string = "Binary file loaded";
    export const LOG_TEXT_LOADED: string = "Text file loaded";
    export const LOG_CACHING: string = "Loaded resource is requested to be cached. Caching/Updating.";
    export const LOG_NOT_MODIFIED: string = "Not modified, using cached resource";
    export const LOG_FAILED_LOAD_NOT_CACHED: string = "Resource failed to load and is not cached ";
    export const LOG_FAILED_LOAD: string = "Failed to load resource: ";
    export const LOG_LOOKING_RESOURCE: string = "Looking for managed resource ";

    export const LOG_EVAL_RESOURCE: string = "Evaluating sript resource";
    export const LOG_ADDING_SCRIPT: string = "Adding a script resource to the HEAD as a tag";

    export const LOG_REQUESTING_RESOURCE: string = "Requesting [GET] resource ";
    export const LOG_XHR_INIT: string = "Initializing the XHR";
    export const LOG_XHR_READY_STATE: string = "XHR readyState: ";
    export const LOG_XHR_READY_STATE_URL: string = ", URL: ";
    export const LOG_XHR_FOR: string = "XHR for '";
    export const LOG_XHR_RDY_IN: string = "' ready in ";
    export const LOG_XHR_MS: string = "ms with ";
    export const LOG_XHR_OFFLINE_DETECTED: string = "Offline mode detected, index.html served";
}
