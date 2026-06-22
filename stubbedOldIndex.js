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

class Target {
        
        constructor(field,x,z,type,bee){
            
            this.bee=bee
            this.field=field
            this.x=x
            this.z=z
            this.type=type
            this.pos=[fieldInfo[this.field].x+this.x,fieldInfo[this.field].y,fieldInfo[this.field].z+this.z]
            this.col=this.type===3&&bee.gifted?[0.9,0,0.9]:[1,0.7,0]
            
            this.trail=new TrailRenderer.Trail({length:2,size:0.04,color:[1,0,0,1]})
        }
        
        die(index){
            
            this.trail.splice=true
            
            objects.explosions.push(new ReverseExplosion({col:this.activated?[0,1,0]:[1,0,0],pos:this.pos,life:0.5,size:3,alpha:1,height:3}))
            
            if(vec3.sqrDist(this.pos,[player.body.position.x,player.body.position.y,player.body.position.z])<=4.5){
                
                let amountToConvert=Math.min((player.convertTotal*0.5)+(15*this.bee.convertAmount*player.convertRate*player[beeInfo[this.bee.type].color+'ConvertRate'])*(player.flameHeatStack*10),player.pollen)
                
                player.pollen-=amountToConvert
                
                if(player.extraInfo.enablePollenText)
                    textRenderer.add(Math.ceil(amountToConvert*0.5),[player.body.position.x,player.body.position.y+Math.random()*2+0.5,player.body.position.z],COLORS.honey,0,'+')
                
                let hpt=amountToConvert/5
                
                for(let i=0;i<MATH.TWO_PI;i+=MATH.TWO_PI/5){
                    
                    objects.tokens.push(new LootToken(30,[this.pos[0]+Math.cos(i),fieldInfo[this.field].y+1,this.pos[2]+Math.sin(i)],'honey',Math.ceil(hpt),true,'Target Practice'))
                }
                
                player.addEffect('flameHeat',-1)
            }
            
            objects.targets.splice(index,1)
        }
        
        update(){
            
            this.trail.addPos(this.pos)
            this.trail.addPos(this.bee.pos)
            this.trail.color=[...this.col,0.75]
            
            if(vec3.sqrDist(this.pos,[player.body.position.x,player.body.position.y,player.body.position.z])<=4){
                
                this.col=[0,1,0]
                this.activated=true
            }
            
            meshes.cylinder_explosions.instanceData.push(this.pos[0],this.pos[1],this.pos[2],this.col[0],this.col[1],this.col[2],0.5,1.75,0.75)
            
            return this.splice
        }
    } 

    class PetalShuriken {
        
        constructor(pos,vel){
            
            this.pos=[...pos,0]
            this.vel=vel
            this.life=1.5
            
            vec3.scale(vel,vel,10)
            
            this.hitBees=[]
        }
        
        die(index){
            
            objects.mobs.splice(index,1)
        }
        
        update(){
            
            this.life-=dt
            
            this.pos[0]+=this.vel[0]*dt
            this.pos[2]+=this.vel[2]*dt
            this.pos[3]+=dt*10
            
            for(let i in objects.bees){
                
                let b=objects.bees[i]
                
                if(this.hitBees.indexOf(i)<0&&Math.abs(b.pos[0]-this.pos[0])+Math.abs(b.pos[1]-this.pos[1])+Math.abs(b.pos[2]-this.pos[2])<1){
                    
                    objects.explosions.push(new Explosion({col:Math.random()<0.5?[1,0.9,0]:[1,0,0.825],pos:this.pos.slice(),life:0.5,size:1.2,speed:0.35,aftershock:0.005}))
                    
                    this.hitBees.push(i)
                    
                    let amountToConvert=Math.ceil(Math.min(player.pollen,10000+b.convertAmount*7.5*player[beeInfo[b.type].color+'ConvertRate']))
                    
                    player.pollen-=amountToConvert
                    player.honey+=Math.ceil(amountToConvert*player.honeyPerPollen)
                    
                    if(amountToConvert)
                        textRenderer.add(Math.ceil(amountToConvert*player.honeyPerPollen)+'',[b.pos[0],b.pos[1]+0.75,b.pos[2]],COLORS.honey,1,'⇆')
                }
            }
            
            for(let i in objects.bubbles){
                
                let b=objects.bubbles[i]
                
                if(vec3.sqrDist(this.pos,b.pos)<=4.5){
                    
                    b.pop()
                }
            }
            
            for(let i in objects.fuzzBombs){
                
                let b=objects.fuzzBombs[i]
                
                if(vec3.sqrDist(this.pos,b.pos)<=3.5){
                    
                    b.pop()
                }
            }
            
            for(let i in objects.tokens){
                
                let b=objects.tokens[i]
                
                if(vec3.sqrDist(this.pos,b.pos)<=3.5&&!(objects.tokens[i] instanceof DupedToken)){
                    
                    b.collect()
                }
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER,meshes.petalShuriken.vertBuffer)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,meshes.petalShuriken.indexBuffer)
            gl.vertexAttribPointer(glCache.mob_vertPos,3,gl.FLOAT,gl.FLASE,24,0)
            gl.vertexAttribPointer(glCache.mob_vertColor,3,gl.FLOAT,gl.FLASE,24,12)
            gl.uniform4fv(glCache.mob_instanceInfo1,this.pos)
            gl.uniform2f(glCache.mob_instanceInfo2,1,this.life*1.75)
            gl.drawElements(gl.TRIANGLES,meshes.petalShuriken.indexAmount,gl.UNSIGNED_SHORT,0)
        
            return this.life<=0
        }
    }

