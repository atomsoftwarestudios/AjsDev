/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace ajs.boot {

    "use strict";

    /*
    List of resources to be loaded during the ajs framework boot process
    Typically, it is a .js file of the application itself and its libraries.
    The rest should be managed by the application itself (i.e. image resources, templates, data files)
    */
    configureResources = (resourceLists: IResourceLists): void => {

        resourceLists.direct = [
            "/js/SimpleApp.js"
        ];

    };

}
