import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import type { Mesh, MeshBasicMaterial, OrthographicCamera } from "three";

const FLASH_DURATION_MS = 360;
const DOUBLE_FLASH_GAP_MS = 140;
const DOUBLE_FLASH_CHANCE = 0.2;
const nextDelay = () => 3_000 + Math.random() * 3_000;

/** Native R3F white flash, attached to the camera above every scene layer. */
export const AmbientCameraFlash = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const nextFlashAtRef = useRef(nextDelay());
  const flashStartedAtRef = useRef<number | null>(null);
  const secondFlashAtRef = useRef<number | null>(null);
  const hasSecondFlashRef = useRef(false);
  const isSecondFlashRef = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    const flashMesh = meshRef.current;
    if (flashMesh) camera.add(flashMesh);

    return () => {
      if (flashMesh) camera.remove(flashMesh);
    };
  }, [camera]);

  useFrame(({ camera: activeCamera, clock, size }) => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    if (!material || !mesh) return;

    const now = clock.getElapsedTime() * 1_000;
    if (
      flashStartedAtRef.current === null &&
      secondFlashAtRef.current !== null &&
      now >= secondFlashAtRef.current
    ) {
      flashStartedAtRef.current = now;
      secondFlashAtRef.current = null;
      isSecondFlashRef.current = true;
    } else if (
      flashStartedAtRef.current === null &&
      secondFlashAtRef.current === null &&
      now >= nextFlashAtRef.current
    ) {
      flashStartedAtRef.current = now;
      hasSecondFlashRef.current = Math.random() < DOUBLE_FLASH_CHANCE;
      isSecondFlashRef.current = false;
    }

    if (flashStartedAtRef.current !== null) {
      const progress = (now - flashStartedAtRef.current) / FLASH_DURATION_MS;
      const intensity = isSecondFlashRef.current ? 0.36 : 0.62;
      material.opacity = progress >= 1 ? 0 : Math.sin(progress * Math.PI) * intensity;

      if (progress >= 1) {
        flashStartedAtRef.current = null;
        if (hasSecondFlashRef.current) {
          hasSecondFlashRef.current = false;
          secondFlashAtRef.current = now + DOUBLE_FLASH_GAP_MS;
        } else {
          nextFlashAtRef.current = now + nextDelay();
        }
      }
    } else {
      material.opacity = 0;
    }

    const distance = activeCamera.near + 0.02;
    const isPerspective = activeCamera instanceof PerspectiveCamera;
    const orthographicCamera = activeCamera as OrthographicCamera;
    const height = isPerspective
      ? 2 * distance * Math.tan((activeCamera.fov * Math.PI) / 360)
      : orthographicCamera.top - orthographicCamera.bottom;
    const width = isPerspective
      ? height * (size.width / size.height)
      : orthographicCamera.right - orthographicCamera.left;

    mesh.position.set(0, 0, -distance);
    mesh.scale.set(width, height, 1);
  });

  return (
    <mesh ref={meshRef} name="ambientCameraFlash" renderOrder={2_147_483_647}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#ffffff"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};
