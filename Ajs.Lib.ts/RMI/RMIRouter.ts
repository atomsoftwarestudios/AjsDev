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

    export class RMIRouter {

        private __initialized: boolean;
        private __nextEndpointId: number;
        private __routingTable: IRMIRoutingTable;
        private __nextCallId: number;
        private __callPromises: IRMICallPromises;
        private __endpointReadyListeners: IRMIEndpointRegisteredListener[];

        constructor() {
            this.__nextEndpointId = 1;
            this.__nextCallId = 0;
            this.__routingTable = {};
            this.__callPromises = {};
            this.__endpointReadyListeners = [];
            this.__initialized = true;
        }

        public addInterface(iface: MessageTransport.ITransportInterface): void {

            iface.registerReceiver(
                MessageTransport.Protocol.AjsRMI,
                (iface: MessageTransport.ITransportInterface, data: any): void => {
                    this.__routeMessage(iface, data);
                }
            );

        }

        public addEndpointRegisteredListener(listener: IRMIEndpointRegisteredListener): void {
            if (this.__endpointReadyListeners.indexOf(listener) === -1) {
                this.__endpointReadyListeners.push(listener);
            }
        }

        public removeEndpointReegisteredListener(listener: IRMIEndpointRegisteredListener): void {
            if (this.__endpointReadyListeners.indexOf(listener) !== -1) {
                this.__endpointReadyListeners.splice(this.__endpointReadyListeners.indexOf(listener), 1);
            }
        }

        public async registerRmiEndpoint(iface: MessageTransport.ITransportInterface, endpointId: number): Promise<number> {

            // create new enpoint id
            let newEndpointId: number = this.__getNextEndpointId();

            // add it to routing table
            this.__routingTable[newEndpointId] = iface;

            // temporarily register the old, random generated endpoint id from routing table in
            this.__routingTable[endpointId] = iface;

            // return new endpoint id
            return newEndpointId;

        }

        public async endpointRegistrationConfirmed(iface: MessageTransport.ITransportInterface, endpointId: number): Promise<void> {
            // notify he endpoint was registered and registration was confirmed
            for (let l of this.__endpointReadyListeners) {
                l(iface, endpointId);
            }
        }

        /**
         * Performs a method call over the RMI bus and returns a promise to be resolved or rejected once the method will return an error or a return value
         * @param target RMI endpoint (usually service)
         * @param method Method name to execute
         * @param args Method arguments
         */
        public makeCall(target: number, method: string, ...args: any[]): Promise<any> {

            if (!this.__initialized && target !== RMI_ROUTER) {
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

            console.error(error);

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
                rmiSourceId: 0,
                rmiType: rmiType,
                data: data
            };

            this.__routeMessage(null, rmiMessage);

        }

        /**
         * Processes the incoming RMI message
         * @param message RMI message incoming over the RMI bus
         */
        private __processMessage(iface: MessageTransport.ITransportInterface, message: IRMIMessage): void {

            if (message.rmiDestinationId !== 0) {
                return;
            }

            switch (message.rmiType) {
                case RmiMessageType.Call:
                    this.__processCall(iface, message.rmiSourceId, <IRMICall>message.data);
                    break;
                case RmiMessageType.Notify:
                    this.__processNotify(iface, message.rmiSourceId, <IRMINotify>message.data);
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
        private async __processCall(iface: MessageTransport.ITransportInterface, sourceId: number, call: IRMICall): Promise<void> {

            try {

                if (!(call.method in this)) {
                    throw new InvalidServiceMethodException();
                }

                let callArgs: any[] = [iface, sourceId].concat(call.args);
                let result: any = await this[call.method].apply(this, callArgs);

                this.__returnOk(sourceId, call.callId, result);

            } catch (e) {

                this.__returnError(sourceId, call.callId, -1, e);

            }

        }

        /**
         * Calls the method of the service bound to the current endpoint
         * @param notify RMI notification data
         */
        private __processNotify(iface: MessageTransport.ITransportInterface, sourceId: number, notify: IRMINotify): void {

            try {
                if (!(notify.method in this)) {
                    throw new InvalidServiceMethodException();
                }

                let callArgs: any[] = [iface, sourceId].concat(notify.args);
                this[notify.method].apply(this, callArgs);

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

        /**
         * Route the incoming RMI message to the correct endpoint
         * @param message RMI message incoming over the RMI bus
         */
        private __routeMessage(iface: MessageTransport.ITransportInterface, message: IRMIMessage): void {

            if (message.rmiDestinationId === 0) {
                this.__processMessage(iface, message);
                return;
            }

            if (!(message.rmiDestinationId in this.__routingTable)) {
                throw new Error("Failed to locate target RMI endpoint.");
            }

            this.__routingTable[message.rmiDestinationId].send(MessageTransport.Protocol.AjsRMI, message);

            // destination ID's higher than 1000000 are used for registration only.
            // once the registration response is routed back to endpoint it is possible to cleanup the routing table
            if (message.rmiDestinationId >= 1000000) {
                delete this.__routingTable[message.rmiDestinationId];
            }

        }


        private __getNextEndpointId(): number {
            return this.__nextEndpointId++;
        }

    }

}