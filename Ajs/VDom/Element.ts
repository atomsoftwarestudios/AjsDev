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

///<refernece path="./Node.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Element represents specialized DOM node type extendind node of XML/HTML element capabilities
     * <p>
     * Element is simplified implementation of standard DOM element just for purpose of management of
     * the virtual DOM structure. It does not implement i.e. binding of event handlers using the
     * addEventListener and many other functionalities.
     * </p>
     */
    export class Element extends Node {

        /** Holds list of attributes related to the given element */
        private __attributes: NamedNodeMap<Attr>;
        /** Returns named node map of element attributes (name/value pair structures) */
        public get attributes(): NamedNodeMap<Attr> { return this.__attributes; }

        /**
         * Constructs a new element node assigning it its name and owner document
         * @param name Name of the element to be created (i.e. img)
         * @param ownerDocument Document owning the element even when the element is children of another element in the document
         */
        constructor(name: string, ownerDocument: Document) {

            super(Node.ELEMENT_NODE, name.toUpperCase(), ownerDocument);

            this.__attributes = new NamedNodeMap<Attr>();

        }

        /**
         * Returns value of the given element named attribute.
         * @param name Name of the attribute whose value has to be returned
         * @returns Returns null if the named attribute does not exist within the element
         */
        public getAttribute(name: string): string {
            let attr: Attr = this.__attributes.getNamedItem(name);
            if (attr === null) {
                return null;
            }
            return attr.value;
        }

        /**
         * Sets element named attribute to given value
         * @param name Name of the attribute to be set
         * @param value Value of the attribute to be set
         */
        public setAttribute(name: string, value: string): void {
            let attr: Attr = new Attr(this, name, value);
            this.__attributes.setNamedItem(attr);
        }

        /**
         * Returns the object of #see [Attr]{Ajs.VDom.Attr} class defining the element's named attribute.
         * @param name Name of the element attribute to be returned
         * @returns Returns null if the named attribute does not exist within the element
         */
        public getAttributeNode(name: string): Attr {
            return this.__attributes.getNamedItem(name);
        }

        /**
         * Sets the object of the #see [Attr]{Ajs.VDom.Attr} class defining the element's named attribute.
         * <p>
         * If another attribute object with the same name exist already within the node it is replaced
         * by passed value.
         * <p>
         * @param attribute Attribute object to be added to the element.
         */
        public setAttributeNode(attribute: Attr): Attr {
            return this.__attributes.setNamedItem(attribute);
        }

        /**
         * Checks if the element has the named attribute set
         * @param name Name of the attribute to be checked
         */
        public hasAttribute(name: string): boolean {
            return this.__attributes.getNamedItem(name) !== null;
        }

        /**
         * Returns HTML code of all elements contained by the element
         * @returns HTML code of the element tree contained by the element
         */
        public get innerHTML(): string {

            let html: string = "";

            let node: Node = <Node>this.childNodes.item(0);

            while (node !== null) {

                switch (node.nodeType) {
                    case Node.COMMENT_NODE:
                        html += "<!--" + node.nodeValue + "-->";
                        break;
                    case Node.DOCUMENT_NODE:
                        html += node.textContent;
                        break;
                    case Node.ELEMENT_NODE:
                        html += (<Element>node).__html;
                        break;
                    case Node.TEXT_NODE:
                        html += node.textContent;
                        break;
                    default:
                        throw new InvalidNodeTypeException();
                }

                node = node.nextSibling;
            }

            return html;
        }

        /**
         * Parses given HTML code and constructs the DOM node structure under the element
         * <p>
         * #see [VDom DomParser]{Ajs.VDom.DomParser} is used for this purpose. As it is implemented
         * as simplest as it was possible there are no any validity checks inside of it so it could
         * also crash if the HTML code passed to it is not valid. Only valid HTML code should be passed
         * to this function.
         * </p>
         */
        public set innerHTML(html: string) {

            let parser: DomParser = new DomParser(this.ownerDocument);

            let parsed: any = parser.parse(html);

            if (parsed instanceof Array) {
                for (let o of parsed) {
                    this.appendChild(o);
                }
            } else {
                this.appendChild(parsed);
            }


        }

        /**
         * Returns HTML code of the element including the complete node tree it contains
         */
        public get outerHTML(): string {
            return this.__html;
        }

        /**
         * Finds first occurance of the element with attribute named 'id' and the attribute value set to the passed value
         * @param id Value of the element's id attribute
         */
        public getElementById(id: string): HTMLElement {

            if (this.hasAttribute("id") && this.getAttribute("id") === id) {
                return this;
            }

            let node: Node = <Node>this.childNodes.item(0);

            while (node !== null) {

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    node = node.nextSibling;
                    continue;
                }

                let e: HTMLElement = (<HTMLElement>node).getElementById(id);

                if (e !== null) {
                    return e;
                }

                node = node.nextSibling;
            }

            return null;
        }

        /**
         * Returns collection of HTML elements whose has one of its class names set to passed value
         * @param name Name of the class to be searched for in the element class attribute
         */
        public getElementsByClassName(name: string): HTMLCollectionOf<Element> {
            return this.__getElementsByClassName(name);
        }

        /**
         * Returns list of nodes whose name attribute is set to passed value
         * @param name Value of the element name attribute to be searched for
         */
        public getElementsByName(name: string): NodeListOf<HTMLElement> {
            return this.__getElementsByName(name);
        }

        /**
         * Returns list of elements whose tag name matches the passed value
         * @param name Name of the tag to be searched for
         */
        public getElementsByTagName(name: string): NodeListOf<HTMLElement> {
            return this.__getElementsByTagName(name.toUpperCase());
        }

        /**
         * Returns HTML code of the element (outer HTML) including all its children elements
         */
        private get __html(): string {

            const UnpairNodeNames: string[] = ["IMG", "BR", "INPUT", "META", "LINK"];

            let html: string = "<" + this.nodeName.toLowerCase();

            for (let i: number = 0, j: number = this.__attributes.length; i < j; i++) {
                let atr: Attr = this.__attributes.item(i);
                html += " " + atr.name;
                if (atr.value) {
                    html += "=\"" + atr.value + "\"";
                }
            }

            if (UnpairNodeNames.indexOf(this.nodeName) !== -1) {
                html += " /";
            } else {
                html += ">";
                html += this.innerHTML;
                html += "</" + this.nodeName.toLowerCase();
            }

            html += ">";

            return html;
        }

        /**
         * Finds first occurance of the element with attribute named 'id' and the attribute value set to the passed value
         * @param id Value of the element's id attribute
         */
        private __getElementsByClassName(name: string, elements?: HTMLCollectionOfImpl): HTMLCollectionOf<Element> {

            let els: HTMLCollectionOfImpl = elements || new HTMLCollectionOfImpl();

            if (this.__hasClassName(name)) {
                els.push(this);
            }

            let node: Node = <Node>this.childNodes.item(0);

            while (node !== null) {

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    node = node.nextSibling;
                    continue;
                }

                (<Element>node).__getElementsByClassName(name, els);

                node = node.nextSibling;

            }

            return els;

        }

        /**
         * Returns collection of HTML elements whose has one of its class names set to passed value
         * @param name Name of the class to be searched for in the element class attribute
         */
        private __hasClassName(name: string): boolean {

            let classVal: string = this.getAttribute("class");

            if (classVal == null) {
                return false;
            }

            let classes: string[] = classVal.split(" ");

            return classes.indexOf(name) !== -1;
        }

        /**
         * Returns list of nodes whose name attribute is set to passed value
         * @param name Value of the element name attribute to be searched for
         */
        private __getElementsByName(name: string, elements?: NodeListOfImpl<HTMLElement>): NodeListOf<HTMLElement> {

            let els: NodeListOfImpl<HTMLElement> = elements || new NodeListOfImpl<HTMLElement>(this);

            if (this.getAttribute("name") === name) {
                els.append(this);
            }

            let node: Node = <Node>this.childNodes.item(0);

            while (node !== null) {

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    node = node.nextSibling;
                    continue;
                }

                (<Element>node).__getElementsByName(name, els);

                node = node.nextSibling;

            }

            return els;

        }

        /**
         * Returns list of elements whose tag name matches the passed value
         * @param name Name of the tag to be searched for
         */
        private __getElementsByTagName(name: string, elements?: NodeListOfImpl<HTMLElement>): NodeListOf<HTMLElement> {

            let els: NodeListOfImpl<HTMLElement> = elements || new NodeListOfImpl<HTMLElement>(this);

            if (this.nodeName === name) {
                els.append(this);
            }

            let node: Node = <Node>this.childNodes.item(0);

            while (node !== null) {

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    node = node.nextSibling;
                    continue;
                }

                (<Element>node).__getElementsByTagName(name, els);

                node = node.nextSibling;

            }

            return els;

        }

    }

}