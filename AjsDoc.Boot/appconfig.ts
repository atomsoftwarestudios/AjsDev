/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace Ajs.Boot {

    "use strict";

    /*
    Application information and configuration
    */
    configureApplication = (appInfo: Ajs.App.IApplicationInfo) => {

        // const APP_RESOURCES_LOADING_PREFERENCE: ajs.resources.LOADING_PREFERENCE = ajs.resources.LOADING_PREFERENCE.SERVER;
        const APP_RESOURCES_LOADING_PREFERENCE: Ajs.Resources.LOADING_PREFERENCE = Ajs.Resources.LOADING_PREFERENCE.CACHE;

        let appConfig: AjsDoc.IAjsDocBrowserConfig = {
            storageType: Ajs.Resources.STORAGE_TYPE.LOCAL,
            storagePolicy: Ajs.Resources.CACHE_POLICY.LASTRECENTLYUSED,
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

        appInfo.appConstructor = AjsDoc.AjsDocBrowser;
        appInfo.config = appConfig;

    };

}
