import z from "zod";

// Mirrors the server's rules in authValidatorSchema exactly.
const passwordValidationRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+.])[A-Za-z\d@$!%*?&#^()\-_=+.]{8,}$/;

const emailField = z.string().trim().email("Enter a valid email address").toLowerCase();

const passwordField = z.string().min(8, "Password must be at least 8 characters long").regex(passwordValidationRegex, "Password must include at least one letter, one number and one special character");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Please enter your full name"),
    email: emailField,
    phone_no: z.string().trim().optional(),
    password: passwordField,
    confirm_password: z.string(),
    accepted_terms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirm_password"] });
    }
    if (data.accepted_terms !== true) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must accept the Terms and Privacy Policy", path: ["accepted_terms"] });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().length(6, "Enter the 6-digit code from your email"),
    password: passwordField,
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirm_password"] });
    }
  });

export const verifyEmailSchema = z.object({
  code: z.string().trim().length(6, "Enter the 6-digit code from your email"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
