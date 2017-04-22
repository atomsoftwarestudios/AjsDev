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

///<reference path="../utils/Utils.ts" />
///<reference path="../dbg/Console.ts" />
///<reference path="../dbg/log.ts" />

namespace Ajs.Boot {

    "use strict";

    import Logger = Dbg.Modules.Logger;

    /**
     * Internal flag indicating the boot was configured already and another configuration call should be prevented
     * This is important especially for offline timed fallback
     */
    let bootConfigured: boolean = false;

    /**
     * Internal flag indicating the boot started and should not be started again
     * This is important especially for offline timed fallback
     */
    let bootStarted: boolean = false;

    /**
     * Handles unhandled errors until framework event handler is assigned
     * @param e ErrorEvent or ajs.Exception to be handled
     */
    function _bootErrorHandler(e: Exception | ErrorEvent): void {
        if (bootConfig.bootConfig.showErrors) {
            Utils.errorHandler(e);
        } else {
            if (e instanceof ErrorEvent) {
                window.console.error(e.error);
            } else {
                window.console.error(e);
            }
        }
    }

    /**
     * Setup default boot configuration
     * @returns default boot config
     */
    function _defaultBootConfig(): IBootConfig {
        return {
            showErrors: true,
            offlineSupport: false,
            offlineFallbackTimeout: 500,
            errorHandler: _bootErrorHandler
        };
    }

