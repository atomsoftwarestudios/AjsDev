///<reference path="./Node.ts" />
///<reference path="./Element.ts" />
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Interface to be implemented by all linked node lists
     */
    export interface NodeListOf<T extends Node> extends NodeList {
        item: (index: number) => T;
    }

}