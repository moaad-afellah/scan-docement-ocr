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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your Verascan workspace">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#8b5cf6", fontWeight: 600 }}>
          Sign up
        </Link>
      </Typography>
    </AuthShell>
  );
}
