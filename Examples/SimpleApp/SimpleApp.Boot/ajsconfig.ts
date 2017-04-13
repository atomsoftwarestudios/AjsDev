/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace ajs.boot {

    "use strict";

    /*
    Ajs framework configuration
    See description of every module using IntelliSense
    If module or particular configuration option will be ommited the default value will be used
    */
    configureAjs = (ajsConfig: IAjsConfig): void => {

        // routes configuration

        ajsConfig.router = [
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "ClockComponent"
            }
        ];

    };

}
