import { CreateProfileFlow } from "@/components/mobile/CreateProfileFlow";

export default async function CreateMobileProfilePage({ searchParams }: { searchParams: Promise<{ mode?: string; returnTo?: string }> }) {
  const { mode, returnTo } = await searchParams;
  return <CreateProfileFlow mode={mode === "new" ? "new" : "edit"} returnTo={returnTo} />;
}
