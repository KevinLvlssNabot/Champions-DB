import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── TYPE DATA ───────────────────────────────────────────────
const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

const TYPE_COLORS = {
  normal:'#9099A1', fire:'#FF7C3F', water:'#4D90D5', electric:'#F2C418',
  grass:'#5FBD62', ice:'#74CEC0', fighting:'#CE406B', poison:'#AB5AC5',
  ground:'#D97845', flying:'#879EEC', psychic:'#F667AB', bug:'#91A118',
  rock:'#C6B669', ghost:'#5269AC', dragon:'#0F6AC2', dark:'#5A5465',
  steel:'#5F8EA2', fairy:'#EFA7AF'
};

// chart[attacker_index][defender_index]
const TC = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,.5, 0, 1, 1,.5, 1],
  [1,.5,.5, 1, 2, 2, 1, 1, 1, 1, 1, 2,.5, 1,.5, 1, 2, 1],
  [1, 2,.5, 1,.5, 1, 1, 1, 2, 1, 1, 1, 2, 1,.5, 1, 1, 1],
  [1, 1, 2,.5,.5, 1, 1, 1, 0, 2, 1, 1, 1, 1,.5, 1, 1, 1],
  [1,.5, 2, 1,.5, 1, 1,.5, 2,.5, 1,.5, 2, 1,.5, 1,.5, 1],
  [1,.5,.5, 1, 2,.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1,.5, 1],
  [2, 1, 1, 1, 1, 2, 1,.5, 1,.5,.5,.5, 2, 0, 1, 2, 2,.5],
  [1, 1, 1, 1, 2, 1, 1,.5,.5, 1, 1, 1,.5,.5, 1, 1, 0, 2],
  [1, 2, 1, 2,.5, 1, 1, 2, 1, 0, 1,.5, 2, 1, 1, 1, 2, 1],
  [1, 1, 1,.5, 2, 1, 2, 1, 1, 1, 1, 2,.5, 1, 1, 1,.5, 1],
  [1, 1, 1, 1, 1, 1, 2, 2, 1, 1,.5, 1, 1, 1, 1, 0,.5, 1],
  [1,.5, 1, 1, 2, 1,.5,.5, 1,.5, 2, 1, 1,.5, 1, 2,.5,.5],
  [1, 2, 1, 1, 1, 2,.5, 1,.5, 2, 1, 2, 1, 1, 1, 1,.5, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1,.5, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1,.5, 0],
  [1, 1, 1, 1, 1, 1,.5, 1, 1, 1, 2,.5, 1, 2, 1,.5, 1,.5],
  [1,.5,.5,.5,.5, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1,.5, 2],
  [1,.5, 1, 1, 1, 1, 2,.5, 1, 1, 1, 1, 1, 1, 2, 2,.5, 1],
];

const TYPE_CHART = {};
TYPES.forEach((att, i) => {
  TYPE_CHART[att] = {};
  TYPES.forEach((def, j) => { TYPE_CHART[att][def] = TC[i][j]; });
});

function getDefenseChart(defTypes) {
  const result = {};
  TYPES.forEach(att => {
    let m = 1;
    defTypes.forEach(def => { m *= TYPE_CHART[att][def] ?? 1; });
    result[att] = m;
  });
  return result;
}

