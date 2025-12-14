
import { LaunchMode, PhysicsParams } from './types';

export const DEFAULTS: Record<LaunchMode, PhysicsParams> = {
  [LaunchMode.GUN]: {
    gravity: 9.81,
    airDensity: 1.225,
    windSpeed: { x: 0, y: 0, z: 0 },
    mass: 0.008, // 8 grams (9mm)
    radius: 0.0045, // 4.5mm
    dragCoefficient: 0.295, // Bullet shape
    initialVelocity: 350, // m/s
    launchAngle: 5,
    launchAzimuth: 0,
    spin: { x: 0, y: 0, z: 500 } // High rifling spin
  },
  [LaunchMode.CANNON]: {
    gravity: 9.81,
    airDensity: 1.225,
    windSpeed: { x: 0, y: 0, z: 0 },
    mass: 10, // 10kg
    radius: 0.1, // 10cm
    dragCoefficient: 0.47, // Sphere
    initialVelocity: 150,
    launchAngle: 45,
    launchAzimuth: 0,
    spin: { x: 0, y: 0, z: 0 }
  },
  [LaunchMode.KICK]: {
    gravity: 9.81,
    airDensity: 1.225,
    windSpeed: { x: 0, y: 0, z: 0 },
    mass: 0.45, // Football
    radius: 0.11, // 11cm
    dragCoefficient: 0.25,
    initialVelocity: 25,
    launchAngle: 30,
    launchAzimuth: 0,
    spin: { x: 0, y: 10, z: 5 } // Curved kick
  },
  [LaunchMode.THROW]: {
    gravity: 9.81,
    airDensity: 1.225,
    windSpeed: { x: 0, y: 0, z: 0 },
    mass: 0.145, // Baseball
    radius: 0.037, // 3.7cm
    dragCoefficient: 0.3,
    initialVelocity: 40,
    launchAngle: 15,
    launchAzimuth: 0,
    spin: { x: 50, y: 0, z: 0 } // Backspin
  }
};
