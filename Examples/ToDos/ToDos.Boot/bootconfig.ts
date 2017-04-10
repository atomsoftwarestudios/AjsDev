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

    getResourceLists = function(): IResourceLists {

        return {
            direct: [
                "/js/ToDos.js"
            ]
        };

    };

    /*
    Ajs framework configuration
    See description of every module using IntelliSense
    If module or particular configuration option will be ommited the default value will be used
    */

    getAjsConfig = (): IAjsConfig => {

        let ajsConfig: IAjsConfig = {};

        /*
        Routes configuration
        */

        ajsConfig.router = [
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "Tasks"
            }
        ];

        // ajs framework moduels configuration
        return ajsConfig;

    };

    /*
    Application information and configuration
    */

    getApplicationInfo = (): ajs.app.IApplicationInfo => {

        let configuration: ToDos.IApplicationConfig = {};

        return {
            appConstructor: ToDos.Application,
            config: configuration
        };

    };

}
