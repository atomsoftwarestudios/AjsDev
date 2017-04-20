﻿/* *************************************************************************
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

    export const IIContainer: IContainer = DI.II;

    /**
     * Describes the DI container implementation used within the Ajs Framework
     */
    export interface IContainer {

        addTransient<ServiceInterface extends IServiceType, ConstructorParams extends IServiceConstructorParameters>(
            interfaceIdentifier: IServiceInterfaceIdentifier<ServiceInterface>,
            classToConstruct: Ctor,
            constructorParameters: ConstructorParams): Container;

        addScoped<ServiceInterface extends IServiceType, ConstructorParams extends IServiceConstructorParameters>(
            interfaceIdentifier: IServiceInterfaceIdentifier<ServiceInterface>,
            classToConstruct: Ctor,
            constructorParameters: ConstructorParams): Container;

        addSingleton<ServiceInterface extends IServiceType, ConstructorParams extends IServiceConstructorParameters>(
            interfaceIdentifier: IServiceInterfaceIdentifier<ServiceInterface>,
            classToConstruct: Ctor,
            constructorParameters: ConstructorParams): Container;

        resolve<ServiceInterface extends IServiceType>(
            interfaceIdentifier: IServiceInterfaceIdentifier<ServiceInterface>,
            throwUnresolvedException?: boolean): ServiceInterface;

        releaseSingletonInstanceReference(serviceInstance: any): void;

        releaseScopedInstanceReference(serviceInstance: any): boolean;

    }

}