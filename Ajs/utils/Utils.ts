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

namespace ajs.utils {

    "use strict";

    /**
     * Helper to determine if variable is defined
     * @param object Object to be checked
     */
    export function defined(object: any): boolean {
        return object !== undefined;
    }

    /**
     * Helper to determine if the variable is null
     * @param object Object to be checked
     */
    export function isNull(object: any): boolean {
        return object === null;
    }

    /**
     * Helper to determine if the variable defined and not null
     * @param object Object to be checked
     */
    export function definedAndNotNull(object: any): boolean {
        return object !== undefined && object !== null;
    }

    export function isInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLElement;
    }

    export function isHiddenInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "hidden";
    }

    export function isTextInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "text";
    }

    export function isPasswordInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "password";
    }

    export function isRadioInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "radio";
    }

    export function isCheckboxInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "checkbox";
    }

    export function isButtonInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "button";
    }

    export function isImageInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "image";
    }

    export function isFileInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "file";
    }

    export function isResetInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "reset";
    }

    export function isSubmitInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLInputElement && (<HTMLInputElement>element).type === "submit";
    }

    export function getDomEventTargetOwnerComponent<T extends ajs.mvvm.viewmodel.ViewComponent<any, any>>(target: EventTarget): T {
        return <T>(<ajs.doc.INode>target).ajsData.ownerComponent;
    }


    /**
     * Returns name of the constructor of the object (class name) or the name of function (class)
     * If object constructor name is Function it returns directly name of the object if possible
     * @param obj Object to be checked
     */
    export function getClassName(obj: Object): string {
        if (obj && obj.constructor && obj.constructor.toString) {
            let arr: RegExpMatchArray = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length === 2) {
                if (arr[1] === "Function") {
                    if (obj.toString) {
                        arr = obj.toString().match(/function\s*(\w+)/);
                        if (arr && arr.length === 2) {
                            return arr[1];
                        }
                    }
                } else {
                    return arr[1];
                }
            }
        }

        return undefined;
    }

    /**
     * Returns name of the function
     * @param fn Function which name has to be returned
     */
    export function getFunctionName(fn: Function): string {
        if (fn instanceof Function) {
            let name: RegExpExecArray = /^function\s+([\w\$]+)\s*\(/.exec(fn.toString());
            if (name && name.length === 2) {
                return name[1];
            }
        }
        return undefined;
    }

    /**
     * Returns the minimum usefull date (Thu Jan 01 1970 01:00:00 GMT+0100)
     */
    export function minDate(): Date {
        return new Date(0);
    }

    /**
     * Returns the maximum date (Sat Sep 13 275760 02:00:00 GMT+0200)
     */
    export function maxDate(): Date {
        return new Date(8640000000000000);
    }

    /**
     * Converts the UTC date to string with IE10 in mind
     * There is problem in IE10 the time zone is not reported correctly
     * @param date Date to be converted to the correct string date
     */
    export function ie10UTCDate(date: Date): string {
        let utc: string = date.toUTCString().replace("UTC", "GMT");
        let parts: string[] = utc.split(" ");
        if (parts[1].length === 1) {
            parts[1] = "0" + parts[1];
        }
        return parts.join(" ");
    };

    /**
     * Measures the deep size of object. Levels to be measured could be limited
     * @param object Object to be measured
     * @param levels Number of children objects to measure
     * @param level Current level used internally by the function
     */
    export function sizeOf(object: any, levels?: number, level?: number): number {

        let size: number = 0;
        levels = levels || -1;
        level = level || 0;

        if (levels !== -1 && level > levels) {
            return 0;
        }

        // determine the type of the object
        switch (typeof (object)) {

            // the object is a boolean
            case "boolean":
                size += 4;
                break;

            // the object is a number
            case "number":
                size += 8;
                break;

            // the object is a string
            case "string":
                size += 2 * (object as string).length;
                break;

            case "object":

                // type Int8Array
                if (object instanceof Int8Array) {
                    size += object.byteLength;
                } else {

                    // type Int16Array
                    if (object instanceof Int16Array) {
                        size += object.byteLength;
                    } else {

                        // type Int32Array
                        if (object instanceof Int32Array) {
                            size += object.byteLength;
                        } else {

                            // type common Array
                            if (object instanceof Array) {
                                for (let i: number = 0; i < object.length; i++) {
                                    size += sizeOf(object[i], levels, level + 1);
                                }
                            } else {

                                // type Date
                                if (object instanceof Array) {
                                    size += 8;
                                } else {

                                    // type common Object but not function
                                    if (!(object instanceof Function)) {
                                        for (let key in object) {
                                            if (object.hasOwnProperty(key)) {
                                                size += sizeOf(object[key], levels, level);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

                break;

            default:
        }

        return size;

    }

    /**
     * Escapes string to be usable in the regullar expression
     * @param str String to be escaped
     */
    export function escapeRegExp(str: string): string {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /**
     * Replaces all occurences of the searchValue by replaceValue in str
     * @param str String to be searched for occurences of searchValue and replaced with replaceValue
     * @param searchValue Value to be replaced
     * @param replaceValue Value to be used as replacement
     */
    export function replaceAll(str: string, searchValue: string, replaceValue: string): string {
        return str.replace(new RegExp(escapeRegExp(searchValue), "g"), replaceValue);
    }

    interface IFileMaps {
        [file: string]: SourceMap.SourceMapConsumer;
    }

    function mapFile(srcUrl: string, line: number, column: number): Promise<SourceMap.MappedPosition> {

        function getFile(fileUrl: string, callback: EventListener): void {
            var req: XMLHttpRequest = new XMLHttpRequest();
            req.addEventListener("load", callback);
            req.addEventListener("error", (evt: Event): void => {
                document.write("Failed to load the '" + fileUrl + "' file.");
            });
            req.open("GET", fileUrl);
            req.send();
        }

        let SourceMap = (<any>window).sourceMap;
        let maps: IFileMaps = {};

        let mp: Promise<SourceMap.MappedPosition> = new Promise<SourceMap.MappedPosition>(
            (resolve: (position: SourceMap.MappedPosition) => void, reject: (reason: ajs.Exception) => void) => {

                if (maps.hasOwnProperty(srcUrl)) {

                    resolve(maps[srcUrl].originalPositionFor({ line: line, column: column }));

                } else {

                    getFile(srcUrl, (evt: Event) => {
                        let request: XMLHttpRequest = <XMLHttpRequest>evt.target;
                        let content: string = request.response;
                        let mapFile: RegExpMatchArray = content.match(/\/\/\# sourceMappingURL\=.*/g);
                        let mapFileUrl: string;
                        if (mapFile.length > 1) {
                            mapFileUrl = mapFile[1].split("=")[1];
                        }
                        let anchor: HTMLAnchorElement = document.createElement("a");
                        anchor.href = request.responseURL;
                        mapFileUrl = anchor.pathname.substr(0, anchor.pathname.lastIndexOf("/") + 1) + mapFileUrl;

                        getFile(mapFileUrl, (evt: Event) => {
                            let request: XMLHttpRequest = <XMLHttpRequest>evt.target;
                            let content: string = request.response;
                            let smc: SourceMap.SourceMapConsumer = new SourceMap.SourceMapConsumer(content);
                            maps[srcUrl] = smc;
                            resolve(maps[srcUrl].originalPositionFor({ line: line, column: column }));
                        });
                    });
                }

            }
        );

        return mp;
    }


    /**
     * Handles an unhandled error and display appropriate message
     * <p>If the error screen HTML code is properly defined and initialized by calling the
     * #see [ajs.ui.ErrorScreen.setDOMElement](ajs.ui.ErrorScreen.setDOMElement) in the index.html
     * the user defined error screen will be shown. Otherwise, the Ajs Error screen will be shown
     * but it completely rewrites the HTML document code as it is using document.write to generate
     * the content.</p>
     * @param exceptionOrErrorEvent unhandled error event processed by i.e. window.error handler or object of class ajs.Exception
     */
    export function errorHandler(exceptionOrErrorEvent: ErrorEvent|Exception): void {

        function printException(exception: Exception, stackString: string): void {

            document.write("<h>" + exception.name + "</h4>");

            if (exception.message) {
                document.write("<h5>Message:</h5>");
                document.write("<p>" + exception.message + "</p>");
            }

            if (stackString) {
                document.write("<h5>Stack trace:</h5>");
                document.write("<pre>" + stackString + "</pre>");

            }

        }

        function getStackString(stack: IStackInfo): Promise<string> {
            if (stack === undefined || stack === null) {
                return Promise.resolve("");
            }

            let ss: string = "";
            let si: IStackInfo;

            let promises: Promise<SourceMap.MappedPosition>[] = [];

            si = stack;
            while (si !== null) {
                promises.push(mapFile(si.file, si.line, si.character));
                si = si.child;
            }

            return new Promise<string>(
                (resolve: (stackString: string) => void, reject: (reason: ajs.Exception) => void) => {

                    Promise.all(promises).then(
                        (mappedPositions: SourceMap.MappedPosition[]) => {
                            si = stack;
                            let c: number = 0;
                            while (si !== null) {
                                ss += si.caller + " at ";
                                ss += "<a href=\"showfile.html?file=" + si.file + "&line=" + si.line + "\" target=\"blank\">";
                                ss += si.file + ":" + si.line + ":" + si.character;
                                ss += "</a>";
                                if (mappedPositions[c].source !== null) {
                                    ss += " mapped to <a href=\"/showfile.html?file=" + mappedPositions[c].source +
                                        "&line=" + mappedPositions[c].line + "\" target=\"blank\">";
                                    ss += mappedPositions[c].source + ":" + mappedPositions[c].line + ":" + mappedPositions[c].column;
                                    ss += "</a>";
                                }
                                ss += "\n";

                                si = si.child;
                                c++;
                            }
                            resolve(ss);
                        }
                    );
                }
            );
        }

        let exception: Exception;

        if (exceptionOrErrorEvent instanceof Exception) {
            exception = exception;
        }

        if (exceptionOrErrorEvent instanceof Event) {
            exception = exceptionOrErrorEvent.error;
        }

        while (exception.parentException !== null) {
            exception = exception.parentException;
        }

        let name: string = exception.name;
        if (name.substr(0, 4) === "new ") {
            name = name.substr(4);
        }

        getStackString(exception.stack)

            .then((stackString: string) => {
                let epc: ajs.ui.IErrorPageContent = {
                    label: "Ajs Framework unhandled exception",
                    errorCode: "",
                    errorLabel: name,
                    errorMessage: exception.message ? exception.message : "",
                    errorTrace: stackString,
                    userAction: "",
                };

                if (!ajs.ui.ErrorScreen.show(epc)) {
                    document.write("<div style=\"font-family: Arial\">");
                    document.write("<h1>Ajs Framework</h1>");
                    document.write("<h2>Unhandled exception occured</h2>");
                    document.write("<p>");
                    document.write("<span ");
                    document.write("style =\"display: table-cell; border: solid 1px black; padding: 0.5em; background-color: FFFBE6\">");
                    document.write("<small>This message is not suppoesed to be shown on the production environments. ");
                    document.write("To hide sensitive data use the showErrors configuration option of the Ajs Framework ");
                    document.write("or configure a HTML error page to be shown in case of unhandled error!</small>");
                    document.write("</span></p>");
                    printException(exception, stackString);
                    document.write("</div>");
                }
            });

    }


}
