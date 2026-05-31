// CHQ: I created

export const injectRoboMenu = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    
        <div
        id="actionWarning"
        style="
                position: fixed;
                margin-left: 50%;
                margin-top: 5px;
                width: 360px;
                height: 60px;
                z-index: 2;
                transform: translate(-50%, 0px);
                display: none;
            "
        >
        <div
            style="
                position: fixed;
                margin-left: 60px;
                margin-top: 5.5px;
                width: 300px;
                height: 50px;
                background-color: rgb(30, 70, 255, 0.8);
                border-radius: 3px;
                padding: 0px;
                font-size: 18px;
                color: white;
                text-align: center;
                padding-top: 0px;
                "
            id="actionNameBox"
        >
            <div
            id="actionName"
            style="
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%) translate(0, -2px);
                    width: 300px;
                "
            ></div>
        </div>

        <div
            style="
                position: fixed;
                margin-left: 0px;
                margin-top: 0px;
                width: 45px;
                height: 55px;
                background-color: rgb(200, 200, 200);
                border-radius: 3px;
                font-size: 40px;
                color: white;
                padding-left: 15px;
                padding-top: 0px;
                border: 3px solid rgb(50, 50, 50);
                "
            id="actionEButton"
        >
            E
        </div>

        <div
            style="
                position: fixed;
                margin-left: 0px;
                margin-top: 0px;
                width: 360px;
                height: 50px;
                padding-left: 0px;
                padding-top: 10px;
                "
            id="actionHoverDarken"
        ></div>
        </div>;    
    
    `,
  );
};
