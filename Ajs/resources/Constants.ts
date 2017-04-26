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

///<reference path="../Exception.ts" />

namespace Ajs.Resources {

    "use strict";

    /**
     * This prefix shall be added to all managed resources which are not loaded from the server
     * <p>
     * All Ajs and application features using managed resources and creating them locally, not
     * by loading them form server (i.e.to session/ app state manager) shall use this prefix in the
     * resource URL in order to be possible to quilcky recognize the resource can't be loaded from
     * the server. If the prefix will not be used the delay in serving the resource can occur as try
     * to load / update it form server will be performed. Definitelly, request to the server will be
     * send what is unwanted behaviour at local resources.
     * </p>
     */
    export const LOCAL_ONLY_PREFIX: string = "LOCAL.";

    /** Default memory cache size 20MB */
    export const MEMORY_CACHE_SIZE: number = 20 * 1024 * 1024;

    /** Default session cache size 20MB */
    export const SESSION_CACHE_SIZE: number = 4 * 1024 * 1024;

    /** Default local cache size 20MB */
    export const LOCAL_CACHE_SIZE: number = 4 * 1024 * 1024;

    /** Indexed DB cache size 20MB */
    export const INDEXEDDB_CACHE_SIZE: number = 20 * 1024 * 1024;

    /** Indicates if loaded scripts should be executed using the eval function or by adding the <script> tag */
    export const USE_EVAL: boolean = true;

    /** Resource types and their file name extensions */
    export const RESOURCE_TYPES: IResourceTypes = {
        /** JavaScript resource */
        script: [".js"],
        /** Cascading stylesheet resource */
        style: [".css"],
        /** Text resource, such as HTML, XML, JSON, TXT */
        text: [".htm", ".html", ".xml", ".json", ".txt"],
        /** Binary resource, such as PNG, JPG, GIF */
        binary: [".png", ".jpg", ".jpeg", "gif"]
    };


}
