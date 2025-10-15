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