/** Styles for the chat iframe. `--brand` and `--on-brand` are set from the business's settings. */
export const STYLES = `
*{box-sizing:border-box}
html,body{height:100%;margin:0;background:transparent;overflow:hidden}
.mw{--brand:#2563eb;--on-brand:#fff;--ink:#1b1b20;--muted:#62616d;--line:#e4e4e7;--canvas:#f6f6f7;
  position:fixed;inset:0;font:14px/1.5 "Segoe UI",system-ui,-apple-system,"Noto Sans Arabic","Geeza Pro",Tahoma,sans-serif;color:var(--ink);
  display:flex;flex-direction:column;justify-content:flex-end;padding:16px;gap:12px;pointer-events:none}
.mw>*{pointer-events:auto}
.mw[data-side="left"]{align-items:flex-start}
.mw[data-side="right"]{align-items:flex-end}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--brand);outline-offset:2px}

/* Launcher bubble */
.mw-launcher{width:60px;height:60px;flex:none;border-radius:50%;background:var(--brand);color:var(--on-brand);display:grid;place-items:center;
  box-shadow:0 8px 24px rgb(0 0 0/.22),0 2px 6px rgb(0 0 0/.12);transition:transform .18s ease}
.mw-launcher:hover{transform:scale(1.06)}
.mw-launcher svg{width:28px;height:28px;grid-area:1/1;transition:opacity .15s,transform .2s}
.mw-launcher .i-chat{width:34px;height:31px}
.mw-launcher .i-close{opacity:0;transform:rotate(-45deg)}
.mw[data-open="true"] .mw-launcher .i-chat{opacity:0;transform:rotate(45deg)}
.mw[data-open="true"] .mw-launcher .i-close{opacity:1;transform:none}

/* Chat window */
.mw-panel{display:none;flex-direction:column;flex:1;min-height:0;width:100%;background:#fff;border-radius:20px;overflow:hidden;
  box-shadow:0 12px 40px rgb(16 24 40/.2),0 0 0 1px rgb(16 24 40/.06)}
.mw[data-open="true"] .mw-panel{display:flex;animation:mw-in .2s ease}
@keyframes mw-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}

.mw-header{flex:none;display:flex;align-items:center;gap:12px;padding:16px;color:var(--on-brand);
  background:radial-gradient(120% 140% at 100% 0%,rgb(255 255 255/.22),transparent 60%),var(--brand)}
.mw-avatar{position:relative;width:42px;height:42px;flex:none;border-radius:50%;background:rgb(255 255 255/.2);display:grid;place-items:center}
.mw-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#fff}
.mw-avatar svg{width:26px;height:24px}
.mw-avatar::after{content:"";position:absolute;inset-inline-end:0;bottom:0;width:11px;height:11px;border-radius:50%;background:#00c057;border:2px solid var(--brand)}
.mw-title{flex:1;min-width:0}
.mw-title b{display:block;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mw-title span{display:block;font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mw-close{width:34px;height:34px;flex:none;border-radius:50%;display:grid;place-items:center}
.mw-close:hover{background:rgb(255 255 255/.18)}
.mw-close svg{width:18px;height:18px}

.mw-messages{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px;display:flex;flex-direction:column;gap:10px;
  background-color:var(--canvas);background-image:radial-gradient(circle at 1px 1px,rgb(27 27 32/.06) 1px,transparent 0);background-size:18px 18px}
.mw-msg{max-width:84%;padding:10px 14px;border-radius:18px;white-space:pre-wrap;overflow-wrap:anywhere;animation:mw-in .18s ease}
.mw-msg.assistant,.mw-msg.agent{align-self:flex-start;background:#fff;border-end-start-radius:6px;box-shadow:0 1px 2px rgb(16 24 40/.08)}
.mw-msg.customer{align-self:flex-end;background:var(--brand);color:var(--on-brand);border-end-end-radius:6px}
.mw-msg.error{align-self:center;max-width:100%;background:#fdecec;color:#b00008;font-size:13px;text-align:center}
.mw-note{align-self:center;font-size:12px;color:var(--muted);text-align:center;padding:2px 10px}
.mw-typing{display:inline-flex;gap:4px;padding:4px 0}
.mw-typing i{width:7px;height:7px;border-radius:50%;background:#b6b6bd;animation:mw-bounce 1.2s infinite}
.mw-typing i:nth-child(2){animation-delay:.15s}.mw-typing i:nth-child(3){animation-delay:.3s}
@keyframes mw-bounce{0%,60%,100%{transform:none;opacity:.6}30%{transform:translateY(-4px);opacity:1}}

.mw-footer{flex:none;background:#fff;border-top:1px solid var(--line);padding:10px 12px calc(10px + env(safe-area-inset-bottom))}
.mw-footer:not(:last-child){padding-bottom:8px}
.mw-credit{flex:none;display:flex;align-items:center;justify-content:center;gap:5px;background:#fff;padding:0 12px calc(8px + env(safe-area-inset-bottom));font-size:11px;color:var(--muted);text-decoration:none}
.mw-credit b{font-weight:600;color:var(--ink)}
.mw-credit svg{width:14px;height:13px;color:var(--brand);--mark-spark:#fff}
.mw-credit:hover b{text-decoration:underline}
.mw-human{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-bottom:8px;padding:7px;border-radius:10px;font-size:13px;font-weight:500;color:var(--muted)}
.mw-human:hover:not(:disabled){background:var(--canvas);color:var(--ink)}
.mw-human:disabled{cursor:default;opacity:.6}
.mw-human svg{width:15px;height:15px}
.mw-composer{display:flex;align-items:flex-end;gap:8px}
.mw-composer textarea{flex:1;min-width:0;max-height:110px;resize:none;border:1px solid var(--line);border-radius:22px;padding:10px 14px;font:inherit;color:inherit;background:#fff;outline:none}
.mw-composer textarea:focus{border-color:var(--brand)}
.mw-send{width:42px;height:42px;flex:none;border-radius:50%;background:var(--brand);color:var(--on-brand);display:grid;place-items:center;transition:opacity .15s}
.mw-send:disabled{opacity:.45;cursor:default}
.mw-send svg{width:19px;height:19px}
[dir="rtl"] .mw-send svg{transform:scaleX(-1)}

/* Product cards under a reply: a row that scrolls sideways */
.mw-cards{display:flex;gap:10px;overflow-x:auto;margin:0 -16px;padding:2px 16px 8px;scroll-snap-type:x proximity;scrollbar-width:thin;flex:none}
.mw-card{flex:none;width:148px;display:flex;flex-direction:column;gap:4px;padding:0 0 10px;text-align:start;background:#fff;border-radius:16px;overflow:hidden;scroll-snap-align:start;
  box-shadow:0 1px 2px rgb(16 24 40/.08),0 0 0 1px rgb(16 24 40/.05);transition:transform .15s,box-shadow .15s;animation:mw-in .2s ease}
.mw-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgb(16 24 40/.14),0 0 0 1px rgb(16 24 40/.06)}
.mw-card b{padding:6px 10px 0;font-size:13px;font-weight:600;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mw-card .price{padding:0 10px;font-size:13px;font-weight:600;color:var(--brand);min-height:19px}
.mw-card[data-available="false"] .price{color:var(--muted);font-weight:500}
.mw-card[data-available="false"] img{filter:grayscale(1);opacity:.6}
.mw-card-img,.mw-detail-img{display:grid;place-items:center;background:var(--canvas);overflow:hidden;flex:none}
.mw-card-img{width:100%;aspect-ratio:4/3}
.mw-card-img img,.mw-detail-img img{width:100%;height:100%;object-fit:cover;display:block}
.mw-card-img.empty,.mw-detail-img.empty{color:#b6b6bd;background:linear-gradient(135deg,var(--canvas),#ececf1)}
.mw-card-img.empty svg{width:34px;height:34px}

/* One product in full, shown over the conversation */
.mw-detail{flex:1;min-height:0;display:flex;flex-direction:column;background:#fff;animation:mw-in .18s ease}
.mw-detail[hidden]{display:none}
.mw-panel[data-detail="true"] .mw-messages,.mw-panel[data-detail="true"] .mw-footer,.mw-panel[data-detail="true"] .mw-credit{display:none}
.mw-detail-back{flex:none;display:flex;align-items:center;gap:4px;align-self:flex-start;margin:8px;padding:6px 12px 6px 6px;border-radius:999px;font-size:13px;font-weight:600;color:var(--muted)}
.mw-detail-back:hover{background:var(--canvas);color:var(--ink)}
.mw-detail-back svg{width:18px;height:18px}
[dir="rtl"] .mw-detail-back{padding:6px 6px 6px 12px}
[dir="rtl"] .mw-detail-back svg{transform:scaleX(-1)}
.mw-detail-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.mw-detail-img{width:100%;aspect-ratio:4/3;max-height:240px}
.mw-detail-img.empty svg{width:56px;height:56px}
.mw-detail-body{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px}
.mw-detail-body h2{margin:0;font-size:19px;line-height:1.3;font-weight:700}
.mw-detail-category{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:var(--canvas);color:var(--muted)}
.mw-detail-price{margin:0;font-size:18px;font-weight:700;color:var(--brand)}
.mw-detail-off{margin:0;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;background:#fdecec;color:#b00008}
.mw-detail-text{margin:4px 0 0;white-space:pre-wrap;overflow-wrap:anywhere;color:#3b3b44;align-self:stretch}
.mw-detail-link{display:inline-flex;align-items:center;gap:5px;margin-top:4px;font-size:13px;font-weight:600;color:var(--brand);text-decoration:none}
.mw-detail-link:hover{text-decoration:underline}
.mw-detail-link svg{width:15px;height:15px}
.mw-detail-actions{flex:none;display:flex;gap:8px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line)}
.mw-detail-actions button{flex:1;height:44px;border-radius:12px;font-weight:600;font-size:14px}
.mw-detail-actions .primary{background:var(--brand);color:var(--on-brand)}
.mw-detail-actions .secondary{background:var(--canvas);color:var(--ink)}
.mw-detail-actions .secondary:hover{background:#ececf1}
.mw-detail-actions button:disabled{opacity:.5;cursor:default}

/* "Asking about: <product>" above the message box */
.mw-focus{display:flex;align-items:center;gap:6px;margin-bottom:8px;padding:6px 6px 6px 12px;border-radius:10px;background:var(--canvas);font-size:12px;color:var(--muted)}
[dir="rtl"] .mw-focus{padding:6px 12px 6px 6px}
.mw-focus span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mw-focus b{color:var(--ink);font-weight:600}
.mw-focus button{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center}
.mw-focus button:hover{background:#e4e4e7}
.mw-focus svg{width:12px;height:12px}

/* Pre-chat form */
.mw-form{display:flex;flex-direction:column;gap:10px;padding:4px}
.mw-form p{margin:0 0 2px;font-size:13px;color:var(--muted)}
.mw-form label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500}
.mw-form input{height:42px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font:inherit;outline:none}
.mw-form input:focus{border-color:var(--brand)}
.mw-form button{height:44px;border-radius:12px;background:var(--brand);color:var(--on-brand);font-weight:600}
.mw-form button:disabled{opacity:.6}
.mw-form .err{color:#b00008;font-weight:400}

/* Phones (the host page tells us): the chat is a sheet over the lower part of the page, not the whole
   screen. The launcher hides while it is open (the header's arrow closes it) to leave room for the conversation. */
.mw[data-mobile="true"][data-open="true"]{padding:8px}
.mw[data-mobile="true"][data-open="true"] .mw-launcher{display:none}
/* Touch screens zoom the page when a focused field's text is smaller than 16px. */
@media (pointer:coarse){.mw-composer textarea,.mw-form input{font-size:16px}}
/* Dashboard preview: the window is always shown inside a fixed frame. */
.mw[data-preview="true"]{padding:14px}
`;
