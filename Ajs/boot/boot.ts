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

///<reference path="../Utils/Utils.ts" />
///<reference path="../Dbg/Dbg.ts" />

namespace Ajs.Boot {

    "use strict";

    import Logger = Dbg.Modules.Logger;

    /**
     * Simple boot progress bar implementation
     */
    let bootProgressBar: IBootProgressBar = null;

    /**
     * Internal flag indicating the boot was configured already and another configuration call should be prevented
     * This is important especially for offline timed fallback
     */
    let bootConfigured: boolean = false;

    /**
     * This variable is used to prevent boot when AppCache update event is raised, because it directs browser to reload application
     */
    let preventBoot: boolean = false;

    /**
     * Internal flag indicating the boot started and should not be started again
     * This is important especially for offline timed fallback
     */
    let bootStarted: boolean = false;

    /**
     * Holds the navigator language in order to be possible to translate boot messages shown in the progress bar
     */
    let bootLanguage: string = (<any>window.navigator).userLanguage || window.navigator.language;

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
            offlineFilesCount: 4,
            cacheUpdateText: {
                "en": "Updating the application. Please wait..."
            },
            offlineFallbackTimeout: 250,
            errorHandler: _bootErrorHandler,
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
                    showOnBootDelay: 5000
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
                            "ajs.utils",
                            "Ajs.AjsIndexedDb",
                            "Ajs.App",
                            "Ajs.Boot",
                            "Ajs.Doc",
                            "Ajs.Events",
                            "Ajs.MVVM.Model",
                            "Ajs.MVVM.View",
                            "Ajs.MVVM.ViewModel",
                            "Ajs.Navigation",
                            "Ajs.Resources",
                            "Ajs.Resources.Storages",
                            "Ajs.Resources.StorageProviders",
                            "Ajs.Resources",
                            "Ajs.Routing",
                            "Ajs.State",
                            "Ajs.Templating",
                            "Ajs.UI",
                            "Ajs.Utils"
                        ],
                        maxLevel: 9
                    }
                }
            },
            indexedDbName: "Ajs",
            resourceManager: {
                memoryCacheSize: 20 * 1024 * 1024,
                localCacheSize: 2 * 1024 * 1024,
                sessionCacheSize: 2 * 1024 * 1024,
                indexedBbCacheSize: 20 * 1024 * 1024,
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

        bootConfigured = true;

        bootConfig.bootConfig = _defaultBootConfig();

        // if configureBoot function is declared, call it
        if (configureBoot) {
            configureBoot(bootConfig.bootConfig);
        }
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
                .addSingleton<Dbg.IConsole>(Dbg.IIConsole, Ajs.Dbg.Console, ajsConfig.debugging.console);

            if (Ajs.ajsConfig.debugging.modules.logger.enabled) {
                container

                    // console -> used to display the logger menu & data
                    .addSingleton<Logger.ILogger>(
                        Dbg.Modules.Logger.IILogger,
                        Dbg.Modules.Logger.Logger,
                        Ajs.Dbg.IIConsole,
                        ajsConfig.debugging.modules.logger
                    );
            }

        }

        container
            .addSingleton<AjsIndexedDb.IAjsIndexedDb>(
                AjsIndexedDb.IIAjsIndexedDB,
                AjsIndexedDb.AjsIndexedDb,
                ajsConfig.indexedDbName
            )

            // - IIAjsIndexedDb -> used by IndexedDb storage provider
            .addSingleton<Resources.IResourceManager>(
                Resources.IIResourceManager,
                Resources.ResourceManager,
                AjsIndexedDb.IIAjsIndexedDB,
                ajsConfig.resourceManager
            )

            // - IIResourceManager -> storing/loading of states from appropriate storages
            .addSingleton<State.IStateManager>(
                State.IIStateManager, State.StateManager,
                Resources.IIResourceManager
            )

            // - IIResourceManager -> loading of stylesheets to be rendered
            .addSingleton<Doc.IDocumentManager>(
            Doc.IIDocumentManager, Doc.DocumentManager,
                Resources.IIResourceManager,
                ajsConfig.renderTarget
            )

            // - IIDocumentManager -> used to collect IDs for components, render target and dom updates
            .addSingleton<MVVM.View.IViewManager>(
                MVVM.View.IIViewManager,
                MVVM.View.ViewManager,
                Doc.IIDocumentManager
            )

            // - IIResourceManager -> loading of template files
            .addSingleton<Templating.ITemplateManager>(
                Templating.IITemplateManager,
                Templating.TemplateManager,
                Resources.IIResourceManager
            )

            // container -> Instancing of Models on which ViewComponents depends
            // - IITemplateManager -> getting information about visual components
            // - IIDocumentManager -> passing DM to created view components
            // - IIViewManager -> setting of root view component, getting unique ID's of components, passing to view components
            .addSingleton<MVVM.ViewModel.IViewComponentManager>(
                MVVM.ViewModel.IIViewComponentManager,
                MVVM.ViewModel.ViewComponentManager,
                container,
                Doc.IIDocumentManager,
                Templating.IITemplateManager,
                MVVM.View.IIViewManager,
            )

            // - IIViewComponentManager -> notifying about root view component changes based on routes config
            .addSingleton<Routing.IRouter>(
                Routing.IIRouter,
                Routing.Router,
                MVVM.ViewModel.IIViewComponentManager,
                ajsConfig.routes
            )

            // - IIRouter -> navigator calls router to show the configured view component
            .addSingleton<Navigation.INavigator>(
                Navigation.IINavigator,
                Navigation.Navigator,
                Routing.IIRouter,
                ajsConfig.redirections
            )

            // - IIResourceManager -> loading of application resources
            // - IITemplateManager -> loading of application templates
            .addSingleton<App.IApplication>(
                App.IIApplication,
                bootConfig.applicationConstructor,
                container,
                Resources.IIResourceManager,
                Templating.IITemplateManager,
                Navigation.IINavigator,
                Routing.IIRouter,
                MVVM.ViewModel.IIViewComponentManager,
                appConfig
            );

    }

    /**
     * Main entry point (executed on application cache events cahced/noupdate/error or window.onload event)
     * Initializes the framework and initiate loading of configured resources)
     */
    async function _boot(): Promise<void> {

        if (preventBoot || bootStarted) {
            return;
        }

        bootStarted = true;

        // configure boot
        _configureBoot();

        // check if application is set (the Application class is decorated with Ajs.application decorator
        if (!(Ajs.bootConfig.applicationConstructor instanceof Function)) {
            throw new ApplicationNotConfiguredException();
        }

        _configureAjs();

        // initialize debugging console and modules
        await Dbg.initialize(container);

        Dbg.log(Dbg.LogType.Info, 0, "ajs.boot", null, productName + " " + version + ", " + copyright);

        // instanitate & initialize the app
        let application: App.IApplication = await container.resolve<App.IApplication>(App.IIApplication);

        // app started its own error handler so its possible to unregister the boot one
        window.removeEventListener("error", (<EventListener>Ajs.bootConfig.bootConfig.errorHandler));

        try {
            await application.run();
        } catch (e) {
            // rethrow the error out of promise to be catchable by the global error handler
            setTimeout(() => {
                throw e;
            }, 0);
        }

        Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.boot", this, "Application started...");

        Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.boot", this);
    }

    /**
     * Called when browser recognizes the application cache manifest has been modified and it is necessary to reload the app
     * <p>
     * If such event is detected the page gets automatically reloaded to ensure that latest versions of app cached resources
     * are in use
     * </p>
     */
    function _update(): void {

        preventBoot = true;

        _configureAjs();

        let resMan: Ajs.Resources.ResourceManager = new Ajs.Resources.ResourceManager(
            new AjsIndexedDb.AjsIndexedDb(ajsConfig.indexedDbName), ajsConfig.resourceManager);

        resMan.initialize()
            .then(() => {
                resMan.cleanCaches()
                    .then(() => {
                        setTimeout(() => { window.location.reload(true); }, 200);
                    })
                    .catch((reason: any) => {
                        setTimeout(() => { window.location.reload(true); }, 200);
                    });
            })
            .catch((reason: any) => {
                setTimeout(() => { window.location.reload(true); }, 200);
            });

    }

    /**
     * Checks if the progress bar is defined in HTML and setups it for use during the boot
     */
    function _setupBootProgressBar(): void {

        let pbar: HTMLElement = document.getElementById("ajsProgressBar");

        if (pbar === undefined || pbar === null) {
            return;
        }

        bootProgressBar = <any>{
            ajsProgressBar: pbar,
            ajsProgressBarPerc: document.getElementById("ajsProgressBarPerc"),
            ajsProgressBarLabel: document.getElementById("ajsProgressBarLabel"),

            getLabel: (): string => {
                return (<any>bootProgressBar).ajsProgressBarLabel.innerText;
            },

            setLabel: (label: string): void => {
                (<any>bootProgressBar).ajsProgressBarLabel.innerText = label;
            },

            setProgress: (current: number, total: number): void => {
                (<any>bootProgressBar).ajsProgressBarPerc.style.width = ((100 / total) * current) + "%";
            }
        };

    }

    /**
     * Translates the text to the language obtained from the system configuration
     * @param what What to translate ( { "lang": "translation"  } object format )
     * @param defaultText Text to be returned when translation is not found
     */
    function _translate(what: IBootText, defaultText: string): string {

        if (!what) {
            return defaultText;
        }

        let dt: string = null;

        for (let key in what) {
            if (what.hasOwnProperty(key)) {
                if (bootLanguage.indexOf(key) !== -1) {
                    return what[key];
                }
                if (dt === null) {
                    dt = what[key];
                }
            }
        }

        if (dt !== null) {
            return dt;
        }

        return defaultText;
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

        let checking: boolean = false;
        let downloading: boolean = false;
        let progressEventCount: number = 0;
        let oldPbarLabel: string = null;

        _setupBootProgressBar();

        // cant use logger as it is possible it is not loaded at this time

        if (window.applicationCache) {

            window.applicationCache.addEventListener("checking", () => {
                checking = true;
            });

            window.applicationCache.addEventListener("downloading", () => {

                downloading = true;

            });

            window.applicationCache.addEventListener("progress", (e: Event) => {

                if (bootProgressBar === null) {

                    _setupBootProgressBar();

                    if (bootProgressBar === null) {
                        return;
                    }

                    oldPbarLabel = bootProgressBar.getLabel();

                    bootProgressBar.setLabel(
                        _translate(bootConfig.bootConfig.cacheUpdateText, "Updating...")
                    );

                    bootProgressBar.setProgress(0, 0);
                }

                if ((<any>e).lengthComputable) {
                    bootProgressBar.setProgress((<any>e).loaded, (<any>e).total);
                } else {
                    bootProgressBar.setProgress(progressEventCount, bootConfig.bootConfig.offlineFilesCount);
                }

            });

            // process cached event (no change in cached files, boot directly)
            window.applicationCache.addEventListener("cached", () => {
                if (bootProgressBar !== null && oldPbarLabel !== null) {
                    bootProgressBar.setLabel(oldPbarLabel);
                    bootProgressBar.setProgress(0, 0);
                }
                _boot();
            });

            // process noupdate - means that cached files (mainly the cache.manifest) were not updated
            window.applicationCache.addEventListener("noupdate", () => {
                if (bootProgressBar !== null && oldPbarLabel !== null) {
                    bootProgressBar.setLabel(oldPbarLabel);
                    bootProgressBar.setProgress(0, 0);
                }
                _boot();
            });

            // the error occured during the accesing files on the server or another problem during its loading (i.e. offline)
            window.applicationCache.addEventListener("error", (e: Event) => {
                _boot();
            });

            // the update of cached files is ready. at this time it is not possile to configure what will happen next
            // its hardcoded the complete resource cache managed by the resource manager will be cleaned up and reload is perofrmed
            // to ensure the latest boot/ajs versions are in use and also latest versions of the application code and application
            // resources will be used
            window.applicationCache.addEventListener("updateready", () => {
                if (bootProgressBar !== null && oldPbarLabel !== null) {
                    bootProgressBar.setLabel(oldPbarLabel);
                    bootProgressBar.setProgress(0, 0);

                }
                _update();
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
                    if (!checking && !downloading) {
                        _boot();
                    }
                }, bootConfig.bootConfig.offlineFallbackTimeout);
            } else {
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
/*
class A {

    constructor() {
    }

    public msg(): void {
        console.log("A");
    }

    private __apriv(): void {
    }

    protected _aprot(): void {
    }

    public apub(): void {
    }

}

class B extends A {

    private __a;
    protected _b;
    public c;

    constructor(a: number, b: number, c: number) {
        super();
        this.__a = a;
        this._b = b;
        this.c = c;
    }

    private __bpriv(): void {
    }

    protected _bprot(): void {
    }

    public bpub(): void {
    }

    public async msg(): Promise<void> {
        super.msg();
        await new Promise<void>((resolve: () => void) => {
            console.log("B");
            setTimeout(resolve, 0);
        });
    }
}

class C extends A {

    constructor() {
        super();
    }

    public msg(): void {
        super.msg();
        console.log("C");
    }
}

class D extends B {

    private __number;
    public get num(): number { return this.__number; };
    public set num(value: number) { this.__number = value; };

    constructor(a: number, b: number, c: number) {
        super(a, b, c);
    }

    public async msg(): Promise<void> {
        await super.msg();
        console.log("D");
    }
}

class Num {
    public async add(a: number, b: number): Promise<number> {
        return a + b;
    }

    public async sub(a: number, b: number): Promise<number> {
        return a - b;
    }

    public async mul(a: number, b: number): Promise<number> {
        return a * b;
    }

    public async div(a: number, b: number): Promise<number> {
        return a / b;
    }
}

class Complex {

    constructor() {
    }

    public async date(): Promise<Date> {
        return new Date();
    }


}

window.onload = async function (): Promise<void> {

    let smc: Ajs.DistributedServices.IServiceManagerConfig = {
        workerUrl: "/js/ajs.wworker.js",
        workerLibraries: ["/js/ajs.lib.js"],
        mainUiThreadServiceContainerName: "main-ui-thread"
    }

    try {

        document.body.innerHTML += "Creating SM...<br />";

        let sm: Ajs.DistributedServices.ServiceManager = new Ajs.DistributedServices.ServiceManager(smc);

        document.body.innerHTML += "Creating TestWorker...<br />";

        await sm.createServiceContainer("TestWorker");

        document.body.innerHTML += "Creating Worker...<br />";

        await sm.createServiceContainer("Worker");

        document.body.innerHTML += "Deploying D to TestWorker...<br />";

        let d1Inst: D = await sm.instantiateService("TestWorker", D, 1, 2, 3);

        document.body.innerHTML += "Deploying C to TestWorker...<br />";

        let c1Inst: C = await sm.instantiateService("TestWorker", C);

        document.body.innerHTML += "Deploying D to Worker...<br />";

        let c2Inst: C = await sm.instantiateService("Worker", C);

        document.body.innerHTML += "Deploying Num to Worker...<br />";

        let num: Num = await sm.instantiateService("Worker", Num);

        document.body.innerHTML += "Deploying Complex to Worker...<br />";

        let complex: Complex = await sm.instantiateService("TestWorker", Complex);

        document.body.innerHTML += "Done<br />";

        console.log(d1Inst);

        document.body.innerHTML += "Performing test calls...<br />";
        await d1Inst.msg();
        await c1Inst.msg();
        await c2Inst.msg();

        let results: number[] = await Promise.all([
            num.add(1, 1),
            num.sub(16, 5),
            num.mul(100, 100),
            num.div(16384, 8)
        ]);

        console.log(results);

        let date: Date = await complex.date();
        console.log(typeof (date));
        console.log(date);

        document.body.innerHTML += "Done<br />";

    } catch (e) {

        document.body.innerHTML += "Error: " + e + "<br />";
        console.error(e);

    }


    /*
    await sm.test("TestWorker");
    */

//}