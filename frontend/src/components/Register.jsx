import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { authService } from "@/services/authentication";

export default function Register({ className, ...props }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setApiError("Please fill out all fields.");
      return;
    }
    if (form.password.length < 6) {
      setApiError("Password must have at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: "+855000000000",
      };

      const result = await authService.register(userData);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/");
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setApiError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center justify-center min-h-[80vh] bg-linear-to-br from-sky-100 via-blue-50 to-sky-100 p-5 font-sans w-full", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Please sign up below to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>

            <form onSubmit={handleSubmit}>
              <FieldGroup className="flex flex-col gap-4">

                {/* Display API error messages */}
                {apiError && (
                  <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-md text-center">
                    {apiError}
                  </div>
                )}

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={form.firstName}
                      onChange={handle}
                      disabled={isLoading}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handle}
                      disabled={isLoading}
                      required
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="register-email">Email</FieldLabel>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={form.email}
                    onChange={handle}
                    disabled={isLoading}
                    required
                  />
                </Field>

                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={handle}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </Field>

                {/* Terms */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By signing up I agree to Electronic Store's{" "}
                  <a href="#" className="underline font-medium hover:text-sky-500 transition-colors">Privacy Policy</a>{" "}
                  and{" "}
                  <a href="#" className="underline font-medium hover:text-sky-500 transition-colors">Terms & Conditions</a>
                </p>

                <Field className="flex flex-col gap-2 mt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign up"}
                  </Button>

                  {/* Visual divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => authService.loginWithGoogle()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FcGoogle size={20} />
                    Sign up with Google
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => authService.loginWithFacebook()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                    Sign up with Facebook
                  </Button>

                  <FieldDescription className="text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="underline font-medium hover:text-sky-500 transition-colors">
                      Login
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}