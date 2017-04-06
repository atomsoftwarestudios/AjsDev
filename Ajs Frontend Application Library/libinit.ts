/*! ************************************************************************
Copyright (c)Year, Company
**************************************************************************** */

/*
This file can be used to initialize 3rd party libraries in the
correct order. Additionally, some libraries may require to be
parsed and executed prior other libraries. This can be ensured
by prefixing library names with the number in which ensures the
TypeScript compiler will put the libraries in correct order.
TypeScript compiler orders included javascipt files in the
alphabetical order.
*/

namespace $safeprojectname$.libinit {

    "use strict";

    export let libinitdone: boolean;

    function initLib(): void {
        if (!libinitdone) {
            initializeLibraries();
            libinitdone = true;
        }
    }

    function initializeLibraries(): void {

        // Libraries initialization code should be put here or separate
        // functions which will be called from this place

    }

    window.addEventListener("load", initLib);
}

