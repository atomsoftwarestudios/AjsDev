/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace ajsdoc {

    "use strict";

    /**
     * Used to recognize nodes which should not be expandable in the menu
     */
    export const MENU_DONT_EXPAND: string[] = [
        "InterfaceDeclaration",
        "VariableDeclaration",
        "EnumDeclaration",
        // "Object literal",
        "FunctionDeclaration",
        // "Constructor",
        // "Method",
        // "Property",
        // "Accessor"
    ];

    /**
     * Used to sort menu groups
     */
    export const MENU_GROUP_SORT: string[] = [
        "Namespaces",
        "Modules",
        "Interfaces",
        "Classes",
        "Constants",
        "Enumerations",
        "Variables",
        "Functions",
        "Properties",
        "Accessors",
        "Methods"
    ];

    /**
     * Used to pass data from model to requestor (usually ViewComponent)
     */
    export interface IProgramDataReadyData {
        menuState?: IMenuState;
        navBarState?: INavBarItemsState;
        articleState?: IAjsDocArticleState;
    }

    /**
     * Represents doc nodes indexed by fqdn
     */
    export interface INodesByFqdn {
        [index: string]: atsdoc.IATsDocNode[];
    }

    /**
     * Loading of the program data and providing data to appropriate requestors (mainly AjsDoc view component)`1
     */
    export class ProgramModel extends ajs.mvvm.model.Model<IProgramDataReadyData> {

        /** Stores the program data in String form */
        protected _jsonDataString: string;

        /** Stores the program data in atsdoc node tree structure */
        protected _data: atsdoc.IATsDocNode;

        /** Stores references to atsdoc nodes accessible by the node fqdn */
        protected _nodesByFqdn: INodesByFqdn;

        public getMenu(path: string): void {
            this._checkInitialized(
                new Error("Program data loading timeout"),
                () => { this._getMenu(path); }
            );
        }

        public getNavBar(path: string): void {
            this._checkInitialized(
                new Error("Program data loading timeout"),
                () => { this._getNavBar(path); }
            );
        }

        public getContent(path: string): void {
            this._checkInitialized(
                new Error("Program data loading timeout"),
                () => { this._getContent(path); }
            );
        }

        /**
         * Navigates to the doc node specified in the path
         * @param path
         */
        public navigateDocNode(path: string): atsdoc.IATsDocNode {

            if (path === "") {
                return this._data;
            }

            for (let n in this._nodesByFqdn) {
                if (this._nodesByFqdn.hasOwnProperty(n)) {
                    if (path === n) {
                        return this._nodesByFqdn[n][0];
                    }
                }
            }

            return this._data;
        }

        /**
         * Load the program.json and preprocess it for simpler serving
         */
        protected _initialize(): void {

            // load program.json resource
            let res: Promise<ajs.resources.IResource> = ajs.Framework.resourceManager.getResource(
                config.dataSources.program,
                config.storageType,
                ajs.resources.CACHE_POLICY.PERMANENT,
                ajs.resources.LOADING_PREFERENCE.CACHE
            );

            // process program.json resource when ready
            res.then(
                (resource: ajs.resources.IResource) => {

                    // store loaded data locally
                    this._jsonDataString = resource.data;

                    // parse loaded data and prepare internal structures
                    this._preprocessData();

                    // model is ready to serve view requests
                    this._initialized = true;
                }
            ).catch(
                (reason: any) => {
                    throw new Error("Unable to load program data");
                }
            );

        }

        /**
         * Return the node FQDN according to its position in the tree
         * @param node
         * Deprecated: FQDN is generated correctly by the atsdoc tool now
         */
        protected _getNodeFqdn(node: atsdoc.IATsDocNode): string {

            let fqdn: string = "";

            if (node.name) {
                fqdn = node.name;
            }

            while (node.parent !== null) {
                node = node.parent;
                if (node.name) {
                    fqdn = node.name + "." + fqdn;
                }
            }

            return fqdn;
        }

        /**
         * Processes all nodes of loaded program
         * <ul>
         * <li>Creates helping structures such as _nodesByFqdn</li>
         * <li>Sets parent node to each node (there is no direct reference to parent of the node in the json file)</li>
         * </ul>
         * @param node Node to be processed (starting by the root node)
         * @param parent parent node of the node (starting by null)
         */
        protected _preprocessNodes(node: atsdoc.IATsDocNode, parent: atsdoc.IATsDocNode): void {

            node.parent = parent;

            // program node
            if (node.kind === -1) {
                node.name = "";
                node.fqdn = "";
            }

            // source file node
            if (node.kind === atsdoc.SyntaxKind.SourceFile) {
                let fn: string = (<any>node).files[0];
                node.name = fn.substr(fn.lastIndexOf("/") + 1);
                node.fqdn = fn.replace(/\//g, "_").replace(/\./g, "_");
            }


            let fqdn: string = node.fqdn;
            if (fqdn !== "") {
                if (!(this._nodesByFqdn[fqdn] instanceof Array)) {
                    this._nodesByFqdn[fqdn] = [];
                }
                this._nodesByFqdn[fqdn].push(node);
                node.fqdn = fqdn;
            }

            if (node.children instanceof Array) {
                for (let ch of node.children) {
                    this._preprocessNodes(ch, node);
                }
            }
        }

        /**
         * Preprocesses the loaded json data (output from ATsDoc)
         * <ul>
         * <li>Creates helping structures such as _nodesByFqdn</li>
         * <li>Sets parent node to each node (there is no direct reference to parent of the node in the json file)</li>
         * </ul>
         */
        protected _preprocessData(): void {

            try {
                this._data = JSON.parse(this._jsonDataString);
                this._nodesByFqdn = {};
                this._preprocessNodes(this._data, null);

            } catch(e) {
                throw new Error("Invalid program data. Failed to parse.");
            }

        }

        /**
         * Retruns the group name (kind in plural) to be shown in menu
         * @param node Node from which the node kind will be extracted
         */
        protected _getGroupNameFromNodeKind(node: atsdoc.IATsDocNode): string {
            return translateNodeKind(node, true);
        }

        /**
         * Sorts menu groups according the MENU_GROUP_SORT definition
         * @param menu Menu of which groups will be sorted
         */
        protected _sortMenuGroups(menu: IMenuState): void {
            menu.groups.sort((a: IMenuItemGroupState, b: IMenuItemGroupState): number => {
                let aa: number = MENU_GROUP_SORT.indexOf(a.label);
                let bb: number = MENU_GROUP_SORT.indexOf(b.label);
                if (aa === -1) {
                    aa = 99999;
                }
                if (bb === -1) {
                    bb = 99999;
                }

                return aa - bb;
            });
        }

        /**
         * Sorts items in the group from A to Z
         * @param group
         */
        protected _sortGroupItems(group: IMenuItemGroupState): void {
            group.items.sort((a: IMenuItemState, b: IMenuItemState): number => {
                let nameA: string = a.label.toUpperCase();
                let nameB: string = b.label.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        }

        /**
         * Tries to find existing group in the menu by its name
         * @param menu Menu to be searched for a group with specified name
         * @param groupName Name of the group to be searched
         */
        protected _getMenuGroupByName(menu: IMenuState, groupName: string): IMenuItemGroupState {
            for (let g of menu.groups) {
                if (g.label === groupName) {
                    return g;
                }
            }
            return null;
        }

        /**
         * Adds a group to the menu
         * @param menu Menu to which the group will be added
         * @param key Unique key of the group
         * @param label Label of the menu group (usually doc node kind + doc node name)
         * @param items Items to be added to the group (usually [])
         */
        protected _addMenuGroup(menu: IMenuState, key: any, label: string, items: IMenuItemState[]): IMenuItemGroupState {
            let group: IMenuItemGroupState = {
                key: key,
                label: label,
                items: items
            };
            menu.groups.push(group);
            return group;
        }

        /**
         * Checks if the item with given path exists in given group
         * @param group Group to be checked
         * @param path Path of the item to be searched
         */
        protected _menuGroupItemPathExists(group: IMenuItemGroupState, path: string): boolean {
            for (let i of group.items) {
                if (i.path === path) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Builds the menu for the current url (navigation path)
         * @param navPath Current navigation path (url stripped from the http.../ref/)
         */
        protected _getMenu(navPath: string): void {

            // get doc node from navigation path
            let node: atsdoc.IATsDocNode = this.navigateDocNode(navPath);

            // some node types should not be expandable so menu is generated from parent nodes
            if (!(node.children instanceof Array) || node.children.length === 0) {
                node = node.parent;
            }

            // prepare parent menu info

            //  todo: put to config
            let allowRoot: boolean = true;

            let parentLabel: string = node.parent !== null && (node.parent.kind !== -1 || allowRoot) ?
                translateNodeKind(node.parent) + " " + node.parent.name : null;
            let parentPath: string = node.parent !== null && (node.parent.kind !== -1 || allowRoot) ? node.parent.fqdn : "";

            // prepare menu state
            let menu: IMenuState = {
                parentLabel: parentLabel,
                parentPath: "/ref/" + parentPath,
                groups: [],
                items: []
            };

            // push the current item to the menu as a first option
            menu.items.push({
                key: "itemLabel:" + node.fqdn,
                label: translateNodeKind(node) + " " + (node.name !== undefined ? node.name : ""),
                path: "/ref/" + node.fqdn,
                selected: node.fqdn === navPath,
                expandable: false,
                menuLabel: true
            });

            // build menu groups and items from the doc node tree and node kind
            if (node.children) {
                for (let children of node.children) {

                    // translate the node kind to name in plural and locate an existing menu group
                    let groupName: string = this._getGroupNameFromNodeKind(children);
                    let group: IMenuItemGroupState = this._getMenuGroupByName(menu, groupName);

                    // create a new menu group if group with given name does not exist
                    if (group === null) {
                        group = this._addMenuGroup(menu, node.fqdn + groupName, groupName, []);
                    }

                    // add children doc nodes to the appropriate group
                    if (!this._menuGroupItemPathExists(group, children.fqdn)) {
                        group.items.push({
                            key: children.fqdn,
                            label: children.name,
                            path: children.fqdn,
                            selected: children.fqdn === navPath,
                            expandable: children.children instanceof Array &&
                                        children.children.length > 0 &&
                                        MENU_DONT_EXPAND.indexOf(children.kindString) === -1,
                            menuLabel: false
                        });
                    }

                }
            }

            // sort groups
            this._sortMenuGroups(menu);

            // sort items
            for (let g of menu.groups) {
                this._sortGroupItems(g);
            }

            // notify the menu is ready
            this._dataReadyNotifier.notify(this, { menuState: menu });

        }

        /**
         * Builds the navigation bar for the current url (navigation path)
         * @param navPath Current navigation path (url stripped from the http.../ref/)
         * @param path
         */
        protected _getNavBar(path: string): void {

            let items: INavBarItemsState = [];

            let node: atsdoc.IATsDocNode = this.navigateDocNode(path);

            if (!node.fqdn) {
                node.fqdn = "";
            }
            let split: string[] = node.fqdn.split(".");

            let index: number = 0;
            let pth: string = "";

            for (let s of split) {
                if (pth !== "") {
                    pth += ".";
                }
                pth += s;
                let n: atsdoc.IATsDocNode = this.navigateDocNode(pth);

                let navBarItem: INavBarItemState = {
                    key: n.fqdn,
                    firstItem: index === 0,
                    itemPath: "/ref/" + n.fqdn,
                    itemType: translateNodeKind(n),
                    itemLabel: n.name
                };

                items.push(navBarItem);

                index++;
            }


            this._dataReadyNotifier.notify(this, { navBarState: items });
        }

        /**
         * Sets the article state based on the path
         * @param path
         */
        protected _getContent(path: string): void {

            let node: atsdoc.IATsDocNode = this.navigateDocNode(path);

            let articleState: IAjsDocArticleState = {};
            articleState.caption = translateNodeKind(node) + " " + node.name;
            articleState.description = node.commentShort ? node.commentShort : undefined;
            this._getExtends(node, articleState);
            this._getImplements(node, articleState);
            this._getDeclarations(node, articleState);
            this._getMembers(node, articleState);

            if (node.commentLong && node.commentLong !== "") {
                setupHTMLContent(node.commentLong).then(
                    (htmlContent: string) => {
                        articleState.longDescription = htmlContent;
                        this._dataReadyNotifier.notify(this, { articleState: articleState });
                    }
                );
            } else {
                this._dataReadyNotifier.notify(this, { articleState: articleState });
            }

        }

        protected _getDeclarations(node: atsdoc.IATsDocNode, articleState: IAjsDocArticleState): void {

            const noSyntax: atsdoc.SyntaxKind[] = [
                -1,
                atsdoc.SyntaxKind.SourceFile,
                atsdoc.SyntaxKind.ModuleDeclaration
            ];

            if (noSyntax.lastIndexOf(node.kind) === -1) {
                articleState.declarations = this._nodesByFqdn[node.fqdn];
            }
        }

        protected _getImplements(node: atsdoc.IATsDocNode, articleState: IAjsDocArticleState): void {
            if (node.implements && node.implements.length > 0) {

                articleState.implements = [];

                for (let i of node.implements) {
                    articleState.implements.push({
                        key: i.fqdn,
                        name: "interface " + i.fqdn,
                        path: i.fqdn
                    });
                }

            }

        }

        protected _getExtends(node: atsdoc.IATsDocNode, articleState: IAjsDocArticleState): void {
            if (node.extends && node.extends.name) {

                let n: atsdoc.IATsDocNode = node;
                let h: IHierarchyNodeState = {
                    name: translateNodeKind(n).toLocaleLowerCase() + " " + n.fqdn,
                    path: n.fqdn
                };
                articleState.hierarchy = h;

                while (n !== null) {

                    n = n.extends && n.extends.fqdn && this._nodesByFqdn[n.extends.fqdn] ? this._nodesByFqdn[n.extends.fqdn][0] : null;

                    if (n !== null) {

                        let hs: IHierarchyNodeState = {
                            name: translateNodeKind(n).toLocaleLowerCase() + " " + n.fqdn,
                            path: n.fqdn
                        };

                        h.extends = hs;
                        h = h.extends;
                    }
                }
            }
        }

        protected _getMembers(node: atsdoc.IATsDocNode, articleState: IAjsDocArticleState): void {

            function addMember(kind: string, n: atsdoc.IATsDocNode): void {
                if (!(articleState[kind] instanceof Array)) {
                    articleState[kind] = [];
                }
                articleState[kind].push(n);
            }

            if (node.children instanceof Array && node.children.length > 0) {
                for (let n of node.children) {
                    switch (n.kind) {

                        case atsdoc.SyntaxKind.ModuleDeclaration:
                            if (n.nodeFlagsString.indexOf("Namespace") !== -1) {
                                addMember("namespaces", n);
                            }
                            if (n.nodeFlagsString.indexOf("Module") !== -1) {
                                addMember("modules", n);
                            }
                            break;

                        case atsdoc.SyntaxKind.FunctionDeclaration:
                            addMember("functions", n);
                            break;

                        case atsdoc.SyntaxKind.ClassDeclaration:
                            addMember("classes", n);
                            break;

                        case atsdoc.SyntaxKind.VariableDeclaration:
                            addMember("variables", n);
                            break;

                        case atsdoc.SyntaxKind.EnumDeclaration:
                            addMember("enumerations", n);
                            break;

                        case atsdoc.SyntaxKind.EnumMember:
                            addMember("enumMembers", n);
                            break;

                        case atsdoc.SyntaxKind.ObjectLiteralExpression:
                            addMember("objectLiterals", n);
                            break;

                        case atsdoc.SyntaxKind.Constructor:
                            addMember("constructors", n);
                            break;

                        case atsdoc.SyntaxKind.PropertyDeclaration:
                        case atsdoc.SyntaxKind.PropertySignature:
                            addMember("properties", n);
                            break;

                        case atsdoc.SyntaxKind.GetAccessor:
                        case atsdoc.SyntaxKind.SetAccessor:
                            addMember("accessors", n);
                            break;

                        case atsdoc.SyntaxKind.PropertyDeclaration:
                            addMember("methods", n);
                            break;

/*
        public enumMembers?: atsdoc.IATsDocNode[];
*/

                    }
                }
            }

        }

    }

}
