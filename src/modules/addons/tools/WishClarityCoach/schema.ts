import { z } from "zod";

export const textRule = z.string().trim().min(1, { message: "Write at least 1 character" }).max(300, { message: "Max 300 characters" });

export const step1Schema = z.object({ goal: textRule });
export const step2Schema = z.object({ wish_importance: textRule });
export const step3Schema = z.object({ wish_impact: textRule });
export const step4Schema = z.object({ wish_obstacles: textRule });
export const step5Schema = z.object({ wish_duration: textRule });
export const step6Schema = z.object({ wish_success: textRule });
export const step7Schema = z.object({ wish_deadline: textRule });
export const step8Schema = z.object({ wish_small_step: textRule });

export const formSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
  ...step8Schema.shape,
});

export type FormValues = z.infer<typeof formSchema>;
