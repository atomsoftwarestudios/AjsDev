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

namespace Ajs.DistributedServices {

    "use strict";

    export interface IServiceManagerConfig {
        workerUrl: string;
        workerLibraries: string[];
    }

    export interface IWorkerInfo {
        worker: AjsWebWorker.AjsWebWorker;
        serviceManagerId: number;
        webWokrerReadyResolver: () => void;
        webWorkerReadyRejector: (reason: any) => void;
    }

    export interface IWorkersInfo {
        [name: string]: IWorkerInfo;
    }

    export class NamedWorkerExistsAlreadyException extends Exception { };

    export class WebWorkerNotExistException extends Exception { };

    export class FailedToLocateWebWorkerException extends Exception { };

    export class ServiceManagerEndpointAssignedAlreadyException extends Exception { };

    export class ServiceManagerNotRegisteredWithTheWebWorkerException extends Exception { };

    export class ServiceManager {

        private __rmiRouter: RMI.RMIRouter;

        private __workerUrl: string;
        private __workerLibraries: string[];

        private __webWorkers: IWorkersInfo;

        constructor(config?: IServiceManagerConfig) {

            config = config || this.__defaultConfig();

            this.__rmiRouter = new RMI.RMIRouter();
            this.__rmiRouter.addEndpointRegisteredListener(
                (iface: MessageTransport.ITransportInterface, endpointId: number): Promise<void> => {
                    return this.__onRMIEndpointCreated(iface, endpointId);
                }
            );

            this.__workerUrl = config.workerUrl;
            this.__workerLibraries = config.workerLibraries;
            this.__webWorkers = {};

        }

        /**
         * Creates a named web worker, initializes it and starts up the RMI communication
         * <p>
         * When the web worker is created the remote service manager is created. This manager
         * is used to deploy services remotely to the worker environment and to locate services
         * deployed in the ui thread or in another worker. Each worker can contain multiple
         * services but every service represents a single and unique RMI endpoint so it makes
         * possible to perform remote service method calls over the RMI bus.
         * </p>
         * <p>
         * The name of the worker should be choosen to match the purpose of the services group
         * it hosts (i.e. ajsSystem, ajsUI, ajsHTTP, ajsDB, appModel, appHelers and so on).
         * </p>
         * <p>
         * Services should be grouped together with taking into account that:
         * <ul>
         * <li>RMI call is much more expenive than the local, direct service method call</li>
         * <li>Services supposed to run together at one time should be placed in differend workers (i.e. HTTP and VDOM updates)</li>
         * </ul>
         * </p>
         * @param name Name of the worker to be created
         */
        public createWebWorker(name: string): Promise<void> {

            let wwreadyPromise: Promise<void> = new Promise<void>(

                (resolve: () => void, reject: (reason: any) => void) => {

                    if (name in this.__webWorkers) {
                        reject(new NamedWorkerExistsAlreadyException());
                    }

                    let worker: AjsWebWorker.AjsWebWorker = new AjsWebWorker.AjsWebWorker(
                        this.__workerUrl,
                        this.__workerLibraries,
                        this.__workerCode
                    );

                    this.__rmiRouter.addInterface(worker);

                    this.__webWorkers[name] = {
                        worker: worker,
                        serviceManagerId: -1,
                        webWokrerReadyResolver: resolve,
                        webWorkerReadyRejector: reject
                    };
                }

            );

            return wwreadyPromise;

        }

        /**
         * Deploys a service to the specified worker
         * @param workerName
         * @param service
         */
        public async deployService(workerName: string, service: new (...args: any[]) => any, ...ctorArgs: any[]): Promise<void> {

            if (!(workerName in this.__webWorkers)) {
                throw new WebWorkerNotExistException();
            }

            let wi: IWorkerInfo = this.__webWorkers[workerName];

            if (wi.serviceManagerId === -1) {
                throw new ServiceManagerNotRegisteredWithTheWebWorkerException();
            }

            try {
                console.log(await this.__deployService.apply(
                    this, [
                        wi.serviceManagerId,
                        Ajs.Utils.getClassName(service),
                        this.__serializeClass(service)
                    ].concat(ctorArgs)
                ))
            } catch (e) {
                console.error(e);
            }

        }

