# OpenForge

## AI NPC Lab

OpenForge is an experimental AI-native game runtime where an open-weight local model makes Maya's high-level decisions while deterministic TypeScript code enforces the world rules and executes tools. It is a polished vertical slice, not a production game engine.

Traditional NPCs often rely on manually authored state machines, behavior trees, scripts, and dialogue logic. This project explores a different split: a model interprets changing state and requests one constrained action; the runtime remains the authority for what can actually happen.

```text
World State → Observation → Open-weight Model → Decision → Tool
     ↑                                                   ↓
Memory ←──────────────────── World Mutation ←────────────┘
```

### Features

- Local Ollama proxy at `POST /api/ai`, with server-built prompt and Zod validation
- Constrained `move`, `pickup`, `talk`, `inspect`, and `repair` tool runtime
- Memory and recent event context included in every model request
- A visible context inspector, tool call result, and simulation event stream
- Clearly labeled deterministic mock mode for development when Ollama is offline

### Run locally

```bash
npm install
npm run dev
```

For local AI, install and run [Ollama](https://ollama.com), then pull a small model:

```bash
ollama serve
ollama pull qwen3:4b
```

Optional environment variables:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

Use **AI STEP** to let Maya observe the world and choose a tool. For the reactive scenario, press **RESET**, then **TAKE FUSE**, then **AI STEP**. The local model should see that the fuse is with the player and decide accordingly. If Ollama is unavailable, the interface reports it plainly; switch to **MOCK** only for the visibly labeled deterministic demo path.

### Limitations and future work

This is intentionally a small single-agent simulation with in-memory state. Future work could add richer world observations, evaluation scenarios, replay traces, multiple agent coordination, and a more robust policy layer.
