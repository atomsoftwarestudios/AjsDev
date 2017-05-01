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

///<reference path="../../tsx/tsx.ts" />

namespace Ajs.Dbg.Modules.Logger {

    "use strict";

    export class LogBody implements Tsx.IViewComponent {

        protected _logElement: HTMLDivElement;

        protected _lastSelected: HTMLTableRowElement;
        protected _lastMarked: HTMLTableRowElement;

        protected _logger: Logger;

        constructor(logger: Logger) {
            this._logger = logger;
            this._lastSelected = null;
            this._lastMarked = null;
        }

        protected _selectRow(e: MouseEvent): void {
            let row: HTMLTableRowElement = e.currentTarget as HTMLTableRowElement;
            if (row !== this._lastSelected) {
                if (this._lastSelected !== null && row !== this._lastSelected) {
                    let r1: ILogRecord = (this._lastSelected as any).ajsdata;
                    let r2: ILogRecord = (row as any).ajsdata;
                    this._logger.setInfo("Time to last selected record: " + Math.abs(r1.time.getTime() - r2.time.getTime()) + "ms");
                }

                if (this._lastSelected !== null) {
                    this._lastSelected.removeAttribute("ajsselected");
                    if (this._lastMarked !== null) {
                        this._lastMarked.removeAttribute("ajsmarked");
                    }
                    this._lastMarked = this._lastSelected;
                    this._lastMarked.setAttribute("ajsmarked", "true");
                }
                this._lastSelected = row;
                this._lastSelected.setAttribute("ajsselected", "true");
            } else {
                if (this._lastMarked !== null) {
                    this._lastMarked.removeAttribute("ajsmarked");
                    this._lastMarked = null;
                }
            }

            this._logger.itemSelected((this._lastSelected as any).ajsdata);
        }

        protected _scroll(e: Event): void {
            let doc: Document = (e.currentTarget as HTMLElement).ownerDocument;
            let hdr: HTMLDivElement = (doc.getElementsByClassName("ajsDebugLogHeader")[0].parentElement) as HTMLDivElement;
            let bdy: HTMLDivElement = (doc.getElementsByClassName("ajsDebugLogBody")[0].parentElement) as HTMLDivElement;
            hdr.scrollLeft = bdy.scrollLeft;
        }

        public setBreakpoint(): void {
            this._lastSelected.setAttribute("ajsbreakpoint", "true");
        }

        public unsetBreakpoint(): void {
            this._lastSelected.setAttribute("ajsbreakpoint", "false");
        }

        public clearBreakpoints(): void {
            let tableElement: HTMLTableElement = this._logElement.children[1].children[0] as HTMLTableElement;
            for (let i: number = 0; i < tableElement.childElementCount; i++) {
                if (tableElement.childNodes[i] instanceof HTMLTableRowElement &&
                    (tableElement.childNodes[i] as HTMLElement).hasAttribute("ajsbreakpoint")) {
                    (tableElement.childNodes[i] as HTMLElement).removeAttribute("ajsbreakpoint");
                }
            }
        };

        public render(): HTMLElement {

            this._lastSelected = null;

            let lines: any[] = [];

            for (let i: number = 0; i < this._logger.records.length; i++) {
                let className: string = "ajsDebugLog" + LogType[this._logger.records[i].type];
                lines.push(
                    <tr class={className} ajsbreakpoint={this._logger.records[i].breakpoint}
                        mousedown={(e: Event) => (this._selectRow(e as MouseEvent))} ajsdata={this._logger.records[i]}>
                        <td>{i}</td>
                        <td>{this._logger.records[i].occurence}</td>
                        <td>{this._logger.records[i].time.getTime() - this._logger.initTime}</td>
                        <td>{LogType[this._logger.records[i].type]}</td>
                        <td>{this._logger.records[i].level}</td>
                        <td>{this._logger.records[i].module}</td>
                        <td>{this._getType(this._logger.records[i].object)}</td>
                        <td>{this._logger.records[i].function}</td>
                        <td>{this._logger.records[i].caller}</td>
                        <td>{this._logger.records[i].message}</td>
                        <td>{this._logger.records[i].data}</td>
                    </tr>
                );
            }

            this._logElement = (
                <div>
                    <div class="ajsDebugLogHeaderContainer">
                        <table cellpadding="0" cellspacing="0" class="ajsDebugLogHeader">
                            <tr>
                                <th>No.</th>
                                <th>Occ</th>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Lvl</th>
                                <th>Module</th>
                                <th>Object class</th>
                                <th>Function / Method</th>
                                <th>Caller</th>
                                <th>Message</th>
                                <th>Data</th>
                            </tr>
                        </table>
                    </div>

                    <div class="ajsDebugLogContainer" scroll={(e: Event) => (this._scroll(e))}>
                        <table cellpadding="0" cellspacing="0" class="ajsDebugLogBody">
                            {lines}
                        </table>
                    </div>
                </div>
            ) as HTMLDivElement;

            return this._logElement;
        }

        protected _getType(object: any): string {

            switch (typeof (object)) {
                case "string":
                    return "string";
                case "number":
                    return "number";
                case "object":
                    if (object === null) {
                        return "null";
                    } else {
                        if (object.constructor) {
                            return Ajs.Utils.getClassName(object);
                        }
                    }
                    return "object";
                default:
                    return  "";
            }
        }

        public rendered(doc: Document): void {

            if (this._logger.records.length === 0) {
                return;
            }

            let hdr: HTMLTableElement = doc.getElementsByClassName("ajsDebugLogHeader")[0] as HTMLTableElement;
            let bdy: HTMLTableElement = doc.getElementsByClassName("ajsDebugLogBody")[0] as HTMLTableElement;

            for (let i: number = 0; i < hdr.firstChild.childNodes.length; i++) {

                let hth: HTMLElement = hdr.firstChild.childNodes[i] as HTMLElement;
                let btd: HTMLElement = bdy.firstChild.childNodes[i] as HTMLElement;

                let hcs: CSSStyleDeclaration = window.getComputedStyle(hth);
                let bcs: CSSStyleDeclaration = window.getComputedStyle(btd);

                let hthSize: number = parseFloat(hcs.paddingLeft) + parseFloat(hcs.paddingRight) +
                    parseFloat(hcs.borderLeftWidth) + parseFloat(hcs.borderRightWidth) +
                    parseFloat(hcs.marginLeft) + parseFloat(hcs.marginRight) + parseFloat(hcs.width);

                let bcsSize: number = parseFloat(bcs.paddingLeft) + parseFloat(bcs.paddingRight) +
                    parseFloat(bcs.borderLeftWidth) + parseFloat(bcs.borderRightWidth) +
                    parseFloat(bcs.marginLeft) + parseFloat(bcs.marginRight) + parseFloat(bcs.width);

                if (hthSize > bcsSize) {
                    btd.style.width = hthSize + "px";
                } else {
                    hth.style.width = bcsSize + "px";
                }
            }
        }

    }

}
