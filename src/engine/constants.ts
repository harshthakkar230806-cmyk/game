// Game data constants: ship specs, resource names, tech tree definitions, mission templates,
// procedural generation parameters, and static authored content (abandoned stations, artifacts).

export const SAVE_VERSION = '1.0.0';
export const SAVE_KEY = 'galaxy-tycoon-save';
export const SAVE_STORE = 'galaxy-tycoon-db';
export const SAVE_STORE_KEY = 'savegame';
export const OFFLINE_CAP_HOURS = 8;

export type ResourceType = 'iron' | 'titanium' | 'copper' | 'ice' | 'crystals' | 'rareElements';

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  iron: 'Iron', titanium: 'Titanium', copper: 'Copper', ice: 'Ice', crystals: 'Crystals', rareElements: 'Rare Elements'
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  iron: '#9ca3af', titanium: '#e5e7eb', copper: '#f97316', ice: '#7dd3fc', crystals: '#a781fa', rareElements: '#facc15'
};

export const EMPTY_RESOURCES: Record<ResourceType, number> = {
  iron: 0, titanium: 0, copper: 0, ice: 0, crystals: 0, rareElements: 0
};

export const STARTING_CREDITS = 500;
export const STARTING_ENERGY = 100;
export const STARTING_ENERGY_MAX = 100;

export type ShipClass = 'scout' | 'miner' | 'freighter' | 'explorer' | 'combat' | 'interstellar';
export type UpgradeType = 'engine' | 'laser' | 'cargo' | 'scanner' | 'shield' | 'weapon' | 'jumpDrive';
export type StationType = 'drone' | 'miningShip' | 'cargoVessel' | 'miningStation' | 'refinery' | 'lab';
export type MissionType = 'mine' | 'discover' | 'explore' | 'build' | 'combat' | 'research';
export type MissionStatus = 'available' | 'active' | 'completed';
export type TechBranch = 'engineering' | 'automation' | 'exploration' | 'energy' | 'alien';

export interface ShipState {
  class: ShipClass;
  name: string;
  baseCargo: number;
  baseSpeed: number;
  baseMineEff: number;
  baseDefense: number;
  baseScanner: number;
  baseEnergy: number;
  upgrades: Partial<Record<UpgradeType, number>>;
  cargo: Record<ResourceType, number>;
  energy: number;
}

export interface CombatState {
  active: boolean;
  enemyName: string;
  enemyShield: number;
  enemyMaxShield: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerShield: number;
  playerMaxShield: number;
  playerHp: number;
  playerMaxHp: number;
  log: string[];
  turn: number;
}

export interface GameStats {
  totalMined: Record<ResourceType, number>;
  totalCreditsEarned: number;
  totalTimePlayed: number;
  systemsVisited: number;
  planetsDiscovered: number;
  enemiesDefeated: number;
  stationsBuilt: number;
  technologiesResearched: number;
}

export interface Mission {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  status: MissionStatus;
  progress: number;
  target: number;
  reward: { credits: number; resources: Partial<Record<ResourceType, number>>; unlock?: string };
  expiry?: number;
}

export interface Automation {
  id: string;
  type: StationType;
  name: string;
  level: number;
  rate: number;
  cost: { credits: number; resources: Partial<Record<ResourceType, number>> };
  produces: ResourceType;
  consumes: ResourceType;
  energy: number;
  efficiency: number;
}

export interface GameState {
  version: string;
  createdAt: number;
  lastSaved: number;
  playTime: number;
  credits: number;
  resources: Record<ResourceType, number>;
  energy: number;
  energyMax: number;
  ship: ShipState;
  currentSystemId: string;
  currentBodyId?: string;
  galaxySeed: string;
  systems: StarSystem[];
  visitedSystemIds: string[];
  discoveredAnomalyIds: string[];
  ownedUpgrades: string[];
  researchedTech: string[];
  unlockedShips: ShipClass[];
  missions: Mission[];
  automations: Automation[];
  achievements: Record<string, boolean>;
  combat?: CombatState;
  stats: GameStats;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'station' | 'anomaly';
  distance: number;
  radius: number;
  composition: Partial<Record<ResourceType, number>>;
  discovered: boolean;
  scanned: boolean;
  resources: Record<ResourceType, number>;
  orbitSpeed: number;
  orbitTilt: number;
  color: string;
}

