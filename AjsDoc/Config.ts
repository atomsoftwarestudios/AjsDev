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

namespace AjsDoc {

    "use strict";

    Ajs.configureBoot = (config: Ajs.Boot.IBootConfig): void => {
        config.showErrors = true;
        config.offlineSupport = true;
    };

    Ajs.configureFramework = (config: Ajs.IAjsConfig): void => {

        config.redirections = [
            { path: "", target: "/Introduction" },
            { path: "/", target: "/Introduction" },
            { path: "/ref", target: "/ref/" },
            { path: "/ref/", target: "/ref/" }
        ];

        config.routes = [
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "AjsDocComponent"
            }
        ];

        config.renderTarget = document.getElementById("ajsRenderTarget");

    };

    Ajs.configureApp = (config: IAjsDocBrowserConfig): void => {

        // const APP_RESOURCES_LOADING_PREFERENCE: ajs.resources.LOADING_PREFERENCE = ajs.resources.LOADING_PREFERENCE.SERVER;
        const APP_RESOURCES_LOADING_PREFERENCE: Ajs.Resources.LOADING_PREFERENCE = Ajs.Resources.LOADING_PREFERENCE.CACHE;

        config.modelInitializationTimeout = 10000;
        config.headerLabel = "Ajs Framework";
        config.headerDescription = "Developer's guide";

        config.dataStorageOptions = {
            storageType: Ajs.Resources.STORAGE_TYPE.LOCAL,
            cachePolicy: Ajs.Resources.CACHE_POLICY.PERMANENT,
            loadingPreference: APP_RESOURCES_LOADING_PREFERENCE
        };

        config.dataSources = {
            toc: "/resources/toc.json",
            program: "/resources/program.json"
        };

        config.contentFolders = {
            content: "/resources/content",
            examples: "/resources/examples",
            charts: "/resources/charts"
        };

        config.resources = {
            localPermanent: [
                "/js/ajsdoc.lib.js",
                "/resources/css/hljsvs.css",
                "/resources/img/ajs-logo.png",
                "/resources/img/atom-logo.png",
                "/resources/img/hamburger.png",
                "/resources/img/edge.png",
                "/resources/img/firefox.png",
                "/resources/img/chrome.png",
                "/resources/img/ie.png",
                "/resources/img/opera.png",
                "/resources/img/safari.png",
                "/resources/examples/ajs.boot.config.ts",
                "/resources/examples/app_init.ts",
                "/resources/examples/viewComponent_placeholder.ts",
                "/resources/charts/ajs-boot.svg",
                "/resources/charts/appcache.svg",
                "/resources/charts/index-load.svg",
                "/resources/charts/mvvm.svg"
            ]
        };

        config.templates = {
            localPermanent: [
                "/resources/templates/ajsdoc.html"
            ]
        };

    };

}