// StorageManager wraps localStorage with JSON serialisation, namespacing and
// lightweight publish/subscribe capabilities so UI components can react to
// state changes and persist data consistently.
const StorageManager = (() => {
  const prefix = 'arc-raiders-tracker';
  const subscribers = new Map();
  const timers = new Map();
  const defaultDelay = 180;

  const buildKey = (key) => `${prefix}:${key}`;

  const notify = (key, value) => {
    const handlers = subscribers.get(key);
    if (!handlers) return;
    handlers.forEach((handler) => handler(value));
  };

  const get = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(buildKey(key));
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('Storage read error', error);
      return fallback;
    }
  };

  const commit = (key, value) => {
    try {
      localStorage.setItem(buildKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn('Storage write error', error);
    }
    notify(key, value);
  };

  const set = (key, value, { debounce = defaultDelay } = {}) => {
    if (debounce) {
      if (timers.has(key)) clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => {
          commit(key, value);
          timers.delete(key);
        }, debounce)
      );
    } else {
      commit(key, value);
    }
  };

  const subscribe = (key, handler) => {
    const list = subscribers.get(key) ?? [];
    list.push(handler);
    subscribers.set(key, list);
    return () => {
      const next = (subscribers.get(key) ?? []).filter((fn) => fn !== handler);
      if (next.length) {
        subscribers.set(key, next);
      } else {
        subscribers.delete(key);
      }
    };
  };

  const snapshot = () => {
    const data = {};
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => {
        const shortKey = key.replace(`${prefix}:`, '');
        data[shortKey] = JSON.parse(localStorage.getItem(key));
      });
    return data;
  };

  const hydrate = (data = {}) => {
    Object.entries(data).forEach(([key, value]) => commit(key, value));
  };

  return { get, set, subscribe, snapshot, hydrate };
})();

