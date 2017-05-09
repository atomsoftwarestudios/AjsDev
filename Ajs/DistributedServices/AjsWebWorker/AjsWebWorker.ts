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

namespace Ajs.AjsWebWorker {

    "use strict";

    // this is just to make possible to write the init worker code to function
    export let ajsWorkerInstance: AjsWebWorker = null;

    export class AjsWebWorker extends MessageTransport.TransportInterface {

        private __initialized: boolean;
        private __initState: number;

        private __worker: Worker;
        private __workerLibraries: string[];
        private __workerInitCode: string;

        constructor(workerScriptUrl: string, workerLibraries: string[], initCode: Function) {
            super();

            this.__initialized = false;
            this.__initState = 0;
            this.__workerLibraries = workerLibraries;
            this.__workerInitCode = this.__getFunctionCode(initCode);

            this.__worker = new Worker(workerScriptUrl);
            this.__worker.addEventListener("message", (event: MessageEvent) => { this._receive(event); });

            this.__initialize();
        }

        /**
         * Receives the message from the web worker thread, converts it to TransportMessage and pass it to be processed
         * @param event MessageEvent received from the web worker
         */
        protected _receive(event: MessageEvent): void {

            if (!this.__initialized) {
                this.__initialize(event);
                return;
            }

            this._onReceived(event.data);

        }

        /**
         * Sends a data to web worker
         * @param message Data to be sent
         */
        protected _send(message: MessageTransport.ITransportMessage): void {

            if (!this.__initialized) {
                throw new AjsWorkerNotInitializedException();
            }

            this.__worker.postMessage(message);

        }

        private __initialize(event?: MessageEvent): void {

            switch (this.__initState) {
                case 0:
                    this.__worker.postMessage(this.__workerLibraries);
                    this.__initState++;
                    break;

                case 1:
                    if (event === undefined || event.data === undefined || event.data !== "librariesLoaded") {
                        throw new UnexpectedAjsWorkerInitializationResponseException();
                    }
                    this.__worker.postMessage(this.__workerInitCode);
                    this.__initState++;
                    break;

                case 2:
                    this.__initialized = true;
                    if (event === undefined || event.data === undefined || event.data !== "initDone") {
                        throw new UnexpectedAjsWorkerInitializationResponseException();
                    }
                    break;

                default:
                    throw new InvalidAjsWorkerInitializationStateException();
            }

        }

        private __getFunctionCode(fn: Function): string {
            let code: string = fn.toString();
            code = code.substr(code.indexOf("{") + 1);
            code = code.substr(0, code.lastIndexOf("}") - 1);
            return code;
        }


    }



}
