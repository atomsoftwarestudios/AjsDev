///<reference path="./Node.ts" />
///<reference path="./Element.ts" />
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * NodeList objects are collections (linked lists) of nodes such as those returned by i.e. Node.childNodes
     */
    export type NodeList = INodeList;

    /**
     * NodeList objects are collections (linked lists) of nodes such as those returned by i.e. Node.childNodes
     */
    export interface INodeList {

        /** Holds the number of nodes in the list */
        readonly length: number;

        /**
         * Returns item from the collection at the specified index. It is "slow" access to the list item as
         * it is neccessary to iterate through the list to specified item before it can be returned. For iterating
         * the list it is recommended to obtain the first item in the list using the list.item(0) and then
         * using the item.nextSibling method.
         */
        item: (index: number) => INode;
    }


}