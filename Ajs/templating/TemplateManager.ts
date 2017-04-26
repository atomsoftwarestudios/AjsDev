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

namespace Ajs.Templating {

    "use strict";

    export class TemplateManager implements TemplateManager {

        private __resourceManager: Resources.IResourceManager;
        private __templates: ITemplatesCollection;
        private __visualComponents: IVisualComponentCollection;

        public constructor(resourceManager: Resources.IResourceManager) {
            this.__resourceManager = resourceManager;
            this.__templates = {};
            this.__visualComponents = {};
        }

        public loadTemplates(
            paths: string[],
            storageType: Resources.StorageType,
            cachePolicy: Resources.CachePolicy,
            loadingPreference?: Resources.LoadingPreference
        ): Promise<Template[]> {

            Ajs.Dbg.log(Ajs.Dbg.LogType.Enter, 0, "ajs.templating", this);

            Ajs.Dbg.log(Ajs.Dbg.LogType.Exit, 0, "ajs.templating", this);

            if (!(paths instanceof Array)) {
                paths = [];
            }

            return new Promise<Template[]>(

                async (resolve: (templates: Template[]) => void, reject: (reason?: any) => void) => {

                    let templates: Template[] = [];

                    try {
                        // load all template resources
                        let resourcePromises: Promise<Resources.IResource>[] = [];
                        for (let i: number = 0; i < paths.length; i++) {
                            resourcePromises.push(this.__resourceManager.getResource(paths[i], storageType, cachePolicy, loadingPreference));
                        }

                        // wait for all resources to be loaded
                        let resources: Resources.IResource[] = await Promise.all(resourcePromises);

                        // create templates from loaded resources
                        let styleSheetLoaders: Promise<void>[] = [];

                        for (let i: number = 0; i < resources.length; i++) {
                            let template: Template = new Template(
                                this.__resourceManager,
                                this,
                                resources[i],
                                storageType,
                                cachePolicy,
                                loadingPreference
                            );
                            templates.push(template);
                            styleSheetLoaders.push(template.loadStyleSheets());
                        }

                        // wait for all styleSheets to be loaded
                        await Promise.all(styleSheetLoaders);

                    } catch (e) {
                        reject(e);
                    }

                    // finish
                    resolve(templates);

                }
            );
        }

        public getTemplate(name: string): Template {
            if (this.__templates.hasOwnProperty(name)) {
                return this.__templates[name];
            }
            return null;
        }

        public registerVisualComponent(name: string, visualComponent: IVisualComponent): void {
            if (visualComponent && visualComponent !== null) {
                this.__visualComponents[name] = visualComponent;
            }
        }

        public getVisualComponent(name: string): IVisualComponent {
            if (this.__visualComponents.hasOwnProperty(name.toUpperCase())) {
                return this.__visualComponents[name.toUpperCase()];
            }
            return null;
        }

        public getVisualComponentTemplate(name: string): Template {
            if (this.__visualComponents.hasOwnProperty(name)) {
                let templateName: string = this.__visualComponents[name].templateName;
                let template: Template = this.getTemplate(templateName);
                return template;
            }
            return null;
        }

    }

}
