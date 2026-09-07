import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.42}
        intensity={0.42}
        mipmapBlur
        kernelSize={KernelSize.MEDIUM}
      />
      <Vignette offset={0.32} darkness={0.48} />
    </EffectComposer>
  );
}
