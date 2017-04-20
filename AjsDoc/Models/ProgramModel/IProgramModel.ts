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

    export const IIProgramModel: IProgramModel = Ajs.DI.II;

    export interface IProgramModel extends Ajs.MVVM.Model.IModel {

        /**
         * Returns menu component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        getMenu(path: string): Promise<Components.IAjsDocMenuComponentState>;

        /**
         * Returns a navbar component state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        getNavBar(path: string): Promise<Components.IAjsDocNavBarItemComponentState[]>;

        /**
         * Return article content state resolved from the path url part
         * @param path Part of the url describing the path to be resolved
         */
        getContent(path: string): Promise<Components.IAjsDocArticleComponentState>;

        /**
         * Navigates to the doc node described by the path
         * @param navPath Part of the url describing the path to the file
         */
        navigateDocNode(path: string, dontExpand?: boolean): Promise<atsdoc.IATsDocNode>;


    }

}