// ─── ROSTER ──────────────────────────────────────────────────
const ROSTER = [
  {name:"Abomasnow",slug:"abomasnow",id:460},{name:"Absol",slug:"absol",id:359},
  {name:"Aegislash",slug:"aegislash-shield",id:681},{name:"Aerodactyl",slug:"aerodactyl",id:142},
  {name:"Aggron",slug:"aggron",id:306},{name:"Alakazam",slug:"alakazam",id:65},
  {name:"Alcremie",slug:"alcremie",id:869},{name:"Altaria",slug:"altaria",id:334},
  {name:"Ampharos",slug:"ampharos",id:181},{name:"Appletun",slug:"appletun",id:842},
  {name:"Araquanid",slug:"araquanid",id:752},{name:"Arbok",slug:"arbok",id:24},
  {name:"Arcanine",slug:"arcanine",id:59},{name:"Arcanine (Hisuian)",slug:"arcanine-hisui",id:59,form:"Hisuian"},
  {name:"Archaludon",slug:"archaludon",id:1018},{name:"Ariados",slug:"ariados",id:168},
  {name:"Armarouge",slug:"armarouge",id:921},{name:"Aromatisse",slug:"aromatisse",id:683},
  {name:"Audino",slug:"audino",id:531},{name:"Aurorus",slug:"aurorus",id:699},
  {name:"Avalugg",slug:"avalugg",id:713},{name:"Avalugg (Hisuian)",slug:"avalugg-hisui",id:713,form:"Hisuian"},
  {name:"Azumarill",slug:"azumarill",id:184},{name:"Banette",slug:"banette",id:354},
  {name:"Basculegion",slug:"basculegion-male",id:902},{name:"Bastiodon",slug:"bastiodon",id:411},
  {name:"Beartic",slug:"beartic",id:614},{name:"Beedrill",slug:"beedrill",id:15},
  {name:"Bellibolt",slug:"bellibolt",id:939},{name:"Blastoise",slug:"blastoise",id:9},
  {name:"Camerupt",slug:"camerupt",id:323},{name:"Castform",slug:"castform",id:351},
  {name:"Ceruledge",slug:"ceruledge",id:922},{name:"Chandelure",slug:"chandelure",id:609},
  {name:"Charizard",slug:"charizard",id:6},{name:"Chesnaught",slug:"chesnaught",id:652},
  {name:"Chimecho",slug:"chimecho",id:358},{name:"Clawitzer",slug:"clawitzer",id:693},
  {name:"Clefable",slug:"clefable",id:36},{name:"Cofagrigus",slug:"cofagrigus",id:563},
  {name:"Conkeldurr",slug:"conkeldurr",id:534},{name:"Corviknight",slug:"corviknight",id:823},
  {name:"Crabominable",slug:"crabominable",id:740},{name:"Decidueye",slug:"decidueye",id:724},
  {name:"Decidueye (Hisuian)",slug:"decidueye-hisui",id:724,form:"Hisuian"},
  {name:"Dedenne",slug:"dedenne",id:702},{name:"Delphox",slug:"delphox",id:655},
  {name:"Diggersby",slug:"diggersby",id:660},{name:"Ditto",slug:"ditto",id:132},
  {name:"Dragapult",slug:"dragapult",id:887},{name:"Dragonite",slug:"dragonite",id:149},
  {name:"Drampa",slug:"drampa",id:780},{name:"Emboar",slug:"emboar",id:500},
  {name:"Emolga",slug:"emolga",id:587},{name:"Empoleon",slug:"empoleon",id:395},
  {name:"Espathra",slug:"espathra",id:956},{name:"Espeon",slug:"espeon",id:196},
  {name:"Excadrill",slug:"excadrill",id:530},{name:"Farigiraf",slug:"farigiraf",id:981},
  {name:"Feraligatr",slug:"feraligatr",id:160},{name:"Flapple",slug:"flapple",id:841},
  {name:"Flareon",slug:"flareon",id:136},{name:"Floette",slug:"floette",id:670},
  {name:"Florges",slug:"florges",id:671},{name:"Forretress",slug:"forretress",id:205},
  {name:"Froslass",slug:"froslass",id:478},{name:"Furfrou",slug:"furfrou",id:676},
  {name:"Gallade",slug:"gallade",id:475},{name:"Garbodor",slug:"garbodor",id:569},
  {name:"Garchomp",slug:"garchomp",id:445},{name:"Gardevoir",slug:"gardevoir",id:282},
  {name:"Garganacl",slug:"garganacl",id:937},{name:"Gengar",slug:"gengar",id:94},
  {name:"Glaceon",slug:"glaceon",id:471},{name:"Glalie",slug:"glalie",id:362},
  {name:"Glimmora",slug:"glimmora",id:970},{name:"Gliscor",slug:"gliscor",id:472},
  {name:"Golurk",slug:"golurk",id:623},{name:"Goodra",slug:"goodra",id:706},
  {name:"Goodra (Hisuian)",slug:"goodra-hisui",id:706,form:"Hisuian"},
  {name:"Gourgeist",slug:"gourgeist-average",id:711},{name:"Greninja",slug:"greninja",id:658},
  {name:"Gyarados",slug:"gyarados",id:130},{name:"Hatterene",slug:"hatterene",id:858},
  {name:"Hawlucha",slug:"hawlucha",id:701},{name:"Heliolisk",slug:"heliolisk",id:695},
  {name:"Heracross",slug:"heracross",id:214},{name:"Hippowdon",slug:"hippowdon",id:450},
  {name:"Houndoom",slug:"houndoom",id:229},{name:"Hydrapple",slug:"hydrapple",id:1019},
  {name:"Hydreigon",slug:"hydreigon",id:635},{name:"Incineroar",slug:"incineroar",id:727},
  {name:"Infernape",slug:"infernape",id:392},{name:"Jolteon",slug:"jolteon",id:135},
  {name:"Kangaskhan",slug:"kangaskhan",id:115},{name:"Kingambit",slug:"kingambit",id:983},
  {name:"Kleavor",slug:"kleavor",id:900},{name:"Klefki",slug:"klefki",id:707},
  {name:"Kommo-o",slug:"kommo-o",id:784},{name:"Krookodile",slug:"krookodile",id:553},
  {name:"Leafeon",slug:"leafeon",id:470},{name:"Liepard",slug:"liepard",id:510},
  {name:"Lopunny",slug:"lopunny",id:428},{name:"Lucario",slug:"lucario",id:448},
  {name:"Luxray",slug:"luxray",id:405},
  {name:"Lycanroc",slug:"lycanroc-midday",id:745},
  {name:"Lycanroc (Midnight)",slug:"lycanroc-midnight",id:745,form:"Midnight"},
  {name:"Lycanroc (Dusk)",slug:"lycanroc-dusk",id:745,form:"Dusk"},
  {name:"Machamp",slug:"machamp",id:68},{name:"Mamoswine",slug:"mamoswine",id:473},
  {name:"Manectric",slug:"manectric",id:310},{name:"Maushold",slug:"maushold",id:925},
  {name:"Medicham",slug:"medicham",id:308},{name:"Meganium",slug:"meganium",id:154},
  {name:"Meowscarada",slug:"meowscarada",id:908},
  {name:"Meowstic",slug:"meowstic-male",id:678},
  {name:"Meowstic (F)",slug:"meowstic-female",id:678,form:"Female"},
  {name:"Milotic",slug:"milotic",id:350},{name:"Mimikyu",slug:"mimikyu-disguised",id:778},
  {name:"Morpeko",slug:"morpeko",id:877},{name:"Mr. Rime",slug:"mr-rime",id:866},
  {name:"Mudsdale",slug:"mudsdale",id:750},{name:"Ninetales",slug:"ninetales",id:38},
  {name:"Ninetales (Alolan)",slug:"ninetales-alola",id:38,form:"Alolan"},
  {name:"Noivern",slug:"noivern",id:715},{name:"Oranguru",slug:"oranguru",id:765},
  {name:"Orthworm",slug:"orthworm",id:968},{name:"Palafin",slug:"palafin",id:964},
  {name:"Pangoro",slug:"pangoro",id:675},{name:"Passimian",slug:"passimian",id:766},
  {name:"Patrat",slug:"patrat",id:504},{name:"Pelipper",slug:"pelipper",id:279},
  {name:"Pidgeot",slug:"pidgeot",id:18},{name:"Pikachu",slug:"pikachu",id:25},
  {name:"Pinsir",slug:"pinsir",id:127},{name:"Politoed",slug:"politoed",id:186},
  {name:"Polteageist",slug:"polteageist",id:855},{name:"Primarina",slug:"primarina",id:730},
  {name:"Quaquaval",slug:"quaquaval",id:910},{name:"Raichu",slug:"raichu",id:26},
  {name:"Raichu (Alolan)",slug:"raichu-alola",id:26,form:"Alolan"},
  {name:"Rampardos",slug:"rampardos",id:409},{name:"Reuniclus",slug:"reuniclus",id:579},
  {name:"Rhyperior",slug:"rhyperior",id:464},{name:"Roserade",slug:"roserade",id:407},
  {name:"Rotom",slug:"rotom",id:479},{name:"Rotom (Heat)",slug:"rotom-heat",id:479,form:"Heat"},
  {name:"Rotom (Wash)",slug:"rotom-wash",id:479,form:"Wash"},
  {name:"Rotom (Frost)",slug:"rotom-frost",id:479,form:"Frost"},
  {name:"Rotom (Fan)",slug:"rotom-fan",id:479,form:"Fan"},
  {name:"Rotom (Mow)",slug:"rotom-mow",id:479,form:"Mow"},
  {name:"Runerigus",slug:"runerigus",id:867},{name:"Sableye",slug:"sableye",id:302},
  {name:"Salazzle",slug:"salazzle",id:758},{name:"Samurott",slug:"samurott",id:503},
  {name:"Samurott (Hisuian)",slug:"samurott-hisui",id:503,form:"Hisuian"},
  {name:"Sandaconda",slug:"sandaconda",id:844},{name:"Scizor",slug:"scizor",id:212},
  {name:"Scovillain",slug:"scovillain",id:961},{name:"Serperior",slug:"serperior",id:497},
  {name:"Sharpedo",slug:"sharpedo",id:319},{name:"Simipour",slug:"simipour",id:516},
  {name:"Simisage",slug:"simisage",id:512},{name:"Simisear",slug:"simisear",id:514},
  {name:"Sinistcha",slug:"sinistcha",id:1013},{name:"Skarmory",slug:"skarmory",id:227},
  {name:"Skeledirge",slug:"skeledirge",id:909},{name:"Slowbro",slug:"slowbro",id:80},
  {name:"Slowbro (Galarian)",slug:"slowbro-galar",id:80,form:"Galarian"},
  {name:"Slowking",slug:"slowking",id:199},
  {name:"Slowking (Galarian)",slug:"slowking-galar",id:199,form:"Galarian"},
  {name:"Slurpuff",slug:"slurpuff",id:685},{name:"Sneasler",slug:"sneasler",id:903},
  {name:"Snorlax",slug:"snorlax",id:143},{name:"Spiritomb",slug:"spiritomb",id:442},
  {name:"Starmie",slug:"starmie",id:121},{name:"Steelix",slug:"steelix",id:208},
  {name:"Stunfisk",slug:"stunfisk",id:618},
  {name:"Stunfisk (Galarian)",slug:"stunfisk-galar",id:618,form:"Galarian"},
  {name:"Sylveon",slug:"sylveon",id:700},{name:"Talonflame",slug:"talonflame",id:663},
  {name:"Tauros",slug:"tauros",id:128},
  {name:"Tauros (Combat)",slug:"tauros-paldea-combat-breed",id:128,form:"Paldean Combat"},
  {name:"Tauros (Blaze)",slug:"tauros-paldea-blaze-breed",id:128,form:"Paldean Blaze"},
  {name:"Tauros (Aqua)",slug:"tauros-paldea-aqua-breed",id:128,form:"Paldean Aqua"},
  {name:"Tinkaton",slug:"tinkaton",id:959},{name:"Torkoal",slug:"torkoal",id:324},
  {name:"Torterra",slug:"torterra",id:389},{name:"Toucannon",slug:"toucannon",id:733},
  {name:"Toxapex",slug:"toxapex",id:748},{name:"Toxicroak",slug:"toxicroak",id:454},
  {name:"Trevenant",slug:"trevenant",id:709},{name:"Tsareena",slug:"tsareena",id:763},
  {name:"Typhlosion",slug:"typhlosion",id:157},
  {name:"Typhlosion (Hisuian)",slug:"typhlosion-hisui",id:157,form:"Hisuian"},
  {name:"Tyranitar",slug:"tyranitar",id:248},{name:"Tyrantrum",slug:"tyrantrum",id:697},
  {name:"Umbreon",slug:"umbreon",id:197},{name:"Vanilluxe",slug:"vanilluxe",id:584},
  {name:"Vaporeon",slug:"vaporeon",id:134},{name:"Venusaur",slug:"venusaur",id:3},
  {name:"Victreebel",slug:"victreebel",id:71},{name:"Vivillon",slug:"vivillon",id:666},
  {name:"Volcarona",slug:"volcarona",id:637},{name:"Weavile",slug:"weavile",id:461},
  {name:"Whimsicott",slug:"whimsicott",id:547},{name:"Wyrdeer",slug:"wyrdeer",id:899},
  {name:"Zoroark",slug:"zoroark",id:571},
  {name:"Zoroark (Hisuian)",slug:"zoroark-hisui",id:571,form:"Hisuian"},
];

