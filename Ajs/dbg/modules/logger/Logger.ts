/*! ************************************************************************
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
///<reference path="LogBody.tsx" />
///<reference path="LoggerStyleSheet.tsx" />
///<reference path="LoggerToolbar.tsx" />

/**
 * Contains view components of the log debug module
 */
namespace Ajs.Dbg.Modules.Logger {

    "use strict";

    export interface ICPLogger {
        console: typeof Ajs.Dbg.IIConsole;
        config: ILoggerConfig;
    }

    export class Logger implements ILogger {

        protected _console: Ajs.Dbg.IConsole;
        protected _config: ILoggerConfig;

        protected _initTime: number;
        public get initTime(): number { return this._initTime; }

        protected _records: ILogRecord[];
        public get records(): ILogRecord[] { return this._records; }

        protected _sameTypeCounter: ISameTypeCounterCollection;

        protected _breakpoints: IBreakPoint[];

        // view components
        protected _styleSheet: LoggerStyleSheet;
        protected _toolBar: LoggerToolbar;
        protected _body: LogBody;

        protected _bodyElement: HTMLElement;

        protected _selectedItem: ILogRecord;

        constructor(console: Ajs.Dbg.IConsole, config: ILoggerConfig) {
            this._initTime = (new Date()).getTime();
            this._console = console;
            this._config = config;
            this._records = [];
            this._sameTypeCounter = {};
            this._selectedItem = null;
            this._breakpoints = [];

            this._styleSheet = new LoggerStyleSheet(this);
            this._toolBar = new LoggerToolbar(this);
            this._body = new LogBody(this);

            if (sessionStorage) {
                let bkpsJSON: string = sessionStorage.getItem("AJS_DEBUG_LOGGER_BREAKPOINTS");
                if (bkpsJSON !== null) {
                    this._breakpoints = JSON.parse(bkpsJSON);
                }
            } else {
                alert("Breakpoints not supported");
            }

            console.registerModule(this);
        }

        public setInfo(info: string): void {
            this._console.setInfo(info);
        }

        public refresh(): void {
            this._console.hide();
            this._console.show();
        }

        public setBreakpoint(): void {
            if (this._selectedItem !== null && !this._selectedItem.breakpoint) {
                this._selectedItem.breakpoint = true;
                this._body.setBreakpoint();
                this._breakpoints.push({
                    recordTypeId: this._selectedItem.sameTypeId,
                    occurence: this._selectedItem.occurence
                });
                sessionStorage.setItem("AJS_DEBUG_LOGGER_BREAKPOINTS", JSON.stringify(this._breakpoints));
            }
        }

        public resetBreakpoint(): void {
            if (this._selectedItem !== null && this._selectedItem.breakpoint) {
                this._selectedItem.breakpoint = false;
                this._body.unsetBreakpoint();
                for (let i: number = 0; i < this._breakpoints.length; i++) {
                    if (this._breakpoints[i].recordTypeId === this._selectedItem.sameTypeId &&
                        this._breakpoints[i].occurence === this._selectedItem.occurence) {
                        this._breakpoints.splice(i, 1);
                        break;
                    }
                }
                sessionStorage.setItem("AJS_DEBUG_LOGGER_BREAKPOINTS", JSON.stringify(this._breakpoints));
            }
        }

        public clearBreakpoints(): void {
            if (sessionStorage) {
                this._breakpoints = [];
                sessionStorage.setItem("AJS_DEBUG_LOGGER_BREAKPOINTS", JSON.stringify(this._breakpoints));
                this._body.clearBreakpoints();
            }
        }

        public itemSelected(item: ILogRecord): void {
            this._selectedItem = item;
            if (sessionStorage) {
                this._toolBar.enableBreakpoints();
            }
        }

        protected _checkBreakPoint(typeId: string, occurence: number): boolean {
            for (let i: number = 0; i < this._breakpoints.length; i++) {
                if (this._breakpoints[i].recordTypeId === typeId && this._breakpoints[i].occurence === occurence) {
                    return true;
                }
            }
            return false;
        }

        public getButtonLabel(): string {
            return "Log";
        }

        public renderStyleSheet(): any {
            return this._styleSheet.render();
        }

        public renderToolbar(): any {
            return this._toolBar.render();
        }

        public renderBody(): any {
            this._bodyElement = this._body.render();
            return this._body.render();
        }

        public bodyRendered(): void {
            this._body.rendered(this._bodyElement.ownerDocument);
        }

