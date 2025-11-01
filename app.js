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
      id: 'gunsmith',
      name: 'Gunsmith',
      icon: 'fa-gun',
      levels: [
        {
          level: 1,
          name: 'Calibrated Tools',
          materials: [
            { item: 'Alloy Plates', quantity: 30 },
            { item: 'Refined Oil', quantity: 12 },
            { item: 'Steel Bolts', quantity: 18 }
          ]
        },
        {
          level: 2,
          name: 'Precision Jigs',
          materials: [
            { item: 'Composite Frames', quantity: 24 },
            { item: 'Titanium Rods', quantity: 12 },
            { item: 'Flux Capacitors', quantity: 6 }
          ]
        },
        {
          level: 3,
          name: 'Prototype Suite',
          materials: [
            { item: 'Charged Coils', quantity: 14 },
            { item: 'Rare Alloy', quantity: 9 },
            { item: 'Calibrated Optics', quantity: 4 }
          ]
        }
      ]
    },
    {
      id: 'gear-bench',
      name: 'Gear Bench',
      icon: 'fa-toolbox',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Fiber Mesh', quantity: 20 },
            { item: 'Flex Cables', quantity: 16 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Composite Webbing', quantity: 30 },
            { item: 'Nano Thread', quantity: 18 },
            { item: 'Armor Plates', quantity: 12 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Phase Weave', quantity: 16 },
            { item: 'Titan Weave', quantity: 12 },
            { item: 'Reinforced Clasps', quantity: 18 }
          ]
        }
      ]
    },
    {
      id: 'medical-lab',
      name: 'Medical Lab',
      icon: 'fa-briefcase-medical',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Sterile Gel', quantity: 15 },
            { item: 'Biofoam', quantity: 9 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Nanite Clusters', quantity: 12 },
            { item: 'Synth Enzymes', quantity: 15 },
            { item: 'Med Synth', quantity: 9 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Cell Rebuilders', quantity: 6 },
            { item: 'Stasis Field', quantity: 3 },
            { item: 'Cure Catalyst', quantity: 10 }
          ]
        }
      ]
    },
    {
      id: 'explosives-station',
      name: 'Explosives Station',
      icon: 'fa-bomb',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Det Cord', quantity: 20 },
            { item: 'Stabilised Powder', quantity: 12 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Reactive Gel', quantity: 18 },
            { item: 'Trigger Nodes', quantity: 8 },
            { item: 'Blast Casings', quantity: 14 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Quantum Fuse', quantity: 5 },
            { item: 'Plasma Core', quantity: 4 },
            { item: 'Containment Shell', quantity: 6 }
          ]
        }
      ]
    },
    {
      id: 'utility-station',
      name: 'Utility Station',
      icon: 'fa-screwdriver',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Circuit Boards', quantity: 18 },
            { item: 'Charged Cells', quantity: 10 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Servo Motors', quantity: 16 },
            { item: 'Sensor Array', quantity: 8 },
            { item: 'Smart Chips', quantity: 12 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Adaptive AI Core', quantity: 4 },
            { item: 'Reactive Plating', quantity: 7 },
            { item: 'Stabilised Nanites', quantity: 9 }
          ]
        }
      ]
    },
    {
      id: 'refiner',
      name: 'Refiner',
      icon: 'fa-industry',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Raw Alloy', quantity: 24 },
            { item: 'Coolant Cells', quantity: 10 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Purified Carbon', quantity: 20 },
            { item: 'Catalyst Dust', quantity: 14 },
            { item: 'Heat Sinks', quantity: 10 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Flux Crystal', quantity: 8 },
            { item: 'Vented Core', quantity: 6 },
            { item: 'Quantum Coolant', quantity: 4 }
          ]
        }
      ]
    },
    {
      id: 'scrappy',
      name: 'Scrappy',
      icon: 'fa-robot',
      levels: [
        {
          level: 1,
          materials: [
            { item: 'Reclaimed Metal', quantity: 18 },
            { item: 'Salvage Wire', quantity: 16 }
          ]
        },
        {
          level: 2,
          materials: [
            { item: 'Arc Relics', quantity: 12 },
            { item: 'Memory Shards', quantity: 10 },
            { item: 'Synth Oil', quantity: 8 }
          ]
        },
        {
          level: 3,
          materials: [
            { item: 'Awakened Core', quantity: 4 },
            { item: 'Echo Lattice', quantity: 6 },
            { item: 'Soul Matrix', quantity: 3 }
          ]
        }
      ]
    }
  ];

  const quests = [
    {
      id: 'dawn-patrol',
      name: 'Dawn Patrol',
      trader: 'Siv',
      icon: 'fa-sunrise',
      objectives: [
        'Survey three crash zones in the Barrens',
        'Collect telemetry from a fallen ARC Scout',
        'Extract without triggering an alert'
      ],
      rewards: ['2,500 Credits', 'Siv Reputation +40']
    },
    {
      id: 'supply-chains',
      name: 'Supply Chains',
      trader: 'Warden',
      icon: 'fa-truck-ramp-box',
      objectives: [
        'Secure three supply pods',
        'Deliver supplies to the Refuge',
        'Defend the drop point for 90 seconds'
      ],
      rewards: ['3,200 Credits', 'Rare Gear Cache']
    },
    {
      id: 'signal-flare',
      name: 'Signal Flare',
      trader: 'Siv',
      icon: 'fa-signal',
      objectives: [
        'Power three relay towers',
        'Synchronise the transmission uplink',
        'Hold the uplink until the scan completes'
      ],
      rewards: ['3,800 Credits', 'ARC Intel Package']
    },
    {
      id: 'hard-reset',
      name: 'Hard Reset',
      trader: 'Brigg',
      icon: 'fa-microchip',
      objectives: [
        'Retrieve a corrupted AI core',
        'Stabilise it at a Workshop Bench',
        'Install the patch in a live Sentinel'
      ],
      rewards: ['5,000 Credits', 'Prototype Mod']
    },
    {
      id: 'night-harvest',
      name: 'Night Harvest',
      trader: 'Warden',
      icon: 'fa-cloud-moon',
      objectives: [
        'Hunt down 10 Dregs after sunset',
        'Disable a Raider extraction',
        'Extract with harvested energy cells'
      ],
      rewards: ['4,100 Credits', 'Warden Reputation +60']
    },
    {
      id: 'echo-of-ember',
      name: 'Echo of Ember',
      trader: 'Elda',
      icon: 'fa-fire-flame-curved',
      objectives: [
        'Collect three Ember cores',
        'Cleanse the cores in a Refiner',
        'Return to Elda without dying'
      ],
      rewards: ['Ancient Trinket', 'Elda Reputation +35']
    }
  ];

  const skillPhases = [
    {
      id: 'early',
      name: 'Early Phase',
      icon: 'fa-seedling',
      skills: [
        {
          id: 'dash-mastery',
          name: 'Dash Mastery',
          description: 'Reduces dash cooldown by 25% and grants brief immunity to slows.',
          cost: 6,
          prerequisites: 'None',
          type: 'Mobility'
        },
        {
          id: 'field-medic',
          name: 'Field Medic',
          description: 'Revive allies 30% faster and restore additional health on revive.',
          cost: 5,
          prerequisites: 'Medical Lab Lv.1',
          type: 'Survival'
        },
        {
          id: 'calibrated-shot',
          name: 'Calibrated Shot',
          description: 'First shot after sprinting deals 35% more damage.',
          cost: 4,
          prerequisites: 'Gunsmith Lv.1',
          type: 'Conditioning'
        }
      ]
    },
    {
      id: 'mid',
      name: 'Mid Phase',
      icon: 'fa-timeline',
      skills: [
        {
          id: 'adaptive-shield',
          name: 'Adaptive Shield',
          description: 'Gain an overshield when your health drops below 30% once per encounter.',
          cost: 8,
          prerequisites: 'Utility Station Lv.2',
          type: 'Survival'
        },
        {
          id: 'kinetic-reserve',
          name: 'Kinetic Reserve',
          description: 'Store excess stamina to unleash a powerful knockback melee attack.',
          cost: 7,
          prerequisites: 'Dash Mastery',
          type: 'Mobility'
        },
        {
          id: 'payload-specialist',
          name: 'Payload Specialist',
          description: 'Explosives deal 20% more damage and create lingering burn fields.',
          cost: 9,
          prerequisites: 'Explosives Station Lv.2',
          type: 'Conditioning'
        }
      ]
    },
    {
      id: 'late',
      name: 'Late Phase',
      icon: 'fa-jet-fighter-up',
      skills: [
        {
          id: 'arc-overdrive',
          name: 'ARC Overdrive',
          description: 'Temporarily double ability damage and movement speed after a finisher.',
          cost: 12,
          prerequisites: 'Kinetic Reserve',
          type: 'Mobility'
        },
        {
          id: 'nanite-regrowth',
          name: 'Nanite Regrowth',
          description: 'Heal 3% health per second for 5 seconds after taking lethal damage once per mission.',
          cost: 11,
          prerequisites: 'Adaptive Shield',
          type: 'Survival'
        },
        {
          id: 'siege-architect',
          name: 'Siege Architect',
          description: 'Place automated turrets with increased range and support drones.',
          cost: 10,
          prerequisites: 'Payload Specialist',
          type: 'Conditioning'
        }
      ]
    }
  ];

  return { workshopStations, quests, skillPhases };
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

  const renderMaterialRow = (station, level, material) => {
    const row = Utils.createElement('tr');
    const key = Utils.formatKey('workshop', station.id, level.level, material.item);
    const stored = StorageManager.get(key, 0);
    const have = Utils.clamp(Number(stored) || 0, 0, material.quantity);
    const levelId = Utils.formatKey(station.id, `lv${level.level}`);
    row.dataset.levelId = levelId;

    row.innerHTML = `
      <td>Lv.${level.level}</td>
      <td>${material.item}</td>
      <td>${material.quantity}</td>
      <td>
        <input type="number" min="0" max="${material.quantity}" step="1" value="${have}" class="material-input" data-storage-key="${key}" />
      </td>
      <td class="remaining">${material.quantity - have}</td>
      <td>
        <div class="material-progress"><span style="width: ${(have / material.quantity) * 100}%"></span></div>
      </td>
    `;

    return row;
  };

  const renderLevelFooter = (station, level) => {
    const footerRow = Utils.createElement('tr');
    footerRow.classList.add('level-footer');
    const levelId = Utils.formatKey(station.id, `lv${level.level}`);
    footerRow.dataset.levelFooter = levelId;
    footerRow.dataset.levelNumber = level.level;
    const remaining = level.materials.reduce((sum, material) => {
      const key = Utils.formatKey('workshop', station.id, level.level, material.item);
      const have = StorageManager.get(key, 0) || 0;
      return sum + (material.quantity - Math.min(have, material.quantity));
    }, 0);
    footerRow.innerHTML = `
      <td colspan="6">Remaining materials for Lv.${level.level}: <strong class="level-remaining">${remaining}</strong></td>
    `;
    footerRow.dataset.complete = String(remaining === 0);
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
      level.materials.forEach((material) => {
        tbody.appendChild(renderMaterialRow(station, level, material));
      });
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
    progressBar.style.width = `${(value / max) * 100}%`;

    const levelId = row.dataset.levelId;
    const tbody = row.parentElement;
    const footer = tbody.querySelector(`tr[data-level-footer="${levelId}"]`);
    if (footer) {
      const materialRows = Array.from(tbody.querySelectorAll(`tr[data-level-id="${levelId}"]`));
      const totalRemaining = materialRows.reduce((sum, materialRow) => {
        const remain = Number(materialRow.querySelector('.remaining')?.textContent ?? 0);
        return sum + remain;
      }, 0);
      const wasComplete = footer.dataset.complete === 'true';
      footer.querySelector('.level-remaining').textContent = totalRemaining;
      footer.dataset.complete = String(totalRemaining === 0);
      if (totalRemaining === 0 && !wasComplete) {
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
    card.innerHTML = `
      <div class="card-header" role="button" tabindex="0" aria-expanded="true">
        <h3><i class="fa-solid ${quest.icon}"></i> ${quest.name}</h3>
        <div class="quest-meta">
          <span><i class="fa-solid fa-user"></i> ${quest.trader}</span>
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

    const rewards = Utils.createElement('p', {
      className: 'quest-rewards',
      html: `<i class="fa-solid fa-gift"></i> Rewards: ${quest.rewards.join(', ')}`
    });

    body.append(list, progressBar, rewards);

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
        <span><i class="fa-solid fa-link"></i> ${skill.prerequisites}</span>
      </div>
    `;
    item.dataset.skillCost = skill.cost;
    item.dataset.skillId = skill.id;
    item.dataset.skillDescription = skill.description;
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
    const id = skillItem.dataset.skillId;
    if (activeTooltips.has(id)) {
      hideTooltip(id);
      return;
    }
    const tooltip = Utils.createElement('div', {
      className: 'skill-tooltip',
      text: description
    });
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
