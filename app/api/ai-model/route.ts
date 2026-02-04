import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req:NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-3-flash-preview", // or any OpenRouter-supported model
        messages,
        stream: true, // enable streaming
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // optional
          "X-Title": "My Next.js App", // optional
        },
        responseType: "stream", // important for streaming
      }
    );

    const stream = response.data;

    // Return as a web stream so frontend can consume
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let closed = false;
        const safeClose = () => {
          if(closed) return;
          closed=true;
          controller.close();
        };

        const safeError = (err:any) => {
          if(closed) return;
          closed =true;
          controller.close();
        };
        let buffer = "";
        stream.on("data", (chunk: any) => {
          buffer += chunk.toString("utf8");

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; 

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.includes("[DONE]")) {
              safeClose();
              return;
            }

            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.replace(/^data:\s*/, "");

              try {
                const data = JSON.parse(jsonStr);
                const text = data.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch (err) {
                buffer = line + "\n" + buffer;
              }
            }
          }
        });


        stream.on("end", () => {
          safeClose();
        });

        stream.on("error", (err:any) => {
          console.error("Stream error", err);
          safeError(err);
        });
      },
    });

    return new NextResponse(readable);
  } catch (error: any) {
  console.error(
    "AI route error:",
    error?.response?.status,
    error?.response?.data,
    error?.message
  );

  return NextResponse.json(
    { error: "Something went wrong" },
    { status: 500 }
  );
}

}
