import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@mui/material";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../services/apiClient";
import { AuthShell } from "./AuthShell";

// Mirrors the backend's 8-character minimum on change_password; register
// itself has no server-side minimum yet, so we enforce it client-side too.
const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create your account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start evaluating OCR engines with Verascan">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Full name"
          fullWidth
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#8b5cf6", fontWeight: 600 }}>
          Log in
        </Link>
      </Typography>
    </AuthShell>
  );
}
