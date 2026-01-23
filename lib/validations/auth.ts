import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

export const SignupSchema = z.object({
  first_name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});


export const ResetPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

export const OtpSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});


// React Hook Form Types

export type LoginFormData = z.infer<typeof LoginSchema>
export type SignupFormData = z.infer<typeof SignupSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>
export type OTPFormData = z.infer<typeof OtpSchema>