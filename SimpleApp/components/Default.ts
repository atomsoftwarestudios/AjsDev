/* *************************************************************************
Copyright (c)Year, Company
**************************************************************************** */

namespace simpleapp.components {

    "use strict";

    export class Default extends ajs.mvvm.viewmodel.ViewComponent {

        protected _userModel: simpleapp.models.Default;

        protected _defaultState(): ajs.mvvm.viewmodel.IViewStateSet {
            return {};
        }

        protected _initialize(): void {

            this._userModel = <simpleapp.models.Default>ajs.Framework.modelManager.getModelInstance(simpleapp.models.Default);

            this._userModel.getData()
                .then((data: simpleapp.models.IDefaultModelData[]) => {
                    this.setState({ knownPeople: data });
                })
                .catch((reason: ajs.Exception) => {
                    throw new ajs.Exception("Unable to get the model data", reason);
                });

        }

        protected _finalize(): void {

            ajs.Framework.modelManager.freeModelInstance(simpleapp.models.Default);

        }

    }

    ajs.Framework.viewComponentManager.registerComponents(Default);

}