// ─── ITEMS ───────────────────────────────────────────────────
const ITEMS = [
  {name:"Life Orb",cat:"Damage",icon:"⚔️",effect:"Boosts move power by 30%. User loses 10% HP after each hit.",rec:["Garchomp","Greninja","Lucario","Dragapult","Meowscarada"]},
  {name:"Choice Band",cat:"Choice",icon:"🎗️",effect:"Boosts Attack ×1.5, but user is locked into the move used.",rec:["Incineroar","Dragonite","Machamp","Conkeldurr","Rhyperior"]},
  {name:"Choice Specs",cat:"Choice",icon:"👓",effect:"Boosts Sp. Atk ×1.5, but user is locked into the move used.",rec:["Primarina","Hydreigon","Volcarona","Hydrapple"]},
  {name:"Choice Scarf",cat:"Choice",icon:"💨",effect:"Boosts Speed ×1.5, but user is locked into the move used.",rec:["Garchomp","Krookodile","Heracross","Hydreigon"]},
  {name:"Assault Vest",cat:"Bulk",icon:"🦺",effect:"Raises Sp. Def by 50%. User can only use damaging moves.",rec:["Incineroar","Dragonite","Conkeldurr","Snorlax"]},
  {name:"Leftovers",cat:"Recovery",icon:"🥣",effect:"Restores 1/16 max HP at end of each turn.",rec:["Snorlax","Hippowdon","Toxapex","Garganacl"]},
  {name:"Rocky Helmet",cat:"Contact",icon:"⛑️",effect:"Damages contact attackers for 1/6 of their max HP.",rec:["Corviknight","Garchomp","Feraligatr"]},
  {name:"Focus Sash",cat:"Survival",icon:"🩹",effect:"At full HP, user survives any hit that would KO it with 1 HP.",rec:["Alakazam","Rampardos","Pikachu","Volcarona"]},
  {name:"Weakness Policy",cat:"Stat Boost",icon:"📈",effect:"When hit by a super-effective move, sharply raises Atk and Sp. Atk (+2 stages each).",rec:["Garchomp","Tyranitar","Dragapult","Mimikyu"]},
  {name:"Sitrus Berry",cat:"Berry",icon:"🍊",effect:"Restores 25% max HP when HP drops to 50% or below.",rec:["Kangaskhan","Snorlax","Incineroar"]},
  {name:"Lum Berry",cat:"Berry",icon:"🍋",effect:"Cures any status condition (including confusion) once.",rec:["Garchomp","Gyarados","Tyranitar","Incineroar"]},
  {name:"Safety Goggles",cat:"Weather",icon:"🥽",effect:"Protects against weather damage and powder/spore moves.",rec:["Incineroar","Blastoise","Abomasnow"]},
  {name:"Clear Amulet",cat:"Protection",icon:"🛡️",effect:"Prevents stat drops from opponent's moves or abilities (blocks Intimidate).",rec:["Garchomp","Charizard","Physical sweepers"]},
  {name:"Eject Button",cat:"Reactive",icon:"🔴",effect:"When the holder takes damage, it immediately switches out.",rec:["Incineroar","Pelipper","Torkoal"]},
  {name:"Red Card",cat:"Reactive",icon:"🃏",effect:"When hit (not KO'd), forces the attacker out. Consumed after use.",rec:["Snorlax","Hippowdon","Bastiodon"]},
  {name:"Flame Orb",cat:"Status",icon:"🔥",effect:"Burns the holder at end of turn. Activates Guts or Flare Boost.",rec:["Conkeldurr","Machamp"]},
  {name:"Toxic Orb",cat:"Status",icon:"☠️",effect:"Badly poisons the holder. Activates Poison Heal ability.",rec:["Gliscor","Toxicroak"]},
  {name:"Power Herb",cat:"One-Time",icon:"🌿",effect:"Allows a two-turn move (Solar Beam, Sky Attack) in one turn. Consumed on use.",rec:["Volcarona","Venusaur","Leafeon"]},
  {name:"Throat Spray",cat:"Stat Boost",icon:"🎤",effect:"Using a sound-based move sharply raises Sp. Atk. Consumed after use.",rec:["Primarina","Incineroar (Parting Shot)"]},
  {name:"Booster Energy",cat:"Stat Boost",icon:"⚡",effect:"Activates Protosynthesis or Quark Drive, boosting the holder's highest stat.",rec:["Iron Bundle (not in reg)","Future paradox Pokémon"]},
  {name:"Wide Lens",cat:"Accuracy",icon:"🔭",effect:"Raises holder's accuracy by 10%.",rec:["Blizzard users","Stone Edge users"]},
  {name:"Air Balloon",cat:"Utility",icon:"🎈",effect:"Holder floats, immune to Ground moves until hit.",rec:["Excadrill","Gengar","Houndoom"]},
  {name:"Shed Shell",cat:"Utility",icon:"🐚",effect:"Allows switching out even when trapped by Arena Trap or Shadow Tag.",rec:["Ground-types vs Diglett (not in reg)"]},
  {name:"Terrain Extender",cat:"Terrain",icon:"🌱",effect:"Extends the duration of terrains set by the holder to 8 turns.",rec:["Whimsicott","Meowstic"]},
];

