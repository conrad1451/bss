// ui/menu.js

// CHQ: Gemini AI generated this file

import { loadCheckpoint, saveCheckpoint, deleteFromDB } from "../utils/db.js";

import { useItem } from "../engine/inventory.js";
import { updateQuestUI } from "./questRenderer.js";
import { getSaveSnapshot } from "../state/gameState.js";

let addedDivsToSplice = [];
let ableToImport = true;
let printedCode = null;

/**
 * Binds all HTML overlay DOM elements to the active running game state.
 * @param {Object} gameState - The single source of truth state object
 */
export function setupUserInterfaceListeners(gameState) {
  const saveButton = document.getElementById("save-btn");
  const questButton = document.getElementById("questButton");

  const consumableIds = [
    "fieldDice",
    "redExtract",
    "microConverter",
    "blueExtract",
    "glitter",
  ];

  // 1. Consumable Hotbar Buttons
  consumableIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        useItem(id, gameState);
      });
    }
  });

  // 2. Quest Menu Toggle
  if (questButton) {
    questButton.addEventListener("click", () => {
      const page = document.getElementById("questPage");
      if (!page) return;

      const isHidden =
        page.style.display === "none" || page.style.display === "";

      // Hide all other UI windows first (Classic BSS style)
      document.querySelectorAll(".uiPage").forEach((p) => {
        p.style.display = "none";
      });

      if (isHidden) {
        page.style.display = "block";
        updateQuestUI(gameState);
      } else {
        page.style.display = "none";
      }
    });
  }

  // 3. Database Checkpoint Save Button
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      console.log("Checkpoint triggered via UI...");
      const snapshot = getSaveSnapshot(gameState);
      try {
        await saveCheckpoint(snapshot);
        console.log("Game Saved Successfully!");
      } catch (err) {
        console.error("Save failed:", err);
      }
    });
  }
}

// Helper for cleaner, safer binding
function onElementReady(selector, callback) {
  const el = document.getElementById(selector);
  if (el) {
    callback(el);
  } else {
    console.warn(`Element ${selector} not found yet.`);
  }
}