// DataRepository centralises the static content that powers the SPA. Keeping
// these data structures together simplifies rendering and potential future
// updates.
const DataRepository = (() => {
  const workshopStations = [
  {
    id: 'workbench',
    name: 'Workbench',
    description: 'Starter crafting bench for ammo, grenades and essential supplies.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Looting Mk. 1',
          'Light Shield',
          'Ferro',
          'Hairpin',
          'Kettle',
          'Stitcher',
          'Heavy Ammo',
          'Light Ammo',
          'Medium Ammo',
          'Shotgun Ammo',
          'Shield Recharger',
          'Bandage',
          'Light Impact Grenade'
        ],
        materials: []
      }
    ],
    icon: 'fa-hammer'
  },
  {
    id: 'gunsmith',
    name: 'Gunsmith',
    description: 'Add that extra oomph to your weapons by upgrading them here.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Hairpin I',
          'Kettle I',
          'Rattler I',
          'Stitcher I',
          'Angled Grip I',
          'Compensator I',
          'Extended Light Mag I',
          'Extended Medium Mag I',
          'Extended Shotgun Mag I',
          'Muzzle Brake I',
          'Shotgun Choke I',
          'Stable Stock I',
          'Vertical Grip I'
        ],
        materials: [
          {
            item: 'Metal Parts',
            quantity: 20
          },
          {
            item: 'Rubber Parts',
            quantity: 30
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Arpeggio I'
        ],
        materials: [
          {
            item: 'Rusted Tools',
            quantity: 3
          },
          {
            item: 'Mechanical Components',
            quantity: 5
          },
          {
            item: 'Wasp Driver',
            quantity: 8
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [
          'Renegade I'
        ],
        materials: []
      }
    ],
    icon: 'fa-gun'
  },
  {
    id: 'gear-bench',
    name: 'Gear Bench',
    description: 'The Gear Bench lets you craft Shields and Augments - provided you have the right resources.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Light Shield',
          'Medium Shield',
          'Combat Mk. 1',
          'Looting Mk. 1',
          'Tactical Mk. 1'
        ],
        materials: [
          {
            item: 'Plastic Parts',
            quantity: 25
          },
          {
            item: 'Fabric',
            quantity: 30
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Heavy Shield',
          'Combat Mk. 2',
          'Looting Mk. 2',
          'Tactical Mk. 2'
        ],
        materials: [
          {
            item: 'Power Cable',
            quantity: 3
          },
          {
            item: 'Electrical Components',
            quantity: 5
          },
          {
            item: 'Hornet Driver',
            quantity: 5
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [
          'Looting Mk. 3 (Cautious)',
          'Tactical Mk.3 (Defensive)'
        ],
        materials: [
          {
            item: 'Industrial Battery',
            quantity: 3
          },
          {
            item: 'Advanced Electrical Components',
            quantity: 5
          },
          {
            item: 'Bastion Cell',
            quantity: 6
          }
        ]
      }
    ],
    icon: 'fa-toolbox'
  },
  {
    id: 'explosives-station',
    name: 'Explosives Station',
    description: 'Craft your grenades and mines here. Very carefully.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Gas Grenade',
          'Light Impact Grenade'
        ],
        materials: [
          {
            item: 'Chemicals',
            quantity: 50
          },
          {
            item: 'ARC Alloy',
            quantity: 6
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Blaze Grenade'
        ],
        materials: [
          {
            item: 'Synthesized Fuel',
            quantity: 3
          },
          {
            item: 'Crude Explosives',
            quantity: 5
          },
          {
            item: 'Pop Trigger',
            quantity: 5
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [
          'Heavy Fuze Grenade'
        ],
        materials: [
          {
            item: 'Laboratory Reagents',
            quantity: 3
          },
          {
            item: 'Explosive Compound',
            quantity: 5
          },
          {
            item: 'Rocketeer Driver',
            quantity: 3
          }
        ]
      }
    ],
    icon: 'fa-bomb'
  },
  {
    id: 'medical-lab',
    name: 'Medical Lab',
    description: 'The Medical Lab is where you can create stimulants to give you that extra boost out in the wilds.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Herbal Bandage',
          'Shield Recharger',
          'Adrenaline Shot',
          'Bandage'
        ],
        materials: [
          {
            item: 'Fabric',
            quantity: 50
          },
          {
            item: 'ARC Alloy',
            quantity: 6
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Sterilized Bandage',
          'Surge Shield Recharger'
        ],
        materials: [
          {
            item: 'Cracked Bioscanner',
            quantity: 2
          },
          {
            item: 'Durable Cloth',
            quantity: 5
          },
          {
            item: 'Tick Pod',
            quantity: 8
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [],
        materials: [
          {
            item: 'Rusted Shut Medical Kit',
            quantity: 3
          },
          {
            item: 'Antiseptic',
            quantity: 8
          },
          {
            item: 'Surveyor Vault',
            quantity: 5
          }
        ]
      }
    ],
    icon: 'fa-briefcase-medical'
  },
  {
    id: 'utility-station',
    name: 'Utility Station',
    description: 'Fabricates traversal tools and support gadgets to help raiders adapt on the fly.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Binoculars',
          "Li'l Smoke Grenade",
          'Door Blocker'
        ],
        materials: [
          {
            item: 'Plastic Parts',
            quantity: 50
          },
          {
            item: 'ARC Alloy',
            quantity: 6
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Raider Hatch Key',
          'Zipline'
        ],
        materials: [
          {
            item: 'Damaged Heat Sink',
            quantity: 2
          },
          {
            item: 'Electrical Components',
            quantity: 5
          },
          {
            item: 'Snitch Scanner',
            quantity: 6
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [
          'Photoelectric Cloak'
        ],
        materials: [
          {
            item: 'Fried Motherboard',
            quantity: 3
          },
          {
            item: 'Advanced Electrical Components',
            quantity: 5
          },
          {
            item: 'Leaper Pulse Unit',
            quantity: 4
          }
        ]
      }
    ],
    icon: 'fa-screwdriver-wrench'
  },
  {
    id: 'refiner',
    name: 'Refiner',
    description: 'Crucial companion for any Raider finding themselves in frequent need of custom parts.',
    levels: [
      {
        level: 1,
        label: 'Level 1',
        crafts: [
          'Electrical Components',
          'Crude Explosives',
          'Mechanical Components'
        ],
        materials: [
          {
            item: 'Metal Parts',
            quantity: 60
          },
          {
            item: 'ARC Powercell',
            quantity: 5
          }
        ]
      },
      {
        level: 2,
        label: 'Level 2',
        crafts: [
          'Advanced Electrical Components',
          'Advanced Mechanical Components',
          'Antiseptic',
          'ARC Circuitry',
          'ARC Motion Core',
          'Heavy Gun Parts',
          'Light Gun Parts',
          'Medium Gun Parts'
        ],
        materials: [
          {
            item: 'Toaster',
            quantity: 3
          },
          {
            item: 'ARC Motion Core',
            quantity: 5
          },
          {
            item: 'Fireball Burner',
            quantity: 8
          }
        ]
      },
      {
        level: 3,
        label: 'Level 3',
        crafts: [
          'Magnetic Accelerator',
          'Mod Components',
          'Power Rod'
        ],
        materials: [
          {
            item: 'Motor',
            quantity: 3
          },
          {
            item: 'ARC Circuitry',
            quantity: 10
          },
          {
            item: 'Bombardier Cell',
            quantity: 6
          }
        ]
      }
    ],
    icon: 'fa-industry'
  },
  {
    id: 'scrappy-the-rooster',
    name: 'Scrappy the Rooster',
    description: 'This rooster has been a resident of the workshop since the day you moved in, and likely long before that. Will periodically bring back dubiously-sourced materials and share them with you.',
    levels: [
      {
        level: 1,
        label: 'Level 1 - Fledgling',
        crafts: [],
        materials: [
          {
            item: 'Early Quest Reward',
            quantity: null
          }
        ],
        functions: [
          'Brings 5x of each basic crafting resource and 1x random uncommon tier item on a round death.',
          'Brings 12x of each basic crafting resource and 3x random uncommon tier items on a round survival.'
        ]
      },
      {
        level: 2,
        label: 'Level 2 - Forager',
        crafts: [],
        materials: [
          {
            item: 'Dog Collar',
            quantity: 1
          }
        ],
        functions: [
          'Brings 6x of each basic crafting resource and 2x random uncommon tier items on a round death.',
          'Brings 13x of each basic crafting resource and 4x random uncommon tier items on a round survival.'
        ]
      },
      {
        level: 3,
        label: 'Level 3 - Savenger',
        crafts: [],
        materials: [
          {
            item: 'Lemon',
            quantity: 5
          },
          {
            item: 'Apricot',
            quantity: 5
          }
        ],
        functions: [
          'Brings 14x of each basic crafting resource and 7x random uncommon tier items on a round survival.'
        ]
      },
      {
        level: 4,
        label: 'Level 4 - Treasure Hunter',
        crafts: [],
        materials: [
          {
            item: 'Prickly Pear',
            quantity: 8
          },
          {
            item: 'Olives',
            quantity: 8
          },
          {
            item: 'Cat Bed',
            quantity: 1
          }
        ],
        functions: []
      },
      {
        level: 5,
        label: 'Level 5 - Master Hoarder',
        crafts: [],
        materials: [
          {
            item: 'Apricots',
            quantity: 12
          },
          {
            item: 'Mushrooms',
            quantity: 12
          },
          {
            item: 'Very Comfortable Pillow',
            quantity: 3
          }
        ],
        functions: []
      }
    ],
    icon: 'fa-crow'
  }
];

  const quests = [
  {
    id: 'picking-up-the-pieces',
    name: 'Picking Up The Pieces',
    trader: 'Shani',
    objectives: [
      'Visit any area on your map with a loot category icon',
      'Loot 3 containers'
    ],
    rewards: [
      '1x Rattler III',
      '80x Medium Ammo'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'clearer-skies',
    name: 'Clearer Skies',
    trader: 'Shani',
    objectives: [
      'Destroy 3 ARC enemies',
      'Get 3 ARC Alloy for Shani'
    ],
    rewards: [
      '3x Sterilized Bandage',
      '1x Light Shield',
      'Black Backpack Cosmetic (Hiker Color)'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'trash-into-treasure',
    name: 'Trash Into Treasure',
    trader: 'Shani',
    objectives: [
      'Obtain 6 Wires',
      'Obtain 1 Battery'
    ],
    rewards: [
      '1x Tactical MK.1',
      '3x Adrenaline Shot'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'off-the-radar',
    name: 'Off The Radar',
    trader: 'Shani',
    objectives: [
      'Visit a field depot',
      'Repair the antenna on the roof of Field Depot'
    ],
    rewards: [
      '2x Defibrillator'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'a-bad-feeling',
    name: 'A Bad Feeling',
    trader: 'Celeste',
    objectives: [
      'Find and search any ARC Probe or ARC Courier'
    ],
    rewards: [
      '10x Metal parts',
      '5x Steel Spring',
      '5x Duct Tape'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-satellite-dish'
  },
  {
    id: 'the-right-tool',
    name: 'The Right Tool',
    trader: 'Tian Wen',
    objectives: [
      'Destroy a Fireball',
      'Destroy a Hornet',
      'Destroy a Turret'
    ],
    rewards: [
      'Cheer Emote',
      '1x Stitcher II',
      '1x Extended Light Mag I'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-chess-rook'
  },
  {
    id: 'hatch-repairs',
    name: 'Hatch Repairs',
    trader: 'Shani',
    objectives: [
      'Repair the leaking hydraulic pipes near a Raider Hatch',
      'Search for a hatch key near the Raider hatch'
    ],
    rewards: [
      '1x Raider Hatch Key',
      '1x Binoculars'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'safe-passage',
    name: 'Safe Passage',
    trader: 'Apollo',
    objectives: [
      'Destroy 2 ARC enemies using any explosive grenade'
    ],
    rewards: [
      "5x Li'l Smoke Grenade",
      '3x Shrapnel Grenade',
      '3x Barricade Kit'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-bolt'
  },
  {
    id: 'down-to-earth',
    name: 'Down To Earth',
    trader: 'Shani',
    objectives: [
      'Visit a Field Depot',
      'Deliver a Field Crate to a Supply Station',
      'Collect the reward'
    ],
    rewards: [
      '1x Combat MK.1',
      '1x Medium Shield'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'the-trifecta',
    name: 'The Trifecta',
    trader: 'Shani',
    objectives: [
      'Destroy a Hornet',
      'Get a Hornet Driver for Shani',
      'Destroy a Snitch',
      'Get a Snitch Scanner for Shani',
      'Destroy a Wasp',
      'Get a Wasp Driver for Shani'
    ],
    rewards: [
      '1x Dam Control Tower Key',
      '2x Defibrillator',
      '1x Raider Hatch Key'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'a-better-use',
    name: 'A Better Use',
    trader: 'Tian Wen',
    objectives: [
      'Request in a Supply Drop from a Call Station',
      'Loot a Supply Drop'
    ],
    rewards: [
      '1x Extended Light Mag I',
      '1x Stable Stock I',
      '1x Muzzle Brake II'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City',
      'Blue Gate'
    ],
    icon: 'fa-chess-rook'
  },
  {
    id: 'what-goes-around',
    name: 'What Goes Around',
    trader: 'Apollo',
    objectives: [
      'Destroy any ARC enemy using a Fireball Burner'
    ],
    rewards: [
      '3x Blaze Grenade',
      '2x Noisemaker',
      'Cans Backpack Attachment (Cosmetic)'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City',
      'Blue Gate'
    ],
    icon: 'fa-bolt'
  },
  {
    id: 'sparks-fly',
    name: 'Sparks Fly',
    trader: 'Apollo',
    objectives: [
      "Destroy a Hornet with a Trigger 'Nade or Snap Blast"
    ],
    rewards: [
      '1x Trigger Nade Blueprint',
      '4x Crude Explosives',
      '2x Processor'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City',
      'Blue Gate'
    ],
    icon: 'fa-bolt'
  },
  {
    id: 'greasing-her-palms',
    name: 'Greasing Her Palms',
    trader: 'Celeste',
    objectives: [
      'On Dam Battlegrounds, visit the Locked Room in the Water Treatment Control building',
      'On Spaceport, scope out the rocket thrusters outside the Rocket Assembly',
      'On Buried City, visit the barricaded area on floor 6 of the Space Travel Building'
    ],
    rewards: [
      '1x Lure Grenade Blueprint',
      '3x Speaker Component',
      '3x Electrical Components'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-satellite-dish'
  },
  {
    id: 'a-first-foothold',
    name: 'A First Foothold',
    trader: 'Apollo',
    objectives: [
      'Stabilize the observation deck near the Ridgeline',
      'Enable the comms terminal near the Olive Grove',
      'Rotate the satellite dishes on the church roof, north of the Data Vault',
      "Nail down the roof plates on the Raider structure near Trapper's Glade"
    ],
    rewards: [
      '3x Shrapnel Grenade',
      '3x Snap Blast Grenade',
      '3x Heavy Fuze Grenade'
    ],
    maps: [
      'Blue Gate'
    ],
    icon: 'fa-bolt'
  },
  {
    id: 'dormant-barons',
    name: 'Dormant Barons',
    trader: 'Shani',
    objectives: [
      'Loot a Baron husk'
    ],
    rewards: [
      '3x  Door Blocker',
      "3x Li'l Smoke Grenade"
    ],
    maps: [
      'Multiple'
    ],
    icon: 'fa-compass'
  },
  {
    id: 'mixed-signals',
    name: 'Mixed Signals',
    trader: 'Tian Wen',
    objectives: [
      'Destroy an ARC Surveyor',
      'Obtain 1 Surveyor Vault'
    ],
    rewards: [
      '1x Photoelectric Cloak',
      '1x Raider Hatch Key'
    ],
    maps: [
      'Multiple'
    ],
    icon: 'fa-chess-rook'
  },
  {
    id: 'doctor-s-orders',
    name: "Doctor's Orders",
    trader: 'Lance',
    objectives: [
      'Obtain 2 Antiseptic',
      'Obtain 1 Syringe',
      'Obtain 1 Durable Cloth',
      'Obtain 1 Great Mullein'
    ],
    rewards: [
      '3x Adrenaline Shot',
      '3x Sterilized Bandage',
      '1x Surge Shield Recharger'
    ],
    maps: [
      'Multiple'
    ],
    icon: 'fa-kit-medical'
  },
  {
    id: 'medical-merchandise',
    name: 'Medical Merchandise',
    trader: 'Lance',
    objectives: [
      "On Spaceport, search 2 containers in the Departure Building's exam rooms",
      'Search 3 containers in the Hospital in Buried City',
      "On Dam Battlegrounds, search 2 containers in the Research & Administration building's medical room"
    ],
    rewards: [
      '1x Banana Backpack Charm (Cosmetic)',
      '3x Defibrillator',
      '2x Vita Shot'
    ],
    maps: [
      'Dam Battlegrounds',
      'Spaceport',
      'Buried City'
    ],
    icon: 'fa-kit-medical'
  },
  {
    id: 'a-reveal-in-ruins',
    name: 'A Reveal in Ruins',
    trader: 'Lance',
    objectives: [
      'Search for an ESR Analyzer inside any pharmacy in Buried City',
      'Deliver the ESR Analyzer to Lance'
    ],
    rewards: [
      '1x Tactical Mk. 3 (Healing)',
      '1x Surge Shield Recharger'
    ],
    maps: [
      'Buried City'
    ],
    icon: 'fa-kit-medical'
  },
  {
    id: 'broken-monument',
    name: 'Broken Monument',
    trader: 'Tian Wen',
    objectives: [
      'Reach the hallowed grounds by the Scrap Yard',
      'Search for a compass near the broken-down vehicles',
      'Search for the video tape near the cylindrical containers',
      'Search for the old field rations in the Raider camp',
      'Deliver the First Wave Tape to Tian Wen',
      'Deliver First Wave Compass to Tian Wen',
      'Deliver First Wave Rations to Tian Wen'
    ],
    rewards: [
      '1x Arpeggio I',
      '1x Compensator II',
      '80x Medium Ammo'
    ],
    maps: [
      'Multiple'
    ],
    icon: 'fa-chess-rook'
  },
  {
    id: 'marked-for-death',
    name: 'Marked for Death',
    trader: 'Tian Wen',
    objectives: [
      'Reach the Su Durante Warehouses in the Outskirts in Buried City'
    ],
    rewards: [
      '1x Shotgun Choke II',
      '1x Angled Grip II'
    ],
    maps: [
      'Buried City'
    ],
    icon: 'fa-chess-rook'
  },
  {
    id: 'straight-record',
    name: 'Straight Record',
    trader: 'Celeste',
    objectives: [
      'Reach Victory Ridge',
      'Find the old EMP trap',
      'Disable the first power switch',
      'Disable the second power switch',
      'Disable the third power switch',
      'Shutdown the EMP trap'
    ],
    rewards: [
      '5x Medium Gun Parts',
      '3x Advanced Mechanical Components'
    ],
    maps: [
      'Dam Battlegrounds'
    ],
    icon: 'fa-satellite-dish'
  },
  {
    id: 'a-lay-of-the-land',
    name: 'A Lay of the Land',
    trader: 'Shani',
    objectives: [
      'Reach the Jiangsu Warehouse',
      "Find the shipping notes in the foreman's office",
      'Locate the scanners on the upper floor of Control Tower A6',
      'Deliver 1 LiDAR Scanners to Shani'
    ],
    rewards: [
      '1x Dam Testing Annex Key',
      '3x Zipline',
      '2x Smoke Grenade'
    ],
    maps: [
      'Spaceport'
    ],
    icon: 'fa-compass'
  }
];

  const skillPhases = [
  {
    id: 'conditioning',
    name: 'Conditioning',
    icon: 'fa-dumbbell',
    skills: [
      {
        id: 'used-to-the-weight',
        name: 'Used To The Weight',
        description: "Wearing a shield doesn't slow you down as much.",
        affected: 'Movement Speed',
        values: null,
        cost: 5,
        prerequisites: 'None',
        type: 'Conditioning'
      },
      {
        id: 'blast-born',
        name: 'Blast-Born',
        description: 'Your hearing is less affected by nearby explosions.',
        affected: 'Hearing Enhancement',
        values: null,
        cost: 5,
        prerequisites: 'Used To The Weight',
        type: 'Conditioning'
      },
      {
        id: 'gentle-pressure',
        name: 'Gentle Pressure',
        description: 'You make less noise when breaching.',
        affected: 'Noise Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Used To The Weight',
        type: 'Conditioning'
      },
      {
        id: 'fight-or-flight',
        name: 'Fight Or Flight',
        description: "When you're hurt in combat, regain a fixed amount of stamina. Has cooldown between uses.",
        affected: 'Stamina Regeneration',
        values: null,
        cost: 5,
        prerequisites: 'Blast-Born',
        type: 'Conditioning'
      },
      {
        id: 'proficient-pryer',
        name: 'Proficient Pryer',
        description: 'Breaching doors and containers takes less time',
        affected: 'Breach Time Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Gentle Pressure',
        type: 'Conditioning'
      },
      {
        id: 'survivor-s-stamina',
        name: "Survivor's Stamina",
        description: "When you're critically hurt, your stamina regenerates faster.",
        affected: 'Stamina Regeneration',
        values: null,
        cost: 1,
        prerequisites: 'Fight or Flight, 15 Points in Conditioning',
        type: 'Conditioning'
      },
      {
        id: 'unburdened-roll',
        name: 'Unburdened Roll',
        description: 'If your shield breaks, your first Dodge Roll within a few seconds does not cost stamina.',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 1,
        prerequisites: 'Proficient Pryer, 15 Points in Conditioning',
        type: 'Conditioning'
      },
      {
        id: 'downed-but-determined',
        name: 'Downed But Determined',
        description: "When you're downed, it takes longer before you collapse.",
        affected: 'Max Downtime',
        values: null,
        cost: 5,
        prerequisites: "Survivor's Stamina",
        type: 'Conditioning'
      },
      {
        id: 'a-little-extra',
        name: 'A Little Extra',
        description: 'Breaching an object generates resources.',
        affected: 'Loot Find Chance',
        values: null,
        cost: 1,
        prerequisites: "Survivor's Stamina, Unburdened Roll",
        type: 'Conditioning'
      },
      {
        id: 'effortless-swing',
        name: 'Effortless Swing',
        description: 'Melee abilities cost less stamina',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Unburdened Roll',
        type: 'Conditioning'
      },
      {
        id: 'turtle-crawl',
        name: 'Turtle Crawl',
        description: 'While downed, you take less damage.',
        affected: 'Downtime Damage Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Downed But Determined',
        type: 'Conditioning'
      },
      {
        id: 'loaded-arms',
        name: 'Loaded Arms',
        description: 'Your equipped weapon has less impact on your encumbrance.',
        affected: 'Encumbrance Reduction',
        values: null,
        cost: 1,
        prerequisites: 'A Little Extra',
        type: 'Conditioning'
      },
      {
        id: 'sky-clearing-swing',
        name: 'Sky-Clearing Swing',
        description: 'You deal more melee damage to drones.',
        affected: 'Melee Damage',
        values: null,
        cost: 5,
        prerequisites: 'Effortless Swing',
        type: 'Conditioning'
      },
      {
        id: 'back-on-your-feet',
        name: 'Back On Your Feet',
        description: "When you're critically hurt, your health regenerates until a certain limit.",
        affected: 'Health Regeneration',
        values: null,
        cost: 1,
        prerequisites: 'Turtle Crawl, Loaded Arms, 36 Points in Conditioning',
        type: 'Conditioning'
      }
    ]
  },
  {
    id: 'mobility',
    name: 'Mobility',
    icon: 'fa-person-running',
    skills: [
      {
        id: 'nimble-climber',
        name: 'Nimble Climber',
        description: 'You can climb and vault more quickly.',
        affected: 'Climb and Vault Speed',
        values: null,
        cost: 5,
        prerequisites: 'None',
        type: 'Mobility'
      },
      {
        id: 'marathon-runner',
        name: 'Marathon Runner',
        description: 'Moving around costs less stamina.',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Nimble Climber',
        type: 'Mobility'
      },
      {
        id: 'slip-and-slide',
        name: 'Slip and Slide',
        description: 'You can slide further and faster',
        affected: 'Movement Speed',
        values: null,
        cost: 5,
        prerequisites: 'Nimble Climber',
        type: 'Mobility'
      },
      {
        id: 'youthful-lungs',
        name: 'Youthful Lungs',
        description: 'Increase your max stamina.',
        affected: 'Max Stamina',
        values: null,
        cost: 5,
        prerequisites: 'Marathon Runner',
        type: 'Mobility'
      },
      {
        id: 'sturdy-ankles',
        name: 'Sturdy Ankles',
        description: 'You take less fall damage when falling from a non-lethal height.',
        affected: 'Fall Damage Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Slip and Slide',
        type: 'Mobility'
      },
      {
        id: 'carry-the-momentum',
        name: 'Carry The Momentum',
        description: 'After a Sprint Dodge Roll, sprinting does not consume stamina for a short time. Has a cooldown between uses.',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 1,
        prerequisites: 'Youthful Lungs, 15 Points in Mobility',
        type: 'Mobility'
      },
      {
        id: 'calming-stroll',
        name: 'Calming Stroll',
        description: 'While walking, your stamina regenerates as if you were standing still.',
        affected: 'Stamina Regeneration',
        values: null,
        cost: 1,
        prerequisites: 'Sturdy Ankles, 15 Points in Mobility',
        type: 'Mobility'
      },
      {
        id: 'effortless-roll',
        name: 'Effortless Roll',
        description: 'Dodge Rolls cost less stamina.',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 5,
        prerequisites: 'Carry The Momentum',
        type: 'Mobility'
      },
      {
        id: 'crawl-before-you-walk',
        name: 'Crawl Before You Walk',
        description: "When you're downed, you crawl faster.",
        affected: 'Movement Speed',
        values: null,
        cost: 5,
        prerequisites: 'Carry The Momentum, Calming Stroll',
        type: 'Mobility'
      },
      {
        id: 'off-the-wall',
        name: 'Off The Wall',
        description: 'You can Wall Leap further.',
        affected: 'Wall Leap Distance',
        values: null,
        cost: 5,
        prerequisites: 'Calming Stroll',
        type: 'Mobility'
      },
      {
        id: 'heroic-leap',
        name: 'Heroic Leap',
        description: 'You can Sprint Dodge Roll Further.',
        affected: 'Sprint Dodge Distance',
        values: null,
        cost: 5,
        prerequisites: 'Effortless Roll',
        type: 'Mobility'
      },
      {
        id: 'vigorous-vaulter',
        name: 'Vigorous Vaulter',
        description: 'Vaulting is no longer slowed down while exhausted.',
        affected: 'Climb and Vault Speed',
        values: null,
        cost: 1,
        prerequisites: 'Crawl Before You Walk',
        type: 'Mobility'
      },
      {
        id: 'ready-to-roll',
        name: 'Ready To Roll',
        description: 'When falling, your timing window to perform a Recovery Roll is increased.',
        affected: 'Recover Roll Window',
        values: null,
        cost: 5,
        prerequisites: 'Off The Wall',
        type: 'Mobility'
      },
      {
        id: 'vaults-on-vaults-on-vaults',
        name: 'Vaults on Vaults on Vaults',
        description: 'Vaulting no longer costs stamina.',
        affected: 'Stamina Cost Reduction',
        values: null,
        cost: 1,
        prerequisites: 'Heroic Leap, Vigorous Vaulter, 36 Points in Mobility',
        type: 'Mobility'
      },
      {
        id: 'vault-spring',
        name: 'Vault Spring',
        description: 'Lets you jump at the end of a vault.',
        affected: 'Vault Jump',
        values: null,
        cost: 1,
        prerequisites: 'Vigorous Vaulter, Ready to Roll, 36 Points in Mobility',
        type: 'Mobility'
      }
    ]
  },
  {
    id: 'survival',
    name: 'Survival',
    icon: 'fa-shield-heart',
    skills: [
      {
        id: 'agile-croucher',
        name: 'Agile Croucher',
        description: 'Your movement speed while crouching is increased.',
        affected: 'Movement Speed',
        values: null,
        cost: 5,
        prerequisites: 'None',
        type: 'Survival'
      },
      {
        id: 'looter-s-instincts',
        name: "Looter's Instincts",
        description: 'When searching a container, loot is revealed faster',
        affected: 'Loot Speed',
        values: null,
        cost: 5,
        prerequisites: 'Agile Croucher',
        type: 'Survival'
      },
      {
        id: 'revitalizing-squat',
        name: 'Revitalizing Squat',
        description: 'Stamina regeneration while crouched is increased.',
        affected: 'Stamina Regeneration',
        values: null,
        cost: 5,
        prerequisites: 'Agile Croucher',
        type: 'Survival'
      },
      {
        id: 'silent-scavenger',
        name: 'Silent Scavenger',
        description: 'You make less noise when looting.',
        affected: 'Noise Reduction',
        values: null,
        cost: 5,
        prerequisites: "Looter's Instincts",
        type: 'Survival'
      },
      {
        id: 'in-round-crafting',
        name: 'In-round Crafting',
        description: 'Unlocks the ability to field-craft items while topside.',
        affected: 'Field Crafting',
        values: null,
        cost: 1,
        prerequisites: 'Revitalizing Squat',
        type: 'Survival'
      },
      {
        id: 'suffer-in-silence',
        name: 'Suffer In Silence',
        description: 'While critically hurt, your movement makes less noise.',
        affected: 'Noise Reduction',
        values: null,
        cost: 1,
        prerequisites: 'Silent Scavenger, 15 Points in Survival',
        type: 'Survival'
      },
      {
        id: 'good-as-new',
        name: 'Good As New',
        description: 'While under a healing effect, stamina regeneration is increased.',
        affected: 'Stamina Regeneration',
        values: null,
        cost: 1,
        prerequisites: 'In-round Crafting, 15 Points in Survival',
        type: 'Survival'
      },
      {
        id: 'broad-shoulders',
        name: 'Broad Shoulders',
        description: 'Increases the maximum weight you can carry.',
        affected: 'Max Encumbrance',
        values: null,
        cost: 5,
        prerequisites: 'Suffer In Silence',
        type: 'Survival'
      },
      {
        id: 'traveling-tinkerer',
        name: 'Traveling Tinkerer',
        description: 'Unlocks additional items to field craft.',
        affected: 'Field Crafting',
        values: null,
        cost: 1,
        prerequisites: 'Suffer In Silence, Good as New',
        type: 'Survival'
      },
      {
        id: 'stubborn-mule',
        name: 'Stubborn Mule',
        description: 'Your stamina regeneration is less affected by being over-encumbered.',
        affected: 'Stamina Regeneration',
        values: null,
        cost: 5,
        prerequisites: 'Good as New',
        type: 'Survival'
      },
      {
        id: 'looter-s-luck',
        name: "Looter's Luck",
        description: "While looting, there's a chance to reveal twice as many items at once",
        affected: 'Loot Speed',
        values: null,
        cost: 5,
        prerequisites: 'Broad Shoulders',
        type: 'Survival'
      },
      {
        id: 'one-raider-s-scraps',
        name: "One Raider's Scraps",
        description: 'When looting Raider containers, you have a small chance of finding additional field-crafted items.',
        affected: 'Loot Find Chance',
        values: null,
        cost: 5,
        prerequisites: 'Traveling Tinkerer',
        type: 'Survival'
      },
      {
        id: 'three-deep-breaths',
        name: 'Three Deep Breaths',
        description: 'After an ability drains your stamina, you recover more quickly.',
        affected: 'Stamina Regeneration',
        values: null,
        cost: 5,
        prerequisites: 'Stubborn Mule',
        type: 'Survival'
      },
      {
        id: 'security-breach',
        name: 'Security Breach',
        description: 'Lets you breach Security Lockers.',
        affected: 'Loot Option',
        values: null,
        cost: 1,
        prerequisites: "Looter's Luck, One Raider's Scraps, 36 Points in Survival",
        type: 'Survival'
      },
      {
        id: 'minesweeper',
        name: 'Minesweeper',
        description: 'Mines and explosive deployables can be defused when in close proximity',
        affected: 'Explosive Defuse',
        values: null,
        cost: 1,
        prerequisites: "On Raider's Scraps, Three Deep Breaths, 36 Points in Survival.",
        type: 'Survival'
      }
    ]
  }
];

  const traderMeta = {
    Shani: {
      icon: 'fa-compass',
      color: '#f4a261'
    },
    Celeste: {
      icon: 'fa-satellite-dish',
      color: '#6d597a'
    },
    Tian Wen: {
      icon: 'fa-chess-rook',
      color: '#2ec4b6'
    },
    Apollo: {
      icon: 'fa-bolt',
      color: '#ff6b6b'
    },
    Lance: {
      icon: 'fa-kit-medical',
      color: '#3a86ff'
    }
  };

  return { workshopStations, quests, skillPhases, traderMeta };
})();

// Shared helper utilities used across modules for repetitive tasks.
const Utils = (() => {
  const formatKey = (...parts) => parts.join(':').toLowerCase().replace(/\s+/g, '-');

  const createElement = (tag, options = {}) => {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.text) element.textContent = options.text;
    if (options.html) element.innerHTML = options.html;
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) element.setAttribute(key, value);
      });
    }
    return element;
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const sum = (values) => values.reduce((total, current) => total + current, 0);

  return { formatKey, createElement, clamp, sum };
})();

// Simple notification system for contextual feedback (e.g. completion events).
const Notifier = (() => {
  const container = document.querySelector('.notifications');
  const push = (message, timeout = 4000) => {
    if (!container) return;
    const notification = Utils.createElement('div', {
      className: 'notification',
      text: message
    });
    container.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('fade-out');
      notification.addEventListener('transitionend', () => notification.remove(), {
        once: true
      });
    }, timeout);
  };
  return { push };
})();

// Controls theme toggling and persistence between light and dark modes.
const ThemeController = (() => {
  const toggleButton = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const STORAGE_KEY = 'theme';

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    toggleButton.innerHTML =
      theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    toggleButton.setAttribute('aria-pressed', theme === 'dark');
  };

  const init = () => {
    const saved = StorageManager.get(STORAGE_KEY, 'light');
    applyTheme(saved);
    toggleButton.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      StorageManager.set(STORAGE_KEY, next);
    });
  };

  return { init };
})();