// ─── SYNERGIES ────────────────────────────────────────────────
const SYNERGIES = [
  {name:"Drizzle Duo",cat:"Weather",color:"#4D90D5",
   desc:"Pelipper or Politoed summons Rain. Water moves get ×1.5, Thunder hits 100%, Swift Swim activates. One of the most dominant weather archetypes in VGC.",
   core:["Pelipper","Politoed"],allies:["Gyarados","Toxapex","Araquanid","Milotic","Clawitzer"]},
  {name:"Drought Core",cat:"Weather",color:"#FF7C3F",
   desc:"Torkoal's Drought ignites permanent Sun. Fire moves get ×1.5, Solar Beam fires in one turn, and Chlorophyll users double their speed.",
   core:["Torkoal"],allies:["Venusaur","Volcarona","Leafeon","Charizard","Simisage"]},
  {name:"Sand Stream",cat:"Weather",color:"#D97845",
   desc:"Tyranitar or Hippowdon summons Sandstorm. Rock-types gain ×1.5 Sp. Def. Sand chips non Rock/Steel/Ground types each turn. Excadrill becomes a sand sweeper.",
   core:["Tyranitar","Hippowdon"],allies:["Garchomp","Excadrill","Steelix","Garganacl"]},
  {name:"Snow Warning",cat:"Weather",color:"#74CEC0",
   desc:"Abomasnow summons perpetual hail/snow, enabling Blizzard's 100% accuracy and Aurora Veil. Ice-type attackers become far more threatening.",
   core:["Abomasnow"],allies:["Glaceon","Beartic","Vanilluxe","Mamoswine"]},
  {name:"Trick Room Terror",cat:"Strategy",color:"#705898",
   desc:"Trick Room reverses speed order for 5 turns. Slow, tanky powerhouses become untouchable. Best setters have low speed and are hard to OHKO.",
   core:["Hatterene","Reuniclus","Slowking (Galarian)","Cofagrigus"],allies:["Machamp","Conkeldurr","Mudsdale","Rhyperior","Snorlax","Mamoswine"]},
  {name:"Tailwind Sweep",cat:"Strategy",color:"#879EEC",
   desc:"Tailwind doubles the Speed of the user's side for 4 turns. Talonflame's Gale Wings sets it at +1 priority — before the opponent can prevent it.",
   core:["Talonflame","Corviknight","Pelipper","Whimsicott"],allies:["Garchomp","Charizard","Meowscarada","Dragapult","Lucario"]},
  {name:"Intimidate Cycling",cat:"Support",color:"#CE406B",
   desc:"Incineroar, Arcanine, and Gyarados all have Intimidate. Cycling them via U-turn or Parting Shot stacks Attack drops on the opponent's physical attackers across the game.",
   core:["Incineroar","Arcanine","Gyarados","Luxray"],allies:["Any physical sweeper benefiting from Attack drops on foes"]},
  {name:"Fake Out + Support",cat:"Doubles",color:"#F2C418",
   desc:"Fake Out flinches one opponent on Turn 1 for free. Paired with Follow Me or Rage Powder, your second Pokémon acts unopposed to set up, KO, or pivot.",
   core:["Incineroar","Kangaskhan","Lopunny","Meowstic"],allies:["Oranguru","Clefable","Gardevoir","Florges"]},
  {name:"Quiver Dance Setup",cat:"Setup",color:"#A8B820",
   desc:"Volcarona uses Quiver Dance to raise Sp. Atk, Sp. Def, and Speed by 1 stage each. After two boosts it sweeps entire teams. Rage Powder + Quiver Dance is a core VGC combo.",
   core:["Volcarona"],allies:["Oranguru (Rage Powder)","Florges","Incineroar (redirect)"]},
  {name:"Fairy + Steel Core",cat:"Typing",color:"#EFA7AF",
   desc:"Fairy resists Dragon/Dark/Fighting. Steel resists Ice/Rock/Fairy and is immune to Poison. Together they cover nearly every threat in the meta, leaving almost no exploitable weakness.",
   core:["Sylveon","Gardevoir","Clefable","Florges"],allies:["Corviknight","Scizor","Klefki","Skarmory","Steelix"]},
  {name:"Ghost + Normal Immunity Wall",cat:"Typing",color:"#5269AC",
   desc:"Normal and Fighting moves are blocked by Ghost-types. Ghost moves are blocked by Normal-types. Spiritomb (Dark/Ghost) has zero weaknesses to regular types.",
   core:["Gengar","Chandelure","Aegislash","Spiritomb"],allies:["Snorlax","Kangaskhan","Audino"]},
  {name:"Dragon Dance Sweeper",cat:"Setup",color:"#0F6AC2",
   desc:"Dragon Dance raises Attack and Speed by one stage each. After 1-2 DDs, Gyarados, Dragonite, or Tyranitar become virtually unstoppable. Protect stalls to pick up an extra DD.",
   core:["Gyarados","Dragonite","Tyranitar"],allies:["Intimidate support","Follow Me redirectors"]},
];

