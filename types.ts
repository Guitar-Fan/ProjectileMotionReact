
export enum LaunchMode {
  GUN = 'GUN',
  CANNON = 'CANNON',
  KICK = 'KICK',
  THROW = 'THROW'
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsParams {
  gravity: number;
  airDensity: number;
  windSpeed: Vector3;
  mass: number;
  radius: number;
  dragCoefficient: number;
  initialVelocity: number;
  launchAngle: number; // Elevation
  launchAzimuth: number; // Direction
  spin: Vector3; // For Magnus effect (radians/s)
}

export interface ProjectileState {
  position: Vector3;
  velocity: Vector3;
  time: number;
}

export interface SimulationResult {
  path: ProjectileState[];
  maxRange: number;
  maxHeight: number;
  timeOfFlight: number;
  impactVelocity: number;
}
