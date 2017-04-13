/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace ajs.boot {

    "use strict";

    /*
    Application information and configuration
    */
    configureApplication = (appInfo: ajs.app.IApplicationInfo) => {

        // const APP_RESOURCES_LOADING_PREFERENCE: ajs.resources.LOADING_PREFERENCE = ajs.resources.LOADING_PREFERENCE.SERVER;
        const APP_RESOURCES_LOADING_PREFERENCE: ajs.resources.LOADING_PREFERENCE = ajs.resources.LOADING_PREFERENCE.CACHE;

        let appConfig: ajsdoc.IAjsDocBrowserConfig = {
            storageType: ajs.resources.STORAGE_TYPE.LOCAL,
            storagePolicy: ajs.resources.CACHE_POLICY.LASTRECENTLYUSED,
            templateList: "/resources/templates.json",
            templateLoadingPreference: APP_RESOURCES_LOADING_PREFERENCE,
            resourceList: "/resources/appresources.json",
            resourceLoadingPreference: APP_RESOURCES_LOADING_PREFERENCE,
            dataSources: {
                toc: "/resources/toc.json",
                program: "/resources/program.json"
            },
            dataLoadingPreference: APP_RESOURCES_LOADING_PREFERENCE,
            headerLabel: "Ajs Framework",
            headerDescription: "Developer's guide"
        };

        appInfo.appConstructor = ajsdoc.AjsDocBrowser;
        appInfo.config = appConfig;

    };

}
