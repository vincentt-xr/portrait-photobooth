# Portrait Photobooth

A Vincentt XR portrait photobooth built with React, R3F, and
`@vincentt-xr/sdk`. Portrait segmentation places the real person between a
Photopea background and two interactive overlay layers: a podium and a floral
foreground.

See [REMIX.md](./REMIX.md) for creator-facing customization instructions.

## Experience

- Five randomized Photopea scenes.
- Portrait-segmented replacement backgrounds.
- Face-driven horizontal podium and foreground parallax.
- Open-palm scene switching with a cooldown.
- Independent native camera flash effect.

## Shape

```
src/
  main.tsx            mount — never edited
  App.tsx             XR runtime shell and portrait-segmentation compositor
  Scene.tsx           interaction and screen-space composition
  podiumPhotopeaScene.ts
                      Photopea scene assets and Vincentt transforms
  PodiumPhotopeaSceneContext.tsx
                      active scene and random scene selection
  AmbientCameraFlash.tsx
                      native top-layer ambient flash
  PreviewAnchors.tsx  editor-preview integration — never edited
```

See `AGENTS.md` and `GROUNDING.md` for the SDK reference and authoring rules.

## Develop

```
pnpm install
pnpm dev          # esbuild dev server on :5173
pnpm preview      # on-device preview over a secure tunnel (needs `vincentt login`)
pnpm typecheck
pnpm build        # production bundle to dist/
```

## Release

`vincentt init` scaffolds from the **`latest` tag**, not from `main`. Merging to `main` does
not ship a template to creators — cutting a release does.

```
git tag 1.1.0 <sha>      # bare semver, no `v` prefix
git push origin 1.1.0    # the Release workflow verifies the tag, then moves `latest`
```

The Release workflow (`.github/workflows/release.yml`) installs from the frozen lockfile,
builds, and typechecks **the tagged tree** before force-updating `latest` to it. A tag that
fails leaves `latest` where it was, so a broken release cannot reach a new creator.

**Never move `latest` by hand.** It is force-updated by that workflow and nowhere else; moving
it manually decouples the pointer from the version it claims to be.

Creators can pin a specific version — `vincentt init --template 1.0.0` — which is the escape
hatch when a release turns out to be bad. That is why the version tags are immutable and only
`latest` moves.
