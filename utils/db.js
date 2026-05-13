// utils/db.js

// Keep these consistent with your other files
const DB_NAME = "IndexedDB_BeeSwarmSimulator";
const STORE_NAME = "checkpoints";

// edits coming
//IndexedDB code from Willard
export async function createDatabase() {
  return await new Promise(async (resolve, reject) => {
    let request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = function (event) {
      let DB = event.target.result;
      // Use STORE_NAME variable so it's easy to change later
      let store = DB.createObjectStore(STORE_NAME, { keyPath: "id" });
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

/**
 * Matches the call in index.js: loadCheckpoint(id)
 */
export async function loadCheckpoint(id) {
  // 1. The function is defined as 'async' so it can use 'await'.
  //    It takes a single optional argument 'id'.

  return await new Promise(async (resolve, reject) => {
    let db = await createDatabase();

    let trans = db.transaction(STORE_NAME, "readwrite");

    let store = trans.objectStore(STORE_NAME);

    let req = id ? store.get(id) : store.getAll();

    req.onsuccess = function (e) {
      db.close(); // 1. Clean up first
      resolve(req.result); // 2. Then let the rest of the game continue
    };

    req.onerror = function (e) {
      db.close(); // 1. Clean up first
      resolve(null); // 2. Then let the rest of the game continue
    };
  });
}

/**
 * Matches the call in index.js: saveCheckpoint(snapshot)
 */
// export async function saveCheckpoint(id, data) {
export async function saveCheckpoint(snapshot) {
  return new Promise(async (resolve, reject) => {
    let db = await createDatabase();
    let trans = db.transaction(STORE_NAME, "readwrite");
    let store = trans.objectStore(STORE_NAME);

    // We pass the whole snapshot because it already has { id: "...", data: {...} }
    // let req = store.put({ id: id, data: data });
    let req = store.put(snapshot);

    req.onsuccess = function () {
      db.close();
      resolve(req.result);
    };
    req.onerror = function (e) {
      db.close();
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
