// ui/menu.js

// CHQ: Gemini AI generated this file

import { loadCheckpoint, saveCheckpoint, deleteFromDB } from "../utils/db.js";

let addedDivsToSplice = [];
let ableToImport = true;
let printedCode = null;

export function initMainMenu(BeeSwarmSimulator) {
  //   const addedDivsToSplice = [];
  //   let ableToImport = true;

  // 1. Handle Navigation
  document.getElementById("mainInfo").onclick = function () {
    copyThumbnail("info");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("mainInfoMenu").style.display = "block";
  };

  const copyThumbnail = (t) => {
    const canv = document.getElementById(t + "_thumbnailCanvCopy");
    const ctx = canv.getContext("2d");
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    ctx.drawImage(document.getElementById("thumbnailCanv"), 0, 0);
  };

  // 2. Handle Game Launching
  document.getElementById("mainPlay").onclick = function () {
    copyThumbnail("select");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "block";
    renderSaveList(BeeSwarmSimulator, addedDivsToSplice);
  };

  // 3. Handle External Page Logic
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

  // 4. Initial Visual State
  if (window.drawThumbnail) {
    window.drawThumbnail(document.getElementById("thumbnailCanv"));
  }

  document.getElementById("info_mainBack").onclick = document.getElementById(
    "select_mainBack",
  ).onclick = function () {
    document.getElementById("mainInfoMenu").style.display = "none";
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
  };

  // Add these inside initMainMenu(...)

  document.getElementById("createNewGame").onclick = function () {
    document.getElementById("mainSelectMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "none";
    BeeSwarmSimulator({ id: Date.now(), name: "Untitled Save" });
  };

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
        <div onclick="window.initSave(${i})">Play ${save.data.name}</div>
        <div onclick="window.deleteSave(${i})">Delete</div>
      `;
      document.getElementById("savedGames").appendChild(div);
      addedDivsToSplice.push(div);
    });
  });
}
