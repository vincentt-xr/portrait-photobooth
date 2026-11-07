// Scene.tsx — the agent's surface.
// Add SDK components and R3F primitives here.
// See GROUNDING.md for the API reference and pattern catalog.
//
// react/no-unknown-property is disabled for this file in .eslintrc.json, not by
// a directive here: R3F props (position, rotation, args) are unknown to the rule
// and every one of them errors, but this file is EMPTY of primitives until an
// agent adds some — so an in-file directive sits unused, and the lint script
// runs --report-unused-disable-directives, which makes the unused directive
// itself the error. Disabling at the config keeps the suppression true in both
// states.
//
// Every picture is a `ScreenImage` with a literal `src` and literal `anchors`, and
// the prompt is a `ScreenText` with literal `text`, so the console's visual editor
// can swap, move, resize and retype each one. Keep them written out like this:
// a `src` or an edge computed from a variable can only be changed in code.
//
// Layers, back to front: the scene's background (10), the person cut out of the
// camera (100), the podium (1000), the flowers (1001), the prompt (2000), the
// flash (5000).
import { useCallback, useRef, useState } from "react";
import { PersonCutout, ScreenImage, ScreenSpaceUI, ScreenText } from "@vincentt-xr/sdk";
import { GestureTracker, GestureTrigger, useFaceDetection } from "@vincentt-xr/sdk/tracking";
import { AmbientCameraFlash } from "./AmbientCameraFlash";
import { HeadFollow, HeadX } from "./HeadFollow";

/** The podium follows the head; the flowers counter-move against it for parallax. */
const PODIUM_FOLLOW = 48;
const FLOWERS_FOLLOW = -8;
const SCENE_CHANGE_COOLDOWN_MS = 1400;

const WeddingPodium1 = () => (
  <>
    <ScreenImage name="Background 1" src="/assets/photopea-export/bg1.png" fit="cover" opacity={1} renderOrder={10} anchors={{ left: -1, right: 1, top: 1, bottom: -1 }} />
    <HeadFollow maxOffset={PODIUM_FOLLOW}>
      <ScreenImage name="Podium 1" src="/assets/photopea-export/p1.png" fit="contain" opacity={1} transparent alphaTest={0.01} renderOrder={1000} anchors={{ left: -0.9264, right: 0.9264, top: -0.1563, bottom: -1.6906 }} />
    </HeadFollow>
    <HeadFollow maxOffset={FLOWERS_FOLLOW}>
      <ScreenImage name="Flowers 1" src="/assets/photopea-export/fg1.png" fit="stretch" opacity={1} transparent alphaTest={0.01} renderOrder={1001} anchors={{ left: -1.0833, right: 1.0833, top: 1, bottom: -1 }} />
    </HeadFollow>
  </>
);

const WeddingPodium2 = () => (
  <>
    <ScreenImage name="Background 2" src="/assets/photopea-export/bg-2.png" fit="cover" opacity={1} renderOrder={10} anchors={{ left: -1, right: 1, top: 1, bottom: -1 }} />
    <HeadFollow maxOffset={PODIUM_FOLLOW}>
      <ScreenImage name="Podium 2" src="/assets/photopea-export/p2.png" fit="contain" opacity={1} transparent alphaTest={0.01} renderOrder={1000} anchors={{ left: -0.8708, right: 0.8708, top: -0.1563, bottom: -1.7188 }} />
    </HeadFollow>
    <HeadFollow maxOffset={FLOWERS_FOLLOW}>
      <ScreenImage name="Flowers 2" src="/assets/photopea-export/fg2.png" fit="stretch" opacity={1} transparent alphaTest={0.01} renderOrder={1001} anchors={{ left: -1.0833, right: 1.0833, top: 1, bottom: -1 }} />
    </HeadFollow>
  </>
);

const WeddingPodium3 = () => (
  <>
    <ScreenImage name="Background 3" src="/assets/photopea-export/bg3.png" fit="cover" opacity={1} renderOrder={10} anchors={{ left: -1, right: 1, top: 1, bottom: -1 }} />
    <HeadFollow maxOffset={PODIUM_FOLLOW}>
      <ScreenImage name="Podium 3" src="/assets/photopea-export/p3.png" fit="contain" opacity={1} transparent alphaTest={0.01} renderOrder={1000} anchors={{ left: -0.825, right: 0.825, top: -0.1563, bottom: -1.7406 }} />
    </HeadFollow>
    <HeadFollow maxOffset={FLOWERS_FOLLOW}>
      <ScreenImage name="Flowers 3" src="/assets/photopea-export/fg3.png" fit="stretch" opacity={1} transparent alphaTest={0.01} renderOrder={1001} anchors={{ left: -1.0833, right: 1.0833, top: 1, bottom: -1 }} />
    </HeadFollow>
  </>
);

