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

namespace Ajs.DI {

    "use strict";

    /**
     * Ajs dependency injection container implementation
     * <p>
     * The Ajs Service DI Container is used internally by Ajs to instance services of the Ajs and either
     * it can be used by the application to construct object graphs based on the service dependancies. It
     * is designed with the TypeScript compiler and JavaScript runtime in mind so it is possible to check
     * for the compile time errors (i.e. type inconsistences). Runtime checking is limited as the type
     * information is not available at all (the reflection is not in use). The DI container is supposed to
     * be used for configuration of service graphs during the application intialization and resolving
     * automatic service instantiation and dependancy resolving once the services are requested to be
     * instantiated. The @see [resolve]{Ajs.DI.Container.resolve} method is supposed to be used internally
     * by the Ajs Fraemework only. For more information about Ajs Framework DI integration and usage reffer
     * to Ajs DI guide articles and examples.
     * </p>
     * <h4>Singleton services</h4>
     * <p>
     * Singleton services are instanced just once and the DI container keeps track of the singleton
     * services internally. If request to resolve the Singleton service is made the prevoiusly created
     * instance is returned if it already exists or it is created, stored internally and returned to the
     * caller.
     * <p>
     * Singleton service instances are not ment to be released at all during the whole application life cycle.
     * They are supposed to be used for global services (mainly Ajs Framework services are instanced as
     * singletons) and are not supposed to be released before the end of application lifecycle and it is not
     * recommended. However, container allows to release the singleton instance reference it holds by calling
     * the @see {Ajs.DI.Container.releaseSingletonInstanceReference} method.
     * </p>
     * <h4>Scoped services</h4>
     * <p>
     * Scoped services are similiar to Singleton instances. The internal behaviour is the same as in case of
     * the Singleton services so when the Scoped service is requested to be created the instance table is
     * looked up first and the service is created only in case if it was not located in the instance lookup
     * table. The difference is the DI container counts how many times the reference of the service instance
     * has been requested and releases the reference only in case the same amount of requests to release
     * the service instance reference is called. This can be used for debugging i.e. to check if the scoped
     * service consumers are correctly releasing the instance.
     * The service instance life time is fully managable by the application code. Once the instance is not
     * necessary the @see [releaseScopedInstanceReference]{Ajs.DI.Container.releaseScopedInstanceReference}
     * method can be called to release the instance. Once the reference count is zero the reference is
     * released from the DI container and memory cleared by the garbage collector.
     * Requirement to obtain a reference to the service instance directly from the DI container in all cases
     * is clear. The reference should not be never copied in the application code itself.
     * </p>
     * <h4>Transient services</h4>
     * When transient service is asked to be resolved it always gets resolved by creating a new instance
     * of the service and returning it directly to the caller. The DI does not keep the track of how many
     * times the instance was created and does not hold the service instance internally. It is responsibility
     * of the application to release the service instance once is is not needed.
     * </p>
     */
    export class Container implements IContainer {

        /**
         * Stores container managed transcient services
         * To add a managed trancient service the addTranscient method has to be used
         */
        private __transcientServices: IService[];

        /**
         * Stores container managed scoped services
         * To add a managed scoped service the addScoped methiod has to be used
         */
        private __scopedServices: IService[];

        /**
         * Stores container managed singleton services
         * To add a managed singleton service the addSingleton methiod has to be used
         */
        private __singletonServices: IService[];

        /**
         * Holds instances of instanced scoped services
         * Looked up always when the scoped service is requested
         * To release the scoped service instance reference the releaseScopedInstanceReference method has to be used
         */
        private __scopedInstances: IServiceInstance[];

        /**
         * Holds instances of instanced singleton services
         * Looked up always when the singleton service is requested
         * To release the scoped service instance reference the releaseSingletonInstanceReference method has to be used
         */
        private __singletonInstances: IServiceInstance[];

        /**
         * Consturcts the Ajs implementation of the DI container
         * Performs basic initialization of managed service stores and service instance stores
         */
        constructor() {
            this.__transcientServices = [];
            this.__scopedServices = [];
            this.__singletonServices = [];
            this.__scopedInstances = [];
            this.__singletonInstances = [];
        }

