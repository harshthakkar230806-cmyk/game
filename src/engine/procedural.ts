// Seeded deterministic procedural generation for the Galaxy Tycoon galaxy.
// Uses a 32-bit mulberry32 PRNG so the galaxy is recreated consistently on load.

import { NUM_STAR_SYSTEMS, SECTOR_COUNT, PLANET_NAMES, STAR_NAMES, MOON_NAMES, ANOMALY_TEMPLATES, ResourceType, CelestialBody, StarSystem } from './constants';

export class SeededRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed >>> 0;
  }
  next(): number {
    // mulberry32
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffled<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}

export const stringHash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const generateGalaxy = (seed: string): StarSystem[] => {
  const rng = new SeededRNG(stringHash(seed));
  const systems: StarSystem[] = [];

  for (let i = 0; i < NUM_STAR_SYSTEMS; i++) {
    const baseX = rng.range(-2000, 2000);
    const baseY = rng.range(-2000, 2000);
    // spiral placement
    const angle = (i / NUM_STAR_SYSTEMS) * Math.PI * 6;
    const radius = (i / NUM_STAR_SYSTEMS) * 1800 + rng.range(-50, 50);
    const x = Math.cos(angle) * radius + baseX * 0.1;
    const y = Math.sin(angle) * radius + baseY * 0.1;
    const name = rng.pick(STAR_NAMES) + ' ' + (i + 1).toString();
    const sys: StarSystem = {
      id: 'sys_' + i,
      name,
      seed: stringHash(seed + i),
      x,
      y,
      visited: i === 0, // sol is visited
      scanned: i === 0,
      bodies: [],
      anomaly: undefined
    };
    if (i === 0) sys.name = 'Sol';
    systems.push(sys);
  }

  // generate bodies for each system
  systems.forEach((sys) => {
    sys.bodies = generateSystem(sys.seed, sys.id);
  });

  // sprinkle anomalies
  systems.forEach((sys) => {
    if (rng.next() < 0.18) {
      const tmpl = rng.pick(ANOMALY_TEMPLATES);
      sys.anomaly = { type: 'anomaly', name: tmpl.name, description: tmpl.desc, reward: tmpl.reward, discovered: false };
    }
  });

  // nearest neighbor graph for travel (sol is sys_0)
  // (Travel handled by distance calc in gameLoop)

  return systems;
};

const generateSystem = (sysSeed: number, sysId: string): CelestialBody[] => {
  const rng = new SeededRNG(sysSeed);
  const bodies: CelestialBody[] = [];

  // Sun
  const sunColor = rng.range(0.55, 0.95) < 0.6 ? '#ffd43b' : rng.range(0, 1) < 0.5 ? '#ff6b6b' : '#a7c7e7';
  bodies.push({
    id: sysId + '_sun',
    name: 'Sun',
    type: 'star',
    distance: 0,
    radius: 3,
    composition: {},
    discovered: true,
    scanned: true,
    resources: { iron: 0, titanium: 0, copper: 0, ice: 0, crystals: 0, rareElements: 0 },
    orbitSpeed: 0,
    orbitTilt: 0,
    color: sunColor
  });

  const planetCount = rng.rangeInt(2, 6);
  const baseDist = 30;

  for (let p = 0; p < planetCount; p++) {
    const dist = baseDist + p * rng.range(40, 90);
    const r = rng.range(0.4, 1.8);
    const isPlanet = rng.range(0, 1) > 0.2 || p === 0;
    const bodyType = isPlanet ? 'planet' : 'asteroid';
    // determine composition based on distance (closer = metals, further = ice)
    const isCore = dist < 150;
    const isHabZone = dist >= 80 && dist <= 200;
    const composition: Partial<Record<ResourceType, number>> = {};
    const res: Record<ResourceType, number> = { iron: 0, titanium: 0, copper: 0, ice: 0, crystals: 0, rareElements: 0 };

    const commonResources = ['iron', 'titanium', 'copper'] as ResourceType[];
    const iceResources = ['ice', 'crystals'] as ResourceType[];
    if (isCore) {
      composition[rng.pick(commonResources)] = rng.range(0.4, 1);
      composition[rng.pick(commonResources)] = rng.range(0.2, 0.7);
      res[rng.pick(commonResources) as ResourceType] = rng.rangeInt(40, 120);
      res[rng.pick(commonResources) as ResourceType] = rng.rangeInt(30, 100);
      if (rng.next() < 0.2) res[ rng.pick(['rareElements'] as ResourceType) as ResourceType ] = rng.rangeInt(5, 20);
    } else if (isHabZone) {
      composition.ice = rng.range(0.3, 0.8);
      composition.crystals = rng.range(0.1, 0.5);
      res.ice = rng.rangeInt(30, 90);
      res.crystals = rng.rangeInt(10, 40);
    } else {
      composition[rng.pick(iceResources)] = rng.range(0.5, 1);
      composition[rng.pick(iceResources)] = rng.range(0.3, 0.7);
      res[rng.pick(iceResources) as ResourceType] = rng.rangeInt(40, 130);
    }

    const color = isPlanet ? (isHabZone ? '#22c55e' : isCore ? '#ef4444' : '#38bdfa') : '#6b7280';
    const planetName = rng.pick(PLANET_NAMES);
    bodies.push({
      id: sysId + '_body_' + p,
      name: bodyType === 'planet' ? planetName : planetName + ' Asteroid Field',
      type: bodyType === 'planet' ? 'planet' : 'asteroid',
      distance: dist,
      radius: r,
      composition,
      discovered: false,
      scanned: false,
      resources: res,
      orbitSpeed: rng.range(0.1, 1.2),
      orbitTilt: rng.range(0, 40),
      color
    });
  }

  // moons (chance per planet)
  const planets = bodies.filter((b) => b.type === 'planet');
  planets.forEach((planet, idx) => {
    if (rng.next() < 0.5) {
      const moonDist = planet.distance + rng.range(5, 12);
      const moon: CelestialBody = {
        id: planet.id + '_moon_' + idx,
        name: rng.pick(MOON_NAMES),
        type: 'moon',
        distance: moonDist,
        radius: rng.range(0.2, 0.5),
        composition: { ice: rng.range(0.5, 1), crystals: rng.range(0.2, 0.6) },
        discovered: false,
        scanned: false,
        resources: {
          iron: 0, titanium: 0, copper: 0,
          ice: rng.rangeInt(40, 100),
          crystals: rng.rangeInt(20, 60),
          rareElements: rng.rangeInt(0, 15)
        },
        orbitSpeed: planet.orbitSpeed * 1.5,
        orbitTilt: planet.orbitTilt + rng.range(-15, 15),
        color: '#93c5fd'
      };
      bodies.push(moon);
    }
  });

  return bodies;
};

export const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const bodyHarvestableResources = (body: CelestialBody): ResourceType[] =>
  (Object.keys(body.resources) as ResourceType[]).filter((k) => (body.resources[k] ?? 0) > 0);
