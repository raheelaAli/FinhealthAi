// src/app/api/alerts/sse/route.ts
// Server-Sent Events — pushes new alerts to the client in real time
// The browser keeps this connection open and receives events as they happen

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  let lastChecked = new Date();
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send a heartbeat immediately so browser knows connection is alive
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Poll DB every 5 seconds for new unread alerts
      intervalId = setInterval(async () => {
        try {
          const newAlerts = await prisma.alert.findMany({
            where: {
              userId,
              read: false,
              createdAt: { gt: lastChecked },
            },
            orderBy: { createdAt: "desc" },
          });

          if (newAlerts.length > 0) {
            lastChecked = new Date();
            for (const alert of newAlerts) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: "alert", alert })}\n\n`
                )
              );
            }
          }

          // Heartbeat every poll to keep connection alive
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`)
          );
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 5000);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}

// GET /api/alerts — list all alerts
// PATCH /api/alerts/[id] — mark as read
