/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

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

namespace AjsDoc.Components {

    "use strict";

    export enum TransitionType {
        NONE,
        FADE,
        LTR,
        RTL
    }

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
    ];

    export interface IAjsDocMenuComponentState extends Ajs.MVVM.ViewModel.IViewComponentState {
        parentLabel?: string;
        parentPath?: string;
        groups?: IAjsDocMenuGroupComponentState[];
        items?: IAjsDocMenuItemComponentState [];
    }

    export interface ICPAjsDocMenuComponent {
        programModel: typeof Models.ProgramModel.IIProgramModel;
        contentModel: typeof Models.ContentModel.IIContentModel;
    }

    @Ajs.viewcomponent()
    export class AjsDocMenuComponent
        extends Ajs.MVVM.ViewModel.ViewComponent<IAjsDocMenuComponentState, any>
        implements IAjsDocMenuComponentState {

        public parentLabel: string;
        public parentPath: string;
        public groups: AjsDocMenuGroupComponent[];
        public items: AjsDocMenuItemComponent[];

        private __programModel: Models.ProgramModel.IProgramModel;
        private __contentModel: Models.ContentModel.IContentModel;

        private __previousContext: string;
        private __previousRefNode: atsdoc.IATsDocNode;
        private __previousArticle: DTO.IArticleData;

        protected async _onConfigure(
            programModel: Models.ProgramModel.IProgramModel,
            contentModel: Models.ContentModel.IContentModel): Promise<void> {

            this.__programModel = programModel;
            this.__contentModel = contentModel;

            this.__programModel.initialize();
            this.__contentModel.initialize();
        }

        protected async _onInitialize(): Promise<void> {

            this.__previousContext = null;
            this.__previousRefNode = null;
            this.__previousArticle = null;

        }

        protected async _onFinalize(): Promise<void> {

            this.__programModel.release();
            this.__programModel === null;

            this.__contentModel.release();
            this.__contentModel === null;

        }

        public touchMove(e: Event): void {

            e.cancelBubble = true;
            e.stopPropagation();

            let el: Node = this.ajs.documentManager.getTargetNodeByUniqueId(this.componentViewId);

            if (el instanceof HTMLElement) {
                if ((el as HTMLElement).scrollHeight <= (el as HTMLElement).clientHeight) {
                    e.preventDefault();
                }
            }

        }

        public async stateTransitionBegin(): Promise<Ajs.MVVM.ViewModel.ITransitionType> {

            let transitionType: TransitionType = await this._getTransitionType();

            if (transitionType === TransitionType.NONE) {
                return null;
            } else {
                return {
                    oldComponent: TransitionType[transitionType],
                    newComponent: TransitionType[transitionType]
                };
            }

        }

        public stateTransitionEnd(e: Event): void {
            this._ajsVisualStateTransitionEnd();
        }

        protected async _getTransitionType(): Promise<TransitionType> {

            let transitionType: TransitionType = TransitionType.NONE;

            let path: string = this.ajs.router.currentRoute.base;

            if (path.substr(0, 3) === "ref") {

                if (this.__previousContext === "") {
                    transitionType = TransitionType.FADE;
                } else {
                    transitionType = await this._getTransitionTypeRef(path.substr(4));
                }

                this.__previousContext = "ref";

            } else {

                if (this.__previousContext === "ref") {
                    transitionType = TransitionType.FADE;
                } else {
                    transitionType = await this._getTransitionTypeDoc(path);
                }

                this.__previousContext = "";

            }

            return transitionType;
        }

        protected async _getTransitionTypeDoc(path: string): Promise<TransitionType> {

            let transitionType: TransitionType = TransitionType.NONE;

            let currentArticle: DTO.IArticleData = await this.__contentModel.navigate(path);

            if (this.__previousArticle !== undefined) {

                if (this.__previousArticle !== null) {

                    if (currentArticle.parent === this.__previousArticle.parent) {
                        if (currentArticle.children && currentArticle.children.length > 0) {
                            transitionType = TransitionType.RTL;
                        } else {
                            if (this.__previousArticle.children && this.__previousArticle.children.length > 0) {
                                transitionType = TransitionType.LTR;
                            }
                        }
                    }

                    if (currentArticle.parent === this.__previousArticle) {
                        if (currentArticle.children && currentArticle.children.length > 0) {
                            transitionType = TransitionType.RTL;
                        }
                    }

                    if (currentArticle.parent === this.__previousArticle) {
                        if (currentArticle.children && currentArticle.children.length > 0) {
                            transitionType = TransitionType.RTL;
                        }
                    }

                    if (currentArticle === this.__previousArticle.parent) {
                        if (this.__previousArticle.children && this.__previousArticle.children.length > 0) {
                            transitionType = TransitionType.LTR;
                        }
                    }

                    if (this.__previousArticle.parent && currentArticle === this.__previousArticle.parent.parent) {
                        transitionType = TransitionType.LTR;
                    }

                } else {
                    transitionType = TransitionType.FADE;
                }

            } else {
                transitionType = TransitionType.NONE;
            }

            this.__previousArticle = currentArticle;

            return transitionType;
        }

        protected async _getTransitionTypeRef(path: string): Promise<TransitionType> {

            let transitionType: TransitionType = TransitionType.NONE;

            let currentNode: atsdoc.IATsDocNode = await this.__programModel.navigateDocNode(path);
            if (!(currentNode.children instanceof Array) || currentNode.children.length === 0) {
                currentNode = currentNode.parent;
            }


            if (this.__previousArticle !== undefined) {

                if (this.__previousRefNode !== null) {

                    if (currentNode.parent !== this.__previousRefNode && currentNode.parent !== this.__previousRefNode.parent) {
                        transitionType = TransitionType.FADE;
                    }

                    if (currentNode === this.__previousRefNode.parent) {
                        transitionType = TransitionType.LTR;
                    }

                    if (currentNode.parent === this.__previousRefNode && MENU_DONT_EXPAND.indexOf(currentNode.kindString) === -1) {
                        transitionType = TransitionType.RTL;
                    }

                } else {
                    transitionType = TransitionType.FADE;
                }

                if (MENU_DONT_EXPAND.indexOf(currentNode.kindString) === -1) {
                    this.__previousRefNode = currentNode;
                } else {
                    if (this.__previousRefNode === null) {
                        let node: atsdoc.IATsDocNode = currentNode.parent;
                        while (node.parent !== null) {
                            if (MENU_DONT_EXPAND.indexOf(node.kindString) === -1) {
                                this.__previousRefNode = node;
                                break;
                            }
                            node = node.parent;
                        }
                    }
                }

            } else {
                transitionType = TransitionType.NONE;
            }


            return transitionType;
        }

    }

}