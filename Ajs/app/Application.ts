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

/**
 * Contains base classes for the Ajs Application, application configuration and exceptions.
 * <p>The Application class has to be derived by the user code to initialize the
 * application, load necessary resources and setup routes.</p>
 * <p>The derived application class is construced and initialized during the
 * framework boot process. The boot manager calls the framework to instantiate,
 * configure and initialize the application.</p>
 * <p>As the application initialization can be an asynchronous process (resources
 * could be loading and additional user tasks can be done during the initialization)
 * so it is necessary to call the _initDone method once the initialization is completed.</p>
 * #example [Application Initialization Example]{/app_init.ts}
 *
 */
namespace Ajs.App {

    "use strict";

     /**
     * Provides methods to configure the application, framework, application and framework services and resources to be loaded
     * <p>
     * The class should be inherited by the user application class.
     * </p>
     * <p>
     * The application class has methods to be called from the framework boot loader:
     * <ul>
     * <li>#see [configure]{Ajs.App.Application.configure} allow application to configure subsystems to be ready to serve user requests</li>
     * <li>#see [initialize]{Ajs.App.Application.initialize} allow to perform additional initialization tasks (currently it does not do anyhing)</li>
     * <li>#see [run]{Ajs.App.Application.run} loads configured resources and templates and starts the application</li>
     * </ul>
     * </p>
     * <p>
     * Methods which can be overriden by the custom application:
     * <ul>
     * <li>#see [_onError]{Ajs.App.Application._onError} allows application to configure handle unhandled exceptions in the way it needs
     * (i.e. sending reports to server, restarting the app and so on). By default, the Framework error handler is provided to display
     * errors on the user-defined error screen. If the error screen is not available the separate DIV element is added to the document for
     * such purposes. For more details reffer to error handling guides.
     * </li>
     * <li>#see [_onConfigure]{Ajs.App.Application._onConfigure} allows application to configure both, framework and application services and
     * to configure resources and templates to be loaded before the application will be started</li>
     * <li>#see [_onInitialize]{Ajs.App.Application._onInitialize} allows to perform any additional, unspecified taks, such as initialize
     * configured services</li>
     * <li>#see [_onFinalize]{Ajs.App.Application._onInitialize} allows to perform custom action, such as storing the data to session/local
     * store, show warning dialog, free resources when user is navigating out of the page or is closing the window. This method is initiated
     * by the browser with the 'onbeforeunload' event</li>
     * </ul>
     * </p>
     * <h4>Examples</h4>
     * TBD
     */
    export class Application<T> implements IApplication {

        /** Stores reference to #see [dependency injection container]{Ajs.DI.IContainer} */
        private __container: DI.IContainer;
        /** Stores reference to the #see [resource manager]{Ajs.Resources.IResourceManager} */
        private __resourceManager: Resources.IResourceManager;
        /** Stores reference to the #see [template manager]{Ajs.Templating.ITemplateManager} */
        private __templateManager: Templating.ITemplateManager;
        /** Stores reference to the #see [navigator]{Ajs.Navigation.INavigator} */
        private __navigator: Navigation.INavigator;
        /** Stores reference to the #see [router]{Ajs.Routing.IRouter} */
        private __router: Routing.IRouter;
        /** Stores reference to the #see [view component manager]{Ajs.MVVM.ViewModel.IViewComponentManager} */
        private __viewComponentManager: MVVM.ViewModel.IViewComponentManager;

        /** Stores list of resources to be loaded before the application starts #see [IResourceLists]{Ajs.App.IResourceLists} for details */
        private __resources: IResourceLists;
        /** Stores list of templates to be loaded before the application starts #see [IResourceLists]{Ajs.App.IResourceLists} for details */
        private __templates: IResourceLists;

        /** Stores the preference for loading resources and templates. See #see [LOADING_PREFERENCE]{Ajs.Resources.LoadingPreference} for details */
        protected _resourcesLoadingPreference: Resources.LoadingPreference;

        /** Stores the configuration passed to the application from the boot config */
        private __config: T;
        /** Makes the application configuration available to inherited class */
        protected get _config(): T { return this.__config; }


