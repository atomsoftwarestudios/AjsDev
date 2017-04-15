/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace HelloWorld {

    "use strict";

    export class Application extends Ajs.App.Application {

        public initialize(): void {

            // implement initialization and when its done call this._initDone() in order to be possible to continue
            // with application starting

            let templates: Promise<Ajs.Templating.Template[]> = Ajs.Framework.templateManager.loadTemplates(
                ["/templates/default.html"],
                Ajs.Resources.STORAGE_TYPE.NONE,
                Ajs.Resources.CACHE_POLICY.NONE,
                Ajs.Resources.LOADING_PREFERENCE.SERVER);

            templates
                .then((templates: Ajs.Templating.Template[]) => {
                    this._initDone();
                })
                .catch((reason: Ajs.Exception) => {
                    throw new TemplatesLoadingFailedException("Failed to load templates", reason);
                });

        }

        protected _finalize(): void {

            // implement finalization

        }

    }

}