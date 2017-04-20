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

namespace AjsDoc.Models.ProgramModel {

    "use strict";

    /**
     * Used to recognize nodes which should not be expandable in the menu
     */
    const MENU_DONT_EXPAND: string[] = [
        //"InterfaceDeclaration",
        "VariableStatement",
        "VariableDeclaration",
        "EnumerationDeclaration",
        "Object literal",
        "FunctionDeclaration",
        "Constructor",
        "MethodDeclaration",
        "PropertyDeclaration",
        "GetAccessor",
        "SetAccessor"

        /*
        //"ClassDeclaration",
        "InterfaceDeclaration",
        //"VariableStatement",
        "EnumDeclaration",
        // "Object literal",
        "FunctionDeclaration",
        "Constructor",
        "MethodDeclaration",
        "PropertyDeclaration",
        // "Accessor"
        */
    ];

    /**
     * Used to sort menu groups
     */
    const MENU_GROUP_SORT: string[] = [
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
     * Represents doc nodes indexed by fqdn
     */
    interface INodesByFqdn {
        [index: string]: atsdoc.IATsDocNode[];
    }


    /**
     * List of the ProgramModel constructor parameters
     * Its not necessary to define it but it is usefull to see what parameters
     * must be configured when configuring the DI container
     */

    export interface ICPProgramModel {
        container: Ajs.DI.IContainer;
        resourceManager: Ajs.Resources.IResourceManager;
        htmlHelpers: typeof Utils.IIHTMLHelpers;
        config: IProgramModelConfig;
    }

    /**
     * Program model is a program data provider for the AjsDoc component. It is designed as Ajs injectable service.
     * <p>
     * It is responsible for loading and parsing the output of the AtsDoc tool and it annotating and rearranging the
     * data to be possible to use them with the AjsFW component state system. Both tools, AtsDoc and this models
     * were developed in order to be as simple as possible according to the complicated TypeScript program AST tree.
     * </p>
     * <p>
     * Model is added as a scoped service to the DI container and constructed and initialized when the
     * AjsDocComponent (the site root compoent) is instanced (see AjsDoc application class for details). It is used
     * by the AjsDocComponent to collect the state data for complete view component tree.
     * <p>
     */
    export class ProgramModel extends Ajs.MVVM.Model.Model implements IProgramModel {

        private __resourceManager: Ajs.Resources.IResourceManager;
        private __htmlHelpers: Utils.IHTMLHelpers;
        private __config: IProgramModelConfig;
        private __data: atsdoc.IATsDocNode;

        /** Stores references to atsdoc nodes accessible by the node fqdn */
        private __nodesByFqdn: INodesByFqdn;

        constructor(
            container: Ajs.DI.IContainer,
            resourceManager: Ajs.Resources.IResourceManager,
            htmlHelpers: Utils.IHTMLHelpers,
            config: IProgramModelConfig) {

            super(container);

            this.__resourceManager = resourceManager;
            this.__htmlHelpers = htmlHelpers;
            this.__config = config;
        }


        /**
         * Returns menu component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getMenu(path: string): Promise<Components.IAjsDocMenuComponentState> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return this.__getMenu(path);
        }

        /**
         * Returns a navbar component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getNavBar(path: string): Promise<Components.IAjsDocNavBarItemComponentState[]> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return this.__getNavBar(path);
        }

        /**
         * Return article content state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        public async getContent(path: string): Promise<Components.IAjsDocArticleComponentState> {
            try {
                await this._waitInitialized(this.__config.initializationTimeout);
            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }

            return await this.__getContent(path);
        }

        /**
         * Navigates to the doc node described by the path
         * @param navPath Part of the url describing the path to the file
         */
        public async navigateDocNode(path: string, dontExpand?: boolean): Promise<atsdoc.IATsDocNode> {

            try {
                await this._waitInitialized(this.__config.initializationTimeout);
                return this.__navigateDocNode(path, dontExpand);

            } catch (e) {
                throw new Ajs.Exception("Content model is not initialized!", e);
            }
        }

        /**
         * Load the program.json and preprocess it for simpler serving
         */
        protected async _onInitialize(): Promise<void> {
            try {

                let progResource: Ajs.Resources.IResource = await this.__resourceManager.getResource(
                    this.__config.programUrl,
                    this.__config.storageType,
                    this.__config.cachePolicy,
                    this.__config.loadingPreference
                );

                this.__data = JSON.parse(progResource.data);
                this.__preprocessData();

            } catch (e) {
                throw new Ajs.Exception("Failed to load program data", e);
            }

        }

        /**
         * Preprocesses the loaded json data (output from ATsDoc)
         * <ul>
         * <li>Creates helping structures such as _nodesByFqdn</li>
         * <li>Sets parent node to each node (there is no direct reference to parent of the node in the json file)</li>
         * </ul>
         */
        private __preprocessData(): void {

            try {
                this.__nodesByFqdn = {};
                this.__preprocessNodes(this.__data, null);
            } catch (e) {
                throw new Ajs.Exception("Invalid program data. Failed to parse.", e);
            }

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
        private __preprocessNodes(node: atsdoc.IATsDocNode, parent: atsdoc.IATsDocNode): void {


            function fixFqdn(fqdn: string): string {
                if (fqdn === undefined || fqdn === "" || fqdn === null) {
                    return "";
                }

                if (fqdn[0] === "/") {
                    fqdn = fqdn.substr(1);
                }

                fqdn = fqdn.replace(/\.ts/g, "_ts");

                return fqdn;
            }

            node.parent = parent;

            // program node
            if (node.kind === -1) {
                node.fqdn = "";
            }

            // source file node
            if (node.kind === atsdoc.SyntaxKind.SourceFile) {
                let fn: string = (<any>node).files[0].file;
                node.name = fn.substr(fn.lastIndexOf("/") + 1);
            }

            // fix fqdn
            let fqdn: string = fixFqdn(node.fqdn);
            node.fqdn = fqdn;

            if (fqdn && fqdn !== "") {
                if (!(this.__nodesByFqdn[fqdn] instanceof Array)) {
                    this.__nodesByFqdn[fqdn] = [];
                }
                this.__nodesByFqdn[fqdn].push(node);
            }

            // fix extended fqdns
            if (node.extends) {
                node.extends.fqdn = fixFqdn(node.extends.fqdn);
            }

            // fix implemented fqdns
            if (node.implements) {
                for (let i of node.implements) {
                    i.fqdn = fixFqdn(i.fqdn);
                }
            }

            // add translatedKindString
            (<any>node).translatedKindString = AtsDoc.translateNodeKind(node).toLowerCase();

            if ((<any>node).translatedKindString === "constructor" ||
                (<any>node).translatedKindString === "methodsignature" ||
                (<any>node).translatedKindString === "call signature" ||
                (<any>node).translatedKindString === "index signature" ||
                (<any>node).translatedKindString === "constant") {
                (<any>node).translatedKindString = "";
            }

            if ((<any>node).translatedKindString === "get accessor") {
                (<any>node).translatedKindString = "get";
            }

            if ((<any>node).translatedKindString === "set accessor") {
                (<any>node).translatedKindString = "set";
            }


            // process children nodes
            if (node.children instanceof Array) {
                for (let ch of node.children) {
                    this.__preprocessNodes(ch, node);
                }
            }
        }


        /**
         * Navigates to the doc node described by the path
         * @param navPath Part of the url describing the path to the file
         */
        private __navigateDocNode(path: string, dontExpand?: boolean): atsdoc.IATsDocNode {

            let node: atsdoc.IATsDocNode = this.__data;

            if (path === "") {
                return node;
            }

            for (let n in this.__nodesByFqdn) {
                if (this.__nodesByFqdn.hasOwnProperty(n)) {
                    if (path === n) {
                        node = this.__nodesByFqdn[n][0];
                        break;
                    }
                }
            }

            if (dontExpand && MENU_DONT_EXPAND.indexOf(node.kindString) !== -1) {
                node = node.parent;
            }

            return node;

        }

        /**
         * Retruns the group name (kind in plural) to be shown in menu
         * @param node Node from which the node kind will be extracted
         */
        private __getGroupNameFromNodeKind(node: atsdoc.IATsDocNode): string {
            return AtsDoc.translateNodeKind(node, true);
        }

        /**
         * Sorts menu groups according the MENU_GROUP_SORT definition
         * @param menu Menu of which groups will be sorted
         */
        private __sortMenuGroups(menu: Components.IAjsDocMenuComponentState): void {
            menu.groups.sort((
                a: Components.IAjsDocMenuGroupComponentState,
                b: Components.IAjsDocMenuGroupComponentState): number => {

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
        private __sortGroupItems(group: Components.IAjsDocMenuGroupComponentState): void {

            group.items.sort((
                a: Components.IAjsDocMenuItemComponentState,
                b: Components.IAjsDocMenuItemComponentState): number => {

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
        private __getMenuGroupByName(
            menu: Components.IAjsDocMenuComponentState, groupName: string): Components.IAjsDocMenuGroupComponentState {

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
        private __addMenuGroup(
            menu: Components.IAjsDocMenuComponentState,
            key: any,
            label: string,
            items: Components.IAjsDocMenuItemComponentState[]): Components.IAjsDocMenuGroupComponentState {

            let group: Components.IAjsDocMenuGroupComponentState = {
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
        private __menuGroupItemPathExists(group: Components.IAjsDocMenuGroupComponentState, path: string): boolean {
            for (let i of group.items) {
                if (i.path === path) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Builds the menu for the current url (navigation path)
         * @param navPath Part of the url describing the path to the file
         */
        private __getMenu(navPath: string): Components.IAjsDocMenuComponentState {

            // get doc node from navigation path
            let node: atsdoc.IATsDocNode = this.__navigateDocNode(navPath, true);

            // some node types should not be expandable so menu is generated from parent nodes
            if (!(node.children instanceof Array) || node.children.length === 0) {
                node = node.parent;
            }

            // prepare parent menu info

            //  todo: put to config
            let allowRoot: boolean = true;

            let parentLabel: string = node.parent !== null && (node.parent.kind !== -1 || allowRoot) ?
                AtsDoc.translateNodeKind(node.parent) + " " + node.parent.name : null;
            let parentPath: string = node.parent !== null && (node.parent.kind !== -1 || allowRoot) ? node.parent.fqdn : "";

            // prepare menu state
            let menu: Components.IAjsDocMenuComponentState = {
                parentLabel: parentLabel,
                parentPath: "/ref/" + parentPath,
                groups: [],
                items: []
            };

            // push the current item to the menu as a first option
            menu.items.push({
                key: "itemLabel:" + node.fqdn,
                label: AtsDoc.translateNodeKind(node) + " " + (node.name !== undefined ? node.name : ""),
                path: "/ref/" + node.fqdn,
                selected: node.fqdn === navPath,
                expandable: false,
                menuLabel: true
            });

            // build menu groups and items from the doc node tree and node kind
            if (node.children) {
                for (let children of node.children) {

                    // translate the node kind to name in plural and locate an existing menu group
                    let groupName: string = this.__getGroupNameFromNodeKind(children);
                    let group: Components.IAjsDocMenuGroupComponentState = this.__getMenuGroupByName(menu, groupName);

                    // create a new menu group if group with given name does not exist
                    if (group === null) {
                        group = this.__addMenuGroup(menu, node.fqdn + groupName, groupName, []);
                    }

                    // add children doc nodes to the appropriate group
                    if (!this.__menuGroupItemPathExists(group, children.fqdn)) {

                        // check if item with same fqdn is not in already
                        let found: boolean = false;
                        for (const i of group.items) {
                            if (i.path === "/ref/" + children.fqdn) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            group.items.push({
                                key: children.fqdn,
                                label: children.name,
                                path: "/ref/" + children.fqdn,
                                selected: children.fqdn === navPath,
                                expandable: children.children instanceof Array &&
                                children.children.length > 0 &&
                                MENU_DONT_EXPAND.indexOf(children.kindString) === -1,
                                menuLabel: false
                            });
                        }
                    }

                }
            }

            // sort groups
            this.__sortMenuGroups(menu);

            // sort items
            for (let g of menu.groups) {
                this.__sortGroupItems(g);
            }

            return menu;
        }

        /**
         * Builds a nav bar items state list for the concrete documentation level identified by the path
         * @param navPath Part of the url describing the path to the file
         */
        private __getNavBar(navPath: string): Components.IAjsDocNavBarItemComponentState[] {

            let items: Components.IAjsDocNavBarItemComponentState[] = [];

            let node: atsdoc.IATsDocNode = this.__navigateDocNode(navPath);

            let fqdn: string = node.fqdn;

            if (fqdn === undefined) {
                fqdn = "";
            }

            let split: string[] = node.fqdn.split(".");

            let index: number = 0;
            let pth: string = "";

            for (let s of split) {
                if (pth !== "") {
                    pth += ".";
                }
                pth += s;
                let n: atsdoc.IATsDocNode = this.__navigateDocNode(pth);

                let navBarItem: Components.IAjsDocNavBarItemComponentState = {
                    key: n.fqdn,
                    firstItem: index === 0,
                    itemPath: "/ref/" + n.fqdn,
                    itemType: AtsDoc.translateNodeKind(n),
                    itemLabel: n.name
                };

                items.push(navBarItem);

                index++;
            }

            if (node !== this.__data) {
                let navBarItem: Components.IAjsDocNavBarItemComponentState = {
                    key: "root",
                    firstItem: true,
                    itemPath: "/ref/",
                    itemType: AtsDoc.translateNodeKind(this.__data),
                    itemLabel: this.__data.name
                };
                items.splice(0, 0, navBarItem);
                items[1].firstItem = false;
            }

            return items;
        }

        /**
         * Returns article content of the article specified by the path parameter.
         * @param navPath Part of the url describing the path to the file
         */
        private async __getContent(navPath: string): Promise<Components.IAjsDocArticleComponentState> {

            let node: atsdoc.IATsDocNode = this.__navigateDocNode(navPath);

            let articleState: Components.IAjsDocArticleComponentState = {};

            articleState.caption = AtsDoc.translateNodeKind(node) + " " + node.name;
            articleState.translatedKindString = AtsDoc.translateNodeKind(node).toLowerCase();

            this.__getExtends(node, articleState);
            this.__getImplements(node, articleState);
            this.__getDeclarations(node, articleState);

            let nodes: atsdoc.IATsDocNode[] = [];
            if (navPath !== "") {
                nodes = this.__nodesByFqdn[navPath];
            } else {
                nodes = [this.__data];
            }

            let commentLong: string = "";

            if (nodes) {
                for (const n of nodes) {
                    this.__getMembers(n, articleState);
                    if (n.commentShort && n.commentShort !== "") {
                        if (articleState.description === undefined) {
                            articleState.description = node.commentShort;
                        } else {
                            articleState.description += "\n" + node.commentShort;
                        }
                    }

                    if (n.commentLong && n.commentLong !== "") {
                        commentLong += "<p>" + n.commentLong + "</p>";
                    }
                }
            }

            if (commentLong !== "") {
                let htmlContent: string = await this.__htmlHelpers.setupHTMLContent(commentLong);
                articleState.longDescription = htmlContent;
                return articleState;
            } else {
                return articleState;
            }

        }

        /**
         * Returns all children declarations of the current node
         * @param node Node of which children has to be looked for declarations
         * @param articleState Article state to be populated with the data
         */
        private __getDeclarations(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            const noSyntax: atsdoc.SyntaxKind[] = [
                -1,
                atsdoc.SyntaxKind.SourceFile,
                atsdoc.SyntaxKind.ModuleDeclaration
            ];

            if (noSyntax.lastIndexOf(node.kind) === -1) {
                articleState.declarations = [];
                for (let n of this.__nodesByFqdn[node.fqdn]) {
                    articleState.declarations.push(n);
                }
            }
        }

        /**
         * Returns interfaces the current node implements
         * @param node Node of which has to be looked for interfaces
         * @param articleState Article state to be populated with the data
         */
        private __getImplements(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            if (!(node.implements instanceof Array) || node.implements.length === 0) {
                return;
            }

            articleState.implements = [];


            for (let i of node.implements) {

                let fqdn: string = this.__nodesByFqdn[i.fqdn] && this.__nodesByFqdn[i.fqdn].length > 0 ?
                    this.__fqdnWithoutFile(this.__nodesByFqdn[i.fqdn][0]) : i.fqdn;

                articleState.implements.push({
                    key: i.fqdn,
                    name: "interface " + fqdn,
                    path: i.fqdn
                });
            }

        }

        /**
         * Returns all classes and interfaces the node extends
         * @param node Node of which has to be looked for extensions
         * @param articleState Article state to be populated with the data
         */
        private __getExtends(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            if (!node.extends || !node.extends.name) {
                return;
            }

            let n: atsdoc.IATsDocNode = node;
            let h: Components.IHierarchyNodeState = {
                name: AtsDoc.translateNodeKind(n).toLocaleLowerCase() + " " + n.name,
                path: n.fqdn
            };
            articleState.hierarchy = h;

            while (n !== null) {

                n = n.extends && n.extends.fqdn && this.__nodesByFqdn[n.extends.fqdn] ? this.__nodesByFqdn[n.extends.fqdn][0] : null;

                if (n !== null) {

                    let fqdn: string = this.__nodesByFqdn[n.fqdn] && this.__nodesByFqdn[n.fqdn].length > 0 ?
                        this.__fqdnWithoutFile(this.__nodesByFqdn[n.fqdn][0]) : n.fqdn;

                    let hs: Components.IHierarchyNodeState = {
                        name: AtsDoc.translateNodeKind(n).toLocaleLowerCase() + " " + fqdn,
                        path: n.fqdn
                    };

                    h.extends = hs;
                    h = h.extends;
                }
            }

        }

        /**
         * Adds a member to the article state
         * @param articleState Article state to be populated with the data
         * @param kind Kind of the member node
         * @param n Node to be added
         */
        private __addMember(articleState: Components.IAjsDocArticleComponentState, kind: string, n: atsdoc.IATsDocNode): void {

            if (!(articleState[kind] instanceof Array)) {
                articleState[kind] = [];
            }
            articleState[kind].push(n);
        }

        /**
         * Searches for all members (i.e. namespace or class members) of the current node in its children nodes
         * @param node Node to be searched for members
         * @param articleState Article state to be populated with the data
         */
        private __addMembers_childrenNodes(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            if (!(node.children instanceof Array) || !(node.children.length > 0)) {
                return;
            }

            for (let n of node.children) {

                switch (n.kind) {

                    case atsdoc.SyntaxKind.ModuleDeclaration:
                        if (n.nodeFlagsString && n.nodeFlagsString.indexOf("Namespace") !== -1) {
                            this.__addMember(articleState, "namespaces", n);
                        } else {
                            this.__addMember(articleState, "modules", n);
                        }
                        break;

                    case atsdoc.SyntaxKind.FunctionDeclaration:
                        this.__addMember(articleState, "functions", n);
                        break;

                    case atsdoc.SyntaxKind.InterfaceDeclaration:
                        this.__addMember(articleState, "interfaces", n);
                        break;

                    case atsdoc.SyntaxKind.ClassDeclaration:
                        this.__addMember(articleState, "classes", n);
                        break;

                    case atsdoc.SyntaxKind.VariableDeclaration:
                        if (n.atsNodeFlags === atsdoc.ATsDocNodeFlags.const) {
                            this.__addMember(articleState, "constants", n);
                        } else {
                            this.__addMember(articleState, "variables", n);
                        }
                        break;

                    case atsdoc.SyntaxKind.EnumDeclaration:
                        this.__addMember(articleState, "enumerations", n);
                        break;

                    case atsdoc.SyntaxKind.EnumMember:
                        this.__addMember(articleState, "enumMembers", n);
                        break;

                    case atsdoc.SyntaxKind.ObjectLiteralExpression:
                        this.__addMember(articleState, "objectLiterals", n);
                        break;

                    case atsdoc.SyntaxKind.Constructor:
                        this.__addMember(articleState, "constructors", n);
                        break;

                    case atsdoc.SyntaxKind.PropertyDeclaration:
                    case atsdoc.SyntaxKind.PropertySignature:
                        this.__addMember(articleState, "properties", n);
                        break;

                    case atsdoc.SyntaxKind.GetAccessor:
                    case atsdoc.SyntaxKind.SetAccessor:
                        this.__addMember(articleState, "accessors", n);
                        break;

                    case atsdoc.SyntaxKind.MethodDeclaration:
                        this.__addMember(articleState, "methods", n);
                        break;

                    case atsdoc.SyntaxKind.MethodSignature:
                        this.__addMember(articleState, "methods", n);
                        break;

                    case atsdoc.SyntaxKind.CallSignature:
                        this.__addMember(articleState, "callSignatures", n);
                        break;

                    case atsdoc.SyntaxKind.IndexSignature:
                        this.__addMember(articleState, "indexSignatures", n);
                        break;
                }
            }

        }

        /**
         * Collects all parameters of the node (i.e. of function, method, arrow function etc)
         * @param node Node which's nodes parameters has to be collected
         * @param articleState Article state to be populated with the data
         */
        private __addMembers_nodeParameters(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {
            if (!(node.parameters instanceof Array) || !(node.parameters.length > 0)) {
                return;
            }

            for (let param of node.parameters) {
                this.__addMember(articleState, "parameters", param);
            }
        }

        /**
         * Obtains a return value of the current node
         * @param node Node which's return value has to be collected
         * @param articleState Article state to be populated with the data
         */
        private __addMembers_returnValue(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            if ((node.kind !== atsdoc.SyntaxKind.FunctionDeclaration) && (node.kind !== atsdoc.SyntaxKind.MethodDeclaration)) {
                return;
            }

            if (!node.hasOwnProperty("type")) {
                return;
            }

            if (node.type.name === "void") {
                return;
            }

            let n: atsdoc.IATsDocNode = {
                kind: atsdoc.SyntaxKind.ReturnStatement,
                kindString: "ReturnStatement",
                parent: node,
                name: "",
                type: node.type,
                children: []
            };

            if (node.type.commentShort) {
                n.commentShort = node.type.commentShort;
            }

            if (node.type.commentLong) {
                n.commentLong = node.type.commentLong;
            }


            this.__addMember(articleState, "returnValue", n);

        }

        /**
         * Collects files where the node was declared in the original program (i.e. namespace can be splitted over multiple files )
         * @param node Node which's files has to be collected
         * @param articleState Article state to be populated with the data
         */
        private __addMembers_sourceFiles(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            if (!node.children) {
                return;
            }

            for (let children of node.children) {
                if (children.kind === atsdoc.SyntaxKind.SourceFile) {
                    this.__addMember(articleState, "files", {
                        parent: children.parent,
                        kind: children.kind,
                        kindString: children.kindString,
                        type: node.type,
                        name: children.name,
                        fqdn: children.fqdn,
                        children: []
                    });
                }
            }
        }

        /**
         * Collects all node members
         * @param node Node of which members has to be collected
         * @param articleState Article state to be populated with the data
         */
        private __getMembers(node: atsdoc.IATsDocNode, articleState: Components.IAjsDocArticleComponentState): void {

            this.__addMembers_childrenNodes(node, articleState);
            this.__addMembers_nodeParameters(node, articleState);
            this.__addMembers_returnValue(node, articleState);
            this.__addMembers_sourceFiles(node, articleState);


        }

        private __fqdnWithoutFile(node: atsdoc.IATsDocNode): string {

            if (node.kind === atsdoc.SyntaxKind.SourceFile) {
                return "";
            }

            let fqdn: string = node.name;
            while (node.parent !== null && node.parent.kind !== atsdoc.SyntaxKind.SourceFile && node.parent.kind !== -1) {
                node = node.parent;
                fqdn = node.name + "." + fqdn;
            }

            return fqdn;

        }

    }

}
