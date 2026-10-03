import { NextResponse } from "next/server";
import { decisionSchema } from "../../../lib/ai/schema";
import { buildPrompt, modelContext } from "../../../lib/ai/prompt";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const context = modelContext(body.world, body.memories ?? [], body.events ?? []);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 90000);
    const response = await fetch(`${process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"}/api/generate`, { method:"POST", headers:{"Content-Type":"application/json"}, signal:controller.signal, body:JSON.stringify({ model:process.env.OLLAMA_MODEL ?? "qwen3:4b", prompt:buildPrompt(context), format:"json", stream:false, think:false, options:{temperature:0.2} }) });
    clearTimeout(timer);
    if (!response.ok) return NextResponse.json({ error:`Ollama responded ${response.status}. Verify the model is installed.` }, {status:502});
    const payload = await response.json();
    let parsed: unknown; try { parsed = JSON.parse(payload.response); } catch { return NextResponse.json({error:"Model returned invalid JSON."},{status:422}); }
    const check = decisionSchema.safeParse(parsed);
    if (!check.success) return NextResponse.json({error:"Model response did not match the decision schema."},{status:422});
    return NextResponse.json({ decision:check.data, model:process.env.OLLAMA_MODEL ?? "qwen3:4b", context });
  } catch (error) { const message = error instanceof Error && error.name === "AbortError" ? "Ollama request timed out." : "Ollama offline. Start Ollama and pull a model, or enable Mock Mode."; return NextResponse.json({error:message},{status:503}); }
}