        public log(type: LogType, level: number, sourceModule: string, object: any, message?: string, ...data: any[]): void {

            if (this._config.logTypes.indexOf(type) === -1 || level > this._config.maxLevel || !this._config.enabled) {
                return;
            }

            if (this._config.sourceModules.indexOf(sourceModule) === -1) {
                return;
            }

            let fnInfo: IFunctionInfo = this.__getFunctionInfo();

            let logRecord: ILogRecord = {
                sameTypeId: "",
                time: new Date(),
                occurence: 0,
                type: type,
                level: level,
                module: sourceModule,
                object: object,
                function: fnInfo.name,
                caller: fnInfo.caller,
                message: message || "",
                data: data instanceof Array ? data.length : 0,
                breakpoint: false
            };

            if (this._config.logDataToConsole) {

                let msg: string = message ? message : "";
                if (data[0]) {
                    window.console.log(this._records.length + ": " + LogType[type] + " " +
                        msg + "[ " + logRecord.module + "." + logRecord.object + "." + logRecord.function + " ]", data[0]);
                } else {
                    window.console.log(this._records.length + ": " + msg + "[ " + logRecord.module + "." + logRecord.object +
                        "." + logRecord.function + " ]");
                }

            }

            let sameTypeId: string = LogType[logRecord.type] + " " + level + " " +
                logRecord.module + " " + logRecord.object + " " + logRecord.function;

            sameTypeId = sameTypeId.replace(/\./g, "_");
            sameTypeId = sameTypeId.replace(/ /g, "_");
            sameTypeId = sameTypeId.replace(/\{/g, "");
            sameTypeId = sameTypeId.replace(/\}/g, "");
            sameTypeId = sameTypeId.replace(/\(/g, "");
            sameTypeId = sameTypeId.replace(/\)/g, "");
            sameTypeId = sameTypeId.replace(/\[/g, "");
            sameTypeId = sameTypeId.replace(/\]/g, "");
            sameTypeId = sameTypeId.replace(/\n/g, "");
            logRecord.sameTypeId = sameTypeId;
            if (this._sameTypeCounter.hasOwnProperty(sameTypeId)) {
                this._sameTypeCounter[sameTypeId]++;
                logRecord.occurence = this._sameTypeCounter[sameTypeId];
            } else {
                this._sameTypeCounter[sameTypeId] = 1;
                logRecord.occurence = 1;
            }
            logRecord.breakpoint = this._checkBreakPoint(sameTypeId, logRecord.occurence);

            this._records.push(logRecord);

            if (logRecord.breakpoint) {
                /* tslint:disable */
                debugger;
                /* tslint:enable */
            }
        }

        private __getFunctionInfo(): IFunctionInfo {

            try {

                throw new Error("Error");

            } catch (e) {

                if (e.stack) {

                    let functions: RegExpMatchArray = (e.stack as string).match(/(at ).*(\()/g);

                    if (functions === null) {

                        functions = (e.stack as string).match(/.*@/g);

                        if (functions && functions !== null) {

                            for (let i: number = 0; i < functions.length; i++) {
                                functions[i] = functions[i].substr(0, functions[i].length - 1);
                            }

                            return this.__getNameAndCaller(functions);

                        }
                    }

                    return this.__getNameAndCaller(functions);
                }

            }

            return { name: "Unknown", caller: "Unknown" };

        }


        private __getNameAndCaller(functions: RegExpMatchArray): IFunctionInfo {

            if (functions === undefined || functions === null) {
                return { name: "Unknown", caller: "Unknown" };
            }

            this.__skipLogger(functions);
            this.__skipAsync(functions);

            if (functions.length === 0) {
                return {
                    name: "Unknown",
                    caller: "Unknown"
                };
            }

            let fi: IFunctionInfo = <any>{};

            if (functions[0].indexOf("at ") !== -1) {
                fi.name = functions[0].substring(3, functions[0].length - 2);
            } else {
                fi.name = functions[0].replace(/\//g, "").replace(/\</g, "");
            }

            functions.shift();
            this.__skipAsync(functions);

            if (functions.length > 0) {

                if (functions[0].indexOf("at ") !== -1) {
                    fi.caller = functions[0].substring(3, functions[0].length - 2);
                } else {
                    fi.caller = functions[0].replace(/\//g, "").replace(/\</g, "");
                }

            } else {
                fi.caller = "unknown";
            }

            return fi;
        }

        private __skipLogger(functions: RegExpMatchArray): void {
            if (functions.length > 3) {
                functions.shift();
                functions.shift();
                functions.shift();
            }
        }

        private __skipAsync(functions: RegExpMatchArray): void {

            let tmp: string;
            if (functions.length > 0) {
                tmp = functions[0];
            }

            while (functions.length > 0 &&
                (functions[0].toLowerCase().indexOf("anonymous") !== -1 || this.__checkAsync(functions[0]))) {

                if (functions.length > 1 && functions[0].toLowerCase().indexOf("anonymous") !== -1 && this.__checkAsync(functions[1])) {
                    functions.shift();
                } else {
                    if (functions.length > 0 && functions[0].toLowerCase().indexOf("anonymous") !== -1) {
                        break;
                    }
                }

                while (functions.length > 0 && this.__checkAsync(functions[0])) {
                    functions.shift();
                }

            }

            if (functions.length === 0 && tmp) {
                functions.push(tmp);
            }

        }

        private __checkAsync(stackRecord: string): boolean {
            return stackRecord.indexOf("Generator.next") !== -1 ||
                stackRecord.indexOf("__awaiter") !== -1 ||
                stackRecord.indexOf("Promise") !== -1 ||
                stackRecord.indexOf("fulfilled") !== -1 ||
                stackRecord.indexOf("rejected") !== -1 ||
                stackRecord.indexOf("step") !== -1;
        }

    }

}
