/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace AjsDoc.Models.ContentModel {

    "use strict";

    /**
     * Content model is a content data provider for the AjsDoc component. It is designed as Ajs injectable service.
     * Model is added as a scoped service to the DI container and constructed and initialized when the
     * AjsDocComponent (the site root compoent) is instanced (see AjsDoc application class for details).
     * It is used by the AjsDocComponent to collect the state data for complete view component tree.
     */
    export class ContentModel extends Ajs.MVVM.Model.Model implements IContentModel {

        private __resourceManager: Ajs.Resources.IResourceManager;
        private __htmlHelpers: Utils.IHTMLHelpers;
        private __config: IContentModelConfig;
        private __data: DTO.IContentData;

        constructor(
            container: Ajs.DI.IContainer,
            resourceManager: Ajs.Resources.IResourceManager,
            htmlHelpers: Utils.IHTMLHelpers,
            config: IContentModelConfig) {

            super(container);

            this.__resourceManager = resourceManager;
            this.__htmlHelpers = htmlHelpers;
            this.__config = config;
        }

        /**
         * Returns menu component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getMenu(path: string): Promise<Components.IAjsDocMenuComponentState> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return this.__getMenu(path);
        }

        /**
         * Returns a navbar component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getNavBar(path: string): Promise<Components.IAjsDocNavBarItemComponentState[]> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return this.__getNavBar(path);
        }

        /**
         * Return article content state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getContent(path: string): Promise<Components.IAjsDocArticleComponentState> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return await this.__getContent(path);
        }

        /**
         * Helper to convert the url path part to concrete article in the tree
         * @param navPath Part of the url describing the path
         */
        public async navigate(navPath: string): Promise<DTO.IArticleData> {

            try {
                await this._waitInitialized(this.__config.initializationTimeout);

                return this.__navigate(navPath);

            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

        }

        /**
         * Initializes the model by loading TOC and updating Articles cache from the server
         * This is neccessary for offline. All articles are preloaded here to defined cache
         * and later used when getContent is called
         */
        protected async _onInitialize(): Promise<void> {
            try {
                await this.__loadToc();
            } catch (e) {
                throw new Ajs.Exception("Failed to initialize content model!", e);
            }
        }

        /**
         * Loads table of contents from the specified URL
         */
        private async __loadToc(): Promise<void> {
            try {

                let tocResource: Ajs.Resources.IResource = await this.__resourceManager.getResource(
                    this.__config.tocUrl,
                    this.__config.storageType,
                    this.__config.cachePolicy,
                    this.__config.loadingPreference
                );

                this.__data = JSON.parse(tocResource.data);
                this.__loadTocArticles();
                this.__prepareData();

            } catch (e) {
                throw new Ajs.Exception("Failed to load table of contents", e);
            }
        }

        /**
         * Processes TOC data and loads defined articles
         * @param resource TOC resource returned from Resource Manager
         */
        private async __loadTocArticles(): Promise<void> {

            try {
                // prepare content to be loaded
                let contents: Promise<Ajs.Resources.IResource>[] = [];

                // get default article url to be loaded
                contents.push(
                    this.__resourceManager.getResource(
                        this.__data.defaultPath,
                        this.__config.storageType,
                        this.__config.cachePolicy,
                        this.__config.loadingPreference
                    )
                );

                // get the rest of articles urls from the toc and load them
                this.__getResourcesFromData(this.__data.toc, contents);

                await Promise.all(contents);

            } catch (e) {
                throw new Ajs.Exception("Failed to load documentation articles", e);
            }

        }

        /**
         * Walks the TOC tree, obtains all article urls defined in TOC and directs resman to load them
         * @param article Article to be loaded (initialize with tree root)
         * @param contents Prepared list of resource promises to be filled with unresolved article resource promises
         */
        private __getResourcesFromData(article: DTO.IArticleData, contents: Promise<Ajs.Resources.IResource>[]): void {

            // if article has a url, load it
            if (article.path) {
                contents.push(
                    this.__resourceManager.getResource(
                        article.path,
                        this.__config.storageType,
                        this.__config.cachePolicy,
                        this.__config.loadingPreference
                    )
                );
            }

            // go for all children of current article node and get all article urls and load them
            if (article.children) {
                for (let i: number = 0; i < article.children.length; i++) {
                    this.__getResourcesFromData(article.children[i], contents);
                }
            }

        }

        /**
         * Walks the articles tree and anotates the article data with the metadata required for correct usage within the AjsFW
         * @param article Article data object
         * @param parent Parent article data object
         * @param key Unique data key
         */
        private __prepareData(article?: DTO.IArticleData, parent?: DTO.IArticleData, key?: string): void {

            if (article === undefined) {
                this.__prepareData(this.__data.toc, null, "0");
            } else {
                article.parent = parent;
                article.key = key;
                article.label = article.label || "";
                article.navPath = parent && parent !== null ? parent.navPath + "/" : "";
                article.navPath += article.label.replace(/ /g, "-");

                if (article.children instanceof Array) {
                    for (let i: number = 0; i < article.children.length; i++) {
                        this.__prepareData(article.children[i], article, key + "." + i);
                    }
                }
            }

        }

        /**
         * Builds a menu state for the concrete documentation level identified by the path
         * @param navPath Part of the url describing the path
         */
        private __getMenu(navPath: string): Components.IAjsDocMenuComponentState {

            let article: DTO.IArticleData = this.__navigate(navPath);

            if (article.children === undefined || article.children.length === 0) {
                article = article.parent;
            }

            let menu: Components.IAjsDocMenuComponentState = {
                parentLabel: "",
                parentPath: "",
                groups: [],
                items: [],
            };

            /*if (article.parent !== null && article.parent) {
                menu.items.push({
                    key: article.navPath,
                    label: article.label,
                    path: article.navPath,
                    selected: article.navPath === ("/" + navPath),
                    expandable: false,
                    menuLabel: true
                });
            }*/

            for (let i: number = 0; i < article.children.length; i++) {
                let item: Components.IAjsDocMenuItemComponentState = {
                    key: article.children[i].navPath,
                    label: article.children[i].label,
                    path: article.children[i].navPath,
                    selected: (article.navPath === ("/" + navPath) && i === 0) || article.children[i].navPath === ("/" + navPath),
                    expandable: article.children[i].children instanceof Array && article.children[i].children.length > 0,
                    menuLabel: false
                };

                menu.parentLabel = article.parent && article.parent !== null ?
                    article.parent.label !== "" ? article.parent.label : "Guide & Examples"
                    : "";
                menu.parentPath = article.parent && article.parent !== null ?
                    article.parent.navPath !== "" ? article.parent.navPath : "/"
                    :
                    "";

                menu.items.push(item);
            }

            return menu;
        }

        /**
         * Returns article content of the article specified by the path parameter.
         * Additionally, parses HTML for 
         * @param navPath Part of the url describing the path
         */
        private async __getContent(navPath: string): Promise<Components.IAjsDocArticleComponentState> {

            let article: DTO.IArticleData = this.__navigate(navPath);

            if (article.path === undefined) {
                return {};
            }

            try {
                let resource: Ajs.Resources.IResource = await this.__resourceManager.getResource(
                    article.path,
                    this.__config.storageType,
                    this.__config.cachePolicy,
                    this.__config.loadingPreference);

                try {
                    return await this.__htmlHelpers.setupHTMLContent(resource.data);
                } catch (e) {
                    throw new Ajs.Exception("Failed to prepare '" + article.path + "' HTML content");
                }

            } catch (e) {
                throw new Ajs.Exception("Failed to load article '" + navPath + "'", e);
            }

        }

        /**
         * Builds a nav bar items state list for the concrete documentation level identified by the path
         * @param navPath Part of the url describing the path
         */
        private __getNavBar(navPath: string): Components.IAjsDocNavBarItemComponentState[] {
            let items: Components.IAjsDocNavBarItemComponentState[] = [];

            let adata: DTO.IArticleData = this.__navigate(navPath);

            let key: number = 0;
            while (adata !== null) {
                let navBarItem: Components.IAjsDocNavBarItemComponentState = {
                    key: key.toString(),
                    firstItem: false,
                    itemPath: adata.navPath,
                    itemType: "",
                    itemLabel: adata.label
                };
                if (adata.parent !== null) {
                    items.unshift(navBarItem);
                    key++;
                }
                adata = adata.parent;
            }

            if (items.length > 0) {
                items[0].firstItem = true;
            }

            return items;
        }

        private __navigate(navPath: string): DTO.IArticleData {
            let article: DTO.IArticleData = this.__data.toc;

            if (navPath === "") {
                return article;
            } else {
                navPath = "/" + navPath;
            }

            let nodeStack: DTO.IArticleData[] = [article];
            article = null;

            while (nodeStack.length > 0) {
                let a: DTO.IArticleData = nodeStack.pop();
                if (a.navPath === navPath) {
                    article = a;
                    break;
                }
                nodeStack = nodeStack.concat(a.children);
            }

            if (article === null) {
                throw new Ajs.Exception("Invalid path '" + navPath + "'");
            }


            return article;
        }
    }

}