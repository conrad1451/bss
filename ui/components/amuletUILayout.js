export const injectAmuletUIHTML = (amuletUIWarnLayout) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
        <div
        id="amuletUI"
        style="
            position: fixed;
            left: 50%;
            top: 50%;
            width: 250px;
            height: 350px;
            z-index: 2;
            transform: translate(-50%, -50%) scale(1.25, 1.25);
            background-color: rgb(255, 255, 100);
            border-radius: 4px;
            display: none;
        "
        >
        <div
            style="
            position: fixed;
            margin-left: 50%;
            margin-top: 0px;
            width: 250px;
            height: 35px;
            z-index: 2;
            transform: translate(-50%, 0px);
            background-color: rgb(30, 200, 70);
            border-bottom: 2px solid rgb(0, 100, 0);
            text-align: center;
            font-size: 23px;
            font-family: trebuchet ms;
            padding-top: 5px;
            border-radius: 4px;
            "
            id="amuletType"
        ></div>

        <div
            style="
            position: fixed;
            margin-left: 0px;
            margin-top: 48px;
            width: 125px;
            height: 22px;
            z-index: 2;
            background-color: rgb(255, 20, 20, 0.5);
            text-align: center;
            font-size: 17px;
            font-family: trebuchet ms;
            padding-top: 2px;
            "
        >
            Old:
        </div>
        <div
            style="
            position: fixed;
            margin-left: 50%;
            margin-top: 48px;
            width: 125px;
            height: 22px;
            z-index: 2;
            background-color: rgb(0, 190, 50, 0.5);
            text-align: center;
            font-size: 17px;
            font-family: trebuchet ms;
            padding-top: 2px;
            "
        >
            New:
        </div>

        <div
            style="
            position: fixed;
            margin-left: 0px;
            margin-top: 75px;
            width: 120px;
            height: 220px;
            z-index: 2;
            font-size: 10.5px;
            font-family: trebuchet ms;
            padding-left: 5px;
            "
            id="oldAmuletStats"
        ></div>
        <div
            style="
            position: fixed;
            margin-left: 50%;
            margin-top: 75px;
            width: 120px;
            height: 220px;
            z-index: 2;
            font-size: 10.5px;
            font-family: trebuchet ms;
            padding-left: 5px;
            "
            id="newAmuletStats"
        ></div>

        <div
            style="
            position: fixed;
            margin-left: 4%;
            margin-top: 310px;
            width: 100px;
            height: 28px;
            z-index: 2;
            background-color: rgb(200, 0, 0);
            text-align: center;
            font-size: 19px;
            font-family: trebuchet ms;
            padding-top: 4px;
            color: white;
            border-radius: 2px;
            "
            id="keepAmulet"
        >
            Keep Old
        </div>
        <div
            style="
            position: fixed;
            margin-left: 56%;
            margin-top: 310px;
            width: 100px;
            height: 28px;
            z-index: 2;
            background-color: rgb(0, 130, 20);
            text-align: center;
            font-size: 19px;
            font-family: trebuchet ms;
            padding-top: 4px;
            color: white;
            border-radius: 2px;
            "
            id="replaceAmulet"
        >
            Replace
        </div>
        </div>
  
      `,
  );
};
