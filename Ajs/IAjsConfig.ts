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

namespace Ajs {

    "use strict";

    /** Interface for the Ajs Framework configuration object */
    export interface IAjsConfig {

        /**
         * Configuration of the debugging console and its modules
         * If ommited, no debugging will be performed
         */
        debugging?: {
            enabled: boolean;
            console: Ajs.Dbg.IConsoleConfig;
            modules: {
                logger: Ajs.Dbg.Modules.Logger.ILoggerConfig;
            }
        };
        
        /**
         * Name of the indexed db used internally within the Ajs
         * Ajs can use the IndexedDb feature to store resources as it is less limited on the size
         * compared to local / session storages
         */
        indexedDbName?: string;

        /**
         * Configuration of the resource manager
         * For additional details #see {ajs.resources.IResourceManagerConfig}
         */
        resourceManager?: Ajs.Resources.IResourceManagerConfig;

        /**
         * Redirections configuration
         * For additional details #see {ajs.navigation.IRedirection}
         */
        redirections?: Ajs.Navigation.IRedirection[];

        /**
         * Routes configuration
         * For additional details #see {ajs.routing.IRoutes}
         */
        routes?: Ajs.Routing.IRoutes[];

        /**
         * Render target configuration
         * Configuration of the element which will be used as a view render target
         */
        renderTarget?: Element;
    }

}
