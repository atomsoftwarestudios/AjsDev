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
 * Events namespace contains Notifier class
 * Notifier clas can be instanced and used as the event notificator similiar to
 * #C delegates or addEventListener in the DOM. Listener should be a lambda function
 * to follow the TypeScript requirements regarding using of the this instance
 * identifier. The function must be defined according to the IListener interface.
 */
namespace Ajs.Events {

    "use strict";

    /** Notifier can be instanced to let subscribers register within it and notify them about particular events */
    export class Notifier<T> implements INotifier<T> {

        /** List of subscribers */
        private __listeners: IListener<T>[];

        /**
         * Instantiates the Notifier and subscribes listeners passed as parameter
         * @param listeners
         */
        public constructor(...listeners: IListener<T>[]) {

            Ajs.Dbg.log(Dbg.LogType.Constructor, 0, "ajs.events", this);

            this.__listeners = [];
            for (let i: number = 0; i < listeners.length; i++) {
                this.__listeners.push(listeners[i]);
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.events", this);

        }

        /**
         * Subscribes listener to obtain notifications passed through the current instance of Notifier
         * @param listener Listener to be subscribed
         */
        public subscribe(listener: IListener<T>): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.events", this);

            if (this.__listeners.indexOf(listener) === -1) {
                this.__listeners.push(listener);
            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.events", this,
                "Registered subscribers: " + this.__listeners.length, this.__listeners);

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.events", this);
        }

        /**
         * Unsubscribes the listener from the current instance of the notifier
         * @param listener Listener to be subscribed
         */
        public unsubscribe(listener: IListener<T>): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.events", this);

            if (this.__listeners.indexOf(listener) !== -1) {
                this.__listeners.splice(this.__listeners.indexOf(listener));
            }

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.events", this,
                "Registered subscribers: " + this.__listeners.length, this.__listeners);

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.events", this);
        }

        /**
         * Notifies registered subscribers the event occured
         * Subscribers can cancel propagation to other subscribers by returning false from listener function
         * @param sender Sender object identifier
         * @param data Data to be passed to subscribers
         */
        public notify(sender: any, data?: T): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.events", this);

            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.events", this,
                "Notifying subscribers. Sender: " + Ajs.Utils.getClassName(sender), sender, data);

            for (let i: number = 0; i < this.__listeners.length; i++) {
                let result: boolean = this.__listeners[i](sender, data);
                if (!result) {
                    return;
                }
            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.events", this);
        }

    }

}
