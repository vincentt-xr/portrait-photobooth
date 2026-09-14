import { Html } from "@react-three/drei";

export const HandDiscoveryPrompt = ({ visible }: { visible: boolean }) => (
  <Html fullscreen style={{ pointerEvents: "none" }}>
    <div
      aria-hidden={!visible}
      className={`hand-discovery-prompt${visible ? "" : " hand-discovery-prompt--hidden"}`}
    >
      <div className="hand-discovery-prompt__label">Show Your Hand to see what happen</div>
    </div>
  </Html>
);
