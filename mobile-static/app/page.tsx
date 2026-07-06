import { redirect } from "next/navigation";

export default function StaticIndexPage() {
  redirect(`${process.env.PAGES_BASE_PATH || ""}/m`);
}