const WeddingPodium4 = () => (
  <>
    <ScreenImage name="Background 4" src="/assets/photopea-export/bg4.png" fit="cover" opacity={1} renderOrder={10} anchors={{ left: -1, right: 1, top: 1, bottom: -1 }} />
    <HeadFollow maxOffset={PODIUM_FOLLOW}>
      <ScreenImage name="Podium 4" src="/assets/photopea-export/p4.png" fit="contain" opacity={1} transparent alphaTest={0.01} renderOrder={1000} anchors={{ left: -0.9167, right: 0.9167, top: -0.1563, bottom: -1.6375 }} />
    </HeadFollow>
    <HeadFollow maxOffset={FLOWERS_FOLLOW}>
      <ScreenImage name="Flowers 4" src="/assets/photopea-export/fg4.png" fit="stretch" opacity={1} transparent alphaTest={0.01} renderOrder={1001} anchors={{ left: -1.0833, right: 1.0833, top: 1, bottom: -1 }} />
    </HeadFollow>
  </>
);

const WeddingPodium5 = () => (
  <>
    <ScreenImage name="Background 5" src="/assets/photopea-export/bg-5.png" fit="cover" opacity={1} renderOrder={10} anchors={{ left: -1, right: 1, top: 1, bottom: -1 }} />
    <HeadFollow maxOffset={PODIUM_FOLLOW}>
      <ScreenImage name="Podium 5" src="/assets/photopea-export/p5.png" fit="contain" opacity={1} transparent alphaTest={0.01} renderOrder={1000} anchors={{ left: -0.9861, right: 0.9861, top: -0.1563, bottom: -1.7391 }} />
    </HeadFollow>
    <HeadFollow maxOffset={FLOWERS_FOLLOW}>
      <ScreenImage name="Flowers 5" src="/assets/photopea-export/fg5.png" fit="stretch" opacity={1} transparent alphaTest={0.01} renderOrder={1001} anchors={{ left: -1.0833, right: 1.0833, top: 1, bottom: -1 }} />
    </HeadFollow>
  </>
);

/** The five wedding scenes an open palm cycles through, at random. */
const SCENES = [WeddingPodium1, WeddingPodium2, WeddingPodium3, WeddingPodium4, WeddingPodium5];

export const Scene = () => {
  const faceDetection = useFaceDetection({ targetFps: 24 });
  const headX = useRef<number | undefined>(undefined);
  headX.current = faceDetection.face?.bounds.centerX;

  const [sceneIndex, setSceneIndex] = useState(1);
  const [showPrompt, setShowPrompt] = useState(true);
  const lastChangeAt = useRef(0);

  const nextScene = useCallback(() => {
    const now = Date.now();
    if (now - lastChangeAt.current < SCENE_CHANGE_COOLDOWN_MS) return;
    lastChangeAt.current = now;
    setShowPrompt(false);
    setSceneIndex((current) => {
      const others = SCENES.map((_, i) => i).filter((i) => i !== current);
      return others[Math.floor(Math.random() * others.length)];
    });
  }, []);

  const ActiveScene = SCENES[sceneIndex];

  return (
    <HeadX.Provider value={headX}>
      <GestureTracker />
      {/* One-shot: the new scene's key remounts it, so lowering and showing the palm again picks another. */}
      <GestureTrigger key={sceneIndex} gestures={["open_palm"]} debounceMs={800} onTrigger={nextScene} />
      <ScreenSpaceUI>
        <ActiveScene />
        <PersonCutout renderOrder={100} />
        <ScreenText
          name="Hand prompt"
          text="SHOW YOUR HAND TO SEE WHAT HAPPENS"
          screenTransform={{ position: { x: 0, y: 0 }, size: { width: 640, height: 84 }, rotation: 0, renderOrder: 2000 }}
          textAlign="center"
          verticalAlign="center"
          fontWeight={600}
          fontSize={26}
          letterSpacing={0.08}
          color="#ffffff"
          bgColor="#120e09"
          bgOpacity={0.3}
          bgFit="text"
          borderColor="#ffffff"
          borderWidth={2}
          borderRadius={42}
          padding={20}
          visible={showPrompt}
        />
        <AmbientCameraFlash />
      </ScreenSpaceUI>
    </HeadX.Provider>
  );
};
