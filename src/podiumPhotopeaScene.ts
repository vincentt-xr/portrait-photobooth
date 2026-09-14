import {
  DEFAULT_SCREEN_TRANSFORM_2D,
  type ScreenTransform2DSettings,
} from "@vincentt-xr/sdk";

type CanvasPosition = { x: number; y: number };
type CanvasSize = { width: number; height: number };

export type PodiumPhotopeaScene = {
  id: string;
  backgroundSrc: string;
  podium: { src: string; transform: ScreenTransform2DSettings };
  foreground: { src: string; transform: ScreenTransform2DSettings };
};

// ScreenImage's `transform` prop uses Vincentt's 720 × 1280 design canvas:
// center origin and +y up. Keep every scene in this transform lane.
const canvasTransform = (
  position: CanvasPosition,
  size: CanvasSize,
  renderOrder: number,
): ScreenTransform2DSettings => ({
  ...DEFAULT_SCREEN_TRANSFORM_2D,
  position,
  size,
  pivot: [0.5, 0.5],
  rotation: 0,
  scale2D: { x: 1, y: 1 },
  referencePixelsPerUnit: 32,
  renderOrder,
  overlay: true,
  visible: true,
  showTransformGuides: false,
});

const asset = (file: string) => `/assets/photopea-export/${file}`;
const podiumTopAlignedY = (height: number) => 0 - (100 + height / 2);
const FOREGROUND_SIZE: CanvasSize = { width: 780, height: 1280 };

const createScene = (
  id: string,
  backgroundFile: string,
  podiumFile: string,
  podiumSize: CanvasSize,
  foregroundFile: string,
): PodiumPhotopeaScene => ({
  id,
  backgroundSrc: asset(backgroundFile),
  podium: {
    src: asset(podiumFile),
    transform: canvasTransform(
      { x: 0, y: podiumTopAlignedY(podiumSize.height) },
      podiumSize,
      1000,
    ),
  },
  foreground: {
    src: asset(foregroundFile),
    // A shared 780 × 1280 foreground rectangle keeps every scene aligned
    // to the portrait composition while the image remains the top layer.
    transform: canvasTransform({ x: 0, y: 0 }, FOREGROUND_SIZE, 1001),
  },
});

export const podiumPhotopeaScenes: readonly PodiumPhotopeaScene[] = [
  createScene(
    "wedding-podium-1",
    "bg1.png",
    "p1.png",
    { width: 667, height: 982 },
    "fg1.png",
  ),
  createScene(
    "wedding-podium-2",
    "bg-2.png",
    "p2.png",
    { width: 627, height: 998 },
    "fg2.png",
  ),
  createScene(
    "wedding-podium-3",
    "bg3.png",
    "p3.png",
    { width: 594, height: 1014 },
    "fg3.png",
  ),
  createScene(
    "wedding-podium-4",
    "bg4.png",
    "p4.png",
    { width: 660, height: 948 },
    "fg4.png",
  ),
  createScene(
    "wedding-podium-5",
    "bg-5.png",
    "p5.png",
    { width: 710, height: 1013 },
    "fg5.png",
  ),
];

export const INITIAL_PODIUM_PHOTOPEA_SCENE_INDEX = 1;
