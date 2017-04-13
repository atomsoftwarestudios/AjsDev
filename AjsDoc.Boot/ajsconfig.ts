/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace ajs.boot {

    "use strict";

    /*
    Ajs framework configuration
    See description of every module using IntelliSense
    If module or particular configuration option will be ommited the default value will be used
    */
    configureAjs = (ajsConfig: IAjsConfig): void => {

        ajsConfig.showErrors = true;

        ajsConfig.boot = {
            // enable ajs offline support
            offlineSupport: true,
            // bootResourcesLoadingPreference: ajs.resources.LOADING_PREFERENCE.SERVER
            bootResourcesLoadingPreference: ajs.resources.LOADING_PREFERENCE.CACHE
        };

        ajsConfig.debugging = {
            // styleSheet render target
            styleRenderTarget: document.head,
            // body render target
            bodyRenderTarget: document.body,
            // show the debug console on boot after x miliseconds (0 = don't show)
            // to manually control the console use the browser console 
            // ajs.dbg.console.show()
            // ajs.dbg.console.hide()
            showOnBootDelay: 0,
            loggerConfig: {
                // logging enabled
                enabled: false,
                // logging of the log records to the browser console
                logDataToConsole: false,
                // type of records to be logged
                logTypes: [
                    /*ajs.dbg.LogType.Enter,
                    ajs.dbg.LogType.Exit,*/
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
        };

        ajsConfig.resourceManager = {
            memoryCacheSize: 20 * 1024 * 1024,
            sessionCacheSize: 2 * 1024 * 1024,
            localCacheSize: 2 * 1024 * 1024,
            removeResourcesOlderThan: ajs.utils.maxDate()
        };

        ajsConfig.navigator = [
            { path: "", target: "/01-Introduction" },
            { path: "/", target: "/01-Introduction" },
            { path: "/ref", target: "/ref/" },
            { path: "/ref/", target: "/ref/" }
        ];

        ajsConfig.router = [
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "AjsDocComponent"
            }
        ];

        ajsConfig.view = {
            renderTarget: document.getElementById("ajsRenderTarget")
        };

    };

}
