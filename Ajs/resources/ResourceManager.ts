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
    export class ResourceManager implements IResourceManager {

        private __initialized: boolean;

        private __ajsIndexedDb: AjsIndexedDb.IAjsIndexedDb;
        private __config: IResourceManagerConfig;

        /** Stores referrence to the ResourceLoader object */
        private __resourceLoader: ResourceLoader;

        /** Stores reference to the StorageLocal object */
        private __storageLocal: Storages.IAjsStorage;

        /** Stores reference to the StorageSession object */
        private __storageSession: Storages.IAjsStorage;

        /** Stores reference to the StorageIndexedDb object */
        private __storageIndexedDb: Storages.IAjsStorage;

        /** Stores reference to the StorageMemory object */
        private __storageMemory: Storages.IAjsStorage;

        /** Stores list of all resources managed by the resource manager */
        private __managedResources: IManagedResource[];
        /** Returns list of all resources managed by the resource manager */
        public get managedResources(): IManagedResource[] { return this.__managedResources; }

        /**
         * Constructs the ResourceManager
         * <p>
         * Initializes resource loader and resource storages and gets info about managed resources.
         * Basically, all resources remaining in storages after refresh / browser restart and
         * created during any previous session using the resource manager are automatically managed
         * in the new browser session. Ofcouse only those alived the user action (session data will
         * not be avalilable after browser restart)
         * <p>
         */
        public constructor(ajsIndexedDb: AjsIndexedDb.IAjsIndexedDb, config: IResourceManagerConfig) {
            Dbg.log(Dbg.LogType.Constructor, 0, LOG_AJSRES, this);

            this.__ajsIndexedDb = ajsIndexedDb;

            // store config locally
            if (config === undefined) {
                this.__config = this._defaultConfig();
            } else {
                this.__config = config;
            }

            this.__initialized = false;

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
        }

        public async initialize(): Promise<void> {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            if (this.__initialized) {
                Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                return;
            }
            this.__initialized = true;

            this.__resourceLoader = new ResourceLoader();
            this.__storageLocal = new Storages.StorageLocal(this.__config.localCacheSize);
            this.__storageSession = new Storages.StorageSession(this.__config.sessionCacheSize);
            this.__storageMemory = new Storages.StorageMemory(this.__config.memoryCacheSize);
            this.__storageIndexedDb = new Storages.StorageIndexedDb(this.__config.indexedBbCacheSize);

            await Promise.all([
                this.__storageMemory.initialize(),
                this.__storageLocal.initialize(),
                this.__storageSession.initialize(),
                this.__storageIndexedDb.initialize()
            ]);

            this.__managedResources = this._getManagedResources();

            // do some logging
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_LOCAL_STORAGE_USED_SPACE + this.__storageLocal.usedSpace + "/" + this.__storageLocal.cacheSize);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_LOCAL_STORAGE_RES_COUNT + this.__storageLocal.resources.length);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_SESSION_STORAGE_USED_SPACE + this.__storageSession.usedSpace + "/" + this.__storageSession.cacheSize);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_SESSION_STORAGE_RES_COUNT + this.__storageSession.resources.length);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_INDEXEDDB_STORAGE_USED_SPACE + this.__storageIndexedDb.usedSpace + "/" + this.__storageIndexedDb.cacheSize);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_INDEXEDDB_STORAGE_RES_COUNT + this.__storageIndexedDb.resources.length);

            // this will be always 0/max/0, just for sure everything works fine
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_MEMORY_STORAGE_USED_SPACE + this.__storageMemory.usedSpace + "/" + this.__storageMemory.cacheSize);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_MEMORY_STORAGE_RES_COUNT + this.__storageMemory.resources.length);

            if (this.__config.removeResourcesOlderThan !== undefined) {
                Ajs.Dbg.log(Dbg.LogType.Warning, 0, LOG_AJSRES, this,
                    "IMPLEMENT: ResourceManager.constructor - removeResourcesOlderThan functionality");
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
        }

        /**
         * Returns the default ResourceManager configuration
         */
        protected _defaultConfig(): IResourceManagerConfig {

            Ajs.Dbg.log(Dbg.LogType.Warning, 0, LOG_AJSRES, this, LOG_DEFAULT_CONFIG);

            return {
                memoryCacheSize: MEMORY_CACHE_SIZE,
                sessionCacheSize: SESSION_CACHE_SIZE,
                localCacheSize: LOCAL_CACHE_SIZE,
                indexedBbCacheSize: INDEXEDDB_CACHE_SIZE
            };
        }

        /**
         * Gets resources managed last time (before browser reload/refresh/open/reopen)
         * <p>
         * Called from constructor to get list of cached resources in local, session and indexedDb storages
         */
        protected _getManagedResources(): IManagedResource[] {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_LIST_OF_MANAGED_RESOURCES);

            let managedResources: IManagedResource[] = [];

            function collectResources(storage: Storages.IAjsStorage): void {

                for (let mr of storage.resources) {
                    managedResources.push({
                        url: mr.url,
                        storageType: storage.type,
                        cachePolicy: mr.cachePolicy
                    });
                }

            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_NUM_MANAGED_RESOURCES_LOCAL + this.__storageLocal.resources.length);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_NUM_MANAGED_RESOURCES_SESSION + this.__storageSession.resources);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_NUM_MANAGED_RESOURCES_INDEXEDDB + this.__storageIndexedDb.resources.length);

            collectResources(this.__storageLocal);
            collectResources(this.__storageSession);
            collectResources(this.__storageIndexedDb);

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
            return managedResources;
        }

        /**
         * Registers managed resources without preloading them (resources will be loaded/cached with first getResource)
         * <p>
         * Managed resource is uniquely identified by the URL, storage type and the caching policy. This means it can happen
         * the same resource (with the same url) will be placed in three different storage (memory, session, local). It up
         * to application developer to make sure the resource is available just in storages where it should be and don't
         * consumes the other storages if not necessary.
         * </p>
         * <p>
         * registerManagedResource should be used instead of getMultipleResources for all resources with the LRU policy.
         * This is because during the loadMultiple the "clean cache" mechanism can be executed when LRU resources will
         * not fit the maximum cache size so earlier resources loaded will be flushed and replaced with latest loaded. If
         * the resource is just registered it will be loaded (if it is not cached) at the time when getResource is called
         * so in the worst case the "clean cache" will be executed just to make a space for the resource required.
         * </p>
         * <p>
         * On other hand, if resources are required to be accessible offline developer have to make sure resources
         * will fit the cache. In this case resources shall be loaded instead of registered and also shall be using the
         * PERMANENT cache policy.
         * </p>
         */
        public registerManagedResources(managedResources: IManagedResource[]): void {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_REGISTER_MANAGED_RESOURCES + managedResources.length, managedResources);

            // go through all managed resources to be registered
            for (let mr of managedResources) {

                // check if it is registered
                let managedResource: IManagedResource = this.__getManagedResourceInfo(mr.url, mr.storageType);

                // register it if not
                if (managedResource === null) {

                    Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                        LOG_REGISTER_MANAGED_RESOURCE +
                        mr.url + " [" + StorageType[mr.storageType] + ":" + CachePolicy[mr.cachePolicy] + "]");

                    this.managedResources.push({
                        url: mr.url,
                        storageType: mr.storageType,
                        cachePolicy: mr.cachePolicy
                    });

                }

            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
        }

        /**
         * Returns a cached resource if the resource is available in specified storage
         * @param url Url of the cached resource
         * @param storageType type of the storage to be used for lookup
         */
        public async getCachedResource(url: string, storageType: StorageType): Promise<Storages.ICachedResource> {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_GETTING_CACHED_RESOURCE + url + ", " + StorageType[storageType]);

            let storage: Storages.IAjsStorage = this.__getStorageFromType(storageType);

            if (storage !== null) {
                Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                return storage.getResource(url);
            } else {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_STORAGE_TYPE);
                throw new InvalidStorageTypeException();
            }

        }

        /**
         * Creates or updates existing cached resource
         * Automatically creates a managed resource if the managed resource does not not exist
         * @param url Url of the cached resource
         * @param data Data to be stored or updated
         * @param storageType type of the storage to be used
         * @param cachePolicy cache policy to be used for new resources
         */
        public async setCachedResource(url: string, data: any, storageType: StorageType, cachePolicy: CachePolicy): Promise<void> {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_SETTING_CACHED_RESOURCE + url + " " + StorageType[storageType] + " " + CachePolicy[cachePolicy]);

            let storage: Storages.IAjsStorage = this.__getStorageFromType(storageType);
            if (storage !== null) {

                // register managed resource
                this.registerManagedResources([{
                    url: url,
                    storageType: storageType,
                    cachePolicy: cachePolicy
                }]);

                // store / update cached resource
                let resource: Storages.ICachedResource = {
                    url: url,
                    data: data,
                    cachePolicy: cachePolicy,
                    lastModified: new Date()
                };

                Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                return storage.updateResource(resource);

            } else {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_STORAGE_TYPE);
                throw new InvalidStorageTypeException();
            }

        }

        /**
         * Removes existing cached resource
         * @param resource Resource to be created or updated
         * @param storageType Type of the storage to be used
         */
        public async removeCachedResource(url: string, storageType: StorageType): Promise<void> {
            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_REMOVING_CAHCED_RESOURCE + url + " " + StorageType[storageType]);

            let storage: Storages.IAjsStorage = this.__getStorageFromType(storageType);
            if (storage !== null) {

                // remove the managed resource
                for (let i: number = 0; i < this.__managedResources.length; i++) {
                    if (this.__managedResources[i].url === url && this.__managedResources[i].storageType === storageType) {
                        this.managedResources.splice(i, 1);
                        break;
                    }
                }

                // remove the resource from the storage
                Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                return storage.removeResource(url);

            } else {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_STORAGE_TYPE);
                throw new InvalidStorageTypeException();
            }
        }

        /**
         * Removes all cached resources
         */
        public async cleanCaches(): Promise<void> {
            await Promise.all([
                this.__storageLocal.clear(),
                this.__storageSession.clear(),
                this.__storageMemory.clear(),
                this.__managedResources = []
            ]);
        }

        /**
         * Returns a resource from cache or from the server and updates the cache
         * <p>
         * If preference is set to CACHE and the resource is cached the promise is resolved immediately.
         * If the resource is not supposed to be local only (its URL prefix is #see {LOCAL_ONLY_PREFIX}) it
         * is checked if resource was updated on the server then the cache is synchronized. There are no
         * further notifications to the application the resource and the cache was updated so it is possible
         * the resource currently in use is one request older than the resource on the server and in the cache.
         * </p>
         * <p>
         * If the preference is server the standard load procedure is done.
         * </p>
         * @param url Url of the resource to be returned
         * @param storageType Resource storage type (if not specified the resource will be loaded from the server without caching)
         * @param cachePolicy Resource cache policy (if not specified the resource will be loaded from the server without caching)
         * @param loadingPreference Resource loading preference
         * @param runScript Specifies if the script resource should be started
         */
        public async getResource(
            url: string,
            storageType: StorageType,
            cachePolicy?: CachePolicy,
            loadingPreference?: LoadingPreference,
            runScript?: boolean): Promise<IResource> {

            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            // set default preference if not set by caller
            if (loadingPreference === undefined) {
                loadingPreference = LoadingPreference.Server;
            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_GETTING_RESOURCE + url + ", " + LoadingPreference[loadingPreference]);

            // determine if the resource is local only or from the server
            let localResource: boolean = url.substring(0, LOCAL_ONLY_PREFIX.length) === LOCAL_ONLY_PREFIX;

            // try to get the managed resource descriptor from the URL
            let managedResource: IManagedResource;

            if (storageType !== undefined) {
                managedResource = this.__getManagedResourceInfo(url, storageType);
            } else {
                managedResource = null;
            }

            // get cached resource if the resource is local or the preference is cache
            // (and resource was previously added to managed resources). If it will not be found in the cache, try to
            // load it from the server
            if (managedResource !== null && (loadingPreference === LoadingPreference.Cache || localResource)) {

                // get storage instance from the storage type
                let storage: Storages.IAjsStorage = this.__getStorageFromType(managedResource.storageType);

                // this should never fail as it is managed resource, but just to be sure
                if (storage !== null) {

                    // get cached resource
                    let cachedResource: Storages.ICachedResource = await storage.getResource(url);

                    // and if it was found, return it to caller
                    if (cachedResource !== null) {

                        Ajs.UI.ProgressBar.resourceLoaded(url);
                        await Utils.nextTickAsync();

                        let resource: IResource = {
                            url: url,
                            type: this.__getResourceTypeFromURL(url),
                            data: cachedResource.data,
                            cached: true,
                            storage: storage,
                            cachePolicy: cachedResource.cachePolicy,
                            lastModified: cachedResource.lastModified
                        };

                        // update the resource in the cache if necessary, but asynchronously, don't wait for it
                        this.__load(url, managedResource.storageType, managedResource.cachePolicy, runScript, false);

                        Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                        return resource;

                    } else {

                        // if its a local resource, ready with null as it was not found in cache
                        if (localResource) {
                            Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_LOCAL_RESOURCE_NOT_CACHED);
                            throw new LocalResourceRequestedDoesNotExistException(url);
                        } else {
                            // otherwise try to load it from the server
                            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_RESOURCE_NOT_CACHED);
                            Ajs.Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                            return this.__load(url, storageType, cachePolicy, runScript, true);
                        }
                    }

                    // this should never occur on managed resources
                } else {
                    Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_STORAGE_TYPE);
                    throw new InvalidStorageTypeException(url);
                }

            } else {

                if (localResource) {
                    Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.resources", this, LOG_LOCAL_RESOURCE_NOT_CACHED);
                    throw new LocalResourceRequestedDoesNotExistException(url);
                }

                // if storage type or caching policy was not added don't create managed resource
                // just load it from server if possible
                if (storageType === undefined || cachePolicy === undefined) {
                    storageType = StorageType.None;
                    cachePolicy = CachePolicy.None;
                }

                Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                return this.__load(url, storageType, cachePolicy, runScript, true);

            }
        }

        /**
         * Returns multiple resources from a cache or from the server and updates the cache
         * <p>
         * Waits until all resources are available before resolving the promise.
         * If the resource is not supposed to be local only (its URL prefix is #see {LOCAL_ONLY_PREFIX}) it
         * is checked if resource was updated on the server then the cache is synchronized. There are no
         * further notifications to the application the resource and the cache was updated so it is possible
         * the resource currently in use is one request older than the resource on the server and in the cache.
         * </p>
         * <p>
         * If the preference is server the standard load procedure is done.
         * </p>
         * @param urls Urls of the resources to be returned
         * @param storageType Resource storage type (if not specified resources will be loaded from the server without caching)
         * @param cachePolicy Resource cache policy (if not specified resources will be loaded from the server without caching)
         * @param loadingPreference Resources loading preference
         * @param runScript Specifies if the script resources should be evaluated
         */
        public async getMultipleResources(
            urls: string[],
            storageType: StorageType,
            cachePolicy?: CachePolicy,
            loadingPreference?: LoadingPreference,
            runScripts?: boolean): Promise<IResource[]> {

            Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            // don't process anything else than array of urls
            if (!(urls instanceof Array)) {
                urls = [];
            }

            // by default is loading preference CACHE
            if (loadingPreference === undefined) {
                loadingPreference = LoadingPreference.Server;
            }

            // by default run loaded scripts
            if (runScripts === undefined) {
                runScripts = true;
            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_GETTING_MULTIPLE + urls.length + ", " + StorageType[storageType] + ", " + CachePolicy[cachePolicy], urls);

            let gettedResources: IResource[];
            let resources: Promise<IResource>[] = [];

            // push "load" promises to the resources array
            for (let i: number = 0; i < urls.length; i++) {
                resources.push(this.getResource(urls[i], storageType, cachePolicy, loadingPreference, false));
            }

            // hopefully getted resources are in the same order they were passed in
            gettedResources = await Promise.all(resources);

            // run scripts
            if (runScripts) {
                for (let i: number = 0; i < gettedResources.length; i++) {

                    if (gettedResources[i].type === ResourceType.Script) {

                        // use eval or insert the script tag to the code
                        if (USE_EVAL) {
                            this.__evalScript(gettedResources[i]);
                        } else {
                            this.__addScriptTag(gettedResources[i]);
                        }
                    }
                }
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
            return gettedResources;

        }

        /**
         * Load resource from server or cache
         * <p>
         *  If the "mode" is offline or resource was not modified since the last download the cached resource is returned
         * </p>
         * <p>
         * <ul>
         *    If caching of the resource is required the resource is created or updated in the cache of given type
         *    <li>GET method is used to load resources</li>
         *    <li>If the resource is type of SCRIPT it is (by default) evaulated automatically and immediately on load.
         *       <ul>
         *          <li>Scripts can be evaluated using the eval method or by adding the script tag to the main document</li>
         *          <li>This is drivent by the USE_EVAL constant and should not be changed in runtime</li>
         *          <li>EVAL should be used only for debugging purposes as the visual studio and IE can't handle source maps
         *              when the &lt;script&gt; tag is added</li>
         *       </ul>
         *    </li>
         *    <li>If the resource is type of STYLE it is automatically registered to the style manager</li>
         *    <li>Other types of resources are not evaluated automatically and are just returned / cached</li>
         * </ul>
         * </p>
         * @param url Url of the resource to be loaded
         * @param storageType Type of storage to be used to cache the resource.
         *                    If the storage is not specified the direct download will be used
         * @param cachePolicy If the storage is specified the cache policy will set the cache behavior
         * @param runScript Specifies if the script resource should be evaluated automatically
         * @param updateProgressBar Specified if UI progressbar should be updated
         */
        private async __load(
            url: string,
            storageType: StorageType,
            cachePolicy: CachePolicy,
            runScript?: boolean,
            updateProgressBar?: boolean
        ): Promise<IResource> {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            if (runScript === undefined) {
                runScript = true;
            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this,
                LOG_LOADING_RESOURCE + url + ", " + StorageType[storageType] + ", " + CachePolicy[cachePolicy]);

            // get the storage
            let storage: Storages.IAjsStorage = this.__getStorageFromType(storageType);

            // basic checks and parameters update
            if (storage !== null) {

                if (!storage.supported) {
                    Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_STORAGE_TYPE);
                    throw new StorageTypeNotSupportedException();
                }

                if (cachePolicy === undefined || cachePolicy === CachePolicy.None) {
                    Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_INVALID_CACHE_POLICY);
                    throw new CachePolicyMustBeSetException();
                }

            } else {
                Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_FALLBACK_POLICY);
                cachePolicy = CachePolicy.None;
            }

            // if resource is managed, try to load it from cache first - this info is need to send info about
            // when it was cached to the server
            let resource: IResource = null;

            let managedResource: IManagedResource = this.__getManagedResourceInfo(url, storageType);

            if (managedResource !== null) {

                let cachedResource: Storages.ICachedResource = await this.getCachedResource(url, managedResource.storageType);

                if (cachedResource !== null) {
                    resource = {
                        url: url,
                        type: this.__getResourceTypeFromURL(url),
                        data: cachedResource.data,
                        cached: true,
                        storage: this.__getStorageFromType(managedResource.storageType),
                        cachePolicy: managedResource.cachePolicy,
                        lastModified: cachedResource.lastModified
                    };
                }

            // otherwise add resource to list of managed resources
            } else {

                if (storage !== null && cachePolicy !== CachePolicy.None) {

                    this.__managedResources.push({
                        url: url,
                        storageType: storageType,
                        cachePolicy: cachePolicy
                    });

                }

            }

            // setup resource info anyway, even if the resource was not in cache or its not a managed resource
            if (resource === null) {

                resource = {
                    url: url,
                    type: this.__getResourceTypeFromURL(url),
                    data: null,
                    cached: false,
                    storage: storage,
                    cachePolicy: cachePolicy,
                    lastModified: null
                };
            }

            // load and process the resource
            let response: IResourceResponseData = await this.__resourceLoader.loadResource(
                url,
                resource.type === ResourceType.Binary,
                resource.lastModified);

            resource = this.__processResourceResponse(resource, response, runScript);

            if (updateProgressBar) {
                Ajs.UI.ProgressBar.resourceLoaded(resource.url);
                await Utils.nextTickAsync();
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
            return resource;
        }

        /**
         * Called internally when loading of single resource ends and resource need to be processed
         * <p>If not explicitly specified, SCRIPT resources are automatically evaluated</p>
         * @param resource Cached or empty resource prepared in the load method
         * @param response Information about the resource loaded passed from the resource loader
         */
        private __processResourceResponse(resource: IResource, response: IResourceResponseData, runScript?: boolean): IResource {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_PROCESSING_RESOURCE + resource.url);

            let loaded: boolean;

            if (runScript === undefined) {
                runScript = true;
            }

            // loaded successfully, update resource and also cache if necessary
            if (response.httpStatus === 200) {

                // based on the resource type, get the data
                switch (resource.type) {
                    case ResourceType.Binary:
                        Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_BINARY_LOADED);
                        resource.data = new Uint8Array(response.data);
                        break;
                    default:
                        Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_TEXT_LOADED);
                        resource.data = response.data;
                }

                // update cached resource
                if (resource.storage !== null) {

                    Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_CACHING + resource.url);

                    let cachedResource: Storages.ICachedResource = {
                        url: resource.url,
                        data: resource.data,
                        cachePolicy: resource.cachePolicy,
                        lastModified: new Date()
                    };

                    resource.storage.updateResource(cachedResource);
                    resource.cached = true;

                }

                loaded = true;

            } else {
                // not modified / failed (the resource loaded from cache is already set in the resource parameter)
                if (resource.cached) {
                    Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_NOT_MODIFIED + resource.url);
                    loaded = true;
                } else {
                    Ajs.Dbg.log(Dbg.LogType.Warning, 0, LOG_AJSRES, this, LOG_FAILED_LOAD_NOT_CACHED + resource.url);
                    loaded = false;
                }
            }

            // if the resource was not loaded neither cached, exception
            if (!loaded) {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, LOG_AJSRES, this, LOG_FAILED_LOAD + resource.url + ":" + response.httpStatus.toString());
                throw new ResourceFailedToLoadException(resource.url + ":" + response.httpStatus.toString());
            }

            // if the resource is script and should be executed, do it
            if (resource.type === ResourceType.Script && runScript) {

                // use eval or insert the script tag to the code
                if (USE_EVAL) {
                    this.__evalScript(resource);
                } else {
                    this.__addScriptTag(resource);
                }
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);

            return resource;
        }

        /**
         * Returns managed resource info if the resource is managed by the resource manager
         * <p>
         * As managed resource is uniquely identified by URL, storage and cache policy, all three parameters must match
         * in order to be possible to locate the managed resource.
         * </p>
         * @param url Url of the resource to be checked and #see {ajs.resources.IManagedResource} info to be returned for
         * @param storageType Storage type of the resource to be checked and #see {ajs.resources.IManagedResource} info to be returned for
         */
        private __getManagedResourceInfo(url: string, storageType: StorageType): IManagedResource {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_LOOKING_RESOURCE + url);

            for (let i: number = 0; i < this.__managedResources.length; i++) {

                if (this.__managedResources[i].url === url &&
                    this.__managedResources[i].storageType === storageType) {

                    Ajs.Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);

                    return this.__managedResources[i];
                }

            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);

            return null;
        }

        /**
         * Returns the storage instance from the storage type
         * @param storageType
         */
        private __getStorageFromType(storageType: StorageType): Storages.IAjsStorage {

            switch (storageType) {
                case StorageType.Local:
                    return this.__storageLocal;

                case StorageType.Session:
                    return this.__storageSession;

                case StorageType.IndexedDb:
                    return this.__storageIndexedDb;

                case StorageType.Memory:
                    return this.__storageMemory;

                default:
                    return null;
            }

        }

        /**
         * Returns the resource type from the resource file extension
         * @param url
         */
        private __getResourceTypeFromURL(url: string): ResourceType {

            let ext: string = url.substring(url.lastIndexOf("."));
            if (RESOURCE_TYPES.script.indexOf(ext) >= 0) { return ResourceType.Script; }
            if (RESOURCE_TYPES.style.indexOf(ext) >= 0) { return ResourceType.Style; }
            if (RESOURCE_TYPES.text.indexOf(ext) >= 0) { return ResourceType.Text; }
            if (RESOURCE_TYPES.binary.indexOf(ext) >= 0) { return ResourceType.Binary; }

            return ResourceType.Unknown;
        }

        /**
         * Evaluates the script resource - should be used only during debugging as IE / Visual Studio does not
         * work with source maps in the dynamically added <script> tag when debugging
         * @param resource Script resource to be evaluated
         */
        private __evalScript(resource: IResource): void {
            Ajs.Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_EVAL_RESOURCE + resource.url, resource);

            if (resource !== null && resource.data != null) {
                let content: string = resource.data;
                if (content.indexOf("//# sourceMappingURL") !== -1) {
                    content =
                        content.substring(0, content.lastIndexOf("\n")) +
                        "\n//# sourceMappingURL=" + resource.url + ".map" +
                        "\n//# sourceURL=" + resource.url;
                }
                eval.call(null, content);
            }

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
        }

        /**
         * Creates the script tag and adds the resource data to it (script is then executed automatically)
         * @param resource Script resource to be evaluated
         */
        private __addScriptTag(resource: IResource): void {
            Ajs.Dbg.log(Dbg.LogType.Enter, 0, LOG_AJSRES, this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, LOG_AJSRES, this, LOG_ADDING_SCRIPT, resource);

            // first check if the script was not added already
            let nodeList: NodeList = document.head.getElementsByTagName("script");
            for (let i: number = 0; i < nodeList.length; i++) {
                if ((nodeList.item(i) as HTMLScriptElement).id === resource.url) {
                    Ajs.Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
                    return;
                }
            }

            // add script and its content
            let script: HTMLScriptElement = document.createElement("script");
            script.id = resource.url;
            script.type = "text/javascript";
            script.innerText = resource.data;
            document.head.appendChild(script);

            Dbg.log(Dbg.LogType.Exit, 0, LOG_AJSRES, this);
        }

    }

}
