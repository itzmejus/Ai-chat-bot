"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { faqSchema, notesSchema, urlSourceSchema } from "@/lib/validation";
import { requireWorkspace } from "@/server/auth/session";
import { assertPublicUrl, BlockedUrlError } from "@/server/ingest/safe-fetch";
import {
  addFaqSource,
  addUrlSource,
  deleteSource,
  KnowledgeLimitError,
  resyncSource,
  saveNotes,
} from "@/server/knowledge";
import type { FormState } from "./auth";

const PAGE = "/dashboard/knowledge";

async function scope() {
  const { workspace, db } = await requireWorkspace();
  return { workspaceId: workspace.id, db, maxPages: workspace.plan.maxKnowledgePages };
}

/** Validate a form, run the operation, and map known failures to translated messages. */
async function run<S extends z.ZodType>(
  schema: S,
  formData: FormData,
  operation: (s: Awaited<ReturnType<typeof scope>>, input: z.output<S>) => Promise<void>,
): Promise<FormState> {
  const s = await scope();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { fieldErrors };
  }

  try {
    await operation(s, parsed.data);
  } catch (err) {
    if (err instanceof KnowledgeLimitError) return { error: "errors.knowledgeLimit" };
    if (err instanceof BlockedUrlError) return { fieldErrors: { url: "errors.url" } };
    console.error("[knowledge] action failed", err);
    return { error: "errors.generic" };
  }
  revalidatePath(PAGE);
  return { ok: true };
}

export async function addUrlAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return run(urlSourceSchema, formData, async (s, { url }) => {
    assertPublicUrl(url); // reject localhost/private addresses before queuing anything
    await addUrlSource(s, url);
  });
}

export async function addFaqAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return run(faqSchema, formData, (s, { question, answer }) => addFaqSource(s, question, answer));
}

export async function saveNotesAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return run(notesSchema, formData, (s, { notes }) => saveNotes(s, notes));
}

export async function resyncSourceAction(sourceId: string) {
  await resyncSource(await scope(), sourceId);
  revalidatePath(PAGE);
}

export async function deleteSourceAction(sourceId: string) {
  await deleteSource(await scope(), sourceId);
  revalidatePath(PAGE);
}
