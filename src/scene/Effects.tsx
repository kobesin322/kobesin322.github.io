import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.18}
        intensity={0.85}
        mipmapBlur
        kernelSize={KernelSize.LARGE}
      />
      <Vignette offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}
