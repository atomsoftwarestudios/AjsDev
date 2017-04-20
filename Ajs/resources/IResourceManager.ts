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

    export const IIResourceManager: IResourceManager = DI.II;


    /**
     * Resource manager takes care of loading of resources from the server and caching them in the appropriate cache
     * <ul>
     *    <li>GET method is used to load resources</li>
     *    <li>If the resource is type of SCRIPT it is evaulated automatically and immediately on load.</li>
     *    <ul>
     *       <li>Scripts can be evaluated using the eval method or by adding the script tag to the main document</li>
     *       <li>This is drivent by the USE_EVAL constant and should not be changed in runtime</li>
     *       <li>EVAL should be used only for debugging purposes as the visual studio and IE can't handle source maps
     *           when the &lt;script&gt; tag is added</li>
     *       <li>If multiple resources are about to be loaded the evaluation of scripts occcurs when all are loaded successfully
     *           as the order of scripts to be loaded is important, because some can require others to be evaluated earlier</li>
     *    </ul>
     *    <li>If the resource is type of STYLE it is automatically registered to the style manager</li>
     *    <li>Other types of resources are not evaluated automatically and are just returned / cached</li>
     * </ul>
     */
    export interface IResourceManager {

        readonly managedResources: IManagedResource[];

        registerManagedResources(managedResources: IManagedResource[]): void;
        getCachedResource(url: string, storageType: STORAGE_TYPE): ICachedResource;
        setCachedResource(url: string, data: any, storageType: STORAGE_TYPE, cachePolicy: CACHE_POLICY): void;
        removeCachedResource(url: string, storageType: STORAGE_TYPE): void;
        cleanCaches(): void;
        getResource(
            url: string,
            storageType: STORAGE_TYPE,
            cachePolicy?: CACHE_POLICY,
            loadingPreference?: LOADING_PREFERENCE,
            runScript?: boolean): Promise<IResource>;
        getMultipleResources(
            urls: string[],
            storageType: STORAGE_TYPE,
            cachePolicy?: CACHE_POLICY,
            loadingPreference?: LOADING_PREFERENCE,
            runScripts?: boolean): Promise<IResource[]>;

    }

}
