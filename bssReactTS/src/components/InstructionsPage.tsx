//     <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto">
//       <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
//         Bee Swarm Simulator
//       </h1>
//       <p className="text-gray-600 mb-6 text-center">
//         A game about bees, pollen, and honey!
//       </p>
//       <button
//         onClick={callckFctn}
//         className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
//       >
//         Start Playing
//       </button>
//     </div>
//     {/* <div id='mainInfoMenu' style='position:fixed;z-index:1;top:0px;left:0px;background-color:rgb(255,255,255);bottom:0px;right:0px;display:none;overflow-y:auto'> */}
//     <div>
//       {/* <canvas id='info_thumbnailCanvCopy' style='position:fixed;left:50%;top:50%;z-index:-1;transform:translate(-50%,-50%);filter:blur(10px)'></canvas> */}

//       {/* <div style='margin-top:20px;font-size:45px;text-align:center;'>Instructions & Info</div> */}

//       {/* <button id='info_mainBack' style='margin-left:80px;margin-top:-70px;width:120px;height:60px;background-color:rgb(174, 216, 255);transform:translate(-50%,-50%);font-family:comic sans ms;font-size:25px'>Back</button> */}

//       {/* <div style='margin-left:10px;font-size:19px;text-align:center;user-select:text'>Welcome to Bee Swarm Simulator! In this game, you collect pollen from flowers and make honey.<br/><br/>But you don't do it alone... You are the leader of your own personal swarm of bees!<br/><br/>Open your inventory by clicking on the egg button. Click on the egg to select it, and then click a slot in your hive to hatch it.<br/><br/>With your bees, go into the fields to collect pollen. You can collect pollen by swinging your tool or when your bee gathers. After your bag becomes full, go back to your hive and your bees will convert the pollen into honey.<br/><br/>Talk to bears and NPCs around the mountain and complete their quests for rewards!<br/><br/>Expand your hive by buying more eggs and level up bees with treats. Upgrade your tools to make more honey. Defeat monsters around the map for loot. Collect rare ingredients to craft powerful gear!<br/><br/><br/><br/><br/>------------------------------------------<br/><br/><br/><b>Not all features are accurate to the original. Many changes include dialogue, quests, gear stats, loot drops, certain calculations, improved RNG rates, and singleplayer. All graphics are recreations of the original, not copied. Gameplay is meant to be accelerated from the original through the use of decreased item & bee rarity + easier & more rewarding quests. Audio is non-existent for this game.</b><br/><br/>Made by Dat<br/><br/>Original made by Onett<br/><br/>Some info from the BSS Fandom Wiki<br/><br/>Bugtesters: HB_The_Pencil, Astro, and more.<br/><br/><br/></div> */}
//       <div>
//         Welcome to Bee Swarm Simulator! In this game, you collect pollen from
//         flowers and make honey.
//         <br />
//         <br />
//         But you don't do it alone... You are the leader of your own personal
//         swarm of bees!
//         <br />
//         <br />
//         Open your inventory by clicking on the egg button. Click on the egg to
//         select it, and then click a slot in your hive to hatch it.
//         <br />
//         <br />
//         With your bees, go into the fields to collect pollen. You can collect
//         pollen by swinging your tool or when your bee gathers. After your bag
//         becomes full, go back to your hive and your bees will convert the pollen
//         into honey.
//         <br />
//         <br />
//         Talk to bears and NPCs around the mountain and complete their quests for
//         rewards!
//         <br />
//         <br />
//         Expand your hive by buying more eggs and level up bees with treats.
//         Upgrade your tools to make more honey. Defeat monsters around the map
//         for loot. Collect rare ingredients to craft powerful gear!
//         <br />
//         <br />
//         <br />
//         <br />
//         <br />
//         ------------------------------------------
//         <br />
//         <br />
//         <br />
//         <b>
//           Not all features are accurate to the original. Many changes include
//           dialogue, quests, gear stats, loot drops, certain calculations,
//           improved RNG rates, and singleplayer. All graphics are recreations of
//           the original, not copied. Gameplay is meant to be accelerated from the
//           original through the use of decreased item & bee rarity + easier &
//           more rewarding quests. Audio is non-existent for this game.
//         </b>
//         <br />
//         <br />
//         Made by Dat
//         <br />
//         <br />
//         Original made by Onett
//         <br />
//         <br />
//         Some info from the BSS Fandom Wiki
//         <br />
//         <br />
//         Bugtesters: HB_The_Pencil, Astro, and more.
//         <br />
//         <br />
//         <br />
//       </div>
//     </div>
//   </>

