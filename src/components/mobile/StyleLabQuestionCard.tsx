import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function StyleLabQuestionCard({
  iconSrc,
  title,
  body,
}: {
  iconSrc: string;
  title: string;
  body: string;
}) {
  return (
    <article className="style-lab-question-card">
      <div className="style-lab-question-orbit" aria-hidden="true">
        <Image src={iconSrc} alt="" width={286} height={170} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      <ArrowRight className="style-lab-question-arrow" aria-hidden="true" />
    </article>
  );
}
