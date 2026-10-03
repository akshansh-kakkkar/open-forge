"use client";
import { create } from "zustand";
import { executeTool } from "../lib/runtime/tools";
import type { Decision, Event, Memory, ToolCall, World } from "../lib/runtime/types";
const initialWorld: World = { reactor:"unstable", fuse:"storage_room", player:"storage_room", maya:"reactor_room", alex:"security" };
const now = () => new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
const item = (text:string, tone:Event["tone"]="neutral"): Event => ({id:crypto.randomUUID(), text, timestamp:now(), tone});
const memory = (text:string, importance=6): Memory => ({id:crypto.randomUUID(),text,importance,timestamp:now()});
const mock = (w:World): Decision => {
  if (w.reactor === "repaired") return {thought:"The reactor is stable. I will inspect it and remain alert.",action:"inspect",target:"reactor",plan:["Verify reactor status","Monitor the system"]};
  if (w.fuse === "player") return {thought:"The needed fuse is with the player. I should request its return before attempting a repair.",action:"talk",target:"player",plan:["Find the player","Request the fuse","Return to reactor"]};
  if (w.fuse === "storage_room" && w.maya !== "storage_room") return {thought:"The unstable reactor needs the replacement fuse stored in Storage.",action:"move",target:"storage_room",plan:["Move to Storage","Secure the fuse","Return to reactor","Repair it"]};
  if (w.fuse === "storage_room") return {thought:"The fuse is here. I should secure it now.",action:"pickup",target:"fuse",plan:["Pick up the fuse","Return to reactor","Install it"]};
  if (w.fuse === "maya" && w.maya !== "reactor_room") return {thought:"I have the replacement fuse; reactor safety requires a direct return.",action:"move",target:"reactor_room",plan:["Move to reactor","Install fuse","Verify stability"]};
  return {thought:"I have the fuse and am at the reactor. I can safely restore operations.",action:"repair",target:"reactor",plan:["Install fuse","Verify reactor stability"]};
};
type State={ world:World; memories:Memory[]; events:Event[]; toolCalls:ToolCall[]; decision:Decision|null; context:unknown; loading:boolean; error:string|null; model:string; mode:"local"|"mock"; autoRun:boolean; stepAI:()=>Promise<void>; takeFuse:()=>void; returnFuse:()=>void; damageReactor:()=>void; reset:()=>void; toggleAutoRun:()=>void; setMode:(m:"local"|"mock")=>void };
export const useSimulation = create<State>((set,get)=>({
  world:initialWorld, memories:[memory("The reactor became unstable.",9)], events:[item("SYSTEM initialized simulation"),item("REACTOR entered unstable state","alert")], toolCalls:[], decision:null, context:null, loading:false,error:null,model:"qwen3:4b",mode:"local",autoRun:false,
  stepAI: async ()=>{ const s=get(); if(s.loading) return; set({loading:true,error:null}); let decision:Decision, context:unknown=s.context, model=s.model;
    try { if(s.mode === "mock") { decision=mock(s.world); context={agent:"Maya",personality:"A cautious engineer who prioritizes reactor safety.",goals:["Keep reactor operational","Protect important resources","Avoid unnecessary risk"],world:s.world,memories:s.memories.slice(0,5),recent_events:s.events.slice(0,5),note:"Mock / deterministic development decision"}; model="Deterministic demo"; } else { const res=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({world:s.world,memories:s.memories,events:s.events})}); const data=await res.json(); if(!res.ok) throw new Error(data.error); decision=data.decision; context=data.context; model=data.model; }
      const outcome=executeTool(s.world,decision); const call={name:decision.action,target:decision.target,result:outcome.result,timestamp:now()} as ToolCall; const additions=[item(`MAYA decided ${decision.action}(${decision.target})`),item(outcome.result,outcome.ok?"success":"alert")]; const mems=[...s.memories]; if(outcome.ok && (decision.action==="pickup"||decision.action==="repair"||decision.action==="talk")) mems.unshift(memory(outcome.result,decision.action==="repair"?10:7)); set({world:outcome.world,decision,context,model,toolCalls:[call,...s.toolCalls].slice(0,8),events:[...additions,...s.events].slice(0,20),memories:mems.slice(0,10),loading:false});
    } catch(e) { set({loading:false,error:e instanceof Error?e.message:"AI request failed"}); }
  },
  takeFuse:()=>{const s=get(); if(s.world.fuse!=="storage_room"||s.world.player!=="storage_room") return; set({world:{...s.world,fuse:"player"},events:[item("PLAYER took reactor fuse","alert"),...s.events],memories:[memory("The player took the reactor fuse.",9),...s.memories]})},
  returnFuse:()=>{const s=get(); if(s.world.fuse!=="player") return; set({world:{...s.world,fuse:s.world.player},events:[item("PLAYER returned reactor fuse","success"),...s.events],memories:[memory("The player returned the reactor fuse.",8),...s.memories]})},
  damageReactor:()=>{const s=get(); set({world:{...s.world,reactor:"unstable"},events:[item("PLAYER destabilized reactor","alert"),...s.events],memories:[memory("The reactor became unstable.",10),...s.memories]})},
  reset:()=>set({world:initialWorld,memories:[memory("The reactor became unstable.",9)],events:[item("SYSTEM reset simulation"),item("REACTOR entered unstable state","alert")],toolCalls:[],decision:null,context:null,error:null,autoRun:false}), toggleAutoRun:()=>set({autoRun:!get().autoRun}),setMode:(mode)=>set({mode,error:null})
}));
