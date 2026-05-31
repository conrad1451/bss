// CHQ: I created

export const injectRoboQuestMenu = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    
    <div
      id="roboQuestMenu"
      style="
        position: fixed;
        width: 200px;
        height: 250px;
        z-index: -3;
        left: -5px;
        top: 50%;
        transform: translate(0%, -50%);
        background-color: rgb(0, 140, 0);
        color: rgb(255, 255, 255);
        font-size: 21px;
        text-align: center;
        border-radius: 9px;
        display: none;
        border: 4px solid rgb(100, 100, 100);
      "
    >
      <div id="roboQuestSeparator"></div>

      <div
        id="endRoboChallenge"
        style="
          position: absolute;
          left: 50%;
          top: 100%;
          width: 150px;
          border-radius: 10px;
          border: 3px solid black;
          color: black;
          background-color: rgb(255, 30, 30);
          cursor: pointer;
          font-size: 20px;
          transform: translate(-50%, -50%);
          padding: 3px;
        "
        onclick="window.endRoboChallenge()"
      >
        End Challenge
      </div>
    </div> 
    
    `,
  );
};
