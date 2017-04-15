namespace ToDos {

    "use strict";

    export class TemplatesLoadingFailed extends Ajs.Exception {
    }

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
                    throw new TemplatesLoadingFailed("Failed to load templates", reason);
                });

        }

        protected _finalize(): void {

            // implement finalization

        }

    }

}