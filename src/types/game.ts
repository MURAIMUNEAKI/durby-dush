export type GameState = 'TITLE' | 'HORSE_SELECT' | 'COURSE_SELECT' | 'COUNTDOWN' | 'RACING' | 'GOAL_SLOWMO' | 'RESULT';
export type GameOrientation = 'portrait' | 'landscape';

export interface HorseProfile {
  id: string;
  name: string;
  subName: string;
  riderName: string;
  colorName: string;
  coatColor: string; // Hex color for horse body
  maneColor: string; // Hex color for mane/tail
  jockeyColor: string; // Hex color for jockey silks
  jockeyCapColor: string;
  baseMaxSpeed: number; // in km/h (e.g. 75)
  accelerationRate: number;
  staminaMax: number; // max stamina points
  agility: number; // how quickly lanes shift & jump responsiveness
  description: string;
  specialAbility: string;
}

export interface Course {
  id: string;
  name: string;
  stageName: string;
  grade: 'STAGE 1' | 'STAGE 2' | 'STAGE 3' | 'FINAL STAGE';
  distance: number; // in meters (e.g. 1200, 1600, 2400)
  trackType: 'TURF' | 'DIRT' | 'DESERT';
  obstacleDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  rewardTitle: string;
  description: string;
  skyTheme: 'day' | 'sunset' | 'overcast';
}

export type ObstacleType = 'HURDLE' | 'MUD' | 'BOULDER' | 'CACTUS';
export type ItemType = 'STEEL_BALL' | 'GOLDEN_CARROT';

export interface RaceObstacle {
  id: number;
  type: ObstacleType;
  distance: number; // meter mark on the course
  lane: number; // 0, 1, 2, 3 (lane index)
  width: number;
  cleared?: boolean;
  hit?: boolean;
  nearMissAwarded?: boolean;
}

export interface RaceItem {
  id: number;
  type: ItemType;
  distance: number; // meter mark on the course
  lane: number;
  collected?: boolean;
}

export interface RivalHorse {
  id: string;
  name: string;
  riderName: string;
  coatColor: string;
  maneColor: string;
  jockeyColor: string;
  currentDistance: number;
  speed: number;
  targetSpeed: number;
  lane: number;
  targetLane: number;
  yJump: number;
  isJumping: boolean;
  stumbleTimer: number;
  finishTime?: number;
}

export interface RaceStats {
  finishTime: number; // in seconds
  rank: number;
  topSpeed: number; // in km/h
  obstaclesCleared: number;
  obstaclesHit: number;
  nearMisses: number;
  steelBallsCollected: number;
  carrotsCollected: number;
  totalDistance: number;
  horseName: string;
  courseName: string;
  date: string;
}
