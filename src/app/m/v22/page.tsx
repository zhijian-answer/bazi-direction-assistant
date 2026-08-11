import FigmaV22App from "@/components/figma-v22/App";
import { redirect } from "next/navigation";

export default function FigmaV22PreviewPage() {
  if (process.env.NODE_ENV === "production") redirect("/m");
  return <FigmaV22App />;
}
