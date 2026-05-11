// utils/db.js

// edits coming
//IndexedDB code from Willard
export async function createDatabase() {
  return await new Promise(async (resolve, reject) => {
    let request = window.indexedDB.open("IndexedDB_BeeSwarmSimulator", 1);

    request.onupgradeneeded = function (event) {
      let DB = event.target.result;

      let store = DB.createObjectStore("worlds", { keyPath: "id" });
      store.createIndex("id", "id", { unique: true });
    };

    request.onsuccess = function (e) {
      resolve(request.result);
    };

    request.onerror = function (e) {
      reject(e);
    };
  });
}

export async function loadFromDB(id) {
  // 1. The function is defined as 'async' so it can use 'await'.
  //    It takes a single optional argument 'id'.

  return await new Promise(async (resolve, reject) => {
    // 2. It returns a new Promise. This allows the calling code to use
    //    .then() and .catch() or 'await' the result.
    //    The inner function is also 'async' because it uses 'await'.

    let db = await createDatabase();
    // 3. It calls an assumed asynchronous function 'createDatabase()' which
    //    is responsible for opening the IndexedDB connection. The 'await'
    //    pauses execution until the database connection is established.

    let trans = db.transaction("worlds", "readwrite");
    // 4. It starts a new transaction on the database.
    //    - The transaction is scoped to the "worlds" object store.
    //    - The mode is "readwrite". Although the code only reads, it's possible
    //      that "readwrite" was chosen for a reason (e.g., to be flexible
    //      or to have a single transaction for a sequence of operations).
    //      A "readonly" transaction would have been sufficient for just reading.

    let store = trans.objectStore("worlds");
    // 5. It gets a reference to the "worlds" object store, which is where the
    //    actual data is stored.

    let req = id ? store.get(id) : store.getAll();
    // 6. This is a ternary operator that determines which IndexedDB method to call.
    //    - If an 'id' is passed to the function, it calls `store.get(id)`. This
    //      fetches a single record with a primary key matching the provided 'id'.
    //    - If 'id' is undefined or `null` (falsy), it calls `store.getAll()`.
    //      This fetches all records from the object store.

    req.onsuccess = function (e) {
      // 7. This is the event handler for a successful request.
      //    When the request to get data from the store completes successfully,
      //    this function is executed.
      resolve(req.result);
      // 8. The Promise is resolved with the result of the request.
      //    - If `store.get(id)` was called, `req.result` will be the single record object.
      //    - If `store.getAll()` was called, `req.result` will be an array of all record objects.
      db.close();
      // 9. The database connection is explicitly closed.
    };

    req.onerror = function (e) {
      // 10. This is the event handler for a failed request (e.g., a connection error).
      //     When the request fails, this function is executed.
      resolve(null);
      // 11. The Promise is resolved with `null`. This is a somewhat unusual choice.
      //     Typically, an error handler would 'reject' the Promise with the error
      //     object (`reject(e.target.error)`), allowing the caller to use a `.catch()` block.
      //     Resolving with `null` means the caller needs to explicitly check for a `null`
      //     return value to know if an error occurred.
      db.close();
      // 12. The database connection is explicitly closed.
    };
  });
}

// CHQ: found where the code to save progress is
export async function saveToDB(id, data) {
  return new Promise(async (resolve, reject) => {
    let db = await createDatabase();
    let trans = db.transaction("worlds", "readwrite");
    let store = trans.objectStore("worlds");
    let req = store.put({ id: id, data: data });
    req.onsuccess = function () {
      resolve(req.result);
    };
    req.onerror = function (e) {
      reject(e);
    };
  });
}

export async function deleteFromDB(id) {
  return new Promise(async (resolve, reject) => {
    let db = await createDatabase();
    let trans = db.transaction("worlds", "readwrite");
    let store = trans.objectStore("worlds");
    let req = store.delete(id);
    req.onsuccess = function () {
      resolve(req.result);
    };
    req.onerror = function (e) {
      reject(e);
    };
  });
}
