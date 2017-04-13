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

        let appConfig: SimpleApp.IApplicationConfig = {};

        appInfo.appConstructor = SimpleApp.Application;
        appInfo.config = appConfig;

    };

}
