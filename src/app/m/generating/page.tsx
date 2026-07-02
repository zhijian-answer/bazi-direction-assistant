import { GeneratingScreen } from "@/components/mobile/GeneratingScreen";

export default async function MobileGeneratingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <GeneratingScreen next={next} />;
}
