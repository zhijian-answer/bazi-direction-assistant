import type { PublicUser } from "./types";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: PublicUser | null | undefined) {
  if (!user) {
    return false;
  }
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return false;
  }
  return adminEmails.includes(user.email.toLowerCase());
}
