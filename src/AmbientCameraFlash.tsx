import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ScreenShape } from "@vincentt-xr/sdk";

const FLASH_DURATION_MS = 360;
const DOUBLE_FLASH_GAP_MS = 140;
const DOUBLE_FLASH_CHANCE = 0.2;
const nextDelay = () => 3_000 + Math.random() * 3_000;

/**
 * A camera flash every 3 to 6 seconds, sometimes a double one: a full-screen
 * rectangle above every layer whose fill fades in and out.
 *
 * Its colour and placement are literals, so the visual editor can recolour or
 * resize it. Only the fade is code. The opacity is React state, but it changes
 * only during a flash (about 20 renders a flash), and at 0 the editor's click
 * skips it, so it never covers the layers below.
 */
export const AmbientCameraFlash = () => {
  const [opacity, setOpacity] = useState(0);
  const nextFlashAt = useRef(nextDelay());
  const startedAt = useRef<number | null>(null);
  const secondAt = useRef<number | null>(null);
  const hasSecond = useRef(false);
  const isSecond = useRef(false);

  useFrame(({ clock }) => {
    const now = clock.getElapsedTime() * 1_000;
    if (startedAt.current === null && secondAt.current !== null && now >= secondAt.current) {
      startedAt.current = now;
      secondAt.current = null;
      isSecond.current = true;
    } else if (startedAt.current === null && secondAt.current === null && now >= nextFlashAt.current) {
      startedAt.current = now;
      hasSecond.current = Math.random() < DOUBLE_FLASH_CHANCE;
      isSecond.current = false;
    }

    if (startedAt.current === null) return;
    const progress = (now - startedAt.current) / FLASH_DURATION_MS;
    const peak = isSecond.current ? 0.36 : 0.62;
    if (progress >= 1) {
      startedAt.current = null;
      if (hasSecond.current) {
        hasSecond.current = false;
        secondAt.current = now + DOUBLE_FLASH_GAP_MS;
      } else {
        nextFlashAt.current = now + nextDelay();
      }
      setOpacity(0);
      return;
    }
    setOpacity(Math.sin(progress * Math.PI) * peak);
  });

  return (
    <ScreenShape
      name="Camera flash"
      settings={{ kind: "rectangle", fillColor: "#ffffff", fillOpacity: opacity }}
      transform={{ position: { x: 0, y: 0 }, size: { width: 900, height: 1600 }, rotation: 0, renderOrder: 5000 }}
      visible={opacity > 0}
    />
  );
};