export interface StarSystem {
  id: string;
  name: string;
  seed: number;
  x: number;
  y: number;
  visited: boolean;
  scanned: boolean;
  bodies: CelestialBody[];
  anomaly?: { type: string; name: string; description: string; reward: string; discovered: boolean };
}

export interface GameStateReward {
  credits?: number;
  resources?: Partial<Record<ResourceType, number>>;
  unlocks?: string[];
}

export const SHIP_CLASSES: Record<ShipClass, {
  label: string;
  description: string;
  baseCargo: number;
  baseSpeed: number;
  baseMineEff: number;
  baseDefense: number;
  baseScanner: number;
  baseEnergy: number;
  cost: { credits: number; resources: Partial<Record<ResourceType, number>> };
  unlockCost?: { credits: number; resources: Partial<Record<ResourceType, number>> };
}> = {
  scout: {
    label: 'Starter Scout', description: 'A fast, lightly-armed reconnaissance vessel. Good for early exploration and scanning.',
    baseCargo: 50, baseSpeed: 12, baseMineEff: 1.0, baseDefense: 10, baseScanner: 2, baseEnergy: 100,
    cost: { credits: 0, resources: {} }
  },
  miner: {
    label: 'Mining Vessel', description: 'Specialized for extracting resources. Higher mining efficiency and larger cargo holds.',
    baseCargo: 200, baseSpeed: 8, baseMineEff: 2.5, baseDefense: 20, baseScanner: 3, baseEnergy: 150,
    unlockCost: { credits: 2000, resources: { iron: 500 } }
  },
  freighter: {
    label: 'Cargo Freighter', description: 'Massive cargo capacity at the cost of speed. Ideal for large hauls between systems.',
    baseCargo: 800, baseSpeed: 5, baseMineEff: 1.2, baseDefense: 30, baseScanner: 1, baseEnergy: 200,
    unlockCost: { credits: 5000, resources: { titanium: 300 } }
  },
  explorer: {
    label: 'Explorer', description: 'Advanced sensors and jump drives. Reveals anomalies and hidden locations more easily.',
    baseCargo: 150, baseSpeed: 10, baseMineEff: 1.5, baseDefense: 25, baseScanner: 8, baseEnergy: 250,
    unlockCost: { credits: 8000, resources: { rareElements: 50, crystals: 100 } }
  },
  combat: {
    label: 'Combat Ship', description: 'Heavily armed and shielded. Dominates pirate encounters and hostile drones.',
    baseCargo: 100, baseSpeed: 9, baseMineEff: 1.8, baseDefense: 60, baseScanner: 4, baseEnergy: 300,
    unlockCost: { credits: 12000, resources: { titanium: 500, rareElements: 80 } }
  },
  interstellar: {
    label: 'Advanced Interstellar Ship', description: 'The pinnacle of human engineering. Exceptional in all areas.',
    baseCargo: 2000, baseSpeed: 15, baseMineEff: 5.0, baseDefense: 120, baseScanner: 12, baseEnergy: 500,
    unlockCost: { credits: 50000, resources: { rareElements: 500, titanium: 1000, crystals: 300 } }
  }
};

