import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

type Props = {
  quality?: "full" | "lean";
};

export function Effects({ quality = "full" }: Props) {
  const full = quality === "full";
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} stencilBuffer={false}>
      <Bloom
        luminanceThreshold={full ? 0.44 : 0.52}
        intensity={full ? 0.36 : 0.26}
        mipmapBlur
        kernelSize={full ? KernelSize.SMALL : KernelSize.VERY_SMALL}
      />
      <Vignette offset={0.32} darkness={full ? 0.42 : 0.22} />
    </EffectComposer>
  );
}
