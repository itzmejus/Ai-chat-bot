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
.mw-avatar svg{width:22px;height:22px}
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

/* Pre-chat form */
.mw-form{display:flex;flex-direction:column;gap:10px;padding:4px}
.mw-form p{margin:0 0 2px;font-size:13px;color:var(--muted)}
.mw-form label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500}
.mw-form input{height:42px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font:inherit;outline:none}
.mw-form input:focus{border-color:var(--brand)}
.mw-form button{height:44px;border-radius:12px;background:var(--brand);color:var(--on-brand);font-weight:600}
.mw-form button:disabled{opacity:.6}
.mw-form .err{color:#b00008;font-weight:400}

/* Phones (the host page tells us): the iframe is full screen, so the window fills it and the launcher hides while open. */
.mw[data-mobile="true"][data-open="true"]{padding:0}
.mw[data-mobile="true"][data-open="true"] .mw-panel{border-radius:0}
.mw[data-mobile="true"][data-open="true"] .mw-launcher{display:none}
/* Dashboard preview: the window is always shown inside a fixed frame. */
.mw[data-preview="true"]{padding:14px}
`;
