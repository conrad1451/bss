// CHQ: I created

export const injectRoboMenu = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    
    <div
      id="roboMenu"
      style="
        position: fixed;
        width: 500px;
        height: 500px;
        z-index: 1;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: rgb(0, 140, 0);
        color: rgb(255, 255, 255);
        font-size: 17px;
        text-align: center;
        border-radius: 5px;
        display: none;
      "
    >
      <div
        id="roboCogsAmount"
        style="
          position: fixed;
          left: 22%;
          top: 3%;
          transform: translate(-50%, -50%);
          font-size: 20px;
          color: black;
          width: 200px;
          text-align: left;
        "
      ></div>

      <div
        id="roboTitle"
        style="
          position: fixed;
          left: 50%;
          top: 7%;
          transform: translate(-50%, -50%);
          font-size: 30px;
        "
      ></div>

      <div
        id="roboStartRound"
        style="
          position: fixed;
          left: 92%;
          top: 7.5%;
          transform: translate(-50%, -50%);
          color: black;
          font-size: 18px;
          background-color: rgb(46, 247, 93);
          padding: 5px;
          border: 2px solid black;
          border-radius: 9px;
          cursor: pointer;
        "
        onclick="window.roboStartRound()"
      >
        Start Round!
      </div>

      <div
        id="roboSkipBeePage"
        style="
          position: fixed;
          left: 92%;
          top: 7.5%;
          transform: translate(-50%, -50%);
          color: black;
          font-size: 18px;
          background-color: rgb(46, 247, 93);
          padding: 5px;
          border: 2px solid black;
          border-radius: 9px;
          cursor: pointer;
        "
        onclick="window.roboSkipBeePage()"
      >
        Next
      </div>

      <div
        id="roboActiveBeesAmount"
        style="
          position: fixed;
          width: 200px;
          height: 400px;
          left: 21%;
          top: 54%;
          transform: translate(-50%, -50%);
          font-size: 16px;
        "
      ></div>

      <div
        id="roboActiveBees"
        style="
          position: fixed;
          width: 200px;
          height: 400px;
          left: 21%;
          top: 59%;
          transform: translate(-50%, -50%);
          font-size: 29px;
          background-color: rgb(255, 255, 255, 0.3);
          border-radius: 4px;
        "
      ></div>

      <div
        id="roboActiveUpgradesAmount"
        style="
          position: fixed;
          width: 200px;
          height: 400px;
          left: 21%;
          top: 54%;
          transform: translate(-50%, -50%);
          font-size: 16px;
        "
      ></div>

      <div
        id="roboActiveUpgrades"
        style="
          position: fixed;
          width: 200px;
          height: 400px;
          left: 21%;
          top: 59%;
          transform: translate(-50%, -50%);
          background-color: rgb(255, 255, 255, 0.3);
          border-radius: 4px;
          font-size: 17px;
          text-align: left;
          color: black;
          overflow-y: auto;
          overflow-x: hidden;
        "
      ></div>

      <div
        id="roboBeeChoices"
        style="
          position: fixed;
          width: 285px;
          height: 400px;
          left: 70.5%;
          top: 59%;
          transform: translate(-50%, -50%);
          font-size: 19px;
        "
      >
        <div
          id="roboBeeChoice1"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(255, 255, 255);
            border-radius: 5px;
            width: 255px;
            height: 100px;
            left: 50%;
            top: 20%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
        <div
          id="roboBeeChoice2"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(255, 255, 255);
            border-radius: 5px;
            width: 255px;
            height: 100px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
        <div
          id="roboBeeChoice3"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(255, 255, 255);
            border-radius: 5px;
            width: 255px;
            height: 100px;
            left: 50%;
            top: 80%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
      </div>

      <div
        id="roboQuestChoices"
        style="
          position: fixed;
          width: 285px;
          height: 400px;
          left: 50%;
          top: 59%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          font-family: comic sans ms;
        "
      >
        <div
          id="roboQuestChoice1"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(255, 255, 255, 0.4);
            border-radius: 5px;
            width: 235px;
            height: 375px;
            left: 7%;
            top: 52%;
            transform: translate(-50%, -50%);
            color: black;
            font-size: 16px;
            text-align: left;
            padding-left: 5px;
          "
        ></div>
        <div
          id="roboQuestChoice2"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(255, 255, 255, 0.4);
            border-radius: 5px;
            width: 235px;
            height: 375px;
            left: 93%;
            top: 52%;
            transform: translate(-50%, -50%);
            color: black;
            font-size: 16px;
            text-align: left;
            padding-left: 5px;
          "
        ></div>
      </div>

      <div
        id="roboUpgradeChoices"
        style="
          position: fixed;
          width: 285px;
          height: 400px;
          left: 70.5%;
          top: 59%;
          transform: translate(-50%, -50%);
          font-size: 17px;
          text-align: left;
        "
      >
        <div
          id="roboUpgradeChoice1"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(243, 225, 165);
            border-radius: 5px;
            width: 285px;
            height: 125px;
            left: 50%;
            top: 17%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
        <div
          id="roboUpgradeChoice2"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(243, 225, 165);
            border-radius: 5px;
            width: 285px;
            height: 125px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
        <div
          id="roboUpgradeChoice3"
          style="
            cursor: pointer;
            position: fixed;
            background-color: rgb(243, 225, 165);
            border-radius: 5px;
            width: 285px;
            height: 125px;
            left: 50%;
            top: 83%;
            transform: translate(-50%, -50%);
            color: black;
          "
        ></div>
      </div>
    </div>

    
    
    `,
  );
};
