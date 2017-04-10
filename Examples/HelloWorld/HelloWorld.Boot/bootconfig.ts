/**
 * Copyright (c)Year, Company
 */

namespace ajs.boot {

    "use strict";

    /*
    List of resources to be loaded during the ajs framework boot process
    Typically, it is a .js file of the application itself and its libraries.
    The rest should be managed by the application itself (i.e. image resources, templates, data files)
    */

    getResourceLists = function (): IResourceLists {

        let resourceLists: IResourceLists = {};
        return resourceLists;

    };

    /*
    Ajs framework configuration
    See description of every module using IntelliSense
    If module or particular configuration option will be ommited the default value will be used
    */
    getAjsConfig = (): IAjsConfig => {

        let ajsConfig: IAjsConfig = {};

        // routes configuration

        ajsConfig.router = [
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "Welcome"
            }
        ];

        // ajs framework moduels configuration
        return ajsConfig;

    };

    /*
    Application information and configuration
    */

    getApplicationInfo = (): ajs.app.IApplicationInfo => {

        let configuration: HelloWorld.IApplicationConfig = {};

        return {
            appConstructor: HelloWorld.Application,
            config: configuration
        };

    };

}
