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

///<reference path="./Node.ts" />
///<reference path="./Element.ts" />
///<reference path="./NodeListImpl.ts" />
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Represents collection of HTML elements of given type (only HTML element is supported now)
     */
    export type HTMLCollectionOf<T extends HTMLElement> = IHTMLCollectionOf<T>;

    /**
     * Represents collection of HTML elements of given type (only HTML element is supported now)
     */
    export interface IHTMLCollectionOf<T extends HTMLElement> {

        /** Collection indexer */
        [index: number]: T;

        /** Returns item at specified index of the collection. */
        item: (index: number) => T;

        /** Returns the specific node whose ID or, as a fallback, name matches the string specified by name. */
        namedItem: (name: string) => T;
        
    }

}