/*! ************************************************************************
Copyright (c)Year, Company
**************************************************************************** */
/**
 * This file can be used to initialize 3rd party libraries in the
 * correct order. Additionally, some libraries may require to be
 * parsed and executed prior other libraries. This can be ensured
 * by prefixing library names with the number in which ensures the
 * TypeScript compiler will put the libraries in correct order.
 * TypeScript compiler orders included javascipt files in the
 * alphabetical order.
 */
var $safeprojectname$;
(function ($safeprojectname$) {
    var libinit;
    (function (libinit) {
        "use strict";
        function initLib() {
            if (!libinit.libinitdone) {
                initializeLibraries();
                libinit.libinitdone = true;
            }
        }
        function initializeLibraries() {
        }
        window.addEventListener("load", initLib);
    })(libinit = $safeprojectname$.libinit || ($safeprojectname$.libinit = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
//# sourceMappingURL=libinit.js.map