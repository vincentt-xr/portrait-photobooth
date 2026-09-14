import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  INITIAL_PODIUM_PHOTOPEA_SCENE_INDEX,
  podiumPhotopeaScenes,
  type PodiumPhotopeaScene,
} from "./podiumPhotopeaScene";

const SCENE_CHANGE_COOLDOWN_MS = 1400;

type PodiumPhotopeaSceneContextValue = {
  scene: PodiumPhotopeaScene;
  chooseRandomNextScene: () => void;
};

const PodiumPhotopeaSceneContext =
  createContext<PodiumPhotopeaSceneContextValue | null>(null);

export const PodiumPhotopeaSceneProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sceneIndex, setSceneIndex] = useState(
    INITIAL_PODIUM_PHOTOPEA_SCENE_INDEX,
  );
  const lastChangeAtRef = useRef(0);

  const chooseRandomNextScene = useCallback(() => {
    const now = Date.now();
    if (now - lastChangeAtRef.current < SCENE_CHANGE_COOLDOWN_MS) {
      // eslint-disable-next-line no-console
      console.info("[PodiumPhotobooth] Scene change ignored: cooldown active");
      return;
    }

    const candidates = podiumPhotopeaScenes.filter(
      (_, index) => index !== sceneIndex,
    );
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    const nextIndex = podiumPhotopeaScenes.indexOf(next);

    lastChangeAtRef.current = now;
    setSceneIndex(nextIndex);
    // eslint-disable-next-line no-console
    console.info(`[PodiumPhotobooth] Scene changed: ${next.id}`);
  }, [sceneIndex]);

  const value = useMemo(
    () => ({ scene: podiumPhotopeaScenes[sceneIndex], chooseRandomNextScene }),
    [chooseRandomNextScene, sceneIndex],
  );

  return (
    <PodiumPhotopeaSceneContext.Provider value={value}>
      {children}
    </PodiumPhotopeaSceneContext.Provider>
  );
};

export const usePodiumPhotopeaScene = () => {
  const context = useContext(PodiumPhotopeaSceneContext);
  if (!context) {
    throw new Error(
      "usePodiumPhotopeaScene must be used inside PodiumPhotopeaSceneProvider",
    );
  }
  return context;
};
