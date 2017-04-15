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
 * The top level Ajs Framework namespace
 * Contains the static Framework class, Framework exceptions and Ajs
 * configuration template
 */
namespace Ajs {

    "use strict";

    /**
     * Ajs framework class provides the complete framework functionality.
     * Initialization is called automatically from the ajs boot when the
     * window.onload event is fired. The framework, based on the boot configuration
     * file, initializes the user application class inherited from the ajs.app.Application
     * and starts it.
     */
    export class Framework {

        /** Stores the framework configuration loaded during the index.html load */
        protected static _config: Ajs.IAjsConfig;
        /** Returns the framework configuration object */
        public static get config(): Ajs.IAjsConfig { return Framework._config; }

        /** Stores the application configuration */
        protected static _appConfig: Ajs.App.IApplicationInfo;
        /** Returns the application configuration */
        public static get appConfig(): Ajs.App.IApplicationInfo { return Framework._appConfig; }

        /** Stores the application object automatically instantiated from the constructor passed in the configuration */
        protected static _application: Ajs.App.Application;
        /** Returns the application object */
        public static get application(): Ajs.App.Application { return Framework._application; }

        /** Stores the ResourceManager object instantiated automatically during the framework intitialization */
        protected static _resourceManager: Ajs.Resources.ResourceManager;
        /** Returns the ResourceManager object */
        public static get resourceManager(): Ajs.Resources.ResourceManager { return Framework._resourceManager; }

        /** Stores the StateManager object instantiated automatically during the framework intitialization */
        protected static _stateManager: Ajs.State.StateManager;
        /** Returns the StateManager object */
        public static get stateManager(): Ajs.State.StateManager { return Framework._stateManager; }

        /** Stores the ResourceManager object instantiated automatically during the framework intitialization */
        protected static _router: Ajs.Routing.Router;
        /** Returns the ResourceManager object */
        public static get router(): Ajs.Routing.Router { return Framework._router; }

        /** Stores the Navigator object instantiated automatically during the framework intitialization */
        protected static _navigator: Ajs.Navigation.Navigator;
        /** Returns the Navigator object */
        public static get navigator(): Ajs.Navigation.Navigator { return Framework._navigator; }

        /** Stores the ViewComponentManager object instantiated automatically during the framework intitialization */
        protected static _viewComponentManager: Ajs.MVVM.ViewModel.ViewComponentManager;
        /** Returns the ViewComponentManager object */
        public static get viewComponentManager(): Ajs.MVVM.ViewModel.ViewComponentManager { return Framework._viewComponentManager; }

        /** Stores the TemplateManager object instantiated automatically during the framework intitialization */
        protected static _templateManager: Ajs.Templating.TemplateManager;
        /** Returns the TemplateManager object */
        public static get templateManager(): Ajs.Templating.TemplateManager { return Framework._templateManager; }

        /** Stores the ModelManager object instantiated automatically during the framework initialization */
        protected static _modelManager: Ajs.MVVM.Model.ModelManager;
        /** Returns the ModuleManager object */
        public static get modelManager(): Ajs.MVVM.Model.ModelManager { return Framework._modelManager; }

        /** Stores the View object instantiated automatically during the framework intitialization */
        protected static _view: Ajs.MVVM.View.View;
        /** Returns the View object */
        public static get view(): Ajs.MVVM.View.View { return Framework._view; }

        /** Basic framework initialization is called automatically from the boot when window.onload event occurs */
        public static initialize(config: IAjsConfig): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs", this);

            // setup framework level error handler - active until the application is created
            window.addEventListener("error", <any>this._errorHandler);

            // store config locally
            Framework._config = config;

            // basic initialization
            Framework._appConfig = null;
            Framework._application = null;

            // create framework components
            Framework._resourceManager = new Ajs.Resources.ResourceManager(config.resourceManager);
            Framework._stateManager = new Ajs.State.StateManager(Framework._resourceManager);
            Framework._templateManager = new Ajs.Templating.TemplateManager(Framework._resourceManager);
            Framework._viewComponentManager = new Ajs.MVVM.ViewModel.ViewComponentManager(Framework._templateManager);
            Framework._modelManager = new Ajs.MVVM.Model.ModelManager();
            Framework._view = new Ajs.MVVM.View.View(Framework._viewComponentManager, config.view);
            Framework._router = new Ajs.Routing.Router(Framework._view, Framework._config.router);
            Framework._navigator = new Ajs.Navigation.Navigator(Framework._router, Framework._config.navigator);

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs", this);
        }

        /**
         * Configures the ajs application before it is instanced
         * Called automatically from boot when window.onload event occurs
         * @param config Application configuration file
         */
        public static configureApplication(config: Ajs.App.IApplicationInfo): void {
            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs", this, "Configuring application");

            Framework._appConfig = config;

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs", this);
        }

        /**
         * Instantiates and initializes the user application and start it.
         * Called automatically from boot when window.onload event occurs
         * @throws ApplicationNotConfiguredException Thrown when the start is called before the application is configured
         * @throws AppConstructorMustBeAFunctionException Thrown when the passed application constructor is not a function
         */
        public static start(): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs", this, "Frameowrk is starting the application");

            if (Framework._appConfig === undefined || Framework._appConfig === null) {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs", this, "Application not configured");
                throw new ApplicationNotConfiguredException();
            }

            if (typeof (Framework._appConfig.appConstructor) === typeof (Function)) {
                Framework._application = new (<any>Framework._appConfig.appConstructor)(Framework._appConfig.config);
                window.removeEventListener("error", <any>this._errorHandler);
                Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs", this, "Initializing the application");
                Framework._application.initialize();
            } else {
                Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs", this, "Application constructor is not a function!");
                throw new AppConstructorMustBeAFunctionException();
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs", this);
        }

        /**
         * Handles unhandled exceptions on the framework level
         * <p>The framework error handler is active after the boot stage and before the
         * application class instatniation. During the boot stage the boot level
         * error handler is active and after the application class instantiation the
         * application level error handler (which can be overriden to hanlde unhandled errors
         * to fit developer needs and requirements) is active.<p>
         * @param e ErrorEvent or ajs.Exception to be handled
         */
        protected static _errorHandler(e: ErrorEvent | Exception): void {
            Ajs.Utils.errorHandler(e);
        }



    }
}
