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

namespace Ajs.MVVM.Model {

    "use strict";

    export interface ICPModelParameters {
        container: DI.IContainer;
    }

    export class Model implements IModel {

        private __container: DI.IContainer;

        private __initialized: boolean;
        protected _initialized(): boolean { return this.__initialized; }

        public constructor(container: DI.IContainer) {
            this.__initialized = false;
            this.__container = container;
        }

        public initialize(): Promise<void> {
            if (!this.__initialized) {
                return this.__initialize();
            }
        }

        public release(): void {
            this.__release();
        }

        protected _onInitialize(): Promise<any> {
            return Promise.resolve();
        }

        protected _onInitialized(): void {
            return;
        }

        protected _onFinalize(): void {
            return;
        }

        protected _checkInitialized(exception: Exception, callForward: Function): void {
            this.__checkInitialized(exception, callForward);
        }

        protected _waitInitialized(timeout: number): Promise<void> {

            const timeStep: number = 250;

            return new Promise<void>(

                (resolve: () => void, reject: (reason: any) => void) => {

                    let elapsed: number = 0;
                    let w: Function;

                    function wait() {

                        if (this.__initialized) {
                            resolve();
                        } else {
                            elapsed += timeStep;
                            if (elapsed > timeout) {
                                reject(new InitializationTimeoutException());
                            }
                            setTimeout(() => w(), timeStep);
                        }
                    }

                    w = wait.bind(this);
                    w();

                }
            );
        }

        private __initialize(): Promise<void> {
            let promise: Promise<void> = new Promise<void>(
                (resolve: () => void) => {
                    this._onInitialize()
                        .then(() => {
                            this.__initialized = true;
                            this._onInitialized();
                            resolve();
                        });
                });
            return promise;
        }

        private __destroy(): void {
            this._onFinalize();
        }

        private __release(): void {
            if (this.__container.releaseScopedInstanceReference(this)) {
                this.__destroy();
            }
        }

        /**
         * This helper can be used to call specific method once the component is initialized
         * @param exception Exception to be thrown when timeout occurs
         * @param callForward Method to be called when initialization is done
         * @param param Parameter to be passed to the method
         */
        private __checkInitialized(exception: Exception, callForward: Function): void {
            if (!this.__initialized) {
                // if not initialized, wait for it up to 20 seconds (80 x 250ms)
                let timeout: number = 80;
                let w8timer: number = setInterval(
                    () => {
                        // if loaded, get menu and notify about it
                        if (this.__initialized) {
                            clearInterval(w8timer);
                            callForward();
                            // otherwise check if we are timeouted
                        } else {
                            timeout--;
                            if (timeout <= 0) {
                                clearInterval(w8timer);
                                throw exception;
                            }
                        }
                }, 250);
            } else {
                callForward();
            }

        }

    }

}
