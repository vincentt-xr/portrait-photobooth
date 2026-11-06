import { createContext, useContext, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useScreenSpace } from "@vincentt-xr/sdk/low-level";
import type { Group } from "three";

/** The face's horizontal centre in feed space (0..1), or undefined with no face. */
export const HeadX = createContext<MutableRefObject<number | undefined>>({ current: undefined });

/**
 * Slides its children sideways as the head moves, by at most `maxOffset` design pixels
 * (720-wide canvas). A negative value counter-moves the layer for parallax.
 *
 * The offset lives on this group, never on the images inside: their `anchors` stay
 * number literals, so the console's visual editor can still swap, move and resize them.
 */
export const HeadFollow = ({ maxOffset, children }: { maxOffset: number; children: ReactNode }) => {
  // The group is a list row in the editor; this names it there.
  const group = useRef<Group>(null);
  const headX = useContext(HeadX);
  const { width } = useScreenSpace();

  useFrame(() => {
    if (!group.current) return;
    const x = headX.current;
    const normalized = x === undefined ? 0 : Math.max(-1, Math.min(1, (x - 0.5) * 2));
    group.current.position.x = Math.sin(normalized * (Math.PI / 2)) * maxOffset * (width / 720);
  });

  return (
    <group ref={group} name="Follows the head">
      {children}
    </group>
  );
};
