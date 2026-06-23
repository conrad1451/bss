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

for (let i in beeInfo) {
  if (beeInfo[i].rarity === "event") {
    let id = i + "BeeEgg";

    // CHQ: Label for eggs in inventory
    pages[0].innerHTML +=
      "<svg id='" +
      id +
      "' style='width:200px;height:70px;cursor:pointer;border-radius:5px'><rect width='200' height='70' fill='rgb(255,255,255)'></rect><rect width='70' height='70' fill='rgb(225,225,225)'></rect><text x='132' y='18' style='font-family:trebuchet ms;font-size:16.5px;' fill='rgb(0,0,0)' text-anchor='middle'>" +
      MATH.doGrammar(i) +
      " Bee Egg</text><text x='132' y='39' style='font-family:trebuchet ms;font-size:12px;' fill='rgb(0,0,0)' text-anchor='middle'>A permanent egg that</text><text x='130' y='53' style='font-family:trebuchet ms;font-size:12px;' fill='rgb(0,0,0)' text-anchor='middle'>always hatches into</text><text x='132' y='66' style='font-family:trebuchet ms;font-size:12px;' fill='rgb(0,0,0)' text-anchor='middle'>a " +
      MATH.doGrammar(i) +
      " Bee!</text><text id='" +
      id +
      "_amount' x='67' y='67' style='font-family:calibri;font-size:14px;' fill='rgb(0,0,0)' text-anchor='end'></text><path fill='rgb(255,255,0)' stroke='rgb(0,0,0)' stroke-width='1.5' d='M35 15C 20 17 10 55 35 55M35 15C 50 17 60 55 35 55'></path><path fill='rgb(0,0,0)' d='M20 30 C 20 40 50 40 50 30L50 40C50 50 20 50 20 40'></path><path fill='rgb(0,0,0,0.3)' d='M47 25C 57 56 35 60 23 50C 32 48 41 50 50 35'></path></svg>";

    items[i + "BeeEgg"] = {
      canUseOnSlot: (slot) => {
        return true;
      },
      amount: 0,
      u: (128 * 4) / 2048,
      v: (128 * 5) / 2048,
      value: Infinity,
      use: function () {
        for (let j in objects.bees) {
          if (objects.bees[j].type === i) {
            player.addMessage(
              "You can only have 1 " + MATH.doGrammar(i) + " Bee!",
              COLORS.redArr,
            );
            return;
          }
        }

        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].type = i;
        player.hive[player.hiveIndex[1]][player.hiveIndex[0]].gifted = false;

        player.beePopup = {
          type: i,
          message: "You hatched a...",
          time: TIME,
          gifted: false,
        };

        player.updateHive();
      },
    };
  }
}

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
