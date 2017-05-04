namespace Ajs.VDom {

    "use strict";

    export interface INamedItem {
        name: string;
    }

    /**
     * The NamedNodeMap interface represents a collection of #see [Attr]{Ajs.VDom.Attr} objects.
     * <p>
     * Objects inside a NamedNodeMap are not in any particular order, unlike NodeList, although they
     * may be accessed by an index as in an array.
     * </p>
     */
    export class NamedNodeMap<T extends INamedItem> {

        /**
         * Holds nodes stored in the named node map
         */
        private __nodes: { [name: string]: T };

        /**
         * Constructs the NamedNodeMap and prepares it for usage
         */
        constructor() {
            this.__nodes = {};
        }

        /**
         * Returns the amount of objects in the map.
         */
        public get length(): number {
            return Object.keys(this.__nodes).length;
        }

        /**
         * Returns a #see [Attr]{Ajs.VDom.Attr}, corresponding to the given name.
         * @param name Name of the #see [Attr]{Ajs.VDom.Attr}, to be returned
         */
        public getNamedItem(name: string): T {
            if (!(name in this.__nodes)) {
                return null;
            }

            return this.__nodes[name];
        }

        /**
         * Replaces, or adds, the #see [Attr]{Ajs.VDom.Attr}, identified in the map by the given name.
         * @param item Name of the #see [Attr]{Ajs.VDom.Attr}, whose value has to be set
         */
        public setNamedItem(item: T): T {
            this.__nodes[item.name] = item;
            return item;
        }

        /**
         * Removes the #see [Attr]{Ajs.VDom.Attr}, identified by the given map.
         * @param item Name of the #see [Attr]{Ajs.VDom.Attr}, to be removed from the map
         */
        public removeNamedItem(item: T): void {
            if (!(item.name in this.__nodes)) {
                return null;
            }

            delete this.__nodes[item.name];
        }

        /**
         * Returns the #see [Attr]{Ajs.VDom.Attr} at the given index, or null if the index is higher or equal to the number of nodes.
         * @param index Index of the #see [Attr]{Ajs.VDom.Attr} to be returned
         */
        public item(index: number): T {
            let rv: T = this.__nodes[Object.keys(this.__nodes)[index]];
            return rv || null;
        }

   }

}