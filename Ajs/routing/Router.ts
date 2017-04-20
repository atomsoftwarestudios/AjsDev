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

namespace Ajs.Routing {

    "use strict";

    export interface ICPRouter {
        viewComponentManager: typeof MVVM.ViewModel.IIViewComponentManager;
        routes?: IRoutes[];
    }

    export class Router implements IRouter {

        private __viewComponentManager: MVVM.ViewModel.IViewComponentManager;

        private __lastURL: string;
        private __lastViewComponentName: string;
        private __lastViewComponentInstance: MVVM.ViewModel.ViewComponent<any, any>;

        private __routes: IRoutes[];
        public get routes(): IRoutes[] { return this.__routes; }

        private __currentRoute: IRouteInfo;
        public get currentRoute(): IRouteInfo { return this.__currentRoute; }

        public constructor(viewComponentManager: MVVM.ViewModel.IViewComponentManager, routes?: IRoutes[]) {

            Ajs.Dbg.log(Dbg.LogType.Constructor, 0, "ajs.routing", this);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this,
                "Registering routes (" + (routes ? routes.length : 0) + ")", routes);

            this.__viewComponentManager = viewComponentManager;

            this.__routes = routes || [];

            this.__lastURL = "";
            this.__lastViewComponentName = null;
            this.__lastViewComponentInstance = null;

            this.__currentRoute = { base: "", path: "", search: "", hash: "" };

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.routing", this);
        }

        public registerRoute(paths: IRoute[], viewComponentName: string): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.routing", this);
            Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this, "Registering route", paths);

            this.__routes.push({
                paths: paths,
                viewComponentName: viewComponentName
            });

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.routing", this);

        }

        public route(url?: string): void {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.routing", this);

            url = url || window.location.href;

            if (this.__lastURL !== url) {
                Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this, "Maping route for '" + url + "'");

                this.__lastURL = url;

                let viewComponentName: string = this.__getRouteViewComponent(url);
                Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this, "Routing to " + viewComponentName);

                if (viewComponentName !== null) {

                    if (this.__lastViewComponentName !== viewComponentName) {
                        Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this, "Routing to a different than previous component");

                        this.__lastViewComponentName = viewComponentName;
                        this.__viewComponentManager.setRootViewComponentName(viewComponentName);

                    } else {
                        Ajs.Dbg.log(Dbg.LogType.Info, 0, "ajs.routing", this, "Notifying component the navigation occured");
                        this.__viewComponentManager.onNavigate();
                    }

                } else {
                    Ajs.Dbg.log(Dbg.LogType.Error, 0, "ajs.routing", this, "ViewComponent not found for the path specified");
                    throw new RouteNotFoundException();
                }

            }

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.routing", this);
        }

        private __getRouteViewComponent(url?: string): string {

            Ajs.Dbg.log(Dbg.LogType.Enter, 0, "ajs.routing", this);

            url = url || window.location.href;
            let uriParser: HTMLAnchorElement = document.createElement("a");
            uriParser.href = url;

            for (let i: number = 0; i < this.__routes.length; i++) {

                for (let j: number = 0; j < this.__routes[i].paths.length; j++) {

                    let rx: RegExp = new RegExp(this.__routes[i].paths[j].base + this.__routes[i].paths[j].params, "g");

                    if (rx.test(window.location.pathname)) {

                        let routeURI: string = uriParser.pathname + uriParser.search + uriParser.hash;

                        let base: string = routeURI.match(this.__routes[i].paths[j].base)[0];
                        let path: string = routeURI.substr(base.length);

                        if (base[0] === "/") {
                            base = base.substr(1);
                        }

                        if (path.indexOf("#") !== -1) {
                            path = path.substr(0, path.indexOf("#"));
                        }
                        if (path.indexOf("?") !== -1) {
                            path = path.substr(0, path.indexOf("?"));
                        }
                        if (path[0] === "/") {
                            path = path.substr(1);
                        }
                        if (path[path.length - 1] === "/") {
                            path = path.substr(0, path.length - 1);
                        }

                        this.__currentRoute = {
                            base: base,
                            path: path,
                            search: window.location.search.substr(1),
                            hash: window.location.hash.substr(1)
                        };

                        return this.__routes[i].viewComponentName;

                    }

                }

            }

            Ajs.Dbg.log(Dbg.LogType.Warning, 0, "ajs.routing", this, "Route not found");

            Ajs.Dbg.log(Dbg.LogType.Exit, 0, "ajs.routing", this);

            return null;
        }

    }

}
