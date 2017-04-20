@Ajs.application()
export class AjsApplication extends Ajs.App.Application<void> {

    // _onConfigure is called automatically when the application is instanced
    protected _onConfigure(
        // DI container is provided to the method to make it possible to configure dependencies
        container: Ajs.DI.IContainer,
        // resources array to be filled in with resources to be loaded before the application will start
        resources: Ajs.App.IResourceLists,
        // templates array to be filled in with templates to be loaded before the application will start
        templates: Ajs.App.IResourceLists,
        // redirections to be filled in with redirections
        redirections: Ajs.Navigation.IRedirection[],
        // routes array to be filled in with application routes
        routes: Ajs.Routing.IRoutes[]): void {

        // Configuration of the DI container
        // In this case the model implementation Model.Model with constructor parameters Models.ICPModel
        // is mapped to interface Models.IModel identified by the Models.IIModel interface runtime identifier
        container
            .addScoped<Models.IModel, Models.ICPModel>(
            Models.IIModel, Models.Model, {
                container: container
            });

        // As view components are not services it is necessary to configure dependecies separately
        // In this case, the view component Components.Component depends on model implementing the IModel
        // interface (identified by the Models.IIModel runtime interface identifier) and the component
        // configuration parameters are defined by the IComponentConfigParams interface
        viewComponentManager.
            addComponentDependencies<Components.IComponentConfigParams>(
            Components.Component, {
                tasksModel: Models.IIModel
            });

        // All resources requested are first looked for in the cache (app storage, session storage
        // memory storage or indexed db storage) and if found they are returned immediately then
        // request to server is made to update the resource cache if the resource has been changed
        this._resourcesLoadingPreference = Ajs.Resources.LOADING_PREFERENCE.CACHE;

        // Resources stored in local store (if not they are loaded from server and stored there)
        // to be loaded before application will start
        templates.localPermanent = [
            "/templates/default.html"
        ];

        // configuration of routes
        // in case of Ajs the route is mapping of URL to the View Component Name
        routes.push(
            {
                paths: [{ base: ".*", params: "" }],
                viewComponentName: "DefaultComponent"
            }
        );
    }

}
