namespace Ajs.VDom {

    "use strict";

    /**
     * Represents a node of the text type
     */
    export class TextNode extends Node {

        /**
         * Constructs the new text node
         * @param text Text to be set to the new node
         * @param ownerDocument Document owning the new node
         */
        public constructor(text: string, ownerDocument: Document) {
            super(Node.TEXT_NODE, "#text", ownerDocument);
            this._nodeValue = text;
        }

    }

}