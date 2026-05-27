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

    <svg id="popStarPassive" style="width: 30px; height: 30px; display: none">
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>
    <circle
        cx="8"
        cy="8"
        r="2"
        fill="rgb(30,110,205)"
        stroke="rgb(0,0,0,0.4)"
    ></circle>
    <circle
        cx="22"
        cy="10"
        r="3"
        fill="rgb(30,110,205)"
        stroke="rgb(0,0,0,0.4)"
    ></circle>
    <circle
        cx="15"
        cy="22"
        r="3"
        fill="rgb(30,110,205)"
        stroke="rgb(0,0,0,0.4)"
    ></circle>
    <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(15,15) scale(1.3,1.3)"
        fill="rgb(60,170,255)"
        stroke="rgb(10,80,200)"
    ></path>
    <rect
        id="popStarPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="popStarPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="scorchingStarPassive"
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
        d="M8 12 C5 10 5 8 10 3C15 15 15 15 13 15M19 12C15 15 25 1 25 12Z"
        fill="rgb(255,100,0)"
    ></path>
    <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(15,15) scale(1.3,1.3)"
        fill="rgb(220,0,0)"
        stroke="rgb(150,0,0)"
    ></path>
    <rect
        id="scorchingStarPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="scorchingStarPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="gummyStarPassive"
    style="width: 30px; height: 30px; display: none"
    >
    <defs>
        <linearGradient
        id="gummyStarGrad"
        x1="0.4"
        x2="0.6"
        y1="0.4"
        y2="0.6"
        >
        <stop offset="10%" stop-color="rgb(255, 50, 255)" />
        <stop offset="90%" stop-color="rgb(25, 255, 126)" />
        </linearGradient>
        <linearGradient
        id="gummyStarOutline"
        x1="0.4"
        x2="0.6"
        y1="0.4"
        y2="0.6"
        >
        <stop offset="10%" stop-color="rgb(0, 205, 86)" />
        <stop offset="90%" stop-color="rgb(205, 10, 205)" />
        </linearGradient>
    </defs>
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>
    <circle cx="9" cy="7" fill="rgb(205,10,205)" r="2"></circle>
    <circle cx="20" cy="7" fill="rgb(0,205,86)" r="2"></circle>
    <circle cx="24" cy="19" fill="rgb(205,10,205)" r="2"></circle>
    <circle cx="6" cy="19" fill="rgb(0,205,86)" r="2"></circle>
    <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(15,15) scale(1.3,1.3)"
        fill="url(#gummyStarGrad)"
        stroke="url(#gummyStarOutline)"
    ></path>
    <rect
        id="gummyStarPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="gummyStarPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="guidingStarPassive"
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

    <g transform="scale(0.75,0.75) translate(5,5)">
        <circle
        cx="15"
        cy="15"
        r="13"
        fill="rgb(200,200,200)"
        stroke="rgb(90,90,90)"
        stroke-width="3"
        ></circle>
        <path
        d="M0 -5L-2 10L2 10Z"
        fill="rgb(255,0,0)"
        transform="translate(15,15) rotate(40) translate(0,-8)"
        ></path>
        <path
        d="M0 -5L-2 10L2 10Z"
        fill="rgb(0,0,255)"
        transform="translate(15,15) rotate(180) translate(0,-8)"
        ></path>
        <path
        d="M0 -5L-2 10L2 10Z"
        fill="rgb(0,0,0)"
        transform="translate(15,15) rotate(-40) translate(0,-8)"
        ></path>
        <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(15,15) scale(1.3,1.3)"
        fill="rgb(255,235,100)"
        stroke="rgb(100,100,100)"
        ></path>
    </g>

    <rect
        id="guidingStarPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="guidingStarPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg
    id="starShowerPassive"
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
        d="M 16 13L 20 9M 16 6L 12 10M 19 19L 25 13"
        stroke="rgb(255, 255, 0,0.5)"
        stroke-width="2"
    ></path>
    <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(12,18) scale(0.8,0.8)"
        fill="rgb(255,235,100)"
        stroke="rgb(196, 196, 57)"
    ></path>
    <rect
        id="starShowerPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="starShowerPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg id="starSawPassive" style="width: 30px; height: 30px; display: none">
    <circle
        cx="15"
        cy="15"
        r="14"
        fill="rgb(115,163,0)"
        stroke="rgb(0,0,0)"
        stroke-width="2"
    ></circle>

    <circle
        cx="12"
        cy="19"
        r="7"
        fill="rgb(0,0,0,0)"
        stroke="rgb(255,255,255,0.5)"
        stroke-width="3"
        transform="scale(1.2,0.8)"
    ></circle>
    <path
        d="M0.00000 3.00000L4.70228 6.47214L2.85317 0.92705L7.60845 -2.47214L1.76336 -2.42705L0.00000 -8.00000L-1.76336 -2.42705L-7.60845 -2.47214L-2.85317 0.92705L-4.70228 6.47214Z"
        transform="translate(15,18) scale(1.2,0.8)"
        fill="rgb(255,255,255)"
        stroke="rgb(150,150,150)"
    ></path>
    <rect
        id="starSawPassive_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>
    <text
        id="starSawPassive_amount"
        x="29"
        y="29"
        style="font-family: tahoma; font-size: 12px"
        text-anchor="end"
        fill="rgb(255,255,255)"
    ></text>
    </svg>

    <svg id="tabbyLove" style="width: 30px; height: 30px; display: none">
    <rect width="30" height="30" fill="rgb(252, 186, 3)"></rect>
    <rect
        id="tabbyLove_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0"
    ></rect>

    <circle cx="10" cy="13" r="2.2"></circle>
    <circle cx="20" cy="13" r="2.1"></circle>

    <path
        fill="rgb(0,0,0,0)"
        stroke="rgb(0,0,0)"
        stroke-width="1.25"
        d="M12 17C 12 19 18 19 18 17M15 18L15 21M10 21C10 23 15 23 15 21M15 18L15 21M20 21C20 23 15 23 15 21M0 16L8 18M0 23L8 21M30 16L22 18M30 23L22 21"
    ></path>

    <path
        fill="rgb(0,0,0,0)"
        stroke="rgb(166, 129, 43)"
        stroke-width="2.5"
        d="M10 0L10 5M15 0 L 15 6M20 0 L20 5"
    ></path>

    <text
        id="tabbyLove_amount"
        x="28"
        y="28"
        style="font-family: calibri; font-size: 11px"
        text-anchor="end"
    ></text>
    </svg>

    <svg
    id="scienceEnhancement"
    style="width: 30px; height: 30px; display: none"
    >
    <rect width="30" height="30" fill="rgb(252, 186, 3)"></rect>
    <rect
        id="scienceEnhancement_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0"
    ></rect>

    <g transform="translate(4,4) scale(0.5,0.5)" fill="#000000">
        <path
        d="M43.183,37.582L31.209,15.429V2.232C31.209,0.99,30.17,0,28.929,0H16.707c-1.242,0-2.264,0.99-2.264,2.232v13.197 L2.459,37.582c-0.914,1.689-0.868,3.74,0.115,5.391c0.983,1.649,2.766,2.668,4.686,2.668h31.115c1.92,0,3.707-1.019,4.69-2.668 C44.047,41.322,44.097,39.271,43.183,37.582z M24.797,28.314c1.073,0,1.942,0.869,1.942,1.942c0,1.072-0.871,1.942-1.942,1.942 c-1.072,0-1.942-0.87-1.942-1.942C22.855,29.186,23.724,28.314,24.797,28.314z M19.336,16.637c1.073,0,1.942,0.87,1.942,1.943 c0,1.072-0.869,1.942-1.942,-6c-1.073,0-1.942-0.87-1.942-1.942C17.395,17.507,18.263,16.637,19.336,16.637z M 19,23.417 c1.738,0,3.148,1.41,3.148,3.147c0,1.738-1.41,3.147-3.148,3.147c-1.739,0-3.148-1.409-3.148-3.147S17.597,23.417,19.336,23.417z M37.414,39.562c-0.404,0.688-1.143,1.094-1.938,1.094H10.159c-0.796,0-1.534-0.406-1.938-1.094 c-0.404-0.688-0.415-1.528-0.028-2.226l3.043-5.47c0.434-0.782,1.29-1.23,2.18-1.145c4.041,0.385,8.583,3.842,12.642,3.688 c2.174-0.083,4.192-0.875,6.114-1.934c1.085-0.6,2.45-0.207,3.052,0.877l2.219,3.982z"
        />
    </g>

    <text
        id="scienceEnhancement_amount"
        x="28"
        y="28"
        fill="white"
        style="font-family: calibri; font-size: 11px"
        text-anchor="end"
    ></text>
    </svg>

    <svg id="polarPower" style="width: 30px; height: 30px; display: none">
    <rect width="30" height="30" fill="rgb(100,200,255)"></rect>
    <rect
        id="polarPower_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0"
    ></rect>

    <text
        id="polarPower_amount"
        x="28"
        y="28"
        style="font-family: calibri; font-size: 11px"
        text-anchor="end"
    ></text>

    <path
        fill="rgb(0,0,0,0)"
        stroke="black"
        stroke-width="2.5"
        d="M10 8C8 18 22 18 20 8M15 8 15 25"
    ></path>
    </svg>

    <svg
    id="comfortingNectar"
    style="width: 30px; height: 30px; display: none"
    >
    <rect width="30" height="30" fill="rgb(122,153,174)"></rect>
    <rect
        id="comfortingNectar_cooldown"
        width="30"
        height="0"
        style="fill: rgb(0, 0, 0)"
        opacity="0.45"
    ></rect>

    <path
        fill="rgb(175, 218, 248)"
        d="M 22 26C -2 39 0 -1 19 8C 13 5 5 25 22 24"
        transform="translate(5,2) scale(0.8,0.75)"
    ></path>

    <text
        id="comfortingNectar_amount"
        x="28"
        y="28"
        style="font-family: calibri; font-size: 11px"
        text-anchor="end"
    ></text>
    </svg>

 


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