export const UPGRADE_TIERS: Array<{
  id: string;
  type: UpgradeType;
  tier: number;
  name: string;
  description: string;
  costCredits: number;
  costResources: Partial<Record<ResourceType, number>>;
  apply: (ship: ShipState) => void;
}> = [
  { id: 'eng1', type: 'engine', tier: 1, name: 'Basic Thrusters', description: '+2 Speed', costCredits: 500, costResources: { iron: 100 }, apply: (s) => { s.baseSpeed += 2; } },
  { id: 'eng2', type: 'engine', tier: 2, name: 'Ion Thrusters', description: '+4 Speed', costCredits: 1500, costResources: { titanium: 100, copper: 200 }, apply: (s) => { s.baseSpeed += 4; } },
  { id: 'eng3', type: 'engine', tier: 3, name: 'Plasma Drives', description: '+6 Speed', costCredits: 5000, costResources: { rareElements: 100, crystals: 150 }, apply: (s) => { s.baseSpeed += 6; } },
  { id: 'min1', type: 'laser', tier: 1, name: 'Reinforced Laser', description: '+0.5 Mining Efficiency', costCredits: 600, costResources: { iron: 150 }, apply: (s) => { s.baseMineEff += 0.5; } },
  { id: 'min2', type: 'laser', tier: 2, name: 'Heavy Laser', description: '+1.0 Mining Efficiency', costCredits: 2000, costResources: { titanium: 150, copper: 200 }, apply: (s) => { s.baseMineEff += 1.0; } },
  { id: 'min3', type: 'laser', tier: 3, name: 'Resonance Beam', description: '+2.0 Mining Efficiency', costCredits: 8000, costResources: { rareElements: 150, crystals: 200 }, apply: (s) => { s.baseMineEff += 2.0; } },
  { id: 'car1', type: 'cargo', tier: 1, name: 'Expanded Cargo', description: '+100 Cargo', costCredits: 400, costResources: { iron: 80 }, apply: (s) => { s.baseCargo += 100; } },
  { id: 'car2', type: 'cargo', tier: 2, name: 'Reinforced Hold', description: '+300 Cargo', costCredits: 1800, costResources: { titanium: 100 }, apply: (s) => { s.baseCargo += 300; } },
  { id: 'car3', type: 'cargo', tier: 3, name: 'Quantum Storage', description: '+800 Cargo', costCredits: 6000, costResources: { rareElements: 120, crystals: 150 }, apply: (s) => { s.baseCargo += 800; } },
  { id: 'sca1', type: 'scanner', tier: 1, name: 'Enhanced Scanners', description: '+3 Scanner Range', costCredits: 500, costResources: { copper: 100 }, apply: (s) => { s.baseScanner += 3; } },
  { id: 'sca2', type: 'scanner', tier: 2, name: 'Long-Range Array', description: '+6 Scanner Range', costCredits: 3000, costResources: { rareElements: 80, crystals: 100 }, apply: (s) => { s.baseScanner += 6; } },
  { id: 'sca3', type: 'scanner', tier: 3, name: 'Quantum detectors', description: '+12 Scanner Range', costCredits: 10000, costResources: { rareElements: 200, crystals: 250 }, apply: (s) => { s.baseScanner += 12; } },
  { id: 'shd1', type: 'shield', tier: 1, name: 'Basic Shield Generator', description: '+20 Defense', costCredits: 700, costResources: { iron: 100, copper: 50 }, apply: (s) => { s.baseDefense += 20; } },
  { id: 'shd2', type: 'shield', tier: 2, name: 'Deflector Array', description: '+45 Defense', costCredits: 2500, costResources: { titanium: 150, rareElements: 80 }, apply: (s) => { s.baseDefense += 45; } },
  { id: 'shd3', type: 'shield', tier: 3, name: 'Adaptive Barrier', description: '+90 Defense', costCredits: 9000, costResources: { rareElements: 200, crystals: 250 }, apply: (s) => { s.baseDefense += 90; } },
  { id: 'wpn1', type: 'weapon', tier: 1, name: 'Rapid Lasers', description: '+20 Combat Power', costCredits: 800, costResources: { iron: 100, copper: 100 }, apply: (s) => { s.baseDefense += 20; } },
  { id: 'wpn2', type: 'weapon', tier: 2, name: 'Plasma Cannon', description: '+50 Combat Power', costCredits: 3000, costResources: { titanium: 150, rareElements: 80 }, apply: (s) => { s.baseDefense += 50; } },
  { id: 'wpn3', type: 'weapon', tier: 3, name: 'Disruptor Array', description: '+110 Combat Power', costCredits: 12000, costResources: { rareElements: 250, crystals: 300 }, apply: (s) => { s.baseDefense += 110; } },
  { id: 'jmp1', type: 'jumpDrive', tier: 1, name: 'Basic Jump Drive', description: 'Unlocks System Travel', costCredits: 3000, costResources: { rareElements: 50, crystals: 80 }, apply: () => {} },
  { id: 'jmp2', type: 'jumpDrive', tier: 2, name: 'Advanced Jump Drive', description: '50% faster travel times', costCredits: 10000, costResources: { rareElements: 200, crystals: 200 }, apply: () => {} },
  { id: 'jmp3', type: 'jumpDrive', tier: 3, name: 'Quantum Jump Drive', description: 'Instant short-range travel', costCredits: 30000, costResources: { rareElements: 400, crystals: 400 }, apply: () => {} }
];

