"use server";

import { revalidatePath } from "next/cache";

export async function refreshAdminViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/settings");
}