        public async testCall(rmiId: number, method: string, ...args: any[]): Promise<any> {
            return this.__rmiRouter.makeCall.apply(this.__rmiRouter, [rmiId, method].concat(args));
        }

        public async test(workerName: string): Promise<void> {

            if (!(workerName in this.__webWorkers)) {
                throw new WebWorkerNotExistException();
            }

            let wi: IWorkerInfo = this.__webWorkers[workerName];

            try {
                console.log(await this.__passTest(wi.serviceManagerId));
            } catch (e) {
                console.error(e);
            }

            try {
                console.log(await this.__failTest(wi.serviceManagerId));
            } catch (e) {
                console.error(e);
            }

            try {
                console.log(await this.__divTest(wi.serviceManagerId, 10, 2));
                console.log(await this.__divTest(wi.serviceManagerId, 0, 0));
            } catch (e) {
                console.error(e);
            }

        }

        /**
         * Called when remote endpoint is registered to the router
         * <p>
         * Used to assign the remote service manager to the given web worker
         * </p>
         * @param iface Interface (AjsWebWorker) where the enpoint was registered
         * @param endpointId Id of the endpoint created
         */
        private async __onRMIEndpointCreated(iface: MessageTransport.ITransportInterface, endpointId: number): Promise<void> {

            let wi = this.__getWebWorkerInfoByWorker(<AjsWebWorker.AjsWebWorker>iface);

            if (wi === null) {
                throw new FailedToLocateWebWorkerException();
            }

            // if service manager is not assigned to given interface the create endpoint is service manager for sure
            if (wi.serviceManagerId === -1) {
                wi.serviceManagerId = endpointId;
                wi.webWokrerReadyResolver();
                wi.webWokrerReadyResolver = null;
                wi.webWorkerReadyRejector = null;
            } else {
                if (wi.webWorkerReadyRejector !== null) {
                    wi.webWorkerReadyRejector(new ServiceManagerEndpointAssignedAlreadyException());
                }
            }

        }

        /**
         * Searches local wokrer info table for given worker and returns the info record if found.
         * @param worker AjsWebWorker to be searched in the worker info table
         */
        private __getWebWorkerInfoByWorker(worker: AjsWebWorker.AjsWebWorker): IWorkerInfo {
            for (let name in this.__webWorkers) {
                if (this.__webWorkers.hasOwnProperty(name)) {
                    if (this.__webWorkers[name].worker === worker) {
                        return this.__webWorkers[name];
                    }
                }
            }
            return null;
        }

        /**
         * Serializes the es6 class / es5 function prototype tree code to be deployable to remote service
         * @param obj es6 class or es5 function to be serialized
         */
        private __serializeClass(obj: any): string {
            if (typeof(obj) !== "function" || !obj.prototype) {
                return "";
            }

            let out: string = "";

            if (obj.prototype) {
                out += this.__serializeClass(Object.getPrototypeOf(obj));
            }

            out += this.__buildClassString(obj);

            return out;
        }

