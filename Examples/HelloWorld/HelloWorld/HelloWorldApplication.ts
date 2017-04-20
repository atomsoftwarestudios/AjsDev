/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace HelloWorld {

    "use strict";

    @Ajs.application()
    export class HelloWorldApplication extends Ajs.App.Application<void> {


        protected _onConfigure(
            container: Ajs.DI.IContainer,
            resources: Ajs.App.IResourceLists,
            templates: Ajs.App.IResourceLists,
            redirections: Ajs.Navigation.IRedirection[],
            routes: Ajs.Routing.IRoutes[]): void {

            // template default.html is loaded directly from the server, no caches are used
            // it declares the HelloWorld view component for which the default route need to be set

            templates.direct = [
                "/templates/default.html"
            ];

            routes.push(
                {
                    paths: [{ base: ".*", params: "" }],
                    viewComponentName: "WelcomeComponent"
                }
            );
        }

    }

}