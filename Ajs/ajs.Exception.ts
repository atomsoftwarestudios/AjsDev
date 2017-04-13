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
 * Exception class for better exception handling
 */
namespace ajs {

    "use strict";

    export class IStackInfo {
        caller: string;
        file: string;
        line: number;
        character: number;
        child: IStackInfo;
        parent: IStackInfo;
    }

    export class Exception {

        protected _parentException: Exception;
        public get parentException(): Exception { return this._parentException; }

        protected _name: string;
        public get name(): string { return this._name; }

        protected _message: string;
        public get message(): string { return this._message; }

        protected _stack: IStackInfo;
        public get stack(): IStackInfo { return this._stack; }

        public static throwAsync(exception: Exception): void {
            setTimeout(() => {
                throw exception;
            }, 0);

        }

        public constructor(messageOrParentException?: string | Exception | Error, parentException?: Exception | Error) {

            try {
                throw new Error("Error");
            } catch (e) {
                this._stack = this._getStack(e);
            }

            if (this._stack !== null) {

                this._name = this._stack.caller;

                if (this._stack.child !== null) {
                    this._stack = this._stack.child;
                }

            }

            this._parentException = null;

            if (parentException) {

                if (parentException instanceof Exception) {
                    this._parentException = parentException;
                }

                if (parentException instanceof Error) {
                    let exception: Exception = new Exception(parentException.name);
                    exception._name = parentException.name;
                    exception._message = parentException.message;
                    exception._stack = this._getStack(parentException);
                    this._parentException = exception;
                }

            } else {
                if (messageOrParentException instanceof Exception) {
                    this._parentException = messageOrParentException;
                }

                if (messageOrParentException instanceof Error) {
                    let exception: Exception = new Exception(messageOrParentException.name);
                    exception._name = messageOrParentException.name;
                    exception._message = messageOrParentException.message;
                    exception._stack = this._getStack(messageOrParentException);
                    this._parentException = exception;
                }
            }

            if (typeof (messageOrParentException) === "string") {
                this._message = messageOrParentException;
            }

        }

        protected _getStack(e: Error): IStackInfo {

            // no stack information
            if (e.stack === undefined) {
                return this._getUnknownStackInfo();
            }

            // ie10, ie11, edge, chrome, opera, safari
            let m: RegExpMatchArray;

            m = e.stack.match(/at /gm);
            if (m !== null && m.length > 0) {
                return this._getDefaultStackInfo(e.stack);
            }

            // firefox
            m = e.stack.match(/\@http/gm);
            if (m !== null && m.length > 0) {
                return this._getFirefoxStackInfo(e.stack);
            }

            return this._getUnknownStackInfo();
        }

        protected _getUnknownStackInfo(): IStackInfo {
            return {
                caller: "unknown",
                file: "unknown",
                line: -1,
                character: -1,
                parent: null,
                child: null
            };
        }

        protected _getDefaultStackInfo(stack: string): IStackInfo {

            let stackInfo: IStackInfo = null;
            let lastStackInfo: IStackInfo = null;

            let calls: string[] = stack.split("\n");

            for (let call of calls) {
                if (call.indexOf("at") !== -1) {
                    let split1: string[] = call.trim().replace(")", "").substr(3).split("(");
                    if (split1.length === 1) {
                        split1 = ["anonymous", split1[0]];
                    }
                    let split2: string[] = split1[1].split(":");

                    let si: IStackInfo = {
                        caller: split1[0].trim(),
                        file: (split2[0] + ":" + split2[1]).trim(),
                        line: parseInt(split2[2], 10),
                        character: parseInt(split2[3], 10),
                        child: null,
                        parent: lastStackInfo
                    };

                    if (lastStackInfo !== null) {
                        lastStackInfo.child = si;
                    }

                    lastStackInfo = si;

                    if (stackInfo === null) {
                        stackInfo = lastStackInfo;
                    }
                }
            }

            if (stackInfo === null) {
                return this._getUnknownStackInfo();
            } else {
                return stackInfo;
            }
        }

        protected _getFirefoxStackInfo(stack: string): IStackInfo {

            let stackInfo: IStackInfo = null;
            let lastStackInfo: IStackInfo = null;

            let calls: string[] = stack.split("\n");

            for (let call of calls) {
                if (call.indexOf("@") !== -1) {
                    let split1: string[] = call.split("@");
                    let split2: string[] = split1[1].split(":");

                    let si: IStackInfo = {
                        caller: split1[0].trim(),
                        file: (split2[0] + ":" + split2[1]).trim(),
                        line: parseInt(split2[2], 10),
                        character: parseInt(split2[3], 10),
                        child: null,
                        parent: lastStackInfo
                    };

                    if (lastStackInfo !== null) {
                        lastStackInfo.child = si;
                    }

                    lastStackInfo = si;

                    if (stackInfo === null) {
                        stackInfo = lastStackInfo;
                    }
                }
            }

            if (stackInfo === null) {
                return this._getUnknownStackInfo();
            } else {
                return stackInfo;
            }
        }


    }

}
