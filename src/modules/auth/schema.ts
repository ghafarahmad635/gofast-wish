import { z } from "zod";

export const formSchemasignup = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Invalid email address" }), 
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });


  export const formSchemasignin = z.object({
   email: z.email({ message: "Invalid email address" }), 
  password: z.string().min(1, { message: "Password is required" }),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  country: z.string().optional(),
  timezone: z.string().optional(),
  file: z.any().optional()
});

export type ProfileValues = z.infer<typeof profileSchema>;



export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
