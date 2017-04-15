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

namespace Ajs.UI {

    "use strict";

    export class RenderTarget {

        protected static _renderTarget: HTMLElement;

        public static setDOMElement(renderTargetElementId: string): void {
            RenderTarget._renderTarget = document.getElementById(renderTargetElementId);
            if (!RenderTarget._checkDOM()) {
                console.error("Invalid render target DOM specification!");
            }
        }

        public static hide(): void {
            if (!RenderTarget._checkDOM()) {
                return;
            }
            RenderTarget._renderTarget.style.display = "none";
        }

        public static show(): void {
            if (!RenderTarget._checkDOM()) {
                return;
            }
            RenderTarget._renderTarget.style.display = "";
        }

        protected static _checkDOM(): boolean {
            return !(RenderTarget._renderTarget === undefined || RenderTarget._renderTarget === null);
        }

    }

}