// Handles switching between the SPA views while keeping ARIA attributes in sync.
const NavigationController = (() => {
  const navButtons = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('.view'));

  const showSection = (targetId) => {
    sections.forEach((section) => {
      const isActive = section.id === targetId;
      section.classList.toggle('active', isActive);
      const navButton = navButtons.find((button) => button.dataset.target === section.id);
      if (navButton) {
        navButton.classList.toggle('active', isActive);
        navButton.setAttribute('aria-expanded', String(isActive));
      }
    });
  };

  const init = () => {
    navButtons.forEach((button) => {
      button.addEventListener('click', () => showSection(button.dataset.target));
    });
  };

  return { init };
})();

// WorkshopView renders upgrade tracking cards and synchronises material inputs.
const WorkshopView = (() => {
  const container = document.getElementById('workshop-grid');

  const renderLevelHeader = (station, level) => {
    const row = Utils.createElement('tr', { className: 'level-header' });
    const crafts = (level.crafts ?? []).map((craft) => `<span class="craft-chip">${craft}</span>`).join('');
    const functions = (level.functions ?? []).map((fn) => `<li>${fn}</li>`).join('');
    row.innerHTML = `
      <td colspan="6">
        <div class="level-summary">
          <div class="level-title">
            <span class="level-badge">Lv.${level.level}</span>
            <strong>${level.label ?? `Level ${level.level}`}</strong>
          </div>
          ${crafts ? `<div class="craft-list">${crafts}</div>` : ''}
          ${functions ? `<ul class="function-list">${functions}</ul>` : ''}
        </div>
      </td>
    `;
    return row;
  };

  const renderMaterialRow = (station, level, material) => {
    const levelId = Utils.formatKey(station.id, `lv${level.level}`);
    const trackable = Number.isFinite(material.quantity);
    const row = Utils.createElement('tr', { className: `material-row${trackable ? '' : ' info-row'}`.trim() });
    row.dataset.levelId = levelId;
    const key = Utils.formatKey('workshop', station.id, level.level, material.item);
    const max = trackable ? material.quantity : 0;
    const stored = trackable ? StorageManager.get(key, 0) : 0;
    const have = trackable ? Utils.clamp(Number(stored) || 0, 0, max) : 0;
    const remaining = trackable ? max - have : '&mdash;';
    const progress = trackable && max ? (have / max) * 100 : 0;
    const quantityLabel = trackable ? max : '&mdash;';
    const inputField = trackable
      ? `<input type="number" min="0" max="${max}" step="1" value="${have}" class="material-input" data-storage-key="${key}" />`
      : '<span class="material-note">Info</span>';

    row.innerHTML = `
      <td>Lv.${level.level}</td>
      <td>${material.item}</td>
      <td>${quantityLabel}</td>
      <td>${inputField}</td>
      <td class="remaining">${remaining}</td>
      <td>
        <div class="material-progress"><span style="width: ${progress}%"></span></div>
      </td>
    `;

    if (!trackable) {
      row.classList.add('material-static');
    }

    return row;
  };

  const renderLevelFooter = (station, level) => {
    const footerRow = Utils.createElement('tr');
    footerRow.classList.add('level-footer');
    const levelId = Utils.formatKey(station.id, `lv${level.level}`);
    const label = level.label ?? `Lv.${level.level}`;
    footerRow.dataset.levelFooter = levelId;
    footerRow.dataset.levelNumber = level.level;
    const trackable = (level.materials ?? []).filter((material) => Number.isFinite(material.quantity));
    const remaining = trackable.reduce((sum, material) => {
      const key = Utils.formatKey('workshop', station.id, level.level, material.item);
      const have = StorageManager.get(key, 0) || 0;
      const max = material.quantity ?? 0;
      return sum + (max - Math.min(have, max));
    }, 0);
    footerRow.innerHTML = trackable.length
      ? `<td colspan="6">Remaining materials for ${label}: <strong class="level-remaining">${remaining}</strong></td>`
      : `<td colspan="6" class="level-remaining-message">No materials to track for ${label}.</td>`;
    footerRow.dataset.complete = String(trackable.length === 0 || remaining === 0);
    return footerRow;
  };

  const renderStation = (station) => {
    const card = Utils.createElement('article', {
      className: 'card workshop-card open',
      attrs: {
        'data-station-id': station.id,
        'data-station-name': station.name
      }
    });
    card.innerHTML = `
      <div class="card-header" role="button" tabindex="0" aria-expanded="true">
        <h3><i class="fa-solid ${station.icon}"></i> ${station.name}</h3>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </div>
      <div class="card-body"></div>
    `;

    const body = card.querySelector('.card-body');
    if (station.description) {
      body.appendChild(
        Utils.createElement('p', { className: 'station-description', text: station.description })
      );
    }

    const table = Utils.createElement('table', { className: 'material-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>Level</th>
          <th>Material</th>
          <th>Required</th>
          <th>Have</th>
          <th>Remaining</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    station.levels.forEach((level) => {
      tbody.appendChild(renderLevelHeader(station, level));

      if (level.materials.length) {
        level.materials.forEach((material) => {
          tbody.appendChild(renderMaterialRow(station, level, material));
        });
      } else {
        const emptyRow = Utils.createElement('tr', { className: 'material-empty' });
        emptyRow.dataset.levelId = Utils.formatKey(station.id, `lv${level.level}`);
        const label = level.label ?? `Lv.${level.level}`;
        emptyRow.innerHTML = `<td colspan="6" class="no-materials">No materials required for ${label}.</td>`;
        tbody.appendChild(emptyRow);
      }

      tbody.appendChild(renderLevelFooter(station, level));
    });

    body.appendChild(table);

    const header = card.querySelector('.card-header');
    const toggle = () => {
      const isOpen = card.classList.toggle('open');
      header.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen) {
        card.classList.remove('open');
      }
      card.classList.toggle('collapsed', !isOpen);
      body.style.maxHeight = isOpen ? `${body.scrollHeight + 24}px` : '0';
      body.style.paddingTop = isOpen ? 'var(--space-sm)' : '0';
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    return card;
  };

  const updateMaterial = (input) => {
    const { storageKey } = input.dataset;
    const max = Number(input.max);
    const value = Utils.clamp(Number(input.value) || 0, 0, max);
    input.value = value;
    StorageManager.set(storageKey, value);

    const row = input.closest('tr');
    const remainingCell = row.querySelector('.remaining');
    remainingCell.textContent = max - value;
    const progressBar = row.querySelector('.material-progress span');
    const percentage = max ? (value / max) * 100 : 0;
    progressBar.style.width = `${percentage}%`;

    const levelId = row.dataset.levelId;
    const tbody = row.parentElement;
    const footer = tbody.querySelector(`tr[data-level-footer="${levelId}"]`);
    if (footer) {
      const materialRows = Array.from(tbody.querySelectorAll(`tr[data-level-id="${levelId}"].material-row`));
      const totalRemaining = materialRows.reduce((sum, materialRow) => {
        const remain = Number(materialRow.querySelector('.remaining')?.textContent ?? 0);
        return sum + remain;
      }, 0);
      const wasComplete = footer.dataset.complete === 'true';
      const remainingDisplay = footer.querySelector('.level-remaining');
      if (remainingDisplay) {
        remainingDisplay.textContent = totalRemaining;
      }
      footer.dataset.complete = String(totalRemaining === 0 || materialRows.length === 0);
      if (totalRemaining === 0 && materialRows.length > 0 && !wasComplete) {
        const stationName = footer.closest('.card').dataset.stationName;
        const levelNumber = footer.dataset.levelNumber;
        Notifier.push(`${stationName} Level ${levelNumber} complete!`);
      }
    }
  };

  const bindInputs = (card) => {
    card.querySelectorAll('input[data-storage-key]').forEach((input) => {
      input.addEventListener('input', () => updateMaterial(input));
    });
  };

  const init = () => {
    container.innerHTML = '';
    DataRepository.workshopStations.forEach((station) => {
      const card = renderStation(station);
      container.appendChild(card);
      bindInputs(card);
      const body = card.querySelector('.card-body');
      body.style.maxHeight = `${body.scrollHeight + 24}px`;
    });
  };

  return { init };
})();

// QuestView manages quest rendering, filtering, persistence and completion logic.
const QuestView = (() => {
  const container = document.getElementById('quest-grid');
  const searchInput = document.getElementById('quest-search');
  const traderFilter = document.getElementById('quest-trader-filter');
  const incompleteOnlyToggle = document.getElementById('quest-incomplete-only');
  const traderMeta = DataRepository.traderMeta ?? {};
  const FILTER_KEY = 'quest:filters';
  let activeFilters = StorageManager.get(FILTER_KEY, {
    search: '',
    trader: 'all',
    incompleteOnly: false
  });

  const buildObjectiveKey = (questId, index) => Utils.formatKey('quest', questId, index);

  const computeQuestProgress = (quest) => {
    const completedCount = quest.objectives.reduce((total, _objective, index) => {
      const key = buildObjectiveKey(quest.id, index);
      return total + (StorageManager.get(key, false) ? 1 : 0);
    }, 0);
    return Math.round((completedCount / quest.objectives.length) * 100);
  };

  const renderQuestCard = (quest) => {
    const card = Utils.createElement('article', {
      className: 'card quest-card open',
      attrs: {
        'data-trader': quest.trader,
        'data-quest-id': quest.id
      }
    });
    const progress = computeQuestProgress(quest);
    const traderDetails = traderMeta[quest.trader] ?? { icon: 'fa-user', color: 'var(--color-accent)' };
    const mapChips = quest.maps
      .map((location) => `<span class="map-chip">${location}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-header" role="button" tabindex="0" aria-expanded="true" style="--trader-accent: ${traderDetails.color}">
        <h3><i class="fa-solid ${quest.icon}"></i> ${quest.name}</h3>
        <div class="quest-meta">
          <span class="trader-badge"><i class="fa-solid ${traderDetails.icon}"></i> ${quest.trader}</span>
          <span>${progress}%</span>
        </div>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </div>
      <div class="card-body"></div>
    `;
    const body = card.querySelector('.card-body');
    const list = Utils.createElement('div', { className: 'quest-objectives' });

    quest.objectives.forEach((objective, index) => {
      const key = buildObjectiveKey(quest.id, index);
      const isComplete = StorageManager.get(key, false);
      const row = Utils.createElement('label', { className: 'quest-objective' });
      row.innerHTML = `
        <input type="checkbox" ${isComplete ? 'checked' : ''} data-storage-key="${key}" />
        <span>${objective}</span>
      `;
      list.appendChild(row);
    });

    const progressBar = Utils.createElement('div', { className: 'progress-bar' });
    progressBar.innerHTML = `<span style="width: ${progress}%"></span>`;

    const maps = Utils.createElement('div', {
      className: 'quest-maps',
      html: `<i class="fa-solid fa-map-location-dot"></i> ${mapChips || '<span class="map-chip">Any</span>'}`
    });

    const rewards = Utils.createElement('p', {
      className: 'quest-rewards',
      html: `<i class="fa-solid fa-gift"></i> Rewards: ${quest.rewards.join(', ')}`
    });

    body.append(list, progressBar, maps, rewards);

    const header = card.querySelector('.card-header');
    const toggle = () => {
      const isOpen = card.classList.toggle('open');
      header.setAttribute('aria-expanded', String(isOpen));
      card.classList.toggle('collapsed', !isOpen);
      body.style.maxHeight = isOpen ? `${body.scrollHeight + 16}px` : '0';
      body.style.paddingTop = isOpen ? 'var(--space-sm)' : '0';
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    updateQuestCompletionState(card, progress);
    return card;
  };

  const updateQuestCompletionState = (card, progress) => {
    const wasComplete = card.classList.contains('complete');
    card.classList.toggle('complete', progress === 100);
    const meta = card.querySelector('.quest-meta span:last-child');
    if (meta) meta.textContent = `${progress}%`;
    const progressBar = card.querySelector('.progress-bar span');
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progress === 100 && !wasComplete) {
      const questName = card.querySelector('h3').textContent.replace(/\s{2,}/g, ' ').trim();
      Notifier.push(`${questName} complete!`);
    }
  };

  const applyFilters = (filters = activeFilters) => {
    const nextFilters = {
      search: filters.search || '',
      trader: filters.trader || 'all',
      incompleteOnly: Boolean(filters.incompleteOnly)
    };

    const traderExists = Array.from(traderFilter.options).some(
      (option) => option.value === nextFilters.trader
    );
    if (!traderExists) {
      nextFilters.trader = 'all';
    }

    activeFilters = nextFilters;

    const searchTerm = nextFilters.search.toLowerCase();

    searchInput.value = nextFilters.search;
    traderFilter.value = nextFilters.trader;
    incompleteOnlyToggle.checked = nextFilters.incompleteOnly;

    const cards = Array.from(container.children);
    cards.forEach((card) => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const traderName = card.dataset.trader;
      const progressBar = card.querySelector('.progress-bar span');
      const progress = parseInt(progressBar.style.width, 10);
      const matchesSearch = !searchTerm || title.includes(searchTerm);
      const matchesTrader = activeFilters.trader === 'all' || traderName === activeFilters.trader;
      const matchesCompletion = !activeFilters.incompleteOnly || progress < 100;
      card.style.display = matchesSearch && matchesTrader && matchesCompletion ? 'flex' : 'none';
    });
  };

  const handleObjectiveChange = (checkbox) => {
    const key = checkbox.dataset.storageKey;
    const value = checkbox.checked;
    StorageManager.set(key, value);
    const card = checkbox.closest('.quest-card');
    const questId = card.dataset.questId;
    const quest = DataRepository.quests.find((item) => item.id === questId);
    if (!quest) return;
    const progress = computeQuestProgress(quest);
    updateQuestCompletionState(card, progress);
    applyFilters(activeFilters);
  };

  const bindInteractions = () => {
    container.querySelectorAll('input[data-storage-key]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => handleObjectiveChange(checkbox));
    });

    const persistFilters = () => {
      const state = {
        search: searchInput.value,
        trader: traderFilter.value,
        incompleteOnly: incompleteOnlyToggle.checked
      };
      applyFilters(state);
      StorageManager.set(FILTER_KEY, state, { debounce: 0 });
    };

    searchInput.addEventListener('input', persistFilters);
    traderFilter.addEventListener('change', persistFilters);
    incompleteOnlyToggle.addEventListener('change', persistFilters);
  };

  const populateTraderFilter = () => {
    while (traderFilter.options.length > 1) {
      traderFilter.remove(1);
    }
    const traders = new Set(DataRepository.quests.map((quest) => quest.trader));
    traders.forEach((trader) => {
      const option = Utils.createElement('option', { text: trader, attrs: { value: trader } });
      traderFilter.appendChild(option);
    });
  };

  const init = () => {
    container.innerHTML = '';
    DataRepository.quests.forEach((quest) => {
      const card = renderQuestCard(quest);
      container.appendChild(card);
      const body = card.querySelector('.card-body');
      body.style.maxHeight = `${body.scrollHeight + 16}px`;
    });
    populateTraderFilter();
    bindInteractions();
    activeFilters = StorageManager.get(FILTER_KEY, activeFilters);
    applyFilters(activeFilters);
  };

  return { init };
})();

// SkillView presents the skill planner, tooltip interactions and point tracking.
const SkillView = (() => {
  const container = document.getElementById('skill-phases');
  const totalDisplay = document.getElementById('skill-points-total');
  const MAX_POINTS = 75;
  const STORAGE_KEY = 'skills:selected';
  const TOOLTIP_DELAY = 150;
  const activeTooltips = new Map();
  let overPointCap = false;

  const getSelected = () => StorageManager.get(STORAGE_KEY, {});

  const setSelected = (value) => StorageManager.set(STORAGE_KEY, value);

  const renderSkill = (skill, phaseId) => {
    const selected = getSelected();
    const isChecked = Boolean(selected[skill.id]);
    const item = Utils.createElement('div', {
      className: `skill-item ${isChecked ? 'completed' : ''}`,
      attrs: {
        'data-type': skill.type
      }
    });
    item.innerHTML = `
      <div class="skill-header">
        <h4>${skill.name}</h4>
        <div class="skill-actions">
          <button class="icon-button info" type="button" aria-label="Skill info" data-skill-id="${skill.id}">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <label>
            <span class="sr-only">Mark ${skill.name} acquired</span>
            <input type="checkbox" ${isChecked ? 'checked' : ''} data-skill-id="${skill.id}" data-phase-id="${phaseId}" />
          </label>
        </div>
      </div>
      <div class="skill-meta">
        <span><i class="fa-solid fa-star"></i> Cost: ${skill.cost}</span>
        <span><i class="fa-solid fa-diagram-project"></i> ${skill.type}</span>
        <span><i class="fa-solid fa-bullseye"></i> ${skill.affected}</span>
      </div>
      <div class="skill-prerequisites"><i class="fa-solid fa-link"></i> ${skill.prerequisites}</div>
    `;
    item.dataset.skillCost = skill.cost;
    item.dataset.skillId = skill.id;
    item.dataset.skillDescription = skill.description;
    item.dataset.skillAffected = skill.affected;
    item.dataset.skillPrerequisites = skill.prerequisites;
    if (skill.values) {
      item.dataset.skillValues = skill.values;
    }
    return item;
  };

  const renderPhase = (phase) => {
    const section = Utils.createElement('section', { className: 'skill-phase' });
    section.innerHTML = `
      <header>
        <h3><i class="fa-solid ${phase.icon}"></i> ${phase.name}</h3>
      </header>
      <div class="skill-list"></div>
    `;
    const list = section.querySelector('.skill-list');
    phase.skills.forEach((skill) => {
      list.appendChild(renderSkill(skill, phase.id));
    });
    return section;
  };

  const calculatePoints = () => {
    const selected = getSelected();
    const total = DataRepository.skillPhases
      .flatMap((phase) => phase.skills)
      .filter((skill) => selected[skill.id])
      .reduce((sum, skill) => sum + skill.cost, 0);
    totalDisplay.textContent = total;
    const isOverCap = total > MAX_POINTS;
    totalDisplay.classList.toggle('warning', isOverCap);
    if (isOverCap && !overPointCap) {
      Notifier.push(`Skill point cap exceeded by ${total - MAX_POINTS}!`);
    }
    overPointCap = isOverCap;
  };

  const toggleSkill = (checkbox) => {
    const selected = getSelected();
    const skillId = checkbox.dataset.skillId;
    if (checkbox.checked) {
      selected[skillId] = true;
    } else {
      delete selected[skillId];
    }
    setSelected(selected);
    const item = checkbox.closest('.skill-item');
    item.classList.toggle('completed', checkbox.checked);
    calculatePoints();
  };

  const showTooltip = (button) => {
    const skillItem = button.closest('.skill-item');
    const description = skillItem.dataset.skillDescription;
    const affected = skillItem.dataset.skillAffected;
    const values = skillItem.dataset.skillValues;
    const requires = skillItem.dataset.skillPrerequisites;
    const id = skillItem.dataset.skillId;
    if (activeTooltips.has(id)) {
      hideTooltip(id);
      return;
    }
    const tooltip = Utils.createElement('div', { className: 'skill-tooltip' });
    tooltip.appendChild(Utils.createElement('p', { text: description }));
    const details = Utils.createElement('dl', { className: 'skill-tooltip-details' });
    const addRow = (label, value) => {
      if (!value) return;
      const dt = Utils.createElement('dt', { text: label });
      const dd = Utils.createElement('dd', { text: value });
      details.append(dt, dd);
    };
    addRow('Affects', affected);
    addRow('Values', values);
    addRow('Requires', requires);
    tooltip.appendChild(details);
    skillItem.appendChild(tooltip);
    activeTooltips.set(id, tooltip);
    document.addEventListener(
      'click',
      (event) => {
        if (!skillItem.contains(event.target)) {
          hideTooltip(id);
        }
      },
      { once: true }
    );
  };

  const hideTooltip = (id) => {
    const tooltip = activeTooltips.get(id);
    if (tooltip) {
      tooltip.remove();
      activeTooltips.delete(id);
    }
  };

  const bindInteractions = () => {
    container.querySelectorAll('input[data-skill-id]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => toggleSkill(checkbox));
    });

    container.querySelectorAll('button.info').forEach((button) => {
      let timer;
      button.addEventListener('click', () => showTooltip(button));
      button.addEventListener('focus', () => {
        timer = setTimeout(() => showTooltip(button), TOOLTIP_DELAY);
      });
      button.addEventListener('blur', () => {
        clearTimeout(timer);
        const skillItem = button.closest('.skill-item');
        hideTooltip(skillItem.dataset.skillId);
      });
    });
  };

  const init = () => {
    activeTooltips.forEach((tooltip) => tooltip.remove());
    activeTooltips.clear();
    overPointCap = false;
    container.innerHTML = '';
    DataRepository.skillPhases.forEach((phase) => {
      container.appendChild(renderPhase(phase));
    });
    bindInteractions();
    calculatePoints();
  };

  return { init, calculatePoints };
})();

