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

namespace Ajs.App {

    "use strict";

    /**
     * IApplication interface unique identifier usefull for the dependency container configuration
     * As the application is registered automatically using the #see [@Ajs.application]{Ajs.App.application}
     * factory this is not used at this time.
     */
    export const IIApplication: IApplication = DI.II;

    /**
     * Provides interface to the application. This interface is used from the framework side.
     * <p>
     * Every application must derive the Ajs.Application class or implement the IApplication interface
     * in order to be possible to manage it by the framework
     * </p>
     */
    export interface IApplication {

        /**
         * Called automatically when application instance is resolved in DI
         * <p>
         * If the Ajs.App.Application is inherited it automatically calls the #see [onConfigure]{Ajs.App.Application._onConfigure}
         * method which can be overriden to configure application dependency graph and perform other configration tasks, such
         * as loading of initial application resources. If the application is supposed to be accesible offline all offline related
         * resources should be loaded and here (templates, images, stylesheets) and offline data as soon as possible by the
         * model.
         * </p>
         * <p>
         * Once the application is configured the asynchronous overridable initialization method
         * #see [onInitialize]{Ajs.App.Application._onInitialize} is called to perform additional application initialization tasks.
         * </p>
         */
        initialize(): Promise<any>;

        /**
         * Called during boot to start the application when it is fully configured and initialized
         * <p>
         * Tasks as loading resources (such as additional code, configuration, templates, stylesheets) should be
         * performed during execution of this method. In the end, simulation of the Navigate event should be called
         * in order to start doing something useful.
         * <p>
         */
        run(): void;
    }

}
