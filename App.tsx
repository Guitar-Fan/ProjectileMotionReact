
import React, { useState, useEffect, useCallback } from 'react';
import { LaunchMode, PhysicsParams, SimulationResult } from './types';
import { DEFAULTS } from './constants';
import { PhysicsEngine } from './services/physics';
import { AIAssistant } from './services/aiAssistant';
import ControlPanel from './components/ControlPanel';
import SimulationCanvas from './components/SimulationCanvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const App: React.FC = () => {
  const [mode, setMode] = useState<LaunchMode>(LaunchMode.CANNON);
  const [params, setParams] = useState<PhysicsParams>(DEFAULTS[LaunchMode.CANNON]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Initialize AI service
  const aiAssistant = new AIAssistant();

  // Reset params when mode changes
  useEffect(() => {
    setParams(DEFAULTS[mode]);
    setResult(null);
    setAiInsight('');
  }, [mode]);

  const handleFire = useCallback(async () => {
    const res = PhysicsEngine.simulate(params);
    setResult(res);
    setIsSimulating(true);
    setAiInsight('');
    
    // AI Analysis
    setIsLoadingInsight(true);
    const insight = await aiAssistant.analyzeTrajectory(params, res, mode);
    setAiInsight(insight || "No data available.");
    setIsLoadingInsight(false);

    // Stop simulation state after path duration + buffer
    setTimeout(() => setIsSimulating(false), res.timeOfFlight * 1000 + 100);
  }, [params, mode]);

  const chartData = result ? result.path.filter((_, i) => i % 5 === 0).map(p => ({
    time: p.time.toFixed(1),
    height: p.position.y.toFixed(2),
    distance: Math.sqrt(p.position.x**2 + p.position.z**2).toFixed(2),
  })) : [];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar: Controls */}
      <aside className="w-80 glass flex-shrink-0 z-20 border-r border-slate-800 shadow-2xl">
        <ControlPanel 
          params={params} 
          setParams={setParams} 
          mode={mode} 
          setMode={setMode} 
          onFire={handleFire} 
        />
      </aside>

      {/* Main Content: 3D View + Analytics Overlay */}
      <main className="flex-1 relative">
        <SimulationCanvas path={result?.path || []} isSimulating={isSimulating} mode={mode} />
        
        {/* Real-time HUD */}
        <div className="absolute top-4 right-4 z-10 space-y-4">
          <div className="glass p-4 rounded-xl min-w-[200px] border border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Live Telemetry</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Max Range:</span>
                <span className="text-blue-400 font-mono font-bold">{result?.maxRange.toFixed(2) || '0.00'} m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Height:</span>
                <span className="text-emerald-400 font-mono font-bold">{result?.maxHeight.toFixed(2) || '0.00'} m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Flight Time:</span>
                <span className="text-yellow-400 font-mono font-bold">{result?.timeOfFlight.toFixed(2) || '0.00'} s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impact Vel:</span>
                <span className="text-red-400 font-mono font-bold">{result?.impactVelocity.toFixed(1) || '0.00'} m/s</span>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="glass p-4 rounded-xl w-[300px] border border-blue-500/20 shadow-blue-500/5">
             <h3 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
               <span className="animate-pulse">✨</span> AI Flight Analysis
             </h3>
             {isLoadingInsight ? (
               <div className="space-y-2">
                 <div className="h-2 bg-slate-700 rounded animate-pulse w-full"></div>
                 <div className="h-2 bg-slate-700 rounded animate-pulse w-3/4"></div>
                 <div className="h-2 bg-slate-700 rounded animate-pulse w-5/6"></div>
               </div>
             ) : (
               <p className="text-xs text-slate-300 italic leading-relaxed">
                 {aiInsight || "Fire a projectile to receive an expert physics analysis."}
               </p>
             )}
          </div>
        </div>

        {/* Bottom Analytics Dock */}
        <div className="absolute bottom-4 left-4 right-4 h-48 pointer-events-none flex gap-4">
          <div className="flex-1 glass rounded-2xl p-4 border border-slate-800/50 pointer-events-auto overflow-hidden">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Height vs. Distance (Trajectory Profile)</h4>
            <div className="h-[calc(100%-1.5rem)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="distance" hide />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="height" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-72 glass rounded-2xl p-4 border border-slate-800/50 pointer-events-auto">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Energy breakdown (Simulated)</h4>
            <div className="space-y-3 mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div><span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">Kinetic</span></div>
                  <div className="text-right text-xs font-semibold text-blue-400">{result ? '65%' : '0%'}</div>
                </div>
                <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-700">
                  <div style={{ width: result ? "65%" : "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"></div>
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div><span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">Potential</span></div>
                  <div className="text-right text-xs font-semibold text-emerald-400">{result ? '35%' : '0%'}</div>
                </div>
                <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-700">
                  <div style={{ width: result ? "35%" : "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Simple AreaChart mock or use standard Recharts Area
import { AreaChart, Area } from 'recharts';

export default App;
