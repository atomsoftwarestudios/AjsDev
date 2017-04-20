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
     * Application decorator factory
     * <p>
     * Class which is implementing the application must be inherited from #see [Ajs.App.Application]{Ajs.App.Application}
     * class or must implement the #see [IApplication]{Ajs.App.IApplication} interface and must be decorated with the @Ajs.application()
     * decorator which is actually alias for Ajs.App.application decorator factory function. Application
     * must be decorated in order the Framework (boot loader) can locate, configure and start it.
     * For more details reffer to boot process articles.
     * </p>
     * <p>
     * Only single decorated application class can exist in the program.
     * </p>
     * @returns Returns decorator function which registers the Application class to the Ajs framework for instancing
     */
    export function application(): Function {

        return function (target: any): void {

            if (Ajs.bootConfig.applicationConstructor === undefined) {
                Ajs.bootConfig.applicationConstructor = target;
            } else {
                throw new OnlyOneApplicationIsAllowedException();
            }

        };

    }

}
