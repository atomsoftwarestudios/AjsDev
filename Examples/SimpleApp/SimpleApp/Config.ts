/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace SimpleApp {

    "use strict";

    Ajs.configureBoot = (config: Ajs.Boot.IBootConfig): void => {
        config.offlineSupport = false;
    };

    Ajs.configureFramework = (config: Ajs.IAjsConfig): void => {
        config.renderTarget = document.getElementById("renderTarget");
    };

}