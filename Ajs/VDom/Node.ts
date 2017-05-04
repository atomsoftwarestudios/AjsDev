namespace Ajs.VDom {

    "use strict";

    /**
     * Ajs VDOM implementation of the DOM node - the node of the DOM document.
     * <p>
     * In the Ajs VDom the node implementation is simplified to lowest possible level as
     * some noe types are not required to be used. Also, xml namespaces are not supported
     * by the VDOM to simplify and shorten the code neccessary to serve such functionalities.
     * </p>
     */
    export class Node implements INode {

        /** Element node type identification */
        public static readonly ELEMENT_NODE: number = 1;
        /** Text node type identification */
        public static readonly TEXT_NODE: number = 3;
        /** Comment node type identification */
        public static readonly COMMENT_NODE: number = 8;
        /** Document node type identification */
        public static readonly DOCUMENT_NODE: number = 9;

        /** Stores the type of the node (one of ELEMENT_NODE, TEXT_NODE,COMMENT_NODE or DOCUMENT_NODE values) */
        private __nodeType: number;
        /** Name of the node (and of the tag in textual representation) i.e. A or DIV */
        private __nodeName: string;
        /** Reference to the parent node of the current note in the DOM tree structure */
        private __parentNode: Node;
        /** Reference to the document owning the node */
        private __ownerDocument: Document;
        /** Collection of children nodes of the current node */
        private __childNodes: NodeListOfImpl<Node>;

        /** Value is valid only for Text and Comment nodes. For other nodes it returns null and can't be set */
        protected _nodeValue: string;

        /** Holds reference to previous node in the linked list.
         * <p>null value is set if the current node is first node in the list</p>
         * <p>For simplification, it is read/write property but should be considered as read only in the user code</p>
         */
        public previousSibling: Node;

        /** Holds reference to next node in the linked list.
         * <p>null value is set if the current node is last node in the list</p>
         * <p>For simplification, it is read/write property but should be considered as read only in the user code</p>
         */
        public nextSibling: Node;

        /**
         * Constructs a node
         * @param nodeType Type of the node to be constructed (one of ELEMENT_NODE, TEXT_NODE,COMMENT_NODE or DOCUMENT_NODE values)
         * @param nodeName Name of the node
         * @param ownerDocument Document used to manage the node
         */
        public constructor(
            nodeType: number,
            nodeName: string,
            ownerDocument: Document
        ) {
            this.__parentNode = null;
            this.__nodeType = nodeType;
            this.__nodeName = nodeName;
            this.__ownerDocument = ownerDocument;
            this.__childNodes = new NodeListOfImpl<Node>(this);
            this._nodeValue = null;
            this.nextSibling = null;
            this.previousSibling = null;
        }

        /**
         * returns the top-level node for this node what is actually document
         */
        public get ownerDocument(): Document {
            return this.__ownerDocument;
        }

        /**
         * Type of the node (one of ELEMENT_NODE, TEXT_NODE,COMMENT_NODE or DOCUMENT_NODE values)
         */
        public get nodeType(): number {
            return this.__nodeType;
        }

        /**
         * String name of the node (usually the same name as HTML tags are represented with)
         */
        public get nodeName(): string {
            return this.__nodeName;
        }

        /**
         * Returns the parent node in the DOM tree structure
         */
        public get parentNode(): Node {
            return this.__parentNode;
        }

        /**
         * Sets the parent node in the DOM tree structure
         */
        public set parentNode(node: Node) {
            this.__parentNode = node;
        }

        /**
         * Returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
         */
        public get parentElement(): Element {
            if (this.__parentNode.__nodeType !== Node.ELEMENT_NODE) {
                return null;
            }
            return <Element>this.__parentNode;
        }

        /** Returns value of the node. Values are valid only for Text and Comment nodes. For other nodes it returns null. */
        public get nodeValue(): string {
            if (this.__nodeType !== Node.TEXT_NODE && this.__nodeType !== Node.COMMENT_NODE) {
                return null;
            }
            return this._nodeValue;
        }

        /** Sets value of the node. Values can be set only to Text and Comment nodes */
        public set nodeValue(value: string) {
            if (this.__nodeType !== Node.TEXT_NODE && this.__nodeType !== Node.COMMENT_NODE) {
                return;
            }
            this._nodeValue = value;
        }

        /**
         * Returns text content of the node tree starting by the current node. Only textual values are returned.
         */         
        public get textContent(): string {

            if (this.__nodeType === Node.DOCUMENT_NODE) {
                return null;
            }

            let value: string = this.nodeValue || "";

            let node: Node = this.__childNodes.firstNode;

            while (node !== null) {
                value += node.textContent || "";
                node = node.nextSibling;
            }

            return value;

        }

        /**
         * Returns the same value as the property in VDom implementation
         * <p>
         * Compared to #see [textContent]{Ajs.VDom.textContent} text content of comment nodes
         * is not included in the current output.
         * </p>
         */
        public get innerText(): string {

            if (this.__nodeType === Node.COMMENT_NODE) {
                return null;
            }

            let value: string = this.nodeValue || "";

            let node: Node = this.__childNodes.firstNode;

            while (node !== null) {
                value += node.innerText || "";
                node = node.nextSibling;
            }

            return value;
        }

        /**
         * Returns a Boolean value indicating whether the current Node has child nodes or not
         */
        public hasChildNodes(): boolean {
            return this.__childNodes.length > 0;
        }

        /**
         * Returns a Boolean value indicating whether a node is a descendant of a given node or not.
         * @param node Node to be checked
         */
        public contains(node: Node): boolean {
            return this.__childNodes.itemIndex(node) !== -1;
        }

        /**
         * Returns a collection of child nodes of the given node
         */
        public get childNodes(): NodeList {
            return this.__childNodes;
        }

        /**
         * Returns first children node of the node
         */
        public get firstChild(): Node {
            return this.__childNodes.firstNode;
        }

        /**
         * Returns last children node of the node
         */
        public get lastChild(): Node {
            return this.__childNodes.lastNode;
        }

        /**
         * Appends a children node to the end of the children node collection
         * @param node Node to be appended
         */
        public appendChild(node: Node): Node {
            this.__childNodes.append(node);
            node.__parentNode = this;
            return node;
        }

        /**
         * Inserts a node before already existing node in the children collection
         * @param newNode Node to be inserted
         * @param beforeNode Existing node before which the new node will be inserted
         */
        public insertBefore(newNode: Node, beforeNode: Node): Node {
            this.__childNodes.insertBefore(newNode, beforeNode);
            newNode.__parentNode = this;
            return newNode;
        }

        /**
         * Replaces existing children node with another one
         * @param newNode New node to be used to replace an old node
         * @param oldNode Old note to be replaced with a new node
         */
        public replaceChild(newNode: Node, oldNode: Node): Node {
            this.__childNodes.replaceNode(newNode, oldNode);
            newNode.__parentNode = this;
            return newNode;
        }

        /**
         * Removes children node from the children collection
         * @param node Node to be removed
         */
        public removeChild(node: Node): void {
            this.__childNodes.removeNode(node);
        }
    }

}