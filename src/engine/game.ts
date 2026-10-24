// Core game engine: state initialization, game loop ticks, mining, combat, economy,
// offline progression, and progression helpers.

import type { GameState, ShipState, StarSystem, CelestialBody, CombatState, ResourceType, Mission, Automation, StationType } from '../types/game';
import { EMPTY_RESOURCES, STARTING_CREDITS, STARTING_ENERGY, STARTING_ENERGY_MAX, STARTING_SYSTEM_ID, OFFLINE_CAP_HOURS, SHIP_CLASSES, STATION_TEMPLATES } from './constants';
import { generateGalaxy } from './procedural';

const defaultShip = (gclass: any): ShipState => ({
  class: gclass,
  name: SHIP_CLASSES[gclass].label,
  baseCargo: SHIP_CLASSES[gclass].baseCargo,
  baseSpeed: SHIP_CLASSES[gclass].baseSpeed,
  baseMineEff: SHIP_CLASSES[gclass].baseMineEff,
  baseDefense: SHIP_CLASSES[gclass].baseDefense,
  baseScanner: SHIP_CLASSES[gclass].baseScanner,
  baseEnergy: SHIP_CLASSES[gclass].baseEnergy,
  upgrades: {},
  cargo: { ...EMPTY_RESOURCES },
  energy: STARTING_ENERGY
});

export const createInitialState = (seed: string = 'galaxy-tycoon'): GameState => {
  const systems = generateGalaxy(seed);
  return {
    version: '1.0.0',
    createdAt: Date.now(),
    lastSaved: Date.now(),
    playTime: 0,
    credits: STARTING_CREDITS,
    resources: { ...EMPTY_RESOURCES },
    energy: STARTING_ENERGY,
    energyMax: STARTING_ENERGY_MAX,
    ship: defaultShip('scout'),
    currentSystemId: STARTING_SYSTEM_ID,
    currentBodyId: undefined,
    galaxySeed: seed,
    systems,
    visitedSystemIds: [STARTING_SYSTEM_ID],
    discoveredAnomalyIds: [],
    ownedUpgrades: [],
    researchedTech: [],
    unlockedShips: ['scout'],
    missions: [],
    automations: [],
    achievements: {},
    combat: undefined,
    stats: {
      totalMined: { ...EMPTY_RESOURCES },
      totalCreditsEarned: 0,
      totalTimePlayed: 0,
      systemsVisited: 1,
      planetsDiscovered: 0,
      enemiesDefeated: 0,
      stationsBuilt: 0,
      technologiesResearched: 0
    }
  };
};

export const applyTick = (state: GameState, deltaSec: number): GameState => {
  if (state.energy < state.energyMax && state.ship.baseEnergy > 0) {
    state.energy = Math.min(state.energyMax, state.energy + state.ship.baseEnergy * deltaSec / 20);
  }
  const totalConsumption = state.automations.reduce((sum, a) => sum + a.energy * deltaSec / 5, 0);
  if (state.energy >= totalConsumption) {
    state.energy -= totalConsumption;
    state.automations.forEach((a) => {
      const rate = a.rate * (a.efficiency ?? 1.0) * deltaSec / 5;
      const produced = Math.floor(rate);
      if (produced > 0) {
        state.resources[a.produces] += produced;
      }
    });
  }
  if (state.combat && state.combat.active) {
    resolveCombatTick(state, deltaSec * 2);
  }
  return state;
};

export const computeOfflineProgress = (state: GameState, elapsedMs: number): { resources: Record<ResourceType, number>; credits: number; log: string } => {
  const elapsedSec = Math.min(elapsedMs / 1000, OFFLINE_CAP_HOURS * 3600);
  const produced: Record<ResourceType, number> = { ...EMPTY_RESOURCES };
  let credits = 0;

  state.automations.forEach((a) => {
    const rate = a.rate * (a.efficiency ?? 1.0) * elapsedSec / 5;
    produced[a.produces] += Math.floor(rate * 0.8);
  });

  credits = Math.floor((produced.iron + produced.titanium + produced.copper + produced.ice * 2 + produced.crystals * 3 + produced.rareElements * 5) * 0.8);
  const log = `While offline (${OFFLINE_CAP_HOURS}h cap): gained resources and ${credits} credits.`;
  return { resources: produced, credits, log };
};

export const applyOfflineProgress = (state: GameState, offline: { resources: Record<ResourceType, number>; credits: number }): void => {
  Object.keys(offline.resources).forEach((k) => {
    const rk = k as ResourceType;
    state.resources[rk] += offline.resources[rk];
    state.stats.totalMined[rk] += offline.resources[rk];
  });
  state.credits += offline.credits;
  state.stats.totalCreditsEarned += offline.credits;
};

export const mineBody = (state: GameState, body: CelestialBody, amount: number = 10): { mined: Record<ResourceType, number>; energyCost: number } => {
  const available = (Object.keys(body.resources) as ResourceType[]).filter((k) => (body.resources[k] ?? 0) > 0);
  if (available.length === 0) return { mined: { ...EMPTY_RESOURCES }, energyCost: 0 };

  const resToMine = available[Math.floor(Math.random() * available.length)];
  const existing = body.resources[resToMine] ?? 0;
  const actualAmt = Math.min(amount * state.ship.baseMineEff, existing);
  const energyCost = Math.min(state.energy, Math.round(actualAmt * 0.5));

  if (energyCost <= 0 || actualAmt <= 0) return { mined: { ...EMPTY_RESOURCES }, energyCost: 0 };

  state.energy -= energyCost;
  body.resources[resToMine] -= actualAmt;
  state.resources[resToMine] += actualAmt;
  state.stats.totalMined[resToMine] += actualAmt;

  return { mined: { ...EMPTY_RESOURCES, [resToMine]: Math.round(actualAmt) }, energyCost };
};

