# Portrait Photobooth Remix Guide

This is a portrait-segmented photobooth. It places the user in a Photopea-designed
scene: the replacement background is behind the person, the podium overlays their
lower body, and the floral foreground overlays everything.

## Experience flow

1. Portrait segmentation separates the person from the camera background.
2. One of five Photopea scenes is active.
3. The podium and foreground move horizontally with face tracking.
4. Showing an open palm selects a different random scene.
5. Ambient camera flashes run independently of tracking and gesture input.

## Main edit points

- `src/podiumPhotopeaScene.ts` — scene assets, podium and foreground dimensions,
  Vincentt transforms, render order, and the initial scene.
- `src/Scene.tsx` — open-palm interaction, head-parallax strengths, discovery
  prompt, and screen-space layer composition.
- `src/PodiumPhotopeaSceneContext.tsx` — random scene selection and cooldown.
- `src/AmbientCameraFlash.tsx` — flash cadence, intensity, duration, and
  double-burst chance.
- `src/HandDiscoveryPrompt.tsx` and `src/index.css` — instruction copy and visual
  styling.
- `public/assets/photopea-export/` — the background (`bg`), podium (`p`), and
  foreground (`fg`) assets for all five scenes.

## Layer contract

1. `VideoBackground` custom background — behind the person.
2. Segmented camera person — above the replacement background.
3. Podium `ScreenImage` — masks the person's lower body.
4. Foreground `ScreenImage` — highest Photopea composition layer.
5. `AmbientCameraFlash` — native camera-attached top render-order layer.

Keep the podium below the foreground. Change render order only when deliberately
changing this compositing contract.

## Safe customization

- Replace a scene by adding matching `bg`, `p`, and `fg` PNGs and registering them
  in `src/podiumPhotopeaScene.ts`.
- Tune `PODIUM_MAX_HEAD_OFFSET` and `FOREGROUND_MAX_HEAD_OFFSET` in `src/Scene.tsx`
  to change the parallax depth.
- Tune `SCENE_CHANGE_COOLDOWN_MS` in `src/PodiumPhotopeaSceneContext.tsx` if scene
  switching feels too fast or slow.
- Tune the constants in `src/AmbientCameraFlash.tsx` to make flashes calmer or more
  active without affecting tracking.

## Runtime boundaries

Do not edit `src/main.tsx` for normal remixes.

`src/App.tsx` owns the Vincentt runtime shell and this project's segmentation
compositor. Edit it only when changing the camera, portrait segmentation, or
replacement-background architecture.

## Verification

```sh
pnpm typecheck
pnpm build
```

The broader starter template has unrelated lint findings in `App.tsx` and QA test
files. The Portrait Photobooth feature files are lint-clean.

## First task for a new remix session

Replace one complete Photopea scene in `src/podiumPhotopeaScene.ts`. Keep the
layer contract and interaction code unchanged until the new artwork is aligned.
