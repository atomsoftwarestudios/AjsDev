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

namespace AjsDoc.Components {

    "use strict";

    export interface IAjsDocMemberState {
    }

    @Ajs.viewcomponent()
    export class AjsDocMemberComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<IAjsDocMemberFunctionParamsState, any>
        implements IAjsDocMemberFunctionParamsState {

        public get isExported(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Export) !== 0;
        }

        public get isPublic(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Public) !== 0;
        }

        public get isPrivate(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Private) !== 0;
        }

        public get isProtected(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Protected) !== 0;
        }

        public get isAbstract(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Abstract) !== 0;
        }

        public get isStatic(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).modifierFlags & atsdoc.ModifierFlags.Static) !== 0;
        }

        public get isLet(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).atsNodeFlags & atsdoc.ATsDocNodeFlags.let) !== 0;
        }

        public get isVar(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).atsNodeFlags & atsdoc.ATsDocNodeFlags.var) !== 0;
        }

        public get isConst(): boolean {
            return ((<atsdoc.IATsDocNode><any>this).atsNodeFlags & atsdoc.ATsDocNodeFlags.const) !== 0;
        }

    }

}