// ─── HOOK: fetch Pokémon from PokeAPI ─────────────────────────
const cache = {};
function usePokemon(slug) {
  const [data, setData] = useState(cache[slug] || null);
  const [loading, setLoading] = useState(!cache[slug]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    if (cache[slug]) { setData(cache[slug]); setLoading(false); return; }
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`)
      .then(r => r.json())
      .then(d => { cache[slug] = d; setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  }, [slug]);

  return { data, loading, error };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────
function TypeBadge({ type, small }) {
  return (
    <span style={{ backgroundColor: TYPE_COLORS[type] }}
      className={`inline-block rounded-full font-bold uppercase tracking-wide text-white ${small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
      {type}
    </span>
  );
}

function StatBar({ label, value, max = 255, color }) {
  const pct = Math.round((value / max) * 100);
  const barColor = value >= 100 ? '#5FBD62' : value >= 70 ? '#F2C418' : '#CE406B';
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs text-gray-400 w-14 text-right shrink-0">{label}</span>
      <span className="text-xs font-bold text-white w-8 text-right shrink-0">{value}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function PokemonCard({ mon, onClick, inTeam }) {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mon.id}.png`;
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center rounded-xl border transition-all duration-200 p-3 cursor-pointer group hover:scale-105 hover:shadow-2xl ${
        inTeam ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 bg-white/5 hover:border-white/30'
      }`}>
      {inTeam && <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">✓</div>}
      {mon.form && (
        <span className="absolute top-1 left-1 text-xs bg-gray-700 text-gray-300 rounded px-1 py-0.5">{mon.form}</span>
      )}
      <img src={spriteUrl} alt={mon.name} loading="lazy"
        className="w-16 h-16 object-contain drop-shadow-lg"
        onError={e => { e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`; }} />
      <span className="text-xs text-white font-medium mt-1 text-center leading-tight">{mon.name}</span>
    </button>
  );
}

function EffectivenessGrid({ chart }) {
  const immune = TYPES.filter(t => chart[t] === 0);
  const quarter = TYPES.filter(t => chart[t] === 0.25);
  const half = TYPES.filter(t => chart[t] === 0.5);
  const double = TYPES.filter(t => chart[t] === 2);
  const quad = TYPES.filter(t => chart[t] === 4);

  const Row = ({ label, types, bg }) => types.length === 0 ? null : (
    <div className="mb-2">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">{types.map(t => <TypeBadge key={t} type={t} small />)}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div>
        {quad.length > 0 && <Row label="×4 Weak" types={quad} />}
        <Row label="×2 Weak" types={double} />
      </div>
      <div>
        <Row label="×½ Resist" types={half} />
        {quarter.length > 0 && <Row label="×¼ Resist" types={quarter} />}
        <Row label="Immune" types={immune} />
      </div>
    </div>
  );
}

// ─── POKÉMON DETAIL PAGE ───────────────────────────────────────
function PokemonDetail({ mon, onBack, onAddToTeam, inTeam }) {
  const { data, loading, error } = usePokemon(mon.slug);
  const [shiny, setShiny] = useState(false);

  const sprite = data
    ? (shiny
        ? (data.sprites?.other?.['official-artwork']?.front_shiny || data.sprites?.front_shiny)
        : (data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default))
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mon.id}.png`;

  const types = data ? data.types.map(t => t.type.name) : [];
  const stats = data ? data.stats.map(s => ({ label: s.stat.name.replace('special-attack','Sp.Atk').replace('special-defense','Sp.Def').replace('attack','Atk').replace('defense','Def').replace('speed','Spd').replace('hp','HP'), value: s.base_stat })) : [];
  const abilities = data ? data.abilities.map(a => ({ name: a.ability.name.replace(/-/g,' '), hidden: a.is_hidden })) : [];
  const bst = stats.reduce((s, x) => s + x.value, 0);
  const defChart = types.length ? getDefenseChart(types) : null;

  const topMoves = data ? data.moves
    .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
    .slice(0, 16)
    .map(m => m.move.name.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()))
    : [];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
        <span>←</span> Back to Roster
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6"
          style={{ background: types[0] ? `radial-gradient(ellipse at top, ${TYPE_COLORS[types[0]]}22 0%, transparent 70%)` : undefined }}>
          <div className="relative">
            {loading
              ? <div className="w-36 h-36 bg-white/10 rounded-full animate-pulse" />
              : <img src={sprite} alt={mon.name} className="w-36 h-36 object-contain drop-shadow-2xl" />}
            <button onClick={() => setShiny(s => !s)}
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full border transition-colors ${shiny ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-white/20 text-gray-400 hover:text-white'}`}>
              {shiny ? '✨ Shiny' : 'Normal'}
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="text-gray-400 text-sm">#{mon.id}</div>
            <h2 className="text-3xl font-bold text-white">{mon.name}</h2>
            {mon.form && <div className="text-sm text-gray-400 mb-2">{mon.form} Form</div>}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
              {types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
            {!loading && <div className="text-gray-400 text-sm mt-2">BST: <span className="text-white font-bold">{bst}</span></div>}
            <div className="flex gap-2 mt-3 justify-center sm:justify-start">
              <button onClick={onAddToTeam}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${inTeam ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {inTeam ? '✓ In Team' : '+ Add to Team'}
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="p-6 text-center text-gray-400">Loading data…</div>}
        {error && <div className="p-6 text-center text-red-400">Failed to load data from PokeAPI.</div>}

        {!loading && data && (
          <div className="p-6 grid gap-6">
            {/* Abilities */}
            <div>
              <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-widest">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {abilities.map(a => (
                  <span key={a.name} className={`px-3 py-1 rounded-lg text-sm capitalize ${a.hidden ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-white/10 text-white'}`}>
                    {a.name} {a.hidden && <span className="text-xs text-purple-400">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Stats */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Base Stats</h3>
              {stats.map(s => <StatBar key={s.label} label={s.label} value={s.value} />)}
            </div>

            {/* Type Effectiveness */}
            {defChart && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Type Matchups (Defending)</h3>
                <EffectivenessGrid chart={defChart} />
              </div>
            )}

            {/* Moves */}
            {topMoves.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-widest">Level-Up Moves (sample)</h3>
                <div className="flex flex-wrap gap-1.5">
                  {topMoves.map(m => (
                    <span key={m} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-md">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROSTER TAB ───────────────────────────────────────────────
function RosterTab({ team, onSelect, onToggleTeam }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    return ROSTER.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text" placeholder="Search Pokémon…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors text-sm"
        />
        <div className="text-gray-400 text-sm flex items-center shrink-0">{filtered.length} / {ROSTER.length} Pokémon</div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${filterType === 'all' ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
          ALL
        </button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? 'all' : t)}
            style={filterType === t ? { backgroundColor: TYPE_COLORS[t] } : {}}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${filterType === t ? 'text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filtered.map(mon => (
          <PokemonCard key={mon.slug} mon={mon} onClick={() => onSelect(mon)}
            inTeam={team.some(t => t.slug === mon.slug)} />
        ))}
      </div>
    </div>
  );
}

// ─── TEAM COVERAGE GRID ────────────────────────────────────────
function TeamCoverageGrid({ teamData }) {
  // For each type (attacker), check if team has super-effective coverage
  // teamData = array of { types: ['fire', 'flying'] }
  return (
    <div>
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Team Weakness Chart</h3>
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="text-gray-500 text-left pr-2 py-1 font-normal">Attacker ↓ vs your team</th>
              {teamData.map((m, i) => (
                <th key={i} className="text-center px-1 text-gray-400 font-normal">{m.name.split(' ')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map(att => {
              const mults = teamData.map(m => {
                const chart = getDefenseChart(m.types);
                return chart[att];
              });
              const hasWeak = mults.some(v => v >= 2);
              const allImmune = mults.every(v => v === 0);
              if (!hasWeak && !allImmune) return null;
              return (
                <tr key={att} className={hasWeak ? 'bg-red-900/10' : ''}>
                  <td className="pr-2 py-0.5">
                    <TypeBadge type={att} small />
                  </td>
                  {mults.map((v, i) => (
                    <td key={i} className="text-center px-1 py-0.5">
                      <span className={`font-bold ${v >= 4 ? 'text-red-400' : v >= 2 ? 'text-orange-400' : v === 0 ? 'text-blue-400' : v <= 0.25 ? 'text-green-400' : 'text-gray-600'}`}>
                        {v === 0 ? '✕' : v === 0.25 ? '¼' : v === 0.5 ? '½' : v === 1 ? '–' : v === 2 ? '2×' : '4×'}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TEAMBUILDER TAB ──────────────────────────────────────────
function TeambuilderTab({ team, teamData, onRemove, onAdd }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (teamData.length === 0) { setSuggestions([]); return; }

    // Find types the team is weak to (×2 or more on all/most members)
    const weaknessCounts = {};
    TYPES.forEach(att => {
      const worstMult = Math.max(...teamData.map(m => getDefenseChart(m.types)[att]));
      if (worstMult >= 2) weaknessCounts[att] = (weaknessCounts[att] || 0) + teamData.filter(m => getDefenseChart(m.types)[att] >= 2).length;
    });

    const topWeaknesses = Object.entries(weaknessCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

    // Find Roster Pokémon not in team that resist those types
    const scored = ROSTER
      .filter(m => !team.some(t => t.slug === m.slug))
      .map(mon => {
        // We can't fetch types here easily — suggest popular picks based on weak types
        return { mon, score: 0, reason: '' };
      });

    // Heuristic suggestions based on dominant weaknesses
    const hintMap = {
      fire: ["Gyarados","Arcanine","Rhyperior","Politoed","Milotic"],
      water: ["Blastoise","Venusaur","Ampharos","Toxicroak","Leafeon"],
      grass: ["Volcarona","Incineroar","Talonflame","Skarmory","Charizard"],
      electric: ["Garchomp","Hippowdon","Mudsdale","Mamoswine"],
      rock: ["Lucario","Empoleon","Gyarados","Araquanid","Milotic"],
      ice: ["Arcanine","Lucario","Incineroar","Scizor","Garganacl"],
      fighting: ["Gengar","Crobat (N/A)","Espeon","Hatterene","Gardevoir"],
      dark: ["Gardevoir","Sylveon","Klefki","Incineroar","Machamp"],
      dragon: ["Gardevoir","Sylveon","Klefki","Clefable","Florges"],
      ghost: ["Snorlax","Tyranitar","Umbreon","Incineroar"],
      steel: ["Garchomp","Infernape","Toxicroak","Excadrill","Houndoom"],
      poison: ["Garchomp","Espeon","Gallade","Steelix"],
      ground: ["Gyarados","Talonflame","Corviknight","Skarmory"],
      flying: ["Arcanine","Raichu","Ampharos","Jolteon"],
      psychic: ["Incineroar","Weavile","Hydreigon","Krookodile","Umbreon"],
      bug: ["Arcanine","Talonflame","Corviknight","Charizard"],
      normal: ["Gengar","Aegislash","Cofagrigus","Spiritomb"],
      fairy: ["Garganacl","Scizor","Corviknight","Steelix","Skarmory"],
    };

    const suggestNames = [];
    topWeaknesses.forEach(w => { (hintMap[w] || []).forEach(n => { if (!suggestNames.includes(n)) suggestNames.push(n); }); });

    const suggestMons = suggestNames
      .map(n => ROSTER.find(m => m.name === n))
      .filter(Boolean)
      .filter(m => !team.some(t => t.slug === m.slug))
      .slice(0, 8);

    setSuggestions({ mons: suggestMons, weaknesses: topWeaknesses });
  }, [teamData, team]);

  const slots = [...team, ...Array(6 - team.length).fill(null)];

  return (
    <div className="space-y-6">
      {/* Team Slots */}
      <div>
        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest">Your Team ({team.length}/6)</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {slots.map((mon, i) => (
            <div key={i}
              className={`rounded-xl border min-h-24 flex flex-col items-center justify-center p-2 transition-all ${
                mon ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-dashed border-white/10'
              }`}>
              {mon ? (
                <>
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mon.id}.png`}
                    alt={mon.name} className="w-12 h-12 object-contain"
                    onError={e => { e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`; }} />
                  <span className="text-xs text-white text-center mt-1 leading-tight">{mon.name}</span>
                  <button onClick={() => onRemove(mon.slug)}
                    className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">Remove</button>
                </>
              ) : (
                <span className="text-gray-600 text-xs">Empty</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Type Coverage */}
      {teamData.length > 0 && <TeamCoverageGrid teamData={teamData} />}

      {/* Suggestions */}
      {suggestions?.mons?.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-1 text-sm uppercase tracking-widest">Suggested Picks</h3>
          {suggestions.weaknesses?.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-gray-400 text-xs">Based on team weaknesses:</span>
              {suggestions.weaknesses.map(w => <TypeBadge key={w} type={w} small />)}
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {suggestions.mons.map(mon => (
              <PokemonCard key={mon.slug} mon={mon} inTeam={false}
                onClick={() => team.length < 6 && onAdd(mon)} />
            ))}
          </div>
          {team.length >= 6 && <p className="text-gray-500 text-xs mt-2">Team is full. Remove a slot to add more.</p>}
        </div>
      )}

      {team.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🎮</div>
          <div>Go to the Roster tab and click Pokémon to add them to your team.</div>
        </div>
      )}
    </div>
  );
}

// ─── ITEMS TAB ────────────────────────────────────────────────
const ITEM_CATS = ["All","Choice","Damage","Bulk","Survival","Berry","Stat Boost","Reactive","Weather","Status","Utility","One-Time","Protection","Accuracy","Terrain"];

function ItemsTab() {
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState('');

  const filtered = ITEMS.filter(item => {
    const matchCat = activeCat === 'All' || item.cat === activeCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.effect.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <input type="text" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors text-sm mb-4" />

      <div className="flex flex-wrap gap-1.5 mb-5">
        {ITEM_CATS.filter(c => c === 'All' || ITEMS.some(i => i.cat === c)).map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${activeCat === cat ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(item => (
          <div key={item.name} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-xs bg-white/10 text-gray-400 rounded px-1.5 py-0.5">{item.cat}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-2">{item.effect}</p>
                {item.rec?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.rec.map(r => (
                      <span key={r} className="text-xs bg-yellow-400/10 text-yellow-300 rounded px-1.5 py-0.5">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SYNERGIES TAB ────────────────────────────────────────────
const SYN_CATS = ["All","Weather","Strategy","Support","Doubles","Setup","Typing"];

function SynergiesTab() {
  const [activeCat, setActiveCat] = useState("All");

  const filtered = SYNERGIES.filter(s => activeCat === 'All' || s.cat === activeCat);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SYN_CATS.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${activeCat === cat ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(syn => (
          <div key={syn.name} className="rounded-xl border overflow-hidden transition-all hover:scale-[1.01]"
            style={{ borderColor: syn.color + '44' }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: syn.color + '22' }}>
              <span className="font-bold text-white">{syn.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: syn.color + '66' }}>{syn.cat}</span>
            </div>
            <div className="p-4 bg-black/30">
              <p className="text-gray-300 text-sm leading-relaxed mb-3">{syn.desc}</p>
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Core Pokémon</div>
                <div className="flex flex-wrap gap-1">
                  {syn.core.map(name => {
                    const mon = ROSTER.find(m => m.name === name);
                    return (
                      <div key={name} className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                        {mon && <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`} alt={name} className="w-6 h-6 object-contain" />}
                        <span className="text-xs text-white">{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Good Partners</div>
                <div className="flex flex-wrap gap-1">
                  {syn.allies.map(name => (
                    <span key={name} className="text-xs bg-white/5 text-gray-400 rounded px-2 py-0.5">{name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
const TABS = ['Roster','Teambuilder','Items','Synergies'];

const POKEMON_TYPES = {
  venusaur:['grass','poison'], charizard:['fire','flying'], blastoise:['water'],
  beedrill:['bug','poison'], pidgeot:['normal','flying'], arbok:['poison'],
  pikachu:['electric'], raichu:['electric'], clefable:['fairy'],
  ninetales:['fire'], arcanine:['fire'], alakazam:['psychic'],
  machamp:['fighting'], victreebel:['grass','poison'], slowbro:['water','psychic'],
  gengar:['ghost','poison'], kangaskhan:['normal'], starmie:['water','psychic'],
  pinsir:['bug'], tauros:['normal'], gyarados:['water','flying'],
  ditto:['normal'], vaporeon:['water'], jolteon:['electric'], flareon:['fire'],
  aerodactyl:['rock','flying'], snorlax:['normal'], dragonite:['dragon','flying'],
  meganium:['grass'], typhlosion:['fire'], feraligatr:['water'],
  ariados:['bug','poison'], ampharos:['electric'], azumarill:['water','fairy'],
  politoed:['water'], espeon:['psychic'], umbreon:['dark'],
  slowking:['water','psychic'], forretress:['bug','steel'], steelix:['steel','ground'],
  scizor:['bug','steel'], heracross:['bug','fighting'], skarmory:['steel','flying'],
  houndoom:['dark','fire'], tyranitar:['rock','dark'], pelipper:['water','flying'],
  gardevoir:['psychic','fairy'], sableye:['dark','ghost'], aggron:['steel','rock'],
  medicham:['fighting','psychic'], manectric:['electric'], sharpedo:['water','dark'],
  camerupt:['fire','ground'], torkoal:['fire'], altaria:['dragon','flying'],
  milotic:['water'], castform:['normal'], banette:['ghost'], chimecho:['psychic'],
  absol:['dark'], glalie:['ice'], torterra:['grass','ground'],
  infernape:['fire','fighting'], empoleon:['water','steel'],
  luxray:['electric'], roserade:['grass','poison'], rampardos:['rock'],
  bastiodon:['rock','steel'], lopunny:['normal'], spiritomb:['ghost','dark'],
  garchomp:['dragon','ground'], lucario:['fighting','steel'],
  hippowdon:['ground'], toxicroak:['poison','fighting'], abomasnow:['grass','ice'],
  weavile:['dark','ice'], rhyperior:['ground','rock'], leafeon:['grass'],
  glaceon:['ice'], gliscor:['ground','flying'], mamoswine:['ice','ground'],
  gallade:['psychic','fighting'], froslass:['ice','ghost'],
  rotom:['electric','ghost'], serperior:['grass'], emboar:['fire','fighting'],
  samurott:['water'], excadrill:['ground','steel'], audino:['normal'],
  conkeldurr:['fighting'], whimsicott:['grass','fairy'], krookodile:['ground','dark'],
  cofagrigus:['ghost'], garbodor:['poison'], zoroark:['dark'],
  reuniclus:['psychic'], vanilluxe:['ice'], emolga:['electric','flying'],
  chandelure:['ghost','fire'], beartic:['ice'], stunfisk:['ground','electric'],
  golurk:['ground','ghost'], hydreigon:['dark','dragon'], volcarona:['bug','fire'],
  chesnaught:['grass','fighting'], delphox:['fire','psychic'], greninja:['water','dark'],
  diggersby:['normal','ground'], talonflame:['fire','flying'], vivillon:['bug','flying'],
  floette:['fairy'], florges:['fairy'], pangoro:['fighting','dark'], furfrou:['normal'],
  aegislash:['steel','ghost'], aromatisse:['fairy'], slurpuff:['fairy'],
  clawitzer:['water'], heliolisk:['electric','normal'], tyrantrum:['rock','dragon'],
  aurorus:['rock','ice'], sylveon:['fairy'], hawlucha:['fighting','flying'],
  dedenne:['electric','fairy'], goodra:['dragon'], klefki:['steel','fairy'],
  trevenant:['ghost','grass'], gourgeist:['ghost','grass'], avalugg:['ice'],
  noivern:['flying','dragon'], decidueye:['grass','ghost'], incineroar:['fire','dark'],
  primarina:['water','fairy'], toucannon:['normal','flying'], crabominable:['fighting','ice'],
  toxapex:['poison','water'], mudsdale:['ground'], araquanid:['water','bug'],
  salazzle:['poison','fire'], tsareena:['grass'], oranguru:['normal','psychic'],
  passimian:['fighting'], mimikyu:['ghost','fairy'], drampa:['normal','dragon'],
  corviknight:['flying','steel'], flapple:['grass','dragon'], appletun:['grass','dragon'],
  sandaconda:['ground'], polteageist:['ghost'], hatterene:['psychic','fairy'],
  runerigus:['ground','ghost'], alcremie:['fairy'], morpeko:['electric','dark'],
  dragapult:['dragon','ghost'], wyrdeer:['normal','psychic'], kleavor:['bug','rock'],
  sneasler:['fighting','poison'], meowscarada:['grass','dark'], skeledirge:['fire','ghost'],
  quaquaval:['water','fighting'], armarouge:['fire','psychic'], ceruledge:['fire','ghost'],
  garganacl:['rock'], bellibolt:['electric'], espathra:['psychic'],
  scovillain:['grass','fire'], glimmora:['rock','poison'], tinkaton:['steel','fairy'],
  palafin:['water'], kingambit:['dark','steel'], farigiraf:['normal','psychic'],
  sinistcha:['grass','ghost'], archaludon:['steel','dragon'], hydrapple:['grass','dragon'],
  maushold:['normal'], orthworm:['steel'], liepard:['dark'], kommo:['dragon','fighting'],
  watchog:['normal'], patrat:['normal'],
};

function getTeamTypes(team) {
  return team.map(mon => {
    const key = mon.slug.replace(/-\w+$/, '').replace(/-/g, '');
    const t = POKEMON_TYPES[mon.slug] || POKEMON_TYPES[key] || ['normal'];
    return { name: mon.name, types: t, slug: mon.slug };
  });
}

export default function App() {
  const [tab, setTab] = useState('Roster');
  const [selected, setSelected] = useState(null);
  const [team, setTeam] = useState([]);
  const [reg, setReg] = useState('M-A');

  const teamData = useMemo(() => getTeamTypes(team), [team]);

  const handleAddToTeam = useCallback((mon) => {
    setTeam(prev => {
      if (prev.some(m => m.slug === mon.slug)) return prev.filter(m => m.slug !== mon.slug);
      if (prev.length >= 6) return prev;
      return [...prev, mon];
    });
  }, []);

  const handleRemoveFromTeam = useCallback((slug) => {
    setTeam(prev => prev.filter(m => m.slug !== slug));
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a14', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="border-b border-white/10 sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,10,20,0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xl">⚔️</span>
            <span className="font-black text-white tracking-tight">Pokémon Champions</span>
            <span className="text-xs bg-yellow-400/20 text-yellow-300 rounded px-2 py-0.5 border border-yellow-400/30">Reg {reg}</span>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setSelected(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t && !selected ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                {t}
              </button>
            ))}
          </div>
          {team.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              {team.map(m => (
                <img key={m.slug}
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`}
                  alt={m.name} className="w-7 h-7 object-contain" title={m.name} />
              ))}
              <span className="text-gray-500 text-xs ml-1">{team.length}/6</span>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Pokémon Detail overlay */}
        {selected && (
          <PokemonDetail mon={selected} onBack={() => setSelected(null)}
            onAddToTeam={() => handleAddToTeam(selected)}
            inTeam={team.some(m => m.slug === selected.slug)} />
        )}

        {!selected && tab === 'Roster' && (
          <RosterTab team={team} onSelect={setSelected}
            onToggleTeam={handleAddToTeam} />
        )}
        {!selected && tab === 'Teambuilder' && (
          <TeambuilderTab team={team} teamData={teamData}
            onRemove={handleRemoveFromTeam} onAdd={handleAddToTeam} />
        )}
        {!selected && tab === 'Items' && <ItemsTab />}
        {!selected && tab === 'Synergies' && <SynergiesTab />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 mt-12 py-4 text-center text-gray-600 text-xs">
        Data sourced from PokéAPI · Regulation M-A · April–June 2026 · Not affiliated with Nintendo or The Pokémon Company
      </footer>
    </div>
  );
}
