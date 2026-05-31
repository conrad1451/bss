export const injectShrineMenu = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    
    <div
      id="shrineMenu"
      style="
        position: fixed;
        width: 400px;
        height: 300px;
        z-index: 1;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: rgb(22, 54, 196);
        border-radius: 4px;
        color: rgb(255, 255, 255);
        font-size: 17px;
        text-align: center;
        display: none;
      "
    >
      <button
        id="shrineX"
        style="
          border-radius: 3px;
          margin-left: -365px;
          margin-top: 3px;
          width: 30px;
          height: 30px;
          font-family: comic sans ms;
          padding-bottom: 5px;
          transition-duration: 0s;
        "
      >
        X
      </button>

      <p style="margin-left: 15px; margin-top: -27px; font-size: 22px">
        What would you like to donate<br />to the Wind Shrine?
      </p>

      <p
        id="shrineItemName"
        style="margin-left: -180px; margin-top: 29px; font-size: 18px"
      >
        itemname
      </p>

      <div id="shrineItem" style="margin-left: 170px; margin-top: -38px">a</div>

      <div
        id="shrineLeft"
        style="
          margin-top: -85px;
          margin-left: 195px;
          font-size: 25px;
          width: 40px;
          border-radius: 5px;
        "
      >
        ◄
      </div>
      <div
        id="shrineRight"
        style="
          margin-top: -35px;
          margin-left: 330px;
          font-size: 25px;
          width: 40px;
          border-radius: 5px;
        "
      >
        ►
      </div>

      <p style="margin-left: 0px; margin-top: 21px; font-size: 22px">
        How many?
      </p>

      <input
        id="shrineAmount"
        value="1"
        type="number"
        min="1"
        style="
          margin-left: -60px;
          margin-top: -11px;
          width: 100px;
          font-size: 20px;
          height: 19px;
        "
      />

      <div
        id="shrineDonate"
        style="
          margin-top: 64px;
          margin-left: 148px;
          font-size: 22px;
          width: 100px;
          border-radius: 4px;
          padding-top: 2px;
          padding-bottom: 5px;
        "
      >
        Donate
      </div>
    </div>

    
    
    `,
  );
};
