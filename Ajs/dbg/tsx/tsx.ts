/* * ************************************************************************
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

/**
 * ajs.tsx "replaces" the React.js
 * <p>
 * TSX is very very very limited reactive renderer without updating support (so elements must be
 * removed and re-rendered completely. It does not support custom components implemented as HTML
 * elements as it is not neccessary for debugging interface. Its purpose is just to make development
 * of the debug module views easier and better maintanable.
 * </p>
 * <p>
 * <strong>
 * The tsx is not supposed to be used in Applications. It is for internal puproses of the ajs.debug
 * namespace only!
 * </strong>
 * </p>
 * <p>
 * It makes possible usingof the TSX compiler within the Ajs. TSX is needed just for the debug namespace
 * to render components and because storing of the HTML in string is not nice and not well mainanable the
 * decision to use the TSX was made. It is not possible to use the Ajs internally as it would interferre
 * together.
 * </p>
 */
namespace Ajs.Dbg.Tsx {

    "use strict";

    /**
     * Just throws an exception with the given message
     * @param message
     */
    function exception(message: string): HTMLElement {
        throw message;
    }

    /**
     * Renders style tag. As { and } are not supported by TSX, the ^ and $ are used instead.
     * @param style Style string to be rendered
     */
    function renderStyle(style: string): HTMLElement {
        style = style.replace(/\^/g, "{").replace(/\$/g, "}");
        let element: HTMLElement = Ajs.ajsConfig.debugging.console.styleRenderTarget.ownerDocument.createElement("style");
        element.setAttribute("type", "text/css");
        element.textContent = style;
        return element;
    }

    /**
     * Renders the tag defined in the TSX template
     * @param tag Tag to be rendered
     * @param props Properties and the data of the tag
     * @param children Children tags and nodess
     */
    function renderTag(tag: string, props?: any, ...children: any[]): HTMLElement {

        let element: HTMLElement = null;

        if (Ajs.Utils.htmlTags.indexOf(tag.toUpperCase()) !== -1) {
            element = Ajs.ajsConfig.debugging.console.bodyRenderTarget.ownerDocument.createElement(tag);
            if (children instanceof Array) {
                processChildren(element, children);
            }
        }

        setElementAttribs(element, props);

        return element;
    }

    /**
     * Processes all children of the given TSX tag
     * @param element HTML element created in the renderTag function
     * @param children TSX children to be processed
     */
    function processChildren(element: HTMLElement, children: any[]): void {
        for (let i: number = 0; i < children.length; i++) {
            processChild(element, children[i]);
        }
    }

    /**
     * Processes single child of the given TSX tag
     * @param element HTML element created in the
     * @param child TSX child to be processed
     */
    function processChild(element: HTMLElement, child: any): void {

        if (child instanceof Array) {
            processChildren(element, child);
        } else {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }

            if (typeof child === "string" || typeof child === "number") {
                child = "" + child;
                let node: Text = Ajs.ajsConfig.debugging.console.styleRenderTarget.ownerDocument.createTextNode(child);
                element.appendChild(node);
            }
        }

    }

    /**
     * Processes the tag properties and creates appropriate attributes
     * <p>If the property key is 'ajsdata' the data of this property are assigned to the HTML element object under the ajsdata property </p>
     * <p>If the property is instance of a function the event listener with the same name as the property is added to the tag</p>
     * <p>In all other cases, the attribute is added</p>
     * @param element HTML element created in the
     * @param props TSX properties passed from the TSX template
     */
    function setElementAttribs(element: HTMLElement, props?: any): void {
        if (props) {
            for (let key in props) {
                if (props.hasOwnProperty(key)) {
                    if (key !== "ajsdata") {
                        if (props[key] instanceof Function) {
                            element.addEventListener(key, props[key]);
                        } else {
                            element.setAttribute(key, props[key]);
                        }
                    } else {
                        element[key] = props[key];
                    }
                }
            }
        }
    }

    /**
     * Creates an HTML element from the TSX template including all its children and properties defined in TSX.
     * <p>The owner document of the #see {ajs.debug.console.config.styleRenderTarget} is used to create the element</p>
     * @param tag Tag the element will be created from
     * @param props Element attributes, event listeners and data properties
     * @param children Children elements and text nodes
     */
    export function createElement(tag: string, props?: any, ...children: any[]): HTMLElement {

        let element: HTMLElement = null;

        switch (tag) {
            case "style":
                element = (children.length === 1) ? renderStyle(children[0]) : exception("Unexpected style data!");
                break;
            default:
                element = renderTag(tag, props, children);
        }

        if (element === null) {
            throw "Invalid tag";
        }

        return element;
    }

}

/**
 * Replaces the React.js by ajs.dbg.tsx to process tsx files
 * <p>
 * ajs.dbg.tsx is simplified Reactive library without update functionality used for debug console modules rendering only.
 * </p>
 * <p>
 * <strong>It is not supposed to be used in the productional environments!</strong>
 * <p>
 * This global variable makes tsx processor available in the same way as in case the React.js is loaded by require.js.
 * </p>
 * <p>
 * Ajs framework library must be compiled with --jsx react and --reactNamespace AjsDebugTsxFactory parameters in order to
 * work correctly. For productional environments the AjsDebugTsxFactory variable and ajs.dbg* namespace/s should be
 * removed from the library
 * </p>
 */
/* tslint:disable:no-unused-variable */
let AjsDebugTsxFactory: typeof Ajs.Dbg.Tsx = Ajs.Dbg.Tsx;
/* tslint:enable:no-unused-variable */
