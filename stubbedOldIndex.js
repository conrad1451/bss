//  handled in gameState/triggers
let triggers = {
  // CHQ: This is a stub
};

//  handled in data/devTriggers.js
if (testRealm) {
  // CHQ: This is a stub
}

let hoverText = document.getElementById("hoverText");

//  handled in data/bees.js
let beeInfo = {
  // CHQ: This is a stub
};

//  handleed in data/effects
let effects = {
  // CHQ: This is a stub
};

let LIST_OF_STATS_FOR_PLAYER = [];

for (let i in effects) {
  if (effects[i].statsToAddTo) {
    for (let j in effects[i].statsToAddTo) {
      if (LIST_OF_STATS_FOR_PLAYER.indexOf(effects[i].statsToAddTo[j]) < 0) {
        LIST_OF_STATS_FOR_PLAYER.push(effects[i].statsToAddTo[j]);
      }
    }
  }

  if (!effects[i].svg) {
    continue;
  }

  effects[i].svg.addEventListener("mousemove", function (e) {
    hoverText.style.display = "block";
    hoverText.style.left = e.x + 10 + "px";
    hoverText.style.top = e.y + 10 + "px";
    hoverText.style.bottom = "";
    hoverText.style.right = "";

    let index;

    for (let j in player.effects) {
      if (player.effects[j].type === i) {
        index = j;
        break;
      }
    }

    let m = effects[i].getMessage(player.effects[index].amount, "\n"),
      _i = m.indexOf("\n");

    if (!effects[i].amountFromCooldown && player.effects[index].amount !== 1)
      m =
        m.substr(0, _i) +
        " (x" +
        player.effects[index].amount +
        ")" +
        m.substr(_i, m.length);

    hoverText.innerText =
      m +
      "\n" +
      (effects[i].isPassive ||
      effects[i].maxCooldown === 0 ||
      effects[i].maxCooldown === Infinity
        ? ""
        : MATH.doTime((player.effects[index].cooldown | 0).toString()));
  });

  effects[i].svg.addEventListener("mouseleave", function () {
    hoverText.style.display = "none";
  });
}

let toolParticle = 0;

// CHQ: For the restrictions to ensure that the player has at least enough treats to feed the bees with the amount they are specifying
let howManyToFeed = document.getElementById("howManyToFeed"),
  howManyMessage = document.getElementById("howManyMessage"),
  feedAmount = document.getElementById("feedAmount");

//  handled in data/items.js
let items = {
  // CHQ: This is a stub
};

// CHQ: code here moved to implementation moved to ui/beeEggUI.js
// for (let i in beeInfo) {...}
     
for (let i in items) {
  items[i].maxCooldown = items[i].cooldown || 0;
  items[i].cooldown = -Infinity;

  if (i !== "honey") {
    items[i].svg = document.getElementById(i);
    items[i].amountText = document.getElementById(i + "_amount");
    items[i].svg.onmousedown = function (e) {
      if (player.itemDragging === i) {
        player.itemDragging = false;
      } else {
        player.itemDragging = i;
      }
    };
  }
}

let beequips = {
  pencil: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Pencil</text><text x='132' y='33' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>A special pencil only</text><text x='132' y='46' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>for the smartest of</text><text x='132' y='59' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>bees(and people).</text><text style=''></text><g transform='scale(0.9,0.9) rotate(20) translate(12,-15)'><rect x='34' y='16' width='7' height='40' stroke='black' stroke-width='2' fill='rgb(86, 252, 136)'></rect><rect x='34' y='15' width='7' height='7' stroke='black' stroke-width='2' fill='rgb(250, 110, 147)'></rect><rect x='34' y='20' width='7' height='4' stroke='black' stroke-width='2' fill='rgb(170,170,170)'></rect><path stroke='black' stroke-width='2' fill='rgb(214, 193, 101)' d='M 34 57 L 41 57L 37.5 65z'></path><rect x='36.6' y='61' width='1' height='1' stroke='black' stroke-width='2' fill='rgb(0,0,0)'></rect></g></svg>`,
    potentials: [1, 2, 2, 2, 3],
    level: 4,
    color: "blue",
    reqStr: "<br><br><br><br>",
    canUseOnSlot: function (slot) {
      return slot.type;
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      b += "*" + MATH.random(0.92, 0.98).toFixed(2) + " abilityRate(+0),";

      if (Math.random() < np * 0.85) {
        b +=
          "*" + MATH.random(1.1, np * 0.35 + 1).toFixed(2) + " maxEnergy(+0),";
      }

      if (Math.random() < np * 0.35) {
        b += "+" + (MATH.random(3, 10) | 0) + " convertAmount(+0),";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },

    extraAbility: "gathering_focus",
  },

  bobertPlushie: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Bobert Plushie</text><text x='132' y='33' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>A slightly deformed</text><text x='132' y='46' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>plushie. It loves to</text><text x='132' y='59' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>terrorize bees and you.</text><text style=''></text><circle cx='38' cy='38' r='20' fill='black'></circle><circle cx='35' cy='35' r='20' fill='black'></circle><circle cx='38' cy='38' r='18' fill='rgb(207, 162, 48)'></circle><circle cx='35' cy='35' r='18' fill='rgb(255, 203, 61)'></circle><circle cx='28' cy='28' r='1.5' fill='black'></circle><circle cx='41' cy='28' r='1.5' fill='black'></circle><path fill='rgb(0,0,0,0)' stroke='black' stroke-width='1' d='M 42 37 C 41 39 30 41 29 37'></path><rect fill='white' x='35' y='39' width='3' height='4' stroke='black' stroke-width='1'></rect></svg>`,
    potentials: [1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4],
    level: 5,
    color: "white",
    reqStr: "<br><br><br><br>",
    canUseOnSlot: function (slot) {
      return slot.type;
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      b +=
        "+" + (MATH.random(1, potential * 2 + 5) | 0) + " convertAmount(+0),";
      b += "+" + (MATH.random(1, potential * 2 + 5) | 0) + " gatherAmount(+0),";

      if (Math.random() < 0.35) {
        b += "+1 attack(+0),";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },
  },

  boombox: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Boombox</text><text x='132' y='31' style='font-family:trebuchet ms;font-size:10px;' fill='rgb(0,0,0)' text-anchor='middle'>Energize and motivate your</text><text x='132' y='43' style='font-family:trebuchet ms;font-size:9.9px;' fill='rgb(0,0,0)' text-anchor='middle'>bees with upbeat musical</text><text x='132' y='54' style='font-family:trebuchet ms;font-size:10px;' fill='rgb(0,0,0)' text-anchor='middle'>hits by Bee Gees or</text><text x='133' y='65' style='font-family:trebuchet ms;font-size:9.7px;' fill='rgb(0,0,0)' text-anchor='middle'>Beethoven!</text><text style=''></text><rect x='26' y='23' width='20' height='22' rx='6' stroke='rgb(0,170,0)' stroke-width='3.5' fill='rgb(0,0,0,0)'></rect>
    <rect x='19' y='30' width='35' height='20' rx='4' stroke='black' stroke-width='1.5' fill='rgb(19, 93, 212)'></rect>
    <circle cx='30' cy='38' r='5' stroke='black' stroke-width='1' fill='rgb(251, 255, 0)'></circle>
    <circle cx='45' cy='38' r='5' stroke='black' stroke-width='1' fill='rgb(251, 255, 0)'></circle>
    <circle cx='30' cy='38' r='1.5' fill='rgb(0, 0, 0)'></circle>
    <circle cx='45' cy='38' r='1.5' fill='rgb(0, 0, 0)'></circle>
    <rect x='32' y='45' width='5' height='3' fill='rgb(255,0,255)'></rect><rect x='39' y='45' width='5' height='3' fill='rgb(255,0,0)'></rect></svg>`,
    potentials: [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4],
    level: 7,
    color: "any",
    reqStr:
      "<br><br><p style='font-size:13px;font-family:comic sans ms;'>Only For: Hasty, Cool, Looker, Exhausted, Riley, Shy, and Buoyant Bee</p><br>",
    canUseOnSlot: function (slot) {
      return (
        [
          "hasty",
          "cool",
          "looker",
          "exhausted",
          "riley",
          "shy",
          "buoyant",
        ].indexOf(slot.type) > -1
      );
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      b +=
        "*" +
        (MATH.random(0.9, 0.96) * (np * 0.1 + 1)).toFixed(2) +
        " abilityRate(+0),";

      b +=
        "*" + MATH.random(1.01, np * 0.15 + 1).toFixed(2) + " maxEnergy(+0),";
      b += "*" + MATH.random(0.95, 1.05).toFixed(2) + " speed(+0),";

      if (Math.random() < np * 0.35) {
        p +=
          "*" +
          (MATH.random(1.01, 1.04) * (np * 0.01 + 1)).toFixed(2) +
          " convertRate(+0)";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },

    extraAbility: "gathering_melody",
  },

  candycane: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Candy Cane</text><text x='132' y='31' style='font-family:trebuchet ms;font-size:10px;' fill='rgb(0,0,0)' text-anchor='middle'>This stick of candy causes</text><text x='132' y='43' style='font-family:trebuchet ms;font-size:9.9px;' fill='rgb(0,0,0)' text-anchor='middle'>dramatic bee hyperactivity,</text><text x='132' y='54' style='font-family:trebuchet ms;font-size:10px;' fill='rgb(0,0,0)' text-anchor='middle'>sticks to pollen, and turns</text><text x='133' y='65' style='font-family:trebuchet ms;font-size:9.7px;' fill='rgb(0,0,0)' text-anchor='middle'>into a sharp, deadly weapon.</text><text style=''></text><defs><linearGradient id='candyStripes' x1='0' y1='0' x2='1' y2='-0.1'><stop offset='10%' stop-color='rgb(255,0,0)'/><stop offset='10%' stop-color='rgb(255,255,225)'/><stop offset='20%' stop-color='rgb(255,255,225)'/><stop offset='20%' stop-color='rgb(255,0,0)'/><stop offset='30%' stop-color='rgb(255,0,0)'/><stop offset='30%' stop-color='rgb(255,255,225)'/><stop offset='40%' stop-color='rgb(255,255,225)'/><stop offset='40%' stop-color='rgb(255,0,0)'/><stop offset='50%' stop-color='rgb(255,0,0)'/><stop offset='50%' stop-color='rgb(255,255,225)'/><stop offset='60%' stop-color='rgb(255,255,225)'/><stop offset='60%' stop-color='rgb(255,0,0)'/><stop offset='70%' stop-color='rgb(255,0,0)'/><stop offset='70%' stop-color='rgb(255,255,225)'/><stop offset='80%' stop-color='rgb(255,255,225)'/><stop offset='80%' stop-color='rgb(255,0,0)'/><stop offset='90%' stop-color='rgb(255,0,0)'/><stop offset='90%' stop-color='rgb(255,255,225)'/></linearGradient></defs><path fill='url(#candyStripes)' stroke='black' stroke-width='1' d='M-14 7L10 6C15 6 15 -5 10 -5L 8 -3C12 -3 12 3 8 3z' transform='translate(32,34) scale(1.75,1.75) rotate(-19.2)'></path></svg>`,
    potentials: [1, 2, 2, 4, 3, 3, 3, 3, 3],
    level: 8,
    color: "red",
    reqStr: "<br><br><br><br>",
    canUseOnSlot: function (slot) {
      return slot.type;
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      if (Math.random() < np) {
        b +=
          "+" +
          ((MATH.random(2, 6) * (np * 0.15 + 1)) | 0) +
          " gatherAmount(+0),";
      }

      if (Math.random() < np * 0.65) {
        b += "*1.05 abilityRate(+0),";
      }

      b +=
        "*" +
        (MATH.random(1.05, 1.1) * (np * 0.1 + 1)).toFixed(2) +
        " attack(+0),";
      b += "*" + MATH.random(0.8, 0.95).toFixed(2) + " maxEnergy(+0),";
      b +=
        "*" +
        (MATH.random(1.05, 1.1) * (np * 0.05 + 1)).toFixed(2) +
        " speed(+0),";

      if (Math.random() < np * 0.5) {
        p +=
          "*" +
          (MATH.random(1.01, 1.04) * (np * 0.01 + 1)).toFixed(2) +
          " beeSpeed(+0),";
      }

      if (Math.random() < np * 0.5) {
        p += "*" + MATH.random(1.01, 1.03).toFixed(2) + " redPollen(+0),";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },
  },

  books: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Books</text><text x='132' y='33' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>A set of books for</text><text x='132' y='46' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>bees to read. Improves</text><text x='132' y='59' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>the performance of bees.</text><text style=''></text><g transform='rotate(-15) translate(-30,-5)'><rect fill='rgb(242, 141, 119)' x='35' y='35' width='20' height='27' stroke='black' stroke-width='1.5' rx='2'></rect><path fill='rgb(0,0,0,0)' stroke='rgb(222, 199, 151)' stroke-width='7' d='M 35 47C 41 45 47 42 47 35'></path><path fill='rgb(0,0,0,0)' stroke='rgb(207, 119, 101)' stroke-width='2' d='M 38 47L 39 44L 43 44L 43 40L 48 40L 43 40'></path></g><g transform='rotate(20) translate(12,-27)'><rect fill='rgb(217, 159, 0)' x='35' y='35' width='20' height='27' stroke='black' stroke-width='1.5' rx='2'></rect><path fill='rgb(0,0,0,0)' stroke='rgb(0,0,0,0.1)' stroke-width='4' d='M 40 63L 45 47L 50 63'></path><path fill='rgb(0,0,0,0)' stroke='rgb(0,0,0,0.15)' stroke-width='1.5' d='M 39 42L 42 39L 44 41L 47 39L 51 42'></path></g></svg>`,
    potentials: [1, 2, 3, 3, 3, 4, 5],
    level: 9,
    color: "any",
    reqStr:
      "<br><br><p style='font-size:13px;font-family:comic sans ms;'>Bee must know a Mark ability.</p><br>",
    canUseOnSlot: function (slot) {
      return (
        (slot.type &&
          beeInfo[slot.type].tokens.join("").indexOf("Mark") > -1) ||
        slot.type === "precise"
      );
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      b +=
        "*" +
        (MATH.random(0.89, 0.95) * (np * 0.1 + 1)).toFixed(2) +
        " abilityRate(+0),";

      b +=
        "*" +
        (MATH.random(1.03, 1.09) * (np * 0.1 + 1)).toFixed(2) +
        " maxEnergy(+0),";

      if (Math.random() < 0.4 + np * 0.2) {
        p +=
          "*" +
          (MATH.random(1.02, 1.06) * (np * 0.01 + 1)).toFixed(2) +
          " pollenFromBees(+0),";
      }

      if (Math.random() < 0.4 + np * 0.2) {
        p +=
          "*" +
          (MATH.random(1.02, 1.06) * (np * 0.01 + 1)).toFixed(2) +
          " pollenFromTools(+0),";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },

    extraAbility: "gathering_inspire",
  },

  coffeeMug: {
    svgCode: `<svg onmousedown='window.functionToRunOnBeequipClick(#ID)' style='width:200px;height:70px;cursor:pointer;border-radius:8px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='15' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>Coffee Mug</text><text x='132' y='33' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>Bees drink *whatever*</text><text x='132' y='46' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>is in this coffee mug</text><text x='132' y='59' style='font-family:trebuchet ms;font-size:11px;' fill='rgb(0,0,0)' text-anchor='middle'>for a boost of energy!</text><text style=''></text><path d='M20 45C20 55 50 55 50 45C65 45 65 20 50 20C50 10 20 10 20 20Z' fill='rgb(255,255,255)' stroke='rgb(0,0,0)' stroke-width='1.5' transform='translate(0,3)'></path><path d='M50 40 C 60 40 60 25 50 25M50 40 L 50 25' fill='rgb(225,225,225)' stroke='rgb(0,0,0)' stroke-width='1.5' transform='translate(0,3)'></path><path d='M50 20C50 25 20 25 20 20' fill='rgb(0,0,0,0)' stroke='rgb(0,0,0)' stroke-width='1.5' transform='translate(0,3)'></path><circle cx='35' cy='53' r='8' fill='rgb(0,0,0,0.2)' transform='scale(1,0.4)'></circle><path d='M 27 36L 30 40L 33 37L 35 41L 38 36L 42 42' fill='rgb(0,0,0,0)' stroke='rgb(0,0,0,0.7)' stroke-width='1.5'></path></svg>`,
    potentials: [2, 2, 3, 3, 3, 4, 4, 5],
    level: 10,
    color: "any",
    reqStr:
      "<br><br><p style='font-size:13px;font-family:comic sans ms;'>Only For: Gifted Bees</p><br>",
    canUseOnSlot: function (slot) {
      return slot.type && slot.gifted;
    },

    generateStats: function (potential) {
      let b = "",
        p = "",
        np = potential / 5;

      if (Math.random() < np) {
        b +=
          "*" +
          ((MATH.random(1, 1.1) * (np * 0.1 + 1)) | 0) +
          " gatherAmount(+0),";
      }

      if (Math.random() < np * 0.65) {
        b +=
          "*" +
          (MATH.random(1.01, 1.05) * (np * 0.07 + 1)).toFixed(2) +
          " abilityRate(+0),";
      }

      b += "*" + MATH.random(1.05, 1.1).toFixed(2) + " maxEnergy(+0),";
      b +=
        "*" +
        (MATH.random(1.01, 1.07) * (np * 0.07 + 1)).toFixed(2) +
        " speed(+0),";

      if (Math.random() < np * 0.75) {
        p += "*" + MATH.random(1.02, 1.05).toFixed(2) + " convertRate(+0),";
      }

      if (Math.random() < np * 0.4 + 0.2) {
        p += "*1.305 lootLuck(+0),";
      }

      return {
        bee: b[b.length - 1] === "," ? b.substr(0, b.length - 1) : b,
        player: p[p.length - 1] === "," ? p.substr(0, p.length - 1) : p,
      };
    },

    extraAbility: "gathering_link",
  },
};

let COLORS = {
  blue: "rgb(20,84,186)",
  red: "rgb(255,0,0)",
  white: "rgb(255,255,255)",
  blueArr: [20, 84, 186],
  redArr: [255, 0, 0],
  whiteArr: [255, 255, 255],
  honey: [255, 226, 8],
  honey_normalized: [1, 226 / 255, 8 / 255],
  bondArr: [240, 72, 218],
};

let objects = {
    tokens: [],
    bees: [],
    tempBees: [],
    explosions: [],
    flames: [],
    bubbles: [],
    marks: [],
    balloons: [],
    mobs: [],
    targets: [],
    triangulates: [],
    fuzzBombs: [],
    planters: [],
  },
  meshes = {
    tokens: {
      instanceBuffer: gl.createBuffer(),
      instanceData: [],
    },

    bees: {
      instanceBuffer: gl.createBuffer(),
      instanceData: [],
    },

    explosions: {
      instanceBuffer: gl.createBuffer(),
      instanceData: [],
    },

    cylinder_explosions: {
      instanceBuffer: gl.createBuffer(),
      instanceData: [],
    },
  };

// classes Bee, TempBee, and other classes for objects
// already exist in entities folder

// Triangulate,

// BugMob, CoconutCrab, Mechsquito, CogMower, CogTurret are moved to separate modules

// as well as DarkScoopingTrail, Spike, GlitchEffect, JellyBean, Sprout, Puffshroom, Spore, FetchBall, Planter, Tornado, Cloud, FireTrail

let lightDir = [1, 5, 1.5];

let m =
  1 /
  (lightDir[0] * lightDir[0] +
    lightDir[1] * lightDir[1] +
    lightDir[2] * lightDir[2]);

lightDir[0] *= m;
lightDir[1] *= m;
lightDir[2] *= m;

let hash = (function () {
  let seed = (Math.random() * 2100000000) | 0;
  let PRIME32_2 = 1883677709;
  let PRIME32_3 = 2034071983;
  let PRIME32_4 = 668265263;
  let PRIME32_5 = 374761393;

  seedHash = function (s) {
    seed = s | 0;
  };

  return function (x, y) {
    let h32 = 0;

    h32 = (seed + PRIME32_5) | 0;
    h32 += 8;

    h32 += Math.imul(x, PRIME32_3);
    h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);
    h32 += Math.imul(y, PRIME32_3);
    h32 = Math.imul((h32 << 17) | (h32 >> (32 - 17)), PRIME32_4);

    h32 ^= h32 >> 15;
    h32 *= PRIME32_2;
    h32 ^= h32 >> 13;
    h32 *= PRIME32_3;
    h32 ^= h32 >> 16;

    return h32 / 2147483647;
  };
})();

let currentRandom = null;
function Marsaglia(i1, i2) {
  // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
  let z = i1 | 0 || 362436069,
    w = i2 || (hash(521288629, z) * 2147483647) | 0;

  let nextInt = function () {
    z = (36969 * (z & 65535) + (z >>> 16)) & 0xffffffff;
    w = (18000 * (w & 65535) + (w >>> 16)) & 0xffffffff;
    return (((z & 0xffff) << 16) | (w & 0xffff)) & 0xffffffff;
  };

  this.nextDouble = function () {
    let i = nextInt() / 4294967296;
    return i < 0 ? 1 + i : i;
  };
  this.nextInt = nextInt;
}
let randomSeed = function (seed) {
  currentRandom = new Marsaglia(seed).nextDouble;
};
let random = function (min, max) {
  if (!max) {
    if (min) {
      max = min;
      min = 0;
    } else {
      min = 0;
      max = 1;
    }
  }
  return currentRandom() * (max - min) + min;
};
let noiseProfile = {
  generator: undefined,
  octaves: 4,
  fallout: 0.5,
  seed: undefined,
};
function PerlinNoise(seed) {
  let rnd =
    seed !== undefined ? new Marsaglia(seed) : Marsaglia.createRandomized();
  let i, j;
  // http://www.noisemachine.com/talk1/17b.html
  // http://mrl.nyu.edu/~perlin/noise/
  // generate permutation
  let perm = new Uint8Array(512);
  for (i = 0; i < 256; ++i) {
    perm[i] = i;
  }
  for (i = 0; i < 256; ++i) {
    let t = perm[(j = rnd.nextInt() & 0xff)];
    perm[j] = perm[i];
    perm[i] = t;
  }
  // copy to avoid taking mod in perm[0]
  for (i = 0; i < 256; ++i) {
    perm[i + 256] = perm[i];
  }

  function grad3d(i, x, y, z) {
    let h = i & 15; // convert into 12 gradient directions
    let u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function grad2d(i, x, y) {
    let v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }

  function grad1d(i, x) {
    return (i & 1) === 0 ? -x : x;
  }

  function lerp(t, a, b) {
    return a + t * (b - a);
  }

  this.noise3d = function (x, y, z) {
    let X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255,
      Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    let fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y,
      fz = (3 - 2 * z) * z * z;
    let p0 = perm[X] + Y,
      p00 = perm[p0] + Z,
      p01 = perm[p0 + 1] + Z,
      p1 = perm[X + 1] + Y,
      p10 = perm[p1] + Z,
      p11 = perm[p1 + 1] + Z;
    return lerp(
      fz,
      lerp(
        fy,
        lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x - 1, y, z)),
        lerp(
          fx,
          grad3d(perm[p01], x, y - 1, z),
          grad3d(perm[p11], x - 1, y - 1, z),
        ),
      ),
      lerp(
        fy,
        lerp(
          fx,
          grad3d(perm[p00 + 1], x, y, z - 1),
          grad3d(perm[p10 + 1], x - 1, y, z - 1),
        ),
        lerp(
          fx,
          grad3d(perm[p01 + 1], x, y - 1, z - 1),
          grad3d(perm[p11 + 1], x - 1, y - 1, z - 1),
        ),
      ),
    );
  };

  this.noise2d = function (x, y) {
    let X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    let fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y;
    let p0 = perm[X] + Y,
      p1 = perm[X + 1] + Y;
    return lerp(
      fy,
      lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)),
      lerp(
        fx,
        grad2d(perm[p0 + 1], x, y - 1),
        grad2d(perm[p1 + 1], x - 1, y - 1),
      ),
    );
  };

  this.noise1d = function (x) {
    let X = Math.floor(x) & 255;
    x -= Math.floor(x);
    let fx = (3 - 2 * x) * x * x;
    return lerp(fx, grad1d(perm[X], x), grad1d(perm[X + 1], x - 1));
  };
}
let noiseSeed = function (seed) {
  noiseProfile.seed = seed;
  noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
};

