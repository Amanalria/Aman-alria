import { Canvas } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Suspense } from "react";

/**
 * Soft WebGL ambience behind the hero: slow, pale blue distorted spheres.
 * Deliberately low-contrast so the giant type and the portrait stay dominant.
 */
function Blobs() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
      <Float speed={0.9} rotationIntensity={0.6} floatIntensity={1.1}>
        <Sphere args={[1.6, 96, 96]} position={[-2.4, 0.6, -1]}>
          <MeshDistortMaterial color="#d9e6ff" distort={0.35} speed={1.1} roughness={0.9} />
        </Sphere>
      </Float>
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.3}>
        <Sphere args={[1.1, 96, 96]} position={[2.7, -0.8, -1.4]}>
          <MeshDistortMaterial color="#e8ecff" distort={0.42} speed={0.9} roughness={0.95} />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <Sphere args={[0.6, 64, 64]} position={[1.2, 1.5, -0.6]}>
          <MeshDistortMaterial color="#c9dbff" distort={0.5} speed={1.4} roughness={0.9} />
        </Sphere>
      </Float>
    </>
  );
}

export default function HeroAmbience() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.6]} gl={{ alpha: true }}>
      <Suspense fallback={null}>
        <Blobs />
      </Suspense>
    </Canvas>
  );
}
