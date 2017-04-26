/* *************************************************************************
Released under MIT License
Copyright (c)2017, Atom Software Studios. All rights reserved.
**************************************************************************** */

namespace ToDos {

    "use strict";

    @Ajs.application()
    export class ToDosApplication extends Ajs.App.Application<void> {

        protected _onConfigure(
            container: Ajs.DI.IContainer,
            resources: Ajs.App.IResourceLists,
            templates: Ajs.App.IResourceLists,
            redirections: Ajs.Navigation.IRedirection[],
            routes: Ajs.Routing.IRoutes[],
            viewComponentManager: Ajs.MVVM.ViewModel.IViewComponentManager): void {

            container
                .addScoped<Models.Tasks.ITasksModel, Models.Tasks.ICPTasksModel>(
                Models.Tasks.IITaksModel, Models.Tasks.TasksModel, {
                    container: container
                });

            viewComponentManager.
                addComponentDependencies<Components.ITaskComponentConfigParams>(
                Components.TasksComponent, {
                    tasksModel: Models.Tasks.IITaksModel
                });

            this._resourcesLoadingPreference = Ajs.Resources.LoadingPreference.Server;
           
            templates.direct = [
                "/templates/default.html"
            ];

            routes.push(
                {
                    paths: [{ base: ".*", params: "" }],
                    viewComponentName: "TasksComponent"
                }
            );

        }

    }

}
