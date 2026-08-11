import { GenericGeneratingV22 } from "@/components/figma-v22/GenericGeneratingV22";

export default async function MobileGeneratingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <GenericGeneratingV22 next={next} />;
}
