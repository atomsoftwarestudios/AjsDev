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

namespace Ajs.RMI {

    "use strict";

    export const RMI_ROUTER: number = 0;

    export class RMIEndpoint {

        private __initialized: boolean;

        private __registrationWaiters: {
            resolver: () => void;
            rejector: (reason: any) => void;
        }[];

        private __transport: MessageTransport.ITransportInterface;

        private __endPointId: number;
        public get endPointId(): number { return this.__endPointId; }

        private __nextCallId: number;

        private __callPromises: IRMICallPromises;

        private __service: any;

        private __send: (protocol: MessageTransport.Protocol, data: IRMIMessage) => void;

        constructor(transport: MessageTransport.ITransportInterface, service: any) {

            this.__initialized = false;
            this.__transport = transport;
            this.__nextCallId = 0;
            this.__endPointId = Math.floor(Math.random() * (9999999 - 1000000)) + 1000000;
            this.__callPromises = {};
            this.__send = transport.send;
            this.__service = service;
            this.__registrationWaiters = [];

            this.__transport.registerReceiver(
                MessageTransport.Protocol.AjsRMI,
                (iface: MessageTransport.ITransportInterface, data: any): void => { this.__processMessage(data); }
            );

            this.__registerRmiEndpoint();
        }

        /**
         * Returns a promise which is resolved at the time the RMI endpoint is initialized and registered with the RMI router
         */
        public waitRegistered(): Promise<void> {

            if (this.__initialized) {
                return Promise.resolve();
            }

            return new Promise<void>(
                (resolve: () => void, reject: (reason: any) => void) => {
                    this.__registrationWaiters.push({
                        resolver: resolve,
                        rejector: reject
                    });
                }
            );

        }

        /**
         * Performs a method call over the RMI bus and returns a promise to be resolved or rejected once the method will return an error or a return value
         * @param target RMI endpoint (usually service)
         * @param method Method name to execute
         * @param args Method arguments
         */
        public makeCall(target: number, method: string, ...args: any[]): Promise<any> {

            if (!this.__initialized && target !== RMI_ROUTER) {
                console.log("EP-EPNotInit");
                throw new RMIEndpointNotInitializedException();
            }

            return new Promise<any>(
                (resolve: (value: any) => void, reject: (reason: any) => void) => {

                    let callId: number = this.__getNextCallId();

                    this.__callPromises[callId] = {
                        resolver: resolve,
                        rejector: reject
                    };

                    let rmiCall: IRMICall = {
                        callId: callId,
                        method: method,
                        args: args
                    };

                    this.__sendRMIMessage(target, RmiMessageType.Call, rmiCall);

                }
            );

        }

        /**
         * Performs a method call over the RMI bud but don't returns a promise such as in case of the call
         */
        public notify(target: number, method: string, ...args: any[]): void {

            let rmiNotify: IRMINotify = {
                method: method,
                args: args
            };

            this.__sendRMIMessage(target, RmiMessageType.Notify, rmiNotify);

        }

        /**
         * Registers endpoint within the RMI message router and updates initial endpoint ID value
         */
        private async __registerRmiEndpoint(): Promise<void> {
            this.__endPointId = await this.makeCall(RMI_ROUTER, "registerRmiEndpoint");
            this.__initialized = true;
            this.__confirmRmiEndpointRegistration();

            for (let waiter of this.__registrationWaiters) {
                waiter.resolver();
            }
            this.__registrationWaiters = [];
        }

        private async __confirmRmiEndpointRegistration(): Promise<void> {
            this.notify(RMI_ROUTER, "endpointRegistrationConfirmed");
        }

        /**
         * Generates a unique call ID
         */
        private __getNextCallId(): number {
            return this.__nextCallId++;
        }

        /**
         * Sends a return response to the RMI call
         * @param target target RMI endpoint (usually service consumer)
         * @param callId id of the call for which the return value is about to be send
         * @param data return value of the RMI call
         */
        private __returnOk(target: number, callId: number, data: any): void {

            let ret: IRMIReturn = {
                errorCode: 0,
                callId: callId,
                data: data
            };

            this.__sendRMIMessage(target, RmiMessageType.Return, ret);

        }

