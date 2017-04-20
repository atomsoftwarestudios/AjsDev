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

/**
 * Document namespace contains the document manager and related interfaces
 * It is used internally by the view to manage document stylesheets and update
 * the DOM node tree if it is changed.
 */
namespace Ajs.Doc {

    "use strict";

    export interface ICPDocumentManager {
        resourceManager: typeof Resources.IIResourceManager;
        renderTarget: Element;
    }

    /**
     * Document manager is wrapper around the DOM Document with support of additional features
     * <p>
     * Document manager currently supports IComponents to be used as document HTML components. Internally, by Ajs,
     * the IComponent represents ViewComponent instances assignet to root nodes of each view component.
     * </p>
     * <p>
     * Document manager also performs the DOM structure update. It is based on the React idea so it updates
     * only changed nodes and attributes in order to be as fastest as possible.
     * </p>
     * <p>
     * It also supports loading of style sheets from templates and updating them with the managed resource
     * values so basically, offline resources can be used in stylesheets without explicit need of storing them
     * in the application cache.
     * </p>
     */
    export class DocumentManager implements IDocumentManager {

        /** Stores reference to resource manager */
        private __resourceManager: Resources.IResourceManager;

        /** Stores target document - the managed document */
        private __targetDocument: Document;

        /** Stores the render target */
        private __renderTarget: Element;
        public get renderTarget(): Element { return this.__renderTarget; }

        /** Stores list of stylesheets applied from templates */
        private __styleSheets: string[];

        /** Internal uniwue ID generator for rendered elements */
        private __uniqueId: number;
        protected get _uniqeId(): number { this.__uniqueId++; return this.__uniqueId; };

        /** Workaround for Safari Mobile - don't remove anything before touch end! */
        private __touchEventsCount: number;

        /**
         * Constructs the document manager
         * @param targetDocument The document to be managed
         */
        constructor(
            resourceManager: Resources.IResourceManager,
            renderTarget: Element) {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Constructor, 0, "ajs.doc", this);

            if (renderTarget === undefined || renderTarget === null) {

                Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, "ajs.doc", this,
                    "Render target not set or does not exist in the document. Using document.body");

                renderTarget = document.body;
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Managing the DOM document", renderTarget.ownerDocument);

