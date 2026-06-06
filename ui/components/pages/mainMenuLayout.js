// ui/components/pages/mainMenuLayout.js

export const injectMainMenuLayout = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
<div
  id="mainMenu"
  style="
    position: fixed;
    z-index: 1;
    background-color: rgb(255, 255, 255);
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
  "
>
  <canvas
    id="thumbnailCanv"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: -1;
      transform: translate(-50%, -50%);
    "
  ></canvas>

  <div
    style="
      position: fixed;
      left: 50%;
      top: 10%;
      text-align: center;
      font-size: 45px;
      text-align: center;
      background-color: rgb(255, 255, 255, 0.6);
      border-radius: 15px;
      padding: 5px;
      padding-left: 25px;
      padding-right: 25px;
      transform: translate(-50%, -50%);
      width: 5000px;
      backdrop-filter: blur(10px);
    "
  >
    Bee Swarm Simulator
  </div>

  <button
    id="btnNewGame"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      width: 300px;
      height: 70px;
      background-color: rgb(157, 255, 150);
      transform: translate(-50%, -130%);
      font-family: comic sans ms;
      font-size: 35px;
    "
  >
    Play
  </button>
  <button
    id="btnLoadGame"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      width: 300px;
      height: 70px;
      background-color: rgb(10, 202, 250);
      transform: translate(-50%, 0%);
      font-family: comic sans ms;
      font-size: 35px;"
      >
      Load Game
    </button>
    <button
    id="mainInfo"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      width: 300px;
      height: 70px;
      background-color: rgb(248, 129, 129);
      transform: translate(-50%, 130%);
      font-family: comic sans ms;
      font-size: 23px;
    "
  >
    Instructions & Info
  </button>

  <button
    id="openNewWindow"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      width: 300px;
      height: 70px;
      background-color: rgb(248, 255, 150);
      transform: translate(-50%, 260%);
      font-family: comic sans ms;
      font-size: 23px;
    "
  >
    Open In New Window
  </button>
</div>

    `,
  );
};
