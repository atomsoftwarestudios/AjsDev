/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace AjsDoc {

    "use strict";

    /**
     * Sets the #ASHTML to let the AjsFw know the text shoule be rendered as HTML
     * Also processes additional AjsDoc comment tags and includes external resources
     * to the string
     * @param text The text to be converted and updated
     */
    export function setupHTMLContent(text: string): Promise < string > {

        return new Promise<string>(
            async (resolve: (text: string) => void, reject: (reason?: any) => void) => {

                try {
                    text = "#ASHTML:" + text;
                    text = await includeExamples(text);
                    text = await includeCharts(text);
                } catch (e) {
                    reject(e);
                }

                resolve(text);

            }
        );
    }

    function includeExamples(text: string): Promise < string > {

        /** todo: Change to be configurable */
        let examplesBasePath: string = "/resources/examples/";
        let examplesDefaultExtension: string = ".ts";

        let examples: RegExpMatchArray = text.match(/#example.*/g);
        let resourcePromises: Promise<Ajs.Resources.IResource>[] = [];

        if(examples && examples !== null) {

            for (let i: number = 0; i < examples.length; i++) {

                let example: string = examples[i].substring(9, examples[i].length);
                let examplePath: string = example;

                if (examplePath.indexOf("/") === -1) {
                    examplePath = examplesBasePath + example;
                }

                if (examplePath.indexOf(".") === -1) {
                    examplePath += examplesDefaultExtension;
                }

                text = text.replace(new RegExp("#example " + example + ".*", "g"), "#example " + examplePath);

                resourcePromises.push(
                    Ajs.Framework.resourceManager.getResource(
                        examplePath,
                        config.storageType,
                        Ajs.Resources.CACHE_POLICY.PERMANENT,
                        Ajs.Resources.LOADING_PREFERENCE.CACHE
                    )
                );
            }

            return new Promise<string>(
                async (resolve: (text: string) => void, reject: (reason?: any) => void) => {

                    try {
                        let resources: Ajs.Resources.IResource[] = await Promise.all(resourcePromises);

                        for (let i: number = 0; i < resources.length; i++) {
                            text = text.replace(new RegExp("#example " + resources[i].url + ".*", "g"),
                                "<pre class=\"ajsDocExample\"><code class=\"typescript\">" + resources[i].data + "</pre></code>");
                        }

                    } catch (e) {
                        reject(e);
                    }

                    resolve(text);
                }
            );

        } else {

            return new Promise<string>((resolve: (text: string) => void) => {
                resolve(text);
            });

        }
    }

    function includeCharts(text: string): Promise < string > {

        let charts: RegExpMatchArray = text.match(/#chart.*/g);
        let resourcePromises: Promise<Ajs.Resources.IResource>[] = [];

        if(charts && charts !== null) {

            for (let i: number = 0; i < charts.length; i++) {
                let chart: string = charts[i].substring(7, charts[i].length);

                resourcePromises.push(
                    Ajs.Framework.resourceManager.getResource(
                        chart,
                        config.storageType,
                        Ajs.Resources.CACHE_POLICY.PERMANENT,
                        Ajs.Resources.LOADING_PREFERENCE.CACHE
                    )
                );
            }

            return new Promise<string>(
                async (resolve: (text: string) => void, reject: (reason?: any) => void) => {

                    try {

                        let resources: Ajs.Resources.IResource[] = await Promise.all(resourcePromises);

                        for (let i: number = 0; i < resources.length; i++) {
                            text = text.replace(new RegExp("#chart " + resources[i].url + ".*", "g"),
                                "<div class=\"ajsDocChart\">" + resources[i].data + "</div>");
                        }

                    } catch (e) {
                        reject(e);
                    }

                    resolve(text);

                }
            );

        } else {

            return new Promise<string>((resolve: (text: string) => void) => {
                resolve(text);
            });

        }

    }

}