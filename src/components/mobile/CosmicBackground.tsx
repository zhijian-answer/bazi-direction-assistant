import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";
import Image from "next/image";

type CosmicBackgroundProps = {
  variant?: "home" | "bazi" | "zodiac" | "ziwei";
};

export function CosmicBackground({ variant = "home" }: CosmicBackgroundProps) {
  return (
    <div className={`cosmic-background cosmic-background--${variant}`} aria-hidden="true">
      <Image className="cosmic-background__instrument" src={armillaryImage} alt="" sizes="390px" />
      <svg viewBox="0 0 430 1180" preserveAspectRatio="xMidYMin slice">
        <g className="cosmic-background__orbits" fill="none">
          <ellipse className="cosmic-background__orbit" pathLength="1" cx="350" cy="164" rx="232" ry="92" transform="rotate(-24 350 164)" />
          <ellipse className="cosmic-background__orbit cosmic-background__orbit--delay" pathLength="1" cx="350" cy="164" rx="176" ry="62" transform="rotate(18 350 164)" />
          <circle className="cosmic-background__orbit cosmic-background__orbit--late" pathLength="1" cx="350" cy="164" r="116" />
          <path className="cosmic-background__orbit cosmic-background__orbit--delay" pathLength="1" d="M-36 348C92 288 202 318 310 402S472 496 506 438" />
          <path className="cosmic-background__orbit cosmic-background__orbit--late" pathLength="1" d="M-58 792C78 730 224 752 350 842S492 946 516 900" />
          <circle className="cosmic-background__ticks" cx="350" cy="164" r="138" />
        </g>
        <g className="cosmic-background__data-lines" fill="none">
          <path d="M22 112H118M22 118H82" />
          <path d="M292 544H407M324 550H407" />
          <path d="M24 1008H142M24 1014H96" />
        </g>
        <g className="cosmic-background__nodes">
          <circle className="cosmic-background__node" cx="170" cy="218" r="3" />
          <circle className="cosmic-background__node cosmic-background__node--delay" cx="396" cy="277" r="2.5" />
          <circle className="cosmic-background__node cosmic-background__node--late" cx="78" cy="371" r="2.5" />
          <circle className="cosmic-background__node" cx="340" cy="781" r="3" />
          <circle className="cosmic-background__node cosmic-background__node--delay" cx="112" cy="846" r="2" />
        </g>
      </svg>
      <div className="cosmic-background__calibration" />
    </div>
  );
}
