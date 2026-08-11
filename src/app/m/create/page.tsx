import { ProfileEditorV22 } from "@/components/figma-v22/ProfileEditorV22";

export default async function CreateMobileProfilePage({ searchParams }: { searchParams: Promise<{ mode?: string; returnTo?: string }> }) {
  const { mode, returnTo } = await searchParams;
  return <ProfileEditorV22 mode={mode === "new" ? "new" : "edit"} returnTo={returnTo} />;
}
