///<reference path="./Node.ts" />
///<reference path="./Element.ts" />
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Must be implemented by each object to be used in the NodeListOfImpl collection
     */
    export interface INode {
        /** Previous linked node or null if there is no any */
        previousSibling: INode;
        /** Next linked node or null if there is no any */
        nextSibling: INode;
        /** Parent node of the node (allowing to implement the tree structure) */
        parentNode: INode;
    }

    /**
     * Ajs VDom Implementation of the linked list focused on DOM model
     */
    export class NodeListOfImpl<T extends INode> implements NodeList {

        /** Holds reference to parent node in the node tree structure */
        private __parentNode: any;

        /** Holds reference to first child node in the collection */
        private __firstNode: T;
        /** Returns first child node in the children collection */
        public get firstNode(): T { return this.__firstNode; }

        /** Holds reference to last child node in the collection */
        private __lastNode: T;
        /** Returns last child node in the collection */
        public get lastNode(): T { return this.__lastNode; }

        /** Holds number of nodes in the collection */
        private __length: number;
        /** Returns the number of nodes in the collection */
        public get length(): number { return this.__length; }

        /**
         * Construct collection of nodes
         * @param parentNode Parent node of the node in the tree structure
         */
        constructor(parentNode: T) {
            this.__parentNode = parentNode;
            this.__firstNode = null;
            this.__lastNode = null;
            this.__length = 0;
        }

        /**
         * Returns item at specified index of the collection
         * <p>
         * Represents slow access to collection items as the collection must be iterated to
         * find an item at given index.
         * </p>
         * @param index Index of the node to be returned
         */
        public item(index: number): T {

            if (this.__firstNode === null) {
                return null;
            }

            let i: number = 0;
            let node: T = this.__firstNode;

            while (i !== index && node.nextSibling !== null) {
                node = <T>node.nextSibling;
                i++;
            }

            if (node !== null && i === index) {
                return node;
            } else {
                return null;
            }

        }

        /**
         * Returns index of the node in the collection
         * @param node Node to be searched for
         */
        public itemIndex(node: T): number {

            let i: number = 0;
            let n: T = this.__firstNode;

            while (n !== node && n.nextSibling !== null) {
                n = <T>n.nextSibling;
                i++;
            }

            if (n !== null && n === node) {
                return i;
            } else {
                return -1;
            }
        }

        /**
         * Appends a node to the end of the node collection
         * @param node Node to be appended
         */
        public append(node: T): void {

            if (this.__firstNode === null) {
                this.__firstNode = node;
            }

            if (this.__lastNode !== null) {
                this.__lastNode.nextSibling = node;
                node.previousSibling = this.__lastNode;
            }

            this.__lastNode = node;
            this.__length++;

        }

        /**
         * Inserts a node before a node already existing in the collection
         * @param newNode New node to be inserted.
         * @param beforeNode Node before whch the new node will be inserted
         */
        public insertBefore(newNode: T, beforeNode: T): void {

            if (beforeNode.parentNode !== this.__parentNode) {
                throw new BeforeNodeIsNotNodeChildrenException();
            }

            if (beforeNode.previousSibling !== null) {
                beforeNode.previousSibling.nextSibling = newNode;
                newNode.previousSibling = beforeNode.previousSibling;
            } else {
                newNode.previousSibling = null;
            }

            newNode.nextSibling = beforeNode;
            beforeNode.previousSibling = newNode;

            if (this.__firstNode === beforeNode) {
                this.__firstNode = newNode;
            }

            this.__length++;
        }

        /**
         * Removes a node at given index
         * @param index Index of the node to be removed
         */
        public remove(index: number): void {
            let item: T = this.item(index);
            if (item !== null) {
                this.removeNode(item);
            }
        }

        /**
         * Removes a node from the collection
         * @param node Node to be removed from the collection
         */
        public removeNode(node: T): void {

            if (node.parentNode !== this.__parentNode) {
                throw new NodeIsNotChildrenNodeException();
            }

            if (this.__lastNode === node) {
                if (node.previousSibling) {
                    this.__lastNode = <T>node.previousSibling;
                } else {
                    this.__lastNode = null;
                }
            }

            if (this.__firstNode === node) {
                if (node.nextSibling) {
                    this.__firstNode = <T>node.nextSibling;
                } else {
                    this.__firstNode = null;
                }
            }

            if (node.previousSibling && node.nextSibling) {
                node.previousSibling.nextSibling = node.nextSibling;
                node.nextSibling.previousSibling = node.previousSibling;
                this.__length--;
                return;
            }

            if (node.previousSibling) {
                node.previousSibling.nextSibling = null;
            }

            if (node.nextSibling) {
                node.nextSibling.previousSibling = null;
            }

            this.__length--;

        }

        /**
         * Replaces existing node with a new one
         * @param newNode New node to replace already existing node in the collection
         * @param oldNode Ols node to be replaced with a new node
         */
        public replaceNode(newNode: T, oldNode: T): void {

            if (oldNode.parentNode !== this.__parentNode) {
                throw new BeforeNodeIsNotNodeChildrenException();
            }

            newNode.parentNode = this.__parentNode;

            if (oldNode.previousSibling) {
                newNode.previousSibling = oldNode.previousSibling;
                newNode.previousSibling.nextSibling = newNode;
            }

            if (oldNode.nextSibling) {
                newNode.nextSibling = oldNode.nextSibling;
                newNode.nextSibling.previousSibling = newNode;
            }

            if (this.__firstNode === oldNode) {
                this.__firstNode = newNode;
            }

            if (this.__lastNode === oldNode) {
                this.__lastNode = newNode;
            }

        }

    }

}