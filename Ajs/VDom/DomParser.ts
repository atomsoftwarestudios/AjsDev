/*
The MIT License (MIT)

Copyright (c)2015 Tobias Nickel
Copyright (c)2017 Atom Software Studios, All rights reserved

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

namespace Ajs.VDom {

    "use strict";

    const OPEN_BRACKET: string = "<";
    const OPEN_BRACKET_CC: number = "<".charCodeAt(0);
    const CLOSE_BRACKET: string = ">";
    const CLOSE_BRACKET_CC: number = ">".charCodeAt(0);
    const MINUS_CC: number = "-".charCodeAt(0);
    const SLASH_CC: number = "/".charCodeAt(0);
    const EXCLAMATION_CC: number = "!".charCodeAt(0);
    const SINGLE_QUOTE_CC: number = "'".charCodeAt(0);
    const DOUBLE_QUOTE_CC: number = "\"".charCodeAt(0);
    const UNPAIR_NODE_NAMES: string[] = ["IMG", "BR", "INPUT", "META", "LINK"];
    const NAME_SPACER: string = "\n\t>/= ";

    /**
     * AjsVDOM implementation of xml/html parser originally developed by Tobias Nickel
     * <p>
     * Parser parses the HTML string to Ajs VDom object structure. It is supposed to be used
     * in web workers where standard DOM is not accessible. Both, the parser and DOM model
     * are simplified as much as possible so it does not contain full functionality. It is
     * mainly used by the #see [template manager]{Ajs.Templates.TemplateManager} to parse
     * and store HTML templates and by view component renderer to store the DOM in virtual
     * memory model before changes are applied to the target DOM (the one the user see's).
     * </p>
     */
    export class DomParser {

        /**
         * Document to be used to create nodes.
         */
        private __document: Document;

        /**
         * Returns a VDom document used to create parsed nodes
         */
        public get document(): Document { return this.__document; }

        /**
         * Input HTML document stream
         */
        private __stream: string;

        /**
         * Cursor pointing the current position in the stream being parsed
         */
        private __pos: number;

        /**
         * Constructs the Dom parser and setups the document to be used to parse the HTML nodes
         * <p>
         * If the document is not passed to the constructor the new document is created and used.
         * Document can be retrieved from #see [document]{Ajs.DomParser.document} property.
         * </p>
         * @param document Document to be used to create VDom nodes
         */
        public constructor(document?: Document) {
            this.__document = document || new Document();
        }

        /**
         * Parses the HTML string passed to the method and returns parsed root nodes populated with children
         * @param stream HTML string to be parsed
         */
        public parse(stream: string): Node | Node[] {

            // store information locally
            this.__pos = 0;
            this.__stream = stream;

            let rootNodes: Node[] = [];

            // find and parse all root nodes

            while (this.__pos !== -1) {

                if (this.__stream[this.__pos] === OPEN_BRACKET) {
                    let node: Node = this.__parseNode();
                    rootNodes.push(node);
                } else {
                    this.__pos++;
                }

                if (this.__pos > this.__stream.length - 1) {
                    this.__pos = -1;
                }

            }

            // return all found root nodes or single node if only one was found of null if no root nodes were found

            if (rootNodes.length > 1) {
                return rootNodes;
            } else {
                if (rootNodes.length === 1) {
                    return rootNodes[0];
                } else {
                    return null;
                }
            }
        }

        /**
         * Parses a node, including tagName, Attributes and its children
         * To parse children it uses the parseChildren that makes the parsing recursive
         */
        private __parseNode(): Node {

            this.__pos++;

            let tagName: string = this.__parseName();
            let node: Node = this.document.createElement(tagName);

            // parsing attributes
            while (this.__stream.charCodeAt(this.__pos) !== CLOSE_BRACKET_CC && this.__stream[this.__pos]) {

                let c: number = this.__stream.charCodeAt(this.__pos);

                // if character matches allowed attribute name characters
                if ((c > 64 && c < 91) || (c > 96 && c < 123)) {

                    // get the attribute name
                    let name: string = this.__parseName();

                    // search beginning of the string
                    let code: number = this.__stream.charCodeAt(this.__pos);

                    // search for attribute value or end of the tag
                    while (code &&
                        code !== SINGLE_QUOTE_CC &&
                        code !== DOUBLE_QUOTE_CC &&
                        !((code > 64 && code < 91) || (code > 96 && code < 123))
                        && code !== CLOSE_BRACKET_CC
                    ) {
                        this.__pos++;
                        code = this.__stream.charCodeAt(this.__pos);
                    }

                    // parse the value
                    let value: string;

                    if (code === SINGLE_QUOTE_CC || code === DOUBLE_QUOTE_CC) {
                        value = this.__parseString();
                        if (this.__pos === -1) {
                            return node;
                        }
                    } else {
                        value = null;
                        this.__pos--;
                    }

                    (<HTMLElement>node).setAttribute(name, value);
                }

                this.__pos++;

            }

            // optional parsing of children

            if (this.__stream.charCodeAt(this.__pos - 1) === SLASH_CC) {
                this.__pos++;
                return node;
            }

            let start: number;

            switch (node.nodeName) {

                case "SCRIPT":
                    start = this.__pos + 1;
                    this.__pos = this.__stream.indexOf("</" + "script>", this.__pos);
                    node.appendChild(this.__document.createTextNode(this.__stream.slice(start, this.__pos - 1)));
                    this.__pos += 8;
                    break;

                case "STYLE":
                    start = this.__pos + 1;
                    this.__pos = this.__stream.indexOf("</" + "style>", this.__pos);
                    node.appendChild(this.__document.createTextNode(this.__stream.slice(start, this.__pos - 1)));
                    this.__pos += 7;
                    break;

                default:
                    if (UNPAIR_NODE_NAMES.indexOf(node.nodeName) === -1) {
                        this.__pos++;
                        this.__parseChildren(node);
                    }
                    break;
            }

            return node;
        }


        /**
         * parsing a list of entries
         */
        private __parseChildren(parentNode: Node): void {

            while (this.__stream[this.__pos]) {

                // end of parent tag

                if (this.__stream.charCodeAt(this.__pos + 1) === SLASH_CC) {

                    this.__pos = this.__stream.indexOf(CLOSE_BRACKET, this.__pos);

                    if (this.__pos + 1) {
                        this.__pos += 1;
                    }

                    return;

                }

                // textNode

                if (this.__stream.charCodeAt(this.__pos) !== OPEN_BRACKET_CC) {

                    let text: string = this.__parseText();

                    if (text.trim().length > 0) {
                        parentNode.appendChild(this.__document.createTextNode(text));
                    }

                    this.__pos++;

                    continue;

                }

                // exclamation nodes (!DOCTYPE or !-- comments) are skipped  and not added to target document

                if (this.__stream.charCodeAt(this.__pos + 1) === EXCLAMATION_CC) {

                    if (this.__stream.charCodeAt(this.__pos + 2) === MINUS_CC) {

                        // comment node

                        while (
                            this.__pos !== -1 &&
                            !(this.__stream.charCodeAt(this.__pos) === CLOSE_BRACKET_CC &&
                                this.__stream.charCodeAt(this.__pos - 1) === MINUS_CC &&
                                this.__stream.charCodeAt(this.__pos - 2) === MINUS_CC && this.__pos !== -1)
                        ) {
                            this.__pos = this.__stream.indexOf(CLOSE_BRACKET, this.__pos + 1);
                        }

                        if (this.__pos === -1) {
                            this.__pos = this.__stream.length;
                        }

                    } else {

                        // doctype node

                        this.__pos += 2;

                        while (this.__stream.charCodeAt(this.__pos) !== CLOSE_BRACKET_CC && this.__stream[this.__pos]) {
                            this.__pos++;
                        }

                    }

                    this.__pos++;

                    continue;

                }

                // next children node

                let node: Node = this.__parseNode();
                parentNode.appendChild(node);
            }

        }

        /**
         * returns the text outside of texts until the first '<'
         */
        private __parseText(): string {

            let start: number = this.__pos;

            this.__pos = this.__stream.indexOf(OPEN_BRACKET, this.__pos) - 1;

            if (this.__pos === -2) {
                this.__pos = this.__stream.length;
            }

            return this.__stream.slice(start, this.__pos + 1);

        }

        /**
         * returns text until the first nonAlphebetic letter
         */
        private __parseName(): string {

            let start: number = this.__pos;

            while (NAME_SPACER.indexOf(this.__stream[this.__pos]) === -1 && this.__stream[this.__pos]) {
                this.__pos++;
            }

            return this.__stream.slice(start, this.__pos);
        }

        /**
         * is parsing a string, that starts with a char and with the same usually  ' or "
         */
        private __parseString(): string {

            let startChar: string = this.__stream[this.__pos];
            let startpos: number = ++this.__pos;
            this.__pos = this.__stream.indexOf(startChar, startpos);

            return this.__stream.slice(startpos, this.__pos);

        }

    }

}