        /**
         * Sends an error response to the RMI call
         * @param target target RMI endpoint (usually service consumer)
         * @param callId id of the call for which the error value is about to be send
         * @param error reason of the call failure
         */
        private __returnError(target: number, callId: number, errorCode: number, error: any): void {

            let ret: IRMIReturn = {
                errorCode: errorCode,
                callId: callId,
                data: error.toString()
            };

            this.__sendRMIMessage(target, RmiMessageType.Return, ret);

        }

        /**
         * Sends a RMI message over the RMI bus
         * @param target Target RMI enpoint to receive the message
         * @param rmiType Type of the RMI message
         * @param data RMI Call, RMI Notify or RMI Return data
         */
        private __sendRMIMessage(target: number, rmiType: RmiMessageType, data: IRMICall | IRMINotify | IRMIReturn): void {

            let rmiMessage: IRMIMessage = {
                rmiDestinationId: target,
                rmiSourceId: this.__endPointId,
                rmiType: rmiType,
                data: data
            };

            this.__transport.send(MessageTransport.Protocol.AjsRMI, rmiMessage);

        }

        /**
         * Processes the incoming RMI message
         * @param message RMI message incoming over the RMI bus
         */
        private __processMessage(message: IRMIMessage): void {

            if (message.rmiDestinationId !== this.__endPointId) {
                return;
            }

            switch (message.rmiType) {
                case RmiMessageType.Call:
                    this.__processCall(message.rmiSourceId, <IRMICall>message.data);
                    break;
                case RmiMessageType.Notify:
                    this.__processNotify(<IRMINotify>message.data);
                    break;
                case RmiMessageType.Return:
                    this.__processReturn(<IRMIReturn>message.data);
                    break;
                default:
                    console.error("Invalid RMI message type!");
                    break;
            }

        }

        /**
         * Calls the method of the service bound to the current endpoint, waits for result and send it back to caller
         * @param sourceId Id of the sender
         * @param call RMI call data
         */
        private async __processCall(sourceId: number, call: IRMICall): Promise<void> {

            try {

                if (this.__service === undefined || this.__service === null) {
                    console.error("InvalidService");
                    throw new InvalidServiceException();
                }

                if (!(call.method in this.__service) || !(this.__service[call.method] instanceof Function)) {
                    console.error("Invalid method");
                    throw new InvalidServiceMethodException();
                }

                let result: any = await this.__service[call.method].apply(this.__service, call.args);

                this.__returnOk(sourceId, call.callId, result);

            } catch (e) {
                this.__returnError(sourceId, call.callId, -1, e);
            }

        }

        /**
         * Calls the method of the service bound to the current endpoint
         * @param notify RMI notification data
         */
        private __processNotify(notify: IRMINotify): void {

            try {

                if (this.__service === undefined || this.__service === null) {
                    throw new InvalidServiceException();
                }

                if (!(notify.method in this.__service) || !(this.__service instanceof Function)) {
                    throw new InvalidServiceMethodException();
                }

                this.__service[notify.method].apply(this.__service, notify.args);

            } catch (e) {

                console.error(e);

            }

        }

        /**
         * Called when a call issued through this RMI endpoint was processed by remote endpoint and returns a value
         * @param sourceId Id of the enpoint sending the return data
         * @param ret RMI return data
         */
        private __processReturn(ret: IRMIReturn): void {

            if (!(ret.callId in this.__callPromises)) {
                console.error(new InvalidReturnDataException());
                return;
            }

            let callPromise: IRMICallPromise = this.__callPromises[ret.callId];
            delete this.__callPromises[ret.callId];

            if (ret.errorCode === 0) {
                callPromise.resolver(ret.data);
            } else {
                callPromise.rejector(ret.data);
            }

        }

    }

}