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

    // ui-runtime (DOM, Core - DI, Workers, LocalStorage, SessionStorage, State manager, Navigation, Routing, Application base class)
    // ui (VDOM, Templating, Translation, View, View Models)
    // data-services (HTTP, WebSockets, IndexedDB)
    // application-services (models)
    // application-helpers (computation)

    export let ajsWorkerInstance: AjsWebWorker = null;

    export class AjsWebWorker implements MessageTransport.ITransportInterface {

        private __transportRecievers: MessageTransport.ITransportRecievers;
        private __initialized: boolean;
        private __initState: number;

        private __worker: DedicatedWorkerGlobalScope;

        constructor(worker: DedicatedWorkerGlobalScope) {

            this.__initialized = false;
            this.__initState = 0;
            this.__worker = worker;
            this.__transportRecievers = {};

            this.__worker.onmessage = (e: MessageEvent) => {
                this.__onMessage(e);
            };

        }

        public registerReceiver(protocol: MessageTransport.Protocol, reciever: MessageTransport.ITransportReciever): void {

            if (!(protocol in this.__transportRecievers)) {
                this.__transportRecievers[protocol] = [];
            }

            this.__transportRecievers[protocol].push(reciever);

        }

        public send(protocol: MessageTransport.Protocol, data: any): void {

            let message: MessageTransport.ITransportMessage = {
                protocol: protocol,
                data: data
            };

            this.__worker.postMessage(message);

        }

        private __onMessage(e: MessageEvent): void {
            if (!this.__initialized) {
                this.__initialize(e.data);
                return;
            };

            if (e.data.protocol === undefined || e.data.data === undefined) {
                throw new Error("Invalid message transport protocol");
            }

            if (e.data.protocol in this.__transportRecievers) {
                for (let reciever of this.__transportRecievers[e.data.protocol]) {
                    reciever(this, e.data.data);
                }
            }

        }

        private __initialize(data: any): void {

            switch (this.__initState) {
                case 0:
                    this.__loadLibraries(data, () => {
                        this.__worker.postMessage("librariesLoaded");
                        this.__initState++;
                    });
                    break;
                case 1:
                    this.__worker.postMessage("initDone");
                    this.__runInitCode(data);
                    this.__initialized = true;
                    break;
                default:
                    throw new Error("Invalid Ajs Web Worker init state");
            }

        }

        private __loadLibraries(libraries: string[], doneCb: () => void): void {

            let loadedLibraries: any = {};

            let loadedCount: number = 0;

            for (let l of libraries) {

                loadedLibraries[l] = null;

                this.__loadLibrary(l, (url: string, code: string) => {
                    loadedLibraries[url] = code;
                    loadedCount++;
                    if (loadedCount === libraries.length) {
                        for (let lib of libraries) {
                            this.__runInitCode(loadedLibraries[lib]);
                        }
                        doneCb();
                    }
                });

            }

        }

        private __runInitCode(code: string): void {
            eval.call(null, code);
        }

        private __loadLibrary(url: string, doneCb: (url: string, code: string) => void): void {

            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open("GET", url);

            xhr.onreadystatechange = (e: Event) => {

                if (xhr.readyState === xhr.DONE) {
                    doneCb(url, xhr.responseText);
                }

            };

            xhr.onerror = (e: ErrorEvent) => {
                console.error("Failed to load library " + url, e);
            };

            xhr.onabort = (e: Event) => {
                console.error("Failed to load library " + url, e);
            };

            xhr.send();

        }

    }

}

if (this.hasOwnProperty("document")) {
    this.document.write("Web worker script can't be started in the main thread!");
} else {
    Ajs.AjsWebWorker.ajsWorkerInstance = new Ajs.AjsWebWorker.AjsWebWorker(this);
}
