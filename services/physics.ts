
import { PhysicsParams, ProjectileState, Vector3, SimulationResult } from '../types';

export class PhysicsEngine {
  static simulate(params: PhysicsParams): SimulationResult {
    const path: ProjectileState[] = [];
    
    // Convert angles to radians
    const angleRad = (params.launchAngle * Math.PI) / 180;
    const azimuthRad = (params.launchAzimuth * Math.PI) / 180;

    // Initial velocity vector
    let currentVelocity: Vector3 = {
      x: params.initialVelocity * Math.cos(angleRad) * Math.cos(azimuthRad),
      y: params.initialVelocity * Math.sin(angleRad),
      z: params.initialVelocity * Math.cos(angleRad) * Math.sin(azimuthRad)
    };

    let currentPosition: Vector3 = { x: 0, y: 1.5, z: 0 }; // Launch from human/cannon height
    let currentTime = 0;
    const dt = 0.01; // Integration step
    
    let maxHeight = 0;

    while (currentPosition.y >= 0 && currentTime < 60) { // Limit to 60s flight
      path.push({
        position: { ...currentPosition },
        velocity: { ...currentVelocity },
        time: currentTime
      });

      if (currentPosition.y > maxHeight) maxHeight = currentPosition.y;

      // RK4 Integration step
      const nextState = this.rk4Step(currentPosition, currentVelocity, params, dt);
      currentPosition = nextState.pos;
      currentVelocity = nextState.vel;
      currentTime += dt;
    }

    // Add final impact point
    path.push({
      position: { ...currentPosition },
      velocity: { ...currentVelocity },
      time: currentTime
    });

    const lastPos = path[path.length - 1].position;
    const maxRange = Math.sqrt(lastPos.x ** 2 + lastPos.z ** 2);
    const impactVelocity = Math.sqrt(
      currentVelocity.x ** 2 + currentVelocity.y ** 2 + currentVelocity.z ** 2
    );

    return {
      path,
      maxRange,
      maxHeight,
      timeOfFlight: currentTime,
      impactVelocity
    };
  }

  private static rk4Step(
    pos: Vector3,
    vel: Vector3,
    params: PhysicsParams,
    dt: number
  ): { pos: Vector3; vel: Vector3 } {
    const k1v = this.acceleration(vel, params);
    const k1x = vel;

    const v2 = { x: vel.x + k1v.x * dt/2, y: vel.y + k1v.y * dt/2, z: vel.z + k1v.z * dt/2 };
    const k2v = this.acceleration(v2, params);
    const k2x = v2;

    const v3 = { x: vel.x + k2v.x * dt/2, y: vel.y + k2v.y * dt/2, z: vel.z + k2v.z * dt/2 };
    const k3v = this.acceleration(v3, params);
    const k3x = v3;

    const v4 = { x: vel.x + k3v.x * dt, y: vel.y + k3v.y * dt, z: vel.z + k3v.z * dt };
    const k4v = this.acceleration(v4, params);
    const k4x = v4;

    const nextVel = {
      x: vel.x + (dt/6) * (k1v.x + 2*k2v.x + 2*k3v.x + k4v.x),
      y: vel.y + (dt/6) * (k1v.y + 2*k2v.y + 2*k3v.y + k4v.y),
      z: vel.z + (dt/6) * (k1v.z + 2*k2v.z + 2*k3v.z + k4v.z)
    };

    const nextPos = {
      x: pos.x + (dt/6) * (k1x.x + 2*k2x.x + 2*k3x.x + k4x.x),
      y: pos.y + (dt/6) * (k1x.y + 2*k2x.y + 2*k3x.y + k4x.y),
      z: pos.z + (dt/6) * (k1x.z + 2*k2x.z + 2*k3x.z + k4x.z)
    };

    return { pos: nextPos, vel: nextVel };
  }

  private static acceleration(vel: Vector3, params: PhysicsParams): Vector3 {
    // Relative velocity to wind
    const vRel = {
      x: vel.x - params.windSpeed.x,
      y: vel.y - params.windSpeed.y,
      z: vel.z - params.windSpeed.z
    };
    const speedSq = vRel.x ** 2 + vRel.y ** 2 + vRel.z ** 2;
    const speed = Math.sqrt(speedSq);

    // 1. Gravity
    const gravityForce = { x: 0, y: -params.gravity * params.mass, z: 0 };

    // 2. Air Drag
    const area = Math.PI * params.radius ** 2;
    const dragMagnitude = 0.5 * params.airDensity * speedSq * params.dragCoefficient * area;
    const dragForce = speed === 0 ? {x:0, y:0, z:0} : {
      x: -dragMagnitude * (vRel.x / speed),
      y: -dragMagnitude * (vRel.y / speed),
      z: -dragMagnitude * (vRel.z / speed)
    };

    // 3. Magnus Effect (F = S * (omega x v))
    // S = C_magnus * rho * r^3
    const CM = 1.0; // Magnus coefficient
    const S = CM * params.airDensity * (params.radius ** 3);
    const magnusForce = {
      x: S * (params.spin.y * vel.z - params.spin.z * vel.y),
      y: S * (params.spin.z * vel.x - params.spin.x * vel.z),
      z: S * (params.spin.x * vel.y - params.spin.y * vel.x)
    };

    return {
      x: (gravityForce.x + dragForce.x + magnusForce.x) / params.mass,
      y: (gravityForce.y + dragForce.y + magnusForce.y) / params.mass,
      z: (gravityForce.z + dragForce.z + magnusForce.z) / params.mass
    };
  }
}
