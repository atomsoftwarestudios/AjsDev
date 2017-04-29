// as DB operations are asynchronous, lets write the code asynchronously

async function example(aidb: Ajs.AjsIndexedDb.IAjsIndexedDb): Promise<void> {

    // store the name of the IDB store in the constant for purpose of this example
    const storeName: string = "MyAjsDbStore";

    // Next, it is necessary to create a store to be used.
    // The store must be configured in order to be possible to use it correctly

    // setup store params
    let params: IDBObjectStoreParameters = {
        keyPath: "id",
        autoIncrement: false
    };

    // prepare store configuration callback
    let configureStore = (store: IDBObjectStore) => {
        let params: IDBIndexParameters = {
            multiEntry: false,
            unique: true
        };

        store.createIndex("username", "username", params);
    }

    try {
        // create a store and don't continue with another code until it is ready
        await aidb.createStore(storeName, params, configureStore);
    } catch (e) {
        // throw exception and include the previous one to be possible check the reason why it failed
        throw new Ajs.Exception("Unable to create a store!", e);
    }

    // Currently, the store is ready and it is possible to do something with it.
    // If exception was thrown it was catched by the promise and it will be possible to catch it outside

    // write

    try {
        // lets write some data. first, the transaction and store is opened and the callback to perform the operation is called
        await aidb.doStoreRequest("MyAjsDbStore", "readwrite", (store: IDBObjectStore): IDBRequest => {
            // once the transaction and store is ready, just do the operation - let's add a record
            return store.add({
                id: "1",
                username: "bill"
            });

        });
    } catch (e) {
        // throw exception and include the previous one to be possible check the reason why it failed
        throw new Ajs.Exception("Failed to write a data!", e);
    }

    // read

    try {
        // let's read the written record.
        let value: any = await aidb.doStoreRequest("MyAjsDbStore", "readonly", (store: IDBObjectStore): IDBRequest => {
            // once the transaction and store is ready, just do the operation - let's read a record
            return store.get(1);
        });

        console.log("Data ready: ", value);

    } catch (e) {
        // throw exception and include the previous one to be possible check the reason why it failed
        throw new Ajs.Exception("Failed to write a data!", e);
    }

    // count

    try {
        // let's count records in the DB now
        let count: any = await aidb.doStoreRequest("MyAjsDbStore", "readonly", (store: IDBObjectStore): IDBRequest => {
            // once the transaction and store is ready, just do the operation - let's read a record
            return store.count();
        });

        console.log("Number of records: ", count);

    } catch (e) {
        // throw exception and include the previous one to be possible check the reason why it failed
        throw new Ajs.Exception("Failed to write a data!", e);
    }

    // delete

    try {
        // let's delete the record now
        await aidb.doStoreRequest("MyAjsDbStore", "readwrite", (store: IDBObjectStore): IDBRequest => {
            // once the transaction and store is ready, just do the operation - let's read a record
            return store.delete(1);
        });
    } catch (e) {
        // throw exception and include the previous one to be possible check the reason why it failed
        throw new Ajs.Exception("Failed to write a data!", e);
    }


}

// async helper to run the example (Promise.then/catch is not so nice)

async function runExample(): Promise<void> {

    let aidb: Ajs.AjsIndexedDb.IAjsIndexedDb;

    try {

        // first of all it is necessary to obtain reference to the AjsIndexedDb service
        // it is recommended to write a service and let container configure it automatically
        // instead of calling the container directly. Please note the containers must be configured
        // prior it can be used. The Ajs boot loader takes care of it under normal condtitions.

        aidb = await Ajs.container.resolve(Ajs.AjsIndexedDb.IIAjsIndexedDB);

        // the service can be also used externally out of ajs. it is necessary to asynchronously configure it

        if (aidb === null) {
            aidb = new Ajs.AjsIndexedDb.AjsIndexedDb("MyDbName");
            await aidb.initialize();
        }

    } catch (e) {
        console.error("Failed to create or initialize the AjsIndexedDb", e);
    }

    // once the DB is ready it is possible do something with it

    try {
        await example(aidb);
        console.log("Example finished successfuly");
    } catch (e) {
        console.error("Example execution failed.", e);
    }

}

// just run it
runExample();