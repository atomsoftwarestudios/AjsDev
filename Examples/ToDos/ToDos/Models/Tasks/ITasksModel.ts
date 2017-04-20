/* *************************************************************************
Copyright (c)2017, Atom Software Studios
Released under the MIT license
**************************************************************************** */

namespace ToDos.Models.Tasks {

    "use strict";

    export const IITaksModel: ITasksModel = Ajs.DI.II;

    export interface ITasksModel extends Ajs.MVVM.Model.IModel {

        getTasks(filter: "All" | "Done" | "Undone"): Promise<DTO.ITask[]>;
        getTaskByKey(key: number): DTO.ITask;
        addTask(description: string): void;
        deleteTask(key: number): void;
        updateTaskDescription(key: number, description: string): void;
        taskDone(key: number, done: boolean): void;

    }

}