noiseSeed(0);

let noise = function (x, y, z) {
  let generator = noiseProfile.generator;
  let effect = 1,
    k = 1,
    sum = 0;
  for (let i = 0; i < noiseProfile.octaves; ++i) {
    effect *= noiseProfile.fallout;
    switch (arguments.length) {
      case 1:
        sum += (effect * (1 + generator.noise1d(k * x))) / 2;
        break;
      case 2:
        sum += (effect * (1 + generator.noise2d(k * x, k * y))) / 2;
        break;
      case 3:
        sum += (effect * (1 + generator.noise3d(k * x, k * y, k * z))) / 2;
        break;
    }
    k *= 2;
  }
  return sum;
};


// initGlCache replaced by this.initCache in renderer.js

// CHQ: here the function createProgram() was called, used to be the code to 
// Iterates over every entry in the shader dictionary and compile a linked 
// WebGL program for each render pass. it was moved to renderer.js

// let initGlCache = function (glCache){...}

// let glCache = initGlCache({}),
  globalMeshID = 0;

  // the Mesh class used to be called here before being moved 

    let textures=(function(out){
        
        tex_ctx.clearRect(0,0,2048,2048)
        
        for(let i=0;i<10;i++){
            
            tex_ctx.fillStyle='rgba(0,0,0,'+Math.random()*0.2+')'
            tex_ctx.fillRect(MATH.random(12,500),MATH.random(12,500),MATH.random(25,45),MATH.random(25,45))

            tex_ctx.fillStyle='rgba(0,0,0,0.015)'

            tex_ctx.translate(MATH.random(12,500),MATH.random(12,500))
            tex_ctx.scale((Math.random()+0.5)*3,(Math.random()+0.5)*3)
            tex_ctx.rotate(Math.random()*6.28)
            tex_ctx.fillText('คาร์ลสันไม่เคยตาย',0,0)
            tex_ctx.setTransform(1,0,0,1,0,0)

            
            tex_ctx.translate(MATH.random(12,500),MATH.random(12,500))
            tex_ctx.scale((Math.random()+0.5)*3,(Math.random()+0.5)*3)
            tex_ctx.rotate(Math.random()*6.28)
            tex_ctx.fillText('ดาท เป็นเจ๋งคนมาก',0,0)
            tex_ctx.setTransform(1,0,0,1,0,0)
        }

        
        out.default=gl.createTexture()
        
        gl.bindTexture(gl.TEXTURE_2D,out.default)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,512,512,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,512,512))
        
        gl.generateMipmap(gl.TEXTURE_2D)
        
        window.textures_effects(tex_ctx)
        out.effects=gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D,out.effects)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,2048,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,2048,2048))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(gl.TEXTURE_2D)

        window.textures_flowers(tex_ctx)
        out.flowers=gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D,out.flowers)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,1024,1024))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.generateMipmap(gl.TEXTURE_2D)
        
        
        tex_ctx.clearRect(0,0,512,600)
        tex_ctx.font='bold 60px arial'
        tex_ctx.fillStyle='rgb(255,255,255)'
        tex_ctx.strokeStyle='rgb(0,0,0)'
        tex_ctx.lineWidth=9
        tex_ctx.textAlign='center'
        tex_ctx.textBaseline='middle'
        
        function t(m,x,y){tex_ctx.strokeText(m,x,y);tex_ctx.fillText(m,x,y)}
        
        for(let i=0;i<10;i++){
            
            t(i,i*50+30,40)
        }
        
        let chars='+⇆,/-:()%.'
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115)
        }
        
        chars='abcdefghij'
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75)
        }
        
        chars='klmnopqrst'
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75*2)
        }
        
        chars='uvwxyz'
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75*3)
        }
        
        chars='abcdefghij'.toUpperCase()
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75*4)
        }
        
        chars='klmnopqrst'.toUpperCase()
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75*5)
        }
        
        chars='uvwxyz'.toUpperCase()
        
        for(let i=0;i<chars.length;i++){
            
            t(chars[i],i*50+30,115+75*6)
        }
        
        tex_ctx.clearRect(110,438.5,43,21)
        
        out.text=gl.createTexture()
        
        gl.bindTexture(gl.TEXTURE_2D,out.text)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,512,600,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,512,600))
        gl.generateMipmap(gl.TEXTURE_2D)
        
        window.textures_bees(tex_ctx)
        let data=tex_ctx.getImageData(0,0,2048,2048)
        out.bees=gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D,out.bees)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,2048,0,gl.RGBA,gl.UNSIGNED_BYTE,data)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(gl.TEXTURE_2D)
        beeCanvas=document.createElement('canvas')
        beeCanvas.width=2048
        beeCanvas.height=2048
        let beeCanvasCtx=beeCanvas.getContext('2d')
        beeCanvasCtx.putImageData(data,0,0)
        
        window.textures_decals(tex_ctx)
        out.decals=gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D,out.decals)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,1024,1024))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(gl.TEXTURE_2D)
                
        out.bear=gl.createTexture()
        window.textures_bear(tex_ctx)
        gl.bindTexture(gl.TEXTURE_2D,out.bear)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,tex_ctx.getImageData(0,0,1024,1024))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(gl.TEXTURE_2D)
        
        return out
        
    })({})

    let dialogueBox=document.getElementById('dialogueBox'),
        NPCName=document.getElementById('NPCName'),
        NPCDialogue=document.getElementById('NPCDialogue'),
        actionWarning=document.getElementById('actionWarning'),
        actionName=document.getElementById('actionName'),
        actionNameBox=document.getElementById('actionNameBox'),
        shopUI=document.getElementById('shopUI'),
        leftShopButton=document.getElementById('leftShopButton'),
        rightShopButton=document.getElementById('rightShopButton'),
        itemName=document.getElementById('itemName'),
        itemDesc=document.getElementById('itemDesc'),
        itemCostSVG=document.getElementById('itemCostSVG')

    let playerMesh=new Mesh(false)

    let shopGearMesh=new Mesh(false)

    let gear=window.playerGear

    gear.tool={
        
        shovel:{
            
            collectPattern:[[0,0],[0,-1]],
            collectAmount:2,
            cooldown:0.8,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0,0.6,0.1,0.1,0.8,false,[0.5,0.2,0])
                box(-0.3,0,1.2,0.3,0.1,0.4,false,[0.2,0.2,0.2])
            },
            desc:'A trusty shovel.<br><br>Collects 5 pollen from 2 flowers every 1s.',
            cost:['0 honey']
        },

        rake:{
            
            collectPattern:[[0,0],[0,-1],[0,-2]],
            collectAmount:2,
            cooldown:0.7,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0,0.6,0.1,0.105,0.8,false,[0.9,0.9,0.9])
                box(-0.3+0.1,0,0.6+0.6,0.1,0.1,0.5,[0,20,0],[0.4,0.4,0.4])
                box(-0.3+0.2,0,0.6+0.5,0.1,0.1,0.5,[0,40,0],[0.4,0.4,0.4])
                box(-0.3-0.1,0,0.6+0.6,0.1,0.1,0.5,[0,-20,0],[0.4,0.4,0.4])
                box(-0.3-0.2,0,0.6+0.5,0.1,0.1,0.5,[0,-40,0],[0.4,0.4,0.4])
                box(-0.3,0,0.6+0.65,0.1,0.1,0.4,false,[0.4,0.4,0.4])
            },
            desc:'A small gardening rake.<br><br>Collects 2 pollen from 3 flowers every 0.7s.',
            cost:['800 honey']
        },

        clippers:{
            
            collectPattern:[[0,0]],
            collectAmount:9,
            cooldown:0.6,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.2-0.15,-0.15,0.4,0.25,0.25,0.1,[0,0,-30],[1.3,1.3,0])
                box(-0.2+0.15,-0.15,0.4,0.25,0.25,0.1,[0,0,30],[1.3,1.3,0])
                box(-0.2+0.15-Math.sin(30*MATH.TO_RAD)*0.41,-0.15+Math.cos(30*MATH.TO_RAD)*0.41,0.4,0.1,0.6,0.1,[0,0,30],[1.3,1.3,1.3])
                box(-0.2-0.15+Math.sin(30*MATH.TO_RAD)*0.41,-0.15+Math.cos(30*MATH.TO_RAD)*0.41,0.4,0.1,0.6,0.1,[0,0,-30],[1.3,1.3,1.3])
            },
            desc:'A little pair of yellow clippers.<br><br>Collects 9 pollen from 1 flowers every 0.6s.',
            cost:['2200 honey']
        },

        magnet:{
            
            collectPattern:[[0,0],[0,-1],[0,1],[-1,0],[1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
            collectAmount:2,
            cooldown:0.8,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,-0.25,0.5,0.2,0.6,0.2,false,[0.8,0.8,0.8])
                box(-0.3,0.15,0.5,0.6,0.2,0.2,false,[1,0,0])
                box(-0.3-0.3,0.3,0.5,0.2,0.5,0.2,false,[1,0,0])
                box(-0.3+0.3,0.3,0.5,0.2,0.5,0.2,false,[1,0,0])
                box(-0.3-0.3,0.5,0.5,0.19,0.5,0.19,false,[1,1,1])
                box(-0.3+0.3,0.5,0.5,0.19,0.5,0.19,false,[1,1,1])
            },
            desc:'A big magnet that somehow picks up pollen particles.<br><br>Collects 2 pollen from 9 flowers every 0.8s.',
            cost:['5500 honey']
        },

        vacuum:{
            
            collectPattern:[[0,0],[0,-1],[0,1],[-1,0],[1,0],[1,1],[1,-1],[-1,1],[-1,-1],[0,-2],[2,0],[0,2],[-2,0]],
            collectAmount:2,
            cooldown:0.8,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0,0.65,0.1,0.8,0.1,[-20,0,0],[0.8,0.8,0.8])
                box(-0.3,-0.1,0.5,0.3,0.6,0.25,[-20,0,0],[1,0.7,0.4])
                box(-0.3,-0.3,0.7,0.4,0.3,0.3,false,[0.2,0.2,0.2])
                box(-0.3-0.1,-0.3,0.7,0.075,0.075,0.31,false,[1.4,1.4,0])
                box(-0.3+0.1,-0.3,0.7,0.075,0.075,0.31,false,[1.4,1.4,0])
            },
            desc:'A handy house-hold vacuum cleaner.<br><br>Collects 2 pollen from 13 flowers every 0.8s.',
            cost:['14000 honey']
        },

        superScooper:{
            
            collectPattern:[[0,0],[0,-1],[0,-2],[0,-3],[0,-4]],
            collectAmount:4,
            cooldown:0.5,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0,0.4,0.175,0.175,0.2,false,[1.5,1.5,0])
                box(-0.3,0,0.6,0.175,0.175,0.2,false,[0,0,1.5])
                box(-0.3,0,0.8,0.175,0.175,0.2,false,[1.5,1.5,0])
                box(-0.3,0,1,0.175,0.175,0.2,false,[0,0,1.5])
                box(-0.3,0,1.2,0.15,0.15,0.2,false,[0.6,0.4,0.1])
                box(-0.3+0.3*0.5,0,1.55,0.3,0.175,0.65,false,[1.5,1.5,0])
                box(-0.3-0.3*0.5,0,1.55,0.3,0.175,0.65,false,[0,0,1.5])
            },
            desc:'A massive toy scooper useful for pollen collection.<br><br>Collects 4 pollen from 5 flowers every 0.5s.',
            cost:['40000 honey']
        },

        pulsar:{
            
            collectPattern:[[0,0],[0,-1],[0,1],[-1,0],[1,0],[1,1],[1,-1],[-1,1],[-1,-1],[0,-2],[2,0],[0,2],[-2,0],[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2],[0,-3],[0,3],[-3,0],[3,0],[-2,2],[2,2],[-2,-2],[2,-2]],
            collectAmount:2,
            cooldown:1,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.2,0.4,0.125,1.1,0.125,false,[1.5,1.5,0])
                box(-0.3,-0.2,0.4,0.175,0.3,0.175,false,[0,1.5,0])
                cylinder(-0.3,0.2+1.1*0.5+0.25,0.4,0.25,0.0005,10,0,0,0,0,0,0,0.25)
                cylinder(-0.3,0.2+1.1*0.5+0.25,0.4,0.25,0.0005,10,0,0,0,0.001,90,0,0.25)
                cylinder(-0.3,0.2+1.1*0.5+0.25,0.4,0.25,0.0005,10,0,0,0,90,0,0,0.25)

            },particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.3
                
                let x=-player.bodyDir[2],z=player.bodyDir[0]
                
                x+=player.bodyDir[0]
                z+=player.bodyDir[2]
                
                x*=0.3
                z*=0.4
                
                ParticleRenderer.add({x:player.body.position.x+x,y:player.body.position.y+0.2+1.1*0.5+0.25,z:player.body.position.z+z,vx:MATH.random(-0.3,0.3),vy:(Math.random()-0.5)*0.5,vz:MATH.random(-0.3,0.3),grav:1.5,size:MATH.random(30,70),col:[0,1,0],life:1,rotVel:MATH.random(-3,3),alpha:2})
            },
            desc:'A strange magical tool that sucks up more pollen.<br><br>Collects 2 pollen from 29 flowers every 1s.',
            cost:['125000 honey']
        },

        electroMagnet:{
            
            collectPattern:[[0,0],[0,-1],[0,1],[-1,0],[1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
            collectAmount:6,
            cooldown:0.5,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,-0.15,0.5,0.2,0.8,0.2,false,[0.8,0.8,0.8])
                box(-0.3,0.15+0.2,0.5,0.6,0.2,0.2,false,[1.4,1.4,0])
                box(-0.3-0.3,0.3+0.2,0.5,0.2,0.5,0.2,false,[1.4,1.4,0])
                box(-0.3+0.3,0.3+0.2,0.5,0.2,0.5,0.2,false,[1.4,1.4,0])
                box(-0.3-0.3,0.5+0.2,0.5,0.19,0.5,0.19,false,[1,1,1])
                box(-0.3+0.3,0.5+0.2,0.5,0.19,0.5,0.19,false,[1,1,1])
                box(-0.3,0.15+0.2,0.5,0.2,0.2,0.6,false,[1.4,1.4,0])
                box(-0.3,0.3+0.2,0.5-0.3,0.2,0.5,0.2,false,[1.4,1.4,0])
                box(-0.3,0.3+0.2,0.5+0.3,0.2,0.5,0.2,false,[1.4,1.4,0])
                box(-0.3,0.5+0.2,0.5-0.3,0.19,0.5,0.19,false,[1,1,1])
                box(-0.3,0.5+0.2,0.5+0.3,0.19,0.5,0.19,false,[1,1,1])
            },
            desc:'A upgraded magnet charged with electricity.<br><br>Collects 6 pollen from 9 flowers every 0.5s.',
            cost:['300000 honey']
        },
        
        scissors:{
            
            collectPattern:[[0,0]],
            collectAmount:50,
            cooldown:0.5,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.2-0.15,-0.15,0.4,0.25,0.25,0.1,[0,0,-30],[0.9,0,0])
                box(-0.2+0.15,-0.15,0.4,0.25,0.25,0.1,[0,0,30],[0,0,0.9])
                box(-0.2+0.15-Math.sin(30*MATH.TO_RAD)*0.41,-0.15+Math.cos(30*MATH.TO_RAD)*0.41,0.4,0.1,0.6,0.1,[0,0,30],[1.3,1.3,1.3])
                box(-0.2-0.15+Math.sin(30*MATH.TO_RAD)*0.41,-0.15+Math.cos(30*MATH.TO_RAD)*0.41,0.4,0.1,0.6,0.1,[0,0,-30],[1.3,1.3,1.3])
            },
            desc:'A pair of school scissors.<br><br>Collects 50 pollen from 1 flowers every 0.5s.',
            cost:['850000 honey']
        },

        honeyDipper:{
            
            collectPattern:[[-4,0],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-1,-3],[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],[-1,3],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4],[1,-3],[1,-2],[1,-1],[1,0],[1,1],[1,2],[1,3],[2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],[3,-2],[3,-1],[3,0],[3,1],[3,2],[4,0]],
            collectAmount:2,
            cooldown:0.8,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.3,0.4,0.125,1.3,0.125,false,[1,0.7,0.4])
                box(-0.3,-0.1,0.4,0.175,0.5,0.175,false,[0.7,0.5,0.2])
                cylinder(-0.3,0.25+1.2*0.5+0.5,0.4,0.2,0.075,10,1*1.4,0.7*1.4,0.4*1.4,90,0,0)
                cylinder(-0.3,0.25+1.2*0.5+0.5+0.2,0.4,0.125,0.075,10,1*1.4,0.7*1.4,0.4*1.4,90,0,0)
                cylinder(-0.3,0.25+1.2*0.5+0.5-0.2,0.4,0.125,0.075,10,1*1.4,0.7*1.4,0.4*1.4,90,0,0)
                cylinder(-0.3,0.25+1.2*0.5+0.501,0.4,0.3,-0.8,10,0.9,0.5,0.2,90,0,0)

            },
            desc:'A giant honey dipper.<br><br>Collects 2 pollen from 49 flowers every 0.8s.',
            cost:['1500000 honey']
        },

        bubbleWand:{
            
            collectPattern:[[0,3],[1,3],[-1,3],[0,-3],[1,-3],[-1,-3],[3,0],[3,1],[3,-1],[-3,0],[-3,1],[-3,-1],[2,2],[2,-2],[-2,-2],[-2,2]],
            collectAmount:{w:6,r:6,b:6*2},
            cooldown:0.8,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.4,0.4,0.125,1.5,0.125,false,[0,0.4,1.4])
                box(-0.3,-0.1,0.4,0.175,0.5,0.175,false,[1.2,1.2,0])
                cylinder(-0.3,0.45+1.2*0.5+0.5,0.4,0.5,0.075,15,0,0.4,1.5,0,0,0)
                cylinder(-0.3,0.45+1.2*0.5+0.5,0.4,0.4,0.0755,15,0,0.9,1.2,0,0,0)
            },particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.4
                
                let x=-player.bodyDir[2],z=player.bodyDir[0]
                
                x+=player.bodyDir[0]
                z+=player.bodyDir[2]
                
                x*=0.3
                z*=0.4
                
                ParticleRenderer.add({x:player.body.position.x+x+MATH.random(-0.4,0.4),y:player.body.position.y+0.45+1.2*0.5+0.5+MATH.random(-0.4,0.4),z:player.body.position.z+z+MATH.random(-0.4,0.4),vx:MATH.random(-0.6,0.6),vy:(Math.random()-0.5)*0.5,vz:MATH.random(-0.6,0.6),grav:1.5,size:MATH.random(100,150),col:[0,0.6,0.9],life:1,rotVel:MATH.random(-3,3),alpha:0.8})
            },ability:function(){
                
                if(player.toolUses%10===0&&player.fieldIn){
                    
                    objects.bubbles.push(new Bubble(player.fieldIn,(Math.random()*fieldInfo[player.fieldIn].width)|0,(Math.random()*fieldInfo[player.fieldIn].length)|0))
                }
            },
            desc:'A bubble wand dipped in liquidy soap.<br><br>Collects 6 pollen from 16 flowers every 0.8s. Collects x2 more blue pollen.<br><br>Every 10th swing creates a bubble on the field.',
            cost:['2500000 honey']
        },

        scythe:{
            
            collectPattern:[[0,0],[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6]],
            collectAmount:{w:8,r:8*2,b:8},
            cooldown:0.47,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.4,0.4,0.125,1.5,0.125,false,[1.4,1.4,0])
                box(-0.3,-0.1,0.4,0.175,0.5,0.175,false,[1.4,0,0])
                box(-0.3,1,0.8,0.15,0.35,0.7,false,[1.3,1.3,1.3])
                box(-0.3,0.95,1.3,0.15,0.3,0.5,[20,0,0],[1.3,1.3,1.3])
                box(-0.3,0.8,1.55,0.15,0.2,0.3,[45,0,0],[1.3,1.3,1.3])
                box(-0.3,1+0.2,0.8,0.2,0.35,0.7,false,[1.3,0,0])
                box(-0.3,0.95+0.2,1.3,0.2,0.3,0.5,[20,0,0],[1.3,0,0])
                box(-0.3,0.775+0.15,1.65,0.2,0.3,0.5,[45,0,0],[1.3,0,0])
            },
            particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.4
                
                let x=player.bodyDir[0],y=1.5,z=player.bodyDir[2]*0
                
                x+=-player.bodyDir[2]*1.2
                z+=player.bodyDir[0]*1.2
                
                let r=Math.random()*1.5
                
                x+=player.bodyDir[0]*r
                y-=r*0.25
                z+=player.bodyDir[2]*r
                
                ParticleRenderer.add({x:player.body.position.x+x,y:player.body.position.y+y,z:player.body.position.z+z,vx:MATH.random(-0.8,0.8),vy:0.75,vz:MATH.random(-0.8,0.8),grav:1.5,size:MATH.random(70,120),col:[1,MATH.random(0.3,0.6),0],life:1,rotVel:MATH.random(-3,3),alpha:4.5})
            },ability:function(){
                
                if(player.toolUses%10===0){
                    
                    if(player.fieldIn){

                        objects.flames.push(new Flame(player.fieldIn,player.flowerIn.x,player.flowerIn.z))

                    } else {

                        objects.flames.push(new Flame(player.body.position.x,player.body.position.y,player.body.position.z,true))
                    }
                }
            },
            desc:'A red scythe forged and heated in fire.<br><br>Collects 8 pollen from 6 flowers every 0.47s. Collects x2 more red pollen.<br><br>Every 10th swing summons a flame nearby.',
            cost:['2500000 honey']
        },

        goldenRake:{
            
            collectPattern:[[-3,0],[-3,-1],[-3,-2],[-3,-3],[3,0],[3,-1],[3,-2],[3,-3],[-1,0],[-1,-1],[-1,-2],[-1,-3],[1,0],[1,-1],[1,-2],[1,-3]],
            collectAmount:7,
            cooldown:0.75,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0,0.6,0.1,0.1,0.8,false,[1.3,1.3,0.4])
                box(-0.3+0.1,0,0.6+0.6,0.1,0.1,0.5,[0,20,0],[1.3,1.3,0.4])
                box(-0.3+0.2,0,0.6+0.5,0.1,0.1,0.5,[0,40,0],[1.3,1.3,0.4])
                box(-0.3-0.1,0,0.6+0.6,0.1,0.1,0.5,[0,-20,0],[1.3,1.3,0.4])
                box(-0.3-0.2,0,0.6+0.5,0.1,0.1,0.5,[0,-40,0],[1.3,1.3,0.4])
                box(-0.3,0,0.6+0.65,0.1,0.1,0.4,false,[1.3,1.3,0.4])
            },
            ability:function(){
                
                if(player.toolUses%5===0&&player.fieldIn){
                    
                    objects.mobs.push(new Scratch(null,player.flowerIn.x,player.flowerIn.z,true))
                }
            },
            desc:'A shiny golden rake with improved pollen collection.<br><br>Collects 7 pollen from 16 flowers every 0.75s.<br><br>Every 5th swing is supercharged and collects more flowers from longer lines.',
            cost:['12500000 honey']
        },

        sparkStaff:{
            
            collectPattern:[[2,1],[-2,1],[0,-2]],
            collectAmount:35,
            cooldown:0.5,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.3,0.4,0.1,1.25,0.1,false,[1,0,1])
                box(-0.3-0.3*0.4,0.25+1.25*0.5,0.4-0.2*0.4,0.1,0.1,0.1,false,[1.2,1.2,0])
                box(-0.3+0.3*0.4,0.25+1.25*0.5,0.4-0.2*0.4,0.1,0.1,0.1,false,[1.2,1.2,0])
                box(-0.3,0.25+1.25*0.5,0.4+0.3*0.4,0.1,0.1,0.1,false,[1.2,1.2,0])
                box(-0.3,0.4+1.25*0.5,0.4,0.1,0.1,0.1,false,[1.2,1.2,0])

            },ability:function(){
                
                if(!player.fieldIn){

                    gear.tool.sparkStaff.collectPattern=[[2,1],[-2,1],[0,-2]]
                    return
                }

                gear.tool.sparkStaff.collectPattern=[]

                let a=[[-5,0],[-4,-3],[-4,-2],[-4,-1],[-4,0],[-4,1],[-4,2],[-4,3],[-3,-4],[-3,-3],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-3,3],[-3,4],[-2,-4],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-2,4],[-1,-4],[-1,-3],[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],[-1,3],[-1,4],[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,-4],[1,-3],[1,-2],[1,-1],[1,0],[1,1],[1,2],[1,3],[1,4],[2,-4],[2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],[2,4],[3,-4],[3,-3],[3,-2],[3,-1],[3,0],[3,1],[3,2],[3,3],[3,4],[4,-3],[4,-2],[4,-1],[4,0],[4,1],[4,2],[4,3],[5,0]],f=fieldInfo[player.fieldIn]

                for(let i=0;i<3;i++){

                    let r=(Math.random()*a.length)|0,f=a[r]

                    gear.tool.sparkStaff.collectPattern.push(f)

                    a.splice(r,1)
                }
            },
            desc:'A wand powered by static electricity.<br><br>Collects 35 pollen from 3 random flowers every 0.5s.<br><br>Unlike in the real game, this tool is good :D',
            cost:['40000000 honey']
        },

        porcelainDipper:{
            
            collectPattern:[[-4,0],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-1,-3],[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],[-1,3],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4],[1,-3],[1,-2],[1,-1],[1,0],[1,1],[1,2],[1,3],[2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],[3,-2],[3,-1],[3,0],[3,1],[3,2],[4,0]],
            collectAmount:{w:3*1.5,r:3,b:3},
            cooldown:0.7,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3,0.4,0.4,0.125,1.5,0.125,false,[1.4,1.4,1.4])
                box(-0.3,-0.1,0.4,0.175,0.5,0.175,false,[1.2,1.2,0])
                cylinder(-0.3,0.45+1.2*0.5+0.5,0.4,0.2,0.075,10,1.5,1.5,1.5,90,0,0)
                cylinder(-0.3,0.45+1.2*0.5+0.5+0.2,0.4,0.125,0.075,10,1.5,1.5,1.5,90,0,0)
                cylinder(-0.3,0.45+1.2*0.5+0.5-0.2,0.4,0.125,0.075,10,1.5,1.5,1.5,90,0,0)
                cylinder(-0.3,0.45+1.2*0.5+0.501,0.4,0.3,-0.8,10,1.4,1.4,1.4,90,0,0)
                box(-0.5,1,0.4,0.175,0.5,0.12,[0,0,70],[0,0,1.4])
                box(-0.5,0.825,0.4,0.175,0.4,0.12,[0,0,-70],[0,0,1.4])
                box(-0.5+0.4,1,0.4,0.175,0.5,0.12,[0,0,-70],[1.4,0,0])
                box(-0.5+0.4,0.825,0.4,0.175,0.4,0.12,[0,0,70],[1.4,0,0])
            },particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.5
                
                let x=-player.bodyDir[2],z=player.bodyDir[0],r=0.325
                
                x+=player.bodyDir[0]
                z+=player.bodyDir[2]
                
                x*=r
                z*=r
                
                ParticleRenderer.add({x:player.body.position.x+x+MATH.random(-0.4,0.4),y:player.body.position.y+1.75+MATH.random(-0.4,0.4),z:player.body.position.z+z+MATH.random(-0.4,0.4),vx:MATH.random(-0.8,0.8),vy:Math.random()*0.5+0.4,vz:MATH.random(-0.8,0.8),grav:-1.25*Math.random()-0.25,size:MATH.random(20,60),col:[0.95,0.95,0.95],life:1,rotVel:MATH.random(-3,3),alpha:0.5})
            },
            ability:function(){
                
                if(player.toolUses%10===0){
                    
                    objects.explosions.push(new ReverseExplosion({col:[1,1,1],pos:[player.body.position.x,player.body.position.y,player.body.position.z],life:0.4,size:5,alpha:2,height:500}))

                    if(player.fieldIn){

                        collectPollen({x:player.flowerIn.x,z:player.flowerIn.z,pattern:[[-4,0],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-1,-3],[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],[-1,3],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4],[1,-3],[1,-2],[1,-1],[1,0],[1,1],[1,2],[1,3],[2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],[3,-2],[3,-1],[3,0],[3,1],[3,2],[4,0]],amount:50,stackHeight:0.6+Math.random()*0.5})
                    }
                }
            },
            desc:'A dipper drizzled with brittle liquid porcelain.<br><br>Collects 3 pollen from 49 flowers every 0.7s. Collects x1.5 more white pollen.<br><br>Every 10th swing summons a pillar of light that collects massive pollen.',
            cost:['100000000 honey'],

        },
        
        petalWand:{
            
            collectPattern:[[0,0],[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[-1,-3],[-1,-4],[-1,-5],[1,-3],[1,-4],[1,-5],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[-1,3],[-1,4],[-1,5],[1,3],[1,4],[1,5],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[3,1],[4,1],[5,1],[3,-1],[4,-1],[5,-1],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-3,1],[-4,1],[-5,1],[-3,-1],[-4,-1],[-5,-1]],
            collectAmount:10,
            cooldown:0.7,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.3-0.1,0.6,0.3+0.1,0.15,1.5,0.15,false,[0,0.7,0])
                box(-0.3-0.1,1.45,0.3+0.1,0.3,0.3,0.3,[45,0,45],[1.5,1.2,0])
                for(let i=0;i<MATH.TWO_PI;i+=MATH.TWO_PI/3){
                    
                    box(-0.3+Math.sin(i)*0.5-0.1,1.35,0.3+0.1+Math.cos(i)*0.5,0.7,0.1,0.7,[Math.sin(i)*-30,0,Math.cos(i)*-30],[1.2,1.2,1.2])
                }
                
                for(let i=MATH.QUATER_PI;i<MATH.TWO_PI+MATH.QUATER_PI;i+=MATH.TWO_PI/3){
                    
                    box(-0.3+Math.sin(i)*0.5-0.1,1.35,0.3+0.1+Math.cos(i)*0.5,0.7,0.1,0.7,[Math.sin(i)*30,0,Math.cos(i)*30],[1.2,1.2,1.2])
                    
                }
                
                for(let i=0;i<MATH.TWO_PI;i+=MATH.TWO_PI/3){
                    
                    box(-0.3-0.1+Math.sin(i)*0.5,1.2,0.3+0.1+Math.cos(i)*0.5,0.7,0.1,0.7,[60,i*MATH.TO_DEG,0],[1.2,1.2,1.2])
                    box(-0.3-0.1+Math.sin(i)*0.25,1.2,0.3+0.1+Math.cos(i)*0.25,0.7,0.1,0.7,[-60,i*MATH.TO_DEG,0],[1.2,1.2,1.2])
                }
            },
            ability:function(){
                
                if(player.toolUses%3===0){
                    
                    objects.mobs.push(new PetalShuriken([player.body.position.x,player.body.position.y+0.25,player.body.position.z],player.bodyDir.slice()))
                }
            },
            particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.3
                
                let x=-player.bodyDir[2],z=player.bodyDir[0],r=0.325
                
                x+=player.bodyDir[0]
                z+=player.bodyDir[2]
                
                x*=r
                z*=r
                
                ParticleRenderer.add({x:player.body.position.x+x,y:player.body.position.y+1.65,z:player.body.position.z+z,vx:MATH.random(-0.9,0.9),vy:Math.random()*0.5+0.2,vz:MATH.random(-0.9,0.9),grav:-1.5,size:MATH.random(20,50),col:[0.9,0.7,0.3],life:0.7,rotVel:MATH.random(-3,3),alpha:0.35})
            },
            desc:'A luxurious flower with enchanted petals.<br><br>Collects 10 pollen from 49 flowers every 0.7s.<br><br>Every 3rd swing summons a flying petal shuriken that collects tokens and causes bees to convert pollen.',
            cost:['1000000000 honey','5 starJelly','25 enzymes','25 glitter']
        },
        
        darkScythe:{
            
            collectPattern:[[0,-3],[0,-4],[1,-5],[1,-4],[1,-3],[2,-5],[2,-4],[2,-3],[3,-3],[3,-5],[4,-1],[-1,-3],[-1,-4],[-2,-3],[-3,-3],[0,-5],[-1,-5],[-2,-4],[-4,-2],[3,-4],[4,-4],[2,-2],[3,-2],[-2,-2],[-3,-2],[-4,-1]],
            collectAmount:13,
            cooldown:0.575,
            mesh:function(box,cylinder,sphere,star){
                
                box(-0.55,0.75,0.55,0.15,2.2,0.15,[0,0,0],[0.1,0,0],[0,0,30])
                box(-0.55,1.6,1.1,0.15,0.6,1.2,[0,0,0],[0.1,0,0],[0,0,30])
                box(-0.55,1.5,2,0.15,0.5,1,[20,0,0],[0.1,0,0],[0,0,30])
                box(-0.55,1.2,2.6,0.15,0.35,1,[40,0,0],[0.1,0,0],[0,0,30])
                
                box(-0.55,1.3,1.1,0.175,0.6*0.3,1.2,[0,0,0],[1.2,0,0.4],[0,0,30])
                box(-0.55,1.2,2,0.175,0.5*0.3,1,[20,0,0],[1.2,0,0.4],[0,0,30])
                box(-0.55,0.9,2.6,0.175,0.3*0.5,0.5,[40,0,0],[1.2,0,0.4],[0,0,30])
                
                box(-0.55,1.95,0.1,0.15,0.15,1.3,[20,0,0],[0.1,0,0],[0,0,30])
                box(-0.55,1.25,0.1,0.15,0.15,0.9,[-20,0,0],[0.1,0,0],[0,0,30])
                
            },
            ability:function(arr){
                
                objects.mobs.push(new DarkScoopingTrail())
                
                if(player.fieldIn&&!player.attacked.length){
                    
                    let x=Math.round(player.body.position.x-fieldInfo[player.fieldIn].x),z=Math.round(player.body.position.z-fieldInfo[player.fieldIn].z),a=[]
                    
                    for(let i in arr){
                        
                        let _x=arr[i][0]+x,_z=arr[i][1]+z
                        
                        if(_x>=0&&_x<fieldInfo[player.fieldIn].width&&_x>=0&&_z<fieldInfo[player.fieldIn].length){
                            
                            a.push([_x,_z])
                        }
                    }
                    
                    for(let i in objects.flames){
                        
                        let f=objects.flames[i]
                        
                        if(MATH.indexOfArrays(a,[f.x,f.z])>-1){
                            
                            f.turnDark()
                        }
                    }
                    
                } else {
                    
                    for(let i in objects.flames){
                        
                        let f=objects.flames[i]
                        
                        if(f.isStatic&&vec3.sqrDist(f.pos,[player.body.position.x+player.bodyDir[0]*2,player.body.position.y,player.body.position.z+player.bodyDir[2]*2])<7){
                            
                            f.turnDark()
                        }
                    }
                }
            },
            particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.05
                
                let x=player.bodyDir[0],y=1.5,z=player.bodyDir[2]*0
                
                x+=-player.bodyDir[2]*1.2
                z+=player.bodyDir[0]*1.2
                
                let r=Math.random()*2.5
                
                x+=player.bodyDir[0]*r
                y-=r*0.25
                z+=player.bodyDir[2]*r
                
                ParticleRenderer.add({x:player.body.position.x+x,y:player.body.position.y+y,z:player.body.position.z+z,vx:-player.bodyDir[2]*2,vy:1.75,vz:player.bodyDir[0]*2,grav:0,size:MATH.random(70,120),col:[1,0,Math.random()],life:1,rotVel:MATH.random(-3,3),alpha:4.5})
            },
            desc:'Swipe through flames to unlock their dark potential. Ensue dark chaos in fields and refuel burning flames, collecting more pollen and dealing more damage. Tend a destructive field of violet fire to enhance your Super-Crit power and Instant Red Conversion.',
            cost:['2500000000000 honey','1000 redExtract','200 stinger','50 hardWax','15 superSmoothie']
        },
        
        tidePopper:{
            
            collectPattern:[[0,0],[-1,0],[1,0],[-2,0],[2,0],[-1,-1],[0,-1],[1,-1],[-1,-2],[0,-2],[1,-2],[-1,-3],[0,-3],[1,-3],[-1,-4],[0,-4],[1,-4],[-1,-5],[0,-5],[1,-5],[0,-6],[0,-7],[0,-8]],
            collectAmount:13,
            cooldown:1,
            mesh:function(box,cylinder,sphere,star,finalRotation){
                
                cylinder(-0.4,2.2,0.4,0.25,0.05,15,1,3,7,90,0,0,0.25)
                cylinder(-0.4,1.6,0.4,0.3,0.05,15,1,3,7,90,0,0,0.3)
                cylinder(-0.4,1.1,0.4,0.4,0.05,15,1,3,7,90,0,0,0.4)
                cylinder(-0.4,1.7,0.4,0.3,2.25,10,0.3,1,2,90,0,0,0)
                box(-0.4,0.5,0.4,0.15,1.4,0.15,false,[0.1,0.8,1.8])
                sphere(-0.4-0.8,0.85,0.4,0.25,1,100,100,100)
                sphere(-0.4+0.8,0.85,0.4,0.25,1,100,100,100)
                sphere(-0.4,0.85,0.4-0.8,0.25,1,100,100,100)
                sphere(-0.4,0.85,0.4+0.8,0.25,1,100,100,100)
                finalRotation(20,-20,0)
                
            },
            ability:function(){
                
                if(player.toolUses%3===0){
                    
                    objects.mobs.push(new Wave([player.body.position.x,player.body.position.y+0.25,player.body.position.z],player.bodyDir.slice()))
                }
            },
            particles:function(){
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.1
                
                let x=-player.bodyDir[2],z=player.bodyDir[0],r=MATH.random(0.2,0.9)
                
                x+=player.bodyDir[0]
                z+=player.bodyDir[2]
                
                x*=r
                z*=r
                
                ParticleRenderer.add({x:player.body.position.x+x,y:player.body.position.y+MATH.random(0.1,2.5),z:player.body.position.z+z,vx:x,vy:1.6,vz:z,grav:0,size:MATH.random(20,50),col:[0.1,0.7,1],life:0.7,rotVel:MATH.random(-3,3),alpha:0.5})
                
                
            },
            desc:'Pierce through flowers and bubbles with torriental waves, washing away tokens and converting pollen from bees. Swings faster and ramps up the more you pop, then unleashes tidal waves in a violent surge at 500 bubbles. Splash Balloons with tall waves to earn Tide Blessing and re-energize tidal waves with the destruction of bubbles.',
            cost:['2500000000000 honey','1000 blueExtract','200 stinger','25 swirledWax','15 superSmoothie']
        },
        
        gummyBaller:{
            
            collectPattern:[[-3,-3],[-2,-5],[-2,-4],[-2,-3],[-2,-2],[-2,-1],[-1,-5],[-1,-4],[-1,-3],[-1,-2],[-1,-1],[0,-6],[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[1,-5],[1,-4],[1,-3],[1,-2],[1,-1],[2,-5],[2,-4],[2,-3],[2,-2],[2,-1],[3,-3]],
            collectAmount:16,
            cooldown:1,
            mesh:function(box,cylinder,sphere,star){
                
                cylinder(-0.4,-0.1,0.4,0.15,0.35,15,0.26,2.7,1.1,90,0,0,0.15)
                cylinder(-0.4,0.8,0.4,0.1,1.75,15,1.5,0.15,1.5,90,0,0,0.1)
                sphere(-0.4,1.6,0.4,0.5,1,0.26,2.7,1.1)
                cylinder(-0.4,1.75,0.4,0.45,0.25,15,1.5,0.15,1.5,90,0,0,0.6)
                sphere(-0.4-0.3,1.85,0.4,0.25,1,0.26,2.7,1.1)
                sphere(-0.4+0.3,1.85,0.4,0.25,1,0.26,2.7,1.1)
                sphere(-0.4,1.85,0.4-0.3,0.25,1,1.5*1.75,0.65*1.75,1.5*1.75)
                sphere(-0.4,1.85,0.4+0.3,0.25,1,1.5*1.75,0.65*1.75,1.5*1.75)
                
            },
            particles:function(){
                
                let x=(-player.bodyDir[2]+player.bodyDir[0])*0.4,z=(player.bodyDir[0]+player.bodyDir[2])*0.4
                
                player.lagPos[0]+=(player.body.position.x-player.lagPos[0])*dt*12.5
                player.lagPos[1]+=(player.body.position.y-player.lagPos[1])*dt*12.5
                player.lagPos[2]+=(player.body.position.z-player.lagPos[2])*dt*12.5
                
                meshes.explosions.instanceData.push(player.lagPos[0]+x,player.lagPos[1]+2+player.gummyBallSize*0.3,player.lagPos[2]+z,0.9*player.isNight,0.18*player.isNight,0.9*player.isNight,1,player.gummyBallSize*0.5,1)
                
                toolParticle-=dt
                
                if(toolParticle>0){return}
                
                toolParticle=0.4/player.gummyBallSize
                
                ParticleRenderer.add({x:player.lagPos[0]+x,y:player.lagPos[1]+2+player.gummyBallSize*0.3,z:player.lagPos[2]+z,vx:MATH.random(-player.gummyBallSize,player.gummyBallSize),vy:MATH.random(-player.gummyBallSize,player.gummyBallSize),vz:MATH.random(-player.gummyBallSize,player.gummyBallSize),grav:0,size:MATH.random(20,50)*player.gummyBallSize,col:[0.1,0.8,1],life:0.75,rotVel:MATH.random(-3,3),alpha:player.gummyBallSize-0.5})
                
            },
            desc:'Absorb goo to conjure up a delectable arsenal of gummy wrecking balls. Cover the field in goo and collect pollen with a giant gummyball. Ricochet off Marks and Honey Tokens to build up your gummyball combo for massive gooey gains.',
            cost:['10000000000000 honey','1000 glue','2500 gumdrops','50 causticWax','3 turpentine']
        },
    }

    player=(function(out){

        out.autoRJSettings={until:'rare',gifted:false}

        out.restrictionInfo={}

        out.computeRestrictionInfo=function(){

            out.restrictionInfo.wall=[0.3*(out.targetLight<0.9?0:1),0.7*(out.targetLight<0.9?0:1),1.2*(out.targetLight<0.9?0:1)]

            let amountOfBees=0,redTypes=0,blueTypes=0,epicTypes=0,legendaryTypes=0

            for(let y in out.hive){
                
                for(let x in out.hive[y]){
                    
                    let h=out.hive[y][x]
                    
                    if(h.type!==null) amountOfBees++
                }
            }

            for(let i in out.discoveredBees){

                if(beeInfo[out.discoveredBees[i]].color==='red') redTypes++
                if(beeInfo[out.discoveredBees[i]].color==='blue') blueTypes++
                if(beeInfo[out.discoveredBees[i]].rarity==='epic') epicTypes++
                if(beeInfo[out.discoveredBees[i]].rarity==='legendary') legendaryTypes++
            }

            out.restrictionInfo.allowed_5=amountOfBees>=5?true:'You need 5 bees to enter the 5 Bee Zone!'
            out.restrictionInfo.allowed_10=amountOfBees>=10?true:'You need 10 bees to enter the 10 Bee Zone!'
            out.restrictionInfo.allowed_15=amountOfBees>=15?true:'You need 15 bees to enter the 15 Bee Zone!'
            out.restrictionInfo.allowed_20=amountOfBees>=20?true:'You need 20 bees to enter the 20 Bee Zone!'
            out.restrictionInfo.allowed_25=amountOfBees>=25?true:'You need 25 bees to enter the 25 Bee Zone!'
            out.restrictionInfo.allowed_30=amountOfBees>=30?true:'You need 30 bees to enter the 30 Bee Zone!'
            out.restrictionInfo.allowed_35=amountOfBees>=35?true:'You need 35 bees to enter the 35 Bee Zone!'
            out.restrictionInfo.allowed_redHQ=redTypes>=4?true:'Discover 4 red bee types to enter the Red HQ!'
            out.restrictionInfo.allowed_blueHQ=blueTypes>=4?true:'Discover 4 blue bee types to enter the Blue HQ!'
            out.restrictionInfo.allowed_sprinkler=legendaryTypes>=1?true:'Discover 1 legendary bee type to enter the Sprinkler Shop!'
            out.restrictionInfo.allowed_ace=epicTypes>=5?true:'Discover 5 epic bee types to enter the Ace Shop!'
            out.restrictionInfo.allowed_dapper=out.currentGear.mask!=='helmet'&&out.currentGear.mask!=='none'&&out.currentGear.boots!=='basicBoots'&&out.currentGear.boots!=='none'?true:'You must wear a nice hat and cool boots to enter the Dapper Shop!'
            out.restrictionInfo.allowed_cocoCave=!out.extraInfo.mob_coco||out.extraInfo.mob_coco<=0
        }
        
        out.extraInfo={beequipIds:0,enablePollenText:true,drives:{red:0,blue:0,white:0,glitched:0},freeRoboPass:0}

        out.endRoboChallenge=function(){

            out.addMessage('The Robo Challenge is over! Your score is '+out.roboChallenge.round+'!',[0,150,0])

            let arr=[['honey',out.roboChallenge.round*out.roboChallenge.round*out.roboChallenge.round*out.roboChallenge.round*out.roboChallenge.round*25+10000],[['redDrive','blueDrive','whiteDrive','glitchedDrive'][(Math.random()*(out.roboChallenge.round>=10?4:3))|0],1]]

            arr.push(...MATH.selectFromArray([['starJelly',1],['softWax',MATH.random(1,4)|0],['hardWax',1],['fieldDice',MATH.random(1,4)|0],['smoothDice',MATH.random(1,2)|0],['loadedDice',1],['oil',MATH.random(1,4)|0],['glue',MATH.random(1,4)|0],['neonberry',MATH.random(1,4)|0],['whirligig',MATH.random(1,7)|0],['honeysuckle',MATH.random(1,15)|0],['microConverter',MATH.random(1,4)|0],['jellyBeans',MATH.random(1,6)|0],],Math.min(out.roboChallenge.round/6,3)|0))

            if(out.roboChallenge.round>11&&Math.random()<0.25) arr.push(['purplePotion',1])
            if(out.roboChallenge.round>14) arr.push(['atomicTreat',1])
            if(out.roboChallenge.round>17&&Math.random()<0.2) arr.push(['superSmoothie',1])

            for(let i in arr){
            
                if(arr[i][0]==='honey'){
                    
                    player.honey+=arr[i][1]
                    
                } else {
                    
                    items[arr[i][0]].amount+=arr[i][1]
                }
                
                out.addMessage('+'+MATH.addCommas(arr[i][1]+'')+' '+MATH.doGrammar(arr[i][0])+' (from Robo Challenge)',[35,75,255])
            }

            document.getElementById('roboMenu').style.display='none'
            document.getElementById('roboQuestMenu').style.display='none'

            let amulet=[],t

            if(out.roboChallenge.round>=5) t='bronze'
            if(out.roboChallenge.round>=10) t='silver'
            if(out.roboChallenge.round>=15) t='gold'
            if(out.roboChallenge.round>=20) t='diamond'
            if(out.roboChallenge.round>=25) t='supreme'

            if(t){

                switch(t){

                    case 'bronze':

                        amulet.push('*'+MATH.random(1.1,1.2).toFixed(2)+' capacityMultiplier')
                        amulet.push('*'+MATH.random(1.03,1.05).toFixed(2)+' beeAttack')

                        if(Math.random()<0.25){
                            amulet.push('*'+MATH.random(1.01,1.05).toFixed(2)+' POLLEN')
                        } else {
                            amulet.push('*'+MATH.random(1.05,1.1).toFixed(2)+' '+['red','blue','white'][(Math.random()*3)|0]+'Pollen')
                        }

                        if(Math.random()<0.333){
                            amulet.push('+'+MATH.random(0.01,0.03).toFixed(2)+' instantRedConversion')
                        } else if(Math.random()<0.5){
                            amulet.push('+'+MATH.random(0.01,0.03).toFixed(2)+' instantWhiteConversion')
                        } else {
                            amulet.push('+'+MATH.random(0.01,0.03).toFixed(2)+' instantBlueConversion')
                        }

                        break

                        case 'silver':

                        amulet.push('*'+MATH.random(1.2,1.3).toFixed(2)+' capacityMultiplier')
                        amulet.push('*'+MATH.random(1.05,1.08).toFixed(2)+' beeAttack')

                        if(Math.random()<0.25){
                            amulet.push('*'+MATH.random(1.02,1.06).toFixed(2)+' POLLEN')
                        } else {
                            amulet.push('*'+MATH.random(1.07,1.15).toFixed(2)+' '+['red','blue','white'][(Math.random()*3)|0]+'Pollen')
                        }

                        if(Math.random()<0.333){
                            amulet.push('+'+MATH.random(0.02,0.03).toFixed(2)+' instantRedConversion')
                        } else if(Math.random()<0.5){
                            amulet.push('+'+MATH.random(0.02,0.03).toFixed(2)+' instantWhiteConversion')
                        } else {
                            amulet.push('+'+MATH.random(0.02,0.03).toFixed(2)+' instantBlueConversion')
                        }

                        if(Math.random()<0.333){
                            amulet.push('*'+MATH.random(1.02,1.06).toFixed(2)+' flamePollen')
                        } else if(Math.random()<0.5){
                            amulet.push('*'+MATH.random(1.02,1.06).toFixed(2)+' bubblePollen')
                        } else {
                            amulet.push('*'+MATH.random(1.02,1.06).toFixed(2)+' markDuration')
                        }

                    break

                    case 'gold':

                        amulet.push('*'+MATH.random(1.3,1.4).toFixed(2)+' capacityMultiplier')
                        amulet.push('*'+MATH.random(1.06,1.1).toFixed(2)+' beeAttack')

                        if(Math.random()<0.25){
                            amulet.push('*'+MATH.random(1.03,1.07).toFixed(2)+' POLLEN')
                        } else {
                            amulet.push('*'+MATH.random(1.15,1.2).toFixed(2)+' '+['red','blue','white'][(Math.random()*3)|0]+'Pollen')
                        }

                        if(Math.random()<0.333){
                            amulet.push('+'+MATH.random(0.02,0.05).toFixed(2)+' instantRedConversion')
                        } else if(Math.random()<0.5){
                            amulet.push('+'+MATH.random(0.02,0.05).toFixed(2)+' instantWhiteConversion')
                        } else {
                            amulet.push('+'+MATH.random(0.02,0.05).toFixed(2)+' instantBlueConversion')
                        }

                        if(Math.random()<0.333){
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' flamePollen')
                        } else if(Math.random()<0.5){
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' bubblePollen')
                        } else {
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' markDuration')
                        }

                    break

                    case 'diamond':

                        amulet.push('*'+MATH.random(1.4,1.5).toFixed(2)+' capacityMultiplier')
                        amulet.push('*'+MATH.random(1.07,1.12).toFixed(2)+' beeAttack')

                        if(Math.random()<0.25){
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' POLLEN')
                        } else {
                            amulet.push('*'+MATH.random(1.2,1.25).toFixed(2)+' '+['red','blue','white'][(Math.random()*3)|0]+'Pollen')
                        }

                        if(Math.random()<0.333){
                            amulet.push('+'+MATH.random(0.04,0.09).toFixed(2)+' instantRedConversion')
                        } else if(Math.random()<0.5){
                            amulet.push('+'+MATH.random(0.04,0.09).toFixed(2)+' instantWhiteConversion')
                        } else {
                            amulet.push('+'+MATH.random(0.04,0.09).toFixed(2)+' instantBlueConversion')
                        }

                        if(Math.random()<0.333){
                            amulet.push('*'+MATH.random(1.05,1.12).toFixed(2)+' flamePollen')
                        } else if(Math.random()<0.5){
                            amulet.push('*'+MATH.random(1.05,1.12).toFixed(2)+' bubblePollen')
                        } else {
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' markDuration')
                        }

                        if(Math.random()<0.5){

                            if(Math.random()<0.5){
                                amulet.push('*1.05 nectarMultiplier')
                            } else {
                                amulet.push('*'+MATH.random(1.15,1.35).toFixed(2)+' honeyFromTokens')
                            }
                            } else {

                            if(Math.random()<0.5){
                            amulet.push('*'+MATH.random(1.05,1.11).toFixed(2)+' superCritPower')
                            } else {
                                amulet.push('*'+MATH.random(1.1,1.2).toFixed(2)+' tokenLifespan')
                            }
                        }

                    break

                    case 'supreme':

                        amulet.push('*'+MATH.random(1.5,1.6).toFixed(2)+' capacityMultiplier')
                        amulet.push('*'+MATH.random(1.1,1.15).toFixed(2)+' beeAttack')

                        if(Math.random()<0.25){
                            amulet.push('*'+MATH.random(1.05,1.1).toFixed(2)+' POLLEN')
                        } else {
                            amulet.push('*'+MATH.random(1.2,1.3).toFixed(2)+' '+['red','blue','white'][(Math.random()*3)|0]+'Pollen')
                        }

                        if(Math.random()<0.333){
                            amulet.push('+'+MATH.random(0.07,0.13).toFixed(2)+' instantRedConversion')
                        } else if(Math.random()<0.5){
                            amulet.push('+'+MATH.random(0.07,0.13).toFixed(2)+' instantWhiteConversion')
                        } else {
                            amulet.push('+'+MATH.random(0.07,0.13).toFixed(2)+' instantBlueConversion')
                        }

                        if(Math.random()<0.333){
                            amulet.push('*'+MATH.random(1.07,1.15).toFixed(2)+' flamePollen')
                        } else if(Math.random()<0.5){
                            amulet.push('*'+MATH.random(1.07,1.15).toFixed(2)+' bubblePollen')
                        } else {
                            amulet.push('*'+MATH.random(1.04,1.08).toFixed(2)+' markDuration')
                        }

                        if(Math.random()<0.5){

                            if(Math.random()<0.5){
                                amulet.push('*1.05 nectarMultiplier')
                            } else {
                                amulet.push('*'+MATH.random(1.35,1.6).toFixed(2)+' honeyFromTokens')
                            }
                            } else {

                            if(Math.random()<0.5){
                                amulet.push('*'+MATH.random(1.08,1.15).toFixed(2)+' superCritPower')
                            } else {
                                amulet.push('*'+MATH.random(1.2,1.3).toFixed(2)+' tokenLifespan')
                            }
                        }

                    break

                }

                out.showGeneratedAmulet(t+'CogAmulet',amulet)
            }

            
            for(let i in out.effects){

                if(out.effects[i]==='roboChallengeBuff'){

                    out.effects.splice(i,1)
                    break
                }
            }

            if(out.roboChallenge.mobSpawnIntervalID!==undefined)
                window.clearInterval(out.roboChallenge.mobSpawnIntervalID)

            
            for(let i=objects.mobs.length;i--;) if(objects.mobs[i] instanceof Mechsquito||objects.mobs[i] instanceof Cogmower||objects.mobs[i] instanceof CogTurret) objects.mobs[i].die(i)
            
            out.roboChallenge=undefined

            items.cog.amount=0
            out.updateInventory()
        }

        window.endRoboChallenge=out.endRoboChallenge

        out.updateRoboChallenge=function(){

            if(!out.roboChallenge) return

            if(!out.roboChallenge.questCompleted)
                out.roboChallenge.timer-=dt

            // CHQ: Robo challenge can only end when the time runs out, not even the player dying will end the game
            if(out.roboChallenge.timer<=0&&out.roboChallenge.isPlaying){

                out.endRoboChallenge()
                return
            }
        }

        let upgrades={
            
            Botnet:{stats:'*1.25 pollenFromBees',rarity:'common',maxStacks:1},
            Iterate:{stats:'*1.05 redPollen,*1.05 bluePollen,*1.05 whitePollen',rarity:'common',maxStacks:15},
            Sharpen:{stats:'*1.25 beeAttack,*0.9 capacity',rarity:'common',maxStacks:5},
            Defragment:{stats:'*1.5 capacity,-20% criticalPower',rarity:'common',maxStacks:5},
            XSS:{stats:'*1.1 bluePollen,*0.91 whitePollen',rarity:'common',maxStacks:1},
            'Overfit: Red':{stats:'*1.1 redPollen,*0.95 capacity',rarity:'common',maxStacks:10},
            'Overfit: Blue':{stats:'*1.1 bluePollen,*0.95 beeSpeed,*0.95 walkSpeed',rarity:'common',maxStacks:10},
            'Overfit: White':{stats:'*1.1 whitePollen,*0.9 convertRate',rarity:'common',maxStacks:10},
            Apply:{stats:'*1.2 pollenFromCoconuts',rarity:'common',maxStacks:3},
            Clockwork:{stats:'+3 cogsPerRound,*0.9 markDuration',rarity:'common',maxStacks:3},
            Outsource:{stats:'*1.1 pollenFromTools,*0.95 pollenFromBees',rarity:'common',maxStacks:5},
            Equalize:{stats:'+1 beeAttack,*0.975 beeAttack',rarity:'common',maxStacks:3},
            'Flash Drive':{stats:'*1.01 beeSpeed,*1.01 walkSpeed,-1% criticalChance',rarity:'common',maxStacks:10},
            Memory:{stats:'*1.03 redBeeAbilityRate,*1.03 blueBeeAbilityRate,*1.03 whiteBeeAbilityRate',rarity:'common',maxStacks:3},
            Binary:{stats:'*0.5 honeyAtHive,*2 convertRateAtHive',rarity:'common',maxStacks:3},
            Codec:{stats:'+5% instantRedConversion,+5% instantBlueConversion,+5% instantWhiteConversion,*0.96 beeAttack',rarity:'common',maxStacks:3},
            Overclock:{stats:'*1.04 beeSpeed,*1.04 walkSpeed,*0.9 capacity',rarity:'common',maxStacks:3},
            Inverse:{stats:'*1.5 beeAttack,*0.5 capacity',rarity:'common',maxStacks:1},
            Transpose:{stats:'*1.1 convertRate,*0.9 convertRateAtHive',rarity:'common',maxStacks:3},
            'Cross Product':{stats:'+2 movementCollection,*1.04 walkSpeed',rarity:'common',maxStacks:3},
            'Dot Product':{stats:'+2% criticalChance,*1.04 walkSpeed',rarity:'common',maxStacks:5},
            Projection:{stats:'*1.03 redPollen,*1.03 bluePollen',rarity:'common',maxStacks:5},
            Offset:{stats:'*1.15 tokenLifespan,*0.96 walkSpeed',rarity:'common',maxStacks:3},
            Sine:{stats:'*1.05 bluePollen',rarity:'common',maxStacks:4},
            Cosine:{stats:'*1.05 redPollen',rarity:'common',maxStacks:4},
            Tangent:{stats:'*1.05 whitePollen',rarity:'common',maxStacks:4},
            Reduce:{stats:'*1.03 beeAttack,*0.98 redPollen,*0.98 bluePollen,*0.98 whitePollen',rarity:'common',maxStacks:10},
            Refractor:{stats:'*1.06 convertRate',rarity:'common',maxStacks:10},
            NRG:{stats:'*1.07 beeEnergy,*1.02 walkSpeed,-1 cogsPerRound',rarity:'common',maxStacks:10},
            
            
            VPN:{stats:'+2% defense,*0.98 walkSpeed',rarity:'rare',maxStacks:10},
            Hyperbolic:{stats:'*1.06 beeAttack,*0.98 goo',rarity:'rare',maxStacks:5},
            Inject:{stats:'+1 redBeeAttack,+1 whiteBeeAttack,+1 blueBeeAttack,-1 cogsPerRound',rarity:'rare',maxStacks:3},
            Fragment:{stats:'+4% instantBombConversion',rarity:'rare',maxStacks:4},
            Translation:{stats:'*1.03 beeSpeed',rarity:'rare',maxStacks:3},
            'Blue Screen':{stats:'*1.08 blueBeeAbilityRate,+2 blueBeeAttack,-1 cogsPerRound',rarity:'rare',maxStacks:3},
            Commit:{stats:'+5% superCritChance,-3% criticalChance',rarity:'rare',maxStacks:2},
            GPU:{stats:'*1.05 walkSpeed',rarity:'rare',maxStacks:2},
            CPU:{stats:'+20% criticalPower,*0.9 walkSpeed',rarity:'rare',maxStacks:1},
            Saturate:{stats:'+2 redBeeAttack,+2 blueBeeAttack,-2 whiteBeeAttack',rarity:'rare',maxStacks:3},
            RAM:{stats:'+50000 capacity,+1 cogsPerRound,-2% defense',rarity:'rare',maxStacks:10},
            'SSD: Blue':{stats:'*1.5 blueFieldCapacity,*1.25 blueConvertRate,-3% criticalChance',rarity:'rare',maxStacks:3},
            'SSD: Red':{stats:'*1.5 redFieldCapacity,*1.25 redConvertRate,*0.7 whiteBombPollen',rarity:'rare',maxStacks:3},
            'SSD: White':{stats:'*1.5 whiteFieldCapacity,*1.25 whiteConvertRate,*0.9 beeAttack',rarity:'rare',maxStacks:3},
            Bluetooth:{stats:'*1.1 bluePollen,+1 blueBeeAttack',rarity:'rare',maxStacks:3},
            Bruteforce:{stats:'*1.1 redPollen,+3% superCritChance',rarity:'rare',maxStacks:3},
            'Fluid Simulation':{stats:'*1.1 whitePollen,*1.08 goo',rarity:'rare',maxStacks:3},
            Method:{stats:'*1.2 beeEnergy,*0.9 honeyFromTokens',rarity:'rare',maxStacks:3},
            
            
            Bandwidth:{stats:'x1.25 convertRateAtHive,*1.05 markDuration',rarity:'epic',maxStacks:3},
            beeBay:{stats:'+1 beesPerRound',rarity:'epic',maxStacks:1},
            Instancing:{stats:'+3% instantRedConversion,+3% instantBlueConversion,+3% instantWhiteConversion',rarity:'epic',maxStacks:5},
            'Pop-up':{stats:'*1.25 bubblePollen,-1 blueBeeAttack',rarity:'epic',maxStacks:3},
            Overheat:{stats:'*1.25 flamePollen,*0.95 redPollen',rarity:'epic',maxStacks:3},
            'White Noise':{stats:'*1.1 whitePollen,*1.25 whiteBombPollen,-1 cogsPerRound',rarity:'epic',maxStacks:1},
            Battery:{stats:'*1.1 markDuration,*1.1 flameLife,*0.95 walkSpeed',rarity:'epic',maxStacks:1},
            Asynchronize:{stats:'+4 movementCollection,*0.96 tokenLifespan',rarity:'epic',maxStacks:3},
            'Bit Shift':{stats:'*1.05 convertRate,+3% instantBombConversion',rarity:'epic',maxStacks:10},
            Base64:{stats:'*1.64 convertRate,*0.64 pollenFromCoconuts',rarity:'epic',maxStacks:1},
            Trojan:{stats:'*1.25 beeAttack,*0.9 beeSpeed',rarity:'epic',maxStacks:1},
            Uniform:{stats:'*1.15 redPollen,*1.15 bluePollen,*1.15 whitePollen,*0.92 beeAttack',rarity:'epic',maxStacks:2},
            Duplicate:{stats:'+2% abilityDuplicationChance,*0.94 redBeeAbilityRate,*0.94 blueBeeAbilityRate,*0.94 whiteBeeAbilityRate',rarity:'epic',maxStacks:4},
            Furnace:{stats:'*1.07 flamePollen,+5% instantFlameConversion,*1.07 flameLife,-2 cogsPerRound',rarity:'epic',maxStacks:3},
            
            
            'Cloud 9':{stats:'*1.35 capacity,-1 cogsPerRound',rarity:'legendary',maxStacks:5},
            '180°':{stats:'*1.8 beeAttack,-18% criticalChance',rarity:'legendary',maxStacks:1},
            'Vice Versa':{stats:'*1.5 redBombPollen,*1.5 blueBombPollen,*0.9 whiteBombPollen',rarity:'legendary',maxStacks:1},
            'Schematic Error':{stats:'*1.25 redBombPollen,+3% abilityDuplicationChance',rarity:'legendary',maxStacks:1},
            "d^=b[,7'":{stats:'*2 goo,*0.85 whitePollen',rarity:'legendary',maxStacks:1},
            Unlisted:{stats:'+3% criticalChance,*1.2 superCritPower',rarity:'legendary',maxStacks:1},
            '23.5':{stats:'+2% instantBlueConversion,+3% instantWhiteConversion,+5% instantRedConversion',rarity:'legendary',maxStacks:5},
            Knock:{stats:'*1.25 beeAttack,-10% defense',rarity:'legendary',maxStacks:1},
            '12%':{stats:'*0.12 goo,*1.55 whitePollen',rarity:'legendary',maxStacks:1},
            'Plus Minus':{stats:'+6% criticalChance,-2% superCritChance',rarity:'legendary',maxStacks:2},
            '8.2':{stats:'*1.8 pollenFromCoconuts,*1.2 capacity',rarity:'legendary',maxStacks:1},
            'Friend Credits':{stats:'+4 cogsPerRound,*1.1 honeyFromTokens',rarity:'legendary',maxStacks:3},
            Technoblade:{stats:'+25% defense',rarity:'legendary',maxStacks:1},
            'A-List':{stats:'*1.25 beeSpeed,+4 movementCollection,-2 cogsPerRound',rarity:'legendary',maxStacks:2},
            '<u style="user-select:text">ยังน่ารัก</u>':{stats:'*1.5 buoyantBeeAttack,-1 cogsPerRound',rarity:'legendary',maxStacks:1},
            
        },rarityColor={common:'rgb(180,130,30)',rare:'rgb(210,210,210)',epic:'rgb(250,230,10)',legendary:'rgb(20,240,255)'}

        out.startRoboChallenge=function(){

            out.roboChallenge.cogsPerRound=12
            out.roboChallenge.beesPerRound=2

            out.roboChallenge.isPlaying=true
            out.roboChallenge.timer=1.5*60
            document.getElementById('roboMenu').style.display='none'

            let amp=Math.max(0.1,0.6-out.roboChallenge.round*0.1),ef='player.capacity*='+amp+';player.pollenFromTools*='+amp+';player.pollenFromCoconuts*='+amp+';player.movementCollection*='+amp+';player.walkSpeed*=1.65'

            let upgradeStacks={}

            for(let i in out.roboChallenge.activeUpgrades){

                if(!upgradeStacks[out.roboChallenge.activeUpgrades[i]])
                    upgradeStacks[out.roboChallenge.activeUpgrades[i]]=0

                upgradeStacks[out.roboChallenge.activeUpgrades[i]]++

                
                let u=upgrades[out.roboChallenge.activeUpgrades[i]].stats.split(',')

                for(let j in u){

                    let _u=u[j],n=Number(_u.substring(1,_u.indexOf('%')>-1?_u.indexOf('%'):_u.indexOf(' ')))

                    if(_u.substring(_u.indexOf(' ')+1,_u.length).indexOf('Conversion')>-1){

                        ef+=';player.'+_u.substring(_u.indexOf(' ')+1,_u.length)+'='+'MATH.applyPercentage(player.'+_u.substring(_u.indexOf(' ')+1,_u.length)+','+n*0.01+')'
                        
                    } else {

                        ef+=';player.'+_u.substring(_u.indexOf(' ')+1,_u.length)+_u[0]+'='+(_u.indexOf('%')>-1?n*0.01:n)
                    }

                    if(_u.substring(_u.indexOf(' ')+1,_u.length).indexOf('PerRound')>-1){

                        out.roboChallenge[_u.substring(_u.indexOf(' ')+1,_u.length)]+=n
                    }
                }
            }

            effects.roboChallengeBuff.update=Object.constructor('amount','player',ef)

            effects.roboChallengeBuff.getMessage=function(){

                let m='Robo Challenge\nx'+amp+' capacity\nx'+amp+' pollen from tools\nx'+amp+' pollen from coconuts\nx'+amp+' movement collection\nx1.65 walkspeed\n\n------Upgrades------\n\n'+JSON.stringify(upgradeStacks).replaceAll('":','"#').replaceAll('"','').replaceAll(',',')\n').replaceAll('#',' (x').replace('{','').replace('}',')')+'\n'

                return m.split(')').length===2?m.substring(0,m.indexOf('\n\n---')):m
            }

            player.addEffect('roboChallengeBuff')

            let acStr='#'+out.roboChallenge.activeBees.join('#')+'#'

            for(let y in out.hive){

                for(let x in out.hive[y]){

                    let h=out.hive[y][x]

                    h.roboDisabled=false

                    if(acStr.indexOf('#'+x+','+y+'#')<0){

                        h.roboDisabled=true
                    }
                }
            }

            out.updateHive()

            for(let i in objects.bees){

                let b=objects.bees[i]

                if(!out.hive[b.hiveY][b.hiveX].roboDisabled){

                    b.pos[0]=player.body.position.x
                    b.pos[1]=player.body.position.y
                    b.pos[2]=player.body.position.z
                }
            }

            document.getElementById('roboQuestMenu').style.display='block'

            for(let i=objects.mobs.length;i--;){

                if(objects.mobs[i] instanceof Mechsquito||objects.mobs[i] instanceof Cogmower||objects.mobs[i] instanceof CogTurret)
                    objects.mobs[i].die(i)
            }

            for(let i in out.roboChallenge.quest){

                let q=out.roboChallenge.quest[i]

                if(q[0].indexOf('From')>-1){

                    for(let i=0,c=MATH.random(0,3);i<c;i++){

                        let m=[Mechsquito,Mechsquito,Mechsquito,Mechsquito,Mechsquito,Cogmower,Cogmower,Cogmower,Cogmower,CogTurret,CogTurret,CogTurret]

                        m=m[(Math.random()*m.length)|0]

                        objects.mobs.push(new m(q[0].replace('pollenFrom',''),(out.roboChallenge.round*MATH.random(0.5,0.6)+1)|0,m===CogTurret?MATH.random(0,4)|0:(out.roboChallenge.round>5?Math.random()<0.8:0)))
                    }

                } else {

                    for(let i=0;i<MATH.random(1,4);i++){

                        let m=[Mechsquito,Mechsquito,Mechsquito,Mechsquito,Mechsquito,Cogmower,Cogmower,Cogmower,Cogmower,CogTurret,CogTurret,CogTurret]

                        m=m[(Math.random()*m.length)|0]

                        let f=[]
                        
                        for(let i in fieldInfo){
                            
                            if(i!=='StumpField'&&i!=='AntField'&&i!=='CoconutField')
                                f.push(i)
                        }
                        
                        objects.mobs.push(new m(f[(Math.random()*f.length)|0],(out.roboChallenge.round*MATH.random(0.5,0.6)+1)|0,m===CogTurret?MATH.random(0,4)|0:Math.random()<0.8))
                    }
                }
            }

            out.roboChallenge.mobSpawnIntervalID=window.setInterval(function(){

                if(Math.random()<0.5)
                    return
                
                let f=[]

                if(out.fieldIn){

                    f=out.fieldIn

                } else {

                    if(Math.random()<0.8)
                        return

                    for(let i in fieldInfo){
                        
                        if(i!=='StumpField'&&i!=='AntField'&&i!=='CoconutField')
                            f.push(i)
                    }

                    f=f[(Math.random()*f.length)|0]
                }

                let m=[Mechsquito,Mechsquito,Mechsquito,Mechsquito,Mechsquito,Cogmower,Cogmower,Cogmower,Cogmower,CogTurret,CogTurret,CogTurret]

                m=m[(Math.random()*m.length)|0]

                objects.mobs.push(new m(f,(out.roboChallenge.round*MATH.random(0.5,0.6)+1)|0,m===CogTurret?MATH.random(0,4)|0:Math.random()<0.8))

            },20000)
        }
        
        out.updateRoboUI=function(){

            if(out.roboChallenge.mobSpawnIntervalID!==undefined)
                window.clearInterval(out.roboChallenge.mobSpawnIntervalID)

            out.roboChallenge.isPlaying=false
            document.getElementById('roboMenu').style.display='block'
            document.getElementById('roboCogsAmount').innerHTML='<u>Cogs: '+MATH.addCommas(items.cog.amount+'')+'</u>'
            document.getElementById('roboStartRound').style.display='none'
            document.getElementById('roboSkipBeePage').style.display='none'

            switch(out.roboChallenge.scene){

                case 'upgrade':

                    document.getElementById('roboStartRound').style.display='block'
                    document.getElementById('roboTitle').innerHTML="Buy Upgrades<p style='font-size:14.5px;margin-top:0px'><u style='cursor:"+(items.cog.amount>=out.roboChallenge.rerollCost?'pointer':'not-allowed')+"' onclick='window.rerollInRoboBearChallenge()'>Reroll Upgrades</u> ("+out.roboChallenge.rerollCost+" cogs)</p>"
                    document.getElementById('roboBeeChoices').style.display='none'
                    document.getElementById('roboQuestChoices').style.display='none'
                    document.getElementById('roboUpgradeChoices').style.display='block'
                    document.getElementById('roboActiveBees').style.display='none'
                    document.getElementById('roboActiveBeesAmount').style.display='none'
                    document.getElementById('roboActiveUpgrades').style.display='block'
                    document.getElementById('roboActiveUpgradesAmount').style.display='block'
                    document.getElementById('roboActiveUpgradesAmount').innerHTML='Active Upgrades ('+out.roboChallenge.activeUpgrades.length+')'

                    let u=[],c=[],costs=[]

                    let upgradeStacks={}

                    for(let i in out.roboChallenge.activeUpgrades){

                        if(!upgradeStacks[out.roboChallenge.activeUpgrades[i]])
                            upgradeStacks[out.roboChallenge.activeUpgrades[i]]=0

                        upgradeStacks[out.roboChallenge.activeUpgrades[i]]++
                    }

                    for(let i in upgrades){

                        if((upgradeStacks[i]||0)<upgrades[i].maxStacks){

                            u.push(i)
                        }
                    }

                    for(let i=0,_i=Math.min(3,u.length);i<_i;i++){

                        let r=(Math.random()*u.length)|0

                        c.push(u[r])

                        let _u=upgrades[u[r]]
                        costs.push(((MATH.random(3,7)+{common:0,rare:2,epic:5,legendary:9}[_u.rarity])/((_u.maxStacks-1)*0.1+1.25))|0)

                        u.splice(r,1)
                    }

                    for(let i=1;i<4;i++){

                        if(!upgrades[c[i-1]]){

                            document.getElementById('roboUpgradeChoice'+i).style.display='none'
                            continue

                        } else {

                            document.getElementById('roboUpgradeChoice'+i).style.display='block'
                        }

                        let s='',_s=upgrades[c[i-1]].stats.split(',')

                        for(let j in _s){

                            let n=_s[j]

                            n=n.substring(0,n.indexOf(' ')+1)+MATH.doGrammar(n.substring(n.indexOf(' ')+1,n.length))

                            s+='<div style="color:'+(Number(n.substring(1,n.indexOf(' ')))<1||n[0]==='-'?'rgb(255,50,50)':'rgb(60,255,60)')+'">'

                            n=n.replace('*','x')

                            if(n.indexOf('.')<0)
                                n=n[0]+MATH.addCommas(n.substring(1,n.indexOf('%')>-1?n.indexOf('%'):n.indexOf(' ')))+n.substring(n.indexOf('%')>-1?n.indexOf('%'):n.indexOf(' '),n.length)

                            s+=n+'<br></div>'
                        }

                        document.getElementById('roboUpgradeChoice'+i).style.backgroundColor=rarityColor[upgrades[c[i-1]].rarity]
                        
                        document.getElementById('roboUpgradeChoice'+i).innerHTML='&nbsp;'+c[i-1]+"&nbsp;&nbsp;&nbsp;<i style='font-size:13px;color:"+(items.cog.amount>=costs[i-1]?'black':'rgb(200,0,0)')+"'>"+costs[i-1]+" Cogs</i>&nbsp;&nbsp;&nbsp;&nbsp;<i style='font-size:13px;color:black'>Max Lvl:"+upgrades[c[i-1]].maxStacks+"</i><div style='border-radius:5px;position:fixed;left:10px;top:35px;right:5px;bottom:5px;background-color:rgb(0,0,0,0.75);font-family:trebuchet ms;font-size:14px;padding-left:10px;padding-top:8px'>"+s+"</div>"

                        document.getElementById('roboUpgradeChoice'+i).style.cursor=items.cog.amount>=costs[i-1]?'pointer':'not-allowed'

                        document.getElementById('roboUpgradeChoice'+i).onclick=function(){

                            if(items.cog.amount>=costs[i-1]){

                                out.roboChallenge.activeUpgrades.push(c[i-1])
                                items.cog.amount-=costs[i-1]
                                out.updateInventory()
                                out.updateRoboUI()

                            } else {

                                out.addMessage('Not enough Cogs!',COLORS.redArr)
                            }
                            
                        }
                    }

                    document.getElementById('roboActiveUpgrades').innerHTML=''

                    let cleaned=[]

                    for(let i in out.roboChallenge.activeUpgrades){

                        if(cleaned.indexOf(out.roboChallenge.activeUpgrades[i])<0)
                            cleaned.push(out.roboChallenge.activeUpgrades[i])
                    }

                    for(let i in cleaned){

                        let s='',_s=upgrades[cleaned[i]].stats.split(',')

                        for(let j in _s){

                            let n=_s[j]

                            n=n.substring(0,n.indexOf(' ')+1)+MATH.doGrammar(n.substring(n.indexOf(' ')+1,n.length))

                            s+='<div style="color:'+(Number(n.substring(1,n.indexOf(' ')))<1||n[0]==='-'?'rgb(255,50,50)':'rgb(60,255,60)')+'">'

                            n=n.replace('*','x')

                            if(n.indexOf('.')<0)
                                n=n[0]+MATH.addCommas(n.substring(1,n.indexOf('%')>-1?n.indexOf('%'):n.indexOf(' ')))+n.substring(n.indexOf('%')>-1?n.indexOf('%'):n.indexOf(' '),n.length)

                            s+=n+'<br></div>'
                        }

                        let elem=document.createElement('div')

                        document.getElementById('roboActiveUpgrades').innerHTML+="<div style='background-color:"+rarityColor[upgrades[cleaned[i]].rarity]+";border-radius:5px;width:285px;height:125px;transform:scale(0.66,0.66);margin-top:-16px;margin-left:-44px;margin-bottom:-38px;color:black;'>&nbsp;"+cleaned[i]+"&nbsp;&nbsp;&nbsp;&nbsp;<i style='font-size:13px;color:black'>Lvl:"+upgradeStacks[cleaned[i]]+"</i><div style='border-radius:5px;position:fixed;left:10px;top:35px;right:5px;bottom:5px;background-color:rgb(0,0,0,0.75);font-family:trebuchet ms;font-size:14px;padding-left:10px;padding-top:8px'>"+s+"</div></div>"

                    }

                break

                case 'quest':

                    document.getElementById('roboTitle').innerHTML="Select Quest<p style='font-size:14.5px;margin-top:0px'><u style='cursor:"+(items.cog.amount>=out.roboChallenge.rerollCost?'pointer':'not-allowed')+"' onclick='window.rerollInRoboBearChallenge()'>Reroll Quests</u> ("+out.roboChallenge.rerollCost+" cogs)</p>"
                    document.getElementById('roboBeeChoices').style.display='none'
                    document.getElementById('roboQuestChoices').style.display='block'
                    document.getElementById('roboActiveBees').style.display='none'
                    document.getElementById('roboActiveBeesAmount').style.display='none'
                    document.getElementById('roboActiveUpgrades').style.display='none'
                    document.getElementById('roboActiveUpgradesAmount').style.display='none'
                    document.getElementById('roboUpgradeChoices').style.display='none'

                    let types=['pollen','pollen','pollen','pollen','pollen','pollen','pollen','redPollen','whitePollen','bluePollen','redPollen','whitePollen','bluePollen','pollenFromSunflowerField','pollenFromDandelionField','pollenFromMushroomField','pollenFromBlueFlowerField','pollenFromCloverField','pollenFromSpiderField','pollenFromStrawberryField','pollenFromBambooField','pollenFromPineapplePatch','pollenFromCactusField','pollenFromPumpkinPatch','pollenFromPineTreeForest','pollenFromRoseField']

                    if(out.roboChallenge.round>5) types.push('pollenFromMountainTopField')
                    if(out.roboChallenge.round>10) types.push('pollenFromPepperPatch')

                    for(let i=1;i<3;i++){

                        let q=[],t=types.slice(),re=[]

                        for(let j=0,c=MATH.random(1,4)|0;j<c;j++){

                            let r=t[(Math.random()*t.length)|0]

                            re.push(r)

                            for(let k=t.length;k--;){

                                if(t[k]===r)
                                    t.splice(k,1)
                            }
                        }

                        document.getElementById('roboQuestChoice'+i).innerHTML='<div style="text-align:center;font-size:25px"><u>Quest '+(i===1?'A':'B')+'</u></div><br>'

                        for(let j in re){

                            let am=out.roboChallenge.round*0.0125

                            am=30000000000*am*am*am*am*am

                            am*=MATH.random(1/1.1,1.1)-(re.length-1)*0.2

                            if(re[j].indexOf('From')>-1){

                                am=am*MATH.random(0.15,0.4)
                            }

                            if(re[j]==='pollen'){

                                am*=1.25
                            }

                            if(out.roboChallenge.round>5) am*=1.25
                            if(out.roboChallenge.round>10) am*=1.3
                            if(out.roboChallenge.round>15) am*=1.5
                            if(out.roboChallenge.round>20) am*=1.65
                            if(out.roboChallenge.round>25) am*=1.75

                            am=(((am*0.0001)|0)+1)*500

                            q.push([re[j],am])
                        }
                        
                        q.sort((b,a)=>a[1]-b[1])

                        for(let j in q){

                            document.getElementById('roboQuestChoice'+i).innerHTML+='- '+MATH.doStatGrammar(q[j][0])+' '+MATH.addCommas(q[j][1]+'')+' '+MATH.doGrammar(q[j][0])+'<br><br>'
                        }
                        
                        document.getElementById('roboQuestChoice'+i).onclick=function(){

                            out.roboChallenge.scene='upgrade'

                            for(let j in q){

                                q[j][2]=out.stats[q[j][0]]
                            }

                            out.roboChallenge.quest=q
                            out.updateRoboUI()
                        }
                    }

                break

                case 'bee':

                    if(out.roboChallenge.beesPicked>=out.roboChallenge.beesPerRound){

                        out.roboChallenge.scene='quest'
                        out.updateRoboUI()
                        return
                    }

                    document.getElementById('roboTitle').innerHTML="<p style='margin-top:-15px'></p>Select Bees<p style='font-size:13px;margin-top:0px'>("+(out.roboChallenge.beesPicked+1)+" of "+out.roboChallenge.beesPerRound+")<br><u style='cursor:"+(items.cog.amount>=out.roboChallenge.rerollCost?'pointer':'not-allowed')+"' onclick='window.rerollInRoboBearChallenge()'>Reroll Bees</u> ("+out.roboChallenge.rerollCost+" cogs)</p>"
                    document.getElementById('roboActiveBeesAmount').innerHTML="Active Bees ("+out.roboChallenge.activeBees.length+")"
                    document.getElementById('roboBeeChoices').style.display='block'
                    document.getElementById('roboQuestChoices').style.display='none'
                    document.getElementById('roboActiveBeesAmount').style.display='block'
                    document.getElementById('roboActiveUpgrades').style.display='none'
                    document.getElementById('roboActiveUpgradesAmount').style.display='none'
                    document.getElementById('roboUpgradeChoices').style.display='none'

                    let beesToSelect=[],strActiveBees='#'+out.roboChallenge.activeBees.join('#')+'#'

                    for(let y in out.hive){

                        for(let x in out.hive[y]){

                            let h=out.hive[y][x]

                            if(h.type!==null&&strActiveBees.indexOf('#'+x+','+y+'#')<0){

                                beesToSelect.push([x,y])
                            }
                        }
                    }

                    document.getElementById('roboActiveBees').innerHTML=''
                    document.getElementById('roboActiveBees').style.display='block'

                    // CHQ: Draw the active bees in the robo challenge on the canvas that displays active bees for the challenge
                    // note: still need to find where active bees are reset after the challenge ends
                    for(let i in out.roboChallenge.activeBees){

                        let b=out.roboChallenge.activeBees[i]

                        b=out.hive[b[1]][b[0]].bee

                        let img=document.createElement('canvas')

                        img.width=35
                        img.height=35
                        img.style.width=35
                        img.style.height=35
                        img.style.borderRadius='2px'
                        img.style.position='fixed'
                        img.style.left=(((i%5)+0.5-2.5)*20+50)+'%'
                        img.style.top=(((i/5)|0)*10+5)+'%'
                        img.style.transform='translate(-17px,-17px)'

                        let img_ctx=img.getContext('2d')

                        img_ctx.drawImage(beeCanvas,beeInfo[b.type].u*2048,beeInfo[b.type].v*2048+(b.gifted?768:0),128,128,0,0,35,35)

                        document.getElementById('roboActiveBees').appendChild(img)

                    }

                    for(let i=0;i<3;i++){

                        if(beesToSelect.length<=0){

                            document.getElementById('roboBeeChoice'+(i+1)).style.display='none'
                            document.getElementById('roboSkipBeePage').style.display='block'

                            return
                        }

                        let r=(Math.random()*beesToSelect.length)|0,bee=beesToSelect[r],_bee=bee.slice()

                        bee=out.hive[bee[1]][bee[0]].bee

                        beesToSelect.splice(r,1)

                        document.getElementById('roboBeeChoice'+(i+1)).style.display='block'
                        document.getElementById('roboBeeChoice'+(i+1)).style.backgroundColor=beeInfo[bee.type].color==='red'?'rgb(255,50,50,0.6)':beeInfo[bee.type].color==='blue'?'rgb(50,50,255,0.6)':'rgb(255,255,255,0.6)'

                        let img=document.createElement('canvas')

                        img.width=80
                        img.height=80
                        img.style.borderRadius='4px'
                        img.style.position='fixed'
                        img.style.left='3%'
                        img.style.top='10%'

                        let img_ctx=img.getContext('2d')

                        img_ctx.drawImage(beeCanvas,beeInfo[bee.type].u*2048,beeInfo[bee.type].v*2048+(bee.gifted?768:0),128,128,0,0,80,80)

                        let descStr='Level: '+bee.level+'<br>'+(bee.gifted?'⭐ Gifted ⭐':'')+(bee.mutation?'<br>☢️ '+bee.mutation.oper.replace('*','x')+bee.mutation.num+' '+MATH.doGrammar(bee.mutation.stat)+' ☢️':'')+(out.hive[_bee[1]][_bee[0]].beequip?'<br>Beequip: '+MATH.doGrammar(out.hive[_bee[1]][_bee[0]].beequip.type):'')

                        document.getElementById('roboBeeChoice'+(i+1)).innerHTML="<p style='position:fixed;width:200px;height:30px;left:67%;top:-3%;transform:translate(-50%,-50%)'>"+MATH.doGrammar(bee.type)+" Bee</p><p style='position:fixed;width:200px;left:67%;top:50%;transform:translate(-50%,-50%);font-size:11px'>"+descStr+"</p>"
                        document.getElementById('roboBeeChoice'+(i+1)).appendChild(img)

                        document.getElementById('roboBeeChoice'+(i+1)).onclick=function(){

                            out.roboChallenge.activeBees.push([Number(_bee[0]),Number(_bee[1])])
                            out.roboChallenge.beesPicked++
                            out.updateRoboUI()
                        }
                    }

                break
            }
        }

        window.rerollInRoboBearChallenge=function(){
            
            if(items.cog.amount>=out.roboChallenge.rerollCost){

                items.cog.amount-=out.roboChallenge.rerollCost
                out.roboChallenge.rerollCost+=1
                out.updateInventory()
                out.updateRoboUI()

            } else {

                out.addMessage('Not enough Cogs!',COLORS.redArr)
            }
        }

        window.roboStartRound=out.startRoboChallenge
        window.roboSkipBeePage=function(){

            out.roboChallenge.beesPicked=out.roboChallenge.beesPerRound
            out.updateRoboUI()
        }

        out.endAntChallenge=function(){

            if(!out.antChallenge) return
            
            out.addMessage('The Ant Challenge is over! Your score is '+out.antChallenge.score+'!',[35,75,255])

            let arr=[['honey',out.antChallenge.score*out.antChallenge.score*out.antChallenge.score*10+10000],['royalJelly',MATH.random(1,out.antChallenge.score*0.2+2)|0]]

            arr.push(...MATH.selectFromArray([['roboPass',1],['treat',out.antChallenge.score+15],['atomicTreat',1],['strawberry',out.antChallenge.score*0.15+1],['blueberry',out.antChallenge.score*0.15+1],['sunflowerSeed',out.antChallenge.score*0.15+3],['pineapple',out.antChallenge.score*0.15+5],['jellyBeans',(Math.sqrt(out.antChallenge.score*1.25)*0.2+1)|0]],1))

            for(let i in arr){
            
                if(arr[i][0]==='honey'){
                    
                    player.honey+=arr[i][1]
                    
                } else {
                    
                    items[arr[i][0]].amount+=arr[i][1]
                }
                
                out.addMessage('+'+MATH.addCommas(arr[i][1]+'')+' '+MATH.doGrammar(arr[i][0])+' (from Robo Challenge)',[35,75,255])
            }

            let amulet=[],t='bronze'

            if(out.antChallenge.score>=25) t='silver'
            if(out.antChallenge.score>=50) t='gold'
            if(out.antChallenge.score>=100) t='diamond'
            if(out.antChallenge.score>=150) t='supreme'

            let g=['bronze','silver','gold','diamond','supreme'].indexOf(t)

            amulet.push('*1.'+(g+1)+' capacityMultiplier','*'+MATH.random(1.05+g*0.15,1.15+g*0.15).toFixed(2)+' convertRate')

            amulet.push(...MATH.selectFromArray(['*'+MATH.random(1.03+g*0.05,1.1+g*0.05).toFixed(2)+' redPollen','*'+MATH.random(1.03+g*0.05,1.1+g*0.05).toFixed(2)+' whitePollen','*'+MATH.random(1.03+g*0.05,1.1+g*0.05).toFixed(2)+' bluePollen','*'+MATH.random(1.01+g*0.01,1.03+g*0.01).toFixed(2)+' POLLEN','*'+MATH.random(1.01,1.06).toFixed(2)+' walkSpeed','+'+MATH.random(0.01+g*0.0075,0.03+g*0.0075).toFixed(2)+' criticalChance','*'+MATH.random(1.03+g*0.05,1.1+g*0.05).toFixed(2)+' pollenFromTools','*'+MATH.random(1.03+g*0.05,1.1+g*0.05).toFixed(2)+' pollenFromBees'],g+1))

            player.showGeneratedAmulet(t+'AntAmulet',amulet)
            
            out.antChallenge=false

            for(let i in out.effects){

                if(out.effects[i]==='antChallenge'){

                    out.effects.splice(i,1)
                    break
                }
            }
        }

        out.updateAntChallenge=function(){

            if(!out.antChallenge) return

            out.antChallenge.timer-=dt
            out.antChallenge.spawnDelay-=dt
            out.antChallenge.lawnMowerTimer-=dt

            if(out.antChallenge.timer<=0){

                player.body.position.x=-21
                player.body.position.y=6
                player.body.position.z=-44.5
                player.yaw=0
                out.endAntChallenge()
                return
            }

            if(out.antChallenge.lawnMowerTimer<=0){

                objects.mobs.push(new LawnMower(out.antChallenge.round))
                out.antChallenge.lawnMowerTimer=Math.max(-0.33333*out.antChallenge.round+15,2)
            }

            if(out.stats.pollenFromAntField-out.antChallenge.pollenBeforeReq>=out.antChallenge.pollenReq&&out.antChallenge.spawnDelay<=0){

                out.antChallenge.round++
                out.antChallenge.spawnDelay=2
                out.antChallenge.pollenReq+=200*out.antChallenge.round+100

                let _p=[
                    [
                        [0.2,0.25],
                        [0.8,0.25],
                        [0.2,0.75],
                        [0.8,0.75],
                    ],[
                        [0.25,0.5],
                        [0.5,0.5],
                        [0.75,0.5],
                    ],[
                        [0.2,0.2],
                        [0.2,0.8],
                        [0.8,0.2],
                        [0.8,0.8],
                        [0.5,0.5],
                    ],[
                        [0.5,0.25],
                        [0.25,0.5],
                        [0.5,0.75],
                        [0.75,0.5],
                    ],[
                        [0.5,0.333],
                        [0.333,0.666],
                        [0.666,0.666],
                    ],[
                        [0.5,0.666],
                        [0.333,0.333],
                        [0.666,0.333],
                    ],[
                        [0.1,0.1],
                        [0.9,0.9],
                    ],[
                        [0.9,0.1],
                        [0.1,0.9],
                    ],
                ],p=_p[(Math.random()*_p.length)|0],t=['ant','ant','ant','ant','ant','armyAnt','armyAnt','armyAnt','fireAnt','fireAnt','flyingAnt','flyingAnt','flyingAnt','giantAnt']

                for(let i in p){

                    objects.mobs.push(new Ant(out.antChallenge.round,...p[i],t[(Math.random()*t.length)|0]))
                }

                if(Math.random()<0.25){

                    window.setTimeout(function(){
                        
                        p=_p[(Math.random()*_p.length)|0]

                        for(let i in p){

                            objects.mobs.push(new Ant(out.antChallenge.round,...p[i],t[(Math.random()*t.length)|0]))
                        }

                    },750)                
                }
                    
            }

            if(out.antChallenge.spawnDelay<=0){

                textRenderer.addSingle(MATH.addCommas((out.antChallenge.pollenReq-(out.stats.pollenFromAntField-out.antChallenge.pollenBeforeReq))+''),[-21,8,-61],COLORS.whiteArr,-3,false,false)

            } else {

                out.antChallenge.pollenBeforeReq=out.stats.pollenFromAntField
                textRenderer.addSingle(out.antChallenge.spawnDelay.toFixed(1)+'s',[-21,8,-61],COLORS.whiteArr,-3,false,false)
            }

            textRenderer.addSingle('Time: '+MATH.doTime(out.antChallenge.timer),[-15,9,-61],COLORS.whiteArr,-3,false,false,0,0.5)
            textRenderer.addSingle('Round: '+out.antChallenge.round,[-15,9,-61],COLORS.whiteArr,-3,false,false,0,0)
            textRenderer.addSingle('Score: '+out.antChallenge.score,[-15,9,-61],COLORS.whiteArr,-3,false,false,0,-0.5)
        }
        
        out.showGeneratedAmulet=function(type,amulet){

            document.exitPointerLock()

            let prev_type=type.indexOf('Star')>-1?'Star':0
            prev_type=prev_type||(type.indexOf('Ant')>-1?'Ant':0)
            prev_type=prev_type||(type.indexOf('Stickbug')>-1?'Stickbug':0)
            prev_type=prev_type||(type.indexOf('Shell')>-1?'Shell':0)
            prev_type=prev_type||(type.indexOf('Cog')>-1?'Cog':0)

            if(prev_type){

                for(let i in out.currentGear){

                    if(i.indexOf('Amulet')>-1&&i.indexOf(prev_type)>-1){

                        prev_type=i
                    }
                }

            } else {

                prev_type=type
            }

            let final=[]

            for(let i in amulet){if(amulet[i].indexOf('POLLEN')>-1){final.push(amulet[i].replace('POLLEN','redPollen'),amulet[i].replace('POLLEN','bluePollen'),amulet[i].replace('POLLEN','whitePollen'));continue}if(amulet[i].indexOf('INSTANT_CONVERSION')>-1){final.push(amulet[i].replace('INSTANT_CONVERSION','instantRedConversion'),amulet[i].replace('INSTANT_CONVERSION','instantBlueConversion'),amulet[i].replace('INSTANT_CONVERSION','instantWhiteConversion'));continue}final.push(amulet[i])}

            final=final.join(',')

            document.getElementById('amuletUI').style.display='block'
            document.getElementById('amuletType').innerHTML=MATH.doGrammar(type)

            let uncleaned=player.currentGear[prev_type]?player.currentGear[prev_type].split(','):[],cleaned=[]

            for(let i in uncleaned){

                if(!uncleaned[i]) continue

                let a=uncleaned[i],a_num=a.substring(0,a.indexOf(' ')),a_stat=a.substring(a.indexOf(' ')+1,a.length),a_color=a_stat.toLowerCase().indexOf('red')>-1?'red':0

                a_color=a_color||(a_stat.toLowerCase().indexOf('white')>-1?'white':0)
                a_color=a_color||(a_stat.toLowerCase().indexOf('blue')>-1?'blue':0)

                let isShared,got3Instances=[a_color]

                for(let j in uncleaned){

                    let b=uncleaned[j],b_num=b.substring(0,b.indexOf(' ')),b_stat=b.substring(b.indexOf(' ')+1,b.length)

                    if(a!==b&&a_num===b_num){

                        let b_color=b_stat.toLowerCase().indexOf('red')>-1?'red':0
                        b_color=b_color||(b_stat.toLowerCase().indexOf('white')>-1?'white':0)
                        b_color=b_color||(b_stat.toLowerCase().indexOf('blue')>-1?'blue':0)

                        if(a_color!==b_color&&a_stat.replaceAll('White','').replaceAll('Red','').replaceAll('Blue','').replaceAll('red','').replaceAll('blue','').replaceAll('white','')===b_stat.replaceAll('White','').replaceAll('Red','').replaceAll('Blue','').replaceAll('red','').replaceAll('blue','').replaceAll('white','')){
                            
                            got3Instances.push(b_color)
                            isShared=true
                        }
                    }
                }

                if(isShared&&got3Instances.length===3&&got3Instances.indexOf('red')>-1&&got3Instances.indexOf('blue')>-1&&got3Instances.indexOf('white')>-1){

                    cleaned.push(a.replaceAll('White','').replaceAll('Red','').replaceAll('Blue','').replaceAll('red','').replaceAll('blue','').replaceAll('white',''))

                } else {

                    cleaned.push(a)
                }
            }
            
            uncleaned=cleaned.slice()
            cleaned=[]

            for(let i in uncleaned){

                if(cleaned.indexOf(uncleaned[i])<0){

                    cleaned.push(uncleaned[i])
                }
            }

            document.getElementById('oldAmuletStats').innerHTML=player.currentGear[prev_type]?cleaned.map(x=>x.split(' ')[0]+' '+MATH.doGrammar(x.split(' ')[1])).map(x=>x[0]==='+'?'+'+((Number(x.substr(1,x.indexOf(' ')))*100)|0)+'%'+x.substr(x.indexOf(' '),x.length):x).join('<br>').replaceAll('*','x').replace(' Multiplier','').replaceAll(' Passive','').replaceAll('P ','Passive: '):'<p style="font-size:25px;padding-left:10px;margin-top:2px">None</p>'

            document.getElementById('newAmuletStats').innerHTML=amulet.map(x=>x.split(' ')[0]+' '+MATH.doGrammar(x.split(' ')[1].replace('INSTANT_CONVERSION','instantConversion').replace('POLLEN','pollen'))).map(x=>x[0]==='+'?'+'+((Number(x.substr(1,x.indexOf(' ')))*100)|0)+'%'+x.substr(x.indexOf(' '),x.length):x).join('<br>').replaceAll('*','x').replace(' Multiplier','').replaceAll(' Passive','').replaceAll('P ','Passive: ')

            document.getElementById('keepAmulet').onclick=function(){

                document.getElementById('amuletUI').style.display='none'
            }
            
            document.getElementById('replaceAmulet').onclick=function(){

                document.getElementById('amuletUI').style.display='none'
                
                let isOfType=type.indexOf('Star')>-1?'Star':0
                isOfType=isOfType||(type.indexOf('Ant')>-1?'Ant':0)
                isOfType=isOfType||(type.indexOf('Stickbug')>-1?'Stickbug':0)
                isOfType=isOfType||(type.indexOf('Shell')>-1?'Shell':0)
                isOfType=isOfType||(type.indexOf('Cog')>-1?'Cog':0)

                if(isOfType){

                    for(let i in out.currentGear){

                        if(i.indexOf('Amulet')>-1&&i.indexOf(isOfType)>-1){

                            delete out.currentGear[i]
                        }
                    }
                }

                out.currentGear[type]=final
                out.updateGear()
            }
        }

        out.sunSwitchTimer=5*60
        out.skyColor=[0.4,0.6,1]
        out.isNight=0.999
        
        out.targetLight=1
        
        out.radioactiveParticleTimer=0
        
        out.damage=(am)=>{
            
            out.health-=am-am*out.defense
            out.stats.coconutShield++
            textRenderer.add(((am-am*out.defense)|0)+'',[out.body.position.x,out.body.position.y+Math.random()*1.5+2.5,out.body.position.z],[255,0,0],0,'',2)
        }
        
        out.lagPos=[0,0,0]

        out.discoveredBees=[]
        out.discoveredGifteds=[]

        out.stats={
            
            moonAmulets:0,
            puffshrooms:0,
            rarePuffshrooms:0,
            epicPuffshrooms:0,
            legendaryPuffshrooms:0,
            mythicPuffshrooms:0,
            beeTypes:0,
            minutesOfNectar:0,
            hoursOfNectar:0,
            hoursOfInvigoratingNectar:0,
            hoursOfMotivatingNectar:0,
            hoursOfSatisfyingNectar:0,
            hoursOfComfortingNectar:0,
            hoursOfRefreshingNectar:0,
            minutesOfInvigoratingNectar:0,
            minutesOfMotivatingNectar:0,
            minutesOfSatisfyingNectar:0,
            minutesOfComfortingNectar:0,
            minutesOfRefreshingNectar:0,
            tokensFromPlanters:0,
            tokensFromSprouts:0,
            tokensFromWildWindyBee:0,
            timesUsingTheRedCannon:0,
            timesUsingTheBlueCannon:0,
            timesUsingTheYellowCannon:0,
            timesUsingTheSlingshot:0,
            itemsUsingTheBlender:0,
            fallingCoconuts:0,
            flames:0,
            bubbles:0,
            redPollen:0,
            bluePollen:0,
            whitePollen:0,
            pollen:0,
            abilityTokens:0,
            honeyTokens:0,
            rhinoBeetle:0,
            ladybug:0,
            spider:0,
            werewolf:0,
            mantis:0,
            scorpion:0,
            kingBeetle:0,
            tunnelBear:0,
            stumpSnail:0,
            ant:0,
            fireAnt:0,
            armyAnt:0,
            flyingAnt:0,
            giantAnt:0,
            mondoChick:0,
            rogueViciousBee:0,
            goo:0,
            popStar:0,
            scorchingStar:0,
            coconutShield:0,
            stingerUsed:0,
            gummyMorph:0,
            gummyStar:0,
        }

        for(let i=0;i<20;i++){

            out.stats['beesToLevel'+i]=0
        }
        
        for(let i in items){
            
            out.stats[i+'Tokens']=0
            out.stats[i]=0
            out.stats[i+'ToTheWindShrine']=0
        }
        
        for(let i in LIST_OF_STATS_FOR_PLAYER){
            
            out.stats[LIST_OF_STATS_FOR_PLAYER[i]]=0
        }
        
        out.precomputedStats={

            monsterRespawnTime:1,
            bondFromTreats:1,
            nectarMultiplier:1,
            tabbyLoveStacks:1,
            redFieldCapacity:1,
            blueFieldCapacity:1,
            whiteFieldCapacity:1,
            hasteStacks:0,
            gliderSpeed:0,
            gliderFall:0,
            walkSpeed:150,
            jumpPower:10,
            criticalChance:0,
            criticalPower:2,
            instantRedConversion:0,
            instantWhiteConversion:0,
            instantBlueConversion:0,
            redBombPollen:1,
            whiteBombPollen:1,
            blueBombPollen:1,
            instantBombConversion:0,
            honeyPerPollen:1,
            convertRate:1,
            redConvertRate:1,
            blueConvertRate:1,
            whiteConvertRate:1,
            convertRateAtHive:1,
            whitePollen:1,
            redPollen:1,
            bluePollen:1,
            capacity:0,
            flameFuel:false,
            beeSpeed:1,
            honeyAtHive:1,
            tokenLifespan:1,
            redBeeAbilityRate:1,
            blueBeeAbilityRate:1,
            whiteBeeAbilityRate:1,
            beeAttack:1,
            beeEnergy:1,
            flameHeatStack:1,
            flameHeatStackApplied:1,
            buoyantBeeAttack:1,
            superCritChance:0,
            superCritPower:2,
            lootLuck:1,
            bubblePollen:1,
            flamePollen:1,
            goo:1,
            tidePower:1,
            tidalSurge:false,
            collectorSpeed:1,
            honeyFromTokens:1,
            gummyBallSize:1,
            defense:0,
            whiteBeeAttack:0,
            redBeeAttack:0,
            blueBeeAttack:0,
            movementCollection:0,
            pollenFromBees:1,
            pollenFromTools:1,
            pollenFromCoconuts:1,
            instantFlameConversion:0,
            markDuration:1,
            redBombSync:false,
            blueBombSync:false,
            flameLife:1,
            abilityDuplicationChance:0
        }
        
        out.defaultStats={}
        
        out.quests=[]
        
        out.addQuest=function(name,req,NPC){
            
            for(let i in req){
                
                req[i].push(req[i][0]==='beeTypes'||req[i][0].indexOf('beesToLevel')>-1?0:out.stats[req[i][0]])
            }
            
            out.quests=[{name:name,req:req,NPC:NPC},...out.quests]
            
            NPCs[NPC].activeQuest=true
            
            if(currentPage||currentPage===0)
                pages[currentPage].style.display='none'
            
            currentPage=1
            pages[currentPage].style.display='block'
            out.itemDragging=false
            out.beequipDragging=false
        }
        
        dialogueBox.onclick=function(){
            
            if(typeof NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]==='object'){
                
                return
            }
            
            NPCs[out.currentNPC].dialogueIndex++
            
            if(typeof NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]==='string'){
                
                NPCDialogue.innerHTML=NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]
                
            } else if(typeof NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]==='function'){
                
                NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]()
                NPCs[out.currentNPC].dialogueIndex++
                out.currentNPC=null
                dialogueBox.style.display='none'
                out.viewMatrixToChange=undefined
                
            } else if(typeof NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]==='object'){
                
                let htmlCode=''
                
                for(let i in NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]){
                    
                    htmlCode+='<button style="border-radius:5px;background-color:rgb(30,70,255);width:420px;height:30px;font-size:17px;font-family:cursive;text-align:start;border:none;color:rgb(255,255,255);margin-top:10px;padding-bottom:10px;" onclick="window.NPCDialogueChoice'+i+'()">• '+NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex][i][0]+'</button>'
                    window['NPCDialogueChoice'+i]=NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex][i][1]
                }
                
                NPCDialogue.innerHTML=htmlCode
                
                
            } else {
                
                out.currentNPC=null
                dialogueBox.style.display='none'
                out.viewMatrixToChange=undefined
            }
        }
        
        out.onStartChat=function(i){

            if(NPCs[i].dialogue[NPCs[i].dialogueIndex]===undefined){
                
                if(NPCs[i].repeatable){

                    NPCs[i].dialogueIndex=NPCs[i].dialogueIndex%NPCs[i].portionLength
                    NPCs[i].dialogue=[...window['dialogue_'+i](out,items,NPCs)(NPCs[i].portionsDone)]

                } else {

                    if(i==='roboBear'){

                        NPCs[i].dialogue=out.roboChallenge?["Nice! You're moving on to the next round!",function(){
                            player.roboChallenge.page='bee'
                            player.roboChallenge.beesPicked=0
                            player.roboChallenge.scene='bee'
                            player.roboChallenge.round++
                            items.cog.amount+=player.roboChallenge.cogsPerRound
                            player.addMessage('+'+player.roboChallenge.cogsPerRound+' Cogs')
                            player.updateInventory()
                            player.updateRoboUI()}
                        ]:ROBO_BEAR_DIALOGUE.slice()

                        NPCs[i].dialogueIndex=0
                        
                    } else {

                        player.addMessage(MATH.doGrammar(i)+' has nothing to say anymore!',COLORS.redArr)
                        return
                    }

                }
            }
            
            player.itemDragging=false
            player.beequipDragging=false
            out.currentNPC=i
            actionWarning.style.display='none'
            dialogueBox.style.display='block'
            document.exitPointerLock()
            NPCName.innerHTML=MATH.doGrammar(out.currentNPC)
            NPCDialogue.innerHTML=NPCs[out.currentNPC].dialogue[NPCs[out.currentNPC].dialogueIndex]
            out.viewMatrixToChange=NPCs[player.currentNPC].viewMatrix
            out.viewMatrixCopy=out.viewMatrix.slice()
            out.easeAmount=0
            
        }
        
        out.onStartShop=function(){

            if(shops[out.currentShop].increments)
                shops[out.currentShop].currentIncrement=0
            
            player.itemDragging=false
            player.beequipDragging=false
            document.exitPointerLock()
            shopUI.style.display='block'
            shops[out.currentShop].currentIndex=0
            out.viewMatrixToChange=shops[out.currentShop].items[shops[out.currentShop].currentIndex].viewMatrix
            out.viewMatrixCopy=out.viewMatrix.slice()
            out.easeAmount=0
            itemName.innerHTML=MATH.doGrammar(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name)
            
            itemCostSVG.innerHTML=''
            
            let cost

            if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'||shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='beequip'){

                cost=shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost.slice()
                itemDesc.innerHTML=shops[out.currentShop].items[shops[out.currentShop].currentIndex].desc
                
            } else {

                cost=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].cost
                itemDesc.innerHTML=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].desc
            }
            
            for(let i in cost){

                if(typeof cost[i]==='function'){
                    
                    cost[i]=cost[i](shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased)
                }
                
                let c=cost[i].split(' '),col=(c[1]==='honey'&&player.honey<Number(c[0])||c[1]!=='honey'&&items[c[1]].amount<Number(c[0])?'rgb(255,0,0)':'rgb(255,255,255)'),text='x'+(c[0].length<4?MATH.addCommas(c[0]):MATH.abvNumber(c[0]))

                itemCostSVG.innerHTML+="<div style='position:absolute;top:"+i*70*0.7+"px'>"+itemSVGCode[c[1]].replace('SCALE','scale(0.7,0.7);margin-top:-10px;margin-bottom:0px;margin-left:-10px')+"<div style='position:absolute;top:15px;left:50px;font-size:16px;'><svg style='position:absolute;'><text x='3' y='20' stroke='black' stroke-width='3' style='font-size:15px'>"+text+"</text><text x='3' y='20' fill='"+col+"' style='font-size:15px'>"+text+"</text></svg></div></div>"
            }
            
            leftShopButton.onclick=function(){

                let incre=1
                
                if(shops[out.currentShop].increments){
                    
                    shops[out.currentShop].currentIncrement=(shops[out.currentShop].currentIncrement+shops[out.currentShop].increments.length-1)%shops[out.currentShop].increments.length
                    incre=shops[out.currentShop].increments[shops[out.currentShop].currentIncrement]
                }
                
                shops[out.currentShop].currentIndex=(shops[out.currentShop].currentIndex+shops[out.currentShop].items.length-1)%shops[out.currentShop].items.length
                out.viewMatrixToChange=shops[out.currentShop].items[shops[out.currentShop].currentIndex].viewMatrix
                out.easeAmount=0
                itemName.innerHTML=MATH.doGrammar(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name)+(incre>1?' x'+MATH.abvNumber(incre+''):'')
                
                itemCostSVG.innerHTML=''
                
                let cost

                if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'||shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='beequip'){

                    cost=shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost.slice()
                    itemDesc.innerHTML=shops[out.currentShop].items[shops[out.currentShop].currentIndex].desc
                    
                } else {

                    cost=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].cost
                    itemDesc.innerHTML=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].desc
                }
                
                for(let i in cost){
                    
                    if(typeof cost[i]==='function'){
                        
                        cost[i]=cost[i](shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased,incre)
                    }

                    let c=cost[i].split(' '),col=(c[1]==='honey'&&player.honey<Number(c[0])||c[1]!=='honey'&&items[c[1]].amount<Number(c[0])?'rgb(255,0,0)':'rgb(255,255,255)'),text='x'+(c[0].length<4?MATH.addCommas(c[0]):MATH.abvNumber(c[0]))

                    itemCostSVG.innerHTML+="<div style='position:absolute;top:"+i*70*0.7+"px'>"+itemSVGCode[c[1]].replace('SCALE','scale(0.7,0.7);margin-top:-10px;margin-bottom:0px;margin-left:-10px')+"<div style='position:absolute;top:15px;left:50px;font-size:16px;'><svg style='position:absolute;'><text x='3' y='20' stroke='black' stroke-width='3' style='font-size:15px'>"+text+"</text><text x='3' y='20' fill='"+col+"' style='font-size:15px'>"+text+"</text></svg></div></div>"
                }
            
            }
            rightShopButton.onclick=function(){
                
                let incre=1
                
                if(shops[out.currentShop].increments){
                    
                    shops[out.currentShop].currentIncrement=(shops[out.currentShop].currentIncrement+1)%shops[out.currentShop].increments.length
                    incre=shops[out.currentShop].increments[shops[out.currentShop].currentIncrement]
                }

                shops[out.currentShop].currentIndex=(shops[out.currentShop].currentIndex+1)%shops[out.currentShop].items.length
                out.viewMatrixToChange=shops[out.currentShop].items[shops[out.currentShop].currentIndex].viewMatrix
                out.easeAmount=0
                itemName.innerHTML=MATH.doGrammar(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name)+(incre>1?' x'+MATH.abvNumber(incre+''):'')

                itemCostSVG.innerHTML=''

                let cost

                if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'||shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='beequip'){

                    cost=shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost.slice()
                    itemDesc.innerHTML=shops[out.currentShop].items[shops[out.currentShop].currentIndex].desc
                    
                } else {

                    cost=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].cost
                    itemDesc.innerHTML=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].desc
                }

                for(let i in cost){

                    if(typeof cost[i]==='function'){
                        
                        cost[i]=cost[i](shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased,incre)
                    }
                    
                    let c=cost[i].split(' '),col=(c[1]==='honey'&&player.honey<Number(c[0])||c[1]!=='honey'&&items[c[1]].amount<Number(c[0])?'rgb(255,0,0)':'rgb(255,255,255)'),text='x'+(c[0].length<4?MATH.addCommas(c[0]):MATH.abvNumber(c[0]))

                    itemCostSVG.innerHTML+="<div style='position:absolute;top:"+i*70*0.7+"px'>"+itemSVGCode[c[1]].replace('SCALE','scale(0.7,0.7);margin-top:-10px;margin-bottom:0px;margin-left:-10px')+"<div style='position:absolute;top:15px;left:50px;font-size:16px;'><svg style='position:absolute;'><text x='3' y='20' stroke='black' stroke-width='3' style='font-size:15px'>"+text+"</text><text x='3' y='20' fill='"+col+"' style='font-size:15px'>"+text+"</text></svg></div></div>"
                }
                
            }
            actionWarning.onclick=function(){
                
                out.currentShop=undefined
                out.viewMatrixToChange=undefined
                shopUI.style.display='none'
            }
            
            purchaseButton.onclick=function(){

                let incre=1
                
                if(shops[out.currentShop].increments){
                    
                    incre=shops[out.currentShop].increments[shops[out.currentShop].currentIncrement]
                }
                
                if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].owned){
                    
                    if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot!=='item'&&shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot!=='beequip'){

                        out.currentGear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot]=shops[out.currentShop].items[shops[out.currentShop].currentIndex].name

                        out.updateGear()
                    }
                        
                    return
                }
                
                let cost

                if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'||shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='beequip'){

                    cost=shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost.slice()

                } else {

                    cost=gear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot][shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].cost
                }
                
                for(let i in cost){

                    if(typeof cost[i]==='function'){
                    
                        cost[i]=cost[i](shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased,incre)
                    }
                    
                    let c=cost[i].split(' ')
                    
                    if(c[1]==='honey'&&player.honey<Number(c[0])||c[1]!=='honey'&&items[c[1]].amount<Number(c[0])){
                        
                        return
                    }
                }

                itemCostSVG.innerHTML=''
                
                for(let i in cost){
                    
                    let c=cost[i].split(' ')
                    
                    if(c[1]==='honey'){
                        
                        player.honey-=Number(c[0])
                        
                    } else {
                        
                        items[c[1]].amount-=Number(c[0])
                    }

                    if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'&&typeof shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost[i]==='function'){

                        c=shops[out.currentShop].items[shops[out.currentShop].currentIndex].cost[i](shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased+incre,incre).split(' ')
                    }

                    let col=(c[1]==='honey'&&player.honey<Number(c[0])||c[1]!=='honey'&&items[c[1]].amount<Number(c[0])?'rgb(255,0,0)':'rgb(255,255,255)'),text='x'+(c[0].length<4?MATH.addCommas(c[0]):MATH.abvNumber(c[0]))

                    itemCostSVG.innerHTML+="<div style='position:absolute;top:"+i*70*0.7+"px'>"+itemSVGCode[c[1]].replace('SCALE','scale(0.7,0.7);margin-top:-10px;margin-bottom:0px;margin-left:-10px')+"<div style='position:absolute;top:15px;left:50px;font-size:16px;'><svg style='position:absolute;'><text x='3' y='20' stroke='black' stroke-width='3' style='font-size:15px'>"+text+"</text><text x='3' y='20' fill='"+col+"' style='font-size:15px'>"+text+"</text></svg></div></div>"
                }

                if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='item'){

                    shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased+=incre
                    
                    if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name==='hiveSlot'){

                        out.addSlot(null)
                        out.updateHive()

                    } else {

                        items[shops[out.currentShop].items[shops[out.currentShop].currentIndex].name].amount+=incre
                    }
                    
                    player.addMessage('+'+MATH.addCommas(incre+'')+' '+MATH.doGrammar(incre>1?MATH.doPlural(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name):shops[out.currentShop].items[shops[out.currentShop].currentIndex].name))

                    if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].amountPurchased>=shops[out.currentShop].items[shops[out.currentShop].currentIndex].maxPurchasedAmount){

                        shops[out.currentShop].items[shops[out.currentShop].currentIndex].owned=true
                    }

                } else if(shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot==='beequip'){
                    
                    if(out.currentGear.beequips.length>=6){

                        player.addMessage('You can\'t hold more than 6 beequips!',COLORS.redArr)

                        for(let i in cost){
                    
                            let c=cost[i].split(' ')
                            
                            if(c[1]==='honey'){
                                
                                player.honey+=Number(c[0])
                                
                            } else {
                                
                                items[c[1]].amount+=Number(c[0])
                            }
                        }

                    } else {

                        out.generateBeequip(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name)
                        out.addMessage('Recieived '+MATH.doGrammar(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name))
                    }

                } else {

                    shops[out.currentShop].items[shops[out.currentShop].currentIndex].owned=true
                    out.currentGear[shops[out.currentShop].items[shops[out.currentShop].currentIndex].slot]=shops[out.currentShop].items[shops[out.currentShop].currentIndex].name

                    player.addMessage('Received '+MATH.doGrammar(shops[out.currentShop].items[shops[out.currentShop].currentIndex].name))
                }

                out.updateInventory()
                out.updateGear()
            }
        }
        
        out.health=100
        out.respawnTimer=3
        out.dead=false
        
        out.respawn=function(){
            
            out.health=100
            out.dead=false
            out.body.position.x=8
            out.body.position.y=0
            out.body.position.z=7
            out.endAntChallenge()
        }
        
        out.attacked=[]
        
        out.messages=[]
        
        out.beeHighlightMesh=new Mesh(true)
        
        out.statsStringLastUpdate=0
        out.statsString=''
        
        out.itemDragging=''
        out.beequipDragging=''
        
        out.updateInventory=function(){

            noItemsMessage.style.display='block'

            for(let i in items){
                
                items[i].amount=Math.floor(items[i].amount)

                if(items[i].amount<=0){
                    
                    items[i].amount=0
                    items[i].svg.style.display='none'
                    
                } else {

                    items[i].svg.style.display='inline'
                    items[i].amountText.textContent='x'+items[i].amount
                    
                    noItemsMessage.style.display='none'
                }
                
                for(let j in hotbarSlots){
                    
                    if(hotbarSlots[j].itemType===i){

                        hotbarSlots[j].innerHTML=itemSVGCode[i].replace('SCALE','scale(0.512,0.512);margin-left:-18px;margin-top:-19px')+"<div style='font-size:9px;text-align:right;margin-top:-30px'>x"+items[i].amount+"</div>"

                        hotbarSlots[j].style.backgroundColor=items[i].amount>0?'rgb(235,235,235)':'rgb(190,190,190)'

                        hotbarSlots[j].style.filter=items[i].amount>0?'none':'grayscale(1)'
                    }
                }
            }
        }
        
        out.addItem=function(item,amount){
            
            items[item].amount+=amount
            out.updateInventory()
        }
        
        out.updateInventory()
        
        out.hiveBalloon={pollen:0,size:0,displaySize:0,maxPollen:0,blessing:0,deflateTimer:0}
        
        out.updateHiveBalloon=function(){
            
            if(!out.hiveBalloon.pollen){

                if(out.hiveBalloon.maxPollen){
                    
                    out.addEffect('balloonBlessing',undefined,out.hiveBalloon.blessing)
                    out.hiveBalloon.maxPollen=0
                    out.hiveBalloon.pollen=0

                    for(let i in out.effects){

                        if(out.effects[i].type==='balloonBlessing'){

                            if(out.effects[i].amount<=out.hiveBalloon.blessing){

                                out.addMessage('The hive balloon granted x'+out.hiveBalloon.blessing+' balloon blessing!',[205,205,0])
                                
                            } else {

                                out.addMessage('The hive balloon refreshed your balloon blessing!',[205,205,0])
                            }
                        }
                    }
                }
                
                out.hiveBalloon.size=0
                out.hiveBalloon.displaySize=0
                return
            }
            
            out.hiveBalloon.deflateTimer-=dt
            
            if(out.hiveBalloon.deflateTimer<=0){
                
                out.hiveBalloon.deflateTimer=10
                out.hiveBalloon.pollen=Math.round(out.hiveBalloon.pollen)
                
                let f=out.hiveBalloon.pollen/out.capacity
                
                f*=0.00045
                out.hiveBalloon.pollen-=out.hiveBalloon.pollen*f
            }
            
            out.hiveBalloon.pollen=Math.round(out.hiveBalloon.pollen)
            
            let p=out.hiveBalloon.pollen.toString()
            out.hiveBalloon.size=((Math.pow(out.hiveBalloon.pollen,1/7)*2-2)/20)+0.5
            
            out.hiveBalloon.displaySize+=(out.hiveBalloon.size-out.hiveBalloon.displaySize)*0.015
            
            meshes.explosions.instanceData.push(out.hivePos[0]+1.5,out.hivePos[1]-1.5+out.hiveBalloon.displaySize*0.5,out.hivePos[2]+3,0,0,0.6*player.isNight,0.75,out.hiveBalloon.displaySize,1.05)
                
            meshes.cylinder_explosions.instanceData.push(out.hivePos[0]+1.5,out.hivePos[1]-2.5,out.hivePos[2]+3,player.isNight,player.isNight,player.isNight,1,0.05,40)
            
            textRenderer.addSingle(p,[out.hivePos[0]+1.5,out.hivePos[1]-1.6+out.hiveBalloon.displaySize*0.5,out.hivePos[2]+3],COLORS.whiteArr,-1)
            
            p=Math.round(out.hiveBalloon.maxPollen).toString()
            
            out.hiveBalloon.blessing=Math.max(Math.ceil(Math.pow(out.hiveBalloon.maxPollen,1/7)*2-4),1)
            
            textRenderer.addSingle('Blessing x'+out.hiveBalloon.blessing,[out.hivePos[0]+1.5,out.hivePos[1]-1.4+out.hiveBalloon.displaySize*0.5,out.hivePos[2]+3],[0,100,255],-1,true,false)
        }
        
        out.toolRot=0
        out.toolMatrix=new Float32Array(16)
        out.toolMesh=new Mesh(false)
        out.toolUses=0
        out.toolCooldown=0
        
        out.hive=[[]]
        out.hivePos=[-1.625+9,1.5,-7.5]
        
        triggers.hive={
            
            minX:out.hivePos[0]-1,
            maxX:out.hivePos[0]+4.5,
            minY:-5,
            maxY:7,
            minZ:out.hivePos[2]-1,
            maxZ:out.hivePos[2]+4.5,
            
        }
        
        out.hiveMesh=new Mesh(true)
        
        out.addSlot=function(bee,gifted=true,bond=0,mutation,radioactive,beequip){
            
            if(out.hive[out.hive.length-1].length<5){
                
                out.hive[out.hive.length-1].push({type:bee,level:1,bond:bond,gifted:gifted,mutation:mutation,radioactive:radioactive,beequip:beequip})
                
            } else {
                
                out.hive.push([])
                out.hive[out.hive.length-1].push({type:bee,level:1,bond:bond,gifted:gifted,mutation:mutation,radioactive:radioactive,beequip:beequip})
            }
        }
        
        out.effects=[]
        
        out.addEffect=function(type,amplify,refresh,setAmount,addAmount){
            
            if(amplify){
                
                let found
                
                for(let i in out.effects){
                    
                    if(out.effects[i].type===type){
                        
                        found=i
                        break
                    }
                }
                
                if(found!==undefined){
                    
                    out.effects[found].cooldown=Math.min(effects[type].maxCooldown,effects[type].maxCooldown*amplify+out.effects[found].cooldown+dt)
                    
                    return
                }
                
                out.effects.push({
                    
                    cooldown:effects[type].maxCooldown*amplify,
                    type:type,
                    amount:1,
                })
                
            } else {
                
                let found
                
                for(let i in out.effects){
                    
                    if(out.effects[i].type===type){
                        
                        found=i
                        break
                    }
                }
                
                if(found!==undefined){
                    
                    if(refresh){
                        
                        out.effects[found].amount=Math.min(Math.max(out.effects[found].amount,refresh),effects[type].maxAmount)
                        
                    } else {
                        
                        out.effects[found].amount=Math.min(setAmount??out.effects[found].amount+(addAmount||1),effects[type].maxAmount)
                        
                    }
                    
                    out.effects[found].cooldown=effects[type].maxCooldown
                    
                    return
                }
                
                out.effects.push({
                    
                    cooldown:effects[type].maxCooldown,
                    type:type,
                    amount:refresh?refresh:setAmount??(addAmount||1),
                })
            }
            
            effects[type].svg.style.display='inline'
        }
        
        out.computeStats=function(merelyAGliderStateChange){
            
            for(let i=out.effects.length;i--;){
                
                if(effects[out.effects[i].type].isPassive){
                    
                    effects[out.effects[i].type].svg.style.display='none'
                    out.effects.splice(i,1)
                }
            }
            
            for(let i in out.precomputedStats){
                
                out.defaultStats[i]=out.precomputedStats[i]
            }
            
            out.defaultStats.capacityMultiplier=1
            
            out.defaultStats.convertTotal=0
            out.defaultStats.attackTotal=0
            
            let giftedTypes=[]
            
            out.bubbleBonus=1
            out.flameBonus=1
            out.ownsCrimsonBee=false
            out.ownsCobaltBee=false
            out.cloudBoostAmount=1.15
            out.beeColorAmounts={r:0,b:0,w:0}
            
            for(let i=0;i<20;i++)
                out.stats['beesToLevel'+i]=0

            for(let i in objects.bees){

                for(let k=0;k<=player.hive[objects.bees[i].hiveY][objects.bees[i].hiveX].level;k++){

                    out.stats['beesToLevel'+k]++
                }

                if(out.discoveredBees.indexOf(objects.bees[i].type)<0){

                    out.discoveredBees.push(objects.bees[i].type)
                    out.stats.beeTypes++

                    if(objects.bees[i].gifted) out.discoveredGifteds.push(objects.bees[i].type)
                }

                if(out.discoveredGifteds.indexOf(objects.bees[i].type)<0){

                    out.discoveredGifteds.push(objects.bees[i].type)
                }

                if(player.hive[objects.bees[i].hiveY][objects.bees[i].hiveX].roboDisabled) continue
                
                out.beeColorAmounts[beeInfo[objects.bees[i].type].color[0]]++
                
                out.defaultStats.convertTotal+=objects.bees[i].convertAmount

                out.defaultStats.attackTotal+=objects.bees[i].attack
                
                if(objects.bees[i].gifted&&giftedTypes.indexOf(objects.bees[i].type)<0){
                    
                    giftedTypes.push(objects.bees[i].type)
                    
                    if(beeInfo[objects.bees[i].type].color==='blue'){
                        out.bubbleBonus+=0.1
                    }
                }
                
                if(beeInfo[objects.bees[i].type].color==='red'){
                    
                    out.flameBonus+=objects.bees[i].gifted?0.08:0.04
                }
                
                if(objects.bees[i].type==='crimson'){
                    
                    out.ownsCrimsonBee=true
                }
                
                if(objects.bees[i].type==='cobalt'){
                    
                    out.ownsCobaltBee=true
                }
                
                if(objects.bees[i].type==='windy'&&objects.bees[i].gifted){
                    
                    out.cloudBoostAmount=1.25
                }
                
                if(player.hive[objects.bees[i].hiveY][objects.bees[i].hiveX].beequip){
                    
                    let stats=player.hive[objects.bees[i].hiveY][objects.bees[i].hiveX].beequip.stats.player
                    
                    stats=stats.split(',')
                    
                    for(let i in stats){
                        
                        let str=stats[i]
                        
                        if(str[0]==='*'){

                            player.defaultStats[str.substring(str.indexOf(' ')+1,str.indexOf('('))]*=Number(str.substr(1,str.indexOf(' ')-1))+Number(str.substr(str.indexOf('(')+2,str.length).replace(')',''))
                            
                        } else {
                            
                            player.defaultStats[str.substring(str.indexOf(' ')+1,str.indexOf('('))]+=Number(str.substr(1,str.indexOf(' ')-1))+Number(str.substr(str.indexOf('(')+2,str.length).replace(')',''))
                            
                        }
                    }
                }
            }

            for(let i in giftedTypes){
                
                let b=beeInfo[giftedTypes[i]].giftedHiveBonus

                if(b.oper==='+'){
                    
                    let s=b.stat.split(',')
                    
                    for(let j in s){
                        
                        if(s[j].indexOf('Conversion')>-1){

                            out.defaultStats[s[j]]=MATH.applyPercentage(out.defaultStats[s[j]],b.num)

                        } else {

                            out.defaultStats[s[j]]+=b.num
                        }
                    }
                    
                } else {
                    
                    let s=b.stat.split(',')
                    
                    for(let j in s){
                        
                        out.defaultStats[s[j]]*=b.num
                    }
                }
            }
            
            for(let i in out.effects){
                
                if(effects[out.effects[i].type].isPassive){
                    
                    effects[out.effects[i].type].svg.style.display='none'
                    out.effects.splice(i,1)
                }
            }
            
            for(let i in out.currentGear){
                
                if(i==='tool'||i==='sprinkler') continue
                
                if(i.indexOf('Amulet')>-1){
                    
                    let stats=out.currentGear[i]
                    
                    stats=stats.split(',')
                    
                    for(let i in stats){
                        
                        let str=stats[i]
                        
                        if(str[0]==='*'){
                            
                            out.defaultStats[str.substr(str.indexOf(' ')+1,str.length)]*=Number(str.substr(1,str.indexOf(' ')-1))
                            
                        } else if(str[0]==='+'){
                            
                            out.defaultStats[str.substr(str.indexOf(' ')+1,str.length)]+=Number(str.substr(1,str.indexOf(' ')-1))
                            
                        } else {
                            
                            out.addEffect(str.split(' ')[1])
                            out.defaultStats.capacityMultiplier*=1.25
                        }
                    }
                    
                } else if(i!=='beequips'){
                    
                    if(gear[i][out.currentGear[i]].applyStats)
                        gear[i][out.currentGear[i]].applyStats(out.defaultStats,out)
                }
                
            }
            
            out.defaultStats.capacity*=out.defaultStats.capacityMultiplier

            if(!merelyAGliderStateChange){

                let prevInfo={...player.restrictionInfo}

                out.computeRestrictionInfo()

                for(let i in prevInfo){

                    if(prevInfo[i]!==player.restrictionInfo[i]&&i!=='wall'){

                        window.setTimeout(()=>UPDATE_MAP_MESH(),500)
                        break
                    }
                }
            }
        }
        
        out.currentGear={
            
            tool:'shovel',
            boots:'none',
            belt:'none',
            backpack:'pouch',
            mask:'none',
            leftGuard:'none',
            rightGuard:'none',
            glider:'none',
            sprinkler:'none',
            beequips:[]
        }
        
        out.generateBeequip=function(type){
            
            let p=beequips[type].potentials[(Math.random()*beequips[type].potentials.length)|0],st=beequips[type].generateStats(p)

            out.currentGear.beequips.push({type:type,bee:null,stats:st,id:out.extraInfo.beequipIds++,potential:p,waxes:[]})
            
            out.updateBeequipPage()
        }
        
        out.beequipLookingAt=false
        
        out.updateBeequipPage=function(){
            
            out.beequipPageHTML=''
            
            if(out.beequipLookingAt===false){
                
                if(!out.currentGear.beequips.length) out.beequipPageHTML="<div style='text-align:center;font-size:17px;color:rgb(0,0,0,0.5)'><br>(You have no beequips)</div>"

                for(let i in out.currentGear.beequips){
                    
                    out.beequipPageHTML+=beequips[out.currentGear.beequips[i].type].svgCode.replaceAll('#ID',out.currentGear.beequips[i].id)
                    
                }
                
            } else {
                
                let c=beequips[out.currentGear.beequips[out.beequipLookingAt].type].svgCode.split('</text>')
                
                c=c[c.length-1]
                
                let d=beequips[out.currentGear.beequips[out.beequipLookingAt].type].svgCode.split('<text'),_d='',hd
                
                
                for(let i in d){
                    
                    if(d[i].indexOf('</text>')>-1){
                        
                        if(!hd){
                            
                            hd=true
                            continue
                        }
                        
                        _d+=d[i].substr(d[i].indexOf('>')+1,d[i].indexOf('<'))+' '
                        
                    }
                }
                
                let s=out.currentGear.beequips[out.beequipLookingAt].stats.bee.split(',')
                let stats=''
                
                if(out.currentGear.beequips[out.beequipLookingAt].stats.bee.length){
                    
                    s.sort()
                    
                    for(let i in s){
                        
                        let toAdd=s[i].replace('*','x')
                        
                        toAdd=toAdd.substr(0,toAdd.indexOf(' ')+1)+MATH.doGrammar(toAdd.substring(toAdd.indexOf(' ')+1,toAdd.indexOf('(')))+'<l style="color:rgb(20,160,20)">'+toAdd.substring(toAdd.indexOf('('),toAdd.length)+'</l>'
                        
                        stats+="<p style='color:"+(Number(toAdd.substr(1,toAdd.indexOf(' ')))<1?'rgb(200,0,0)':'rgb(20,160,20)')+";font-size:14px;margin-top:-10px'>"+toAdd+"</p>"
                        
                    }
                }
                
                s=out.currentGear.beequips[out.beequipLookingAt].stats.player.split(',')
                
                if(out.currentGear.beequips[out.beequipLookingAt].stats.player.length){
                    
                    stats+="<br><p style='color:rgb(227, 194, 7);font-size:14px;margin-top:-10px'>[Hive Bonus]</p>"
                    
                    s.sort()
                    
                    for(let i in s){
                        
                        let toAdd=s[i].replace('*','x')
                        
                        toAdd=toAdd.substr(0,toAdd.indexOf(' ')+1)+MATH.doGrammar(toAdd.substring(toAdd.indexOf(' ')+1,toAdd.indexOf('(')))+toAdd.substring(toAdd.indexOf('('),toAdd.length)
                        
                        stats+="<p style='color:rgb(227, 194, 7);font-size:14px;margin-top:-10px'>"+toAdd+"</p>"
                        
                    }
                }

                let waxesCode=[]

                for(let i=0;i<5;i++){
                    
                    let w=out.currentGear.beequips[out.beequipLookingAt].waxes[i]

                    waxesCode.push(w?itemSVGCode[w.substring(1)].replace('SCALE','translate(-24px,-22px) scale(0.5,0.5)')+"<div style='font-size:14px;margin-top:-55px;margin-left:10px'>"+(Number(w[0])?'✔️':'❌')+"</div>":'')
                }
                
                out.beequipPageHTML+="<div onmousedown='window.selectBeequip()' style='position:fixed;left:5px;top:250px;background-color:rgb(240, 196, 0);border:2px solid black;border-radius:4px;text-align:center;width:90px;height:20px;cursor:pointer;'><svg style='margin:0px;width:100px;height:20px'><text x='45' y='16' style='color:black;font-family:cursive;font-size:17px' text-anchor='middle'>Equip"+(out.currentGear.beequips[out.beequipLookingAt].bee&&out.hive[out.currentGear.beequips[out.beequipLookingAt].bee[1]][out.currentGear.beequips[out.beequipLookingAt].bee[0]].type?'ped':'')+"</text></svg></div><div onmousedown='window.deleteBeequip()' style='position:fixed;top:250px;background-color:rgb(240, 0, 0);border:2px solid black;border-radius:4px;left:105px;text-align:center;width:90px;height:20px;cursor:pointer;'><svg style='margin:0px;width:100px;height:20px'><text x='20' y='16' style='color:black;font-family:cursive;font-size:17px'>Delete</text></svg></div><svg style='position:fixed;border-radius:10px;background-color:rgb(240,240,240);width:75px;height:75px;margin-top:28px'>"+c+"<div onmousedown='window.exitBeequipLooking()' style='position:fixed;background-color:rgb(240,0,0);border:2px solid black;border-radius:4px;text-align:center;font-size:19px;font-family:trebuchet ms;width:20px;height:20px;cursor:pointer;'><svg style='margin:0px;width:20px;height:20px'><path stroke='black' stroke-width='2' d='M5 4L15 16M15 4L5 16'></path></svg></div><div style='position:fixed;background-color:rgb(240,240,240);border-radius:10px;text-align:center;font-size:19px;font-family:trebuchet ms;margin-left:28px;width:172px;padding-bottom:2px;'>"+MATH.doGrammar(out.currentGear.beequips[out.beequipLookingAt].type.replaceAll('candycane','candyCane'))+"</div><div style='position:fixed;background-color:rgb(240,240,240);margin-left:80px;margin-top:29px;border-radius:10px;font-size:13px;padding-top:0px;font-family:trebuchet ms;width:113px;padding-left:7px;padding-top:3px;padding-bottom:3px;'>Level: "+beequips[out.currentGear.beequips[out.beequipLookingAt].type].level+"</div><div style='position:fixed;background-color:rgb(240,240,240);margin-left:80px;margin-top:55px;border-radius:10px;padding-left:7px;padding-top:3px;padding-bottom:3px;font-size:13px;font-family:trebuchet ms;width:113px;'>Color: "+MATH.doGrammar(beequips[out.currentGear.beequips[out.beequipLookingAt].type].color)+"</div><div style='position:fixed;background-color:rgb(240,240,240);margin-left:80px;margin-top:81px;border-radius:10px;padding-left:7px;padding-top:3px;padding-bottom:3px;font-size:13px;font-family:trebuchet ms;width:113px;'>Potential: "+out.currentGear.beequips[out.beequipLookingAt].potential+"</div><svg style='postition:fixed;left:0px;top:107px;width:20px;height:20px'><path stroke='black' stroke-width='2' d='M5 4L15 16M15 4L5 16'></path></svg><div style='background-color:rgb(240,240,240);margin-left:2px;margin-top:112px;border-radius:9px;padding-left:7px;padding-top:3px;padding-bottom:3px;width:30px;height:30px;'>"+waxesCode[0]+"</div><div style='background-color:rgb(240,240,240);margin-left:42px;margin-top:-36px;border-radius:9px;padding-left:7px;padding-top:3px;padding-bottom:3px;width:30px;height:30px;'>"+waxesCode[1]+"</div><div style='background-color:rgb(240,240,240);margin-left:82px;margin-top:-36px;border-radius:9px;padding-left:7px;padding-top:3px;padding-bottom:3px;width:30px;height:30px;'>"+waxesCode[2]+"</div><div style='background-color:rgb(240,240,240);margin-left:122px;margin-top:-36px;border-radius:9px;padding-left:7px;padding-top:3px;padding-bottom:3px;width:30px;height:30px;'>"+waxesCode[3]+"</div><div style='background-color:rgb(240,240,240);margin-left:162px;margin-top:-36px;border-radius:9px;padding-left:7px;padding-top:3px;padding-bottom:3px;width:30px;height:30px;'>"+waxesCode[4]+"</div><div style='background-color:rgb(240,240,240);margin-left:0px;margin-top:5px;border-radius:10px;padding-left:7px;padding-top:3px;padding-bottom:3px;font-size:12px;font-family:trebuchet ms;width:193px;'>"+_d+beequips[out.currentGear.beequips[out.beequipLookingAt].type].reqStr+stats.replaceAll('(+0)','')+(beequips[out.currentGear.beequips[out.beequipLookingAt].type].extraAbility?'<br><p style="font-size:15px">+Ability: '+MATH.doGrammar(beequips[out.currentGear.beequips[out.beequipLookingAt].type].extraAbility.split('_')[1])+'</p>':'')+"</div>"
                
            }
        }

        out.beesPageBee=false

        window.exitBeesPageBee=function(){

            out.beesPageBee=false
            out.updateBeesPage()
        }

        out.updateBeesPage=function(){

            pages[2].scrollTop=0
            pages[2].innerHTML=''
            pages[2].style.backgroundColor='rgba(195,195,195,0.9)'

            if(out.beesPageBee){

                pages[2].style.backgroundColor='rgb(160,150,0,0.9)'

                let img=document.createElement('canvas')

                img.width=76
                img.height=76
                img.style.borderRadius='5px'
                img.style.margin='5px'
                img.style.marginLeft='5px'
                img.style.marginTop='35px'

                let img_ctx=img.getContext('2d')

                img_ctx.drawImage(beeCanvas,beeInfo[out.beesPageBee].u*2048,beeInfo[out.beesPageBee].v*2048,128,128,0,0,76,76)

                let count=0,gifted,gb=beeInfo[out.beesPageBee].giftedHiveBonus,giftedBonusStr='',_gb=gb.stat.split(','),col=['energy','speed','attack','gather','convert']

                for(let i in _gb){

                    giftedBonusStr+='<br>'+gb.oper.replace('*','x')+(gb.oper=='*'?gb.num:(gb.num*100)+'%')+' '+MATH.doGrammar(_gb[i])
                }

                for(let y in out.hive){

                    for(let x in out.hive[y]){

                        if(out.hive[y][x].type===out.beesPageBee){

                            count++
                            
                            if(out.hive[y][x].gifted){

                                gifted=true
                            }
                        }
                    }
                }

                for(let i in col){

                    let c=col[i],color=[230,220,150]

                    if(c==='gather'||c==='convert'){

                        let value=MATH.constrain(((beeInfo[out.beesPageBee][c+'Amount']/beeInfo[out.beesPageBee][c+'Speed'])-(beeInfo.basic[c+'Amount']/beeInfo.basic[c+'Speed']))*0.05,-1,1),_v=value

                        value*=value

                        if(_v<0){vec3.lerp(color,color,[255,0,0],value)} else {vec3.lerp(color,color,[0,255,0],value)}

                    } else {

                        let value=MATH.constrain((beeInfo[out.beesPageBee][c]-beeInfo.basic[c])*{attack:0.4,energy:0.15,speed:0.3}[c],-1,1),_v=value

                        value*=value

                        if(_v<0){vec3.lerp(color,color,[255,0,0],value)} else {vec3.lerp(color,color,[0,255,0],value)}

                    }

                    col[i]='rgb('+color[0]+','+color[1]+','+color[2]+')'
                }

                // CHQ: Label for bee description in bee page
                pages[2].innerHTML+="<div style='margin-left:3px;margin-top:-118px;width:188px;height:26px;background-color:rgb(245,235,90);border-radius:2px;padding-left:3px;padding-top:2px;font-family:trebuchet ms;font-size:19px;text-align:center'><div style='position:absolute;left:8px;top:7px;width:20px;height:20px;font-size:19px;background-color:rgb(255,0,0);cursor:pointer;border:2px solid black;border-radius:4px;padding-top:0px'><div style='margin-top:-3px' onclick='window.exitBeesPageBee()'>x</div></div>&nbsp;&nbsp;"+MATH.doGrammar(out.beesPageBee)+" Bee</div><div style='margin-left:90px;margin-top:5px;width:103px;height:16px;background-color:rgb(230,220,150);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'>"+MATH.doGrammar(beeInfo[out.beesPageBee].rarity)+"</div><div style='margin-left:90px;margin-top:3px;width:103px;height:16px;background-color:rgb(230,220,150);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'>"+MATH.doGrammar(beeInfo[out.beesPageBee].color)+"</div><div style='margin-left:90px;margin-top:3px;width:103px;height:16px;background-color:"+col[0]+";border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'>Energy: "+beeInfo[out.beesPageBee].energy+"</div><div style='margin-left:90px;margin-top:3px;width:103px;height:16px;background-color:"+col[1]+";border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'>Speed: "+beeInfo[out.beesPageBee].speed+"</div><div style='margin-left:90px;margin-top:3px;width:103px;height:16px;background-color:"+col[2]+";border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'>Attack: "+beeInfo[out.beesPageBee].attack+"</div><div style='margin-left:0px;margin-top:-15px;width:90px;height:16px;background-color:rgb(0,0,0,0);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center'><b>x"+count+"</b>"+(gifted?'&nbsp;&nbsp;&nbsp;&nbsp;⭐':'')+"</div><div style='margin-left:5px;margin-top:5px;width:188px;height:16px;background-color:"+col[3]+";border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center;padding-top:1px;padding-bottom:1px;'>Collects "+beeInfo[out.beesPageBee].gatherAmount+" pollen in "+beeInfo[out.beesPageBee].gatherSpeed+"s</div><div style='margin-left:5px;margin-top:3px;width:188px;height:16px;background-color:"+col[4]+";border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center;padding-top:1px;padding-bottom:1px;'>Makes "+beeInfo[out.beesPageBee].convertAmount+" honey in "+beeInfo[out.beesPageBee].convertSpeed+"s</div><div style='margin-left:5px;margin-top:3px;width:188px;background-color:rgb(230,220,150);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center;padding-top:1px;padding-bottom:1px;'><b>⭐ Gifted Hive Bonus ⭐</b><div style='margin-top:-8px'>"+giftedBonusStr+"</div></div>"

                let tokens=[]

                if(beeInfo[out.beesPageBee].tokens)
                    tokens.push(...beeInfo[out.beesPageBee].tokens)

                if(beeInfo[out.beesPageBee].attackTokens)
                    tokens.push(...beeInfo[out.beesPageBee].attackTokens)

                for(let i=tokens.length;i--;){

                    if(tokens.indexOf(tokens[i])!==i){

                        tokens.splice(i,1)
                    }
                }

                for(let i in tokens){

                    pages[2].innerHTML+="<div style='margin-left:5px;margin-top:3px;width:188px;background-color:rgb(230,220,150);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center;padding-top:2px;padding-bottom:2px;'><b>["+(tokens[i].indexOf('*')>-1?'⭐':'')+MATH.doGrammar(tokens[i].replace('*','')).replace(' _','+')+"</b>"+(tokens[i].indexOf('*')>-1?'⭐':'')+"]<br><br><div style='font-size:11px;user-select:text;padding-left:4px;padding-right:4px;'>"+(effects[tokens[i].replace('*','')]?effects[tokens[i].replace('*','')].desc:'ERROR DESCRIPTION UNDEFINED')+"</div></div>"
                }

                let passive

                switch(out.beesPageBee){

                    case 'fire':passive=['Gathering Flames',"Has a 35%(50% if gifted) to summon a flame when collecting.<br><br>Flames last for 3s, collecting 10R/4W/1B pollen from 9 nearby flowers every second. Pollen collected is multiplied by 4% per red bee(8% is gifted). Flames also deal 15 damage to mobs every second. Standing in flames grant Flame Heat, lasting for 20s, and giving up to x2 red pollen and x1.2 bee attack."]
                    break

                    case 'bubble':passive=['Gathering Bubbbles',"Has a 35%(50% if gifted) to summon a bubble when collecting.<br><br>Bubbles last for 10s. When popped, they collect 10B/6W/2R pollen and replenish 33 flowers. Pollen collected is multiplied by 10% per gifted blue bee type."]
                    break

                    case 'demon':passive=['Gathering Flames',"Has a 55%(75% if gifted) to summon a flame when collecting.<br><br>Flames last for 3s, collecting 10R/4W/1B pollen from 9 nearby flowers every second. Pollen collected is multiplied by 4% per red bee(8% is gifted). Flames also deal 15 damage to mobs every second. Standing in flames grant Flame Heat, lasting for 20s, and giving up to x2 red pollen and x1.2 bee attack."]
                    break

                    case 'diamond':passive=['Shimmering Honey',"Whenever this bee converts at the hive, it grants 40% bonus honey (+3% per level). This bonus is doubled if the bee is gifted."]
                    break

                    case 'shy':passive=['Nectar Lover',"Shy Bee is x2(x2.5 if gifted) as likely to drink from a planter than any other bee. When drinking it also collects x2(x2.5 if gifted) as much nectar and contributes x2(x2.5 if gifted) as much to the growth of the planter."]
                    break

                    case 'tadpole':passive=['Gathering Bubbbles+',"Has a 55%(75% if gifted) to summon a bubble when collecting.<br><br>Bubbles last for 10s. When popped, they collect 10B/6W/2R pollen and replenish 33 flowers. Pollen collected is multiplied by 10% per gifted blue bee type."]
                    break

                    case 'digital':passive=['Drive Expansion',"When using drives, this bee is permanently upgraded. A maximum of 50 drives of each type can be applied.<br><br>• Red drives grant up to +15 attack.<br><br>• Blue drives grant up to +1,000 convert amount.<br><br>• White drives grant up to +125 gather amount.<br><br>• Glitched drives grant up to +37.5% ability rate.<br><br>• Maxing out all types of drives grants the bee +10 speed.<br><br>"]
                    break

                    case 'fuzzy':passive=['Fuzzy Coat',"When collecting, this bee has a large chance to pollinate nearby flowers.<br><br>When a flower is pollinated, it moves up a tier. If the flower is already at it's maximum pollination, it is replenished. Flowers can be at the single, double, triple, large, or star tier. Pollen from the flower is multiplied based on it's tier, and higher tier flowers deplete slower. Over time, flowers naturally downgrade to it's original tier."]
                    break

                    case 'spicy':passive=['Steam Engine',"This bee's gather speed and movespeed increases up to x1.5 with Flame Heat."]
                    break

                    case 'precise':passive=['Sniper',"This bee uses slower, long ranged attacks. Its attack's accuracy is calculated as if the bee's lvl is 1(2 if gifted) higher and can never be below 5%. It deals x1.5(x2 if gifted) damage per hit."]
                    break

                    case 'buoyant':passive=['Balloon Enthusiast',"As Dat's favorite bee, this bee gains the advantage of *favoritism*. With *favoritism*, it emits a shiny golden glowing effect. It also recieves x1.5 bond and is x1.15 more likely to become gifted when fed its favorite treat.<br><br>When converting from balloons, this bee gains x3(x4 if gifted, buffed due to *favoritism*) convert rate. Additionally, this bee's base attack scales up to x3 with Balloon Blessing."]
                    break
                }

                if(passive){

                    pages[2].innerHTML+="<div style='margin-left:5px;margin-top:3px;width:188px;background-color:rgb(230,220,150);border-radius:2px;padding-left:3px;font-family:trebuchet ms;font-size:13px;text-align:center;padding-top:2px;padding-bottom:2px;'><b>[Passive: "+passive[0]+"]</b><br><br><div style='font-size:11px;user-select:text;padding-left:4px;padding-right:4px;'>"+passive[1]+"</div></div>"
                }

                pages[2].prepend(img)

            } else {

                pages[2].innerHTML='<div style="margin-top:3px;background-color:rgb(240,240,240);text-align:center;font-size:15px;border-radius:8px;font-family:trebuchet ms;padding:3px">You have '+objects.bees.length+' bees</div><div style="margin-top:3px;background-color:rgb(240,240,240);text-align:center;font-size:15px;border-radius:8px;font-family:trebuchet ms;padding:3px">Discovered '+out.discoveredBees.length+' bee types</div><div style="margin-top:2px;margin-bottom:5px;background-color:rgb(240,240,240);text-align:center;font-size:15px;border-radius:8px;font-family:trebuchet ms;padding:3px">Discovered '+out.discoveredGifteds.length+' gifted types</div>'

                let sortedBeeInfo={},unsorted=[]

                for(let i in beeInfo) unsorted.push(i)

                unsorted.sort()

                unsorted.sort((a,b)=>['common','rare','epic','legendary','mythic','event'].indexOf(beeInfo[a].rarity)-['common','rare','epic','legendary','mythic','event'].indexOf(beeInfo[b].rarity))

                for(let i in unsorted) sortedBeeInfo[unsorted[i]]=beeInfo[unsorted[i]]

                for(let i in sortedBeeInfo){

                    let div=document.createElement('div'),img=document.createElement('canvas'),text=document.createElement('div')

                    div.style.cursor='pointer'
                    div.style.width='195px'
                    div.style.height='70px'
                    div.style.marginTop='3px'
                    div.style.borderRadius='5px'
                    div.style.backgroundColor=beeInfo[i].color==='red'?'rgb(255,0,0,0.5)':beeInfo[i].color==='blue'?'rgb(0,0,255,0.5)':'rgb(255,255,255,0.5)'

                    img.width=70
                    img.height=70
                    img.style.borderTopLeftRadius='5px'
                    img.style.borderBottomLeftRadius='5px'

                    let img_ctx=img.getContext('2d')

                    img_ctx.drawImage(beeCanvas,beeInfo[i].u*2048,beeInfo[i].v*2048,128,128,0,0,70,70)

                    text.innerHTML="<p style='margin-left:70px;margin-top:-70px;font-family:trebuchet ms;font-size:17px;text-align:center'>"+MATH.doGrammar(i)+" Bee</p>"+"<p style='margin-left:73px;margin-top:-13px;font-family:trebuchet ms;font-size:9px;text-align:center;width:122px'>"+(out.discoveredBees.indexOf(i)>-1?beeInfo[i].description:'<br>(Undiscovered)')+"</p>"

                    div.appendChild(img)
                    div.appendChild(text)

                    div.onclick=function(){
                        
                        out.beesPageBee=i
                        out.updateBeesPage()
                    }

                    pages[2].appendChild(div)
                }
            }
        }
        
        out.updateGear=function(merelyAGliderStateChange){

            out.sprinklers=[]
            out.sprinklerMesh=new Mesh(true)
            out.sprinklerMesh.setBuffers()
            out.currentSprinkler=0

            for(let i=0;i<gear.sprinkler[out.currentGear.sprinkler].count;i++){

                out.sprinklers.push(new Sprinkler())
            }
            
            out.computeStats(merelyAGliderStateChange)

            out.toolMesh.setMeshFromFunction(function(box,a,cylinder,sphere,applyFinalRotation,c,star){
                
                gear.tool[out.currentGear.tool].mesh(box,cylinder,sphere,star,applyFinalRotation)
            })

            out.toolMesh.setBuffers()

            playerMesh.setMeshFromFunction(function(box,a,cylinder,sphere,applyFinalRotation,c,star){
                
                box(0,0,0,0.5,1,0.5,false,[1.45,1.45,1])