// DataTransfer enables exporting/importing the saved progress to JSON files.
const DataTransfer = (() => {
  const exportButton = document.getElementById('export-data');
  const importInput = document.getElementById('import-data');

  const download = (filename, content) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const init = () => {
    exportButton.addEventListener('click', () => {
      const data = StorageManager.snapshot();
      download(`arc-raiders-progress-${new Date().toISOString()}.json`, JSON.stringify(data, null, 2));
      Notifier.push('Progress exported to JSON.');
    });

    importInput.addEventListener('change', (event) => {
      const [file] = event.target.files;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          StorageManager.hydrate(data);
          WorkshopView.init();
          QuestView.init();
          SkillView.init();
          Notifier.push('Progress imported successfully.');
        } catch (error) {
          console.error('Import failed', error);
          Notifier.push('Failed to import data. Ensure the file is valid JSON.');
        }
      };
      reader.readAsText(file);
      importInput.value = '';
    });
  };

  return { init };
})();

// Bootstraps the application once the DOM is ready.
const App = (() => {
  const init = () => {
    ThemeController.init();
    NavigationController.init();
    WorkshopView.init();
    QuestView.init();
    SkillView.init();
    DataTransfer.init();
  };
  return { init };
})();

window.addEventListener('DOMContentLoaded', App.init);
