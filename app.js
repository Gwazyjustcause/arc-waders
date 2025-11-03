+// StorageManager wraps localStorage with JSON serialisation, namespacing and
+// lightweight publish/subscribe capabilities so UI components can react to
+// state changes and persist data consistently.
+const StorageManager = (() => {
+  const prefix = 'arc-raiders-tracker';
+  const subscribers = new Map();
+  const timers = new Map();
+  const defaultDelay = 180;
+
+  const buildKey = (key) => `${prefix}:${key}`;
+
+  const notify = (key, value) => {
+    const handlers = subscribers.get(key);
+    if (!handlers) return;
+    handlers.forEach((handler) => handler(value));
+  };
+
+  const get = (key, fallback = null) => {
+    try {
+      const raw = localStorage.getItem(buildKey(key));
+      return raw ? JSON.parse(raw) : fallback;
+    } catch (error) {
+      console.warn('Storage read error', error);
+      return fallback;
+    }
+  };
+
+  const commit = (key, value) => {
+    try {
+      localStorage.setItem(buildKey(key), JSON.stringify(value));
+    } catch (error) {
+      console.warn('Storage write error', error);
+    }
+    notify(key, value);
+  };
+
+  const set = (key, value, { debounce = defaultDelay } = {}) => {
+    if (debounce) {
+      if (timers.has(key)) clearTimeout(timers.get(key));
+      timers.set(
+        key,
+        setTimeout(() => {
+          commit(key, value);
+          timers.delete(key);
+        }, debounce)
+      );
+    } else {
+      commit(key, value);
+    }
+  };
+
+  const subscribe = (key, handler) => {
+    const list = subscribers.get(key) ?? [];
+    list.push(handler);
+    subscribers.set(key, list);
+    return () => {
+      const next = (subscribers.get(key) ?? []).filter((fn) => fn !== handler);
+      if (next.length) {
+        subscribers.set(key, next);
+      } else {
+        subscribers.delete(key);
+      }
+    };
+  };
+
+  const snapshot = () => {
+    const data = {};
+    Object.keys(localStorage)
+      .filter((key) => key.startsWith(prefix))
+      .forEach((key) => {
+        const shortKey = key.replace(`${prefix}:`, '');
+        data[shortKey] = JSON.parse(localStorage.getItem(key));
+      });
+    return data;
+  };
+
+  const hydrate = (data = {}) => {
+    Object.entries(data).forEach(([key, value]) => commit(key, value));
+  };
+
+  return { get, set, subscribe, snapshot, hydrate };
+})();
+
+// DataRepository centralises the static content that powers the SPA. Keeping
+// these data structures together simplifies rendering and potential future
+// updates.
+const DataRepository = (() => {
+  const materialMedia = {
+    'ARC Alloy': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Alloy.png',
+      alt: 'ARC Alloy crafting material from ARC Raiders'
+    },
+    'ARC Circuitry': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Circuitry.png',
+      alt: 'ARC Circuitry component from ARC Raiders'
+    },
+    'ARC Motion Core': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Motion_Core.png',
+      alt: 'ARC Motion Core component from ARC Raiders'
+    },
+    'ARC Powercell': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Powercell.png',
+      alt: 'ARC Powercell energy source from ARC Raiders'
+    },
+    'Advanced Electrical Components': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Advanced_Electrical_Components.png',
+      alt: 'Advanced electrical components from ARC Raiders'
+    },
+    Antiseptic: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Antiseptic.png',
+      alt: 'Antiseptic resource from ARC Raiders'
+    },
+    Apricot: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Apricot.png',
+      alt: 'Apricot ingredient from ARC Raiders'
+    },
+    'Bastion Cell': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Bastion_Cell.png',
+      alt: 'Bastion Cell power unit from ARC Raiders'
+    },
+    'Bombardier Cell': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Bombardier_Cell.png',
+      alt: 'Bombardier Cell power unit from ARC Raiders'
+    },
+    'Cat Bed': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Cat_Bed.png',
+      alt: 'Cat bed collectible from ARC Raiders'
+    },
+    Chemicals: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Chemicals.png',
+      alt: 'Chemicals crafting supply from ARC Raiders'
+    },
+    'Cracked Bioscanner': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Cracked_Bioscanner.png',
+      alt: 'Cracked bioscanner salvage from ARC Raiders'
+    },
+    'Crude Explosives': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Crude_Explosives.png',
+      alt: 'Crude explosives charge from ARC Raiders'
+    },
+    'Damaged Heat Sink': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Damaged_Heat_Sink.png',
+      alt: 'Damaged heat sink salvage from ARC Raiders'
+    },
+    'Dog Collar': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Dog_Collar.png',
+      alt: 'Dog collar collectible from ARC Raiders'
+    },
+    'Durable Cloth': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Durable_Cloth.png',
+      alt: 'Durable cloth fabric from ARC Raiders'
+    },
+    'Early Quest Reward': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Early_Quest_Reward.png',
+      alt: 'Early quest reward cache from ARC Raiders'
+    },
+    'Electrical Components': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Electrical_Components.png',
+      alt: 'Electrical components salvage from ARC Raiders'
+    },
+    'Explosive Compound': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Explosive_Compound.png',
+      alt: 'Explosive compound from ARC Raiders'
+    },
+    Fabric: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Fabric.png',
+      alt: 'Fabric bolts from ARC Raiders'
+    },
+    'Fireball Burner': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Fireball_Burner.png',
+      alt: 'Fireball Burner component from ARC Raiders'
+    },
+    'Fried Motherboard': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Fried_Motherboard.png',
+      alt: 'Fried motherboard salvage from ARC Raiders'
+    },
+    'Hornet Driver': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Hornet_Driver.png',
+      alt: 'Hornet driver component from ARC Raiders'
+    },
+    'Industrial Battery': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Industrial_Battery.png',
+      alt: 'Industrial battery from ARC Raiders'
+    },
+    'Laboratory Reagents': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Laboratory_Reagents.png',
+      alt: 'Laboratory reagents from ARC Raiders'
+    },
+    'Leaper Pulse Unit': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Leaper_Pulse_Unit.png',
+      alt: 'Leaper pulse unit from ARC Raiders'
+    },
+    Lemon: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Lemon.png',
+      alt: 'Lemon ingredient from ARC Raiders'
+    },
+    'Mechanical Components': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Mechanical_Components.png',
+      alt: 'Mechanical components from ARC Raiders'
+    },
+    'Metal Parts': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Metal_Parts.png',
+      alt: 'Metal parts scrap from ARC Raiders'
+    },
+    Motor: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Motor.png',
+      alt: 'Motor salvage from ARC Raiders'
+    },
+    Mushrooms: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Mushrooms.png',
+      alt: 'Foraged mushrooms from ARC Raiders'
+    },
+    Olives: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Olives.png',
+      alt: 'Jar of olives from ARC Raiders'
+    },
+    'Plastic Parts': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Plastic_Parts.png',
+      alt: 'Plastic parts salvage from ARC Raiders'
+    },
+    'Pop Trigger': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Pop_Trigger.png',
+      alt: 'Pop Trigger explosive component from ARC Raiders'
+    },
+    'Power Cable': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Power_Cable.png',
+      alt: 'Power cable salvage from ARC Raiders'
+    },
+    'Prickly Pear': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Prickly_Pear.png',
+      alt: 'Prickly pear fruit from ARC Raiders'
+    },
+    'Rocketeer Driver': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Rocketeer_Driver.png',
+      alt: 'Rocketeer driver component from ARC Raiders'
+    },
+    'Rubber Parts': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Rubber_Parts.png',
+      alt: 'Rubber parts salvage from ARC Raiders'
+    },
+    'Rusted Shut Medical Kit': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Rusted_Shut_Medical_Kit.png',
+      alt: 'Rusted shut medical kit from ARC Raiders'
+    },
+    'Rusted Tools': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Rusted_Tools.png',
+      alt: 'Rusted tools from ARC Raiders'
+    },
+    'Snitch Scanner': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Snitch_Scanner.png',
+      alt: 'Snitch scanner salvage from ARC Raiders'
+    },
+    'Surveyor Vault': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Surveyor_Vault.png',
+      alt: 'Surveyor vault tech from ARC Raiders'
+    },
+    'Synthesized Fuel': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Synthesized_Fuel.png',
+      alt: 'Synthesized fuel canister from ARC Raiders'
+    },
+    'Tick Pod': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Tick_Pod.png',
+      alt: 'Tick pod salvage from ARC Raiders'
+    },
+    Toaster: {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Toaster.png',
+      alt: 'Toaster collectible from ARC Raiders'
+    },
+    'Very Comfortable Pillow': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Very_Comfortable_Pillow.png',
+      alt: 'Very comfortable pillow collectible from ARC Raiders'
+    },
+    'Wasp Driver': {
+      image: 'https://arcraiders.wiki/wiki/Special:FilePath/Wasp_Driver.png',
+      alt: 'Wasp driver salvage from ARC Raiders'
+    }
+  };
+
+  const workshopStations = [
+  {
+    id: 'workbench',
+    name: 'Workbench',
+    description: 'Starter crafting bench for ammo, grenades and essential supplies.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Looting Mk. 1',
+          'Light Shield',
+          'Ferro',
+          'Hairpin',
+          'Kettle',
+          'Stitcher',
+          'Heavy Ammo',
+          'Light Ammo',
+          'Medium Ammo',
+          'Shotgun Ammo',
+          'Shield Recharger',
+          'Bandage',
+          'Light Impact Grenade'
+        ],
+        materials: []
+      }
+    ],
+    icon: 'fa-hammer',
+    accentColor: '#38bdf8',
+    image: 'https://arcraiders.wiki/w/images/9/9a/Medium_Gun_Parts.png',
+    imageAlt: 'Medium gun parts blueprint from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Workbench.png',
+        alt: 'Workbench bay inside the ARC Raiders hangar'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Light_Impact_Grenade.png',
+        alt: 'Light impact grenade render from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Shield_Recharger.png',
+        alt: 'Shield recharger schematic from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'gunsmith',
+    name: 'Gunsmith',
+    description: 'Add that extra oomph to your weapons by upgrading them here.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Hairpin I',
+          'Kettle I',
+          'Rattler I',
+          'Stitcher I',
+          'Angled Grip I',
+          'Compensator I',
+          'Extended Light Mag I',
+          'Extended Medium Mag I',
+          'Extended Shotgun Mag I',
+          'Muzzle Brake I',
+          'Shotgun Choke I',
+          'Stable Stock I',
+          'Vertical Grip I'
+        ],
+        materials: [
+          {
+            item: 'Metal Parts',
+            quantity: 20
+          },
+          {
+            item: 'Rubber Parts',
+            quantity: 30
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Arpeggio I'
+        ],
+        materials: [
+          {
+            item: 'Rusted Tools',
+            quantity: 3
+          },
+          {
+            item: 'Mechanical Components',
+            quantity: 5
+          },
+          {
+            item: 'Wasp Driver',
+            quantity: 8
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [
+          'Renegade I'
+        ],
+        materials: []
+      }
+    ],
+    icon: 'fa-gun',
+    accentColor: '#f97316',
+    image: 'https://arcraiders.wiki/w/images/3/3a/Stitcher-Level1.png',
+    imageAlt: 'Stitcher rifle render from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Gunsmith.png',
+        alt: 'Gunsmith station interior from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Light_Gun_Parts.png',
+        alt: 'Light gun parts blueprint from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Heavy_Gun_Parts.png',
+        alt: 'Heavy gun parts laid out on a worktable in ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'gear-bench',
+    name: 'Gear Bench',
+    description: 'The Gear Bench lets you craft Shields and Augments - provided you have the right resources.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Light Shield',
+          'Medium Shield',
+          'Combat Mk. 1',
+          'Looting Mk. 1',
+          'Tactical Mk. 1'
+        ],
+        materials: [
+          {
+            item: 'Plastic Parts',
+            quantity: 25
+          },
+          {
+            item: 'Fabric',
+            quantity: 30
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Heavy Shield',
+          'Combat Mk. 2',
+          'Looting Mk. 2',
+          'Tactical Mk. 2'
+        ],
+        materials: [
+          {
+            item: 'Power Cable',
+            quantity: 3
+          },
+          {
+            item: 'Electrical Components',
+            quantity: 5
+          },
+          {
+            item: 'Hornet Driver',
+            quantity: 5
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [
+          'Looting Mk. 3 (Cautious)',
+          'Tactical Mk.3 (Defensive)'
+        ],
+        materials: [
+          {
+            item: 'Industrial Battery',
+            quantity: 3
+          },
+          {
+            item: 'Advanced Electrical Components',
+            quantity: 5
+          },
+          {
+            item: 'Bastion Cell',
+            quantity: 6
+          }
+        ]
+      }
+    ],
+    icon: 'fa-toolbox',
+    accentColor: '#8b5cf6',
+    image: 'https://arcraiders.wiki/w/images/4/44/Shield_Recharger.png',
+    imageAlt: 'Shield recharger consumable from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Gear_Bench.png',
+        alt: 'Gear Bench fabrication module in ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Light_Shield.png',
+        alt: 'Light shield schematic from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Medium_Shield.png',
+        alt: 'Medium shield blueprint from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'explosives-station',
+    name: 'Explosives Station',
+    description: 'Craft your grenades and mines here. Very carefully.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Gas Grenade',
+          'Light Impact Grenade'
+        ],
+        materials: [
+          {
+            item: 'Chemicals',
+            quantity: 50
+          },
+          {
+            item: 'ARC Alloy',
+            quantity: 6
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Blaze Grenade'
+        ],
+        materials: [
+          {
+            item: 'Synthesized Fuel',
+            quantity: 3
+          },
+          {
+            item: 'Crude Explosives',
+            quantity: 5
+          },
+          {
+            item: 'Pop Trigger',
+            quantity: 5
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [
+          'Heavy Fuze Grenade'
+        ],
+        materials: [
+          {
+            item: 'Laboratory Reagents',
+            quantity: 3
+          },
+          {
+            item: 'Explosive Compound',
+            quantity: 5
+          },
+          {
+            item: 'Rocketeer Driver',
+            quantity: 3
+          }
+        ]
+      }
+    ],
+    icon: 'fa-bomb',
+    accentColor: '#f87171',
+    image: 'https://arcraiders.wiki/w/images/4/4c/Light_Impact_Grenade.png',
+    imageAlt: 'Light impact grenade from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Explosives_Station.png',
+        alt: 'Explosives Station counter in ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Blaze_Grenade.png',
+        alt: 'Blaze grenade concept from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Crude_Explosives.png',
+        alt: 'Crude explosives resource from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'medical-lab',
+    name: 'Medical Lab',
+    description: 'The Medical Lab is where you can create stimulants to give you that extra boost out in the wilds.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Herbal Bandage',
+          'Shield Recharger',
+          'Adrenaline Shot',
+          'Bandage'
+        ],
+        materials: [
+          {
+            item: 'Fabric',
+            quantity: 50
+          },
+          {
+            item: 'ARC Alloy',
+            quantity: 6
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Sterilized Bandage',
+          'Surge Shield Recharger'
+        ],
+        materials: [
+          {
+            item: 'Cracked Bioscanner',
+            quantity: 2
+          },
+          {
+            item: 'Durable Cloth',
+            quantity: 5
+          },
+          {
+            item: 'Tick Pod',
+            quantity: 8
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [],
+        materials: [
+          {
+            item: 'Rusted Shut Medical Kit',
+            quantity: 3
+          },
+          {
+            item: 'Antiseptic',
+            quantity: 8
+          },
+          {
+            item: 'Surveyor Vault',
+            quantity: 5
+          }
+        ]
+      }
+    ],
+    icon: 'fa-briefcase-medical',
+    accentColor: '#22d3ee',
+    image: 'https://arcraiders.wiki/w/images/0/0c/Bandage.png',
+    imageAlt: 'Bandage consumable from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Medical_Lab.png',
+        alt: 'Medical Lab interior from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Bandage.png',
+        alt: 'Standard bandage item from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Adrenaline_Shot.png',
+        alt: 'Adrenaline shot vial from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'utility-station',
+    name: 'Utility Station',
+    description: 'Fabricates traversal tools and support gadgets to help raiders adapt on the fly.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Binoculars',
+          "Li'l Smoke Grenade",
+          'Door Blocker'
+        ],
+        materials: [
+          {
+            item: 'Plastic Parts',
+            quantity: 50
+          },
+          {
+            item: 'ARC Alloy',
+            quantity: 6
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Raider Hatch Key',
+          'Zipline'
+        ],
+        materials: [
+          {
+            item: 'Damaged Heat Sink',
+            quantity: 2
+          },
+          {
+            item: 'Electrical Components',
+            quantity: 5
+          },
+          {
+            item: 'Snitch Scanner',
+            quantity: 6
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [
+          'Photoelectric Cloak'
+        ],
+        materials: [
+          {
+            item: 'Fried Motherboard',
+            quantity: 3
+          },
+          {
+            item: 'Advanced Electrical Components',
+            quantity: 5
+          },
+          {
+            item: 'Leaper Pulse Unit',
+            quantity: 4
+          }
+        ]
+      }
+    ],
+    icon: 'fa-screwdriver-wrench',
+    accentColor: '#facc15',
+    image: 'https://arcraiders.wiki/w/images/c/c3/ARC_Surveyor.png',
+    imageAlt: 'ARC Surveyor drone from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Utility_Station.png',
+        alt: 'Utility Station loadout tools in ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Snitch_Scanner.png',
+        alt: 'Snitch Scanner gadget from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Electrical_Components.png',
+        alt: 'Electrical components cache from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'refiner',
+    name: 'Refiner',
+    description: 'Crucial companion for any Raider finding themselves in frequent need of custom parts.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1',
+        crafts: [
+          'Electrical Components',
+          'Crude Explosives',
+          'Mechanical Components'
+        ],
+        materials: [
+          {
+            item: 'Metal Parts',
+            quantity: 60
+          },
+          {
+            item: 'ARC Powercell',
+            quantity: 5
+          }
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2',
+        crafts: [
+          'Advanced Electrical Components',
+          'Advanced Mechanical Components',
+          'Antiseptic',
+          'ARC Circuitry',
+          'ARC Motion Core',
+          'Heavy Gun Parts',
+          'Light Gun Parts',
+          'Medium Gun Parts'
+        ],
+        materials: [
+          {
+            item: 'Toaster',
+            quantity: 3
+          },
+          {
+            item: 'ARC Motion Core',
+            quantity: 5
+          },
+          {
+            item: 'Fireball Burner',
+            quantity: 8
+          }
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3',
+        crafts: [
+          'Magnetic Accelerator',
+          'Mod Components',
+          'Power Rod'
+        ],
+        materials: [
+          {
+            item: 'Motor',
+            quantity: 3
+          },
+          {
+            item: 'ARC Circuitry',
+            quantity: 10
+          },
+          {
+            item: 'Bombardier Cell',
+            quantity: 6
+          }
+        ]
+      }
+    ],
+    icon: 'fa-industry',
+    accentColor: '#a855f7',
+    image: 'https://arcraiders.wiki/w/images/b/b0/Ferro-Level1.png',
+    imageAlt: 'Ferro crafting schematic from ARC Raiders',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Refiner.png',
+        alt: 'Refiner station within the ARC Raiders hangar'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Powercell.png',
+        alt: 'ARC Powercell resource from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Advanced_Electrical_Components.png',
+        alt: 'Advanced electrical components stockpile from ARC Raiders'
+      }
+    ]
+  },
+  {
+    id: 'scrappy-the-rooster',
+    name: 'Scrappy the Rooster',
+    description: 'This rooster has been a resident of the workshop since the day you moved in, and likely long before that. Will periodically bring back dubiously-sourced materials and share them with you.',
+    levels: [
+      {
+        level: 1,
+        label: 'Level 1 - Fledgling',
+        crafts: [],
+        materials: [
+          {
+            item: 'Early Quest Reward',
+            quantity: null
+          }
+        ],
+        functions: [
+          'Brings 5x of each basic crafting resource and 1x random uncommon tier item on a round death.',
+          'Brings 12x of each basic crafting resource and 3x random uncommon tier items on a round survival.'
+        ]
+      },
+      {
+        level: 2,
+        label: 'Level 2 - Forager',
+        crafts: [],
+        materials: [
+          {
+            item: 'Dog Collar',
+            quantity: 1
+          }
+        ],
+        functions: [
+          'Brings 6x of each basic crafting resource and 2x random uncommon tier items on a round death.',
+          'Brings 13x of each basic crafting resource and 4x random uncommon tier items on a round survival.'
+        ]
+      },
+      {
+        level: 3,
+        label: 'Level 3 - Savenger',
+        crafts: [],
+        materials: [
+          {
+            item: 'Lemon',
+            quantity: 5
+          },
+          {
+            item: 'Apricot',
+            quantity: 5
+          }
+        ],
+        functions: [
+          'Brings 14x of each basic crafting resource and 7x random uncommon tier items on a round survival.'
+        ]
+      },
+      {
+        level: 4,
+        label: 'Level 4 - Treasure Hunter',
+        crafts: [],
+        materials: [
+          {
+            item: 'Prickly Pear',
+            quantity: 8
+          },
+          {
+            item: 'Olives',
+            quantity: 8
+          },
+          {
+            item: 'Cat Bed',
+            quantity: 1
+          }
+        ],
+        functions: []
+      },
+      {
+        level: 5,
+        label: 'Level 5 - Master Hoarder',
+        crafts: [],
+        materials: [
+          {
+            item: 'Apricot',
+            quantity: 12
+          },
+          {
+            item: 'Mushrooms',
+            quantity: 12
+          },
+          {
+            item: 'Very Comfortable Pillow',
+            quantity: 3
+          }
+        ],
+        functions: []
+      }
+    ],
+    icon: 'fa-crow',
+    accentColor: '#f4a261',
+    image: 'https://arcraiders.wiki/w/images/f/f1/Scrappy-TT2-screenshot.png',
+    imageAlt: 'Scrappy the rooster perched in the ARC Raiders workshop',
+    gallery: [
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Scrappy.png',
+        alt: 'Scrappy the rooster portrait from ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Cat_Bed.png',
+        alt: 'Cat bed collectible recovered by Scrappy in ARC Raiders'
+      },
+      {
+        url: 'https://arcraiders.wiki/wiki/Special:FilePath/Very_Comfortable_Pillow.png',
+        alt: 'Very comfortable pillow reward from ARC Raiders'
+      }
+    ]
+  }
+];
+
+  const quests = [
+  {
+    id: 'picking-up-the-pieces',
+    name: 'Picking Up The Pieces',
+    trader: 'Shani',
+    objectives: [
+      'Visit any area on your map with a loot category icon',
+      'Loot 3 containers'
+    ],
+    rewards: [
+      '1x Rattler III',
+      '80x Medium Ammo'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'clearer-skies',
+    name: 'Clearer Skies',
+    trader: 'Shani',
+    objectives: [
+      'Destroy 3 ARC enemies',
+      'Get 3 ARC Alloy for Shani'
+    ],
+    rewards: [
+      '3x Sterilized Bandage',
+      '1x Light Shield',
+      'Black Backpack Cosmetic (Hiker Color)'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'trash-into-treasure',
+    name: 'Trash Into Treasure',
+    trader: 'Shani',
+    objectives: [
+      'Obtain 6 Wires',
+      'Obtain 1 Battery'
+    ],
+    rewards: [
+      '1x Tactical MK.1',
+      '3x Adrenaline Shot'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'off-the-radar',
+    name: 'Off The Radar',
+    trader: 'Shani',
+    objectives: [
+      'Visit a field depot',
+      'Repair the antenna on the roof of Field Depot'
+    ],
+    rewards: [
+      '2x Defibrillator'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'a-bad-feeling',
+    name: 'A Bad Feeling',
+    trader: 'Celeste',
+    objectives: [
+      'Find and search any ARC Probe or ARC Courier'
+    ],
+    rewards: [
+      '10x Metal parts',
+      '5x Steel Spring',
+      '5x Duct Tape'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-satellite-dish'
+  },
+  {
+    id: 'the-right-tool',
+    name: 'The Right Tool',
+    trader: 'Tian Wen',
+    objectives: [
+      'Destroy a Fireball',
+      'Destroy a Hornet',
+      'Destroy a Turret'
+    ],
+    rewards: [
+      'Cheer Emote',
+      '1x Stitcher II',
+      '1x Extended Light Mag I'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-chess-rook'
+  },
+  {
+    id: 'hatch-repairs',
+    name: 'Hatch Repairs',
+    trader: 'Shani',
+    objectives: [
+      'Repair the leaking hydraulic pipes near a Raider Hatch',
+      'Search for a hatch key near the Raider hatch'
+    ],
+    rewards: [
+      '1x Raider Hatch Key',
+      '1x Binoculars'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'safe-passage',
+    name: 'Safe Passage',
+    trader: 'Apollo',
+    objectives: [
+      'Destroy 2 ARC enemies using any explosive grenade'
+    ],
+    rewards: [
+      "5x Li'l Smoke Grenade",
+      '3x Shrapnel Grenade',
+      '3x Barricade Kit'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-bolt'
+  },
+  {
+    id: 'down-to-earth',
+    name: 'Down To Earth',
+    trader: 'Shani',
+    objectives: [
+      'Visit a Field Depot',
+      'Deliver a Field Crate to a Supply Station',
+      'Collect the reward'
+    ],
+    rewards: [
+      '1x Combat MK.1',
+      '1x Medium Shield'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'the-trifecta',
+    name: 'The Trifecta',
+    trader: 'Shani',
+    objectives: [
+      'Destroy a Hornet',
+      'Get a Hornet Driver for Shani',
+      'Destroy a Snitch',
+      'Get a Snitch Scanner for Shani',
+      'Destroy a Wasp',
+      'Get a Wasp Driver for Shani'
+    ],
+    rewards: [
+      '1x Dam Control Tower Key',
+      '2x Defibrillator',
+      '1x Raider Hatch Key'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'a-better-use',
+    name: 'A Better Use',
+    trader: 'Tian Wen',
+    objectives: [
+      'Request in a Supply Drop from a Call Station',
+      'Loot a Supply Drop'
+    ],
+    rewards: [
+      '1x Extended Light Mag I',
+      '1x Stable Stock I',
+      '1x Muzzle Brake II'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City',
+      'Blue Gate'
+    ],
+    icon: 'fa-chess-rook'
+  },
+  {
+    id: 'what-goes-around',
+    name: 'What Goes Around',
+    trader: 'Apollo',
+    objectives: [
+      'Destroy any ARC enemy using a Fireball Burner'
+    ],
+    rewards: [
+      '3x Blaze Grenade',
+      '2x Noisemaker',
+      'Cans Backpack Attachment (Cosmetic)'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City',
+      'Blue Gate'
+    ],
+    icon: 'fa-bolt'
+  },
+  {
+    id: 'sparks-fly',
+    name: 'Sparks Fly',
+    trader: 'Apollo',
+    objectives: [
+      "Destroy a Hornet with a Trigger 'Nade or Snap Blast"
+    ],
+    rewards: [
+      '1x Trigger Nade Blueprint',
+      '4x Crude Explosives',
+      '2x Processor'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City',
+      'Blue Gate'
+    ],
+    icon: 'fa-bolt'
+  },
+  {
+    id: 'greasing-her-palms',
+    name: 'Greasing Her Palms',
+    trader: 'Celeste',
+    objectives: [
+      'On Dam Battlegrounds, visit the Locked Room in the Water Treatment Control building',
+      'On Spaceport, scope out the rocket thrusters outside the Rocket Assembly',
+      'On Buried City, visit the barricaded area on floor 6 of the Space Travel Building'
+    ],
+    rewards: [
+      '1x Lure Grenade Blueprint',
+      '3x Speaker Component',
+      '3x Electrical Components'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-satellite-dish'
+  },
+  {
+    id: 'a-first-foothold',
+    name: 'A First Foothold',
+    trader: 'Apollo',
+    objectives: [
+      'Stabilize the observation deck near the Ridgeline',
+      'Enable the comms terminal near the Olive Grove',
+      'Rotate the satellite dishes on the church roof, north of the Data Vault',
+      "Nail down the roof plates on the Raider structure near Trapper's Glade"
+    ],
+    rewards: [
+      '3x Shrapnel Grenade',
+      '3x Snap Blast Grenade',
+      '3x Heavy Fuze Grenade'
+    ],
+    maps: [
+      'Blue Gate'
+    ],
+    icon: 'fa-bolt'
+  },
+  {
+    id: 'dormant-barons',
+    name: 'Dormant Barons',
+    trader: 'Shani',
+    objectives: [
+      'Loot a Baron husk'
+    ],
+    rewards: [
+      '3x  Door Blocker',
+      "3x Li'l Smoke Grenade"
+    ],
+    maps: [
+      'Multiple'
+    ],
+    icon: 'fa-compass'
+  },
+  {
+    id: 'mixed-signals',
+    name: 'Mixed Signals',
+    trader: 'Tian Wen',
+    objectives: [
+      'Destroy an ARC Surveyor',
+      'Obtain 1 Surveyor Vault'
+    ],
+    rewards: [
+      '1x Photoelectric Cloak',
+      '1x Raider Hatch Key'
+    ],
+    maps: [
+      'Multiple'
+    ],
+    icon: 'fa-chess-rook'
+  },
+  {
+    id: 'doctor-s-orders',
+    name: "Doctor's Orders",
+    trader: 'Lance',
+    objectives: [
+      'Obtain 2 Antiseptic',
+      'Obtain 1 Syringe',
+      'Obtain 1 Durable Cloth',
+      'Obtain 1 Great Mullein'
+    ],
+    rewards: [
+      '3x Adrenaline Shot',
+      '3x Sterilized Bandage',
+      '1x Surge Shield Recharger'
+    ],
+    maps: [
+      'Multiple'
+    ],
+    icon: 'fa-kit-medical'
+  },
+  {
+    id: 'medical-merchandise',
+    name: 'Medical Merchandise',
+    trader: 'Lance',
+    objectives: [
+      "On Spaceport, search 2 containers in the Departure Building's exam rooms",
+      'Search 3 containers in the Hospital in Buried City',
+      "On Dam Battlegrounds, search 2 containers in the Research & Administration building's medical room"
+    ],
+    rewards: [
+      '1x Banana Backpack Charm (Cosmetic)',
+      '3x Defibrillator',
+      '2x Vita Shot'
+    ],
+    maps: [
+      'Dam Battlegrounds',
+      'Spaceport',
+      'Buried City'
+    ],
+    icon: 'fa-kit-medical'
+  },
+  {
+    id: 'a-reveal-in-ruins',
+    name: 'A Reveal in Ruins',
+    trader: 'Lance',
+    objectives: [
+      'Search for an ESR Analyzer inside any pharmacy in Buried City',
+      'Deliver the ESR Analyzer to Lance'
+    ],
+    rewards: [
+      '1x Tactical Mk. 3 (Healing)',
+      '1x Surge Shield Recharger'
+    ],
+    maps: [
+      'Buried City'
+    ],
+    icon: 'fa-kit-medical'
+  },
+  {
+    id: 'broken-monument',
+    name: 'Broken Monument',
+    trader: 'Tian Wen',
+    objectives: [
+      'Reach the hallowed grounds by the Scrap Yard',
+      'Search for a compass near the broken-down vehicles',
+      'Search for the video tape near the cylindrical containers',
+      'Search for the old field rations in the Raider camp',
+      'Deliver the First Wave Tape to Tian Wen',
+      'Deliver First Wave Compass to Tian Wen',
+      'Deliver First Wave Rations to Tian Wen'
+    ],
+    rewards: [
+      '1x Arpeggio I',
+      '1x Compensator II',
+      '80x Medium Ammo'
+    ],
+    maps: [
+      'Multiple'
+    ],
+    icon: 'fa-chess-rook'
+  },
+  {
+    id: 'marked-for-death',
+    name: 'Marked for Death',
+    trader: 'Tian Wen',
+    objectives: [
+      'Reach the Su Durante Warehouses in the Outskirts in Buried City'
+    ],
+    rewards: [
+      '1x Shotgun Choke II',
+      '1x Angled Grip II'
+    ],
+    maps: [
+      'Buried City'
+    ],
+    icon: 'fa-chess-rook'
+  },
+  {
+    id: 'straight-record',
+    name: 'Straight Record',
+    trader: 'Celeste',
+    objectives: [
+      'Reach Victory Ridge',
+      'Find the old EMP trap',
+      'Disable the first power switch',
+      'Disable the second power switch',
+      'Disable the third power switch',
+      'Shutdown the EMP trap'
+    ],
+    rewards: [
+      '5x Medium Gun Parts',
+      '3x Advanced Mechanical Components'
+    ],
+    maps: [
+      'Dam Battlegrounds'
+    ],
+    icon: 'fa-satellite-dish'
+  },
+  {
+    id: 'a-lay-of-the-land',
+    name: 'A Lay of the Land',
+    trader: 'Shani',
+    objectives: [
+      'Reach the Jiangsu Warehouse',
+      "Find the shipping notes in the foreman's office",
+      'Locate the scanners on the upper floor of Control Tower A6',
+      'Deliver 1 LiDAR Scanners to Shani'
+    ],
+    rewards: [
+      '1x Dam Testing Annex Key',
+      '3x Zipline',
+      '2x Smoke Grenade'
+    ],
+    maps: [
+      'Spaceport'
+    ],
+    icon: 'fa-compass'
+  }
+];
+
+  const skillBranches = [
+    {
+      id: 'conditioning',
+      name: 'Conditioning Route',
+      icon: 'fa-dumbbell',
+      color: 'var(--color-conditioning)',
+      summary:
+        'Community-favourite opening that invests early points into health, stamina and shield uptime so squads can tank through early drops.',
+      source:
+        'Synthesised from day-one balance spreadsheets, top Discord build threads and early access clears.',
+      nodes: [
+        {
+          id: 'conditioning-field-conditioning',
+          order: '1 – 5',
+          name: 'Field Conditioning',
+          cost: 5,
+          description: 'Boosts base health and stamina regeneration to survive stray artillery and hunter swarms.',
+          focus: 'Baseline survivability',
+          community: 'Universally cited as step one so teams can withstand opening salvos.'
+        },
+        {
+          id: 'conditioning-combat-conditioning',
+          order: '5 – 9',
+          name: 'Combat Conditioning',
+          cost: 4,
+          description: 'Layers flat damage resistance that stacks with armour cores for steadier firefights.',
+          focus: 'Damage resistance',
+          community: 'Preferred over niche perks until raids hit purple threat levels.'
+        },
+        {
+          id: 'conditioning-hard-reset',
+          order: '9 – 12',
+          name: 'Hard Reset',
+          cost: 3,
+          description: 'Emergency stamina burst when shields pop so you can dodge or retreat before the second volley.',
+          focus: 'Panic stamina refill',
+          community: 'Greatly reduces wipe potential when your frontline loses a shield.'
+        },
+        {
+          id: 'conditioning-survivors-resolve',
+          order: '12 – 18',
+          name: "Survivor's Resolve",
+          cost: 6,
+          description: 'Heavier bleed-out buffer and faster revives keep squads alive while med-kits cycle.',
+          focus: 'Downed resilience',
+          community: 'High-tier crews highlight this before late-game hunts where chain revives are common.'
+        },
+        {
+          id: 'conditioning-juggernaut-weave',
+          order: '18 – 24',
+          name: 'Juggernaut Weave',
+          cost: 6,
+          description: 'Shield durability and repair kits scale harder so tanks can anchor Titan encounters.',
+          focus: 'Shield sustain',
+          community: 'Feedback threads rank it above alternative blue-tier perks for raid longevity.'
+        },
+        {
+          id: 'conditioning-emergency-repairs',
+          order: '24 – 30',
+          name: 'Emergency Repairs',
+          cost: 5,
+          description: 'Consumables top off extra health on revive, letting teams bounce back without retreating to camp.',
+          focus: 'Post-revive safety',
+          community: 'Speed-running crews pick this before pushing Grey Zone loops.'
+        },
+        {
+          id: 'conditioning-iron-constitution',
+          order: '30+',
+          name: 'Iron Constitution',
+          cost: 8,
+          description: 'Capstone padding for late game that lifts resistance caps and stacks multiplicatively with utility boosters.',
+          focus: 'Endgame mitigation',
+          community: 'Reserved for final 60+ routes once core sustain picks are handled.'
+        }
+      ]
+    },
+    {
+      id: 'mobility',
+      name: 'Mobility Route',
+      icon: 'fa-person-running',
+      color: 'var(--color-mobility)',
+      summary:
+        'Mirror the in-game tree: burst movement, low-cost vault chains and sprint efficiency to stay on top of ARC patrols.',
+      source:
+        'Compiled from tournament recon mains, Reddit tier lists and frame-by-frame stamina math.',
+      nodes: [
+        {
+          id: 'mobility-recon-sprint',
+          order: '10 – 14',
+          name: 'Recon Sprint',
+          cost: 4,
+          description: 'Cuts sprint drain so scouts can rotate objectives without burning kits.',
+          focus: 'Sprint economy',
+          community: 'Recommended before chasing aerial drops or intercept timers.'
+        },
+        {
+          id: 'mobility-youthful-lungs',
+          order: '14 – 19',
+          name: 'Youthful Lungs',
+          cost: 4,
+          description: 'Adds stamina regen while sprinting to maintain pursuit pressure.',
+          focus: 'Regeneration on the move',
+          community: 'Top runners pair it with Recon Sprint for infinite circuit routes.'
+        },
+        {
+          id: 'mobility-sprint-catalyst',
+          order: '19 – 22',
+          name: 'Sprint Catalyst',
+          cost: 3,
+          description: 'First dodge after a slide refunds stamina, letting you chain movement tech.',
+          focus: 'Slide + dodge loop',
+          community: 'Matches the clip meta for hover-scouts clearing artillery nests.'
+        },
+        {
+          id: 'mobility-slipstream-vault',
+          order: '22 – 28',
+          name: 'Slipstream Vault',
+          cost: 5,
+          description: 'Vaults and mantles happen quicker and trigger a tiny speed burst.',
+          focus: 'Traversal burst',
+          community: 'Essential on vertical maps like The Spine and Raincatcher.'
+        },
+        {
+          id: 'mobility-air-control',
+          order: '28 – 36',
+          name: 'Air Control Suite',
+          cost: 6,
+          description: 'Extended air steering plus softer landings to keep combos alive.',
+          focus: 'Mid-air control',
+          community: 'Keeps movement tech consistent even with heavy kits equipped.'
+        },
+        {
+          id: 'mobility-dodgers-anthem',
+          order: '36 – 42',
+          name: "Dodger's Anthem",
+          cost: 5,
+          description: 'Reduces dodge roll cooldown and leaves a stamina-free sprint window.',
+          focus: 'Dodge spam',
+          community: 'Popularised by tournament Vanguards chasing hounds.'
+        },
+        {
+          id: 'mobility-catapult-roll',
+          order: '42+',
+          name: 'Catapult Roll',
+          cost: 6,
+          description: 'Capstone leap distance plus recovery roll leniency to finish the tree.',
+          focus: 'Late-game reach',
+          community: 'Picked once stamina economy is solved and players chase style clears.'
+        }
+      ]
+    },
+    {
+      id: 'survival',
+      name: 'Survival Route',
+      icon: 'fa-heart-circle-bolt',
+      color: 'var(--color-survival)',
+      summary:
+        'Stealth, loot density and squad sustain pulls drawn from long-form extraction runs and veteran feedback.',
+      source:
+        'Cross-referenced with wiki drops, data-mined loot tables and community spreadsheets.',
+      nodes: [
+        {
+          id: 'survival-foragers-instinct',
+          order: '1 – 5',
+          name: "Forager's Instinct",
+          cost: 3,
+          description: 'Highlights high-yield containers nearby so early loops snowball faster.',
+          focus: 'Loot awareness',
+          community: 'Sets the pace for resource routes and challenge bounties.'
+        },
+        {
+          id: 'survival-silent-approach',
+          order: '5 – 9',
+          name: 'Silent Approach',
+          cost: 4,
+          description: 'Reduces crouch noise and slows alert build-up for stealthy salvaging.',
+          focus: 'Stealth mobility',
+          community: 'Pairs with Conditioning builds to keep aggro low between fights.'
+        },
+        {
+          id: 'survival-salvage-savvy',
+          order: '9 – 15',
+          name: 'Salvage Savvy',
+          cost: 5,
+          description: 'Additional material rolls from caches and supply drops.',
+          focus: 'Resource income',
+          community: 'Highly rated by crafters pushing late-tier workshop unlocks.'
+        },
+        {
+          id: 'survival-field-medic',
+          order: '15 – 22',
+          name: 'Field Medic',
+          cost: 6,
+          description: 'Revives deliver bonus health and resistance for a few seconds.',
+          focus: 'Team sustain',
+          community: 'Competitive crews grab this before contesting large public events.'
+        },
+        {
+          id: 'survival-resource-radar',
+          order: '22 – 30',
+          name: 'Resource Radar',
+          cost: 4,
+          description: 'Pings rare drops and caches on the minimap after each encounter.',
+          focus: 'Macro scouting',
+          community: 'Helps route late-game fabrication mats without backtracking.'
+        },
+        {
+          id: 'survival-night-watch',
+          order: '30 – 38',
+          name: 'Night Watch',
+          cost: 5,
+          description: 'Thermal highlighting and extended enemy outlines in storms or night cycles.',
+          focus: 'Situational awareness',
+          community: 'Favoured for high-threat weather rotations and Dust Storm alerts.'
+        },
+        {
+          id: 'survival-tenacity-loop',
+          order: '38+',
+          name: 'Tenacity Loop',
+          cost: 6,
+          description: 'Late-tree perk that converts excess materials into on-field heals at stations.',
+          focus: 'Endgame sustain',
+          community: 'Used in marathon expeditions when med crates dry up.'
+        }
+      ]
+    }
+  ];
+
+  const skillPhases = skillBranches;
+  const traderMeta = {
+    Shani: {
+      icon: 'fa-compass',
+      color: '#f4a261'
+    },
+    Celeste: {
+      icon: 'fa-satellite-dish',
+      color: '#6d597a'
+    },
+    'Tian Wen': {
+      icon: 'fa-chess-rook',
+      color: '#2ec4b6'
+    },
+    Apollo: {
+      icon: 'fa-bolt',
+      color: '#ff6b6b'
+    },
+    Lance: {
+      icon: 'fa-kit-medical',
+      color: '#3a86ff'
+    }
+  };
+
+  return { workshopStations, quests, skillBranches, skillPhases, traderMeta, mapVisuals, materialMedia };
+})();
+
+// Shared helper utilities used across modules for repetitive tasks.
+const Utils = (() => {
+  const formatKey = (...parts) => parts.join(':').toLowerCase().replace(/\s+/g, '-');
+
+  const createElement = (tag, options = {}) => {
+    const element = document.createElement(tag);
+    if (options.className) element.className = options.className;
+    if (options.text) element.textContent = options.text;
+    if (options.html) element.innerHTML = options.html;
+    if (options.attrs) {
+      Object.entries(options.attrs).forEach(([key, value]) => {
+        if (value !== undefined && value !== null) element.setAttribute(key, value);
+      });
+    }
+    return element;
+  };
+
+  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
+
+  const sum = (values) => values.reduce((total, current) => total + current, 0);
+
+  const toRoman = (value) => {
+    if (!Number.isFinite(value) || value <= 0) return '';
+    const lookup = [
+      ['M', 1000],
+      ['CM', 900],
+      ['D', 500],
+      ['CD', 400],
+      ['C', 100],
+      ['XC', 90],
+      ['L', 50],
+      ['XL', 40],
+      ['X', 10],
+      ['IX', 9],
+      ['V', 5],
+      ['IV', 4],
+      ['I', 1]
+    ];
+    let result = '';
+    let remaining = Math.floor(value);
+    lookup.forEach(([symbol, amount]) => {
+      while (remaining >= amount) {
+        result += symbol;
+        remaining -= amount;
+      }
+    });
+    return result;
+  };
+
+  return { formatKey, createElement, clamp, sum, toRoman };
+})();
+
+// Simple notification system for contextual feedback (e.g. completion events).
+const Notifier = (() => {
+  const container = document.querySelector('.notifications');
+  const push = (message, timeout = 4000) => {
+    if (!container) return;
+    const notification = Utils.createElement('div', {
+      className: 'notification',
+      text: message
+    });
+    container.appendChild(notification);
+    setTimeout(() => {
+      notification.classList.add('fade-out');
+      notification.addEventListener('transitionend', () => notification.remove(), {
+        once: true
+      });
+    }, timeout);
+  };
+  return { push };
+})();
+
+// Controls theme toggling and persistence between light and dark modes.
+const ThemeController = (() => {
+  const toggleButton = document.getElementById('theme-toggle');
+  const root = document.documentElement;
+  const STORAGE_KEY = 'theme';
+
+  const applyTheme = (theme) => {
+    root.setAttribute('data-theme', theme);
+    toggleButton.innerHTML =
+      theme === 'dark'
+        ? '<i class="fa-solid fa-sun"></i>'
+        : '<i class="fa-solid fa-moon"></i>';
+    toggleButton.setAttribute('aria-pressed', theme === 'dark');
+  };
+
+  const init = () => {
+    const saved = StorageManager.get(STORAGE_KEY, 'dark');
+    applyTheme(saved);
+    toggleButton.addEventListener('click', () => {
+      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
+      applyTheme(next);
+      StorageManager.set(STORAGE_KEY, next);
+    });
+  };
+
+  return { init };
+})();
+
+// Handles switching between the SPA views while keeping ARIA attributes in sync.
+const NavigationController = (() => {
+  const navButtons = Array.from(document.querySelectorAll('.nav-link'));
+  const sections = Array.from(document.querySelectorAll('.view'));
+
+  const showSection = (targetId) => {
+    let activated = null;
+    sections.forEach((section) => {
+      const isActive = section.id === targetId;
+      section.classList.toggle('active', isActive);
+      if (isActive) {
+        activated = section;
+      }
+      const navButton = navButtons.find((button) => button.dataset.target === section.id);
+      if (navButton) {
+        navButton.classList.toggle('active', isActive);
+        navButton.setAttribute('aria-expanded', String(isActive));
+      }
+    });
+
+    if (activated) {
+      window.requestAnimationFrame(() => {
+        window.scrollTo({ top: 0, behavior: 'smooth' });
+      });
+    }
+  };
+
+  const init = () => {
+    navButtons.forEach((button) => {
+      button.addEventListener('click', () => showSection(button.dataset.target));
+    });
+  };
+
+  return { init };
+})();
+
+// WorkshopView renders upgrade tracking cards and synchronises material inputs.
+const WorkshopView = (() => {
+  const container = document.getElementById('workshop-grid');
+  const materialMedia = DataRepository.materialMedia ?? {};
+  const FALLBACK_MEDIA = {
+    image: 'https://arcraiders.wiki/wiki/Special:FilePath/ARC_Raiders_Logo.png',
+    alt: 'ARC Raiders emblem'
+  };
+
+  const getMaterialVisual = (name) => materialMedia[name] ?? FALLBACK_MEDIA;
+
+  const calculateLevelTotals = (station, level) => {
+    const trackable = Array.isArray(level.materials)
+      ? level.materials.filter((material) => Number.isFinite(material.quantity))
+      : [];
+    const totalRequired = trackable.reduce((sum, material) => sum + (material.quantity ?? 0), 0);
+    const totalHave = trackable.reduce((sum, material) => {
+      const key = Utils.formatKey('workshop', station.id, level.level, material.item);
+      const stored = StorageManager.get(key, 0) || 0;
+      const cap = material.quantity ?? 0;
+      return sum + Math.min(stored, cap);
+    }, 0);
+    const totalRemaining = Math.max(totalRequired - totalHave, 0);
+    const progress = totalRequired
+      ? Math.round((totalHave / totalRequired) * 100)
+      : trackable.length
+      ? 0
+      : 100;
+    return { totalRequired, totalHave, totalRemaining, progress };
+  };
+
+  const buildStatusMarkup = (remaining, required) => {
+    const ready = required === 0 || remaining === 0;
+    return `
+      <i class="fa-solid ${ready ? 'fa-check-double' : 'fa-triangle-exclamation'}"></i>
+      <div class="station-level-status-copy">
+        <span class="station-level-status-text">${ready ? 'Ready to upgrade' : 'Not enough resources'}</span>
+        ${
+          ready
+            ? ''
+            : `<span class="station-level-status-detail">Need <strong>${remaining}</strong> more</span>`
+        }
+      </div>
+    `;
+  };
+
+  const renderResourceRow = (station, level, material) => {
+    const trackable = Number.isFinite(material.quantity);
+    const key = trackable ? Utils.formatKey('workshop', station.id, level.level, material.item) : null;
+    const max = trackable ? material.quantity ?? 0 : 0;
+    const stored = trackable ? StorageManager.get(key, 0) : 0;
+    const have = trackable ? Utils.clamp(Number(stored) || 0, 0, max) : 0;
+    const remaining = trackable ? Math.max(max - have, 0) : 0;
+    const percentage = trackable && max ? (have / max) * 100 : 0;
+    const visual = getMaterialVisual(material.item);
+
+    const row = Utils.createElement('li', {
+      className: `resource-item${trackable ? ' trackable' : ' info-only'}${trackable && remaining === 0 ? ' complete' : ''}`,
+      attrs: {
+        'data-required': trackable ? max : 0,
+        'data-current': trackable ? have : 0,
+        'data-remaining': trackable ? remaining : 0
+      }
+    });
+
+    const haveMarkup = trackable
+      ? `
+          <div class="resource-status">
+            <span class="resource-count">
+              <strong class="resource-have">${have}</strong>
+              <span class="resource-divider">/</span>
+              <span class="resource-total">${max}</span>
+            </span>
+            <div class="resource-progress"><span style="width: ${percentage}%"></span></div>
+          </div>
+        `
+      : `
+          <div class="resource-status">
+            ${
+              material.note
+                ? `<p class="resource-note">${material.note}</p>`
+                : '<p class="resource-note">No tracking required.</p>'
+            }
+          </div>
+        `;
+
+    row.innerHTML = `
+      <figure class="resource-thumb">
+        <img src="${visual.image}" alt="${visual.alt ?? `${material.item} item from ARC Raiders`}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
+      </figure>
+      <div class="resource-info">
+        <span class="resource-name">${material.item}</span>
+        ${haveMarkup}
+      </div>
+      ${
+        trackable
+          ? `<div class="resource-input">
+               <label>
+                 <span class="sr-only">Have ${material.item}</span>
+                 <input type="number" min="0" max="${max}" step="1" value="${have}" data-storage-key="${key}" />
+               </label>
+             </div>`
+          : ''
+      }
+    `;
+
+    const resourceImg = row.querySelector('img');
+    if (resourceImg) {
+      resourceImg.addEventListener(
+        'error',
+        () => {
+          resourceImg.src = FALLBACK_MEDIA.image;
+          resourceImg.alt = FALLBACK_MEDIA.alt;
+        },
+        { once: true }
+      );
+    }
+
+    return row;
+  };
+
+  const renderLevelCard = (station, level) => {
+    const { totalRequired, totalRemaining, progress } = calculateLevelTotals(station, level);
+    const roman = Utils.toRoman(level.level);
+    const levelCard = Utils.createElement('article', {
+      className: `station-level${totalRemaining === 0 || totalRequired === 0 ? ' complete' : ''}`,
+      attrs: {
+        'data-station-id': station.id,
+        'data-station-name': station.name,
+        'data-level-number': level.level,
+        'data-level-id': String(level.level),
+        'data-total-required': totalRequired,
+        'data-total-remaining': totalRemaining
+      }
+    });
+
+    const levelLabel = level.label ?? `Level ${level.level}`;
+    const levelIndex = roman || level.level;
+
+    const header = Utils.createElement('header', { className: 'station-level-headline' });
+    header.innerHTML = `
+      <div class="station-level-heading">
+        <span class="station-level-index">${levelIndex}</span>
+        <h4 class="station-level-title">${levelLabel}</h4>
+      </div>
+      <div class="station-level-progress">
+        <div class="station-level-progress-bar"><span style="width: ${progress}%"></span></div>
+        <span class="station-level-progress-value">${progress}% complete</span>
+      </div>
+    `;
+
+    const resourcesSection = Utils.createElement('div', { className: 'station-resources' });
+    resourcesSection.innerHTML = '<h5><i class="fa-solid fa-boxes-stacked"></i> Required Resources</h5>';
+
+    const list = Utils.createElement('ul', { className: 'resource-list' });
+    const materials = Array.isArray(level.materials) ? level.materials : [];
+    if (materials.length) {
+      materials.forEach((material) => {
+        const row = renderResourceRow(station, level, material);
+        list.appendChild(row);
+      });
+    } else {
+      list.appendChild(
+        Utils.createElement('li', {
+          className: 'resource-empty',
+          text: 'No materials required for this level.'
+        })
+      );
+    }
+    resourcesSection.appendChild(list);
+
+    const status = Utils.createElement('div', {
+      className: `station-level-status ${totalRemaining === 0 || totalRequired === 0 ? 'station-level-status--ready' : 'station-level-status--missing'}`,
+      html: buildStatusMarkup(totalRemaining, totalRequired)
+    });
+
+    levelCard.append(header, resourcesSection, status);
+    return levelCard;
+  };
+
+  const renderStation = (station) => {
+    const trackedLevels = (station.levels ?? [])
+      .filter((level) => Number(level.level) !== 1)
+      .sort((a, b) => Number(a.level) - Number(b.level));
+
+    if (!trackedLevels.length) {
+      return null;
+    }
+
+    const card = Utils.createElement('section', {
+      className: 'station-card',
+      attrs: {
+        'data-station-id': station.id,
+        'data-station-name': station.name
+      }
+    });
+
+    if (station.accentColor) {
+      card.style.setProperty('--station-accent', station.accentColor);
+    }
+
+    const header = Utils.createElement('div', { className: 'station-header' });
+    header.innerHTML = `
+      <div class="station-headline">
+        <span class="station-meta"><i class="fa-solid ${station.icon}"></i> Workshop Station</span>
+        <h3 class="station-title">${station.name}</h3>
+      </div>
+    `;
+
+    let select = null;
+    if (trackedLevels.length > 1) {
+      const selector = Utils.createElement('label', {
+        className: 'station-level-selector',
+        html: `
+          <span class="selector-label">Level</span>
+          <select class="station-level-picker" aria-label="Select upgrade level for ${station.name}"></select>
+        `
+      });
+
+      select = selector.querySelector('select');
+      trackedLevels.forEach((level) => {
+        const option = document.createElement('option');
+        option.value = String(level.level);
+        option.textContent = level.label ? level.label : `Level ${Utils.toRoman(level.level) || level.level}`;
+        select.appendChild(option);
+      });
+
+      header.appendChild(selector);
+    }
+
+    const levels = Utils.createElement('div', { className: 'station-levels' });
+    trackedLevels.forEach((level) => {
+      const levelCard = renderLevelCard(station, level);
+      levels.appendChild(levelCard);
+    });
+
+    const storageKey = `workshop:${station.id}:selectedLevel`;
+    const storedLevel = StorageManager.get(storageKey, String(trackedLevels[0].level));
+
+    const updateVisibleLevel = (levelValue) => {
+      const target = trackedLevels.find((level) => String(level.level) === levelValue);
+      const fallbackValue = String(trackedLevels[0].level);
+      const finalValue = target ? levelValue : fallbackValue;
+      Array.from(levels.children).forEach((node) => {
+        const isActive = node.getAttribute('data-level-id') === finalValue;
+        node.classList.toggle('active', isActive);
+      });
+      if (select && select.value !== finalValue) {
+        select.value = finalValue;
+      }
+    };
+
+    const initialLevel = String(storedLevel);
+    updateVisibleLevel(initialLevel);
+
+    if (select) {
+      select.value = initialLevel;
+      select.addEventListener('change', (event) => {
+        const value = event.target.value;
+        StorageManager.set(storageKey, value);
+        updateVisibleLevel(value);
+      });
+    }
+
+    card.append(header, levels);
+    return card;
+  };
+
+  const updateMaterial = (input) => {
+    const { storageKey } = input.dataset;
+    const max = Number(input.max);
+    const value = Utils.clamp(Number(input.value) || 0, 0, max);
+    input.value = value;
+    StorageManager.set(storageKey, value);
+
+    const row = input.closest('.resource-item');
+    if (!row) return;
+
+    const remaining = Math.max(max - value, 0);
+    const percentage = max ? (value / max) * 100 : 0;
+    row.dataset.current = value;
+    row.dataset.remaining = remaining;
+    row.classList.toggle('complete', remaining === 0);
+
+    const haveLabel = row.querySelector('.resource-have');
+    if (haveLabel) haveLabel.textContent = value;
+
+    const progressBar = row.querySelector('.resource-progress span');
+    if (progressBar) progressBar.style.width = `${percentage}%`;
+
+    const levelCard = row.closest('.station-level');
+    if (!levelCard) return;
+
+    const trackableRows = Array.from(levelCard.querySelectorAll('.resource-item.trackable'));
+    const totals = trackableRows.reduce(
+      (acc, item) => {
+        const required = Number(item.dataset.required || 0);
+        const current = Math.min(Number(item.dataset.current || 0), required);
+        return {
+          required: acc.required + required,
+          remaining: acc.remaining + Math.max(required - current, 0)
+        };
+      },
+      { required: 0, remaining: 0 }
+    );
+
+    const newRemaining = totals.remaining;
+    const progress = totals.required
+      ? Math.round(((totals.required - newRemaining) / totals.required) * 100)
+      : 100;
+
+    levelCard.dataset.totalRemaining = newRemaining;
+    levelCard.dataset.totalRequired = totals.required;
+
+    const progressBarEl = levelCard.querySelector('.station-level-progress-bar span');
+    if (progressBarEl) progressBarEl.style.width = `${progress}%`;
+    const progressValue = levelCard.querySelector('.station-level-progress-value');
+    if (progressValue) progressValue.textContent = `${progress}% complete`;
+
+    const status = levelCard.querySelector('.station-level-status');
+    if (status) {
+      const ready = totals.required === 0 ? true : newRemaining === 0;
+      status.classList.toggle('station-level-status--ready', ready);
+      status.classList.toggle('station-level-status--missing', !ready);
+      status.innerHTML = buildStatusMarkup(newRemaining, totals.required);
+    }
+
+    const wasComplete = levelCard.classList.contains('complete');
+    const isComplete = totals.required === 0 ? true : newRemaining === 0;
+    levelCard.classList.toggle('complete', isComplete);
+
+    if (!wasComplete && isComplete && totals.required > 0 && trackableRows.length > 0) {
+      const stationName = levelCard.dataset.stationName || 'Workshop';
+      const levelNumber = Number(levelCard.dataset.levelNumber || 0);
+      const levelLabel = Utils.toRoman(levelNumber) || `Level ${levelNumber}`;
+      Notifier.push(`${stationName} ${levelLabel} complete!`);
+    }
+  };
+
+  const bindInputs = (scope) => {
+    scope.querySelectorAll('input[data-storage-key]').forEach((input) => {
+      input.addEventListener('input', () => updateMaterial(input));
+    });
+  };
+
+  const init = () => {
+    container.innerHTML = '';
+    DataRepository.workshopStations.forEach((station) => {
+      const card = renderStation(station);
+      if (card) {
+        container.appendChild(card);
+        bindInputs(card);
+      }
+    });
+  };
+
+  return { init };
+})();
+
+
+// QuestView manages quest rendering, filtering, persistence and completion logic.
+const QuestView = (() => {
+  const container = document.getElementById('quest-grid');
+  const searchInput = document.getElementById('quest-search');
+  const traderFilter = document.getElementById('quest-trader-filter');
+  const incompleteOnlyToggle = document.getElementById('quest-incomplete-only');
+  const traderMeta = DataRepository.traderMeta ?? {};
+  const mapVisuals = DataRepository.mapVisuals ?? {};
+  const FILTER_KEY = 'quest:filters';
+  let activeFilters = StorageManager.get(FILTER_KEY, {
+    search: '',
+    trader: 'all',
+    incompleteOnly: false
+  });
+
+  const buildObjectiveKey = (questId, index) => Utils.formatKey('quest', questId, index);
+
+  const computeQuestProgress = (quest) => {
+    const totalObjectives = quest.objectives.length;
+    if (!totalObjectives) return 0;
+    const completedCount = quest.objectives.reduce((total, _objective, index) => {
+      const key = buildObjectiveKey(quest.id, index);
+      return total + (StorageManager.get(key, false) ? 1 : 0);
+    }, 0);
+    return Math.round((completedCount / totalObjectives) * 100);
+  };
+
+  const renderQuestCard = (quest) => {
+    const card = Utils.createElement('article', {
+      className: 'card quest-card open',
+      attrs: {
+        'data-trader': quest.trader,
+        'data-quest-id': quest.id
+      }
+    });
+    const progress = computeQuestProgress(quest);
+    const traderDetails = traderMeta[quest.trader] ?? { icon: 'fa-user', color: 'var(--color-accent)' };
+    const mapChips = quest.maps
+      .map((location) => `<span class="map-chip">${location}</span>`)
+      .join('');
+    const primaryMap = Array.isArray(quest.maps) ? quest.maps[0] : undefined;
+    const questVisual = Array.isArray(quest.maps)
+      ? quest.maps.map((map) => mapVisuals[map]).find(Boolean)
+      : null;
+    const questMapLabel = questVisual?.label ?? primaryMap ?? 'ARC Raiders';
+    const visualAlt = questVisual?.alt ?? `${questMapLabel} location from ARC Raiders`;
+    const media = questVisual
+      ? `<figure class="card-media quest-media">
+          <img src="${questVisual.url}" alt="${visualAlt}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
+          <figcaption>${questMapLabel}</figcaption>
+        </figure>`
+      : '';
+
+    card.innerHTML = `
+      ${media}
+      <div class="card-header" role="button" tabindex="0" aria-expanded="true" style="--trader-accent: ${traderDetails.color}">
+        <h3><i class="fa-solid ${quest.icon}"></i> ${quest.name}</h3>
+        <div class="quest-meta">
+          <span class="trader-badge"><i class="fa-solid ${traderDetails.icon}"></i> ${quest.trader}</span>
+          <span>${progress}%</span>
+        </div>
+        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
+      </div>
+      <div class="card-body"></div>
+    `;
+    const body = card.querySelector('.card-body');
+    const list = Utils.createElement('div', { className: 'quest-objectives' });
+
+    quest.objectives.forEach((objective, index) => {
+      const key = buildObjectiveKey(quest.id, index);
+      const isComplete = StorageManager.get(key, false);
+      const row = Utils.createElement('label', { className: 'quest-objective' });
+      row.innerHTML = `
+        <input type="checkbox" ${isComplete ? 'checked' : ''} data-storage-key="${key}" />
+        <span>${objective}</span>
+      `;
+      list.appendChild(row);
+    });
+
+    const progressBar = Utils.createElement('div', { className: 'progress-bar' });
+    progressBar.innerHTML = `<span style="width: ${progress}%"></span>`;
+
+    const maps = Utils.createElement('div', {
+      className: 'quest-maps',
+      html: `<i class="fa-solid fa-map-location-dot"></i> ${mapChips || '<span class="map-chip">Any</span>'}`
+    });
+
+    const rewards = Utils.createElement('p', {
+      className: 'quest-rewards',
+      html: `<i class="fa-solid fa-gift"></i> Rewards: ${quest.rewards.join(', ')}`
+    });
+
+    const resetButton = Utils.createElement('button', {
+      className: 'text-button quest-reset',
+      text: 'Reset quest progress',
+      attrs: { type: 'button' }
+    });
+
+    resetButton.addEventListener('click', () => resetQuestProgress(quest, card));
+
+    body.append(list, progressBar, maps, rewards, resetButton);
+
+    const header = card.querySelector('.card-header');
+    const toggle = () => {
+      const isOpen = card.classList.toggle('open');
+      header.setAttribute('aria-expanded', String(isOpen));
+      card.classList.toggle('collapsed', !isOpen);
+      body.style.maxHeight = isOpen ? `${body.scrollHeight + 16}px` : '0';
+      body.style.paddingTop = isOpen ? 'var(--space-sm)' : '0';
+    };
+
+    header.addEventListener('click', toggle);
+    header.addEventListener('keypress', (event) => {
+      if (event.key === 'Enter' || event.key === ' ') {
+        event.preventDefault();
+        toggle();
+      }
+    });
+
+    updateQuestCompletionState(card, progress);
+    return card;
+  };
+
+  const resetQuestProgress = (quest, card) => {
+    quest.objectives.forEach((_, index) => {
+      const key = buildObjectiveKey(quest.id, index);
+      StorageManager.set(key, false, { debounce: 0 });
+      const input = card.querySelector(`input[data-storage-key="${key}"]`);
+      if (input) input.checked = false;
+    });
+
+    const progress = computeQuestProgress(quest);
+    updateQuestCompletionState(card, progress);
+    applyFilters(activeFilters);
+    Notifier.push(`${quest.name} progress reset.`);
+  };
+
+  const updateQuestCompletionState = (card, progress) => {
+    const wasComplete = card.classList.contains('complete');
+    card.classList.toggle('complete', progress === 100);
+    const meta = card.querySelector('.quest-meta span:last-child');
+    if (meta) meta.textContent = `${progress}%`;
+    const progressBar = card.querySelector('.progress-bar span');
+    if (progressBar) progressBar.style.width = `${progress}%`;
+    if (progress === 100 && !wasComplete) {
+      const questName = card.querySelector('h3').textContent.replace(/\s{2,}/g, ' ').trim();
+      Notifier.push(`${questName} complete!`);
+    }
+  };
+
+  const applyFilters = (filters = activeFilters) => {
+    const nextFilters = {
+      search: filters.search || '',
+      trader: filters.trader || 'all',
+      incompleteOnly: Boolean(filters.incompleteOnly)
+    };
+
+    const traderExists = Array.from(traderFilter.options).some(
+      (option) => option.value === nextFilters.trader
+    );
+    if (!traderExists) {
+      nextFilters.trader = 'all';
+    }
+
+    activeFilters = nextFilters;
+
+    const searchTerm = nextFilters.search.toLowerCase();
+
+    searchInput.value = nextFilters.search;
+    traderFilter.value = nextFilters.trader;
+    incompleteOnlyToggle.checked = nextFilters.incompleteOnly;
+
+    const cards = Array.from(container.children);
+    cards.forEach((card) => {
+      const title = card.querySelector('h3').textContent.toLowerCase();
+      const traderName = card.dataset.trader;
+      const progressBar = card.querySelector('.progress-bar span');
+      const progress = parseInt(progressBar.style.width, 10);
+      const matchesSearch = !searchTerm || title.includes(searchTerm);
+      const matchesTrader = activeFilters.trader === 'all' || traderName === activeFilters.trader;
+      const matchesCompletion = !activeFilters.incompleteOnly || progress < 100;
+      card.style.display = matchesSearch && matchesTrader && matchesCompletion ? 'flex' : 'none';
+    });
+  };
+
+  const handleObjectiveChange = (checkbox) => {
+    const key = checkbox.dataset.storageKey;
+    const value = checkbox.checked;
+    StorageManager.set(key, value, { debounce: 0 });
+    const card = checkbox.closest('.quest-card');
+    const questId = card.dataset.questId;
+    const quest = DataRepository.quests.find((item) => item.id === questId);
+    if (!quest) return;
+    const progress = computeQuestProgress(quest);
+    updateQuestCompletionState(card, progress);
+    applyFilters(activeFilters);
+  };
+
+  const bindInteractions = () => {
+    container.querySelectorAll('input[data-storage-key]').forEach((checkbox) => {
+      checkbox.addEventListener('change', () => handleObjectiveChange(checkbox));
+    });
+
+    const persistFilters = () => {
+      const state = {
+        search: searchInput.value,
+        trader: traderFilter.value,
+        incompleteOnly: incompleteOnlyToggle.checked
+      };
+      applyFilters(state);
+      StorageManager.set(FILTER_KEY, state, { debounce: 0 });
+    };
+
+    searchInput.addEventListener('input', persistFilters);
+    traderFilter.addEventListener('change', persistFilters);
+    incompleteOnlyToggle.addEventListener('change', persistFilters);
+  };
+
+  const populateTraderFilter = () => {
+    while (traderFilter.options.length > 1) {
+      traderFilter.remove(1);
+    }
+    const traders = new Set(DataRepository.quests.map((quest) => quest.trader));
+    traders.forEach((trader) => {
+      const option = Utils.createElement('option', { text: trader, attrs: { value: trader } });
+      traderFilter.appendChild(option);
+    });
+  };
+
+  const init = () => {
+    container.innerHTML = '';
+    DataRepository.quests.forEach((quest) => {
+      const card = renderQuestCard(quest);
+      container.appendChild(card);
+      const body = card.querySelector('.card-body');
+      body.style.maxHeight = `${body.scrollHeight + 16}px`;
+    });
+    populateTraderFilter();
+    bindInteractions();
+    activeFilters = StorageManager.get(FILTER_KEY, activeFilters);
+    applyFilters(activeFilters);
+  };
+
+  return { init };
+})();
+
+// SkillView presents the community-sourced skill planner with branching layout and point tracking.
+const SkillView = (() => {
+  const container = document.getElementById('skill-phases');
+  const totalDisplay = document.getElementById('skill-points-total');
+  const MAX_POINTS = 75;
+  const STORAGE_KEY = 'skills:selected';
+  const TOOLTIP_DELAY = 150;
+  const activeTooltips = new Map();
+  let overPointCap = false;
+
+  const getSelected = () => StorageManager.get(STORAGE_KEY, {});
+
+  const setSelected = (value) => StorageManager.set(STORAGE_KEY, value);
+
+  const renderNode = (node, branch) => {
+    const selected = getSelected();
+    const isChecked = Boolean(selected[node.id]);
+    const item = Utils.createElement('div', {
+      className: `skill-node${isChecked ? ' completed' : ''}`,
+      attrs: {
+        'data-skill-id': node.id,
+        'data-branch-id': branch.id,
+        'data-skill-cost': node.cost
+      }
+    });
+
+    item.innerHTML = `
+      <div class="skill-node-header">
+        <span class="skill-order">${node.order}</span>
+        <div class="skill-node-title">
+          <h4>${node.name}</h4>
+          <p>${node.focus}</p>
+        </div>
+        <div class="skill-node-actions">
+          <button class="icon-button info" type="button" aria-label="Skill info" data-skill-id="${node.id}">
+            <i class="fa-solid fa-circle-info"></i>
+          </button>
+          <label>
+            <span class="sr-only">Mark ${node.name} acquired</span>
+            <input type="checkbox" ${isChecked ? 'checked' : ''} data-skill-id="${node.id}" data-branch-id="${branch.id}" />
+          </label>
+        </div>
+      </div>
+    `;
+
+    item.dataset.skillDescription = node.description;
+    item.dataset.skillFocus = node.focus;
+    item.dataset.skillCommunity = node.community;
+    item.dataset.skillOrder = node.order;
+    item.dataset.skillCost = node.cost;
+
+    return item;
+  };
+
+  const renderBranch = (branch) => {
+    const section = Utils.createElement('section', {
+      className: 'skill-branch',
+      attrs: { 'data-branch-id': branch.id }
+    });
+    section.style.setProperty('--branch-color', branch.color ?? 'var(--color-accent)');
+    const nodesContainer = Utils.createElement('div', { className: 'skill-branch-track' });
+
+    const sourceMarkup = branch.source
+      ? `<span class="skill-branch-source"><i class="fa-solid fa-users"></i> ${branch.source}</span>`
+      : '';
+
+    const progressMeta = `
+      <div class="skill-branch-meta">
+        <span class="skill-branch-progress" data-branch-progress>${branch.nodes.length} steps</span>
+        ${sourceMarkup}
+      </div>
+    `;
+
+    section.innerHTML = `
+      <header class="skill-branch-header">
+        <div class="skill-branch-title">
+          <h3><i class="fa-solid ${branch.icon}"></i> ${branch.name}</h3>
+          <p>${branch.summary}</p>
+        </div>
+        ${progressMeta}
+      </header>
+    `;
+
+    branch.nodes.forEach((node) => nodesContainer.appendChild(renderNode(node, branch)));
+    section.appendChild(nodesContainer);
+    return section;
+  };
+
+  const calculatePoints = () => {
+    const selected = getSelected();
+    const total = DataRepository.skillBranches
+      .flatMap((branch) => branch.nodes)
+      .filter((node) => selected[node.id])
+      .reduce((sum, node) => sum + Number(node.cost || 0), 0);
+    totalDisplay.textContent = total;
+    const isOverCap = total > MAX_POINTS;
+    totalDisplay.classList.toggle('warning', isOverCap);
+    if (isOverCap && !overPointCap) {
+      Notifier.push(`Skill point cap exceeded by ${total - MAX_POINTS}!`);
+    }
+    overPointCap = isOverCap;
+  };
+
+  const updateBranchProgress = (branchId) => {
+    const branch = container.querySelector(`.skill-branch[data-branch-id="${branchId}"]`);
+    if (!branch) return;
+    const nodes = Array.from(branch.querySelectorAll('.skill-node'));
+    const completed = nodes.filter((node) => node.classList.contains('completed')).length;
+    const total = nodes.length;
+    const progress = branch.querySelector('[data-branch-progress]');
+    if (progress) {
+      progress.textContent = `${completed}/${total} steps`;
+    }
+    branch.classList.toggle('complete', completed === total && total > 0);
+  };
+
+  const updateAllBranches = () => {
+    DataRepository.skillBranches.forEach((branch) => updateBranchProgress(branch.id));
+  };
+
+  const toggleSkill = (checkbox) => {
+    const selected = getSelected();
+    const skillId = checkbox.dataset.skillId;
+    if (checkbox.checked) {
+      selected[skillId] = true;
+    } else {
+      delete selected[skillId];
+    }
+    setSelected(selected);
+    const node = checkbox.closest('.skill-node');
+    node.classList.toggle('completed', checkbox.checked);
+    updateBranchProgress(checkbox.dataset.branchId);
+    calculatePoints();
+  };
+
+  const hideTooltip = (id) => {
+    const tooltip = activeTooltips.get(id);
+    if (tooltip) {
+      tooltip.remove();
+      activeTooltips.delete(id);
+    }
+  };
+
+  const showTooltip = (button) => {
+    const node = button.closest('.skill-node');
+    const id = node.dataset.skillId;
+    if (activeTooltips.has(id)) {
+      hideTooltip(id);
+      return;
+    }
+
+    const tooltip = Utils.createElement('div', { className: 'skill-tooltip' });
+    const description = node.dataset.skillDescription;
+    const focus = node.dataset.skillFocus;
+    const community = node.dataset.skillCommunity;
+    const order = node.dataset.skillOrder;
+    const cost = node.dataset.skillCost;
+
+    tooltip.innerHTML = `
+      <h5>${node.querySelector('h4').textContent}</h5>
+      <p>${description}</p>
+      <dl class="skill-tooltip-details">
+        <dt>Focus</dt>
+        <dd>${focus}</dd>
+        <dt>Community insight</dt>
+        <dd>${community}</dd>
+        <dt>Recommended tier</dt>
+        <dd>${order}</dd>
+        <dt>Point cost</dt>
+        <dd>${cost}</dd>
+      </dl>
+    `;
+
+    node.appendChild(tooltip);
+    activeTooltips.set(id, tooltip);
+    document.addEventListener(
+      'click',
+      (event) => {
+        if (!node.contains(event.target)) {
+          hideTooltip(id);
+        }
+      },
+      { once: true }
+    );
+  };
+
+  const bindInteractions = () => {
+    container.querySelectorAll('input[data-skill-id]').forEach((checkbox) => {
+      checkbox.addEventListener('change', () => toggleSkill(checkbox));
+    });
+
+    container.querySelectorAll('button.info').forEach((button) => {
+      let timer;
+      button.addEventListener('click', () => showTooltip(button));
+      button.addEventListener('focus', () => {
+        timer = setTimeout(() => showTooltip(button), TOOLTIP_DELAY);
+      });
+      button.addEventListener('blur', () => {
+        clearTimeout(timer);
+        const node = button.closest('.skill-node');
+        hideTooltip(node.dataset.skillId);
+      });
+    });
+  };
+
+  const init = () => {
+    activeTooltips.forEach((tooltip) => tooltip.remove());
+    activeTooltips.clear();
+    overPointCap = false;
+    container.innerHTML = '';
+
+    const tree = Utils.createElement('div', { className: 'skill-tree' });
+    DataRepository.skillBranches.forEach((branch) => tree.appendChild(renderBranch(branch)));
+    container.appendChild(tree);
+
+    bindInteractions();
+    calculatePoints();
+    updateAllBranches();
+  };
+
+  return { init, calculatePoints };
+})();
+// DataTransfer enables exporting/importing the saved progress to JSON files.
+const DataTransfer = (() => {
+  const exportButton = document.getElementById('export-data');
+  const importInput = document.getElementById('import-data');
+
+  const download = (filename, content) => {
+    const blob = new Blob([content], { type: 'application/json' });
+    const url = URL.createObjectURL(blob);
+    const link = document.createElement('a');
+    link.href = url;
+    link.download = filename;
+    document.body.appendChild(link);
+    link.click();
+    document.body.removeChild(link);
+    URL.revokeObjectURL(url);
+  };
+
+  const init = () => {
+    exportButton.addEventListener('click', () => {
+      const data = StorageManager.snapshot();
+      download(`arc-raiders-progress-${new Date().toISOString()}.json`, JSON.stringify(data, null, 2));
+      Notifier.push('Progress exported to JSON.');
+    });
+
+    importInput.addEventListener('change', (event) => {
+      const [file] = event.target.files;
+      if (!file) return;
+      const reader = new FileReader();
+      reader.onload = () => {
+        try {
+          const data = JSON.parse(reader.result);
+          StorageManager.hydrate(data);
+          WorkshopView.init();
+          QuestView.init();
+          SkillView.init();
+          Notifier.push('Progress imported successfully.');
+        } catch (error) {
+          console.error('Import failed', error);
+          Notifier.push('Failed to import data. Ensure the file is valid JSON.');
+        }
+      };
+      reader.readAsText(file);
+      importInput.value = '';
+    });
+  };
+
+  return { init };
+})();
+
+// Bootstraps the application once the DOM is ready.
+const App = (() => {
+  const init = () => {
+    ThemeController.init();
+    NavigationController.init();
+    WorkshopView.init();
+    QuestView.init();
+    SkillView.init();
+    DataTransfer.init();
+  };
+  return { init };
+})();
+
+if (document.readyState !== 'loading') {
+  App.init();
+} else {
+  window.addEventListener('DOMContentLoaded', App.init);
+}
)