        /**
         * Constructs the application object, stores the configuration to it and configures necessary event listeners
         * <p>
         * Consturctor is called from DI container. It is requested to be resolved by the boot loader once it
         * configures core Ajs Framework services.
         * </p>
         * @param container instance of #see [dependency injection container]{Ajs.DI.IContainer}
         * @param resourceManager instance of #see [resource manager]{Ajs.Resources.IResourceManager}
         * @param templateManager instance of #see [template manager]{Ajs.Templating.ITemplateManager}
         * @param navigator instance of #see [navigator]{Ajs.Navigation.INavigator}
         * @param viewComponentManager  instance of #see [view component manager]{Ajs.MVVM.ViewModel.IViewComponentManager}
         * @param config Application configuration object
         */
        public constructor(
            container: DI.IContainer,
            resourceManager: Resources.IResourceManager,
            templateManager: Templating.TemplateManager,
            navigator: Navigation.INavigator,
            router: Routing.IRouter,
            viewComponentManager: MVVM.ViewModel.IViewComponentManager,
            config: T) {

            this.__container = container;
            this.__resourceManager = resourceManager;
            this.__templateManager = templateManager;
            this.__navigator = navigator;
            this.__router = router;
            this.__viewComponentManager = viewComponentManager;
            this.__config = config;

            this.__resources = {};
            this.__templates = {};

            if (config.hasOwnProperty("resourcesLoadingPreference")) {
                this._resourcesLoadingPreference = (<any>config).resourcesLoadingPreference;
            } else {
                this._resourcesLoadingPreference = Resources.LoadingPreference.Server;
            }

            window.addEventListener("error", (e: ErrorEvent) => this._onError(e));
            window.addEventListener("beforeunload", (e: Event) => this.__finalize(e));
        }

        /**
         * Called from boot to allow application developers to perform custom initialization of the application
         * <p><strong>DON'T OVERRIDE! Should be Considered as a final method.</strong></p>
         * <p>If custom application initialization is required by the #see [_onInitialize]{Ajs.App.Application._onInitialize}
         * method should to be overriden in inherited application class.</p>
         * </p>
         */
        public async initialize(): Promise<any> {

            this._onConfigure(
                this.__container,
                this.__resources,
                this.__templates,
                this.__navigator.redirections,
                this.__router.routes,
                this.__viewComponentManager);

            return this._onInitialize();
        }

        /**
         * Starts the application
         * <p><strong>DON'T OVERRIDE! Should be Considered as a final method.</strong></p>
         * <p>
         * The run function takes care of loading of configured resources and templates then it
         * calls the navigator to simulate the navigation to the current page occured (it actually
         * occured few moments ago), then navigator calls the router to load appropriate root view
         * component for the current URL
         * <p>
         * @throws NotInitializedException Thrown when _run is called but the application was not
         *                                 initialized by calling the _initDone method
         */
        public async run(): Promise<void> {

            await Promise.all([
                this.__loadResources(),
                this.__loadTemplates()
            ]);

            this.__navigator.canNavigate = true;
            this.__navigator.navigated();

        }


        /**
         * Handles unhandled exceptions on the application level
         * <p>This handler can be overriden in the inherited application class to perform custom
         * unhanlded exceptions handling (i.e. logging to console or sending exceptions to the
         * server). By default, the #see [Ajs utility error handler]{Ajs.Utils.errorHandler} is used.
         * </p>
         * @param e ErrorEvent or ajs.Exception to be handled
         */
        protected _onError(e: ErrorEvent | Exception): void {
            Ajs.Utils.errorHandler(e);
        }

        /**
         * Can be overriden in inherited application class to configure services and resources the application will use
         * <p>
         * During the application configuration phase the application should register all framework and application services
         * it will be using to the DI container and configure view component dependencies. As view components can't be
         * designed and developed as injectable DI services it is neccessary to perform this task separately using the
         * #see[View Component Manager]{Ajs.MVVM.ViewModel.ViewComponentManager].
         * </p>
         * <p>
         * Example:
         * </p>
         * @param container Instance of #see[dependency injection container]{ Ajs.DI.IContainer }
         * @param resources List of resources to be loaded before the application starts #see [IResourceLists]{Ajs.App.IResourceLists} for details
         * @param templates List of templates to be loaded before the application starts #see [IResourceLists]{Ajs.App.IResourceLists} for details
         * @param viewComponentManager Instance of #see[view component manager]{ Ajs.MVVM.ViewModel.IViewComponentManager }
         */
        protected _onConfigure(
            container: DI.IContainer,
            resources: IResourceLists,
            templates: IResourceLists,
            redirections: Navigation.IRedirection[],
            routes: Routing.IRoutes[],
            viewComponentManager: MVVM.ViewModel.IViewComponentManager): void {

            return;

        }

