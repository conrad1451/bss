// data/upgrades.js

export const upgrades = {
  Botnet: {
    stats: "*1.25 pollenFromBees",
    rarity: "common",
    maxStacks: 1,
  },
  Iterate: {
    stats: "*1.05 redPollen,*1.05 bluePollen,*1.05 whitePollen",
    rarity: "common",
    maxStacks: 15,
  },
  Sharpen: {
    stats: "*1.25 beeAttack,*0.9 capacity",
    rarity: "common",
    maxStacks: 5,
  },
  Defragment: {
    stats: "*1.5 capacity,-20% criticalPower",
    rarity: "common",
    maxStacks: 5,
  },
  XSS: {
    stats: "*1.1 bluePollen,*0.91 whitePollen",
    rarity: "common",
    maxStacks: 1,
  },
  "Overfit: Red": {
    stats: "*1.1 redPollen,*0.95 capacity",
    rarity: "common",
    maxStacks: 10,
  },
  "Overfit: Blue": {
    stats: "*1.1 bluePollen,*0.95 beeSpeed,*0.95 walkSpeed",
    rarity: "common",
    maxStacks: 10,
  },
  "Overfit: White": {
    stats: "*1.1 whitePollen,*0.9 convertRate",
    rarity: "common",
    maxStacks: 10,
  },
  Apply: {
    stats: "*1.2 pollenFromCoconuts",
    rarity: "common",
    maxStacks: 3,
  },
  Clockwork: {
    stats: "+3 cogsPerRound,*0.9 markDuration",
    rarity: "common",
    maxStacks: 3,
  },
  Outsource: {
    stats: "*1.1 pollenFromTools,*0.95 pollenFromBees",
    rarity: "common",
    maxStacks: 5,
  },
  Equalize: {
    stats: "+1 beeAttack,*0.975 beeAttack",
    rarity: "common",
    maxStacks: 3,
  },
  "Flash Drive": {
    stats: "*1.01 beeSpeed,*1.01 walkSpeed,-1% criticalChance",
    rarity: "common",
    maxStacks: 10,
  },
  Memory: {
    stats:
      "*1.03 redBeeAbilityRate,*1.03 blueBeeAbilityRate,*1.03 whiteBeeAbilityRate",
    rarity: "common",
    maxStacks: 3,
  },
  Binary: {
    stats: "*0.5 honeyAtHive,*2 convertRateAtHive",
    rarity: "common",
    maxStacks: 3,
  },
  Codec: {
    stats:
      "+5% instantRedConversion,+5% instantBlueConversion,+5% instantWhiteConversion,*0.96 beeAttack",
    rarity: "common",
    maxStacks: 3,
  },
  Overclock: {
    stats: "*1.04 beeSpeed,*1.04 walkSpeed,*0.9 capacity",
    rarity: "common",
    maxStacks: 3,
  },
  Inverse: {
    stats: "*1.5 beeAttack,*0.5 capacity",
    rarity: "common",
    maxStacks: 1,
  },
  Transpose: {
    stats: "*1.1 convertRate,*0.9 convertRateAtHive",
    rarity: "common",
    maxStacks: 3,
  },
  "Cross Product": {
    stats: "+2 movementCollection,*1.04 walkSpeed",
    rarity: "common",
    maxStacks: 3,
  },
  "Dot Product": {
    stats: "+2% criticalChance,*1.04 walkSpeed",
    rarity: "common",
    maxStacks: 5,
  },
  Projection: {
    stats: "*1.03 redPollen,*1.03 bluePollen",
    rarity: "common",
    maxStacks: 5,
  },
  Offset: {
    stats: "*1.15 tokenLifespan,*0.96 walkSpeed",
    rarity: "common",
    maxStacks: 3,
  },
  Sine: { stats: "*1.05 bluePollen", rarity: "common", maxStacks: 4 },
  Cosine: { stats: "*1.05 redPollen", rarity: "common", maxStacks: 4 },
  Tangent: { stats: "*1.05 whitePollen", rarity: "common", maxStacks: 4 },
  Reduce: {
    stats: "*1.03 beeAttack,*0.98 redPollen,*0.98 bluePollen,*0.98 whitePollen",
    rarity: "common",
    maxStacks: 10,
  },
  Refractor: {
    stats: "*1.06 convertRate",
    rarity: "common",
    maxStacks: 10,
  },
  NRG: {
    stats: "*1.07 beeEnergy,*1.02 walkSpeed,-1 cogsPerRound",
    rarity: "common",
    maxStacks: 10,
  },

  VPN: {
    stats: "+2% defense,*0.98 walkSpeed",
    rarity: "rare",
    maxStacks: 10,
  },
  Hyperbolic: {
    stats: "*1.06 beeAttack,*0.98 goo",
    rarity: "rare",
    maxStacks: 5,
  },
  Inject: {
    stats: "+1 redBeeAttack,+1 whiteBeeAttack,+1 blueBeeAttack,-1 cogsPerRound",
    rarity: "rare",
    maxStacks: 3,
  },
  Fragment: {
    stats: "+4% instantBombConversion",
    rarity: "rare",
    maxStacks: 4,
  },
  Translation: { stats: "*1.03 beeSpeed", rarity: "rare", maxStacks: 3 },
  "Blue Screen": {
    stats: "*1.08 blueBeeAbilityRate,+2 blueBeeAttack,-1 cogsPerRound",
    rarity: "rare",
    maxStacks: 3,
  },
  Commit: {
    stats: "+5% superCritChance,-3% criticalChance",
    rarity: "rare",
    maxStacks: 2,
  },
  GPU: { stats: "*1.05 walkSpeed", rarity: "rare", maxStacks: 2 },
  CPU: {
    stats: "+20% criticalPower,*0.9 walkSpeed",
    rarity: "rare",
    maxStacks: 1,
  },
  Saturate: {
    stats: "+2 redBeeAttack,+2 blueBeeAttack,-2 whiteBeeAttack",
    rarity: "rare",
    maxStacks: 3,
  },
  RAM: {
    stats: "+50000 capacity,+1 cogsPerRound,-2% defense",
    rarity: "rare",
    maxStacks: 10,
  },
  "SSD: Blue": {
    stats: "*1.5 blueFieldCapacity,*1.25 blueConvertRate,-3% criticalChance",
    rarity: "rare",
    maxStacks: 3,
  },
  "SSD: Red": {
    stats: "*1.5 redFieldCapacity,*1.25 redConvertRate,*0.7 whiteBombPollen",
    rarity: "rare",
    maxStacks: 3,
  },
  "SSD: White": {
    stats: "*1.5 whiteFieldCapacity,*1.25 whiteConvertRate,*0.9 beeAttack",
    rarity: "rare",
    maxStacks: 3,
  },
  Bluetooth: {
    stats: "*1.1 bluePollen,+1 blueBeeAttack",
    rarity: "rare",
    maxStacks: 3,
  },
  Bruteforce: {
    stats: "*1.1 redPollen,+3% superCritChance",
    rarity: "rare",
    maxStacks: 3,
  },
  "Fluid Simulation": {
    stats: "*1.1 whitePollen,*1.08 goo",
    rarity: "rare",
    maxStacks: 3,
  },
  Method: {
    stats: "*1.2 beeEnergy,*0.9 honeyFromTokens",
    rarity: "rare",
    maxStacks: 3,
  },

  Bandwidth: {
    stats: "x1.25 convertRateAtHive,*1.05 markDuration",
    rarity: "epic",
    maxStacks: 3,
  },
  beeBay: { stats: "+1 beesPerRound", rarity: "epic", maxStacks: 1 },
  Instancing: {
    stats:
      "+3% instantRedConversion,+3% instantBlueConversion,+3% instantWhiteConversion",
    rarity: "epic",
    maxStacks: 5,
  },
  "Pop-up": {
    stats: "*1.25 bubblePollen,-1 blueBeeAttack",
    rarity: "epic",
    maxStacks: 3,
  },
  Overheat: {
    stats: "*1.25 flamePollen,*0.95 redPollen",
    rarity: "epic",
    maxStacks: 3,
  },
  "White Noise": {
    stats: "*1.1 whitePollen,*1.25 whiteBombPollen,-1 cogsPerRound",
    rarity: "epic",
    maxStacks: 1,
  },
  Battery: {
    stats: "*1.1 markDuration,*1.1 flameLife,*0.95 walkSpeed",
    rarity: "epic",
    maxStacks: 1,
  },
  Asynchronize: {
    stats: "+4 movementCollection,*0.96 tokenLifespan",
    rarity: "epic",
    maxStacks: 3,
  },
  "Bit Shift": {
    stats: "*1.05 convertRate,+3% instantBombConversion",
    rarity: "epic",
    maxStacks: 10,
  },
  Base64: {
    stats: "*1.64 convertRate,*0.64 pollenFromCoconuts",
    rarity: "epic",
    maxStacks: 1,
  },
  Trojan: {
    stats: "*1.25 beeAttack,*0.9 beeSpeed",
    rarity: "epic",
    maxStacks: 1,
  },
  Uniform: {
    stats: "*1.15 redPollen,*1.15 bluePollen,*1.15 whitePollen,*0.92 beeAttack",
    rarity: "epic",
    maxStacks: 2,
  },
  Duplicate: {
    stats:
      "+2% abilityDuplicationChance,*0.94 redBeeAbilityRate,*0.94 blueBeeAbilityRate,*0.94 whiteBeeAbilityRate",
    rarity: "epic",
    maxStacks: 4,
  },
  Furnace: {
    stats:
      "*1.07 flamePollen,+5% instantFlameConversion,*1.07 flameLife,-2 cogsPerRound",
    rarity: "epic",
    maxStacks: 3,
  },

  "Cloud 9": {
    stats: "*1.35 capacity,-1 cogsPerRound",
    rarity: "legendary",
    maxStacks: 5,
  },
  "180°": {
    stats: "*1.8 beeAttack,-18% criticalChance",
    rarity: "legendary",
    maxStacks: 1,
  },
  "Vice Versa": {
    stats: "*1.5 redBombPollen,*1.5 blueBombPollen,*0.9 whiteBombPollen",
    rarity: "legendary",
    maxStacks: 1,
  },
  "Schematic Error": {
    stats: "*1.25 redBombPollen,+3% abilityDuplicationChance",
    rarity: "legendary",
    maxStacks: 1,
  },
  "d^=b[,7'": {
    stats: "*2 goo,*0.85 whitePollen",
    rarity: "legendary",
    maxStacks: 1,
  },
  Unlisted: {
    stats: "+3% criticalChance,*1.2 superCritPower",
    rarity: "legendary",
    maxStacks: 1,
  },
  23.5: {
    stats:
      "+2% instantBlueConversion,+3% instantWhiteConversion,+5% instantRedConversion",
    rarity: "legendary",
    maxStacks: 5,
  },
  Knock: {
    stats: "*1.25 beeAttack,-10% defense",
    rarity: "legendary",
    maxStacks: 1,
  },
  "12%": {
    stats: "*0.12 goo,*1.55 whitePollen",
    rarity: "legendary",
    maxStacks: 1,
  },
  "Plus Minus": {
    stats: "+6% criticalChance,-2% superCritChance",
    rarity: "legendary",
    maxStacks: 2,
  },
  8.2: {
    stats: "*1.8 pollenFromCoconuts,*1.2 capacity",
    rarity: "legendary",
    maxStacks: 1,
  },
  "Friend Credits": {
    stats: "+4 cogsPerRound,*1.1 honeyFromTokens",
    rarity: "legendary",
    maxStacks: 3,
  },
  Technoblade: {
    stats: "+25% defense",
    rarity: "legendary",
    maxStacks: 1,
  },
  "A-List": {
    stats: "*1.25 beeSpeed,+4 movementCollection,-2 cogsPerRound",
    rarity: "legendary",
    maxStacks: 2,
  },
  '<u style="user-select:text">ยังน่ารัก</u>': {
    stats: "*1.5 buoyantBeeAttack,-1 cogsPerRound",
    rarity: "legendary",
    maxStacks: 1,
  },
};
