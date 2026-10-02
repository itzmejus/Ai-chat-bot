/**
 * Server-Sent Events helper. `run` receives a `send(event, data)` function; the
 * stream closes when `run` returns. Errors are logged and reported to the
 * client as an `error` event rather than a broken connection.
 */
export function sseResponse(
  run: (send: (event: string, data: unknown) => void, signal: AbortSignal) => Promise<void>,
  request?: Request,
): Response {
  const encoder = new TextEncoder();
  const abort = new AbortController();
  request?.signal.addEventListener("abort", () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed || abort.signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true; // client went away
        }
      };
      try {
        await run(send, abort.signal);
      } catch (err) {
        console.error("[sse] stream failed", err);
        send("error", { error: "errors.generic" });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // tell proxies not to buffer the stream
    },
  });
}
