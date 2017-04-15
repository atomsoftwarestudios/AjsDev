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

namespace Ajs.UI {

    "use strict";

    export class ProgressBar {

        protected static _total: number;
        public static total: number;

        protected static _current: number;
        public static current: number;

        protected static _label: string = "";
        protected static _queue: string[] = [];
        protected static _pbar: HTMLElement;
        protected static _perc: HTMLElement;
        protected static _lbl: HTMLElement;

        public static setDOMElement(progressBarElementId: string): void {
            ProgressBar._pbar = document.getElementById(progressBarElementId);
            ProgressBar._perc = document.getElementById(progressBarElementId + "Perc");
            ProgressBar._lbl = document.getElementById(progressBarElementId + "Label");

            if (!ProgressBar._checkDOM()) {
                console.error("Invalid progress bar DOM specification!");
                return;
            }

            ProgressBar._pbar.addEventListener("animationend", () => ProgressBar._hideEnd());
            ProgressBar._pbar.addEventListener("webkitanimationend", () => ProgressBar._hideEnd());
        }

        public static setTotal(total: number): void {
            ProgressBar._total = total;
        }

        public static setCurrent(current: number): void {
            ProgressBar._current = current;
        }

        public static setLabel(label: string): void {
            ProgressBar._label = label;
        }

        public static resourceLoading(label: string): void {
            if (ProgressBar._queue.indexOf(label) === -1) {
                ProgressBar._queue.push(label);
                ProgressBar._update();
            }
        }

        public static resourceLoaded(label: string): void {
            ProgressBar._current += 1;
            if (ProgressBar._queue.indexOf(label) !== -1) {
                ProgressBar._queue.splice(ProgressBar._queue.indexOf(label), 1);
            }
            ProgressBar._update();
        }

        public static show(): void {
            if (!ProgressBar._checkDOM()) {
                console.error("Invalid progress bar DOM specification!");
                return;
            }
            ProgressBar._pbar.style.display = "";
            ProgressBar._pbar.setAttribute("hidden", "false");
        }

        public static hide(): void {
            if (!ProgressBar._checkDOM()) {
                console.error("Invalid progress bar DOM specification!");
                return;
            }
            ProgressBar._pbar.setAttribute("hidden", "true");
        }

        protected static _hideEnd(): void {
            ProgressBar._pbar.style.display = "none";
        }

        protected static _update(): void {
            if (!ProgressBar._checkDOM()) {
                return;
            }

            let v: number = Math.floor((ProgressBar._current / ProgressBar._total) * 100);
            if (v >= 100) {
                v = 100;
                ProgressBar.hide();
            }

            ProgressBar._perc.style.width = v + "%";
            if (ProgressBar._label === "" && ProgressBar._queue.length > 0) {
                ProgressBar._lbl.innerHTML = ProgressBar._queue.join("<br />");
            } else {
                ProgressBar._lbl.innerHTML = ProgressBar._label;
            }

        }

        protected static _checkDOM(): boolean {
            return !(ProgressBar._lbl === undefined || ProgressBar._lbl === null ||
                ProgressBar._pbar === undefined || ProgressBar._pbar === null ||
                ProgressBar._perc === undefined || ProgressBar._perc === null);
        }

    }

}
