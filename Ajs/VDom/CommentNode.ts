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

///<reference path="./Node.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Represents simplified DOM comment node
     * <p>
     * The DomParser currently skips comment nodes so setting the innerHTML with
     * the comment node will skip the node when the HTML is parsed. However, the
     * comment node can be added programatically to the dom and later readed
     * using the innerHTML property.
     * </p>
     */
    export class CommentNode extends Node {

        /**
         * Constructs the comment DOM node
         * @param text Text to be set to the comment node
         * @param ownerDocument Owner document of the comment node
         */
        public constructor(data: string, ownerDocument: Document) {
            super(Node.COMMENT_NODE, "#comment", ownerDocument);
            this._nodeValue = data;
        }

    }

}