    /**
     * Setup default Ajs configuration
     */
    function _defaultAjsConfig(): IAjsConfig {
        return {
            debugging: {
                enabled: false,
                console: {
                    bodyRenderTarget: document.body,
                    styleRenderTarget: document.body,
                    showOnBootDelay: 0
                },
                modules: {
                    logger: {
                        enabled: false,
                        logDataToConsole: false,
                        logTypes: [
                            Ajs.Dbg.LogType.Enter,
                            Ajs.Dbg.LogType.Exit,
                            Ajs.Dbg.LogType.Constructor,
                            Ajs.Dbg.LogType.Info,
                            Ajs.Dbg.LogType.Warning,
                            Ajs.Dbg.LogType.Error,
                            Ajs.Dbg.LogType.DomAddListener,
                            Ajs.Dbg.LogType.DomRemoveListener,
                            Ajs.Dbg.LogType.DomAppendChild,
                            Ajs.Dbg.LogType.DomRemoveChild,
                            Ajs.Dbg.LogType.DomReplaceChild
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
                        maxLevel: 9
                    }
                }
            },
            resourceManager: {
                memoryCacheSize: 20 * 1024 * 1024,
                localCacheSize: 2 * 1024 * 1024,
                sessionCacheSize: 2 * 1024 * 1024,
                removeResourcesOlderThan: Utils.maxDate()
            },
            redirections: [],
            routes: [],
            renderTarget: document.body
        };
    }

    /**
     * Configures Ajs Boot if it was not previously configured
     */
    function _configureBoot(): void {

        if (bootConfigured) {
            return;
        }

        bootConfig.bootConfig = _defaultBootConfig();

        // if configureBoot function is declared, call it
        if (configureBoot) {
            configureBoot(bootConfig.bootConfig);
        }

        bootConfigured = true;
    }

    /**
     * Configures Ajs Framework and Application by calling appropriate user-defined functions
     */
    function _configureAjs(): void {

        ajsConfig = _defaultAjsConfig();

        if (configureFramework instanceof Function) {
            configureFramework(ajsConfig);
        }

        appConfig = {};

        if (configureApp instanceof Function) {
            configureApp(appConfig);
        }

        container = new DI.Container();
        _configureAjsServices(container);
    }

    /**
     * Configuration of Ajs Framework Services based on the configuration
     * @param container
     */
    function _configureAjsServices(container: Ajs.DI.IContainer): void {

        if (Ajs.ajsConfig.debugging.enabled) {

            container
                .addSingleton<Dbg.IConsole, Dbg.ICPConsole>(
                Dbg.IIConsole, Ajs.Dbg.Console, {
                    config: ajsConfig.debugging.console
                });

            if (Ajs.ajsConfig.debugging.modules.logger.enabled) {
                container

                    // console -> used to display the logger menu & data
                    .addSingleton<Logger.ILogger, Logger.ICPLogger>(
                    Dbg.Modules.Logger.IILogger, Dbg.Modules.Logger.Logger, {
                        console: Ajs.Dbg.IIConsole,
                        config: ajsConfig.debugging.modules.logger
                    });
            }

        }

        container
            .addSingleton<Resources.IResourceManager, Resources.ICPResourceManager>(
            Resources.IIResourceManager, Resources.ResourceManager, {
                config: ajsConfig.resourceManager
            })

            // resourceManager -> storing/loading of states from appropriate storages
            .addSingleton<State.IStateManager, State.ICPStateManager>(
            State.IIStateManager, State.StateManager, {
                resourceManager: Resources.IIResourceManager
            })

            // resourceManager -> loading of stylesheets to be rendered
            .addSingleton<Doc.IDocumentManager, Doc.ICPDocumentManager>(
            Doc.IIDocumentManager, Doc.DocumentManager, {
                resourceManager: Resources.IIResourceManager,
                renderTarget: ajsConfig.renderTarget
            })

            // documentManager -> used to collect IDs for components, render target and dom updates
            .addSingleton<MVVM.View.IViewManager, MVVM.View.ICPViewManager>(
            MVVM.View.IIViewManager, MVVM.View.ViewManager, {
                documentManager: Doc.IIDocumentManager
            })

            // resourceManager -> loading of template files
            .addSingleton<Templating.ITemplateManager, Templating.ICPTemplateManager>(
            Templating.IITemplateManager, Templating.TemplateManager, {
                resourceManager: Resources.IIResourceManager
            })

            // templateManager -> getting information about visual components
            // documentManager -> passing DM to created view components
            // viewManager -> setting of root view component, getting unique ID's of components, passing to view components
            .addSingleton<MVVM.ViewModel.IViewComponentManager, MVVM.ViewModel.ICPViewComponentManager>(
            MVVM.ViewModel.IIViewComponentManager, MVVM.ViewModel.ViewComponentManager, {
                container: container,
                templateManager: Templating.IITemplateManager,
                documentManager: Doc.IIDocumentManager,
                viewManager: MVVM.View.IIViewManager,
            })

            // viewComponentManager -> creating and displaying of the root view components
            .addSingleton<Routing.IRouter, Routing.ICPRouter>(
            Routing.IIRouter, Routing.Router, {
                viewComponentManager: MVVM.ViewModel.IIViewComponentManager,
                routes: ajsConfig.routes
            })

            // router -> navigator calls router to show the configured view component
            .addSingleton<Navigation.INavigator, Navigation.ICPNavigator>(
            Navigation.IINavigator, Navigation.Navigator, {
                router: Routing.IIRouter,
                redirections: ajsConfig.redirections
            })

            // resource manager -> loading of application resources
            // template manager -> loading of application templates
            .addSingleton<App.IApplication, Ajs.App.ICPApplication>(
            App.IIApplication, bootConfig.applicationConstructor, {
                config: appConfig,
                container: container,
                resourceManager: Resources.IIResourceManager,
                templateManager: Templating.IITemplateManager,
                viewComponentManager: MVVM.ViewModel.IIViewComponentManager,
                navigator: Navigation.IINavigator,
                router: Routing.IIRouter
            });

    }

    /**
     * Main entry point (executed on application cache events cahced/noupdate/error or window.onload event)
     * Initializes the framework and initiate loading of configured resources)
     */
    function _boot(): void {

        // configure boot
        _configureBoot();

        // check if application is set (the Application class is decorated with Ajs.application decorator
        if (!(Ajs.bootConfig.applicationConstructor instanceof Function)) {
            throw new ApplicationNotConfiguredException();
        }

        _configureAjs();

        // do some logging
        Dbg.log(Dbg.LogType.Info, 0, "ajs.boot", null, productName + " " + version + ", " + copyright);

        // instanitate app
        let application: App.IApplication = container.resolve<App.IApplication>(App.IIApplication);

        // app started its own error handler so its possible to unregister the boot one
        window.removeEventListener("error", (<EventListener>Ajs.bootConfig.bootConfig.errorHandler));

        // configure and run the application
        application.configure(container);
        application.initialize()
            .then(() => {
                application.run();
            })
            .catch((reason: any) => {
                setTimeout(() => {
                    throw new ApplicationException(reason);
                }, 0);
            });

        Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.boot", this);
    }

    /**
     * Called when browser recognizes the application cache manifest has been modified and it is necessary to reload them
     * <p>
     * If such event is detected the page gets automatically reloaded to ensure that latest versions of app cached resources
     * are in use
     * </p>
     */
    function _update(): void {

        // does not make sense to log, reload performed

        let resMan: Ajs.Resources.ResourceManager = new Ajs.Resources.ResourceManager();
        resMan.cleanCaches();
        window.location.reload();
    }

    /**
     * Setup listeners related to Application cache feature used to start the booting process
     * <p>
     * During tests it was confirmed the application cache feature, especially notifications
     * processed bellow is not stable (this statement is valid for all tested browsers) and it
     * is necessary to perform, at least, fallback by timer, otherwise it can happen the framework
     * neither the application will get started.
     * </p>
     */
    function _setupEventListeners(): void {

        // cant use logger as it is possible it is not loaded at this time

        if (window.applicationCache) {

            // process cached event (no change in cached files, boot directly)
            window.applicationCache.addEventListener("cached", () => {
                if (!bootStarted) {
                    bootStarted = true;
                    _boot();
                }
            });

            // process noupdate - means that cached files (mainly the cache.manifest) were not updated
            window.applicationCache.addEventListener("noupdate", () => {
                if (!bootStarted) {
                    bootStarted = true;
                    _boot();
                }
            });

            // the error occured during the accesing files on the server or another problem during its loading (i.e. offline)
            window.applicationCache.addEventListener("error", (e: Event) => {
                if (!bootStarted) {
                    bootStarted = true;
                    _boot();
                }
            });

            // the update of cached files is ready. at this time it is not possile to configure what will happen next
            // its hardcoded the complete resource cache managed by the resource manager will be cleaned up and reload is perofrmed
            // to ensure the latest boot/ajs versions are in use and also latest versions of the application code and application
            // resources will be used
            window.applicationCache.addEventListener("updateready", () => {
                applicationCache.swapCache();
                if (!bootStarted) {
                    bootStarted = true;
                    _update();
                }
            });

            // if appcache is not supported make sure the framework will boot
        }

        // this is fallback if no event is called
        window.addEventListener("load", () => {

            _configureBoot();

            // setup error handler
            window.addEventListener("error", (<EventListener>Ajs.bootConfig.bootConfig.errorHandler));

            if (Ajs && Ajs.bootConfig && Ajs.bootConfig.bootConfig.offlineSupport) {
                setTimeout(() => {
                    if (!bootStarted) {
                        bootStarted = true;
                        _boot();
                    }
                }, bootConfig.bootConfig.offlineFallbackTimeout);
            } else {
                bootStarted = true;
                _boot();
            }

        });

    }

    // ********************************************************************************
    // this code is executed immediately when the ajs.js script is loaded and evaluated
    // takes care of the debug console initialization and starts the ajs boot process
    // ********************************************************************************

    _setupEventListeners();

}
