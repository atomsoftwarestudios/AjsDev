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

namespace ajs.ui {

    "use strict";

    export class ErrorScreen {

        protected static _error: IErrorPageContent;
        protected static _errorScreen: HTMLElement;
        protected static _label: HTMLElement;
        protected static _errorLabel: HTMLElement;
        protected static _userAction: HTMLElement;
        protected static _errorCode: HTMLElement;
        protected static _message: HTMLElement;
        protected static _stackTrace: HTMLElement;

        public static setDOMElement(errorScreenElementId: string): void {
            ErrorScreen._error = null;
            ErrorScreen._errorScreen = document.getElementById(errorScreenElementId);
            ErrorScreen._label = document.getElementById(errorScreenElementId + "Label");
            ErrorScreen._errorLabel = document.getElementById(errorScreenElementId + "ErrorLabel");
            ErrorScreen._userAction = document.getElementById(errorScreenElementId + "UserAction");
            ErrorScreen._message = document.getElementById(errorScreenElementId + "ErrorMessage");
            ErrorScreen._stackTrace = document.getElementById(errorScreenElementId + "StackTrace");

            if (!ErrorScreen._checkDOM()) {
                console.error("Invalid error screen DOM specification!");
            }
        }

        public static hide(): void {

            if (!ErrorScreen._checkDOM()) {
                return;
            }

            ErrorScreen._errorScreen.style.display = "none";
            ErrorScreen._label.innerHTML = "";
            ErrorScreen._label.style.display = "none";
            ErrorScreen._errorLabel.innerHTML = "";
            ErrorScreen._errorLabel.style.display = "none";
            ErrorScreen._userAction.innerHTML = "";
            ErrorScreen._userAction.style.display = "none";
            ErrorScreen._message.innerHTML = "";
            ErrorScreen._message.style.display = "none";
            ErrorScreen._stackTrace.innerHTML = "";
            ErrorScreen._stackTrace.style.display = "none";
        }

        public static show(error: IErrorPageContent): boolean {

            if (!ErrorScreen._checkDOM()) {
                return false;
            }

            ProgressBar.hide();
            RenderTarget.hide();
            ErrorScreen.hide();

            ErrorScreen._errorScreen.style.display = "";

            for (var key in error) {

                if (error.hasOwnProperty(key)) {
                    ErrorScreen._setContent(error, key);
                }

            }

            return true;

        }

        protected static _setContent(error: IErrorPageContent, key: string): void {

            switch (key) {
                case "label":
                    ErrorScreen._label.style.display = "";
                    ErrorScreen._label.innerHTML = error[key];
                    break;

                case "errorCode":
                case "errorLabel":
                    var lbl: string;
                    var cde: string = error.errorCode ? error.errorCode : "";
                    if (cde !== "") {
                        lbl = error.errorLabel ? error.errorLabel + " (" + cde + ")" : cde;
                    } else {
                        lbl = error.errorLabel ? error.errorLabel : cde;
                    }
                    ErrorScreen._errorLabel.style.display = "";
                    ErrorScreen._errorLabel.innerHTML = lbl;
                    break;

                case "userAction":
                    ErrorScreen._userAction.style.display = "";
                    ErrorScreen._userAction.innerHTML = error[key];
                    break;

                case "errorMessage":
                    ErrorScreen._message.style.display = "";
                    ErrorScreen._message.innerHTML = error[key];
                    break;

                case "errorTrace":
                    ErrorScreen._stackTrace.style.display = "";
                    ErrorScreen._stackTrace.innerHTML = error[key];
                    break;
            }

        }

        protected static _checkDOM(): boolean {
            return !(ErrorScreen._errorScreen === undefined || ErrorScreen._errorScreen === null ||
                ErrorScreen._label === undefined || ErrorScreen._label === null ||
                ErrorScreen._errorLabel === undefined || ErrorScreen._errorLabel === null ||
                ErrorScreen._userAction === undefined || ErrorScreen._userAction === null ||
                ErrorScreen._message === undefined || ErrorScreen._message === null ||
                ErrorScreen._stackTrace === undefined || ErrorScreen._stackTrace === null);
        }

    }

}
