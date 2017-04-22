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

namespace Ajs.Boot {

    "use strict";

    /**
     * Boot module configuration
     */
    export interface IBootConfig {

        /**
         * Specifies if errors should be shown
         * this configuration option is ignored now
         */
        showErrors: boolean;

        /**
         * Specifies if the offline support is required during the ajs boot
         * If so it can take 500ms the boot process will get started as there is a 500ms fallback
         * which makes sure the application will get started even in case the Application Cache
         * events will not be fired (this happens quiet often)
         */
        offlineSupport: boolean;

        /**
         * Specifies the timeout for how long will be Ajs waiting for app cache event after onLoad event
         * When the specified timeout will be reached the boot will start event without a app cache event
         */
        offlineFallbackTimeout: number;

        /**
         * Specifies the error handler to be registered with window and used during the boot
         */
        errorHandler?: (e: Ajs.Exception | ErrorEvent) => void;
    }

}
