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

    export class ServiceContainerExistsAlreadyException extends Exception { };

    export class ServiceContainerNotExistException extends Exception { };

    export class FailedToLocateWebWorkerException extends Exception { };

    export class ServiceManagerEndpointAssignedAlreadyException extends Exception { };

    export class ServiceManagerNotRegisteredWithTheWebWorkerException extends Exception { };

    export interface IServiceManagerConfig {
        workerUrl: string;
        workerLibraries: string[];
        mainUiThreadServiceContainerName: string;
    }

    export interface IAjsWorkerInfo {
        worker: AjsWebWorker.AjsWebWorker;
        serviceManagerId: number;
        webWokrerReadyResolver: () => void;
        webWorkerReadyRejector: (reason: any) => void;
    }

    export interface INamedServiceInstance {
        id: number,
        serviceLocator: string;
        serviceClass: Utils.Ctor;
        serviceInstance: any;
    }

    export interface INamedServiceInstances {
        [name: string]: INamedServiceInstance;
    }

    export interface IServiceContainer {
        /** array of class constructors deployed in the container */
        deployedServices: string[];
        /** list of service id's instanced in the container */
        instancedServices: number[];
        /** instances of services or service proxies held by the container */
        namedServiceInstances: INamedServiceInstances;
    }

    export interface IServiceContainerInfo extends IServiceContainer {
        ajsWorkerInfo: IAjsWorkerInfo;
    }

    export interface IServiceContainers {
        [name: string]: IServiceContainerInfo;
    }

    export interface IDeployedServiceMethods {
        service: Utils.Ctor;
        methods: string[];
    }

    export class ServiceManager {

        private __config: IServiceManagerConfig;

        private __rmiRouter: RMI.RMIRouter;

        private __workerUrl: string;
        private __workerLibraries: string[];

        // holds service containers
        private __localServiceContainer: IServiceContainerInfo;
        private __serviceContainers: IServiceContainers;

        // holds list of constructors of all services deployed in the infrastructure
        private __deployedServices: Utils.Ctor[];
        private __deployedServicesMethods: IDeployedServiceMethods[];


        constructor(config?: IServiceManagerConfig) {

            this.__config = config || this.__defaultConfig();

            this.__rmiRouter = new RMI.RMIRouter();
            this.__rmiRouter.addEndpointRegisteredListener(
                (iface: MessageTransport.ITransportInterface, endpointId: number): Promise<void> => {
                    return this.__onRMIEndpointCreated(iface, endpointId);
                }
            );

            this.__workerUrl = this.__config.workerUrl;
            this.__workerLibraries = this.__config.workerLibraries;

            this.__localServiceContainer = {
                ajsWorkerInfo: {
                    worker: null,
                    webWokrerReadyResolver: null,
                    webWorkerReadyRejector: null,
                    serviceManagerId: 0
                },
                deployedServices: [],
                instancedServices: [],
                namedServiceInstances: {}
            }

            this.__serviceContainers = {};
            this.__serviceContainers[this.__config.mainUiThreadServiceContainerName] = this.__localServiceContainer;

            this.__deployedServices = [];
            this.__deployedServicesMethods = [];


        }

        /**
         * Creates a named service container, initializes it, starts worker and starts up the RMI communication
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
         * @param name Name of the service container to be created
         */
        public createServiceContainer(name: string): Promise<void> {

            let scReadyPromise: Promise<void> = new Promise<void>(

                (resolve: () => void, reject: (reason: any) => void) => {

                    if (name in this.__serviceContainers) {
                        reject(new ServiceContainerExistsAlreadyException());
                    }

                    let worker: AjsWebWorker.AjsWebWorker = new AjsWebWorker.AjsWebWorker(
                        this.__workerUrl,
                        this.__workerLibraries,
                        this.__workerCode
                    );

                    this.__rmiRouter.addInterface(worker);

                    this.__serviceContainers[name] = {
                        ajsWorkerInfo: {
                            worker: worker,
                            webWokrerReadyResolver: resolve,
                            webWorkerReadyRejector: reject,
                            serviceManagerId: -1
                        },
                        deployedServices: [],
                        instancedServices: [],
                        namedServiceInstances: {}
                    };

                }

            );

            return scReadyPromise;

        }

        public async instantiateLocalNamedService(serviceName: string, service: Utils.Ctor, ...ctorArgs: any[]): Promise<any> {
        }

        /**
         * 
         * @param service
         * @param ctorArgs
         */
        public async instantiateLocalService(service: Utils.Ctor, ...ctorArgs: any[]): Promise<any> {
        }

        /**
         * 
         * @param serviceName
         * @param serviceContainerName
         * @param serviceCodeScope
         * @param service
         * @param ctorArgs
         */
        public async instantiateNamedService(
            serviceName: string,
            serviceContainerName: string,
            serviceCodeScope: string,
            service: Utils.Ctor,
            ...ctorArgs: any[]
        ): Promise<any> {

            return null;

        }

        /**
         * Instantiates service in the given service container and returns its instance or proxy
         * @param serviceContainerName
         * @param serviceCodeScope
         * @param service
         * @param ctorArgs
         */
        public async instantiateService(
            serviceContainerName: string,
            service: Utils.Ctor,
            ...ctorArgs: any[]
        ): Promise<any> {

            if (!(serviceContainerName in this.__serviceContainers)) {
                throw new ServiceContainerNotExistException();
            }

            if (serviceContainerName === this.__config.mainUiThreadServiceContainerName) {
                return this.instantiateLocalService.apply(this, [service].concat(ctorArgs));
            }

            let si: IServiceContainerInfo = this.__serviceContainers[serviceContainerName];
            let wi: IAjsWorkerInfo = si.ajsWorkerInfo;

            if (wi.serviceManagerId === -1) {
                throw new ServiceManagerNotRegisteredWithTheWebWorkerException();
            }

            let className: string = Ajs.Utils.getClassName(service);

            if (si.deployedServices.indexOf(className) === -1) {
                await this.__deployServiceCode(serviceContainerName, service);
            }

            let serviceId = await this.__instantiateService_call.apply(this, [wi.serviceManagerId, className].concat(ctorArgs));

            return this.__createServiceProxy(service, serviceId);
        }

        /**
         * 
         * @param serviceContainerName
         * @param serviceCodeScope
         * @param service
         */
        private async __deployServiceCode(serviceContainerName: string, service: Utils.Ctor): Promise<void> {

            if (!(serviceContainerName in this.__serviceContainers)) {
                throw new ServiceContainerNotExistException();
            }

            let wi: IAjsWorkerInfo = this.__serviceContainers[serviceContainerName].ajsWorkerInfo;

            if (wi.serviceManagerId === -1) {
                throw new ServiceManagerNotRegisteredWithTheWebWorkerException();
            }

            try {
                let className: string = Ajs.Utils.getClassName(service);
                let code: string = this.__serializeClass(service);

                await this.__deployServiceCode_call(wi.serviceManagerId, className, code);

                this.__serviceContainers[serviceContainerName].deployedServices.push(className);

                if (this.__deployedServices.indexOf(service) === -1) {
                    this.__extractDeployedServiceMethods(service);
                    this.__deployedServices.push(service);
                }

                console.log("Service '" + className + "' deployed to " + serviceContainerName + " (worker service manager id: " + wi.serviceManagerId + ")");

            } catch (e) {
                console.error(e);
            }

        }

        /**
         * 
         * @param serviceId
         */
        private __createServiceProxy(serviceCtor: Utils.Ctor, serviceId: number): any {

            let dsm: IDeployedServiceMethods = this.__getDeployedServiceMethods(serviceCtor);
            if (dsm === null) {
                return null;
            }

            let proxyClass: any = function ServiceProxy(rmiRouter: RMI.RMIRouter, rmiServiceId: number): any {
                this["__ajsRmiRouter"] = rmiRouter;
                this["__ajsRmiServiceId"] = rmiServiceId;
            };
            proxyClass.prototype = serviceCtor.prototype;

            let proxy: any = new proxyClass(this.__rmiRouter, serviceId);

            for (let m of dsm.methods) {
                let fndef: string = "return function " + m + "() {";
                fndef += "var args = []; ";
                fndef += "for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }; ";
                fndef += "return this.__ajsRmiRouter.makeCall.apply(this.__ajsRmiRouter, [this.__ajsRmiServiceId, \"" + m + "\"].concat(args))";
                fndef += "}";
                proxy[m] = (new Function(fndef))();
            }

            return proxy;
        }


        public async testCall(rmiId: number, method: string, ...args: any[]): Promise<any> {
            return
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

            let sc: IServiceContainerInfo = this.__getServiceContainerByWorker(<AjsWebWorker.AjsWebWorker>iface);

            if (sc === null || sc.ajsWorkerInfo === null || sc.ajsWorkerInfo.worker === null) {
                throw new FailedToLocateWebWorkerException();
            }

            let wi: IAjsWorkerInfo = sc.ajsWorkerInfo;

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
         * Searches for the wokrer in service containers
         * @param worker AjsWebWorker to be searched for
         */
        private __getServiceContainerByWorker(ajsWorker: AjsWebWorker.AjsWebWorker): IServiceContainerInfo {
            for (let name in this.__serviceContainers) {
                if (this.__serviceContainers.hasOwnProperty(name)) {

                    if (this.__serviceContainers[name].ajsWorkerInfo &&
                        this.__serviceContainers[name].ajsWorkerInfo.worker === ajsWorker) {
                        return this.__serviceContainers[name];
                    }

                }
            }
            return null;
        }

        /**
         * Returns information about methods of the deployed service
         * @param service
         */
        private __getDeployedServiceMethods(service: Utils.Ctor): IDeployedServiceMethods {
            if (this.__deployedServices.indexOf(service) === -1) {
                return null;
            }

            for (let dsm of this.__deployedServicesMethods) {
                if (dsm.service === service) {
                    return dsm;
                }
            }

            return null;
        }

        /**
         * Extracts methods of the class passed to the method
         * @param service Service which's methods has to be extracted
         */
        private __extractDeployedServiceMethods(service: Utils.Ctor): void {

            if (this.__deployedServices.indexOf(service) !== -1) {
                return;
            }

            let methods: string[] = [];

            let current = service;
            while (current && current.prototype) {

                let props: string[] = Object.getOwnPropertyNames(current.prototype);

                for (let prop of props) {
                    if (prop === "constructor") {
                        continue;
                    }

                    if (typeof (current.prototype[prop]) === "function" && methods.indexOf(prop) === -1) {
                        methods.push(prop);
                        continue;
                    }
                }

                current = Object.getPrototypeOf(current);
            }

            this.__deployedServicesMethods.push({
                service: service,
                methods: methods,
            });

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
                workerLibraries: ["/js/ajs.lib.js"],
                mainUiThreadServiceContainerName: "main-ui-thread"
            }

        }

        /* ******************************************************************************************************
                                   following code is  related to remote service manager
        /******************************************************************************************************** */

        private async __deployServiceCode_call(
            remoteServiceManager: number,
            serviceName: string,
            serviceCode: string): Promise<void> {

            return this.__rmiRouter.makeCall(remoteServiceManager, "deployServiceCode", serviceName, serviceCode);

        }

        private async __instantiateService_call(
            remoteServiceManager: number,
            serviceName: string,
            ctorArgs: any[]
        ): Promise<number> {

            return this.__rmiRouter.makeCall.apply(
                this.__rmiRouter,
                [remoteServiceManager, "instantiateService", serviceName].concat(ctorArgs)
            );

        }

        /**
         * Code to be run once the worker is created. Basically, it contains worker related service manager/locator
         */
        private __workerCode(): Function {

            let servicesSourceCodeScopes: any = {};

            class FailedToDelpoyTheServiceException extends Exception { };
            class ServiceNameDoesNotMatchCodeException extends Exception { };

            class ServiceManager {

                private __selfRMIEndpointId: number;

                public constructor() {
                    this.__selfRMIEndpointId = -1;
                }

                public set selfRMIEndpointId(value: number) {
                    if (this.__selfRMIEndpointId === -1) {
                        this.__selfRMIEndpointId = value;
                    }
                }

                public async deployServiceCode(serviceName: string, serviceCode: string): Promise<void> {

                    function deploy(): void {
                        try {
                            eval(serviceCode);
                        } catch(e) {
                            throw new FailedToDelpoyTheServiceException(e);
                        }
                    }

                    deploy.apply(servicesSourceCodeScopes);

                    console.log(servicesSourceCodeScopes);

                    if (!(serviceName in servicesSourceCodeScopes)) {
                        throw new ServiceNameDoesNotMatchCodeException();
                    }

                }

                public async instantiateService(serviceName: string, ...ctorArgs: any[]): Promise<number> {

                    function instantiate(): any {
                        let ctor: new (...args: any[]) => any = servicesSourceCodeScopes[serviceName];
                        return new (ctor.bind.apply(ctor, [null].concat(ctorArgs)));
                    }

                    console.log(serviceName);

                    let instance: any = instantiate();

                    let rmiep: Ajs.RMI.RMIEndpoint = new Ajs.RMI.RMIEndpoint(Ajs.AjsWebWorker.ajsWorkerInstance, instance);
                    await rmiep.waitRegistered();

                    return rmiep.endPointId;
                }

            }

            async function createServiceManager(): Promise<void> {
                let serviceManager = new ServiceManager();
                let rmiep: Ajs.RMI.RMIEndpoint = new Ajs.RMI.RMIEndpoint(Ajs.AjsWebWorker.ajsWorkerInstance, serviceManager);
                await rmiep.waitRegistered();
                serviceManager.selfRMIEndpointId = rmiep.endPointId;
            }

            return createServiceManager;

        }

    }

}
