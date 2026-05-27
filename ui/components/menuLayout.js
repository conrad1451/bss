// ui/components/menuLayout.js

// CHQ: Gemini AI generated

// export const injectMenuHTML = (container) => {
//   container.innerHTML += `
//     <div id='mainMenu'>
//       <h1>Bee Swarm Simulator</h1>
//       <button id="playBtn">Play</button>
//       </div>
//   `;
// };

// cleanly appends your new modular HTML string as a sibling
// to canvases without touching or disrupting the active
// layout states of anything else inside the body:

// Inside your src/ui/components/menuLayout.js file:
export const injectMenuHTML = (container) => {
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
        id="mainPlay"
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
        id="mainInfo"
        style="
          position: fixed;
          left: 50%;
          top: 50%;
          width: 300px;
          height: 70px;
          background-color: rgb(248, 129, 129);
          transform: translate(-50%, 0%);
          font-family: comic sans ms;
          font-size: 23px;
        "
      >
        Instructions & Info
      </button>

      <button
        id="mainNew"
        style="
          position: fixed;
          left: 50%;
          top: 50%;
          width: 300px;
          height: 70px;
          background-color: rgb(248, 255, 150);
          transform: translate(-50%, 130%);
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
