
import React from 'react';
import { LaunchMode, PhysicsParams } from '../types';

interface Props {
  params: PhysicsParams;
  setParams: (p: PhysicsParams) => void;
  mode: LaunchMode;
  setMode: (m: LaunchMode) => void;
  onFire: () => void;
}

const ControlPanel: React.FC<Props> = ({ params, setParams, mode, setMode, onFire }) => {
  const handleChange = (key: keyof PhysicsParams, value: any) => {
    setParams({ ...params, [key]: value });
  };

  const handleVectorChange = (key: 'windSpeed' | 'spin', axis: 'x' | 'y' | 'z', value: number) => {
    setParams({
      ...params,
      [key]: { ...params[key], [axis]: value }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 h-full overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 p-1 rounded">🚀</span> Launch Mode
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(LaunchMode).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 px-3 rounded text-sm transition-all ${
                mode === m ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Atmosphere & Global</h3>
        <div>
          <label className="text-sm block mb-1">Gravity (m/s²): {params.gravity}</label>
          <input 
            type="range" min="0" max="25" step="0.1" 
            value={params.gravity} 
            onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Air Density (kg/m³): {params.airDensity}</label>
          <input 
            type="range" min="0" max="2" step="0.01" 
            value={params.airDensity} 
            onChange={(e) => handleChange('airDensity', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-800 pt-4">
        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Projectile Properties</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1">Mass (kg)</label>
            <input 
              type="number" step="0.01" 
              value={params.mass} 
              onChange={(e) => handleChange('mass', parseFloat(e.target.value))}
              className="bg-slate-800 w-full p-2 rounded text-sm border border-slate-700"
            />
          </div>
          <div>
            <label className="text-xs block mb-1">Radius (m)</label>
            <input 
              type="number" step="0.01" 
              value={params.radius} 
              onChange={(e) => handleChange('radius', parseFloat(e.target.value))}
              className="bg-slate-800 w-full p-2 rounded text-sm border border-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-800 pt-4">
        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Launch Configuration</h3>
        <div>
          <label className="text-sm block mb-1">Initial Velocity (m/s): {params.initialVelocity}</label>
          <input 
            type="range" min="1" max="1000" step="1" 
            value={params.initialVelocity} 
            onChange={(e) => handleChange('initialVelocity', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs block mb-1">Angle (°)</label>
            <input 
              type="number" min="-90" max="90"
              value={params.launchAngle} 
              onChange={(e) => handleChange('launchAngle', parseFloat(e.target.value))}
              className="bg-slate-800 w-full p-2 rounded text-sm border border-slate-700"
            />
          </div>
          <div>
            <label className="text-xs block mb-1">Azimuth (°)</label>
            <input 
              type="number" min="0" max="360"
              value={params.launchAzimuth} 
              onChange={(e) => handleChange('launchAzimuth', parseFloat(e.target.value))}
              className="bg-slate-800 w-full p-2 rounded text-sm border border-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-800 pt-4">
        <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Spin (Magnus Effect)</h3>
        <div className="grid grid-cols-3 gap-2">
          {['x', 'y', 'z'].map((axis) => (
            <div key={axis}>
              <label className="text-[10px] uppercase block mb-1">{axis}-axis (rad/s)</label>
              <input 
                type="number" step="1"
                value={params.spin[axis as 'x'|'y'|'z']} 
                onChange={(e) => handleVectorChange('spin', axis as any, parseFloat(e.target.value))}
                className="bg-slate-800 w-full p-1.5 rounded text-xs border border-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onFire}
        className="mt-4 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
      >
        <span>🔥</span> FIRE PROJECTILE
      </button>
    </div>
  );
};

export default ControlPanel;
