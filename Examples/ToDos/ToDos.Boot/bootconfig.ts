/**
 * Copyright (c)Year, Company
 */

namespace ajs.boot {

    "use strict";

    /*
    List of resources to be loaded during the ajs framework boot process
    Typically, it is a .js file of the application itself and its libraries.
    The rest should be managed by the application itself (i.e. image resources, templates, data files)
    */

    getResourceLists = function(): IResourceLists {

        return {
            direct: [
                "/js/ToDos.js"
            ]
        };

    };

    /*
    Ajs framework configuration
    See description of every module using Intellisense
    If module or particular configuration option will be ommited the default value will be used
    */

    getAjsConfig = (): IAjsConfig => {

        /*
        Following helpers can be used for the routes configurations
        */

        /*
        const allParamsAndHashes: string = "($|\\/$|\\/\\?.*|\\/\\#.*|\\?.*|\\#.*)";
        const anyPath: string = "(\\/.*|.*)";
        */

        // ajs framework moduels configuration
        return {

            /*
            Global ajs configuration
            */

            // deprecated
            logErrors: true,
            // deprecated
            showErrors: true,

            /*
            Boot module configuration
            */

            boot: {
                offlineSupport: false,
                bootResourcesLoadingPreference: ajs.resources.LOADING_PREFERENCE.CACHE
            },

            /*
            Debug console & debug modules configuration
            */

            debugging: {

                /*
                Debug console configuration
                */

                styleRenderTarget: document.head,
                bodyRenderTarget: document.body,
                showOnBootDelay: 0,

                /*
                log module configuration
                */

                loggerConfig: {
                    // logging enabled
                    enabled: false,
                    // logging of the log records to the browser console
                    logDataToConsole: false,
                    // type of records to be logged
                    logTypes: [
                         ajs.dbg.LogType.Enter,
                         ajs.dbg.LogType.Exit,
                         ajs.dbg.LogType.Constructor,
                         ajs.dbg.LogType.Info,
                         ajs.dbg.LogType.Warning,
                         ajs.dbg.LogType.Error,
                         ajs.dbg.LogType.DomAddListener,
                         ajs.dbg.LogType.DomRemoveListener,
                         ajs.dbg.LogType.DomAppendChild,
                         ajs.dbg.LogType.DomRemoveChild,
                         ajs.dbg.LogType.DomReplaceChild
                    ],
                    sourceModules: [
                         "ajs.app",
                         "ajs.boot",
                         "ajs.doc",
                         "ajs.events",
                         "ajs.mvvm.model",
                         "ajs.mvvm.view",
                         "ajs.mvvm.viewmodel",
                         "ajs.navigation",
                         "ajs.resources",
                         "ajs.routing",
                         "ajs.state",
                         "ajs.templating",
                         "ajs.ui",
                         "ajs.utils"
                    ],
                    // max logging level
                    maxLevel: 9
                }
            },

            /*
            Resource manager configuration
            */

            resourceManager: {
                memoryCacheSize: 20 * 1024 * 1024,
                sessionCacheSize: 2 * 1024 * 1024,
                localCacheSize: 2 * 1024 * 1024,
                removeResourcesOlderThan: ajs.utils.maxDate()
            },

            /*
            Navigator configuration
            */

            navigator: [
/*                { path: "", target: "/01-Introduction" },
                { path: "/", target: "/01-Introduction" },
                { path: "/ref", target: "/ref/" },
                { path: "/ref/", target: "/ref/" }*/
            ],


            /*
            Router configuration
            */

            router: [
                {
                    paths: [{ base: ".*", params: "" }],
                    viewComponentName: "Tasks"
                }
            ],

            /*
            View configuration
            */

            view: {
                renderTarget: document.body
            }

        };

    };

    /*
    Application information and configuration
    */

    getApplicationInfo = (): ajs.app.IApplicationInfo => {

        let configuration: ToDos.IApplicationConfig = {
        };

        return {
            appConstructor: ToDos.Application,
            config: configuration
        };

    };

}