export const STATION_TEMPLATES: Record<StationType, {
  label: string;
  description: string;
  produces: ResourceType;
  consumes: ResourceType;
  baseRate: number;
  baseCostCredits: number;
  baseCostResources: Partial<Record<ResourceType, number>>;
  baseEnergy: number;
}> = {
  drone: { label: 'Mining Drone Bay', description: 'Deploys drones to mine asteroids automatically.', produces: 'iron', consumes: 'iron', baseRate: 2, baseCostCredits: 1000, baseCostResources: { iron: 200 }, baseEnergy: 5 },
  miningShip: { label: 'Automated Mining Ship', description: 'An autonomous vessel that mines rich deposits.', produces: 'titanium', consumes: 'titanium', baseRate: 1.5, baseCostCredits: 2500, baseCostResources: { titanium: 150, rareElements: 50 }, baseEnergy: 8 },
  cargoVessel: { label: 'Cargo Vessel', description: 'Transports resources between stations and markets.', produces: 'ice', consumes: 'ice', baseRate: 3, baseCostCredits: 2000, baseCostResources: { ice: 300 }, baseEnergy: 6 },
  miningStation: { label: 'Mining Station', description: 'A large orbital platform that extracts planetary resources.', produces: 'copper', consumes: 'copper', baseRate: 5, baseCostCredits: 5000, baseCostResources: { copper: 400, titanium: 200 }, baseEnergy: 15 },
  refinery: { label: 'Refinery', description: 'Processes raw ores into refined materials and rare elements.', produces: 'rareElements', consumes: 'copper', baseRate: 2, baseCostCredits: 8000, baseCostResources: { copper: 300, crystals: 100 }, baseEnergy: 12 },
  lab: { label: 'Research Laboratory', description: 'Produces scientific data and accelerates research.', produces: 'crystals', consumes: 'ice', baseRate: 2, baseCostCredits: 6000, baseCostResources: { ice: 400, crystals: 200 }, baseEnergy: 14 }
};

