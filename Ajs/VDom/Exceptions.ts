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

///<refernece path="./Node.ts" />

namespace Ajs.VDom {

    "use strict";

    /** Thrown when the node is trying to be inserted before a node which is not children of the node to which the new node is about to be inserted */
    export class BeforeNodeIsNotNodeChildrenException extends Exception {
    }

    /** Thrown when operation with the children node is about to be performed but the node is not children node of the node used to perform the operation  */
    export class NodeIsNotChildrenNodeException extends Exception {
    }

    /** Thrown when element is used to set the text content. Children text node should be added instead  */
    export class OnlyTextNodesCanHaveTextContentException extends Exception {
    }

    /** Operation failed because the node type is invalid for given operation type */
    export class InvalidNodeTypeException extends Exception {
    }
}