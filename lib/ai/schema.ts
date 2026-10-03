import { z } from "zod";
export const decisionSchema = z.object({
  thought: z.string().min(1).max(700),
  action: z.enum(["move", "pickup", "talk", "inspect", "repair"]),
  target: z.string().min(1).max(80),
  plan: z.array(z.string().min(1).max(180)).min(1).max(6),
});
export type ModelDecision = z.infer<typeof decisionSchema>;
