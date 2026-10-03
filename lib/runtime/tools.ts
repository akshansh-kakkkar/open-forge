import type { Action, Decision, World } from "./types";
const title = (x: string) => x.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
export function executeTool(world: World, decision: Decision): { world: World; result: string; ok: boolean } {
  const next = { ...world }; const { action, target } = decision;
  if (action === "move") { if (!["reactor_room","storage_room","corridor","security"].includes(target)) return {world, result:"Invalid location.",ok:false}; next.maya = target as World["maya"]; return {world:next,result:`Maya moved to ${title(target)}.`,ok:true}; }
  if (action === "pickup") { if (target !== "fuse" || world.fuse !== world.maya) return {world,result:"Fuse is not available here.",ok:false}; next.fuse="maya"; return {world:next,result:"Maya secured the reactor fuse.",ok:true}; }
  if (action === "repair") { if (target !== "reactor" || world.maya !== "reactor_room" || world.fuse !== "maya") return {world,result:"Repair requires Maya, fuse, and reactor to be together.",ok:false}; next.reactor="repaired"; return {world:next,result:"Maya installed the fuse. Reactor repaired.",ok:true}; }
  if (action === "talk") { if (!["player","alex"].includes(target)) return {world,result:"Unknown conversation target.",ok:false}; return {world,result:`Maya spoke to ${title(target)}.`,ok:true}; }
  if (action === "inspect") { if (!["reactor","fuse","player"].includes(target)) return {world,result:"Unknown inspection target.",ok:false}; return {world,result:`Maya inspected ${title(target)}.`,ok:true}; }
  const impossible: never = action; return impossible;
}
export const toolLabels: Record<Action,string> = { move:"move", pickup:"pickup", talk:"talk", inspect:"inspect", repair:"repair" };
