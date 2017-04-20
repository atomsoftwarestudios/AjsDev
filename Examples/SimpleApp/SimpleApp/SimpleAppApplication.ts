/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace SimpleApp {

    "use strict";

    @Ajs.application()
    export class SimpleAppApplication extends Ajs.App.Application<void> {

        protected _onConfigure(
            container: Ajs.DI.IContainer,
            resources: Ajs.App.IResourceLists,
            templates: Ajs.App.IResourceLists,
            redirections: Ajs.Navigation.IRedirection[],
            routes: Ajs.Routing.IRoutes[]): void {

            templates.direct = [
                "/templates/default.html"
            ];

            routes.push(
                {
                    paths: [{ base: ".*", params: "" }],
                    viewComponentName: "ClockComponent"
                }
            );
        }

    }

}