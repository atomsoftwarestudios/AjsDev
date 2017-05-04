///<reference path="./Node.ts" />
///<reference path="./Element.ts" />
///<reference path="./NodeListImpl.ts" />
///<reference path="./HTMLElement.ts" />

namespace Ajs.VDom {

    "use strict";

    /**
     * Implementation of the HTMLElement collection. It is inherited from JavaScript Array.
     */
    export class HTMLCollectionOfImpl extends Array<HTMLElement> implements IHTMLCollectionOf<HTMLElement> {

        /**
         * Constructs the HTMLColletionOfImpl object
         * @param arrayLength
         */
        public constructor(arrayLength?: number) {
            if (arrayLength) {
                super(arrayLength);
            } else {
                super();
            }
        }

        /**
         * Returns the specific node at the given zero-based index into the list. Returns null if the index is out of range.
         * @param index
         */
        public item(index: number): HTMLElement {
            if (index < 0 || index > this.length - 1) {
                return null;
            }

            return this[index];
        }

        /**
         * Returns the specific node whose ID or, as a fallback, name matches the string specified by name.
         * <p>
         * Matching by name is only done as a last resort, only in HTML, and only if the referenced
         * element supports the name attribute. Returns null if no node exists by the given name.
         * </p>
         * @param name Value of the id or name attribute to be searched
         */
        public namedItem(name: string): HTMLElement {
            for (let e of this) {
                if (e.getAttribute("id") === name || e.getAttribute("name") === ("id")) {
                    return e;
                }
            }
            return null;
        }

    }

}