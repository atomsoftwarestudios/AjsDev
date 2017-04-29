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
     * it can be used by the application to construct object graphs based on the service dependencies. It
     * is designed with the TypeScript compiler and JavaScript runtime in mind. The DI container is supposed to
     * be used for configuration of service graphs during the application intialization and resolving
     * automatic service instantiation and dependency resolving once the services are requested to be
     * instantiated. The #see [resolve]{Ajs.DI.Container.resolve} method is supposed to be used internally
     * by the Ajs Fraemework only. For more information about Ajs Framework DI integration and usage reffer
     * to Ajs DI guide articles and examples. The resolve method supports both, synchronous and asynchronous
     * the services initalization. If the service implementation has the initialize method published it is
     * called and if the promise is returned the resolver waits until its done before it continues with
     * resolving another dependencies.
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
     * the #see [releaseSingletonInstanceReference]{Ajs.DI.Container.releaseSingletonInstanceReference} method.
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
     * necessary the #see [releaseScopedInstanceReference]{Ajs.DI.Container.releaseScopedInstanceReference}
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
        private __transientServices: IServiceDescriptor[];

        /**
         * Stores container managed scoped services
         * To add a managed scoped service the addScoped methiod has to be used
         */
        private __scopedServices: IServiceDescriptor[];

        /**
         * Stores container managed singleton services
         * To add a managed singleton service the addSingleton methiod has to be used
         */
        private __singletonServices: IServiceDescriptor[];

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
            this.__transientServices = [];
            this.__scopedServices = [];
            this.__singletonServices = [];
            this.__scopedInstances = [];
            this.__singletonInstances = [];
        }

        /**
         * Adds a transcient service to the DI container
         * @param serviceInterfaceIdentifier Identifier of the sercvice interface
         * @param serviceConstructor Constructor (class name) of the service implementation to be added
         * @param serviceParameters Parameters of the service to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addTransient<S>(
            serviceInterfaceIdentifier: S,
            serviceConstructor: CtorTyped<S>,
            ...serviceConfiguration: any[]
        ): Container {

            this.__addService(this.__transientServices, {
                serviceInterfaceIdentifier: serviceInterfaceIdentifier,
                serviceConstructor: serviceConstructor,
                serviceConfiguration: serviceConfiguration
            });
            return this;
        }

        /**
         * Adds a scoped service to the DI container
         * @param serviceInterfaceIdentifier Identifier of the sercvice interface
         * @param serviceConstructor Constructor (class name) of the service implementation to be added
         * @param serviceParameters Parameters (including service dependencies) to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addScoped<S>(
            serviceInterfaceIdentifier: S,
            serviceConstructor: CtorTyped<S>,
            ...serviceConfiguration: any[]
        ): Container {

            this.__addService(this.__scopedServices, {
                serviceInterfaceIdentifier: serviceInterfaceIdentifier,
                serviceConstructor: serviceConstructor,
                serviceConfiguration: serviceConfiguration
            });
            return this;
        }

        /**
         * Adds a singleton service to the DI container
         * @param serviceInterfaceIdentifier Identifier of the sercvice interface
         * @param serviceConstructor Constructor (class name) of the service implementation to be added
         * @param serviceParameters Parameters (including service dependncies) to be passed to the service constructor function
         * @returns reference to DI container in order to be possible to chain container configuration functions
         */
        public addSingleton<S>(
            serviceInterfaceIdentifier: S,
            classToConstruct: CtorTyped<S>,
            ...serviceConfiguration: any[]
        ): Container {

            this.__addService(this.__singletonServices, {
                serviceInterfaceIdentifier: serviceInterfaceIdentifier,
                serviceConstructor: classToConstruct,
                serviceConfiguration: serviceConfiguration
            });
            return this;
        }

        /**
         * Resolves the service including configured dependncies and returns a resolved service instance
         * <ul>
         * <li>Looks up for service tables if the service was previously registered to be managed</li>
         * <li>For scoped and singleton services it looks up the appropriate instance tables and returns
         *     the instance created previously if it is found</li>
         * <li>Resolves dependencies, prepares the constructor parameters by mapping configured parameter
         *     names to code defined constructor arguments in order to pass dependencies in correct order
         *     and creates and returns the instanced service
         * </li>
         * @param serviceInterfaceIdentifier Identifier of the sercvice interface
         * @param throwUnresolvedException Specifies if the container should throw unresolved exception or return null instead
         * @returns Instance of the service or null if dependencies could not be resolved
         */
        public async resolve<S>(
            serviceInterfaceIdentifier: S,
            throwUnresolvedException: boolean = true
        ): Promise<S> {

            let resolved: S = await this.__resolve<S>(serviceInterfaceIdentifier);
            if (resolved !== null) {
                return resolved;
            } else {
                if (throwUnresolvedException) {
                    throw new UnableToResolveDependencyException(
                        "Requested service identifier is not registered");
                } else {
                    return null;
                }
            }
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
         * @returns true if last instance was released, otherwise returns false
         */
        public releaseScopedInstanceReference(serviceInstance: any): boolean {
            return this.__releaseInstanceReference(this.__singletonInstances, serviceInstance);
        }

        /**
         * Adds a service to appropriate services list
         * @param serviceList List to which the service has to be added
         * @param service Service descriptor (identifier, constructor and dependency list)
         */
        private __addService(serviceList: IServiceDescriptor[], service: IServiceDescriptor): void {
            let s: IServiceDescriptor = this.__getService(serviceList, service.serviceInterfaceIdentifier);
            if (s !== null) {
                return;
            }
            serviceList.push(service);
        }

        /**
         * Returns the registered service
         * @param serviceList List to be looked up for the service
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns The service descriptor if the service is found, otherwise null
         */
        private __getService(serviceList: IServiceDescriptor[], serviceInterfaceIdentifier: any): IServiceDescriptor {
            for (let serviceDescriptor of serviceList) {
                if (serviceDescriptor.serviceInterfaceIdentifier === serviceInterfaceIdentifier) {
                    return serviceDescriptor;
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
            for (let instance of instanceList) {
                if (instance.serviceInstance === serviceInstance) {
                    return instance;
                }
            }
            return null;
        }

        /**
         * Returns the service instance identified by the service interface identifier
         * @param instanceList List of service instances to be looked up for the service instance
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns The service descriptor if the service instance was found, otherwise null
         */
        private __findServiceInstance(instanceList: IServiceInstance[], serviceInterfaceIdentifier: any): IServiceInstance {
            for (let instance of instanceList) {
                if (instance.serviceInterfaceIdentifier === serviceInterfaceIdentifier) {
                    return instance;
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
         * @param serviceInstance Instance of the service to be released
         */
        private __releaseInstanceReference(instanceList: IServiceInstance[], serviceInstance: any): boolean {
            let instance: IServiceInstance = this.__getServiceInstance(instanceList, serviceInstance);
            if (instance !== null) {

                if (instanceList === this.__singletonInstances) {
                    instance.referenceCount--;
                }

                if (instance.referenceCount === 0) {
                    let index: number = instanceList.indexOf(instance);
                    if (index !== -1) {
                        instanceList.splice(index, 1);
                    }
                }

                return instance.referenceCount === 0;
            }
            return false;
        }

        /**
         * Resolves service dependencies and constructs the service instance with passing configured dependencies and other configuration parameters to the service implementation constructor
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns Instaniated service or null if the service was not registered
         */
        private async __resolve<S>(serviceInterfaceIdentifier: any): Promise<S> {
            let instance: S;

            instance = await this.__resolveScoped<S>(serviceInterfaceIdentifier);
            if (instance !== null) {
                return instance;
            }

            instance = await this.__resolveSingleton<S>(serviceInterfaceIdentifier);
            if (instance !== null) {
                return instance;
            }

            instance = await this.__resolveTransient<S>(serviceInterfaceIdentifier);
            return instance;
        }

        /**
         * Constructs a new instance of transient service includind resolving of configured dependencies
         * The process of the instance construction includes dependency resolving and constructor argument mapping.
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns Instaniated service or null if the service was not registered
         */
        private async __resolveTransient<S>(serviceInterfaceIdentifier: any): Promise<S> {
            return await this.__constructService<S>(this.__transientServices, null, serviceInterfaceIdentifier);
        }

        /**
         * Looks for the existing service instance and returns it if found. Otherwise constructs a new instance
         * The process of the instance construction includes dependency resolving and constructor argument mapping.
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns Instaniated service or null if the service was not registered
         */
        private async __resolveScoped<S>(serviceInterfaceIdentifier: any): Promise<S> {

            let instance: IServiceInstance = this.__findServiceInstance(this.__scopedInstances, serviceInterfaceIdentifier);
            if (instance !== null) {
                instance.referenceCount++;
                return <S>instance.serviceInstance;
            }

            return await this.__constructService<S>(
                this.__scopedServices,
                this.__scopedInstances,
                serviceInterfaceIdentifier
            );
        }


        /**
         * Looks for the existing service instance and returns it if found. Otherwise constructs a new instance
         * The process of the instance construction includes dependency resolving and constructor argument mapping.
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns Instaniated service or null if the service was not registered
         */
        private async __resolveSingleton<S>(serviceInterfaceIdentifier: any): Promise<S> {
            let i: IServiceInstance = this.__findServiceInstance(this.__singletonInstances, serviceInterfaceIdentifier);
            if (i !== null) {
                return <S>i.serviceInstance;
            }

            let serviceInstance: S = await this.__constructService<S>(
                this.__singletonServices,
                this.__singletonInstances,
                serviceInterfaceIdentifier
            );

            this.__singletonInstances.push({
                serviceInterfaceIdentifier: serviceInterfaceIdentifier,
                serviceInstance: serviceInstance,
                referenceCount: 0
            });

            return serviceInstance;
        }

        /**
         * Resolves service dependencies and maps them to constuctor arguments. Finally, it constructs and initialzes the service
         * @param serviceList List of registered services to be looked for the service descriptor
         * @param serviceInterfaceIdentifier Identifier of the service interface
         * @returns Instaniated service or null if the service was not registered
         */
        private async __constructService<S>(
            serviceList: IServiceDescriptor[],
            instanceList: IServiceInstance[],
            serviceInterfaceIdentifier: any): Promise<S> {

            function containerConstructService(ctor: any, args: Array<any>): any {
                return new (ctor.bind.apply(ctor, [null].concat(args)));
            }

            let serviceDescriptor: IServiceDescriptor = this.__getService(serviceList, serviceInterfaceIdentifier);
            if (serviceDescriptor === null) {
                return null;
            }

            let params: any = await this.__resolveParameters(serviceDescriptor);
            let instance: S = containerConstructService(serviceDescriptor.serviceConstructor, params);

            if (instanceList !== null) {
                instanceList.push({
                    serviceInterfaceIdentifier: serviceInterfaceIdentifier,
                    serviceInstance: instance,
                    referenceCount: 1
                });
            }

            if (typeof (<any>instance).initialize === "function") {
                let initResult: undefined | Promise<any> = (<any>instance).initialize();

                if (initResult instanceof Promise) {
                    await initResult;
                }
            }

            return <S>instance;
        }

        /**
         * Resolves service depenancies and maps them to constructor arguments
         * @param service Service which dependencies should be resolved and mapped to constructor arguments
         * @returns Constructor argument list with resolved dependencies
         */
        private async __resolveParameters(service: IServiceDescriptor): Promise<any[]> {

            let ctorParams: any[] = [];

            if (service.serviceConfiguration.length === 0) {
                return ctorParams;
            }

            let i: number = 0;
            for (let parameter of service.serviceConfiguration) {

                let instance: any = await this.resolve(parameter, false);
                if (instance !== null) {
                    ctorParams.push(instance);
                } else {
                    if (parameter && typeof parameter === "object" && parameter !== null && "__diService__" in parameter) {
                        throw new UnableToResolveDependencyException(
                            "Service: '" + Utils.getClassName(service.serviceConstructor) + "', parameter index: '" + i + "'");
                    }
                    ctorParams.push(parameter);
                }
                i++;
            }

            return ctorParams;
        }

    }

}