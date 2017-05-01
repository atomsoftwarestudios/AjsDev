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

///<reference path="view/Body.tsx" />
///<reference path="view/StyleSheet.tsx" />

/**
 * The debugging namespace contain the debugging console and debugging tools for Ajs and Application developers
 */
namespace Ajs.Dbg {

    "use strict";

    export class Console implements IConsole {

        // config
        private __config: IConsoleConfig;
        protected get _config(): IConsoleConfig { return this.__config; }

        // debugging modules
        private __modules: IConsoleModule[];
        public get modules(): IConsoleModule[] { return this.__modules; }

        // debug interface style element
        private __styleElements: HTMLElement[];

        // debug interface element
        private __bodyElement: HTMLElement;

        // view components
        private __body: View.Body;
        private __styleSheet: View.StyleSheet;

        private __infoElement: HTMLDivElement;

        public constructor(config: IConsoleConfig) {
            this.__config = config;
            this.__modules = [];
            this.__styleElements = [];
            this.__bodyElement = null;
            this.__infoElement = null;

            Ajs.ajsconsole = this;
        }

        /**
         * Register module is called from the console module constructor
         * @param consoleModule Module instance to be registered
         */
        public registerModule(consoleModule: IConsoleModule): void {
            if (this.__modules.indexOf(consoleModule) !== -1) {
                return;
            }

            this.__modules.push(consoleModule);

            // on first module registration init the console and eventually show it
            if (this.__modules.length === 1) {
                this.__init(this.__modules[0]);
            }
        }

        /**
         * 
         * @param info
         */
        public setInfo(info: string): void {
            if (this.__infoElement === null) {
                return;
            }

            this.__infoElement.textContent = info;
        }

        /**
         * Shows the debugging console (renders it to configured body and style elements)
         */
        public show(): void {
            if (this.__modules.length === 0) {
                throw new NoDebugModulesConfiguredException();
            }

            if (this.__bodyElement !== null) {
                return;
            }

            this.__bodyElement = this.__body.render();
            this.__config.bodyRenderTarget.appendChild(this.__bodyElement);

            let styleElement: HTMLElement = this.__styleSheet.render();
            this.__config.styleRenderTarget.appendChild(styleElement);
            this.__styleElements.push(styleElement);

            for (let m of this.__modules) {
                styleElement = m.renderStyleSheet();
                this.__config.styleRenderTarget.appendChild(styleElement);
                this.__styleElements.push(styleElement);
            }

            this.__infoElement = <HTMLDivElement>this.__config.bodyRenderTarget.ownerDocument.getElementById("ajsDebugInfo");

            this.__body.currentModule.bodyRendered();
        }

        /**
         * Hides the debugging console (removes body and style elements from DOM)
         */
        public hide(): void {
            if (this.__bodyElement === null) {
                return;
            }

            this.__bodyElement.parentElement.removeChild(this.__bodyElement);
            this.__bodyElement = null;

            for (let i: number = 0; i < this.__styleElements.length; i++) {
                this.__styleElements[i].parentElement.removeChild(this.__styleElements[i]);
            }
            this.__styleElements = [];
        }

        /**
         * Refreshes the console contents
         * Refresh fully re-renders the console including the module as there is no support for update in the tsx
         */
        public refresh(): void {
            if (this.__bodyElement === null) {
                return;
            }

            this.__bodyElement.parentElement.removeChild(this.__bodyElement);
            this.__bodyElement = this.__body.render();
            this.__config.bodyRenderTarget.appendChild(this.__bodyElement);
            this.__infoElement = <HTMLDivElement>this.__config.bodyRenderTarget.ownerDocument.getElementById("ajsDebugInfo");
            this.__body.currentModule.bodyRendered();
        }

        /**
         * Initializes and eventually shows the console
         * Called when the first console module is registered
         * @param defaultModule
         */
        private __init(defaultModule: IConsoleModule): void {

            this.__body = new Ajs.Dbg.View.Body(this, defaultModule);
            this.__styleSheet = new Ajs.Dbg.View.StyleSheet();

            if (this.__config.showOnBootDelay > 0) {

                let delay: number;

                if (this.__config.showOnBootDelay < 500) {
                    // let some time to container to create (and register) modules
                    delay = 500;
                } else {
                    delay = this.__config.showOnBootDelay;
                }

                setTimeout(() => { this.show(); }, delay);
            }
        }

    }

}
