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

namespace Ajs.MessageTransport {

    "use strict";

    export abstract class TransportInterface implements ITransportInterface {

        private __transportRecievers: MessageTransport.ITransportRecievers;

        constructor() {
            this.__transportRecievers = {};
        }

        public registerReceiver(protocol: Protocol, receiver: ITransportReciever): void {

            if (!(protocol in this.__transportRecievers)) {
                this.__transportRecievers[protocol] = [];
            }

            this.__transportRecievers[protocol].push(receiver);

        }

        public send(protocol: Protocol, data: any): void {

            let message: ITransportMessage = {
                protocol: protocol,
                data: data
            };

            this._send(message);
        }

        /**
         * Must be implemented in derived class to receive a message over message transfer channel
         * <p>
         * Overriden _receive must convert the incoming data to ITransportMessage and must call _onReceived
         * method to distribute the received data to receivers.
         * <p>
         * <p>
         * _receive is usually bound directly to some system event listener and converts the data it receives
         * (such as MessageEvent) to the ITransportMessage then it calls _onReceive to distribute the data
         * to all receivers. Receivers should then implement its own protocol to identify endpoints (i.e. as
         * AjsRMI does) and further process the data received.
         * </p>
         * @param args
         */
        protected abstract _receive(...args: any[]): void;

        /**
         * Must be implemented in derived class to send the message over the message transfer interface
         * @param message
         */
        protected abstract _send(message: ITransportMessage): void;

        /**
         * 
         * @param message
         */
        protected _onReceived(message: ITransportMessage): void {

            if (message.protocol in this.__transportRecievers) {
                for (let receiver of this.__transportRecievers[message.protocol]) {
                    receiver(this, message.data);
                }
            }

        }

    }

}