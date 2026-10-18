import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { AMAN_SYSTEM_PROMPT } from "./lib/aman-persona";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/ads.txt") {
      return new Response("google.com, pub-3637142912999396, DIRECT, f08c47fec0942fa0\n", {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "Content-Type",
          },
        });
      }

      if (request.method === "POST") {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            messages?: { role: string; content: string }[];
          };
          const userMessages = Array.isArray(body?.messages) ? body.messages : [];

          // Forward to AWS Gemini Web2API on HiveCloud
          const hiveResponse = await fetch("https://hivecloud.in/api/chat.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AmanAlriaPortfolio/1.0",
              "Origin": "https://amanalria.in",
            },
            body: JSON.stringify({
              model: "gemini-3.1-pro",
              stream: false,
              messages: [
                { role: "system", content: AMAN_SYSTEM_PROMPT },
                ...userMessages.slice(-10),
              ],
            }),
          });

          if (!hiveResponse.ok) {
            throw new Error(`HiveCloud API returned HTTP ${hiveResponse.status}`);
          }

          const data = (await hiveResponse.json().catch(() => ({}))) as {
            choices?: { message?: { content?: string } }[];
          };
          const reply =
            data?.choices?.[0]?.message?.content ??
            "Hey! Thanks for reaching out. Feel free to contact me directly at amanalria9@gmail.com.";

          return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
            },
          });
        } catch (err) {
          console.error("Chatbot API proxy error:", err);
          return new Response(
            JSON.stringify({
              reply:
                "I'm experiencing a quick connection delay with the AI server. You can also reach me directly at amanalria9@gmail.com or call +91 70733 61989!",
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "access-control-allow-origin": "*",
              },
            },
          );
        }
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
