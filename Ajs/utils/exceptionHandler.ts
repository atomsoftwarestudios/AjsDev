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
     * Handles an unhandled error and display appropriate message
     * <p>If the error screen HTML code is properly defined and initialized by calling the
     * #see [ajs.ui.ErrorScreen.setDOMElement](ajs.ui.ErrorScreen.setDOMElement) in the index.html
     * the user defined error screen will be shown. Otherwise, the Ajs Error screen will be shown
     * but it completely rewrites the HTML document code as it is using document.write to generate
     * the content.</p>
     * @param exceptionOrErrorEvent unhandled error event processed by i.e. window.error handler or object of class ajs.Exception
     */
    export function errorHandler(exceptionOrErrorEvent: ErrorEvent|Exception): void {

        function printException(exception: Exception, stackString: string): string {

            let exc: string = "";

            exc += "<h>" + exception.name + "</h4>";

            if (exception.message) {
                exc += "<h5>Message:</h5>";
                exc += "<p>" + exception.message + "</p>";
            }

            if (stackString) {
                exc += "<h5>Stack trace:</h5>";
                exc += "<pre>" + stackString + "</pre>";

            }

            return exc;
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
                (resolve: (stackString: string) => void, reject: (reason: Ajs.Exception) => void) => {

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
            exception = new Exception(exceptionOrErrorEvent.error);
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
                let epc: Ajs.UI.IErrorPageContent = {
                    label: "Ajs Framework unhandled exception",
                    errorCode: "",
                    errorLabel: name,
                    errorMessage: exception.message ? exception.message : "",
                    errorTrace: stackString,
                    userAction: "",
                };

                if (!Ajs.UI.ErrorScreen.show(epc)) {
                    let err: string = "";
                    err += "<div style=\"font-family: Arial\">";
                    err += "<h1>Ajs Framework</h1>";
                    err += "<h2>Unhandled exception occured</h2>";
                    err += "<p>";
                    err += "<span ";
                    err += "style =\"display: table-cell; border: solid 1px black; padding: 0.5em; background-color: #FFFBE6\">";
                    err += "<small>This message is not suppoesed to be shown on the production environments. ";
                    err += "To hide sensitive data use the showErrors configuration option of the Ajs Framework ";
                    err += "or configure a HTML error page to be shown in case of unhandled error!</small>";
                    err += "</span></p>";
                    err += printException(exception, stackString);
                    err += "</div>";
                    let errdiv: HTMLDivElement = document.createElement("div");
                    errdiv.style.position = "absolute";
                    errdiv.style.left = "0px";
                    errdiv.style.top = "0px";
                    errdiv.style.bottom = "0px";
                    errdiv.style.width = "100%";
                    errdiv.style.boxSizing = "border-box";
                    errdiv.style.zIndex = "9000";
                    errdiv.style.backgroundColor = "white";
                    errdiv.style.opacity = "0.9";
                    errdiv.style.padding = "0.5em";
                    errdiv.style.overflow = "auto";
                    errdiv.innerHTML = err;
                    document.body.appendChild(errdiv);
                }
            });

    }


}