export const STATION_UPGRADE_TIERS: Record<StationType, Array<{ level: number; costCredits: number; costResources: Partial<Record<ResourceType, number>>; rateMul: number; energyMul: number }>> = {
  drone: [{ level: 2, costCredits: 2500, costResources: { iron: 400 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 7500, costResources: { iron: 800, titanium: 200 }, rateMul: 3.5, energyMul: 1.4 }],
  miningShip: [{ level: 2, costCredits: 5000, costResources: { titanium: 300, rareElements: 100 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 15000, costResources: { titanium: 600, rareElements: 250 }, rateMul: 3.5, energyMul: 1.4 }],
  cargoVessel: [{ level: 2, costCredits: 4000, costResources: { ice: 600 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 12000, costResources: { ice: 1200, titanium: 200 }, rateMul: 3.5, energyMul: 1.4 }],
  miningStation: [{ level: 2, costCredits: 10000, costResources: { copper: 800, titanium: 400 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 30000, costResources: { copper: 1600, titanium: 800, rareElements: 300 }, rateMul: 3.5, energyMul: 1.4 }],
  refinery: [{ level: 2, costCredits: 15000, costResources: { copper: 600, crystals: 300 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 45000, costResources: { copper: 1200, crystals: 600, rareElements: 400 }, rateMul: 3.5, energyMul: 1.4 }],
  lab: [{ level: 2, costCredits: 12000, costResources: { ice: 800, crystals: 400 }, rateMul: 2, energyMul: 1.2 }, { level: 3, costCredits: 36000, costResources: { ice: 1600, crystals: 800, rareElements: 350 }, rateMul: 3.5, energyMul: 1.4 }]
};

export const MISSION_TEMPLATES: Array<{
  id: string;
  type: MissionType;
  name: string;
  desc: string;
  target: number;
  rewardCredits: number;
  rewardResources: Partial<Record<ResourceType, number>>;
  resource?: ResourceType;
}> = [
  { id: 'mt_mine_iron', type: 'mine', name: 'Iron Foundation', desc: 'Mine 100 units of iron.', target: 100, rewardCredits: 300, rewardResources: {}, resource: 'iron' },
  { id: 'mt_discover', type: 'discover', name: 'Chart Unknown Worlds', desc: 'Discover 3 planets.', target: 3, rewardCredits: 500, rewardResources: { ice: 50 } },
  { id: 'mt_explore', type: 'explore', name: 'New Horizons', desc: 'Explore a new star system.', target: 1, rewardCredits: 400, rewardResources: { titanium: 40 } },
  { id: 'mt_build', type: 'build', name: 'First Outpost', desc: 'Build a Mining Drone Bay.', target: 1, rewardCredits: 600, rewardResources: { iron: 100 } },
  { id: 'mt_combat', type: 'combat', name: 'Swashbucklers', desc: 'Defeat 3 pirate encounters.', target: 3, rewardCredits: 1500, rewardResources: { rareElements: 30 } },
  { id: 'mt_research', type: 'research', name: 'Knowledge is Power', desc: 'Research a technology.', target: 1, rewardCredits: 400, rewardResources: { crystals: 30 } }
];

export const ANOMALY_TEMPLATES: Array<{ name: string; desc: string; reward: string; rarity: number }> = [
  { name: 'Derelict Station', desc: 'An abandoned research station. Salvaging yields rare materials.', reward: 'Unlock: Advanced Scanner', rarity: 0.03 },
  { name: 'Alien Artifact', desc: 'A mysterious alien device. Studying it reveals alien tech.', reward: 'Unlock: Alien Technology Branch', rarity: 0.015 },
  { name: 'Quantum Crater', desc: 'A strange energy field boosts mining yields nearby.', reward: '+25% mining rate in this system', rarity: 0.04 },
  { name: 'Pirate Hideout', desc: 'Hostile pirates patrol this area. Defeat them for loot.', reward: 'Combat encounter', rarity: 0.06 },
  { name: 'Void Rift', desc: 'A spatial anomaly that speeds up warp travel.', reward: '-20% travel time', rarity: 0.035 },
  { name: 'Crystal Cavern', desc: 'Rich crystal deposits on a moon. Safe to harvest freely.', reward: 'Free crystals', rarity: 0.05 }
];

export const ACHIEVEMENTS: Array<{
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: (state: GameState) => boolean;
  reward: Partial<GameStateReward>;
}> = [
  { id: 'first_mine', name: 'First Blood', desc: 'Mine your first resource.', icon: '⛏️', condition: (s) => s.stats.totalMined.iron > 0, reward: { credits: 100 } },
  { id: 'first_sell', name: 'Capitalist', desc: 'Sell your first batch of resources.', icon: '💰', condition: (s) => s.stats.totalCreditsEarned >= 100, reward: {} },
  { id: 'first_upgrade', name: 'Tuned Up', desc: 'Purchase your first ship upgrade.', icon: '🔧', condition: (s) => s.ownedUpgrades.length >= 1, reward: {} },
  { id: 'first_station', name: 'Outpost', desc: 'Build your first automated station.', icon: '🛰️', condition: (s) => s.automations.length >= 1, reward: {} },
  { id: 'first_tech', name: 'Scholar', desc: 'Complete your first research.', icon: '🔬', condition: (s) => s.researchedTech.length >= 1, reward: {} },
  { id: 'first_combat', name: 'Warrior', desc: 'Win your first combat encounter.', icon: '⚔️', condition: (s) => s.stats.enemiesDefeated >= 1, reward: { credits: 500 } },
  { id: 'explorer', name: 'Explorer', desc: 'Visit 10 star systems.', icon: '🌌', condition: (s) => s.visitedSystemIds.length >= 10, reward: { credits: 2000 } },
  { id: 'empire', name: 'Galactic Tycoon', desc: 'Own all ship classes.', icon: '🏆', condition: (s) => s.unlockedShips.length >= 6, reward: { credits: 50000 } },
  { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1,000,000 credits.', icon: '💎', condition: (s) => s.credits >= 1000000, reward: {} },
  { id: 'max_miner', name: 'Master Miner', desc: 'Mine 10,000 of every resource.', icon: '⛏️', condition: (s) => Object.values(s.stats.totalMined).every((v) => v >= 10000), reward: { credits: 10000 } }
];

export const PLANET_NAMES = ['Aether', 'Kepler', 'Tartarus', 'Erebus', 'Nyx', 'Hypnos', 'Thanatos', 'Gaia', 'Chronos', 'Rhea', 'Selene', 'Helios', 'Atlas', 'Cronus', 'Oceanus', 'Luna', 'Sol', 'Nova', 'Pulsar', 'Quasar'];
export const STAR_NAMES = ['Sol', 'Alpha Centauri', 'Sirius', 'Proxima', 'Vega', 'Betelgeuse', 'Rigil', 'Altair', 'Deneb', 'Polaris', 'Antares', 'Rigel', 'Spica', 'Achernar', 'Hadar', 'Procyon', 'Aldebaran', 'Capella', 'Arcturus', 'Lyra'];
export const MOON_NAMES = ['Luna', 'Phobos', 'Deimos', 'Europa', 'Io', 'Callisto', 'Titan', 'Rhea', 'Iapetus', 'Dione', 'Tethys', 'Mimas', 'Enceladus', 'Hyperion', 'Miranda', 'Ariel', 'Umbriel', 'Titania', 'Oberon', 'Charon'];

export const TECH_TREE_NODES: Array<{
  id: string;
  branch: TechBranch;
  name: string;
  description: string;
  tier: number;
  cost: { credits: number; resources: Partial<Record<ResourceType, number>> };
  prereqs: string[];
  onComplete: (state: GameState) => void;
  effect: string;
}> = [
  // Engineering
  { id: 'eng_t1', branch: 'engineering', name: 'Reinforced Hull Plating', tier: 1, description: 'Increases ship defense by 15.', cost: { credits: 1000, resources: { iron: 200 } }, prereqs: [], onComplete: (s) => { s.ship.baseDefense += 15; }, effect: '+15 Defense' },
  { id: 'eng_t2', branch: 'engineering', name: 'Modular Cargo System', tier: 2, description: 'Increased cargo capacity by 200.', cost: { credits: 3000, resources: { titanium: 150, iron: 300 } }, prereqs: ['eng_t1'], onComplete: (s) => { s.ship.baseCargo += 200; }, effect: '+200 Cargo' },
  { id: 'eng_t3', branch: 'engineering', name: 'Overcharged Shields', tier: 3, description: 'Shield generators now overcharge, +40 defense.', cost: { credits: 10000, resources: { rareElements: 100, titanium: 300 } }, prereqs: ['eng_t2'], onComplete: (s) => { s.ship.baseDefense += 40; }, effect: '+40 Defense' },
  { id: 'eng_t4', branch: 'engineering', name: 'Adaptive Hull', tier: 4, description: 'Reduces all damage taken by 25% in combat.', cost: { credits: 25000, resources: { rareElements: 400, titanium: 500 } }, prereqs: ['eng_t3'], onComplete: () => {}, effect: '-25% damage' },
  // Automation
  { id: 'auto_t1', branch: 'automation', name: 'Basic Automation Protocol', tier: 1, description: 'Unlocks Mining Drone Bays.', cost: { credits: 2000, resources: { copper: 150 } }, prereqs: [], onComplete: () => {}, effect: 'Unlocks Drone Bay' },
  { id: 'auto_t2', branch: 'automation', name: 'Efficiency Optimization', tier: 2, description: 'All automation produces 25% more per tick.', cost: { credits: 6000, resources: { copper: 300, rareElements: 80 } }, prereqs: ['auto_t1'], onComplete: (s) => { s.automations.forEach((a) => { a.efficiency = (a.efficiency ?? 1.0) * 1.25; }); }, effect: '+25% automation' },
  { id: 'auto_t3', branch: 'automation', name: 'Autonomous Fleet Protocol', tier: 3, description: 'Unlocks Automated Mining Ships.', cost: { credits: 15000, resources: { titanium: 400, rareElements: 150 } }, prereqs: ['auto_t2'], onComplete: () => {}, effect: 'Unlocks Mining Ship' },
  { id: 'auto_t4', branch: 'automation', name: 'Self-Replicating Machines', tier: 4, description: 'All automation produces 50% more and costs less energy.', cost: { credits: 40000, resources: { rareElements: 600, crystals: 300 } }, prereqs: ['auto_t3'], onComplete: (s) => { s.automations.forEach((a) => { a.efficiency = (a.efficiency ?? 1.0) * 1.5; a.energy = Math.max(1, a.energy - 3); }); }, effect: '+50% automation' },
  // Exploration
  { id: 'exp_t1', branch: 'exploration', name: 'Deep Space Scanners', tier: 1, description: 'Scanner range increased by 3.', cost: { credits: 1200, resources: { copper: 100 } }, prereqs: [], onComplete: (s) => { s.ship.baseScanner += 3; }, effect: '+3 Scanner' },
  { id: 'exp_t2', branch: 'exploration', name: 'Advanced Cartography', tier: 2, description: 'Reveals entire galaxy map.', cost: { credits: 4000, resources: { crystals: 100, rareElements: 50 } }, prereqs: ['exp_t1'], onComplete: (s) => { s.systems.forEach((sys) => { sys.scanned = true; }); }, effect: 'Reveal map' },
  { id: 'exp_t3', branch: 'exploration', name: 'Anomaly Detection Array', tier: 3, description: 'Anomalies are discovered automatically.', cost: { credits: 12000, resources: { rareElements: 150, crystals: 200 } }, prereqs: ['exp_t2'], onComplete: (s) => { s.discoveredAnomalyIds.push('global'); }, effect: 'Auto-anomaly' },
  { id: 'exp_t4', branch: 'exploration', name: 'Quantum Entanglement Comms', tier: 4, description: 'Jump between any visited systems instantly.', cost: { credits: 30000, resources: { rareElements: 500, crystals: 400 } }, prereqs: ['exp_t3'], onComplete: () => {}, effect: 'Instant jump' },
  // Energy
  { id: 'energy_t1', branch: 'energy', name: 'Improved Power Core', tier: 1, description: '+25 Energy capacity.', cost: { credits: 800, resources: { copper: 100 } }, prereqs: [], onComplete: (s) => { s.energyMax += 25; }, effect: '+25 Energy' },
  { id: 'energy_t2', branch: 'energy', name: 'Solar Collection Array', tier: 2, description: 'Recharges 5 energy per second while in a system.', cost: { credits: 3500, resources: { iron: 200, copper: 150 } }, prereqs: ['energy_t1'], onComplete: (s) => { s.ship.baseEnergy += 5; }, effect: '+5 Recharge' },
  { id: 'energy_t3', branch: 'energy', name: 'Fusion Reactor', tier: 3, description: '+75 Energy capacity and faster recharge.', cost: { credits: 12000, resources: { rareElements: 200, crystals: 150 } }, prereqs: ['energy_t2'], onComplete: (s) => { s.energyMax += 75; s.ship.baseEnergy += 3; }, effect: '+75 Energy' },
  { id: 'energy_t4', branch: 'energy', name: 'Zero-Point Energy', tier: 4, description: 'Unlimited energy (infinite pool).', cost: { credits: 50000, resources: { rareElements: 1000, crystals: 500 } }, prereqs: ['energy_t3'], onComplete: (s) => { s.energyMax = Infinity; }, effect: 'Infinite energy' },
  // Alien Technology
  { id: 'alien_t1', branch: 'alien', name: 'Alien Metallurgy', tier: 1, description: 'Rare elements yield +50% more from mining.', cost: { credits: 15000, resources: { rareElements: 100 } }, prereqs: [], onComplete: (s) => { s.stats.totalMined.rareElements += 1; }, effect: '+50% rare' },
  { id: 'alien_t2', branch: 'alien', name: 'Void Manipulation', tier: 2, description: 'Movement speed in combat and travel is doubled.', cost: { credits: 30000, resources: { rareElements: 300, crystals: 300 } }, prereqs: ['alien_t1'], onComplete: (s) => { s.ship.baseSpeed = Math.round(s.ship.baseSpeed * 2); }, effect: '2x speed' },
  { id: 'alien_t3', branch: 'alien', name: 'Dimensional Storage', tier: 3, description: 'Cargo holds can store 2000 more of any single resource.', cost: { credits: 60000, resources: { rareElements: 600, crystals: 500 } }, prereqs: ['alien_t2', 'eng_t3'], onComplete: (s) => { s.ship.baseCargo += 2000; }, effect: '+2000 cargo' },
  { id: 'alien_t4', branch: 'alien', name: 'Singularity Core', tier: 4, description: 'The ultimate power source. All stats are greatly enhanced.', cost: { credits: 200000, resources: { rareElements: 1500, crystals: 1000 } }, prereqs: ['alien_t3', 'energy_t4'], onComplete: (s) => { s.ship.baseDefense += 100; s.ship.baseMineEff += 2; s.ship.baseScanner += 8; }, effect: 'Ultimate' }
];

export const STARTING_SYSTEM_ID = 'sol';
export const NUM_STAR_SYSTEMS = 120;
export const SECTOR_COUNT = 4;