export function initMainMenu(BeeSwarmSimulator) {
  //   const addedDivsToSplice = [];
  //   let ableToImport = true;
  // Helper: Only attach if element exists
  const safeOnClick = (id, callback) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = callback;
    } else {
      console.warn(`Element with id "${id}" not found. Skipping binding.`);
    }
  };

  // CHQ: Gemini AI: A simple helper to manage UI state
  function showPage(pageId) {
    const pages = ["mainMenu", "mainInfoMenu", "mainSelectMenu"]; // List all your main pages
    pages.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === pageId ? "block" : "none";
    });
  }

  // 1. New Game Logic
  safeOnClick("btnNewGame", () => {
    document.getElementById("mainMenu").style.display = "none";
    BeeSwarmSimulator({ id: Date.now(), name: "New Save" });
  });

  // 2. Load Game Logic (Opens your Save List)
  safeOnClick("btnNewGame", () => {
    document.getElementById("mainMenu").style.display = "none";
    BeeSwarmSimulator({ id: Date.now(), name: "New Save" });
  });

  // 2. Load Game Logic (Opens your Save List)
  safeOnClick("btnLoadGame", () => {
    copyThumbnail("select");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "block";
    renderSaveList(BeeSwarmSimulator);
  });

  // Handle Instruction Page
  safeOnClick("mainInfo", () => {
    copyThumbnail("info");
    showPage("mainInfoMenu");
    // document.getElementById("mainMenu").style.display = "none";
    // document.getElementById("mainInfoMenu").style.display = "block";
  });

  // // 1. Handle Navigation
  // // Usage in menu.js
  // safeOnClick("mainInfo", (btn) => {
  //   btn.onclick = () => {
  //     copyThumbnail("info");
  //     document.getElementById("mainMenu").style.display = "none";
  //     document.getElementById("mainInfoMenu").style.display = "block";
  //   };
  // });

  // Handle New Window
  safeOnClick("openNewWindow", () => {
    for (let i in addedDivsToSplice) {
      document.getElementById("savedGames").removeChild(addedDivsToSplice[i]);
    }

    let w = window.open();
    w.document.open();
    w.document.write(
      "<!doctype html><html>" + document.querySelector("html").innerHTML,
    );
    w.document.close();
  });
  // safeOnClick("openNewWindow", () => {
  //   for (let i in addedDivsToSplice) {
  //     document.getElementById("savedGames").removeChild(addedDivsToSplice[i]);
  //   }

  //   let w = window.open();
  //   w.document.open();
  //   w.document.write(
  //     "<!doctype html><html>" + document.querySelector("html").innerHTML,
  //   );
  //   w.document.close();
  // });

  // const mainInfoBtn = document.getElementById("mainInfo");
  // if (mainInfoBtn) {
  //   mainInfoBtn.onclick = function () {
  //     copyThumbnail("info");
  //     document.getElementById("mainMenu").style.display = "none";
  //     document.getElementById("mainInfoMenu").style.display = "block";
  //   };
  // } else {
  //   console.error("mainInfo element not found!");
  // }

  const copyThumbnail = (t) => {
    const canv = document.getElementById(t + "_thumbnailCanvCopy");
    const ctx = canv.getContext("2d");
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    ctx.drawImage(document.getElementById("thumbnailCanv"), 0, 0);
  };

  // 3. Handle External Page Logic
  // document.getElementById("openNewWindow").onclick = function () {
  //   for (let i in addedDivsToSplice) {
  //     document.getElementById("savedGames").removeChild(addedDivsToSplice[i]);
  //   }

  //   let w = window.open();
  //   w.document.open();
  //   w.document.write(
  //     "<!doctype html><html>" + document.querySelector("html").innerHTML,
  //   );
  //   w.document.close();
  // };

  // 4. Initial Visual State
  if (window.drawThumbnail) {
    window.drawThumbnail(document.getElementById("thumbnailCanv"));
  }

  // document.getElementById("info_mainBack").onclick = document.getElementById(
  //   "select_mainBack",
  // ).onclick = function () {
  //   document.getElementById("mainInfoMenu").style.display = "none";
  //   document.getElementById("mainSelectMenu").style.display = "none";
  //   document.getElementById("mainMenu").style.display = "block";
  // };

  // To this safer version:
  const backBtn1 = document.getElementById("info_mainBack");
  const backBtn2 = document.getElementById("select_mainBack");

  const backHandler = () => {
    document.getElementById("mainInfoMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
  };

  if (backBtn1) backBtn1.onclick = backHandler;
  if (backBtn2) backBtn2.onclick = backHandler;
  // Add these inside initMainMenu(...)

  // ✅ SAFE VERSION
  const createNewGameBtn = document.getElementById("createNewGame");
  if (createNewGameBtn) {
    createNewGameBtn.onclick = function () {
      document.getElementById("mainSelectMenu").style.display = "none";
      document.getElementById("mainMenu").style.display = "none";
      BeeSwarmSimulator({ id: Date.now(), name: "Untitled Save" });
    };
  } else {
    console.warn("createNewGame button not found, skipping listener.");
  }
  // document.getElementById("createNewGame").onclick = function () {
  //   document.getElementById("mainSelectMenu").style.display = "none";
  //   document.getElementById("mainMenu").style.display = "none";
  //   BeeSwarmSimulator({ id: Date.now(), name: "Untitled Save" });
  // };

  document.onpaste = (e) => {
    if (!ableToImport) return;
    let text = e.clipboardData.getData("text/plain");
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "none";

    BeeSwarmSimulator({
      id: Date.now(),
      saveCode: text,
      name: "Untitled Import",
    });
  };

  // Handle Loading a Save
  window.initSave = function (index, res) {
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "none";
    // res should be the result of your loadCheckpoint() call
    BeeSwarmSimulator(res[index]);
  };

  // Handle Deleting a Save
  window.deleteSave = function (index, res) {
    if (confirm("Are you sure you want to delete this save?")) {
      deleteFromDB(res[index].id).then(() => {
        renderSaveList(BeeSwarmSimulator); // Refresh list
      });
    }
  };

  // Logic for Create New Game, Import, Paste, and Navigation...
  // (Paste the rest of your DOM event listeners here)
}

/**
 * One final professional touch: notice in your renderSaveList that the
 * HTML uses window.initSave. Since we moved away from window globals,
 * you should define those functions inside renderSaveList or attach
 * them to window only once inside initMainMenu so the buttons still work.
 *
 */
function renderSaveList(BeeSwarmSimulator) {
  loadCheckpoint().then((res) => {
    // 1. Clear old entries
    for (let div of addedDivsToSplice) {
      document.getElementById("savedGames").removeChild(div);
    }
    addedDivsToSplice = [];

    // 2. Sort by date
    res.sort((a, b) => b.data.lastSaved - a.data.lastSaved);

    // 3. Build the UI for each save
    res.forEach((save, i) => {
      let div = document.createElement("div");
      // ... Apply your styles from the old index.js ...
      div.innerHTML = `
  <div onclick="window.initSave(${i}, ${JSON.stringify(res).replace(/"/g, "'")})">Play ${save.data.name}</div>
  <div onclick="window.deleteSave(${i}, ${JSON.stringify(res).replace(/"/g, "'")})">Delete</div>
`;
      document.getElementById("savedGames").appendChild(div);
      addedDivsToSplice.push(div);
    });
  });
}
