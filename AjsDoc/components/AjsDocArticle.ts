/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

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

namespace ajsdoc {

    "use strict";

    export interface IHierarchyNodeState {
        path?: string;
        name: string;
        extends?: IHierarchyNodeState;
    }

    export interface IImplementedTypeState {
        key: string;
        path?: string;
        name: string;
    }

    export interface INodeState extends ajs.mvvm.viewmodel.IViewStateSet, atsdoc.IATsDocNode {
        key: string;
        isLast: boolean;
        path: string;
    }

    export interface IAjsDocArticleState extends ajs.mvvm.viewmodel.IViewStateSet {
        caption?: string;
        description?: string;
        longDescription?: string;
        hierarchy?: IHierarchyNodeState;
        implements?: IImplementedTypeState[];
        declarations?: atsdoc.IATsDocNode[];
        modules?: atsdoc.IATsDocNode[];
        namespaces?: atsdoc.IATsDocNode[];
        functions?: atsdoc.IATsDocNode[];
        classes?: atsdoc.IATsDocNode[];
        interfaces?: atsdoc.IATsDocNode[];
        constants?: atsdoc.IATsDocNode[];
        variables?: atsdoc.IATsDocNode[];
        enumerations?: atsdoc.IATsDocNode[];
        objectLiterals?: atsdoc.IATsDocNode[];
        constructors?: atsdoc.IATsDocNode[];
        properties?: atsdoc.IATsDocNode[];
        methods?: atsdoc.IATsDocNode[];
        accessors?: atsdoc.IATsDocNode[];
        enumMembers?: atsdoc.IATsDocNode[];
        parameters?: atsdoc.IATsDocNode[];
        returnValue?: atsdoc.IATsDocNode;
    }

    export class AjsDocArticle extends ajs.mvvm.viewmodel.ViewComponent implements IAjsDocArticleState {

        protected _renderedListener: ajs.events.IListener<void>;

        public caption?: string;
        public description?: string;
        public hierarchy?: IHierarchyNodeState;
        public implements?: IImplementedTypeState[];
        public declarations?: atsdoc.IATsDocNode[];
        public modules?: atsdoc.IATsDocNode[];
        public namespaces?: atsdoc.IATsDocNode[];
        public functions?: atsdoc.IATsDocNode[];
        public classes?: atsdoc.IATsDocNode[];
        public interfaces?: atsdoc.IATsDocNode[];
        public constants?: atsdoc.IATsDocNode[];
        public variables?: atsdoc.IATsDocNode[];
        public enumerations?: atsdoc.IATsDocNode[];
        public objectLiterals?: atsdoc.IATsDocNode[];
        public constructors?: atsdoc.IATsDocNode[];
        public properties?: atsdoc.IATsDocNode[];
        public accessors?: atsdoc.IATsDocNode[];
        public methods?: atsdoc.IATsDocNode[];
        public enumMembers?: atsdoc.IATsDocNode[];
        public parameters?: atsdoc.IATsDocNode[];
        public returnValue?: atsdoc.IATsDocNode;

        public get hasHierarchy(): boolean { return this.hierarchy !== undefined && this.hierarchy !== null; }
        public get hasImplements(): boolean { return this.hierarchy !== undefined && this.hierarchy !== null; }
        public get hasDeclarations(): boolean { return this.declarations instanceof Array && this.declarations.length > 0; }
        public get hasModules(): boolean { return this.modules instanceof Array && this.modules.length > 0; }
        public get hasNamespaces(): boolean { return this.namespaces instanceof Array && this.namespaces.length > 0; }
        public get hasFunctions(): boolean { return this.functions instanceof Array && this.functions.length > 0; }
        public get hasClasses(): boolean { return this.classes instanceof Array && this.classes.length > 0; }
        public get hasInterfaces(): boolean { return this.interfaces instanceof Array && this.interfaces.length > 0; }
        public get hasConstants(): boolean { return this.constants instanceof Array && this.constants.length > 0; }
        public get hasVariables(): boolean { return this.variables instanceof Array && this.variables.length > 0; }
        public get hasEnumerations(): boolean { return this.enumerations instanceof Array && this.enumerations.length > 0; }
        public get hasObjectLiterals(): boolean { return this.objectLiterals instanceof Array && this.objectLiterals.length > 0; }
        public get hasConstructors(): boolean { return this.constructors instanceof Array && this.constructors.length > 0; }
        public get hasProperties(): boolean { return this.properties instanceof Array && this.properties.length > 0; }
        public get hasMethods(): boolean { return this.methods instanceof Array && this.methods.length > 0; }
        public get hasAccessors(): boolean { return this.accessors instanceof Array && this.accessors.length > 0; }
        public get hasEnumMembers(): boolean { return this.enumMembers instanceof Array && this.enumMembers.length > 0; }
        public get hasParameters(): boolean { return this.parameters instanceof Array && this.parameters.length > 0; }
        public get hasReturnValue(): boolean { return this.hasOwnProperty("returnValue"); }

        public get hasMembers(): boolean {
            return false ||
                this.hasConstructors ||
                this.hasProperties ||
                this.hasAccessors ||
                this.hasMethods ||
                this.hasEnumMembers;
        }


        public setState(state: IAjsDocArticleState): void {
            super.setState(state);
        }

        protected _initialize(): void {
            this._renderedListener = (sender: ajs.mvvm.viewmodel.ViewComponent) => {
                this._rendered();
                return true;
            };

            this.ajs.view.renderDoneNotifier.subscribe(this._renderedListener);
        }

        protected _finalize(): void {
            this.ajs.view.renderDoneNotifier.unsubscribe(this._renderedListener);
        }

        protected _rendered(): void {
            let pre: NodeListOf<HTMLPreElement> = document.getElementsByTagName("pre");
            for (let i: number = 0; i < pre.length; i++) {
                hljs.highlightBlock(pre[i]);
            }
        }

    }

    ajs.Framework.viewComponentManager.registerComponents(AjsDocArticle);

}