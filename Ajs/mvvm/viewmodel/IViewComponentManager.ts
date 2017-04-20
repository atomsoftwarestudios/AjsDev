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

namespace Ajs.MVVM.ViewModel {

    "use strict";

    export const IIViewComponentManager: IViewComponentManager = DI.II;
    
    export interface IViewComponentManager {
        readonly components: IRegisteredViewComponentsDict;

        registerComponents(...componentConstructor: CtorTyped<IViewComponent>[]): void;

        addComponentDependencies<ConfigParams>(
            component: CtorTyped<IViewComponent>,
            dependencies: ConfigParams): IViewComponentManager;

        createViewComponent(name: string, id: string, parentComponent: IViewComponent, state?: IViewComponentState): IViewComponent;

        removeComponentInstance(component: IViewComponent): void;

        getComponentConstructorByName(name: string): CtorTyped<IViewComponent>;

        getComponentInstanceByComponentId(componentId: number): IViewComponent;

        getChildrenComponentInstances(component: ViewComponent<any, any>): IViewComponent[];

        getComponentInstances(component: typeof ViewComponent, id?: string, userKey?: string): IViewComponent[];

        getFirstComponentInstance<T extends IViewComponent>(component: typeof ViewComponent, id?: string, userKey?: string): T;

        setRootViewComponentName(name: string): void;

        onNavigate(): void;
    }

}
