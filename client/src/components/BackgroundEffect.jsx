import { useEffect, useState } from "react";
import UnicornScene from "unicornstudio-react";

export default function BackgroundEffect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">

      <UnicornScene
        projectId="gKrakBXnyy95ENsOctBm"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js"
      />

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}