        /**
         * Builds a prototype tree string from the ES5 style classes
         * @param obj ES5 function which code should be built to string
         */
        private __buildClassString(obj: any): string {
            let classString: string = obj.toString();
            let className: string = Ajs.Utils.getClassName(obj);
            let constructorArgs: string = classString.substring(classString.indexOf("(") + 1, classString.indexOf("{") - 1);
            constructorArgs = constructorArgs.substr(0, constructorArgs.lastIndexOf(")"));
            let constructorBody: string = classString.substring(classString.indexOf("{") + 1, classString.lastIndexOf("}"));

            let superClassName: string = "";
            if (obj.prototype) {
                let proto: any = Object.getPrototypeOf(obj);
                superClassName = Ajs.Utils.getClassName(proto);
            }

            let out: string = "this." + className + " = this." + className + " || (function(";
            if (superClassName) {
                out += "_super";
            }
            out += ") {\n";

            if (superClassName) {
                out += "    __extends(" + className + ", _super)\n\n";
            }

            out += "    function " + className + " (" + constructorArgs + ") { " + constructorBody + "}\n\n";

            if (obj.prototype) {
                for (let key in obj.prototype) {
                    if (obj.prototype.hasOwnProperty(key) && typeof (obj.prototype[key]) === "function") {
                        out += "    " + className + ".prototype." + key + " = " + obj.prototype[key].toString() + "\n\n";
                    }
                }
            }

            out += "    return " + className + ";\n";

            out += "})(";

            if (superClassName) {
                out += "this." + superClassName;
            }

            out += ");\n\n";

            return out;

        }

        /**
         * Returns a default configuration of the service manager
         */
        private __defaultConfig(): IServiceManagerConfig {

            return {
                workerUrl: "/js/ajs.wworker.js",
                workerLibraries: ["/js/ajs.lib.js"]
            }

        }

        /**********************************************************************************************************
                                   following code is  related to remote service manager
        /******************************************************************************************************** */

        private async __deployService(serviceManager: number, serviceName: string, serviceCode: string, ...ctorArgs: any[]): Promise<number> {
            return this.__rmiRouter.makeCall.apply(this.__rmiRouter, [serviceManager, "deployService", serviceName, serviceCode].concat(ctorArgs));
        }

        private async __failTest(serviceManager: number): Promise<any> {
            return this.__rmiRouter.makeCall(serviceManager, "failTest", 1, 2, 3, 4, 5);
        }

        private async __passTest(serviceManager: number): Promise<any> {
            return this.__rmiRouter.makeCall(serviceManager, "passTest", 1, 2, 3, 4, 5);
        }

        private async __divTest(serviceManager: number, a: number, b: number): Promise<number> {
            return this.__rmiRouter.makeCall(serviceManager, "divTest", a, b);
        }

        /**
         * Code to be run once the worker is created. Basically, it contains worker related service manager/locator
         */
        private __workerCode(): void {

            let servicesSourceCodeScope: any = {};

            class ServiceManager {

                public async deployService(serviceName: string, serviceCode: string, ...ctorArgs: any[]): Promise<number> {

                    function deploy(): void {
                        eval(serviceCode);
                    }

                    function instantiate(): any {
                        let ctor: new (...args: any[]) => any = servicesSourceCodeScope[serviceName];
                        return new (ctor.bind.apply(ctor, [null].concat(ctorArgs)));
                    }

                    deploy.apply(servicesSourceCodeScope);

                    if (!(serviceName in servicesSourceCodeScope)) {
                        throw new Error("Invalid service name or code!");
                    }

                    let instance: any = instantiate();

                    let rmiep: Ajs.RMI.RMIEndpoint = new Ajs.RMI.RMIEndpoint(Ajs.AjsWebWorker.ajsWorkerInstance, instance);
                    await rmiep.waitRegistered();

                    return rmiep.endPointId;
                }

                public divTest(a: number, b: number): number {
                    return a / b;
                }

                public failTest(...args: any[]): any {
                    console.log(args);
                    console.log("throwing testing exception");
                    //throw new Error("Fail test exception");
                    return window.document;
                }

                public passTest(...args: any[]): string {
                    console.log(args);
                    return "This is pass test return value";
                }

            }

            let serviceManager = new ServiceManager();
            let rmiep: Ajs.RMI.RMIEndpoint = new Ajs.RMI.RMIEndpoint(Ajs.AjsWebWorker.ajsWorkerInstance, serviceManager);

        }

    }

}
