"use client";

import { Check, Code, Copy, ExternalLink, FileText, Monitor, Smartphone } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { NativeSelect } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SUBJECTS, outreachBody, outreachHtml, outreachSubject, outreachText, type OutreachFields, type OutreachSettings } from "@/lib/outreach-email";

// Your own name and address are the same in every email, so they are remembered in this browser.
// Kept in memory too, so typing still works when storage is blocked.
const SENDER_KEY = "outreach-sender";
const SENDER_EVENT = "outreach-sender-change";
let senderMemory = "";
const sender = {
  subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(SENDER_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(SENDER_EVENT, onChange);
    };
  },
  read() {
    try {
      return localStorage.getItem(SENDER_KEY) ?? senderMemory;
    } catch {
      return senderMemory;
    }
  },
  save(value: { senderName: string; senderAddress: string }) {
    senderMemory = JSON.stringify(value);
    try {
      localStorage.setItem(SENDER_KEY, senderMemory);
    } catch {}
    window.dispatchEvent(new Event(SENDER_EVENT));
  },
};

function parseSender(raw: string) {
  try {
    const saved = JSON.parse(raw || "{}") as Partial<OutreachFields>;
    return { senderName: saved.senderName ?? "", senderAddress: saved.senderAddress ?? "" };
  } catch {
    return { senderName: "", senderAddress: "" };
  }
}

const CUSTOM = "custom";

type Copied = "email" | "subject" | "html" | "text" | null;

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {hint && <span className="font-normal text-muted-foreground">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

/** Form on the left, live preview on the right, and copy buttons for each way of sending. */
export function OutreachComposer({ settings }: { settings: OutreachSettings }) {
  const [to, setTo] = useState("");
  const [business, setBusiness] = useState({ firstName: "", businessName: "", personalNote: "", subject: SUBJECTS[0] });
  const senderRaw = useSyncExternalStore(sender.subscribe, sender.read, () => "");
  const fields: OutreachFields = useMemo(() => ({ ...business, ...parseSender(senderRaw) }), [business, senderRaw]);
  const [subjectChoice, setSubjectChoice] = useState(SUBJECTS[0]);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState<Copied>(null);

  const set = (key: keyof OutreachFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (key === "senderName" || key === "senderAddress") {
      sender.save({ senderName: fields.senderName, senderAddress: fields.senderAddress, [key]: value });
    } else {
      setBusiness((b) => ({ ...b, [key]: value }));
    }
  };

  const subject = outreachSubject(fields);
  const html = useMemo(() => outreachHtml(fields, settings), [fields, settings]);
  const missing = [!fields.businessName.trim() && "business name", !fields.senderName.trim() && "your name", !fields.senderAddress.trim() && "your business address"].filter(Boolean);

  const flash = (what: Copied) => {
    setCopied(what);
    setTimeout(() => setCopied((c) => (c === what ? null : c)), 2000);
  };

  const copyText = async (what: Copied, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(what);
    } catch {
      // Clipboard blocked: nothing to do, the button simply does not confirm.
    }
  };

  /** Copies the email as formatted content, so pasting into Gmail or Outlook keeps the design. */
  const copyEmail = async () => {
    const body = outreachBody(fields, settings);
    const text = outreachText(fields, settings);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([body], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) }),
      ]);
      flash("email");
    } catch {
      await copyText("email", text);
    }
  };

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.trim())}&su=${encodeURIComponent(subject)}`;

  const copyLabel = (what: Copied, label: string) => (copied === what ? "Copied" : label);
  const copyIcon = (what: Copied, Icon: typeof Copy) => (copied === what ? <Check /> : <Icon />);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="flex flex-col gap-6 lg:sticky lg:top-32">
        <Card>
          <CardHeader>
            <CardTitle>The business</CardTitle>
            <CardDescription>Who you are writing to.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field id="to" label="Their email" hint="optional, for Open in Gmail">
              <Input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="owner@brightsmile.ae" />
            </Field>
            <Field id="firstName" label="First name" hint="leave empty for “Hi there”">
              <Input id="firstName" value={fields.firstName} onChange={set("firstName")} placeholder="Sara" />
            </Field>
            <Field id="businessName" label="Business name">
              <Input id="businessName" value={fields.businessName} onChange={set("businessName")} placeholder="Bright Smile Dental Clinic" />
            </Field>
            <Field id="personalNote" label="Personal opening line" hint="optional">
              <Textarea
                id="personalNote"
                value={fields.personalNote}
                onChange={set("personalNote")}
                placeholder="I was on brightsmile.ae and noticed there's no way to ask a question after 6 pm."
              />
            </Field>
            <Field id="subject" label="Subject line">
              <NativeSelect
                id="subject"
                value={subjectChoice}
                onChange={(e) => {
                  setSubjectChoice(e.target.value);
                  if (e.target.value !== CUSTOM) setBusiness((b) => ({ ...b, subject: e.target.value }));
                }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("{FirstName}", "[First name]")}
                  </option>
                ))}
                <option value={CUSTOM}>Write my own…</option>
              </NativeSelect>
              {subjectChoice === CUSTOM && <Input value={fields.subject} onChange={set("subject")} placeholder="Use {FirstName} to insert their name" />}
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>You</CardTitle>
            <CardDescription>Remembered in this browser for the next email.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field id="senderName" label="Your name">
              <Input id="senderName" value={fields.senderName} onChange={set("senderName")} placeholder="Justin" />
            </Field>
            <Field id="senderAddress" label="Your business address" hint="shown in the footer">
              <Input id="senderAddress" value={fields.senderAddress} onChange={set("senderAddress")} placeholder="Office 12, Business Bay, Dubai, UAE" />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex w-full flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Subject</p>
              <p className="font-semibold break-words">{subject}</p>
            </div>
            <div className="flex rounded-lg border p-0.5">
              {(["desktop", "mobile"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium", view === v ? "bg-muted text-foreground" : "text-muted-foreground")}
                >
                  {v === "desktop" ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                  {v === "desktop" ? "Desktop" : "Phone"}
                </button>
              ))}
            </div>
          </div>

          {missing.length > 0 && (
            <p className="w-full rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Still to fill in: {missing.join(", ")}.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyEmail}>
              {copyIcon("email", Copy)}
              {copyLabel("email", "Copy email")}
            </Button>
            <Button type="button" variant="outline" onClick={() => copyText("subject", subject)}>
              {copyIcon("subject", Copy)}
              {copyLabel("subject", "Copy subject")}
            </Button>
            <Button type="button" variant="outline" render={<a href={gmailUrl} target="_blank" rel="noreferrer" />}>
              <ExternalLink />
              Open in Gmail
            </Button>
            <Button type="button" variant="ghost" onClick={() => copyText("html", html)}>
              {copyIcon("html", Code)}
              {copyLabel("html", "Copy HTML code")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => copyText("text", outreachText(fields, settings))}>
              {copyIcon("text", FileText)}
              {copyLabel("text", "Copy plain text")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Copy email, then paste it into a new Gmail or Outlook message with Ctrl+V. Open in Gmail fills in their address and the subject for you. Use Copy HTML code for tools such as Brevo or Mailchimp.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border bg-[#f4f4f5]">
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox="allow-popups"
              className={cn("mx-auto block h-[1500px] border-0 bg-[#f4f4f5] transition-[width]", view === "desktop" ? "w-full" : "w-[375px] max-w-full")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
