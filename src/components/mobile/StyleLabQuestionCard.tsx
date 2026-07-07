import type { ComponentType, SVGProps } from "react";
import { ArrowRight } from "lucide-react";

export function StyleLabQuestionCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}) {
  return (
    <article className="style-lab-question-card">
      <div className="style-lab-question-orbit" aria-hidden="true">
        <Icon />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      <ArrowRight className="style-lab-question-arrow" aria-hidden="true" />
    </article>
  );
}
