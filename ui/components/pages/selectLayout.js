export const injectSelectLayout = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div
  id="mainSelectMenu"
  style="
    position: fixed;
    z-index: 1;
    top: 0px;
    left: 0px;
    background-color: rgb(255, 255, 255);
    bottom: 0px;
    right: 0px;
    display: none;
    overflow-y: auto;
  "
>
  <canvas
    id="select_thumbnailCanvCopy"
    style="
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: -1;
      transform: translate(-50%, -50%);
      filter: blur(10px);
    "
  ></canvas>

  <div style="margin-top: 20px; font-size: 45px; text-align: center">
    Saved Games
  </div>

  <button
    id="select_mainBack"
    style="
      margin-left: 80px;
      margin-top: -70px;
      width: 120px;
      height: 60px;
      background-color: rgb(174, 216, 255);
      transform: translate(-50%, -50%);
      font-family: comic sans ms;
      font-size: 25px;
    "
  >
    Back
  </button>

  <div style="width: 100%; height: 50px">
    <button
      id="createNewGame"
      style="
        position: absolute;
        left: 50%;
        width: 200px;
        height: 50px;
        background-color: rgb(225, 225, 225);
        transform: translate(-210px, 0px);
        font-family: comic sans ms;
        font-size: 23px;
      "
    >
      New Game
    </button>

    <button
      id="createImportedGame"
      style="
        position: absolute;
        left: 50%;
        width: 200px;
        height: 50px;
        background-color: rgb(225, 225, 225);
        transform: translate(10px, 0px);
        font-family: comic sans ms;
        font-size: 23px;
      "
    >
      Import Game
    </button>
  </div>

  <br /><br />

  <div id="savedGames"></div>
</div>
    `,
  );
};