        /**
         * Adds a transcient service to the DI container
         * @param serviceConstructor Constructor (class name) of the service to be added
         * @param serviceParameters Parameters of the service to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addTranscient<T>(serviceConstructor: any, serviceParameters: T): Container {
            this.__addService(this.__transcientServices, {
                serviceConstructor: serviceConstructor,
                serviceParameters: serviceParameters
            });
            return this;
        }

        /**
         * Adds a scoped service to the DI container
         * @param serviceConstructor Constructor (class name) of the service to be added
         * @param serviceParameters Parameters (including service dependancies) to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addScoped<T>(serviceConstructor: any, serviceParameters: T): Container {
            this.__addService(this.__scopedServices, {
                serviceConstructor: serviceConstructor,
                serviceParameters: serviceParameters
            });
            return this;
        }

        /**
         * Adds a singleton service to the DI container
         * @param serviceConstructor Constructor (class name) of the service to be added
         * @param serviceParameters Parameters (including service dependancies) to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addSingleton<T>(classToConstruct: any, constructorParameters: T): Container {
            this.__addService(this.__singletonServices, {
                serviceConstructor: classToConstruct,
                serviceParameters: constructorParameters
            });
            return this;
        }

        /**
         * Resolves the service including configured dependancies and returns a resolved service instance
         * <ul>
         * <li>1. Looks up for service tables if the service was previously registered to be managed</li>
         * <li>2. For scoped and singleton services it looks up the appropriate instance tables and returns
         *        the instance created previously if it is found</li>
         * <li>3. Resolves dependancies, prepares the constructor parameters by mapping configured parameter
         *        names to code defined constructor arguments in order to pass dependancies in correct order
         *        and creates and returns the instanced service
         * </li>
         * @param serviceConstructor
         * @returns Instance of the service
         */
        public resolve<T>(serviceConstructor?: new (...params: any[]) => T): T {
            return <T>this.__resolve(serviceConstructor);
        }

        /**
         * Releases the sigleton service instance refenrece held by the container
         * @param serviceInstance Instance of the service to be released
         */
        public releaseSingletonInstanceReference(serviceInstance: any): void {
            this.__releaseInstanceReference(this.__scopedInstances, serviceInstance);
        }

        /**
         * Decreases scoped instance reference counter and releases the internal reference when the counter equals to zero
         * @param serviceInstance Instance of the service to be released
         */
        public releaseScopedInstanceReference(serviceInstance: any): void {
            this.__releaseInstanceReference(this.__singletonInstances, serviceInstance);
        }

        /**
         * Adds a service to appropriate services list
         * @param serviceList List to which the service has to be added
         * @param service Service descriptor (constructor and dependancy list)
         */
        private __addService(serviceList: IService[], service: IService): void {
            let s: IService = this.__getService(serviceList, service);
            if (s !== null) {
                return;
            }
            serviceList.push(service);
        }

        /**
         * Returns the registered service
         * @param serviceList List to be looked up for the service
         * @param serviceConstructor Service constructor to be looked for
         * @returns The service descriptor if the service is found, otherwise null
         */
        private __getService(serviceList: IService[], serviceConstructor: any): IService {
            for (let s of serviceList) {
                if (s.serviceConstructor === serviceConstructor) {
                    return s;
                }
            }
            return null;
        }

        /**
         * Returns the service instance identified by the instance reference
         * @param instanceList List of service instances to be looked up for the service instance
         * @param serviceInstance Instance of the service to be looked for
         * @returns The service descriptor if the service instance was found, otherwise null
         */
        private __getServiceInstance(instanceList: IServiceInstance[], serviceInstance: any): IServiceInstance {
            for (let i of instanceList) {
                if (i.serviceInstance === serviceInstance) {
                    return i;
                }
            }
            return null;
        }

        /**
         * Returns the service instance identified by the service constructor
         * @param instanceList List of service instances to be looked up for the service instance
         * @param serviceConstructor Constructor of the service to be looked for
         * @returns The service descriptor if the service instance was found, otherwise null
         */
        private __findServiceInstance(instanceList: IServiceInstance[], serviceConstructor: any): IServiceInstance {
            for (let i of instanceList) {
                if (i.serviceConstructor === serviceConstructor) {
                    return i;
                }
            }
            return null;
        }

        /**
         * Releases the internal instance reference (to allow the GC to cleanup the memory)
         * <p>
         * If the scoped instance is about to be released the reference counter is decreased first and the
         * internal reference is released just in case the reference counter equals to zero.
         * </p>
         * @param instanceList List of instances to be se
         * @param serviceInstance
         */
        private __releaseInstanceReference(instanceList: IServiceInstance[], serviceInstance: any): void {
            let i: IServiceInstance = this.__getServiceInstance(instanceList, serviceInstance);
            if (i !== null) {

                if (instanceList === this.__singletonInstances) {
                    i.referenceCount--;
                }

                if (i.referenceCount === 0) {
                    let index: number = instanceList.indexOf(i);
                    if (index !== -1) {
                        instanceList.splice(index, 1);
                    }
                }
            }
        }

        /**
         * Resolves service dependancies and constructs the service instance with passing configured dependancies to constructor
         * @param serviceConstructor Constructor of the service to be instanitated
         * @returns Instaniated service or null if the service was not registered
         */
        private __resolve(serviceConstructor: any): any {
            let i: IServiceInstance;

            i = this.__resolveScoped(serviceConstructor);
            if (i !== null) {
                return i;
            }

            i = this.__resolveSingleton(serviceConstructor);
            if (i !== null) {
                return i;
            }

            i = this.__resolveTransient(serviceConstructor);
            return i;
        }

        /**
         * Constructs a new instance of transient service includind resolving of configured dependencies
         * The process of the instance construction includes dependancy resolving and constructor argument mapping.
         * @param serviceConstructor Constructor of the service to be instanitated
         * @returns Instaniated service or null if the service was not registered
         */
        private __resolveTransient(serviceConstructor: any): any {
            return this.__constructService(this.__transcientServices, serviceConstructor);
        }

