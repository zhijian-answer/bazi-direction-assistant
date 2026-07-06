import type { ReactNode } from "react";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";
import Image from "next/image";

export function OrbitChart({
  children,
  className = "",
  label = "黄铜天体仪结构图",
}: {
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <figure className={`xs-orbit-chart ${className}`.trim()} aria-label={label}>
      <Image src={armillaryImage} alt="" aria-hidden="true" sizes="(max-width: 430px) 100vw, 430px" />
      <figcaption>{children}</figcaption>
    </figure>
  );
}