            this.__resourceManager = resourceManager;
            this.__renderTarget = renderTarget;
            this.__targetDocument = renderTarget.ownerDocument;
            this.__styleSheets = [];
            this.__touchEventsCount = 0;

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);
        }

        /**
         * Cleans up the managed document
         */
        public clean(renderTarget: Element): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Cleaning up the target document and render target", this.__targetDocument, renderTarget);

            // check if the renderTarget requested to be clean is in the managed document
            if (renderTarget.ownerDocument !== this.__targetDocument) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                    "Render target is not contained in the managed document", this.__targetDocument, renderTarget);
                throw new RenderTargetNotInManagedDocumentException();
            }

            // remove managed stylesheets
            let styleSheets: NodeListOf<HTMLStyleElement> = this.__targetDocument.head.getElementsByTagName("style");
            for (let i: number = 0; i < styleSheets.length; i++) {
                if (styleSheets.item(i).hasAttribute("id") &&
                    this.__styleSheets.indexOf(styleSheets.item(i).getAttribute("id")) !== -1) {
                    this.__targetDocument.head.removeChild(styleSheets.item(i));
                }
            }

            // clean stylesheets
            this.__styleSheets = [];

            // removes tree bottom down from node
            function removeTree(node: INode): void {

                // do the following procedure for all children
                for (let i: number = 0; i < node.childNodes.length; i++) {
                    removeTree(node.childNodes.item(i) as INode);
                }

                // if node has ajsData
                if (node.ajsData) {
                    // remove event listeners
                    for (let i: number = 0; i < node.ajsData.eventListeners.length; i++) {
                        node.removeEventListener(node.ajsData.eventListeners[i].eventType, node.ajsData.eventListeners[i].eventListener);
                    }

                    // and remove ajsData from node
                    node.ajsData = null;
                    delete node.ajsData;
                }

                node.parentNode.removeChild(node);
            }

            // all elements in render target
            for (let i: number = 0; i < this.__renderTarget.childNodes.length; i++) {
                removeTree(this.__renderTarget.childNodes.item(i) as INode);
            }

            renderTarget.innerHTML = "";

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);
        }

        /**
         * Walks the target DOM and applies changes from source (usually shadow) DOM
         * @param source DOM node (usually from shadow DOM) structure to be set to target
         * @param target Target to be updated
         */
        public updateDom(source: Node, target: Node): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Updating DOM structure", source, target);

            // check if the renderTarget requested to be updated is in the managed document
            if (target.ownerDocument !== this.__targetDocument) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                    "Render target is not contained in the managed document", this.__targetDocument, target);
                throw new RenderTargetNotInManagedDocumentException();
            }

            // just retype the node to INode, extended information is checked in all cases
            let src: INode = source as INode;
            let tgt: INode = target as INode;

            // if the source has a metadata and the target has no any or has a different metadata than the source
            if (src.ajsData && (!tgt.ajsData || src.ajsData.component !== tgt.ajsData.component)) {

                // this is just safety check. theoretically, situation with unknown target or parent should not never occur
                if (target !== undefined && target !== null && target.parentNode !== undefined && target.parentNode !== null) {

                    let nodeToUpdate: INode = this._findSameComponent(src, tgt);

                    // if the obesrver is the same object, just update it
                    if (nodeToUpdate === null) {

                        if (target === this.__renderTarget) {
                            nodeToUpdate = this._appendNode(src, tgt);
                        } else {
                            // otherwise insert new node with a different observer before
                            nodeToUpdate = this._insertBefore(src, tgt);
                        }

                    }

                    // update found or added node and its children
                    this.updateDom(src, nodeToUpdate);

                } else {
                    Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                        "Target or its parent is unknown!", this.__targetDocument, target);
                    throw new TargetOrParentIsUnknownException();
                }

            } else {
                // real dom update starts here

                // update only if the src node has no metadata or should not be skipped
                if (src.ajsData === undefined || !src.ajsData.skipUpdate) {

                    // compare node names
                    if (src.nodeName === tgt.nodeName) {

                        // update the node attributes
                        this._updateNodeAttributes(src, tgt);

                        // update or add children nodes - the updateDom for children is called inside the method
                        this._updateChildren(src, tgt);

                        // remove any additional children nodes not existing with the source
                        // it is not neccessary to inform components as they should not exist anymore after state update
                        while (source.childNodes.length < target.childNodes.length) {
                            tgt.removeChild(tgt.childNodes.item(src.childNodes.length));
                        }

                    } else {

                        // the source node is different to target so replace target with source
                        let adoptedNode: INode = this._replaceNode(src, tgt);
                        this.updateDom(source, adoptedNode);

                    }
                }

            }

        }

        /**
         * Finds a target node which has assigned the source node in the metadata
         * @param src Source node (usually from the template) to be searched for
         */
        public getTargetNodeByUniqueId(id: number): INode {

            function searchNode(nodeId: number, tgtNode: INode): INode {

                // if the target node has assigned required source node, remove it and stop searching
                if (tgtNode.ajsData && tgtNode.ajsData.component && tgtNode.ajsData.component.componentViewId === nodeId) {
                    return tgtNode;
                }

                // search children nodes until the node is found and removed
                for (let i: number = 0; i < tgtNode.childNodes.length; i++) {
                    let node: INode = searchNode(nodeId, tgtNode.childNodes.item(i) as INode);
                    if (node !== null) {
                        return node;
                    }
                }

                return null;
            }

            return searchNode(id, (this.__targetDocument.body as Node) as INode);
        }

        /**
         * Removes target node which has assigned the source node
         * @param src Source node (usually the node in the template) to be searched for
         */
        public removeNodeByUniqueId(id: number): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Removing the target node by assigned to the source node " + id);

            let node: INode = this.getTargetNodeByUniqueId(id);

            if (node !== null) {
                this.removeNode(node);
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);
        }

        /**
         * Searches the target parent for the same component (just the same level, not children)
         * @param src Source node (usually from the template) assigned to the target to be searched
         * @param tgt Target which parent will be searched for the component
         */
        protected _findSameComponent(src: INode, tgt: INode): INode {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Looking for the same component", src, tgt);

            if (src.ajsData !== undefined && src.ajsData.component !== undefined) {

                for (let i: number = 0; i < tgt.parentNode.childNodes.length; i++) {

                    let targetNode: INode = tgt.parentNode.childNodes.item(i) as INode;

                    if (targetNode.ajsData && targetNode.ajsData.component === src.ajsData.component) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                            "Component found", tgt.parentNode.childNodes.item(i));

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

                        return tgt.parentNode.childNodes.item(i) as INode;

                    }
                }

            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this, "Component not found");
            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return null;
        }

        /**
         * Update or add children nodes
         * @param src Source node (from shadow DOM) its children are about to be added or which data to be set to target children nodes
         * @param tgt Target node which children are about to be updated or added from source children nodes
         */
        protected _updateChildren(src: INode, tgt: INode): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Updating children node", src, tgt);

            for (let i: number = 0; i < src.childNodes.length; i++) {

                let child: INode;

                if (i < tgt.childNodes.length) {
                    // if there are enough child nodes to be compared in the target document
                    // continue with these children
                    child = tgt.childNodes.item(i) as INode;
                } else {
                    // otherwise append the node and continue with its tree
                    child = this._appendNode(src.childNodes.item(i) as INode, tgt);
                }

                // update child node tree
                this.updateDom(src.childNodes.item(i), child);

            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

        }

        /**
         * Append new node to the target node
         * @param src Appends the source node (from shadow DOM) to the target
         * @param tgt Target for the source node
         */
        protected _appendNode(src: INode, tgt: INode): INode {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.DomAppendChild, 0, "ajs.doc", this,
                "Appending new node", src, tgt);

            let clonedNode: Node = src.cloneNode(false);
            let adoptedNode: INode = tgt.ownerDocument.adoptNode(clonedNode) as INode;

            this._setNodeMetadata(src, adoptedNode);
            this._adoptStrangeAttributes(adoptedNode);
            this._registerEventListeners(src, adoptedNode);

            tgt.appendChild(adoptedNode);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return adoptedNode;

        }

        /**
         * Insert new node before target node
         * @param src Inserts the source node (from shadow DOM) before the target node
         * @param tgt Target node before which the source will be inserted
         */
        protected _insertBefore(src: INode, tgt: INode): INode {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.DomAppendChild, 0, "ajs.doc", this,
                "Inserting new node before", src, tgt);

            // clone, adapt and insert node from shadow dom to target document
            let clonedNode: Node = src.cloneNode(false);
            let adoptedNode: INode = tgt.ownerDocument.adoptNode(clonedNode) as INode;

            this._setNodeMetadata(src, adoptedNode);
            this._adoptStrangeAttributes(adoptedNode);
            this._registerEventListeners(src, adoptedNode);

            tgt.parentNode.insertBefore(adoptedNode, tgt);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return adoptedNode;
        }

        /**
         * Remove target element and replace it by a new tree
         * @param src Source node (from shadow DOM) used to replace existing target
         * @param tgt Target node to be replaced
         */
        protected _replaceNode(src: INode, tgt: INode): INode {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.DomReplaceChild, 0, "ajs.doc", this,
                "Replacing target node with source node", src, tgt);

            // do necessary cleanup - this is maybe not necessary as the node will be discarded completely
            if (tgt.ajsData) {

                // unregister event listeners
                if (tgt.ajsData.eventListeners instanceof Array) {
                    for (let i: number = 0; i < tgt.ajsData.eventListeners.length; i++) {
                        tgt.removeEventListener(
                            tgt.ajsData.eventListeners[i].eventType,
                            tgt.ajsData.eventListeners[i].eventListener
                        );
                    }
                }

                // remove metadata
                tgt.ajsData = null;
                delete (tgt.ajsData);
            }

            let clonedNode: Node = src.cloneNode(false);
            let adoptedNode: INode = tgt.ownerDocument.adoptNode(clonedNode) as INode;

            this._adoptStrangeAttributes(adoptedNode);
            this._setNodeMetadata(src, adoptedNode);
            this._registerEventListeners(src, adoptedNode);

            tgt.parentNode.replaceChild(adoptedNode, tgt);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return adoptedNode;
        }

        /**
         * Removes the node including all children with necessary cleanup
         * @param tgt Target node to be removed
         */
        public removeNode(target: Node): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Removing the target node", target);

            // the target was probably removed already
            if (!target || target === null) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);
                return;
            }

            // check if the renderTarget requested to be removed is in the managed document
            if (target.ownerDocument !== this.__targetDocument) {
                Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                    "Render target is not contained in the managed document", this.__targetDocument, target);
                throw new RenderTargetNotInManagedDocumentException();
            }

            // remove all children
            for (let i: number = 0; i < target.childNodes.length; i++) {
                this.removeNode(target.childNodes.item(i));
            }

            let tgt: INode = target as INode;

            // do necessary cleanup - this is maybe not necessary as the node will be discarded completely
            if (tgt.ajsData) {

                // unregister event listeners
                if (tgt.ajsData.eventListeners instanceof Array) {
                    for (let i: number = 0; i < tgt.ajsData.eventListeners.length; i++) {
                        tgt.removeEventListener(
                            tgt.ajsData.eventListeners[i].eventType,
                            tgt.ajsData.eventListeners[i].eventListener
                        );
                    }
                }

                // remove metadata
                tgt.ajsData = null;
                delete (tgt.ajsData);
            }

            // remove the target node
            if (tgt.parentNode !== null) {
                tgt.parentNode.removeChild(tgt);
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

        }

        /**
         * Updates node attributes (removes non-existing, adds new and updates existing values)
         * @param source Source node (from shadow DOM) which attributes should be set to target node
         * @param target Target node which attributes will be updated
         */
        protected _updateNodeAttributes(source: Node, target: Node): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Updating node attributes", source, target);

            if (source.nodeType === Node.ELEMENT_NODE) {

                // remove non-existing atributes
                let i: number = 0;
                while (i < target.attributes.length) {
                    if (!(source as HTMLElement).hasAttribute(target.attributes.item(i).nodeName)) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                            "Removing attribute ", target.attributes.item(i).nodeName);

                        try {
                            target.attributes.removeNamedItem(target.attributes.item(i).nodeName);
                        } catch (e) {
                            Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                                "Removing attribute " + target.attributes.item(i).nodeName + " failed.");
                            break;
                        }

                    } else {
                        i++;
                    }
                }

                // add missing attributes and update differences
                for (i = 0; i < source.attributes.length; i++) {
                    let tattr: Attr = target.attributes.getNamedItem(source.attributes.item(i).nodeName);
                    if (tattr === null) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                            "Adding attribute " + source.attributes.item(i).nodeName + "=" + source.attributes.item(i).nodeValue);

                        tattr = target.ownerDocument.createAttribute(source.attributes.item(i).nodeName);
                        tattr.value = source.attributes.item(i).nodeValue;
                        target.attributes.setNamedItem(tattr);

                        this._processStrangeAttributes((target as HTMLElement), tattr);

                    } else {
                        if (tattr.nodeValue !== source.attributes.item(i).nodeValue) {

                            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                                "Updating the attribute value " + tattr.nodeName + "=" + source.attributes.item(i).nodeValue);

                            tattr.nodeValue = source.attributes.item(i).nodeValue;

                            this._processStrangeAttributes((target as HTMLElement), tattr);
                        }
                    }
                }

            } else {
                if (source.nodeType === Node.TEXT_NODE) {
                    if (source.nodeValue !== target.nodeValue) {
                        target.nodeValue = source.nodeValue;
                    }
                }
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

        }

        /**
         * Processes attributes within the adopted node and sets properties of the node which are not updated by setting the attribute
         * @param adoptedNode Adopted node whose attributes will get processed
         */
        protected _adoptStrangeAttributes(adoptedNode: Node): void {
            if (adoptedNode.nodeType === Node.ELEMENT_NODE) {
                for (let i: number = 0; i < adoptedNode.attributes.length; i++) {
                    this._processStrangeAttributes(<HTMLElement>adoptedNode, adoptedNode.attributes[i]);
                }
            }
        }

        /**
         * Sets element properties which are not updated by updating the attribute value
         * @param element Element owning the attribute to be processed
         * @param attribute Attribute to be processed
         */
        protected _processStrangeAttributes(element: HTMLElement, attribute: Attr): void {

            if (element instanceof HTMLElement &&
                attribute.name.toLowerCase() === "onrender") {
                if ((<INode><any>element).ajsData &&
                    (<INode><any>element).ajsData.ownerComponent &&
                    (<INode><any>element).ajsData.ownerComponent[attribute.value] instanceof Function) {

                    (<INode><any>element).ajsData.ownerComponent[attribute.value](element);

                }

                element.attributes.removeNamedItem(attribute.name);
            }

            if (element instanceof HTMLInputElement &&
                element.type.toLowerCase() === "text" &&
                attribute.name.toLowerCase() === "value") {
                element.value = attribute.value;
            }

            if (element instanceof HTMLInputElement &&
                element.type.toLowerCase() === "checkbox" &&
                attribute.name.toLowerCase() === "checked") {
                if (attribute.value.toLowerCase() === "true") {
                    element.checked = true;
                } else {
                    element.attributes.removeNamedItem("checked");
                    element.checked = false;
                }
            }

        }

       /**
        * Copies metadata from source to the target element
        * @param src Source node (from shadow DOM) containing the metadata to be set to target node
        * @param tgt Target node of which metadata will be set
        */
        protected _setNodeMetadata(src: INode, tgt: INode): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Setting node metadata", src, tgt);

            if (src.ajsData) {
                tgt.ajsData = src.ajsData;
            }

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

        }

        /**
         * Registers defined event listeners (from source node metadata) to the target node if there are any
         * @param src Source node (from shadow DOM) containing event listeners to be registered with the target node
         * @param tgt Target node to which event listeners will be added
         */
        protected _registerEventListeners(src: INode, tgt: INode): void {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            if (src.ajsData && src.ajsData.eventListeners instanceof Array) {

                for (let i: number = 0; i < src.ajsData.eventListeners.length; i++) {

                    Ajs.Dbg.log(Ajs.Dbg.LogType.DomAddListener, 0, "ajs.doc", this,
                        "Registering event listener " + src.ajsData.eventListeners[i].eventType, src, tgt);

                    tgt.addEventListener(
                        src.ajsData.eventListeners[i].eventType,
                        src.ajsData.eventListeners[i].eventListener
                    );
                }

            }

        }

        /**
         * Applies stylesheets from the template to the target document
         * Asynchronously loads necessary resources (i.e. images) and replaces appropriate URLs with the resource Base64 representation
         * @param template Template which stylesheets have to be applied
         */
        public applyStyleSheetsFromTemplate(template: Ajs.Templating.Template): Promise<void> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                "Applying Style Sheets from template " + template.name + "(" + template.styleSheets.length + ")");

            let styleSheetsToProcess: Promise<string>[] = [];

            for (let i: number = 0; i < template.styleSheets.length; i++) {
                let id: string = template.name + i;
                if (this.__styleSheets.indexOf(id) === -1) {
                    this.__styleSheets.push(id);
                    styleSheetsToProcess.push(this._processStyleSheet(template, i));
                }
            }

            let applyPromise: Promise<void> = new Promise<void>(

                async (resolve: () => void, reject: (reason?: any) => void) => {
                    try {
                        let styleSheets: string[] = await Promise.all(styleSheetsToProcess);

                        for (let i: number = 0; i < styleSheets.length; i++) {

                            let id: string = template.name + i;

                            let style: HTMLElement = this.__targetDocument.createElement("style");
                            style.setAttribute("type", "text/css");
                            style.setAttribute("id", id);
                            style.textContent = template.styleSheets[i];

                            Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                                "Adding processed stylesheet to the render target", template.styleSheets[i]);

                            this.__targetDocument.head.appendChild(style);
                        }
                    } catch (e) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                            "Required CSS resource can't be reached", e);

                        reject(new CSSRequiredResourceNotLoadedException(e));

                    }

                    resolve();
                }

            );

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return applyPromise;

        }

        /**
         * Processes the stylesheet, replaces URLs with Base64 data if url is managed resource in the same storage as the template
         * @param template
         * @param index
         */
        protected _processStyleSheet(template: Ajs.Templating.Template, index: number): Promise<string> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.doc", this);

            // resources to be checked
            let resourcesPromises: Promise<Ajs.Resources.IResource>[] = [];

            // find all url(...) in the stylesheet
            let urls: RegExpMatchArray = template.styleSheets[index].match(/url\(('|")(.*)('|")\)/g);

            // fix them to just the url and get all resources
            if (urls !== null) {

                for (let i: number = 0; i < urls.length; i++) {

                    let url: RegExpExecArray = (/('|")(.*)('|")/g).exec(urls[i]);

                    if (url.length < 2) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Error, 0, "ajs.doc", this,
                            "CSS Invalid URL specification " + urls[i]);

                        throw new CSSInvalidResourceSpecificationException();
                    }

                    if (url[2].substr(0, 4) !== "data") {

                        resourcesPromises.push(
                            this.__resourceManager.getResource(url[2], template.storageType)
                        );
                    }
                }

            }

            // wait for all resources with given URLS
            let styleSheetPromise: Promise<string> = new Promise<string>(

                async (resolve: (styleSheet: string) => void, reject: (e: any) => void) => {

                    try {
                        let resources: Ajs.Resources.IResource[] = await Promise.all(resourcesPromises);

                        for (let i: number = 0; i < resources.length; i++) {
                            template.styleSheets[index] = Ajs.Utils.replaceAll(
                                template.styleSheets[index],
                                resources[i].url,
                                "data:image;base64," + resources[i].data);
                        }

                    } catch (e) {

                        Ajs.Dbg.log(Ajs.Dbg.LogType.Warning, 0, "ajs.doc", this,
                            "Unable to reach one of requested resources for the stylesheet", e);

                        reject(e);
                    }

                    Ajs.Dbg.log(Ajs.Dbg.LogType.Info, 0, "ajs.doc", this,
                        "Discovered style sheet resources succesfully loaded");

                    resolve(template.styleSheets[index]);

                });

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.doc", this);

            return styleSheetPromise;
        }

    }

}
