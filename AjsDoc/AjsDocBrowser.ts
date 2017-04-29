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

    /**
     * The AjsDocBrowser application
     */
    @Ajs.application()
    export class AjsDocBrowser extends Ajs.App.Application<IAjsDocBrowserConfig> {

        protected _onConfigure(
            container: Ajs.DI.IContainer,
            resources: Ajs.App.IResourceLists,
            templates: Ajs.App.IResourceLists,
            redirections: Ajs.Navigation.IRedirection[],
            routes: Ajs.Routing.IRoutes[],
            viewComponentManager: Ajs.MVVM.ViewModel.IViewComponentManager): void {

            // app configuration

            this._resourcesLoadingPreference = this._config.dataStorageOptions.loadingPreference;

            // use the TypeScript helper to extend a class
            Ajs.Utils.extend(resources, this._config.resources);
            Ajs.Utils.extend(templates, this._config.templates);

            // configure application services

            container

                .addScoped<Utils.IHTMLHelpers>(
                    Utils.IIHTMLHelpers,
                    Utils.HTMLHelpers,
                    this._config.contentFolders.examples,
                    this._config.contentFolders.charts,
                    Ajs.Resources.IIResourceManager,
                    this._config.dataStorageOptions.storageType,
                    this._config.dataStorageOptions.cachePolicy,
                    this._config.dataStorageOptions.loadingPreference
                )

                .addScoped<Models.ProgramModel.IProgramModel>(
                    Models.ProgramModel.IIProgramModel,
                    Models.ProgramModel.ProgramModel,
                    container,
                    Ajs.Resources.IIResourceManager,
                    Utils.IIHTMLHelpers,
                    {
                        storageType: this._config.dataStorageOptions.storageType,
                        cachePolicy: this._config.dataStorageOptions.cachePolicy,
                        loadingPreference: this._config.dataStorageOptions.loadingPreference,
                        initializationTimeout: this._config.modelInitializationTimeout,
                        programUrl: this._config.dataSources.program
                    }
                )

                .addScoped<Models.ContentModel.IContentModel>(
                    Models.ContentModel.IIContentModel,
                    Models.ContentModel.ContentModel,
                    container,
                    Ajs.Resources.IIResourceManager,
                    Utils.IIHTMLHelpers,
                    {
                        storageType: this._config.dataStorageOptions.storageType,
                        cachePolicy: this._config.dataStorageOptions.cachePolicy,
                        loadingPreference: this._config.dataStorageOptions.loadingPreference,
                        initializationTimeout: this._config.modelInitializationTimeout,
                        tocUrl: this._config.dataSources.toc
                    }
                );

            // configure VCM (View Component dependencies)

            viewComponentManager

                .addComponentDependencies<Components.ICPAjsDocComponent>(
                    Components.AjsDocComponent,
                    Models.ProgramModel.IIProgramModel,
                    Models.ContentModel.IIContentModel
                )

                .addComponentDependencies<Components.ICPAjsDocMenuComponent>(
                    Components.AjsDocMenuComponent,
                    Models.ProgramModel.IIProgramModel,
                    Models.ContentModel.IIContentModel
                )

                .addComponentDependencies<Components.ICPAjsDocContextSwitcherComponent>(
                    Components.AjsDocContextSwitcherComponent,
                    Ajs.State.IIStateManager
                )

                .addComponentDependencies<Components.ICPAjsDocHeaderComponent>(
                    Components.AjsDocHeaderComponent,
                    this._config.headerLabel,
                    this._config.headerDescription
                );

        }

    }

}