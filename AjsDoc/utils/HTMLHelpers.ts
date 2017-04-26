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

namespace AjsDoc.Utils {

    "use strict";

    interface IDocTag {
        origstr: string;
        prefix: string;
        label: string;
        link: string;
        isFullUrl: boolean;
    }

    export const IIHTMLHelpers: IHTMLHelpers = Ajs.DI.II;

    export interface IHTMLHelpers {
        setupHTMLContent(text: string, baseUrl?: string): Promise<string>;
    }

    export interface ICPHTMLHelpers {
        examplesPath: string;
        chartsPaths: string;
        resourceManager: Ajs.Resources.IResourceManager;
        storageType: Ajs.Resources.StorageType;
        cachePolicy: Ajs.Resources.CachePolicy;
        loadingPreference: Ajs.Resources.LoadingPreference;
    }

    /**
     * HTML Helper class is used to prepare the Ajs data consumable by Ajs and replace AjsDoc tags with appropriate file content
     * <p>
     * Currently, following tags are implemented:
     * <ul
     * <li>#example [label]{absolute-or-relative-url] - the tag will be replaced with the code example placed in an external file</li>
     * <li>#chart [label]{absolute-or-relative-url] - the tag will be replaced with the chart placed in an external file</li>
     * <li>#see [label]{absolute-or-relative-url] - the tag will be replaced with anchor (a href) tag</li>
     * </ul>
     */
    export class HTMLHelpers implements IHTMLHelpers {

        /** Reference to configured resource manager */
        private __resourceManager: Ajs.Resources.IResourceManager;
        /** Configuration of the storage to be used to load external files */
        private __storageType: Ajs.Resources.StorageType;
        /** Cache policy to be used while loading external files from the server */
        private __cachePolicy: Ajs.Resources.CachePolicy;
        /** Loading preference to be used whe the file is loaded */
        private __loadingPreference: Ajs.Resources.LoadingPreference;

        /** root path to external example files */
        private __examplesPath: string;
        /** root path to external charts files */
        private __chartsPath: string;

        /**
         * Constructs the HTML helper class used to prepare the HTML data content for the AjsDocArtice component
         * It is instanced automatially by the DI container. The configuration is done in the application.
         * @param examplesPath root path to external example files
         * @param chartsPaths root path to external charts files
         * @param resourceManager Reference to configured resource manager
         * @param storageType Configuration of the storage to be used to load external files
         * @param cachePolicy Cache policy to be used while loading external files from the server
         * @param loadingPreference Loading preference to be used whe the file is loaded
         */
        constructor(
            examplesPath: string,
            chartsPaths: string,
            resourceManager: Ajs.Resources.IResourceManager,
            storageType: Ajs.Resources.StorageType,
            cachePolicy: Ajs.Resources.CachePolicy,
            loadingPreference: Ajs.Resources.LoadingPreference) {

            this.__examplesPath = examplesPath;
            this.__chartsPath = chartsPaths;
            this.__resourceManager = resourceManager;
            this.__storageType = storageType;
            this.__cachePolicy = cachePolicy;
            this.__loadingPreference = loadingPreference;

        }

        /**
         * Sets the #ASHTML to let the AjsFw know the text shoule be rendered as HTML
         * Also processes additional AjsDoc comment tags (i.e. #example, #see) and replaces them with external resources
         * @param text The text to be processed and updated
         */
        public setupHTMLContent(text: string): Promise<string> {
            return this.__setupHTMLContent(text);
        }

        /**
         * Private implementation for the HTML content setup
         * @param text Text to be processed and updated
         */
        private __setupHTMLContent(text: string): Promise<String> {

            return new Promise<string>(

                async (resolve: (text: string) => void, reject: (reason?: any) => void) => {

                    try {

                        // tag processors
                        let processors: any = {
                            example: (text, filtered) => { return this.__processExamples(text, filtered) },
                            chart: (text, filtered) => { return this.__processCharts(text, filtered) },
                            see: (text, filtered) => { return this.__processSees(text, filtered) },
                        };

                        // set #ASHTML so VCM and DM knows how to proceed with the text data
                        text = "#ASHTML:" + text;

                        // extract 
                        let extractedTags: IDocTag[] = this.__extractDocTags(text);

                        // call all (async) processors according to extracted tags and processors configuration
                        for (let k in processors) {
                            if (processors.hasOwnProperty(k)) {
                                let filtered: IDocTag[] = extractedTags.filter((value: IDocTag) => {
                                    return value.prefix === k;
                                });

                                if (filtered instanceof Array && filtered.length > 0) {
                                    text = await processors[k](text, filtered);
                                }
                            }
                        }

                        // finish
                        resolve(text);

                    } catch (e) {
                        reject(e);
                    }
                }
            );
        }

