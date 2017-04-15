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

        let appConfig: SimpleApp.IApplicationConfig = {};

        appInfo.appConstructor = SimpleApp.Application;
        appInfo.config = appConfig;

    };

}
