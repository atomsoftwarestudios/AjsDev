/* *************************************************************************
The MIT License (MIT)
Copyright (c)2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

namespace AjsDoc {

    "use strict";

    export interface IAjsDocBrowserConfig extends Ajs.App.IApplicationConfig {

        dataStorageOptions: {
            storageType: Ajs.Resources.StorageType;
            cachePolicy: Ajs.Resources.CachePolicy;
            loadingPreference: Ajs.Resources.LoadingPreference;
        };

        dataSources: {
            toc: string;
            program: string;
        };

        contentFolders: {
            content: string,
            examples: string,
            charts: string
        };

        modelInitializationTimeout: number;

        headerLabel: string;
        headerDescription: string;

        resources: Ajs.App.IResourceLists;
        templates: Ajs.App.IResourceLists;

    }

}
