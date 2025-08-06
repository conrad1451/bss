export const blenderRecipes = [
  { item: "microConverter", req: [["honeysuckle", 1]] },
  {
    item: "gumdrops",
    req: [
      ["pineapple", 1],
      ["strawberry", 1],
      ["blueberry", 1],
      ["sunflowerSeed", 1],
    ],
  },
  {
    item: "redExtract",
    req: [
      ["strawberry", 35],
      ["royalJelly", 5],
    ],
  },
  {
    item: "blueExtract",
    req: [
      ["blueberry", 35],
      ["royalJelly", 5],
    ],
  },
  {
    item: "enzymes",
    req: [
      ["pineapple", 35],
      ["royalJelly", 5],
    ],
  },
  {
    item: "oil",
    req: [
      ["sunflowerSeed", 35],
      ["royalJelly", 5],
    ],
  },
  {
    item: "glue",
    req: [
      ["gumdrops", 10],
      ["royalJelly", 5],
    ],
  },
  {
    item: "tropicalDrink",
    req: [
      ["coconut", 5],
      ["oil", 1],
      ["enzymes", 1],
    ],
  },
  { item: "glitter", req: [["magicBean", 2]] },
  {
    item: "starJelly",
    req: [
      ["royalJelly", 75],
      ["glitter", 3],
    ],
  },
  // {item:'purplePotion',req:[['neonberry',3],['redExtract',1],['blueExtract',1],['glue',1]]},
  {
    item: "superSmoothie",
    req: [
      ["neonberry", 3],
      ["starJelly", 1],
      ["tropicalDrink", 2],
    ],
  },
  {
    item: "fieldDice",
    req: [
      ["softWax", 1],
      ["whirligig", 1],
      ["redExtract", 1],
      ["blueExtract", 1],
    ],
  },
  {
    item: "smoothDice",
    req: [
      ["fieldDice", 2],
      ["whirligig", 2],
      ["softWax", 2],
      ["oil", 2],
    ],
  },
  {
    item: "loadedDice",
    req: [
      ["smoothDice", 2],
      ["hardWax", 1],
      ["oil", 2],
      ["glue", 1],
    ],
  },
  {
    item: "softWax",
    req: [
      ["honeysuckle", 5],
      ["oil", 1],
      ["enzymes", 1],
      ["royalJelly", 5],
    ],
  },
  {
    item: "hardWax",
    req: [
      ["softWax", 2],
      ["enzymes", 1],
      ["bitterberry", 3],
      ["royalJelly", 5],
    ],
  },
  {
    item: "swirledWax",
    req: [
      ["hardWax", 1],
      ["softWax", 2],
      ["royalJelly", 15],
    ],
  },
  {
    item: "causticWax",
    req: [
      ["hardWax", 2],
      ["neonberry", 5],
      ["gumdrops", 10],
      ["royalJelly", 25],
    ],
  },
  {
    item: "turpentine",
    req: [
      ["superSmoothie", 3],
      ["causticWax", 3],
      ["starJelly", 5],
      ["honeysuckle", 50],
    ],
  },
  {
    item: "diamondEgg",
    req: [
      ["goldEgg", 1],
      ["swirledWax", 1],
      ["royalJelly", 100],
    ],
  },
];

export const windShrineDonations = [
  { item: "spiritPetal", rewardType: "honey", rewardAmount: 15 },
  { item: "treat", rewardType: "honey", rewardAmount: 1 },
  { item: "strawberry", rewardType: "honey", rewardAmount: 1.5 },
  { item: "blueberry", rewardType: "honey", rewardAmount: 1.5 },
  { item: "pineapple", rewardType: "honey", rewardAmount: 1.5 },
  { item: "sunflowerSeed", rewardType: "honey", rewardAmount: 1.5 },
  { item: "bitterberry", rewardType: "winds", rewardAmount: 1 },
  { item: "neonberry", rewardType: "winds", rewardAmount: 1 },
  { item: "royalJelly", rewardType: "honey", rewardAmount: 2 },
  { item: "starJelly", rewardType: "winds", rewardAmount: 6 },
  { item: "starTreat", rewardType: "winds", rewardAmount: 14 },
  { item: "atomicTreat", rewardType: "winds", rewardAmount: 6 },
  { item: "ticket", rewardType: "winds", rewardAmount: 1.1 },
  { item: "gumdrops", rewardType: "winds", rewardAmount: 0.8 },
  { item: "coconut", rewardType: "winds", rewardAmount: 1 },
  { item: "stinger", rewardType: "loot", rewardAmount: 1 },
  { item: "microConverter", rewardType: "honey", rewardAmount: 2.15 },
  { item: "honeysuckle", rewardType: "honey", rewardAmount: 2 },
  { item: "whirligig", rewardType: "honey", rewardAmount: 2.25 },
  { item: "fieldDice", rewardType: "winds", rewardAmount: 2 },
  { item: "smoothDice", rewardType: "winds", rewardAmount: 4 },
  { item: "loadedDice", rewardType: "winds", rewardAmount: 7 },
  { item: "jellyBeans", rewardType: "honey", rewardAmount: 3.5 },
  { item: "redExtract", rewardType: "winds", rewardAmount: 4 },
  { item: "blueExtract", rewardType: "winds", rewardAmount: 4 },
  { item: "glitter", rewardType: "honey", rewardAmount: 8 },
  { item: "glue", rewardType: "winds", rewardAmount: 4 },
  { item: "oil", rewardType: "winds", rewardAmount: 4 },
  { item: "enzymes", rewardType: "winds", rewardAmount: 4 },
  { item: "tropicalDrink", rewardType: "winds", rewardAmount: 5 },
  // {item:'purplePotion',rewardType:'winds',rewardAmount:9},
  { item: "magicBean", rewardType: "winds", rewardAmount: 3.5 },
  { item: "cloudVial", rewardType: "honey", rewardAmount: 7 },
  { item: "antPass", rewardType: "honey", rewardAmount: 5 },
  { item: "roboPass", rewardType: "honey", rewardAmount: 8 },
  { item: "softWax", rewardType: "honey", rewardAmount: 3.5 },
  { item: "hardWax", rewardType: "winds", rewardAmount: 6 },
  { item: "causticWax", rewardType: "winds", rewardAmount: 8 },
  { item: "swirledWax", rewardType: "honey", rewardAmount: 10 },
  { item: "turpentine", rewardType: "winds", rewardAmount: 8 },
  { item: "basicEgg", rewardType: "honey", rewardAmount: 9 },
  { item: "silverEgg", rewardType: "winds", rewardAmount: 6 },
  { item: "goldEgg", rewardType: "winds", rewardAmount: 7.5 },
  { item: "diamondEgg", rewardType: "winds", rewardAmount: 10 },
  { item: "mythicEgg", rewardType: "winds", rewardAmount: 12 },
  { item: "giftedSilverEgg", rewardType: "winds", rewardAmount: 11 },
  { item: "giftedGoldEgg", rewardType: "winds", rewardAmount: 12 },
  { item: "giftedDiamondEgg", rewardType: "winds", rewardAmount: 13 },
  { item: "giftedMythicEgg", rewardType: "winds", rewardAmount: 14 },
  { item: "starEgg", rewardType: "winds", rewardAmount: 14 },
];
