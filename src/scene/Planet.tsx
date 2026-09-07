import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  Color,
  ShaderMaterial,
  type Group,
} from "three";
import { PLANET_CENTER, PLANET_RADIUS } from "./world";
import { getPlanetTextures } from "./textures";

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.8);
    gl_FragColor = vec4(uColor, fresnel * 0.72);
  }
`;

export function Planet() {
  const group = useRef<Group>(null);
  const textures = useMemo(() => getPlanetTextures(), []);
  const atmosphere = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#7fa36a") } },
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.018;
  });

  return (
    <group ref={group} position={PLANET_CENTER}>
      <mesh>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={textures.map}
          emissiveMap={textures.emissiveMap}
          emissive="#d4a017"
          emissiveIntensity={0.55}
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[PLANET_RADIUS, 48, 48]} />
        <primitive object={atmosphere} attach="material" />
      </mesh>
    </group>
  );
}
