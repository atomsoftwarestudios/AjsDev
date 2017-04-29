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

namespace Ajs.Utils {

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

    export function getDomEventTargetOwnerComponent<T extends Ajs.MVVM.ViewModel.ViewComponent<any, any>>(target: EventTarget): T {
        return <T>(<Ajs.Doc.INode>target).ajsData.ownerComponent;
    }


    /**
     * Returns name of the constructor of the object (class name) or the name of function (class)
     * If object constructor name is Function it returns directly name of the object if possible
     * @param obj Object to be checked
     */
    export function getClassName(obj: any): string {

        if (obj && obj.name) {
            return obj.name;
        }

        if (obj === undefined || obj.constructor === undefined || obj.constructor.toString === undefined) {
            return undefined;
        }

        if (obj.constructor.toString().trim().substr(0, 5) === "class") {
            return getES6ClassName(obj);
        }

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

        return undefined;

    }

    export function getES6ClassName(obj: any): string {

        if (obj && obj.name) {
            return obj.name;
        }

        if (obj === undefined || obj.constructor === undefined || obj.constructor.toString === undefined) {
            return undefined;
        }

        let objstr: string = obj.constructor.toString();

        if (objstr.trim().substr(0, 5) !== "class") {
            return getES6ClassName(obj);
        }

        let indexOfBracket: number = objstr.indexOf("{");
        let indexOfExtends: number = objstr.indexOf("extends");

        if (indexOfExtends !== -1 && indexOfExtends < indexOfBracket) {
            return objstr.substring(5, indexOfExtends - 1).trim();
        }

        return objstr.substring(5, indexOfBracket - 1).trim();
    }

    /**
     * Parses the function declaration and returns argument names
     * @param f Function declaration to be parsed
     * @returns List of function arguments in the correct order
     */
    export function getFunctionParameterNames(f: Function): string[] {

        if (f.toString().substr(0, 5) === "class") {
            return getES6ClassConstructorParams(f);
        }

        let paramNames: string[] = [];

        let fn: string = f.toString();
        let p: string = fn.substr(fn.indexOf("(") + 1).trim();

        if (p[0] === ")") {
            return paramNames;
        }
        p = p.substr(0, p.indexOf(")"));
        paramNames = p.split(",");

        for (let i: number = 0; i < paramNames.length; i++) {
            paramNames[i] = paramNames[i].trim();
        }

        return paramNames;
    }

    export function getES6ClassConstructorParams(f: Function): string[] {

        if (f.toString().trim().substr(0, 5) !== "class") {
            return getFunctionParameterNames(f);
        }

        if (f.toString().indexOf("constructor") === -1) {
            return [];
        }

        let paramNames: string[] = [];

        let fn: string = f.toString();
        let p: string = fn.substr(fn.indexOf("constructor"));
        p = p.substr(p.indexOf("(") + 1).trim();

        if (p[0] === ")") {
            return paramNames;
        }

        p = p.substr(0, p.indexOf(")"));
        paramNames = p.split(",");

        for (let i: number = 0; i < paramNames.length; i++) {
            paramNames[i] = paramNames[i].trim();
        }

        return paramNames;

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

    export function nextTickAsync(howLong?: number): Promise<void> {
        return new Promise<void>(
            (resolve: () => void) => {
                setTimeout(() => {
                    resolve();
                }, howLong ? howLong : 0);
            }
        );
    }

    export function extend(d: any, b: any): void {

        for (let p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
        }
        
        function extended(): void {
            this.constructor = d;
        };

        extended.prototype = b.prototype;
        d.prototype = new extended();
    }

}
