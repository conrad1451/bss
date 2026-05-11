import { beeInfo } from "./data/bees.js";
import { effects } from "./data/effects.js";
import { upgrades } from "./data/upgrades.js";
// import { blenderRecipes, windShrineDonations } from "./recipes";
import { createInitialState } from "./state/gameState.js";
import { Renderer } from "./engine/renderer.js";
import { updateEngine } from "./engine/updateEngine.js";

import { createField } from "./engine/world.js";
import { fieldDefinitions } from "./data/fieldData.js";

import { initInputHandlers } from "./utils/input.js";
import { TextRenderer } from "./engine/textRenderer.js";
import { loadTextures, generateDefaultNoise } from "./engine/assetLoader.js";

function initGameWorld(gameState) {
  fieldDefinitions.forEach((f) => {
    createField(
      f.name,
      f.x,
      f.y,
      f.z,
      f.w,
      f.l,
      f.colorLogic,
      f.levelLogic,
      f.composition,
      f.nectar,
      gameState,
      internalAddFlowerFunction, // Pass the function that builds flower meshes
    );
  });
}

function main() {
  // edits coming
  //IndexedDB code from Willard
  async function createDatabase() {
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

  async function loadFromDB(id) {
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
  async function saveToDB(id, data) {
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

  async function deleteFromDB(id) {
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

  const fetchGame = async (apiURL) => {
    // setLoading(true); // Set loading to true on every fetch attempt
    // setError(null); // Clear any previous errors

    // if (!apiURL) {
    //   setError("API URL is not defined in environment variables.");
    //   setLoading(false);
    //   console.error("VITE_API_URL is not set.");
    //   return;
    // }

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch students:", e);
    } finally {
      setLoading(false);
    }
  };

  window.createDatabase = createDatabase;
  window.loadFromDB = loadFromDB;
  window.saveToDB = saveToDB;
  window.deleteFromDB = deleteFromDB;

  function copyThumbnail(t) {
    let canv = document.getElementById(t + "_thumbnailCanvCopy");

    let ctx = canv.getContext("2d");

    canv.width = window.innerWidth;
    canv.height = window.innerHeight;

    ctx.drawImage(document.getElementById("thumbnailCanv"), 0, 0);
  }

  document.getElementById("mainNew").onclick = function () {
    for (let i in addedDivsToSplice) {
      document.getElementById("savedGames").removeChild(addedDivsToSplice[i]);
    }

    let w = window.open();
    w.document.open();
    w.document.write(
      "<!doctype html><html>" + document.querySelector("html").innerHTML,
    );
    w.document.close();
  };

  let addedDivsToSplice = [],
    ableToImport,
    printedCode;

  document.getElementById("mainPlay").onclick = function () {
    copyThumbnail("select");

    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "block";

    document.getElementById("createNewGame").onclick = function () {
      document.getElementById("mainSelectMenu").style.display = "none";
      document.getElementById("mainMenu").style.display = "none";

      BeeSwarmSimulator({ id: Date.now(), name: "Untitled Save" });
    };

    document.getElementById("createImportedGame").onclick = function () {
      alert(
        "\nTo import a game, you'll need a string containing the saved data of the game. Copy the string, and then use CTRL+V in this program to start the game.\n\nAn invalid code will create an error message. There is a chance errors in the save code are not detected and pass through. This may corrupt the game, resulting in crashes.",
      );
    };

    document.onpaste = (e) => {
      if (!ableToImport) return;

      ableToImport = false;

      let text = e.clipboardData.getData("text/plain");

      document.getElementById("mainSelectMenu").style.display = "none";
      document.getElementById("mainMenu").style.display = "none";

      BeeSwarmSimulator({
        id: Date.now(),
        saveCode: text,
        name: "Untitled Import",
      });
    };

    for (let i in addedDivsToSplice) {
      document.getElementById("savedGames").removeChild(addedDivsToSplice[i]);
    }

    let div = document.createElement("div");

    ableToImport = true;
    addedDivsToSplice = [div];

    div.innerHTML =
      "<p style='text-align:center;color:rgb(60,60,60)'>You have no saves. Start a new game or import one.<br><br>Data is saved to this computer and only this computer's browser. To transfer data across multiple devices, use the save code feature.<br><br>Data may not be saved after abruptly closing the game. Data will not be saved while in incognito/private browser modes.</p>";

    document.getElementById("savedGames").appendChild(div);

    loadFromDB()
      .then((res) => {
        window.initSave = function (index) {
          document.getElementById("mainSelectMenu").style.display = "none";
          document.getElementById("mainInfoMenu").style.display = "none";
          document.getElementById("mainMenu").style.display = "none";
          BeeSwarmSimulator({
            id: res[index].id,
            name: res[index].data.name,
            saveCode: res[index].data.saveCode,
          });
        };

        window.deleteSave = function (index) {
          if (
            confirm(
              '\nDo you really want to delete save "' +
                res[index].data.name +
                '"?',
            )
          ) {
            deleteSaveConfirmation = false;
            deleteFromDB(res[index].id);
            document.getElementById("mainPlay").onclick();
          }
        };

        window.renameSave = function (index) {
          deleteFromDB(res[index].id);

          saveToDB(res[index].id, {
            lastSaved: Date.now(),
            saveCode: res[index].data.saveCode,
            name: document.getElementById("saveName" + index).value,
          });

          document.getElementById("mainPlay").onclick();
        };

        window.getSave = function (index) {
          navigator.clipboard
            .writeText(res[index].data.saveCode)
            .then(() => {
              alert(
                '\nThe save code for save "' +
                  res[index].data.name +
                  '" has been copied to your clipboard.',
              );
            })
            .catch((e) => {
              if (printedCode) {
                document.getElementById("savedGames").removeChild(printedCode);
              }

              let div = document.createElement("div");

              printedCode = div;

              div.innerHTML =
                "<div style='font-size:10px;font-family:trebuchet ms;word-break:break-all;padding-left:10px;padding-right:10px;user-select:text'><br><br>" +
                res[index].data.saveCode +
                "<br><br><br><br><br></div>";

              document.getElementById("savedGames").appendChild(div);
              addedDivsToSplice.push(div);

              alert(
                '\nThere was an error copying the save code for save "' +
                  res[index].data.name +
                  '" to your clipboard. The code has been printed at the bottom of the page instead.',
              );
            });
        };

        res.sort((a, b) => b.data.lastSaved - a.data.lastSaved);

        if (res.length) {
          for (let i in addedDivsToSplice) {
            document
              .getElementById("savedGames")
              .removeChild(addedDivsToSplice[i]);
          }

          addedDivsToSplice = [];
        }

        for (let i in res) {
          let div = document.createElement("div");

          div.style.marginLeft = ((window.innerWidth * 0.5 - 250) | 0) + "px";
          div.style.width = "500px";
          div.style.height = "70px";
          div.style.borderRadius = "5px";
          div.style.border = "4px solid rgb(180,160,0)";
          div.style.backgroundColor = "rgb(250,230,50)";
          div.style.marginBottom = "15px";

          addedDivsToSplice.push(div);

          let date = new Date(res[i].data.lastSaved),
            dgh = date.getHours();

          let lastSavedDate = `${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}&nbsp;&nbsp;${(dgh >= 12
            ? dgh - 12
            : dgh
          )
            .toString()
            .padStart(2, "0")
            .replace("00", "12")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${date
            .getSeconds()
            .toString()
            .padStart(2, "0")} ${dgh >= 12 ? "PM" : "AM"}`;

          div.innerHTML =
            "<input id='saveName" +
            i +
            "' style='margin-top:3px;margin-left:3px;font-size:22px;background-color:rgb(0,0,0,0);border:none;font-family:comic sans ms;padding-left:4px;padding-bottom:5px;background-color:rgb(0,0,0,0.1)' spellcheck='false' size='17' value='" +
            res[i].data.name +
            "' onchange='window.renameSave(" +
            i +
            ")'><div style='margin-top:7px;margin-left:5px;font-size:14px;color:rgb(60,60,60)'>Last Saved: " +
            lastSavedDate +
            "</div><div style='margin-left:460px;margin-top:-25px;width:52px;height:27px;transform:translate(-50%,-50%);background-color:rgb(210,50,50);border-radius:4px;border:2px solid black;text-align:center;font-size:16px;cursor:pointer' onclick='window.deleteSave(" +
            i +
            ")'>Delete</div><div style='margin-left:395px;margin-top:-31px;width:52px;height:27px;transform:translate(-50%,-50%);background-color:rgb(195,100,255);border-radius:4px;border:2px solid black;text-align:center;font-size:16px;cursor:pointer' onclick='window.getSave(" +
            i +
            ")'>Export</div><div style='margin-left:330px;margin-top:-31px;width:52px;height:27px;transform:translate(-50%,-50%);background-color:rgb(50,210,50);border-radius:4px;border:2px solid black;text-align:center;font-size:16px;cursor:pointer' onclick='window.initSave(" +
            i +
            ")'>Play</div>";

          document.getElementById("savedGames").appendChild(div);
        }
      })
      .catch((e) => {
        let div = document.createElement("div");

        addedDivsToSplice.push(div);

        div.innerHTML =
          "<p style='text-align:center;color:rgb(150,0,0)'>Error loading from IndexedDB. IndexedDB may not be supported.</p>";

        document.getElementById("savedGames").appendChild(div);
      });
  };

  document.getElementById("mainInfo").onclick = function () {
    copyThumbnail("info");

    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("mainInfoMenu").style.display = "block";
  };

  document.getElementById("info_mainBack").onclick = document.getElementById(
    "select_mainBack",
  ).onclick = function () {
    document.getElementById("mainInfoMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
  };

  window.drawThumbnail(document.getElementById("thumbnailCanv"));
}

var _M = Math;

// function BeeSwarmSimulator(DATA) {
async function BeeSwarmSimulator(saveData) {
  let width = window.thisProgramIsInFullScreen ? 500 : window.innerWidth + 1;
  let height = window.thisProgramIsInFullScreen ? 500 : window.innerHeight + 1;

  const glCanvas = document.getElementById("gl-canvas");
  const uiCanvas = document.getElementById("ui-canvas");
  const ctx = uiCanvas.getContext("2d"); // Needed for Renderer.renderUI

  glCanvas.width = width;
  glCanvas.height = height;
  uiCanvas.width = width;
  uiCanvas.height = height;

  gl.viewport(0, 0, width, height);

  // --- 1. SETUP GOES HERE ---
  const canvas = document.getElementById("gl-canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("WebGL 2.0 not supported by your browser.");
    return;
  }

  // --- 2. RENDERER INITIALIZATION ---
  // Now that you have 'gl', you can pass it into the Renderer
  const renderer = new Renderer(gl, canvas.width, canvas.height);
  // document.onpaste = undefined;

  // Run the modular asset loader
  const textures = loadTextures(gl, tex_ctx); // [cite: 878]

  // Pass these textures to your renderer or store in gameState
  renderer.textures = textures;

  window.onresize = () => {
    width = window.thisProgramIsInFullScreen ? 500 : window.innerWidth + 1;
    height = window.thisProgramIsInFullScreen ? 500 : window.innerHeight + 1;

    glCanvas.width = width;
    glCanvas.height = height;
    uiCanvas.width = width;
    uiCanvas.height = height;

    gl.viewport(0, 0, width, height);

    // Update the renderer's internal state
    renderer.width = width;
    renderer.height = height;

    // Refresh projection matrix in gameState
    gameState.player.setProjectionMatrix(
      gameState.player.fov,
      width / height,
      0.1,
      275,
    );
  };

  // --- 3. STATE INITIALIZATION ---
  const gameState = createInitialState(saveData);

  // // A. Initialize the renderer
  // const renderer = new Renderer(gl, canvas.width, canvas.height);

  // A. Initialize the Text system
  const textRenderer = new TextRenderer(
    gl,
    renderer.glCache,
    renderer.programs,
  );

  // B. Attach Input listeners
  initInputHandlers(gameState, uiCanvas);
  // --- 4. ENGINE STARTUP ---
  initGameWorld(gameState);

  // 3. Compile Shaders and Initialize Cache
  // We use the keys defined in your engine/shaders.js
  renderer.programs.static = renderer.createProgram("staticVSH", "staticFSH");
  renderer.programs.bee = renderer.createProgram("beeVSH", "beeFSH");
  renderer.programs.flower = renderer.createProgram("flowerVSH", "flowerFSH");
  renderer.programs.token = renderer.createProgram("tokenVSH", "tokenFSH");
  renderer.programs.particle = renderer.createProgram(
    "particleVSH",
    "particleFSH",
  );
  renderer.programs.text = renderer.createProgram("textVSH", "textFSH");

  // Map all the attribute/uniform locations
  renderer.initCache(renderer.programs);

  // 4. Initialize Game State with Save Data
  // (Assuming you've moved the state logic to a helper or gameState.js)
  const currentGameState = initializeState(saveData);

  let then = 0;
  // 5. Start the Game Loop
  function gameLoop(now) {
    // A. Delta Time calculation
    // const dt = calculateDelta(now);
    const dt = Math.min((now - then) * 0.001, 0.07); //
    then = now; //

    // B. RUN SIMULATION (Logic Phase)
    // This updates positions, AI, and game logic
    updateEngine(currentGameState, dt);

    // Use your new modular renderer!
    renderer.render(currentGameState, dt);

    // 4. Request the next frame
    // requestAnimationFrame(gameLoop);
    window.requestAnimationFrame(gameLoop); //
  }

  requestAnimationFrame(gameLoop);
}

console.log = 0;
