// Core game state types for Galaxy Tycoon.

export type ResourceType = 'iron' | 'titanium' | 'copper' | 'ice' | 'crystals' | 'rareElements';

export interface ShipSpecs {
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
}

export interface StationTemplates {
  label: string;
  description: string;
  produces: ResourceType;
  consumes: ResourceType;
  baseRate: number;
  baseCostCredits: number;
  baseCostResources: Partial<Record<ResourceType, number>>;
  baseEnergy: number;
}

export interface ResourceMap {
  iron: number;
  titanium: number;
  copper: number;
  ice: number;
  crystals: number;
  rareElements: number;
}

export enum Screen {
  MENU, MAIN, GALAXY, SYSTEM, HANGAR, STATIONS, RESEARCH, MARKET, MISSIONS, COMBAT, ACHIEVEMENTS, SETTINGS, TUTORIAL
}

export type ShipClass = 'scout' | 'miner' | 'freighter' | 'explorer' | 'combat' | 'interstellar';

export type TechBranch = 'engineering' | 'automation' | 'exploration' | 'energy' | 'alien';

export type UpgradeType = 'engine' | 'laser' | 'cargo' | 'scanner' | 'shield' | 'weapon' | 'jumpDrive';

export type StationType = 'drone' | 'miningShip' | 'cargoVessel' | 'miningStation' | 'refinery' | 'lab';

export type MissionType = 'mine' | 'discover' | 'explore' | 'build' | 'combat' | 'research';

export type MissionStatus = 'available' | 'active' | 'completed';

export interface TechNode {
  id: string;
  branch: TechBranch;
  name: string;
  description: string;
  tier: number;
  cost: { credits: number; resources: Partial<ResourceMap> };
  prereqs: string[];
  locked: boolean;
  onComplete: (state: GameState) => void;
  effect: string;
}

export interface UpgradeSpec {
  id: string;
  type: UpgradeType;
  tier: number;
  name: string;
  description: string;
  cost: { credits: number; resources: Partial<ResourceMap> };
  effect: (ship: ShipState) => void;
}

export interface ShipState {
  class: ShipClass;
  name: string;
  // base stats
  baseCargo: number;
  baseSpeed: number;
  baseMineEff: number;
  baseDefense: number;
  baseScanner: number;
  baseEnergy: number;
  // applied upgrades (level per type)
  upgrades: Partial<Record<UpgradeType, number>>;
  // cargo contents
  cargo: ResourceMap;
  energy: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'station' | 'anomaly';
  distance: number; // AU / semi-major axis
  radius: number;
  composition: Partial<Record<ResourceType, number>>; // abundance 0-1
  discovered: boolean;
  scanned: boolean;
  resources: ResourceMap; // remaining extractable
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

export interface Mission {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  status: MissionStatus;
  progress: number;
  target: number;
  reward: { credits: number; resources: Partial<ResourceMap>; unlock?: string };
  expiry?: number;
}

export interface Automation {
  id: string;
  type: StationType;
  name: string;
  level: number;
  rate: number; // units produced per tick
  cost: { credits: number; resources: Partial<ResourceMap> };
  produces: ResourceType;
  consumes: ResourceType;
  energy: number;
  efficiency: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  reward: Partial<GameStateReward>;
}

interface GameStateReward {
  credits: number;
  resources: Partial<ResourceMap>;
  unlocks: string[];
}

export interface GameState {
  version: string;
  createdAt: number;
  lastSaved: number;
  playTime: number; // seconds
  // economy
  credits: number;
  resources: ResourceMap;
  energy: number;
  energyMax: number;
  // player ship
  ship: ShipState;
  currentSystemId: string;
  currentBodyId?: string;
  // galaxy
  galaxySeed: string;
  systems: StarSystem[];
  visitedSystemIds: string[];
  discoveredAnomalyIds: string[];
  // progression
  ownedUpgrades: string[];
  researchedTech: string[];
  unlockedShips: ShipClass[];
  missions: Mission[];
  automations: Automation[];
  achievements: Record<string, boolean>;
  // combat
  combat?: CombatState;
  // stats
  stats: GameStats;
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

interface GameStats {
  totalMined: ResourceMap;
  totalCreditsEarned: number;
  totalTimePlayed: number;
  systemsVisited: number;
  planetsDiscovered: number;
  enemiesDefeated: number;
  stationsBuilt: number;
  technologiesResearched: number;
}

export interface GameContextType {
  state: GameState;
  updateState: (updater: (s: GameState) => void) => void;
  canAfford: (cost: { credits: number; resources: Partial<ResourceMap> }) => boolean;
  spend: (cost: { credits: number; resources: Partial<ResourceMap> }) => boolean;
  addResources: (res: Partial<ResourceMap>) => void;
  addCredits: (amt: number) => void;
  mineBody: (body: CelestialBody, amt?: number) => ResourceMap;
  startCombat: (enemyType: 'pirate' | 'drone') => void;
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  tick: () => void;
}