export const InstructionsPage = (callckFctn: () => void) => (

    return(
          <>
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-yellow-500 font-sans">
        Bee Swarm Simulator
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        A game about bees, pollen, and honey!
      </p>
      <button
        onClick={callckFctn}
        className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:bg-yellow-600 shadow-md transform hover:scale-105"
      >
        Start Playing
      </button>
    </div>
    <div>
      <div>
        Welcome to Bee Swarm Simulator! In this game, you collect pollen from
        flowers and make honey.
        <br />
        <br />
        But you don't do it alone... You are the leader of your own personal
        swarm of bees!
        <br />
        <br />
        Open your inventory by clicking on the egg button. Click on the egg to
        select it, and then click a slot in your hive to hatch it.
        <br />
        <br />
        With your bees, go into the fields to collect pollen. You can collect
        pollen by swinging your tool or when your bee gathers. After your bag
        becomes full, go back to your hive and your bees will convert the pollen
        into honey.
        <br />
        <br />
        Talk to bears and NPCs around the mountain and complete their quests for
        rewards!
        <br />
        <br />
        Expand your hive by buying more eggs and level up bees with treats.
        Upgrade your tools to make more honey. Defeat monsters around the map
        for loot. Collect rare ingredients to craft powerful gear!
        <br />
        <br />
        <br />
        <br />
        <br />
        ------------------------------------------
        <br />
        <br />
        <br />
        <b>
          Not all features are accurate to the original. Many changes include
          dialogue, quests, gear stats, loot drops, certain calculations,
          improved RNG rates, and singleplayer. All graphics are recreations of
          the original, not copied. Gameplay is meant to be accelerated from the
          original through the use of decreased item & bee rarity + easier &
          more rewarding quests. Audio is non-existent for this game.
        </b>
        <br />
        <br />
        Made by Dat
        <br />
        <br />
        Original made by Onett
        <br />
        <br />
        Some info from the BSS Fandom Wiki
        <br />
        <br />
        Bugtesters: HB_The_Pencil, Astro, and more.
        <br />
        <br />
        <br />
      </div>
    </div>
  </>
    )

);

// <div id='mainInfoMenu' style='position:fixed;z-index:1;top:0px;left:0px;background-color:rgb(255,255,255);bottom:0px;right:0px;display:none;overflow-y:auto'>

//     <canvas id='info_thumbnailCanvCopy' style='position:fixed;left:50%;top:50%;z-index:-1;transform:translate(-50%,-50%);filter:blur(10px)'></canvas>

//     <div style='margin-top:20px;font-size:45px;text-align:center;'>Instructions & Info</div>

//     <button id='info_mainBack' style='margin-left:80px;margin-top:-70px;width:120px;height:60px;background-color:rgb(174, 216, 255);transform:translate(-50%,-50%);font-family:comic sans ms;font-size:25px'>Back</button>

//     <div style='margin-left:10px;font-size:19px;text-align:center;user-select:text'>Welcome to Bee Swarm Simulator! In this game, you collect pollen from flowers and make honey.<br/><br/>But you don't do it alone... You are the leader of your own personal swarm of bees!<br/><br/>Open your inventory by clicking on the egg button. Click on the egg to select it, and then click a slot in your hive to hatch it.<br/><br/>With your bees, go into the fields to collect pollen. You can collect pollen by swinging your tool or when your bee gathers. After your bag becomes full, go back to your hive and your bees will convert the pollen into honey.<br/><br/>Talk to bears and NPCs around the mountain and complete their quests for rewards!<br/><br/>Expand your hive by buying more eggs and level up bees with treats. Upgrade your tools to make more honey. Defeat monsters around the map for loot. Collect rare ingredients to craft powerful gear!<br/><br/><br/><br/><br/>------------------------------------------<br/><br/><br/><b>Not all features are accurate to the original. Many changes include dialogue, quests, gear stats, loot drops, certain calculations, improved RNG rates, and singleplayer. All graphics are recreations of the original, not copied. Gameplay is meant to be accelerated from the original through the use of decreased item & bee rarity + easier & more rewarding quests. Audio is non-existent for this game.</b><br/><br/>Made by Dat<br/><br/>Original made by Onett<br/><br/>Some info from the BSS Fandom Wiki<br/><br/>Bugtesters: HB_The_Pencil, Astro, and more.<br/><br/><br/></div>

// </div>