// BugMob, CoconutCrab, Mechsquito, CogMower, CogTurret are moved to separate modules

    class RogueViciousBee {
        
        constructor(field,level){
            
            this.spikes=[]

            this.field=field
            this.state='hiding'
            this.starSawHitTimer=0
            this.level=level
            this.health=1000+(level-1)*2000
            this.maxHealth=this.health
            this.pos=[fieldInfo[this.field].x+((MATH.random(0.2,0.8)*fieldInfo[this.field].width)|0),fieldInfo[this.field].y+3,fieldInfo[this.field].z+((MATH.random(0.2,0.8)*fieldInfo[this.field].length)|0)]
            this.flameTimer=0
            this.waitTimer=0
            this.target=[this.pos[0],this.pos[2]]
            this.bodySize=1.5
            this.timeLimit=5*60
            this.maxTimeLimit=this.timeLimit

            this.addSpikeAttackTimer=0
            this.nextAttackTimer=0
            this.attackAlternate=0

            this.mindHacked=0
        }
        
        die(index){
            
            objects.mobs.splice(index,1)
        }
        
        damage(am){
            
            let crit=Math.random()<player.criticalChance,superCrit=Math.random()<player.superCritChance,d=am*(crit?superCrit?player.superCritPower*player.criticalPower:player.criticalPower:1)
            
            if(this.mindHacked>0)
                d*=1.25

            this.health-=d|0
            textRenderer.add((d|0)+'',[this.pos[0],this.pos[1]+Math.random()*2.75+1.5,this.pos[2]],[255,0,0],crit?superCrit?2:1:0,'',[0,1.25,1.275,1.3,1.65,1.75][Math.min(d.toString().length),5])
        }
        
        update(){
            
            switch(this.state){
                
                case 'dead':
                    
                    return true
                    
                break

                case 'hiding':

                    if(Math.abs(player.body.position.x-this.pos[0])+Math.abs(player.body.position.z-this.pos[2])+Math.abs(this.pos[1]-2.5-player.body.position.y)<2){

                        objects.explosions.push(new Explosion({col:[1,0,0],pos:[this.pos[0],this.pos[1]+0.5,this.pos[2]],life:1,size:5,speed:0.25,aftershock:0.005}))

                        player.addMessage("⚠️You've found a Rogue Vicious Bee!⚠️",[0,0,0])
                        this.state='attack'
                        player.damage(20)
                    }

                    gl.bindBuffer(gl.ARRAY_BUFFER,meshes.spike.vertBuffer)
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,meshes.spike.indexBuffer)
                    gl.vertexAttribPointer(glCache.mob_vertPos,3,gl.FLOAT,gl.FLASE,24,0)
                    gl.vertexAttribPointer(glCache.mob_vertColor,3,gl.FLOAT,gl.FLASE,24,12)
                    gl.uniform2f(glCache.mob_instanceInfo2,0.55,1)
                    gl.uniform4fv(glCache.mob_instanceInfo1,[this.pos[0],this.pos[1]-4,this.pos[2],0])
                    gl.drawElements(gl.TRIANGLES,meshes.spike.indexAmount,gl.UNSIGNED_SHORT,0)

                break
                
                case 'attack':
                    
                    if(this.health<=0||this.timeLimit<=0){
                        
                        if(this.timeLimit<=0) return true
                        
                        player.stats.rogueViciousBee++
                        this.state='dead'

                        let am=Math.floor(this.level*this.level*this.level*1000+2500),sm=((this.level*0.5)|0)+3

                        player.honey+=am
                        items.stinger.amount+=sm

                        textRenderer.add(am+'',[player.body.position.x,player.body.position.y+2,player.body.position.z],COLORS.honey,0,'+')
                        player.addMessage('+'+MATH.addCommas(am+'')+' Honey (from Rogue Vicious Bee)')
                        player.addMessage('+'+MATH.addCommas(sm+'')+' Stingers (from Rogue Vicious Bee)')
                        
                        player.updateInventory()
                        
                        return
                    }
                    
                    this.mindHacked-=dt
                    this.timeLimit-=dt
                    this.starSawHitTimer-=dt
                    this.flameTimer-=dt
                    
                    if(this.flameTimer<=0){
                        
                        this.flameTimer=1
                        
                        for(let f in objects.flames){
                            
                            if(Math.abs(this.pos[0]-objects.flames[f].pos[0])+Math.abs(this.pos[2]-objects.flames[f].pos[2])<this.bodySize){
                                
                                this.damage(objects.flames[f].dark?25:15)
                            }
                        }
                    }
                    
                    if(player.fieldIn===this.field){
                        
                        player.attacked.push(this)
                    }
                    
                    if(this.mindHacked<=0){

                        let d=[this.target[0]-this.pos[0],this.target[1]-this.pos[2]]

                        if(Math.abs(d[0])+Math.abs(d[1])<0.75&&this.attackState===undefined){

                            this.attackState=(this.attackAlternate++)%2
                            this.nextAttackTimer=7.5

                        } else if(this.attackState===undefined){
                            
                            vec2.normalize(d,d)
                            
                            this.pos[0]+=d[0]*dt*6
                            this.pos[2]+=d[1]*dt*6

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,d[0],0,d[1],BEE_FLY,beeInfo.vicious.u,beeInfo.vicious.v,beeInfo.vicious.meshPartId)
                        }

                        if(this.nextAttackTimer<=0){

                            this.target=[fieldInfo[this.field].x+((Math.random()*fieldInfo[this.field].width)|0),fieldInfo[this.field].z+((Math.random()*fieldInfo[this.field].length)|0)]
                            this.attackState=undefined
                            this.nextAttackTimer=Infinity
                        }

                        if(this.attackState===0){

                            this.nextAttackTimer-=dt
                            this.addSpikeAttackTimer-=dt

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,Math.sin(TIME*8),0,Math.cos(TIME*8),BEE_FLY,beeInfo.vicious.u,beeInfo.vicious.v,beeInfo.vicious.meshPartId)

                            if(this.addSpikeAttackTimer<=0){

                                this.spikes.push({pos:[fieldInfo[this.field].x+((Math.random()*fieldInfo[this.field].width)|0),fieldInfo[this.field].y+0.51-10,fieldInfo[this.field].z+((Math.random()*fieldInfo[this.field].length)|0),0],life:2.5,glow:0,y:fieldInfo[this.field].y+0.51})

                                this.addSpikeAttackTimer=0.15
                            }

                        } else if(this.attackState===1){
                            
                            this.nextAttackTimer-=dt
                            this.addSpikeAttackTimer-=dt

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,player.body.position.x-this.pos[0],player.body.position.y-this.pos[1],player.body.position.z-this.pos[2],BEE_FLY,beeInfo.vicious.u,beeInfo.vicious.v,beeInfo.vicious.meshPartId)

                            if(this.addSpikeAttackTimer<=0){

                                this.spikes.push({pos:[fieldInfo[this.field].x+player.flowerIn.x,fieldInfo[this.field].y+0.51-10,fieldInfo[this.field].z+player.flowerIn.z,0],life:2.5,glow:0,y:fieldInfo[this.field].y+0.51})

                                this.addSpikeAttackTimer=0.5
                            }
                        }

                        gl.bindBuffer(gl.ARRAY_BUFFER,meshes.spike.vertBuffer)
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,meshes.spike.indexBuffer)
                        gl.vertexAttribPointer(glCache.mob_vertPos,3,gl.FLOAT,gl.FLASE,24,0)
                        gl.vertexAttribPointer(glCache.mob_vertColor,3,gl.FLOAT,gl.FLASE,24,12)
                        gl.uniform2f(glCache.mob_instanceInfo2,0.5,1)
                        
                        for(let i=this.spikes.length;i--;){

                            let s=this.spikes[i]

                            this.spikes[i].life-=dt
                            this.spikes[i].glow+=dt

                            if(s.life<1&&s.life>0.5){
                                
                                s.pos[1]+=(s.y+2-s.pos[1])*dt*22

                                meshes.cylinder_explosions.instanceData.push(s.pos[0],s.y,s.pos[2],1,0,0,s.glow,1.5,0.001)

                            } else if(s.life<0.5){
                                
                                s.pos[1]+=(s.y-10-s.pos[1])*dt*10

                            } else {

                                meshes.cylinder_explosions.instanceData.push(s.pos[0],s.y,s.pos[2],1,0,0,s.glow,1.5,0.001)
                            }

                            if(Math.abs(player.body.position.x-s.pos[0])+Math.abs(player.body.position.z-s.pos[2])+Math.abs(s.pos[1]-player.body.position.y)<1.5&&!s.damaged){

                                s.damaged=true
                                player.damage(40)
                            }

                            gl.uniform4fv(glCache.mob_instanceInfo1,s.pos)
                            gl.drawElements(gl.TRIANGLES,meshes.spike.indexAmount,gl.UNSIGNED_SHORT,0)

                            if(s.life<=0){

                                this.spikes.splice(i,1)
                            }
                        }

                    } else {

                        meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,Math.random()-0.5,Math.random()-0.5,Math.random()-0.5,BEE_FLY,beeInfo.vicious.u,beeInfo.vicious.v,beeInfo.vicious.meshPartId)

                        textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,0,...textRenderer.decalUV.smiley,0.75,0,0,-2,-2,0)
                    }
                    
                    this.pos[1]+=1.25
                    textRenderer.addCTX('Rogue Vicious Bee (Level '+this.level+')',[this.pos[0],this.pos[1]+0.9,this.pos[2]],COLORS.whiteArr,100)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,1.5,...textRenderer.decalUV['rect'],0.61*0.5,0.42*0.5,0.27*0.5,2.5,0.4,0)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],(-0.5+(this.timeLimit/this.maxTimeLimit)*0.5)/(this.timeLimit/this.maxTimeLimit),1.5,...textRenderer.decalUV['rect'],0.61,0.42,0.27,this.timeLimit*2.5/this.maxTimeLimit,0.4,0)
                    
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,0,...textRenderer.decalUV['rect'],0.6,0,0,2.5,0.4,0)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],(-0.5+(this.health/this.maxHealth)*0.5)/(this.health/this.maxHealth),0,...textRenderer.decalUV['rect'],0.2,0.85,0.2,this.health*2.5/this.maxHealth,0.4,0)
                    
                    textRenderer.addSingle('HP: '+MATH.addCommas((this.health|0)+''),this.pos,COLORS.whiteArr,-1,false,false)
                    textRenderer.addSingle('Time: '+MATH.doTime((this.timeLimit|0)+''),this.pos,COLORS.whiteArr,-1,false,false,0,0.6)
                    this.pos[1]-=1.25
                    
                break
                
            }
            
        }
    }

    class WildWindyBee {
        
        constructor(field,pos){

            this.field=field
            this.starSawHitTimer=0
            this.level=1
            this.health=250
            this.maxHealth=this.health
            this.pos=pos
            this.pos[1]-=2
            this.flameTimer=0
            this.waitTimer=0
            this.target=[this.pos[0],this.pos[2]]
            this.bodySize=1.5
            this.timeLimit=5*60
            this.maxTimeLimit=this.timeLimit
            this.state='attack'

            this.mindHacked=0

            this.tornados=[]
            this.nextAttackTimer=0
            this.attackAlternate=0

            this.trails=[new TrailRenderer.ConstantTrail({length:9,size:0.4,color:[0.5,0.5,0.5,0.6]}),new TrailRenderer.ConstantTrail({length:9,size:0.4,color:[0.5,0.5,0.5,0.6],vertical:true})]
            this.whipWarning=new TrailRenderer.ConstantTrail({length:5,size:0.05,color:[0.85,0,0,1]})

            this.windWhipTrails=[{trail:new TrailRenderer.ConstantTrail({length:10,triangle:true,size:1.1,color:[0.5,0.6,0.6,1]})},{trail:new TrailRenderer.ConstantTrail({length:10,triangle:true,size:1.9,color:[0.8,0.8,0.8,1]})},{trail:new TrailRenderer.ConstantTrail({length:10,triangle:true,size:1.55,color:[0.4,0.5,0.7,1]})}]
            
        }
        
        die(index){
            
            this.trails[0].splice=true
            this.trails[1].splice=true
            this.whipWarning.splice=true

            for(let i in this.windWhipTrails){

                this.windWhipTrails[i].trail.splice=true
            }

            objects.mobs.splice(index,1)
        }
        
        damage(am){
            
            let crit=Math.random()<player.criticalChance,superCrit=Math.random()<player.superCritChance,d=am*(crit?superCrit?player.superCritPower*player.criticalPower:player.criticalPower:1)
            
            if(this.mindHacked>0)
                d*=1.25

            this.health-=d|0
            textRenderer.add((d|0)+'',[this.pos[0],this.pos[1]+Math.random()*2.75+1.5,this.pos[2]],[255,0,0],crit?superCrit?2:1:0,'',[0,1.25,1.275,1.3,1.65,1.75][Math.min(d.toString().length),5])
        }
        
        update(){

            if(!(frameCount%6)){

                this.trails[0].addPos(this.pos.slice())
                this.trails[1].addPos(this.pos.slice())
            }

            switch(this.state){

                case 'flee':

                    this.mindHacked=0
                    this.pos[0]+=this.moveDir[0]*dt
                    this.pos[1]+=this.moveDir[1]*dt
                    this.pos[2]+=this.moveDir[2]*dt

                    meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,this.moveDir[0],this.moveDir[1],this.moveDir[2],BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)

                    if(this.pos[1]>55){

                        return true
                    }

                break

                case 'move':

                    this.mindHacked=0
                    this.pos[0]+=this.moveDir[0]*dt
                    this.pos[1]+=this.moveDir[1]*dt
                    this.pos[2]+=this.moveDir[2]*dt

                    meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,this.moveDir[0],this.moveDir[1],this.moveDir[2],BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)

                    if(TIME>this.timeAtArrival){

                        this.state='attack'
                        this.pos=this.moveTo
                        this.target=[fieldInfo[this.field].x+((Math.random()*fieldInfo[this.field].width)|0),fieldInfo[this.field].z+((Math.random()*fieldInfo[this.field].length)|0)]
                    }

                break

                case 'attack':

                    if(this.health<=0){

                        let f=[]

                        for(let i in fieldInfo){

                            if(i!=='AntField'&&i!=='StumpField'&&i!==this.field)f.push(i)
                        }

                        f=f[(Math.random()*f.length)|0]

                        let center=[fieldInfo[this.field].x+fieldInfo[this.field].width*0.5,this.pos[1]-1.5,fieldInfo[this.field].z+fieldInfo[this.field].length*0.5],_f=this.field

                        objects.mobs.push(new Cloud(this.field,(fieldInfo[this.field].width*0.5)|0,(fieldInfo[this.field].length*0.5)|0,3*60))


                        this.tornados=[]
                        this.state='move'
                        this.field=f
                        this.moveTo=[fieldInfo[f].x+((Math.random()*fieldInfo[f].width)|0),fieldInfo[f].y+0.55+2,fieldInfo[f].z+((Math.random()*fieldInfo[f].length)|0)]
                        this.moveDir=vec3.sub([],this.moveTo,this.pos)
                        let dist=vec3.len(this.moveDir)
                        this.timeAtArrival=TIME+(dist/7)
                        vec3.scale(this.moveDir,this.moveDir,7/dist)
                        this.level++
                        this.health=this.level*this.level*250+250
                        this.maxHealth=this.health

                        let amountOfTokens=MATH.random(10,14)|0,
                        dropTable=['treat','treat','sunflowerSeed','sunflowerSeed','ticket','royalJelly','cloudVial','fieldDice','treat','treat','sunflowerSeed','sunflowerSeed','ticket','royalJelly','cloudVial','fieldDice','tropicalDrink','oil','glitter','magicBean','starJelly'],radius=amountOfTokens*0.2+1.5

                        if(_f==='CoconutField') dropTable.push('tropicalDrink')

                        for(let i=0,inc=MATH.TWO_PI/amountOfTokens;i<MATH.TWO_PI;i+=inc){
                            
                            if(Math.random()<0.5){
                                
                                let ty=dropTable[(Math.random()*dropTable.length)|0]
                                
                                objects.tokens.push(new LootToken(45,[center[0]+Math.cos(i)*radius,center[1],center[2]+Math.sin(i)*radius],ty,1,true,'Wild Windy Bee',['tokensFromWildWindyBee']))
                                
                            } else {
                                
                                objects.tokens.push(new LootToken(45,[center[0]+Math.cos(i)*radius,center[1],center[2]+Math.sin(i)*radius],'honey',(this.level-2)*10000+1000,true,'Wild Windy Bee',['tokensFromWildWindyBee']))
                            }
                        }

                        this.whipWarning.addPos([])
                        this.whipWarning.addPos([])
                        this.whipWarning.addPos([])
                        this.whipWarning.addPos([])
                        this.whipWarning.addPos([])

                        for(let i in this.windWhipTrails){

                            let t=this.windWhipTrails[i]

                            t.trail.addPos([])
                            t.trail.addPos([])
                            t.trail.addPos([])
                            t.trail.addPos([])
                            t.trail.addPos([])
                            t.trail.addPos([])
                            t.trail.addPos([])
                        }
                    }

                    if(this.timeLimit<=0){
                        
                        this.state='flee'
                        this.moveDir=[100-this.pos[0],50-this.pos[1],-30-this.pos[2]]
                        vec3.normalize(this.moveDir,this.moveDir)
                        vec3.scale(this.moveDir,this.moveDir,7)

                        player.addMessage('☁️Wild Windy Bee is fleeing...☁️',[160,160,160])

                        return
                    }
                    
                    this.mindHacked-=dt
                    this.timeLimit-=dt
                    this.starSawHitTimer-=dt
                    this.flameTimer-=dt
                    
                    if(this.flameTimer<=0){
                        
                        this.flameTimer=1
                        
                        for(let f in objects.flames){
                            
                            if(Math.abs(this.pos[0]-objects.flames[f].pos[0])+Math.abs(this.pos[2]-objects.flames[f].pos[2])<this.bodySize){
                                
                                this.damage(objects.flames[f].dark?25:15)
                            }
                        }
                    }
                    
                    if(player.fieldIn===this.field){
                        
                        player.attacked.push(this)
                    }
                    
                    if(this.mindHacked<=0){

                        let d=[this.target[0]-this.pos[0],this.target[1]-this.pos[2]]

                        if(Math.abs(d[0])+Math.abs(d[1])<0.75&&this.attackState===undefined){

                            let skip=Math.random()<0.35
                            this.nextAttackTimer=skip?0:1.5
                            this.skipAttack=skip

                            if(!skip){
                                
                                this.attackState=(this.attackAlternate++)%2===0||this.tornados.length>=3?1:0

                                if(player.fieldIn===this.field&&this.attackState){

                                    this.windWhipTimer=1
                                    this.whipA=[this.pos[0],this.pos[1]-1.9,this.pos[2]]
                                    this.whipB=[player.body.position.x,this.pos[1]-1.9,player.body.position.z]

                                    let dir=vec3.sub([],this.whipB,this.whipA)
                                    vec3.normalize(dir,dir)
                                    dir[0]*=2
                                    dir[2]*=2
                                    let c=[dir[2],dir[1],-dir[0]]
                                    
                                    this.whipWarning.addPos(vec3.add([],this.whipA,c))
                                    this.whipWarning.addPos(vec3.sub([],this.whipA,c))
                                    this.whipWarning.addPos(vec3.add([],vec3.sub([],this.whipB,c),dir))
                                    this.whipWarning.addPos(vec3.add([],vec3.add([],this.whipB,c),dir))
                                    this.whipWarning.addPos(vec3.add([],this.whipA,c))

                                    for(let i in this.windWhipTrails){

                                        let t=this.windWhipTrails[i]

                                        let y=MATH.random(-0.01,0.01)+0.5,s=MATH.random(-0.5,0.5),l=MATH.random(0.8,1)

                                        t.speed=MATH.random(10,14)

                                        t.pos=vec3.add([],this.whipA,[c[0]*s,y,c[2]*s])
                                        t.target=vec3.add([],vec3.add([],this.whipB,[c[0]*s,y,c[2]*s]),[dir[0]*l,0,dir[2]*l])
                                    }
                                }
                            }

                        } else if(this.attackState===undefined){
                            
                            vec2.normalize(d,d)
                            
                            this.pos[0]+=d[0]*dt*6
                            this.pos[2]+=d[1]*dt*6

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,d[0],0,d[1],BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)
                        }

                        if(this.nextAttackTimer<=0){

                            if(!this.skipAttack&&!this.attackState)this.tornados.push({pos:[...this.pos,0],timer:0,timeAtArrival:-1})

                            this.skipAttack=false

                            this.target=[fieldInfo[this.field].x+((Math.random()*fieldInfo[this.field].width)|0),fieldInfo[this.field].z+((Math.random()*fieldInfo[this.field].length)|0)]
                            this.attackState=undefined
                            this.nextAttackTimer=Infinity
                        }

                        if(this.attackState===0){

                            this.nextAttackTimer-=dt

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,Math.sin(TIME*8),0,Math.cos(TIME*8),BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)

                        } else if(this.attackState===1){
                            
                            this.nextAttackTimer-=dt

                            meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,player.body.position.x-this.pos[0],player.body.position.y-this.pos[1],player.body.position.z-this.pos[2],BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)
                        }

                        if(this.windWhipTimer>-0.25){

                            this.windWhipTimer-=dt

                            if(this.windWhipTimer<=0.25){

                                for(let i in this.windWhipTrails){

                                    let t=this.windWhipTrails[i]

                                    vec3.lerp(t.pos,t.pos,t.target,dt*t.speed)

                                    t.trail.addPos(t.pos.slice())
                                }
                            }

                            if(this.windWhipTimer<=-0.25){

                                for(let i in this.windWhipTrails){

                                    let t=this.windWhipTrails[i]

                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                    t.trail.addPos([])
                                }

                                let p=MATH.closestPointOnLine(this.whipA,this.whipB,[player.body.position.x,this.pos[1]-1.9,player.body.position.z])

                                let d=vec3.sqrDist(p,[player.body.position.x,this.pos[1]-1.9,player.body.position.z])

                                if(d<4){

                                    player.damage(15)
                                    let dir=vec3.sub([],this.whipB,this.whipA)
                                    vec3.normalize(dir,dir)
                                    player.body.position.y+=0.5
                                    player.body.velocity.x=dir[0]*50
                                    player.body.velocity.y=(4-d)*5+5
                                    player.body.velocity.z=dir[2]*50
                                    player.removeAirFrictionUntilGrounded=true
                                    player.isGliding=false
                                    player.grounded=false
                                    player.updateGear()
                                }

                                this.whipWarning.addPos([])
                                this.whipWarning.addPos([])
                                this.whipWarning.addPos([])
                                this.whipWarning.addPos([])
                                this.whipWarning.addPos([])
                            }
                        }

                        let m=TIME*2
                        m=m-(m|0)<0.5?'tornado_red':'tornado'

                        gl.bindBuffer(gl.ARRAY_BUFFER,meshes[m].vertBuffer)
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,meshes[m].indexBuffer)
                        gl.vertexAttribPointer(glCache.mob_vertPos,3,gl.FLOAT,gl.FLASE,24,0)
                        gl.vertexAttribPointer(glCache.mob_vertColor,3,gl.FLOAT,gl.FLASE,24,12)
                        gl.uniform2f(glCache.mob_instanceInfo2,0.6,0.7)

                        for(let i=this.tornados.length;i--;){

                            let s=this.tornados[i]

                            s.timer-=dt
                            s.pos[3]+=dt*15

                            if(!s.rised){

                                if(!s.init){

                                    s.y=s.pos[1]-1
                                    s.pos[1]-=15
                                    s.init=true
                                }

                                s.pos[1]+=(s.y-s.pos[1])*dt*5
                                
                                if(Math.abs(s.y-s.pos[1])<0.1){
                                    
                                    s.rised=true
                                    s.pos[1]=s.y
                                }
                            }

                            if(TIME>s.timeAtArrival){

                                s.target=[fieldInfo[this.field].x+((Math.random()*fieldInfo[this.field].width)|0),fieldInfo[this.field].z+((Math.random()*fieldInfo[this.field].length)|0)]

                                let d=[s.target[0]-s.pos[0],s.target[1]-s.pos[2]],m=vec2.len(d)
                                d[0]*=7/m
                                d[1]*=7/m
                                s.moveDir=d
                                s.timeAtArrival=TIME+(m/7)
                            }

                            s.pos[0]+=s.moveDir[0]*dt
                            s.pos[2]+=s.moveDir[1]*dt

                            if(s.timer<=0){

                                if(Math.abs(player.body.position.x-s.pos[0])+Math.abs(player.body.position.z-s.pos[2])+Math.abs(s.pos[1]-player.body.position.y-1)<2.5){

                                    s.timer=0.5
                                    player.damage(this.level*0.25+5)
                                }

                                collectPollen({x:Math.round(s.pos[0]-fieldInfo[this.field].x),z:Math.round(s.pos[2]-fieldInfo[this.field].z),field:this.field,pattern:[[-4,0],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],[-1,-3],[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],[-1,3],[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4],[1,-3],[1,-2],[1,-1],[1,0],[1,1],[1,2],[1,3],[2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],[3,-2],[3,-1],[3,0],[3,1],[3,2],[4,0]],amount:0.35,multiplier:0.00000000001})
                            }

                            s.pos[1]-=1
                            gl.uniform4fv(glCache.mob_instanceInfo1,s.pos)
                            s.pos[1]+=1
                            gl.drawElements(gl.TRIANGLES,meshes[m].indexAmount,gl.UNSIGNED_SHORT,0)
                        }
                        
                    } else {

                        meshes.bees.instanceData.push(this.pos[0],this.pos[1],this.pos[2],1.5,Math.random()-0.5,Math.random()-0.5,Math.random()-0.5,BEE_FLY,beeInfo.windy.u,beeInfo.windy.v,beeInfo.windy.meshPartId)

                        textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,0,...textRenderer.decalUV.smiley,0.75,0,0,-2,-2,0)
                    }
                    
                    this.pos[1]+=1.25
                    textRenderer.addCTX('Wild Windy Bee (Level '+this.level+')',[this.pos[0],this.pos[1]+0.9,this.pos[2]],COLORS.whiteArr,100)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,1.5,...textRenderer.decalUV['rect'],0.61*0.5,0.42*0.5,0.27*0.5,2.5,0.4,0)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],(-0.5+(this.timeLimit/this.maxTimeLimit)*0.5)/(this.timeLimit/this.maxTimeLimit),1.5,...textRenderer.decalUV['rect'],0.61,0.42,0.27,this.timeLimit*2.5/this.maxTimeLimit,0.4,0)
                    
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],0,0,...textRenderer.decalUV['rect'],0.6,0,0,2.5,0.4,0)
                    textRenderer.addDecalRaw(this.pos[0],this.pos[1],this.pos[2],(-0.5+(this.health/this.maxHealth)*0.5)/(this.health/this.maxHealth),0,...textRenderer.decalUV['rect'],0.2,0.85,0.2,this.health*2.5/this.maxHealth,0.4,0)
                    
                    textRenderer.addSingle('HP: '+MATH.addCommas((this.health|0)+''),this.pos,COLORS.whiteArr,-1,false,false)
                    textRenderer.addSingle('Time: '+MATH.doTime((this.timeLimit|0)+''),this.pos,COLORS.whiteArr,-1,false,false,0,0.6)
                    this.pos[1]-=1.25

                break
            }
        }
    }

 



    class Ant {
        
        constructor(round,x,z,type){

            this.type=type
            this.displayName=MATH.doGrammar(type)
            this.mesh=type
            this.meshScale=0.75
            this.level=((round*MATH.random(0.4,0.6)*0.5)|0)+1
            this.health=((this.level*this.level*this.level*0.4*MATH.random(2,6))|0)+5
            this.movespeed=2
            this.attack=10
            this.bodySize=0.75

            switch(type){

                case 'ant':break
                case 'fireAnt':break
                case 'armyAnt':
                    this.health=(this.health*1.5)|0
                    this.attack*=2
                break
                case 'flyingAnt':
                    this.health=(this.health*0.65)|0
                    this.movespeed*=1.5
                    this.attack*=1.25
                break
                case 'giantAnt':
                    this.health=(this.health*2)|0
                    this.movespeed*=0.75
                    this.attack*=2
                    this.meshScale=1.5
                    this.mesh='ant'
                    this.bodySize=1
                break
            }

            this.state='spawning'
            this.field='AntField'
            this.starSawHitTimer=0
            this.maxHealth=this.health
            this.spawnPos=[-21,7,-61]
            this.pos=[fieldInfo[this.field].x+((x*fieldInfo[this.field].width)|0),fieldInfo[this.field].y+this.meshScale,fieldInfo[this.field].z+((z*fieldInfo[this.field].length)|0)]
            this.flameTimer=0
            this.waitTimer=0
            this.damageTimer=0

            this.mindHacked=0

            this.dir=[x-0.5,z-0.5]

            this.dir[1]=this.dir[1]===0&&this.dir[0]===0?Math.random()<0.5?-1:1:this.dir[1]

            vec2.normalize(this.dir,this.dir)

            this.bounds={
                
                minX:fieldInfo[this.field].x+1,
                maxX:fieldInfo[this.field].x+fieldInfo[this.field].width-1,
                minZ:fieldInfo[this.field].z+1,
                maxZ:fieldInfo[this.field].z+fieldInfo[this.field].length-1,
            }

            this.fireTrailTimer=0
        }
        
        die(index){
            
            if(player.antChallenge)
                player.antChallenge.score++

