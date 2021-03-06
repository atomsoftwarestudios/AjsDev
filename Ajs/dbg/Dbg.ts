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

///<reference path="Console.ts" />
///<reference path="modules/logger/Logger.ts" />

namespace Ajs.Dbg {

    "use strict";

    let logger: Modules.Logger.ILogger = null;

    export enum LogType {
        Enter,
        Exit,
        Constructor,
        Info,
        Warning,
        Error,
        DomAddListener,
        DomRemoveListener,
        DomAppendChild,
        DomRemoveChild,
        DomReplaceChild
    }

    export function log(type: LogType, level: number, module: string, object: any, message?: string, ...data: any[]): void {

        if (logger === null) {
            return;
        }

        if (logger !== null) {
            if (message) {
                if (data instanceof Array) {
                    logger.log(type, level, module, object, message, data);
                } else {
                    logger.log(type, level, module, object, message);
                }
            } else {
                logger.log(type, level, module, object);
            }
        }

    }

    export async function initialize(container: Ajs.DI.IContainer): Promise<void> {

        logger = await container.resolve<Modules.Logger.ILogger>(Modules.Logger.IILogger, false);

    }


}
