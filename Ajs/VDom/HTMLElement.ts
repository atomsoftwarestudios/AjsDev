///<refernece path="./Element.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Represents the HTML element
     * <p>
     * In VDOM, it just inherits the Element and does not implement any properties or methods
     * implemented in standard DOM. It i.e. does not allow access to attribute value using the
     * property as it is not neccessary for operations required.
     * </p>
     */
    export class HTMLElement extends Element {
    }

}