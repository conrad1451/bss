// ui/components/abilityLayout.js

// CHQ: Gemini AI generated

export const injectAbilityUI = (container) => {
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div id="abilityUI" style="margin: 5px; padding: 0px; margin-top: 35px; position: fixed">
      
      <svg id="inspireCoconutsPassive" style="width: 30px; height: 30px; display: none">
        <circle cx="15" cy="15" r="14" fill="rgb(115,163,0)" stroke="rgb(0,0,0)" stroke-width="2"></circle>
        <circle cx="16" cy="14" r="8" fill="rgb(150,75,0)" stroke="rgb(0,0,0)" stroke-width="1"></circle>
        <circle cx="18" cy="15" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="13" cy="12" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="18" cy="11" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <path d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z" transform="translate(12,19) scale(0.75,0.75)" fill="rgb(255,255,0)" stroke="rgb(200,200,0)"></path>
        <rect id="inspireCoconutsPassive_cooldown" width="30" height="0" style="fill: rgb(0, 0, 0)" opacity="0.45"></rect>
        <text id="inspireCoconutsPassive_amount" x="29" y="29" style="font-family: tahoma; font-size: 12px" text-anchor="end" fill="rgb(255,255,255)"></text>
      </svg>

      <svg id="emergencyCoconutShieldPassive" style="width: 30px; height: 30px; display: none">
        <circle cx="15" cy="15" r="14" fill="rgb(115,163,0)" stroke="rgb(0,0,0)" stroke-width="2"></circle>
        <circle cx="15" cy="15" r="11" fill="rgb(255,255,255,0.5)"></circle>
        <circle cx="15" cy="15" r="8" fill="rgb(150,75,0)" stroke="rgb(0,0,0)" stroke-width="1"></circle>
        <circle cx="17" cy="16" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="12" cy="13" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="17" cy="12" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <rect id="emergencyCoconutShieldPassive_cooldown" width="30" height="0" style="fill: rgb(0, 0, 0)" opacity="0.45"></rect>
        <text id="emergencyCoconutShieldPassive_amount" x="29" y="29" style="font-family: tahoma; font-size: 12px" text-anchor="end" fill="rgb(255,255,255)"></text>
      </svg>


      <svg
        id="coconutHastePassive"
        style="width: 30px; height: 30px; display: none"
      >
        <circle
          cx="15"
          cy="15"
          r="14"
          fill="rgb(115,163,0)"
          stroke="rgb(0,0,0)"
          stroke-width="2"
        ></circle>

        <circle
          cx="15"
          cy="15"
          r="8"
          fill="rgb(150,75,0)"
          stroke="rgb(0,0,0)"
          stroke-width="1"
        ></circle>

        <circle cx="17" cy="16" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="12" cy="13" r="1.5" fill="rgb(94, 51, 7)"></circle>
        <circle cx="17" cy="12" r="1.5" fill="rgb(94, 51, 7)"></circle>

        <g transform="translate(6,3) scale(0.75,0.75)">
          <path
            d="M18 9L15 21M12 26L15 21M16 26L15 21M11 11L16 15M23 15L16 15"
            stroke="rgb(255,255,255)"
            stroke-width="2"
          ></path>
          <path
            d="M5 7 L11 7M2 15L12 15M3 23L11 23"
            stroke="rgb(255,255,255)"
            stroke-width="1.5"
            opacity="0.5"
          ></path>
          <circle cx="18" cy="9" r="4" fill="rgb(255,255,255)"></circle>
        </g>

        <rect
          id="coconutHastePassive_cooldown"
          width="30"
          height="0"
          style="fill: rgb(0, 0, 0)"
          opacity="0.45"
        ></rect>
        <text
          id="coconutHastePassive_amount"
          x="29"
          y="29"
          style="font-family: tahoma; font-size: 12px"
          text-anchor="end"
          fill="rgb(255,255,255)"
        ></text>
      </svg>


      <svg id="xFlamePassive" style="width: 30px; height: 30px; display: none">
        <circle
          cx="15"
          cy="15"
          r="14"
          fill="rgb(115,163,0)"
          stroke="rgb(0,0,0)"
          stroke-width="2"
        ></circle>

        <path
          stroke="rgb(255,0,0)"
          stroke-width="6"
          d="M8 8L22 22M22 8L8 22"
        ></path>
        <path
          stroke="rgb(255,100,0)"
          stroke-width="5"
          d="M8 8L22 22M22 8L8 22"
        ></path>
        <path
          stroke="rgb(255,200,0)"
          stroke-width="1.5"
          d="M8 8L22 22M22 8L8 22"
        ></path>

        <rect
          id="xFlamePassive_cooldown"
          width="30"
          height="0"
          style="fill: rgb(0, 0, 0)"
          opacity="0.45"
        ></rect>
        <text
          id="xFlamePassive_amount"
          x="29"
          y="29"
          style="font-family: tahoma; font-size: 12px"
          text-anchor="end"
          fill="rgb(255,255,255)"
        ></text>
      </svg>
      

    </div>

    <svg id="ignitePassive" style="width: 30px; height: 30px; display: none">
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <path
        d="M15 25C5 24 5 13 15 5M15 25C25 24 25 13 15 5"
        fill="rgb(255,150,20)"
    ></path>
    <path
        d="M15 25C10 24 10 17 15 10M15 25C20 24 20 17 15 10"
        fill="rgb(255,0,0)"
    ></path>

    <rect
        id="ignitePassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="ignitePassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>;

    <svg
    id="bubbleBombsPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <circle cx="15" cy="18" r="7" fill="rgb(80,200,255)"></circle>
    <circle
        cx="15"
        cy="31"
        r="3"
        fill="rgb(80,80,80)"
        transform="scale(1,0.4)"
    ></circle>
    <path
        stroke="rgb(222, 222, 149)"
        stroke-width="2"
        fill="rgb(0,0,0,0)"
        d="M15 12C15 10 15 6 18 8"
    ></path>
    <circle cx="18" cy="7" r="2" fill="rgb(255,100,0)"></circle>

    <rect
        id="bubbleBombsPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="bubbleBombsPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="coinScatterPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <circle cx="15" cy="15" r="9" fill="rgb(230, 208, 14)"></circle>

    <path
        fill="rgb(217, 184, 52)"
        stroke="rgb(0,0,0)"
        stroke-width="1"
        d="M13 10C16 10 24 17 15 20C8 12 18 15 13 10Z"
    ></path>
    <rect
        id="coinScatterPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="coinScatterPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="diamondDrainPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <path
        fill="rgb(100,200,255)"
        d="M-2 0L2 0L4 2L0 6L-4 2Z"
        transform="translate(18,9) scale(1.9,2.15)"
        stroke="rgb(0,0,0)"
        stroke-width="0.6"
    ></path>
    <path
        fill="rgb(242, 199, 29)"
        d="M13 10C16 10 24 17 15 20C8 12 18 15 13 10Z"
        transform="translate(-8,-4) scale(1.2,1.2)"
        stroke="rgb(0,0,0)"
        stroke-width="0.7"
    ></path>

    <rect
        id="diamondDrainPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="diamondDrainPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="gummyMorphPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <rect
        x="9"
        y="10"
        width="12"
        height="12"
        fill="rgb(255,50,255,0.75)"
    ></rect>
    <path
        fill="rgb(25,255,126,0.75)"
        d="M9 21 C11 10 14 10 14 19C13 20 13 20 16 19C16 10 19 10 21 21"
    ></path>
    <circle cx="10" cy="10" r="3" fill="rgb(25,255,126,0.75)"></circle>
    <circle cx="20" cy="10" r="3" fill="rgb(25,255,126,0.75)"></circle>
    <circle cx="13" cy="15" r="0.7" fill="rgb(0,0,0)"></circle>
    <circle cx="17" cy="15" r="0.7" fill="rgb(0,0,0)"></circle>

    <rect
        id="gummyMorphPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="gummyMorphPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="focusPulserPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <path
        fill="rgb(255,255,255)"
        d="M15 25L7 18L12 15L 8 11C6 6 15 5 19 13L 20 15L13 20Z"
        transform="translate(2,0)"
        stroke="rgb(255,0,0)"
        stroke-width="2"
    ></path>

    <rect
        id="focusPulserPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="focusPulserPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="hastePulserPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <path
        fill="rgb(255,255,255)"
        d="M15 25L7 18L12 15L 8 11C6 6 15 5 19 13L 20 15L13 20Z"
        transform="translate(2,0)"
        stroke="rgb(0,0,255)"
        stroke-width="2"
    ></path>

    <rect
        id="hastePulserPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="hastePulserPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="petalStormPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <g transform="translate(15,15) rotate(48)">
        <path fill="rgb(255,255,255,0.25)" d="M 0 0C 7 -20 14 5 0 0"></path>
        <path
        fill="rgb(255,255,255,0.25)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="rotate(122)"
        ></path>
        <path
        fill="rgb(255,255,255,0.25)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="rotate(249)"
        ></path>
    </g>
    <g transform="translate(15,15) rotate(26)">
        <path fill="rgb(255,255,255,0.5)" d="M 0 0C 7 -20 14 5 0 0"></path>
        <path
        fill="rgb(255,255,255,0.5)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="rotate(122)"
        ></path>
        <path
        fill="rgb(255,255,255,0.5)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="rotate(249)"
        ></path>
    </g>

    <path
        fill="rgb(255,255,255)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="translate(15,15)"
    ></path>
    <path
        fill="rgb(255,255,255)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="translate(15,15) rotate(122)"
    ></path>
    <path
        fill="rgb(255,255,255)"
        d="M 0 0C 7 -20 14 5 0 0"
        transform="translate(15,15) rotate(249)"
    ></path>

    <circle fill="rgb(255, 255, 120)" cx="15" cy="15" r="3"></circle>

    <rect
        id="petalStormPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="petalStormPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>    
 
   
        <!---popStarPassive--->

        <!---scorchingStarPassive--->

        <!---gummyStarPassive--->

        <!---guidingStarPassive--->

        <!---starShowerPassive--->

        <!---starSawPassive--->

        <!---tabbyLove--->

        <!---scienceEnhancement--->

        <!---polarPower--->

        <!---comfortingNectar--->

        <!---invigoratingNectar--->

        <!---motivatingNectar--->

        <!---refreshingNectar--->
      
        <!---satisfyingNectar--->
     
        <!---roboChallengeBuff--->
     
        <!---redDriveBuff--->
     
        <!---whiteDriveBuff--->
     
        <!---blueDriveBuff--->
     
        <!---glitchedDriveBuff--->

        <!---antChallenge--->

        <!---dandelionFieldBoost--->

        <!---sunflowerFieldBoost--->

        <!---blueFlowerFieldBoost--->
      
        <!---mushroomFieldBoost--->

        <!---cloverFieldBoost--->

        <!---strawberryFieldBoost--->

        <!---spiderFieldBoost--->

        <!---bambooFieldBoost--->

        <!---pineapplePatchBoost--->
 
        <!---stumpFieldBoost--->

        <!---catcusfield--->
 
        <!---pumpkinPatchBoost--->
 
        <!---pineTreeForestBoost--->

        <!---roseFieldBoost--->
         
        <!---mountainTopFieldBoost--->

        <!---coconutFieldBoost--->
 
        <!---pepperPatchFieldBoost--->
  `,
  );
};
