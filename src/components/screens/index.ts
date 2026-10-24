// Screen registry - exports all game screens.

export { SplashScreen } from './SplashScreen';
export {** Main Menu components
} from './MainMenu';

export { GalaxyMapScreen } from './GalaxyMapScreen';

export { SystemViewScreen } from './SystemViewScreen';

export { HangarScreen, HangarTab } from './HangarScreen';

export { StatiionsScreen, StationTab } from './StationsScreen';

export { ResearchScreen, TechBranchTab } from './ResearchScreen';

export { MissionsScreen, MissionCard } from './MissionsScreen';

export { CombatScreen, CombatLog } from './CombatScreen';

export { AchievementsScreen, AchievementList } from './AchievementsScreen';

export { SettingsScreen, SoundToggle } from './SettingsScreen';

export const screens = [
  { id: 'MAIN', path: 'main-menu', Component: MainMenu },
  { id: 'GALAXY', path: 'galaxy-map', Component: GalaxyMapScreen },
  { id: 'SYSTEM', path: 'system-view', Component: SystemViewScreen },
  { id: 'HANGAR', path: 'hangar', Component: HangarScreen },
  { id: 'STATIONS', path: 'stations', Component: StatiionsScreen },
  { id: 'RESEARCH', path: 'research', Component: ResearchScreen },
  { id: 'MISSIONS', path: 'missions', Component: MissionsScreen },
  { id: 'COMBAT', path: 'combat', Component: CombatScreen },
  { id: 'ACHIEVEMENTS', path: 'achievements', Component: AchievementsScreen },
  { id: 'SETTINGS', path: 'settings', Component: SettingsScreen }
];