        /**
         * Called during the boot sequence to allow customizable initialization of the application
         * <p>
         * Customized initialization of the application. At this time, no initialization tasks are
         * performed by the framework. As initialization tasks could be asynchronous the Promise must be
         * returned and resolved when the initialization tasks will be done.
         * <p>
         * <h5>Application initialization example</h5>
         * <pre><code>// "synchronous" initialization
         * protected _onInitialize(): Promise&lt;any&gt; {
         *    this.__appStartTime = new Date();
         *    return Promise.resolve();
         * }
         *
         * // asynchronous initialization
         * protected _onInitialize(): Promise&lt;any&gt; {
         *    retrun new Promise&lt;void&gt;(
         *       (resolve: () => void, reject: (reason: any) => void) => {
         *          setTimeout(() => { resolve; }, 2000);
         *       }
         *    );
         * }
         * </code></pre>
         * @returns Promise indicating the asynchronous initialization is done
         */
        protected _onInitialize(): Promise<any> {
            return Promise.resolve();
        }

        /**
         * Called when the window is closing or if user is navigfating out of the page or if user is reloading the page.
         * At this point, actions related to releasing used resources or freeing a memory should be in
         * case of desktop application. Hovewer, it is not reqiured in case of web application. This method can
         * be overriden in order to store some data to the session/local stores, show warning dialog, free
         * resources, whatever. To show warning message set the e.returnValue to "\o/", e.preventDefault to true
         * and return the "\o/" string value rom the function.
         * #See [MDN - beforeunload]{https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload} for more
         * details.
         * @param e Updated onbeforeunload event object
         * @returns Return void if no dialog should be shown, otherwise return "\o/" string
         */
        protected _onFinalize(e: Event): void | "\o/" {
            return;
        }

        /**
         * Internal "beforeunload" event handler. Just calls the #see[_onFinalize]{Ajs.App.Application._onFinalize} to take app developer defined actions
         * @param e Updated onbeforeunload event object
         * @returns Return void if no dialog should be shown, otherwise return "\o/" string
         */
        private __finalize(e: Event): void | string {
            return this._onFinalize(e);
        }

        /**
         * Loads configured resources
         * <p>
         * Resources can be configured by overriding the #see [_onConfigure]{Ajs.App.Application._onConfigure} method.
         * The #see [__resources]{Ajs.App.Application.__resources} property is passed to this function to allow
         * configuration of initial resources the application has to load
         * </p>
         */
        private __loadResources(): Promise<any> {

            let _resourcesLoadingInfo: any[] = [
                this.__resourceManager.getMultipleResources(
                    this.__resources.localPermanent, Resources.StorageType.Local, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.localLastRecentlyUsed, Resources.StorageType.Local, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.sessionPermanent, Resources.StorageType.Session, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.sessionLastRecentlyUsed, Resources.StorageType.Session, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.indexedDbPermanent, Resources.StorageType.IndexedDb, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.indexedDbLastRecentlyUsed, Resources.StorageType.IndexedDb, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.memoryPermanent, Resources.StorageType.Memory, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.memoryLastRecentlyUsed, Resources.StorageType.Memory, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__resourceManager.getMultipleResources(
                    this.__resources.direct, undefined, undefined)
            ];

            return Promise.all(_resourcesLoadingInfo)
                .catch((reason: Exception) => {
                    throw new FailedToLoadApplicationResourcesException(reason);
                });
        }

        /**
         * Loads configured templates
         * <p>
         * Resources can be configured by overriding the #see [_onConfigure]{Ajs.App.Application._onConfigure} method.
         * The #see [__templates]{Ajs.App.Application.__templates} property is passed to this function to allow
         * configuration of initial templates the application has to load
         * </p>
         */
        private __loadTemplates(): Promise<any> {
            let _resourcesLoadingInfo: any[] = [
                this.__templateManager.loadTemplates(
                    this.__templates.localPermanent, Resources.StorageType.Local, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.localLastRecentlyUsed, Resources.StorageType.Local, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.sessionPermanent, Resources.StorageType.Session, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.sessionLastRecentlyUsed, Resources.StorageType.Session, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.indexedDbPermanent, Resources.StorageType.IndexedDb, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.indexedDbLastRecentlyUsed, Resources.StorageType.IndexedDb, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.memoryPermanent, Resources.StorageType.Memory, Resources.CachePolicy.Permanent,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.memoryLastRecentlyUsed, Resources.StorageType.Memory, Resources.CachePolicy.LastRecentlyUsed,
                    this._resourcesLoadingPreference),
                this.__templateManager.loadTemplates(
                    this.__templates.direct, undefined, undefined)
            ];

            return Promise.all(_resourcesLoadingInfo)
                .catch((reason: Exception) => {
                    throw new FailedToLoadApplicationTemplatesException(reason);
                });
        }


    }

}
