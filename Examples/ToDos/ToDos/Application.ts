namespace ToDos {

    "use strict";

    export class TemplatesLoadingFailed extends ajs.Exception {
    }

    export class Application extends ajs.app.Application {

        public initialize(): void {

            // implement initialization and when its done call this._initDone() in order to be possible to continue
            // with application starting

            let templates: Promise<ajs.templating.Template[]> = ajs.Framework.templateManager.loadTemplates(
                ["/templates/default.html"],
                ajs.resources.STORAGE_TYPE.NONE,
                ajs.resources.CACHE_POLICY.NONE,
                ajs.resources.LOADING_PREFERENCE.SERVER);

            templates
                .then((templates: ajs.templating.Template[]) => {
                    this._initDone();
                })
                .catch((reason: ajs.Exception) => {
                    throw new TemplatesLoadingFailed("Failed to load templates", reason);
                });

        }

        protected _finalize(): void {

            // implement finalization

        }

    }

}