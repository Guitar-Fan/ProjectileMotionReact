
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ProjectileState, LaunchMode } from '../types';

interface Props {
  path: ProjectileState[];
  isSimulating: boolean;
  mode: LaunchMode;
}

const SimulationCanvas: React.FC<Props> = ({ path, isSimulating, mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    projectile: THREE.Mesh;
    trail: THREE.Line;
    trajectoryLine: THREE.Line;
  } | null>(null);

  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 10, 500);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const grid = new THREE.GridHelper(1000, 100, 0x334155, 0x1e293b);
    scene.add(grid);

    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x1e293b });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Projectile
    const projGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const projMat = new THREE.MeshPhongMaterial({ 
      color: mode === LaunchMode.GUN ? 0xffcc00 : 0xef4444,
      emissive: 0x220000 
    });
    const projectile = new THREE.Mesh(projGeo, projMat);
    projectile.castShadow = true;
    scene.add(projectile);

    // Trail Line (for permanent visualization of path)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.6 });
    const lineGeo = new THREE.BufferGeometry();
    const trajectoryLine = new THREE.Line(lineGeo, lineMat);
    scene.add(trajectoryLine);

    // Current animation trail
    const trailMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const trailGeo = new THREE.BufferGeometry();
    const trail = new THREE.Line(trailGeo, trailMat);
    scene.add(trail);

    sceneRef.current = { scene, camera, renderer, projectile, trail, trajectoryLine };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Sync mode specific looks
  useEffect(() => {
    if (!sceneRef.current) return;
    const { projectile } = sceneRef.current;
    if (mode === LaunchMode.GUN) {
      (projectile.material as THREE.MeshPhongMaterial).color.set(0xffcc00);
      projectile.scale.set(0.2, 0.2, 0.5); // Bullet-ish
    } else if (mode === LaunchMode.CANNON) {
      (projectile.material as THREE.MeshPhongMaterial).color.set(0x333333);
      projectile.scale.set(1.5, 1.5, 1.5);
    } else {
      (projectile.material as THREE.MeshPhongMaterial).color.set(0xef4444);
      projectile.scale.set(0.8, 0.8, 0.8);
    }
  }, [mode]);

  // Handle Simulation Animation
  useEffect(() => {
    if (!sceneRef.current || path.length === 0) return;
    const { projectile, trail, trajectoryLine } = sceneRef.current;

    // Set full path visualization
    const points = path.map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z));
    trajectoryLine.geometry.setFromPoints(points);

    if (isSimulating) {
      startTimeRef.current = performance.now();
      const duration = path[path.length - 1].time * 1000; // Total flight time in ms
      
      const updateFrame = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Find current segment in path
        const currentTime = progress * path[path.length - 1].time;
        const index = path.findIndex(p => p.time >= currentTime);
        
        if (index !== -1) {
          const state = path[index];
          projectile.position.set(state.position.x, state.position.y, state.position.z);
          
          // Update trail up to current point
          const trailPoints = path.slice(0, index + 1).map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z));
          trail.geometry.setFromPoints(trailPoints);
        }

        if (progress < 1) {
          requestAnimationFrame(updateFrame);
        }
      };
      updateFrame();
    }
  }, [path, isSimulating]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default SimulationCanvas;
