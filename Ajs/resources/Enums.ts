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

    /** List of possible resource types */
    export enum ResourceType {
        Script,
        Style,
        Text,
        Binary,
        Unknown
    }

    /** Type of the storage - passed to the loadResource or loadResources methods */
    export enum StorageType {
        None,
        Local,
        Session,
        IndexedDb,
        Memory
    }

    /**
     * Resource cache policy
     * <p>
     * RCP is used to determine if the resource shouls be accessible permanently (mainly in offline mode) or
     * if it can be removed from the cache if there is not enough space for another resource requested by the application
     * </p>
     */
    export enum CachePolicy {
        /** Not used when the resource is cached, the resource is loaded directly from the server */
        None,
        /** Resource is cached permanently, it can't be removed during the cache clean process */
        Permanent,
        /** Last recently used resources will be removed from the cache if there is no space for a new resource requested */
        LastRecentlyUsed
    }

    /**
     * Loading preference specifies where cached resources should be prefrably loaded from
     */
    export enum LoadingPreference {
        Server,
        Cache
    }

}
