import { DAYS, workspaceSchema } from "@/lib/validation";

/**
 * Turn the flat fields of the business profile form (used at onboarding and in
 * Settings) into the shape `workspaceSchema` validates.
 */
export function parseWorkspaceForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "");
  return workspaceSchema.safeParse({
    name: text("name"),
    industry: text("industry"),
    websiteUrl: text("websiteUrl"),
    defaultLanguage: text("defaultLanguage"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    workingHours: Object.fromEntries(
      DAYS.map((d) => [
        d,
        {
          closed: formData.get(`hours.${d}.closed`) === "on",
          open: text(`hours.${d}.open`) || "09:00",
          close: text(`hours.${d}.close`) || "18:00",
        },
      ]),
    ),
  });
}
