
import { GoogleGenAI } from "@google/genai";
import { PhysicsParams, SimulationResult } from "../types";

export class AIAssistant {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeTrajectory(params: PhysicsParams, result: SimulationResult, mode: string) {
    const prompt = `
      As a world-class ballistics and physics expert, analyze this projectile motion data:
      Launch Mode: ${mode}
      Initial Velocity: ${params.initialVelocity} m/s
      Launch Angle: ${params.launchAngle}°
      Mass: ${params.mass} kg
      Air Resistance: ${params.airDensity > 0 ? 'Enabled' : 'Disabled'}
      Wind: X:${params.windSpeed.x}, Y:${params.windSpeed.y}, Z:${params.windSpeed.z} m/s
      Spin (Magnus): X:${params.spin.x}, Y:${params.spin.y}, Z:${params.spin.z} rad/s
      
      Simulation Results:
      Max Range: ${result.maxRange.toFixed(2)} m
      Max Height: ${result.maxHeight.toFixed(2)} m
      Time of Flight: ${result.timeOfFlight.toFixed(2)} s
      Impact Velocity: ${result.impactVelocity.toFixed(2)} m/s
      
      Provide a brief, professional technical insight (max 100 words) on how the variables like drag, wind, or spin influenced this specific result. Mention if the trajectory was efficient.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.7 }
      });
      return response.text;
    } catch (error) {
      console.error("AI analysis failed", error);
      return "Unable to provide AI analysis at this time.";
    }
  }
}
