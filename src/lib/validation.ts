import { z } from "zod";

/**
 * Shared Zod schemas. Error messages are translation keys (see src/i18n/messages)
 * so forms can show them in the user's language.
 */

export const INDUSTRIES = ["clinic", "real_estate", "salon", "restaurant", "car_rental", "retail", "other"] as const;
export const LANGUAGES = ["en", "ar", "both"] as const;
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "errors.email" }));

export const signupSchema = z.object({
  name: z.string().trim().min(2, "errors.name").max(80, "errors.name"),
  email,
  password: z.string().min(8, "errors.passwordLength").max(72, "errors.passwordLength"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "errors.required").max(72),
});

/** Optional phone number in a loose international format, e.g. +971 50 123 4567. */
const optionalPhone = z
  .string()
  .trim()
  .max(25)
  .refine((v) => v === "" || /^\+?[0-9][0-9\s-]{6,20}$/.test(v), "errors.phone")
  .transform((v) => v || null);

/** Optional website; "example.ae" is accepted and normalised to "https://example.ae". */
const optionalWebsite = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (v === "") return true;
    try {
      const u = new URL(v);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "errors.url")
  .transform((v) => v || null);

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "errors.time");

export const dayHoursSchema = z
  .object({ closed: z.boolean(), open: time, close: time })
  .refine((d) => d.closed || d.open !== d.close, "errors.time");

export const workingHoursSchema = z.object(
  Object.fromEntries(DAYS.map((d) => [d, dayHoursSchema])) as Record<Day, typeof dayHoursSchema>,
);
export type WorkingHours = z.infer<typeof workingHoursSchema>;

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, "errors.businessName").max(100, "errors.businessName"),
  industry: z.enum(INDUSTRIES, "errors.required"),
  websiteUrl: optionalWebsite,
  defaultLanguage: z.enum(LANGUAGES, "errors.required"),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  workingHours: workingHoursSchema,
});
export type WorkspaceInput = z.infer<typeof workspaceSchema>;

/** UAE-friendly default: Sunday closed, otherwise 09:00–18:00. */
export const DEFAULT_WORKING_HOURS: WorkingHours = Object.fromEntries(
  DAYS.map((d) => [d, { closed: d === "sun", open: "09:00", close: "18:00" }]),
) as WorkingHours;

// ------------------------------------------------------------ knowledge base

/** Required website address; "example.ae" is normalised to "https://example.ae". */
export const urlSourceSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "errors.url")
    .max(300, "errors.url")
    .pipe(optionalWebsite)
    .refine((v): v is string => v !== null, "errors.url"),
});

export const faqSchema = z.object({
  question: z.string().trim().min(3, "errors.faqQuestion").max(300, "errors.faqQuestion"),
  answer: z.string().trim().min(1, "errors.faqAnswer").max(5000, "errors.faqAnswer"),
});

export const notesSchema = z.object({
  notes: z.string().trim().max(20_000, "errors.notesLength"),
});

// ------------------------------------------------------------ assistant

export const TONES = ["friendly", "formal"] as const;

export const assistantSettingsSchema = z.object({
  assistantName: z.string().trim().min(1, "errors.assistantName").max(40, "errors.assistantName"),
  greeting: z.string().trim().min(1, "errors.greeting").max(300, "errors.greeting"),
  tone: z.enum(TONES, "errors.required"),
  extraInstructions: z.string().trim().max(2000, "errors.extraInstructions"),
});
