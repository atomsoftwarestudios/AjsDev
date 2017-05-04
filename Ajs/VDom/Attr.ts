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

///<reference path="./INamedItem.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Simplified element attribute node
     */
    export class Attr implements INamedItem {

        /** Stores name of the attribute name and must be set during the construction of attribute object */
        private __name: string;
        /** Returns the name of the attribute */
        public get name(): string { return this.__name; }

        /** Stores owner elemenet of the attreibute and must be set during the consturction of the attribute object */
        private __ownerElement: Element;
        /** Returns owner element of the attribute object */
        public get ownerElement(): Element { return this.__ownerElement; };

        /** Can be used to set or get the attribute name */
        public value: string;

        /**
         * Consturcts the attribute and assigns it to particular element
         * @param ownerElement Element to which the attribute pertains
         * @param name Name of the attribute
         * @param value Optional attribute value. If not set the attribute value is set to null
         */
        public constructor(ownerElement: Element, name: string, value?: string) {
            this.__name = name;
            this.value = value || null;
        }

   }

}