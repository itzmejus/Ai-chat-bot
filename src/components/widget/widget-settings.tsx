"use client";

import { Check, CheckCircle2, Code2, Copy, Globe, Palette, Plus, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { normalizeDomain } from "@/lib/widget-domains";
import type { FormState } from "@/server/actions/auth";
import { saveWidgetSettingsAction } from "@/server/actions/widget";

export type WidgetSettingsValues = {
  brandColor: string;
  logoUrl: string;
  position: "left" | "right";
  preChatForm: boolean;
  assistantName: string;
  greeting: string;
  allowedDomains: string[];
};

const PRESETS = ["#0066ff", "#1b1b20", "#00a04a", "#7c4dff", "#e11d48", "#f97316", "#0891b2", "#b45309"];

function SectionHeader({ icon: Icon, title, description, color }: { icon: LucideIcon; title: string; description: string; color: string }) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ color, backgroundColor: `color-mix(in oklab, ${color} 13%, white)` }}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

/**
 * Widget settings with a live preview. The preview is the real widget in an
 * iframe; unsaved changes are pushed to it with postMessage as the form changes.
 */
export function WidgetSettings({
  initial,
  canEdit,
  embedCode,
  previewUrl,
  widgetOrigin,
}: {
  initial: WidgetSettingsValues;
  canEdit: boolean;
  embedCode: string;
  previewUrl: string;
  widgetOrigin: string;
}) {
  const t = useTranslations();
  const [values, setValues] = useState(initial);
  const [domainDraft, setDomainDraft] = useState("");
  const [domainError, setDomainError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(saveWidgetSettingsAction, undefined);
  const errors = state?.fieldErrors ?? {};
  const frame = useRef<HTMLIFrameElement>(null);

  const set = <K extends keyof WidgetSettingsValues>(key: K, value: WidgetSettingsValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  // Push the current (possibly unsaved) settings to the preview.
  const pushPreview = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      {
        type: "chat-widget:preview",
        config: {
          brandColor: values.brandColor,
          logoUrl: values.logoUrl.trim() || null,
          position: values.position,
          preChatForm: values.preChatForm,
          assistantName: values.assistantName,
          greeting: values.greeting,
        },
      },
      widgetOrigin,
    );
  }, [values, widgetOrigin]);
  useEffect(pushPreview, [pushPreview]);

  function addDomain() {
    const domain = normalizeDomain(domainDraft);
    if (!domain) {
      setDomainError(domainDraft.trim());
      return;
    }
    if (!values.allowedDomains.includes(domain)) set("allowedDomains", [...values.allowedDomains, domain]);
    setDomainDraft("");
    setDomainError(null);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is selectable, so it can still be copied by hand.
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <form action={action} className="flex min-w-0 flex-col gap-6">
        <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
          {/* Appearance */}
          <Card>
            <SectionHeader icon={Palette} title={t("widget.appearanceTitle")} description={t("widget.appearanceSubtitle")} color="#7c4dff" />
            <CardContent className="flex flex-col gap-5">
              <FormField id="brandColor" label={t("widget.brandColor")} error={errors.brandColor}>
                <div className="flex flex-wrap items-center gap-2.5">
                  {PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={color}
                      aria-pressed={values.brandColor.toLowerCase() === color}
                      onClick={() => set("brandColor", color)}
                      className="flex size-9 items-center justify-center rounded-full text-white ring-offset-2 transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-foreground"
                      style={{ backgroundColor: color }}
                    >
                      {values.brandColor.toLowerCase() === color && <Check className="size-4" strokeWidth={3} />}
                    </button>
                  ))}
                  <label className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-input bg-background ps-1 pe-3 text-sm">
                    <input
                      id="brandColor"
                      name="brandColor"
                      type="color"
                      value={values.brandColor}
                      onChange={(e) => set("brandColor", e.target.value)}
                      aria-label={t("widget.customColor")}
                      className="size-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <span dir="ltr" className="font-mono text-xs uppercase">
                      {values.brandColor}
                    </span>
                  </label>
                </div>
              </FormField>

              <div className="flex flex-col gap-2">
                <span className="text-sm leading-none font-medium">{t("widget.position")}</span>
                <div className="grid grid-cols-2 gap-2.5 sm:max-w-sm">
                  {(["right", "left"] as const).map((side) => (
                    <label
                      key={side}
                      className={cn(
                        "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3 text-sm font-medium transition-colors",
                        values.position === side ? "border-primary bg-accent/60" : "border-border/80 bg-background hover:border-primary/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="position"
                        value={side}
                        checked={values.position === side}
                        onChange={() => set("position", side)}
                        className="sr-only"
                      />
                      {/* Mini page with a dot where the bubble goes (physical left/right, not text direction) */}
                      <span dir="ltr" className="flex h-12 items-end rounded-md bg-muted p-1.5" style={{ justifyContent: side === "right" ? "flex-end" : "flex-start" }}>
                        <span className="size-3.5 rounded-full" style={{ backgroundColor: values.brandColor }} />
                      </span>
                      {t(side === "right" ? "widget.positionRight" : "widget.positionLeft")}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="assistantName" label={t("widget.assistantName")} error={errors.assistantName}>
                  <Input
                    id="assistantName"
                    name="assistantName"
                    dir="auto"
                    value={values.assistantName}
                    onChange={(e) => set("assistantName", e.target.value)}
                    maxLength={40}
                    required
                  />
                </FormField>
                <FormField id="logoUrl" label={t("widget.logoUrl")} hint={t("common.optional")} error={errors.logoUrl}>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    dir="ltr"
                    type="url"
                    placeholder="https://"
                    value={values.logoUrl}
                    onChange={(e) => set("logoUrl", e.target.value)}
                  />
                </FormField>
              </div>
              <p className="-mt-3 text-xs text-muted-foreground">{t("widget.logoHint")}</p>

              <FormField id="greeting" label={t("widget.greeting")} error={errors.greeting}>
                <Textarea id="greeting" name="greeting" dir="auto" rows={2} value={values.greeting} onChange={(e) => set("greeting", e.target.value)} maxLength={300} required />
              </FormField>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-background p-3.5">
                <input
                  type="checkbox"
                  name="preChatForm"
                  checked={values.preChatForm}
                  onChange={(e) => set("preChatForm", e.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium">{t("widget.preChatForm")}</span>
                  <span className="block text-xs text-muted-foreground">{t("widget.preChatHint")}</span>
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Allowed websites */}
          <Card>
            <SectionHeader icon={Globe} title={t("widget.domainsTitle")} description={t("widget.domainsSubtitle")} color="#00a04a" />
            <CardContent className="flex flex-col gap-4">
              <input type="hidden" name="allowedDomains" value={values.allowedDomains.join("\n")} />
              <div className="flex gap-2">
                <Input
                  dir="ltr"
                  value={domainDraft}
                  placeholder={t("widget.domainPlaceholder")}
                  aria-label={t("widget.domainsTitle")}
                  aria-invalid={!!domainError}
                  onChange={(e) => {
                    setDomainDraft(e.target.value);
                    setDomainError(null);
                  }}
                  onKeyDown={(e) => {
                    // Enter adds the website instead of submitting the whole form.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDomain();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="lg" className="h-10" onClick={addDomain} disabled={!domainDraft.trim()}>
                  <Plus />
                  {t("widget.addDomain")}
                </Button>
              </div>
              {domainError !== null && <p className="-mt-2 text-sm text-destructive">{t("errors.domain", { value: domainError })}</p>}
              {errors.allowedDomains && <p className="-mt-2 text-sm text-destructive">{t(errors.allowedDomains)}</p>}

              {values.allowedDomains.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {values.allowedDomains.map((domain) => (
                    <li key={domain} className="flex items-center gap-1 rounded-full bg-[#e7f8ee] py-0.5 ps-3 pe-0.5 text-sm font-medium text-success">
                      <span dir="ltr">{domain}</span>
                      <button
                        type="button"
                        aria-label={t("widget.removeDomain", { domain })}
                        onClick={() => set("allowedDomains", values.allowedDomains.filter((d) => d !== domain))}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-success/15"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">{t("widget.noDomains")}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("widget.localhostTip")}</p>
            </CardContent>
          </Card>
        </fieldset>

        {canEdit ? (
          <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? t("common.saving") : t("widget.save")}
            </Button>
            {state?.error && (
              <p role="alert" className="text-sm text-destructive">
                {t(state.error)}
              </p>
            )}
            {state?.ok && !pending && (
              <p role="status" className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="size-4" />
                {t("widget.saved")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("widget.ownerOnlyNote")}</p>
        )}

        {/* Embed code */}
        <Card>
          <SectionHeader icon={Code2} title={t("widget.embedTitle")} description={t("widget.embedSubtitle")} color="#0066ff" />
          <CardContent className="flex flex-col gap-3">
            <pre dir="ltr" className="overflow-x-auto rounded-xl bg-sidebar p-4 text-[13px] leading-relaxed text-[#d7e6ff]">
              <code>{embedCode}</code>
            </pre>
            <Button type="button" variant="outline" className="w-fit" onClick={copyCode}>
              {copied ? <Check className="text-success" /> : <Copy />}
              {copied ? t("widget.copied") : t("widget.copy")}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Live preview */}
      <Card className="xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>{t("widget.previewTitle")}</CardTitle>
          <CardDescription>{t("widget.previewHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(135deg,#eef4ff,#f6f6f7)]">
            <iframe ref={frame} src={previewUrl} title={t("widget.previewTitle")} onLoad={pushPreview} className="block h-[38rem] max-h-[max(24rem,calc(100dvh-21rem))] w-full border-0 xl:h-[40rem]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