        /**
         * Extracts tags in format #tag [label]{link}
         * @param text text to be searched for tags
         */
        private __extractDocTags(text: string): IDocTag[] {

            let iTags: IDocTag[] = [];

            let tags: RegExpMatchArray = text.match(/#[a-zA-Z]*[\s]?\[[a-zA-Z0-9\s\-\+_\-\.]*\]\s*\{[a-zA-Z0-9\-._~:/?#\[\]@!$&%'()*+,;=]*\}/gm);

            if (tags === undefined || tags === null || tags.length === 0) {
                return iTags;
            }

            for (let l of tags) {

                let match: RegExpExecArray;
                let iTag: IDocTag = <any>{};

                iTag.origstr = l;

                match = /[^#][a-z\s]*(?=[\[])/gm.exec(l);
                iTag.prefix = match[0].trim();

                match = /[^\[]+(?=])/gm.exec(l);
                iTag.label = match[0].trim();

                match = /[^\{]+(?=})/gm.exec(l);
                iTag.link = match[0].trim();

                iTag.isFullUrl = iTag.link.substr(0, 4).toLowerCase() === "http";

                iTags.push(iTag);
            }

            return iTags;

        }

        /**
         * Loads the resource file and replaces the tag by its content
         * @param text Text to be searched for tags. Found tags are replaced with file content
         * @param path Default path for source files (i.e. /resources/examples)
         * @param tags Tags to be searched and replaced
         * @param replacer Function which will perform the replacement
         */
        private async __doReplace(
            text: string,
            path: string,
            tags: IDocTag[],
            replacer: (label: string, data: string) => string
        ): Promise<string> {

            let urls: string[] = tags.map<string>((tag: IDocTag): string => {
                if (tag.isFullUrl) {
                    return tag.link;
                } else {
                    return path + tag.link;
                }
            });

            urls = urls.filter((value: string, index: number, array: string[]) => {
                return array.indexOf(value) === index;
            });

            let resources: Ajs.Resources.IResource[] = await this.__resourceManager.getMultipleResources(
                urls,
                this.__storageType,
                this.__cachePolicy,
                this.__loadingPreference
            );

            for (let resource of resources) {
                for (let tag of tags) {
                    if (resource.url.indexOf(tag.link) !== -1) {
                        text = text.replace(
                            new RegExp(Ajs.Utils.escapeRegExp(tag.origstr), "gm"),
                            replacer(tag.label, resource.data)
                        );
                    }
                }
            }

            return Promise.resolve(text);
        }

        /**
         * Replaces #example []{} tags with the example loaded from file
         * @param text Text to be searched for tags
         * @param tags Found tags to be replaced
         */
        private async __processExamples(text: string, tags: IDocTag[]): Promise<string> {

            return this.__doReplace(text, this.__examplesPath, tags, (label: string, data: string): string => {
                return "<h5>" + label + "</h5><pre class=\"ajsDocExample\"><code>" + data + "</pre></code>";
            });

        }

        /**
         * Replaces the #chart []{} tag with the chart loaded from the file
         * @param text Text to be searched for tags
         * @param tags Found tags to be replaced
         */
        private async __processCharts(text: string, tags: IDocTag[]): Promise<string> {

            return this.__doReplace(text, this.__chartsPath, tags, (label: string, data: string): string => {
                return "<h5>" + label + "</h5><div class=\"ajsDocChart\">" + data + "</div>";
            });

        }

        /**
         * Replaces the #see []{} tag with the a href link
         * @param text Text to be searched for tags
         * @param tags Found tags to be replaced
         */
        private __processSees(text: string, tags: IDocTag[]): Promise<string> {

            for (let tag of tags) {

                if (tag.isFullUrl) {
                    text = text.replace(
                        new RegExp(Ajs.Utils.escapeRegExp(tag.origstr), "gm"),
                        "<a href=\"" + tag.link + "\">" + tag.label + "</div>"
                    );
                } else {
                    text = text.replace(
                        new RegExp(Ajs.Utils.escapeRegExp(tag.origstr), "gm"),
                        "<a href=\"" + tag.link + "\">" + tag.label + "</a>"
                    );
                }
            }

            return Promise.resolve(text);
        }

    }

}