export const startCombat = (state: GameState, enemyType: 'pirate' | 'drone'): CombatState => {
  const enemyName = enemyType === 'pirate' ? 'Pirate Raider' : 'Hostile Drone';
  const isPirate = enemyType === 'pirate';
  const enemyHp = isPirate ? 40 + Math.floor(state.stats.enemiesDefeated * 2) : 25;
  const enemyShield = isPirate ? 15 : 8;
  const playerDef = Math.max(10, state.ship.baseDefense);
  return {
    active: true,
    enemyName,
    enemyShield,
    enemyMaxShield: enemyShield,
    enemyHp,
    enemyMaxHp: enemyHp,
    playerShield: Math.max(playerDef, 10),
    playerMaxShield: playerDef,
    playerHp: 100,
    playerMaxHp: 100,
    log: [`${enemyName} encountered!`, `Your ${state.ship.name} readies weapons.`],
    turn: 0
  };
};

const resolveCombatTick = (state: GameState, ticks: number): void => {
  const c = state.combat;
  if (!c || !c.active) return;
  for (let i = 0; i < Math.ceil(ticks); i++) {
    if (!c.active) break;
    const dmgToEnemy = Math.max(0, Math.round(state.ship.baseDefense * 0.6 + state.ship.baseDefense * 0.4 * Math.random()));
    if (c.enemyShield > 0) {
      c.enemyShield -= dmgToEnemy;
      if (c.enemyShield < 0) c.enemyShield = 0;
    } else {
      c.enemyHp -= dmgToEnemy;
    }
    c.log.push(`-- Player fires for ${dmgToEnemy} damage`);
    if (c.enemyHp <= 0) {
      c.active = false;
      c.log.push(`>> ${c.enemyName} destroyed! Victory!`);
      state.stats.enemiesDefeated += 1;
      state.energy = Math.max(0, state.energy - 10);
      state.credits += 200 + state.stats.enemiesDefeated * 20;
      state.stats.totalCreditsEarned += 200;
      return;
    }
    const dmgToPlayer = Math.max(0, Math.round(c.enemyMaxHp * 0.15 * Math.random() + c.enemyMaxShield * 0.1));
    if (c.playerShield > 0) {
      c.playerShield -= dmgToPlayer;
      if (c.playerShield < 0) c.playerShield = 0;
    } else {
      c.playerHp -= dmgToPlayer;
    }
    c.log.push(`-- ${c.enemyName} fires for ${dmgToPlayer} damage`);
    if (c.playerHp <= 0) {
      c.active = false;
      c.log.push(`>> Your ${state.ship.name} was destroyed! Emergency ejection.`);
      state.energy = Math.max(0, state.energy - 20);
      return;
    }
  }
};

export const canAfford = (state: GameState, cost: { credits: number; resources: Partial<Record<ResourceType, number>> }): boolean => {
  if (!cost || cost.credits < 0) return false;
  if (state.credits < cost.credits) return false;
  if (cost.resources) {
    for (const [k, v] of Object.entries(cost.resources)) {
      if ((state.resources[k as ResourceType] ?? 0) < v) return false;
    }
  }
  return true;
};

export const spend = (state: GameState, cost: { credits: number; resources: Partial<Record<ResourceType, number>> }): boolean => {
  if (!canAfford(state, cost)) return false;
  state.credits -= cost.credits;
  if (cost.resources) {
    for (const [k, v] of Object.entries(cost.resources)) {
      state.resources[k as ResourceType] -= v;
    }
  }
  return true;
};

export const clampResources = (state: GameState): void => {
  (Object.keys(state.resources) as ResourceType[]).forEach((k) => {
    if (state.resources[k] < 0) state.resources[k] = 0;
  });
  if (state.credits < 0) state.credits = 0;
  if (state.energy < 0) state.energy = 0;
};

export const travelTime = (state: GameState, from: StarSystem, to: StarSystem): number => {
  const dist = Math.hypot(from.x - to.x, from.y - to.y);
  const speed = state.ship.baseSpeed;
  return Math.max(1, Math.round(dist / (speed * 10)));
};

export const buildAutomation = (state: GameState, type: StationType): Automation | null => {
  const tpl = STATION_TEMPLATES[type];
  if (!tpl) return null;
  const cost = { credits: tpl.baseCostCredits, resources: tpl.baseCostResources };
  if (!spend(state, cost)) return null;
  const id = 'auto_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  return {
    id,
    type,
    name: tpl.label,
    level: 1,
    rate: tpl.baseRate,
    cost,
    produces: tpl.produces,
    consumes: tpl.consumes,
    energy: tpl.baseEnergy,
    efficiency: 1.0
  };
};

export const sellResources = (state: GameState, res: Partial<Record<ResourceType, number>>): { sold: Partial<Record<ResourceType, number>>; credits: number } => {
  const multi: Record<ResourceType, number> = { iron: 1, titanium: 1.5, copper: 2, ice: 2.5, crystals: 4, rareElements: 6 };
  let total = 0;
  const sold: Partial<Record<ResourceType, number>> = {};
  (Object.keys(res) as ResourceType[]).forEach((k) => {
    const amt = Math.min(state.resources[k], res[k] ?? 0);
    if (amt > 0) {
      state.resources[k] -= amt;
      const earned = Math.round(amt * multi[k]);
      total += earned;
      sold[k] = amt;
      state.stats.totalCreditsEarned += earned;
    }
  });
  state.credits += total;
  return { sold, credits: total };
};