        /**
         * Looks for the existing service instance and returns it if found. Otherwise constructs a new instance
         * The process of the instance construction includes dependancy resolving and constructor argument mapping.
         * @param serviceConstructor Constructor of the service to be instanitated
         * @returns Instaniated service or null if the service was not registered
         */
        private __resolveScoped(serviceConstructor: any): any {

            let i: IServiceInstance = this.__findServiceInstance(this.__scopedInstances, serviceConstructor);
            if (i !== null) {
                i.referenceCount++;
                return i;
            }

            let serviceInstance: any = this.__constructService(this.__scopedServices, serviceConstructor);

            this.__scopedInstances.push({
                serviceConstructor: serviceConstructor,
                serviceInstance: serviceInstance,
                referenceCount: 1
            });
            return serviceInstance;
        }


        /**
         * Looks for the existing service instance and returns it if found. Otherwise constructs a new instance
         * The process of the instance construction includes dependancy resolving and constructor argument mapping.
         * @param serviceConstructor Constructor of the service to be instanitated
         * @returns Instaniated service or null if the service was not registered
         */
        private __resolveSingleton(serviceConstructor: any): any {
            let i: IServiceInstance = this.__findServiceInstance(this.__singletonInstances, serviceConstructor);
            if (i !== null) {
                return i;
            }

            let serviceInstance: any = this.__constructService(this.__singletonServices, serviceConstructor);

            this.__singletonInstances.push({
                serviceConstructor: serviceConstructor,
                serviceInstance: serviceInstance,
                referenceCount: 0
            });
            return serviceInstance;
        }

        /**
         * Resolves service dependancies and maps them to constuctor arguments. Finally, constructs and returns the instance of the service
         * @param serviceList List of registered services to be looked for the service descriptor
         * @param serviceConstructor Constructor of the service to be constructed
         * @returns Instaniated service or null if the service was not registered
         */
        private __constructService(serviceList: IService[], serviceConstructor: any): any {

            if (!(serviceConstructor instanceof Function)) {
                throw new Error("Service constructor must be passed in!");
            }

            let s: IService = this.__getService(serviceList, serviceConstructor);
            if (s === null) {
                return null;
            }

            let params: any = this.__resolveParameters(s);
            let o: any = Object.create(s.serviceConstructor.prototype);
            s.serviceConstructor.apply(o, params);
            return o;
        }

        /**
         * Resolves service depenancies and maps them to constructor arguments
         * @param service Service which dependancies should be resolved and mapped to constructor arguments
         * @returns Constructor argument list with resolved dependancies
         */
        private __resolveParameters(service: IService): any[] {

            let ctorParams: any[] = [];

            let ctorParamNames: string[] = this.__collectConstructorParameters(service);
            if (ctorParamNames.length === 0) {
                return ctorParams;
            }

            for (let pn of ctorParamNames) {
                if (pn in service.serviceParameters) {
                    if (service.serviceParameters[pn] instanceof Function) {
                        // try to resolve service
                        let s: any = this.resolve(service.serviceParameters[pn]);
                        if (s !== null) {
                            // pass resolved service
                            ctorParams.push(s);
                        } else {
                            // pass the original function
                            ctorParams.push(service.serviceParameters[pn]);
                        }
                    } else {
                        // pass the configuration data
                        ctorParams.push(service.serviceParameters[pn]);
                    }
                } else {
                    throw new Error("Invalid constructor parameters specification");
                }
            }

            return ctorParams;
        }

        /**
         * Collects the parameters of the constructor by parsing its function declaration
         * If the constructor has no any parameters the protoype tree is walked through and the
         * first constructor with arguments available is used. This is not ideal but is required
         * in order to be possible to construct services without constructor implementation
         * but deriving other base classess
         * @param service Service which constructor should be parsed
         * @returns List of constructor argument names in correct order
         */
        private __collectConstructorParameters(service: IService): any[] {

            let ctor: any = service.serviceConstructor;
            let paramNames: string[] = [];

            while (ctor instanceof Function && paramNames.length === 0) {
                paramNames = this.__getFunctionParameterNames(ctor);
                ctor = Object.getPrototypeOf(ctor);
            }

            return paramNames;
        }

        /**
         * Parses the function declaration and returns argument names
         * @param f Function declaration to be parsed
         * @returns List of function arguments in the correct order
         */
        private __getFunctionParameterNames(f: Function): string[] {

            let paramNames: string[] = [];

            let fn: string = f.toString();
            let p: string = fn.substr(fn.indexOf("(") + 1).trim();

            if (p[0] === ")") {
                return paramNames;
            }
            p = p.substr(0, p.indexOf(")"));
            paramNames = p.split(",");

            for (let i: number = 0; i < paramNames.length; i++) {
                paramNames[i] = paramNames[i].trim();
            }

            return paramNames;
        }



    }

}