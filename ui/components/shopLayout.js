// ui/components/shopLayout.js

export const injectShopHTML = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div
      id="shopUI"
      style="
        position: fixed;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: none;
      "
    >
      <h2>Bee Shop</h2>

      <div
        style="
          position: fixed;
          width: 175px;
          height: 300px;
          z-index: 1;
          left: 100%;
          top: 45%;
          transform: translate(-100%, -50%);
          background-color: rgb(30, 70, 255);
          border-radius: 10px;
        "
      >
        <div
          id="itemName"
          style="
            position: fixed;
            width: 162px;
            height: 30px;
            z-index: 1;
            left: 50%;
            top: 7%;
            transform: translate(-50%, -50%);
            background-color: rgb(0, 30, 205);
            border-radius: 10px;
            color: white;
            font-family: comic sans ms;
            font-size: 18px;
            text-align: center;
          "
        ></div>
        <div
          id="itemDesc"
          style="
            position: fixed;
            width: 182px;
            height: 280px;
            z-index: 1;
            left: 50%;
            top: 56%;
            transform: translate(-50%, -50%) scale(0.9, 0.9);
            background-color: rgb(0, 30, 205);
            border-radius: 10px;
            color: white;
            font-family: comic sans ms;
            font-size: 13px;
            text-align: center;
          "
        ></div>
      </div>

      <div
        style="
          position: fixed;
          width: 117px;
          height: 255px;
          z-index: 1;
          left: 0%;
          top: 45%;
          transform: translate(0, -50%);
          background-color: rgb(30, 70, 255);
          border-radius: 10px;
        "
      >
        <div
          id="itemCostSVG"
          style="
            position: fixed;
            width: 110px;
            height: 247px;
            z-index: 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background-color: rgb(0, 30, 205);
            border-radius: 10px;
            color: white;
            font-family: comic sans ms;
            font-size: 18px;
          "
        ></div>
      </div>

      <div
        style="
          position: fixed;
          border-radius: 10px;
          background-color: rgb(0, 30, 205);
          width: 200px;
          height: 50px;
          left: 50%;
          top: 85%;
          transform: translate(-50%, -50%);
        "
      >
        <button
          id="purchaseButton"
          style="
            position: fixed;
            border-radius: 10px;
            font-family: comic sans ms;
            background-color: rgb(0, 200, 0);
            text-align: center;
            width: 100px;
            height: 30px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: white;
          "
        >
          Purchase
        </button>


     <!--- leftshopbutton --->
     <!--- rightshopbutton --->

        
      </div>
    </div>

  `,
  );
};
