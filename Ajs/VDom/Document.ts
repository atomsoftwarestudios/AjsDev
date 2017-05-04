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
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Simplified DOM Document implementation
     * <p>
     * The document purpose is to make possible fast and efficient management of
     * DOM node trees using the standard methods available for the DOM document inside
     * the browser. Its supposes to be used mainly on slower devices for shadow (or
     * virtual) DOM storages. The Ajs Framework uses it to store HTML templates to be
     * used for rendering and as a virtual back buffer for detecting changes made to
     * the DOM before it will be rendered.
     * </p>
     * <p>
     * The simpilfication of the document makes impossible to i.e. select particular elements
     * using CSS queries (no querySelecor is implemented), it is not possible to bind any events
     * to the VDOM document itself or any of its children as well as use CSS functions or character
     * set functions. Also, nodes and elemnets are implemented in simplest possible form so only
     * basic set of properties are available (i.e. nodeName, attributes). The purpose is not to
     * replace the full DOM, just to be possible to manage the virtual DOM struture (nodes and elements)
     * in the same way and using same methods as in case odf browsers DOM.
     * </p>
     */
    export class Document extends Node {

        /** Stores the document element used as the root for the DOM nodes tree */
        private __documentElement: HTMLElement;
        /** Returns the document element used as the root for the DOM nodes tree */
        public get documentElement(): HTMLElement { return this.__documentElement; }

        /** Stores the HEAD element of the HTML document. Internally refers to __documentElement.head */
        private __head: HTMLElement;
        /** Returns the HEAD element of the HTML document. Internally refers to __documentElement.head */
        public get head(): HTMLElement { return this.__head; }

        /** Stores the BODY element of the HTML document. Internally refers to __documentElement.head */
        private __body: HTMLElement;
        /** Returns the BODY element of the HTML document. Internally refers to __documentElement.head */
        public get body(): HTMLElement { return this.__body; }


        /**
         * Constructs the DOM document and makes it ready for work (i.e. inserting nodes programatically or loading the DOM from HTML)
         */
        constructor() {

            super(Node.DOCUMENT_NODE, "#document", null);

            this.__documentElement = this.createElement("html");

            this.__head = this.createElement("head");
            this.__documentElement.appendChild(this.__head);

            this.__body = this.createElement("body");
            this.__documentElement.appendChild(this.__body);

        }

        /**
         * Creates a new HTML element pertaining to the document
         * @param name Name of the element to be created;
         */
        public createElement(name: string): HTMLElement {
            return new HTMLElement(name, this);
        }

        /**
         * Creates a ne HTML text node pertaining to the document and sets its text value
         * @param text Text to be set to the node value
         */
        public createTextNode(text: string): Node {
            return new TextNode(text, this);
        }

        /**
         * Creates a new HTML comment element pertaining to the document and sets its text value
         * @param text Text to be set to the node value
         */
        public createComment(text: string): Node {
            return new CommentNode(text, this);
        }

        /**
         * Finds first occurance of the element with attribute named 'id' and the attribute value set to the passed value
         * @param id Value of the element's id attribute
         */
        public getElementById(id: string): HTMLElement {
            return this.__documentElement.getElementById(id);
        }

        /**
         * Returns collection of HTML elements whose has one of its class names set to passed value
         * @param name Name of the class to be searched for in the element class attribute
         */
        public getElementsByClassName(name: string): HTMLCollectionOf<Element> {
            return this.__documentElement.getElementsByClassName(name);
        }

        /**
         * Returns list of nodes whose name attribute is set to passed value
         * @param name Value of the element name attribute to be searched for
         */
        public getElementsByName(name: string): NodeListOf<HTMLElement> {
            return this.__documentElement.getElementsByName(name);
        }

        /**
         * Returns list of elements whose tag name matches the passed value
         * @param name Name of the tag to be searched for
         */
        public getElementsByTagName(name: string): NodeListOf<HTMLElement> {
            return this.__documentElement.getElementsByTagName(name);
        }

    }

}