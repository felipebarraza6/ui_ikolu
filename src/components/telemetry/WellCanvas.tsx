import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { CaptureKind } from "@/lib/hydro";

function WellWater({ fill }: { fill: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const current = useRef(fill);
  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    current.current += (fill - current.current) * Math.min(1, delta * 3.2);
    const height = Math.max(0.15, current.current * 6);
    mesh.scale.y = height;
    mesh.position.y = -6 + height / 2;
  });
  return (
    <mesh ref={ref} position={[0, -5.9, 0]}>
      <cylinderGeometry args={[0.82, 0.82, 1, 40]} />
      <meshPhysicalMaterial color="#22A0AC" transparent opacity={0.85} roughness={0.08} transmission={0.55} thickness={1.2} />
    </mesh>
  );
}

function WellScene({
  fill,
  accent,
  pumpRatio,
  sensorRatio,
}: {
  fill: number;
  accent: string;
  pumpRatio: number | null;
  sensorRatio: number | null;
}) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index,
        angle: (index / 10) * Math.PI * 2,
        radius: 0.2 + (index % 4) * 0.12,
        speed: 0.35 + (index % 3) * 0.15,
        offset: index / 10,
      })),
    []
  );
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const root = group.current;
    if (!root) return;
    const time = clock.getElapsedTime();
    root.children.forEach((child, index) => {
      const bubble = bubbles[index];
      if (!bubble) return;
      const phase = (time * bubble.speed * 0.2 + bubble.offset) % 1;
      const height = Math.max(0.2, fill * 6 - 0.3);
      child.position.set(
        Math.cos(bubble.angle) * bubble.radius,
        -6 + 0.2 + phase * height,
        Math.sin(bubble.angle) * bubble.radius
      );
    });
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#142E36" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[0.95, 0.16, 12, 40]} />
        <meshStandardMaterial color="#46585A" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, -3, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 6, 40, 1, true]} />
        <meshStandardMaterial color="#E8F2F1" transparent opacity={0.08} roughness={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <WellWater fill={fill} />
      {pumpRatio !== null ? (
        <mesh position={[0, -6 * pumpRatio, 0]}>
          <boxGeometry args={[0.35, 0.18, 0.35]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
        </mesh>
      ) : null}
      {sensorRatio !== null ? (
        <mesh position={[0.45, -6 * sensorRatio, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFC46B" emissive="#FFC46B" emissiveIntensity={0.4} />
        </mesh>
      ) : null}
      <group ref={group}>
        {bubbles.map((bubble) => (
          <mesh key={bubble.id}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#DFFFF6" transparent opacity={0.45} />
          </mesh>
        ))}
      </group>
      <pointLight color={accent} intensity={0.9} distance={8} position={[0, -2, 0]} />
    </group>
  );
}

function SurfaceScene({ fill, accent }: { fill: number; accent: string }) {
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const mesh = water.current;
    if (!mesh) return;
    const time = clock.getElapsedTime();
    const position = mesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      position.setZ(index, Math.sin(x * 0.6 + time * 1.4) * 0.12 + Math.cos(y * 0.5 + time) * 0.1);
    }
    position.needsUpdate = true;
    mesh.position.y = -0.2 + fill * 0.6;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#0F2028" roughness={0.92} />
      </mesh>
      <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30, 40, 40]} />
        <meshPhysicalMaterial color="#2E9BC4" transparent opacity={0.8} roughness={0.08} transmission={0.45} thickness={1.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
    </group>
  );
}

export default function WellCanvas({
  kind,
  fill,
  accent,
  pumpRatio,
  sensorRatio,
}: {
  kind: CaptureKind;
  fill: number;
  accent: string;
  pumpRatio: number | null;
  sensorRatio: number | null;
}) {
  const camera = kind === "surface" ? [7.6, 4.6, 7.6] : [6.6, 4.4, 8.2];
  const target = kind === "surface" ? [0, 0.1, 0] : [0, -1.1, 0];
  return (
    <Canvas
      key={kind}
      camera={{ position: camera as [number, number, number], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <color attach="background" args={["#0A181F"]} />
      <fog attach="fog" args={["#0A181F", 11, 30]} />
      <ambientLight color="#B8E6DA" intensity={0.55} />
      <directionalLight color="#FFF3E0" intensity={1.05} position={[5, 9, 6]} />
      <directionalLight color="#9FD4FF" intensity={0.4} position={[-6, 4, -4]} />
      {kind === "surface" ? (
        <SurfaceScene fill={fill} accent={accent} />
      ) : (
        <WellScene fill={fill} accent={accent} pumpRatio={pumpRatio} sensorRatio={sensorRatio} />
      )}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.52}
        autoRotate
        autoRotateSpeed={0.55}
        target={target as [number, number, number]}
      />
    </Canvas>
  );
}
