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
import { useEffect, useMemo, useState } from "react";
import { ScreenImage, ScreenSpaceUI } from "@vincentt-xr/sdk";
import {
  GestureTracker,
  GestureTrigger,
  useFaceDetection,
} from "@vincentt-xr/sdk/tracking";
import { usePodiumPhotopeaScene } from "./PodiumPhotopeaSceneContext";
import { HandDiscoveryPrompt } from "./HandDiscoveryPrompt";
import { AmbientCameraFlash } from "./AmbientCameraFlash";

const PODIUM_MAX_HEAD_OFFSET = 48;
const FOREGROUND_MAX_HEAD_OFFSET = -8;

const headSineOffset = (centerX: number | undefined, maxOffset: number) => {
  const normalizedHeadX =
    centerX === undefined ? 0 : Math.max(-1, Math.min(1, (centerX - 0.5) * 2));
  return Math.sin(normalizedHeadX * (Math.PI / 2)) * maxOffset;
};

const HeadReactivePodium = ({ centerX }: { centerX: number | undefined }) => {
  const { scene } = usePodiumPhotopeaScene();
  const transform = useMemo(() => {
    const horizontalOffset = headSineOffset(centerX, PODIUM_MAX_HEAD_OFFSET);

    return {
      ...scene.podium.transform,
      position: {
        ...scene.podium.transform.position,
        x: scene.podium.transform.position.x + horizontalOffset,
      },
    };
  }, [centerX, scene]);

  return (
    <ScreenImage
      name="podium"
      src={scene.podium.src}
      fit="contain"
      transparent
      alphaTest={0.01}
      transform={transform}
    />
  );
};

const HeadReactiveForeground = ({
  centerX,
}: {
  centerX: number | undefined;
}) => {
  const { scene } = usePodiumPhotopeaScene();
  const transform = useMemo(() => {
    // Negative range deliberately counter-moves the foreground against the
    // podium, creating the close-layer parallax effect.
    const horizontalOffset = headSineOffset(
      centerX,
      FOREGROUND_MAX_HEAD_OFFSET,
    );

    return {
      ...scene.foreground.transform,
      position: {
        ...scene.foreground.transform.position,
        x: scene.foreground.transform.position.x + horizontalOffset,
      },
    };
  }, [centerX, scene]);

  return (
    <ScreenImage
      name="foreground"
      src={scene.foreground.src}
      fit="stretch"
      transparent
      alphaTest={0.01}
      transform={transform}
    />
  );
};

export const Scene = () => {
  const faceDetection = useFaceDetection({ targetFps: 24 });
  const { chooseRandomNextScene, scene } = usePodiumPhotopeaScene();
  const [showDiscoveryPrompt, setShowDiscoveryPrompt] = useState(true);

  useEffect(() => {
    if (faceDetection.justDetected) {
      // eslint-disable-next-line no-console
      console.info("[PodiumPhotobooth] Face tracking detected");
    }
    if (faceDetection.justLost) {
      // eslint-disable-next-line no-console
      console.info("[PodiumPhotobooth] Face tracking lost");
    }
  }, [faceDetection.justDetected, faceDetection.justLost]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      "[PodiumPhotobooth] Gesture tracking ready: show an open palm to change scenes",
    );
  }, []);

  return (
    <>
      <GestureTracker />
      <GestureTrigger
        // GestureTrigger is intentionally one-shot. A new scene key remounts
        // it after a successful change, so lowering then showing the palm
        // again can select the next random scene.
        key={scene.id}
        gestures={["open_palm"]}
        debounceMs={800}
        onTrigger={() => {
          // eslint-disable-next-line no-console
          console.info("[PodiumPhotobooth] Open-palm gesture detected");
          setShowDiscoveryPrompt(false);
          chooseRandomNextScene();
        }}
      />
      <HandDiscoveryPrompt visible={showDiscoveryPrompt} />
      <AmbientCameraFlash />
      <ScreenSpaceUI>
        {/* Above the segmented person: the podium masks their lower body. */}
        <HeadReactivePodium centerX={faceDetection.face?.bounds.centerX} />

        {/* Highest layer: flowers and petals deliberately overlay the whole scene. */}
        <HeadReactiveForeground centerX={faceDetection.face?.bounds.centerX} />
      </ScreenSpaceUI>
    </>
  );
};
