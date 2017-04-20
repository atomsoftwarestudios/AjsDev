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

    let loadedFiles: any = {};
    let loadingFiles: any = {};

    interface IFileMaps {
        [file: string]: SourceMap.SourceMapConsumer;
    }

    export function mapFile(srcUrl: string, line: number, column: number): Promise<any> {

        function getFile(fileUrl: string, callback: (content: string) => void): void {

            if (fileUrl in loadedFiles) {
                callback(loadedFiles[fileUrl]);
            }

            if (!(fileUrl in loadingFiles)) {
                if (!loadingFiles.hasOwnProperty(fileUrl)) {
                    loadingFiles[fileUrl] = { callbacks: [] };
                }
                loadingFiles[fileUrl].callbacks.push(callback);
            } else {
                loadingFiles[fileUrl].callbacks.push(callback);
                return;
            }

            var req: XMLHttpRequest = new XMLHttpRequest();
            req.addEventListener("load", (evt: Event) => {
                let request: XMLHttpRequest = <XMLHttpRequest>evt.target;
                let content: string = request.response;
                loadedFiles[fileUrl] = content;
                if (loadingFiles.hasOwnProperty(fileUrl)) {
                    for (let u of loadingFiles[fileUrl].callbacks) {
                        u(content);
                    }
                    delete loadingFiles[fileUrl];
                }
            });
            req.addEventListener("error", (evt: Event): void => {
                document.write("Failed to load the '" + fileUrl + "' file.");
            });
            req.open("GET", fileUrl);
            req.send();
        }

        let SourceMap: any = (<any>window).sourceMap;
        let maps: IFileMaps = {};

        let mp: Promise<SourceMap.MappedPosition> = new Promise<SourceMap.MappedPosition>(
            (resolve: (position: SourceMap.MappedPosition) => void, reject: (reason: Ajs.Exception) => void) => {

                if (maps.hasOwnProperty(srcUrl)) {

                    resolve(maps[srcUrl].originalPositionFor({ line: line, column: column }));

                } else {

                    getFile(srcUrl, (content: string) => {
                        let mapFile: RegExpMatchArray = content.match(/\/\/\# sourceMappingURL\=.*/g);
                        let mapFileUrl: string;
                        if (mapFile.length > 1) {
                            mapFileUrl = mapFile[1].split("=")[1];
                        }
                        let anchor: HTMLAnchorElement = document.createElement("a");
                        anchor.href = srcUrl;
                        mapFileUrl = anchor.pathname.substr(0, anchor.pathname.lastIndexOf("/") + 1) + mapFileUrl;

                        getFile(mapFileUrl, (content: string) => {
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

}
