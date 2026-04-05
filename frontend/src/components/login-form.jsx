import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Added these

import { authService } from "@/services/authentication";

export default function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        if (result.data.user.role === "admin") navigate("/admin/products");
        else navigate("/");
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center justify-center min-h-[85vh] bg-[#f8f9fa] p-5 font-sans w-full", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 shadow-[0_20px_40px_rgba(25,28,29,0.06)] rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <CardTitle className="text-2xl font-bold text-[#003d9b] tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-[#191c1d]/60 text-sm mt-2">
              Enter your credentials to access your gallery.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="flex flex-col gap-5">
                
                {error && (
                  <div className="text-sm text-[#d32f2f] bg-[#ffebee] border border-[#ffcdd2] p-3 rounded-lg text-center font-medium">
                    {error}
                  </div>
                )}

                <Field className="space-y-2">
                  <FieldLabel htmlFor="email" className="text-[#191c1d] font-medium text-sm">Email</FieldLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required 
                    className="h-12 bg-[#f3f4f5] border-transparent focus:bg-white focus:border-[#003d9b]/30 focus:shadow-[0_0_0_4px_rgba(0,61,155,0.05)] rounded-lg transition-all text-[#191c1d] placeholder:text-[#191c1d]/40"
                  />
                </Field>

                <Field className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-[#191c1d] font-medium text-sm">Password</FieldLabel>
                    <a href="#" className="text-xs text-[#003d9b] hover:underline font-medium transition-all">
                      Forgot password?
                    </a>
                  </div>
                  {/* Password Toggle Wrapper */}
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required 
                      className="h-12 bg-[#f3f4f5] border-transparent focus:bg-white focus:border-[#003d9b]/30 focus:shadow-[0_0_0_4px_rgba(0,61,155,0.05)] rounded-lg transition-all text-[#191c1d] placeholder:text-[#191c1d]/40 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#191c1d]/40 hover:text-[#191c1d]/80 transition-colors"
                    >
                      {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </Field>
                
                <div className="flex flex-col gap-4 mt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-12 w-full bg-[#003d9b] hover:bg-[#003d9b]/90 text-white rounded-lg shadow-[0_10px_20px_rgba(0,61,155,0.15)] transition-all font-medium text-[15px]"
                  >
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#191c1d]/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold tracking-[0.05em] uppercase">
                      <span className="bg-white px-4 text-[#191c1d]/40">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => authService.loginWithGoogle()}
                      disabled={isLoading}
                      className="h-11 bg-transparent border border-[#191c1d]/15 hover:bg-[#f3f4f5] text-[#191c1d] rounded-lg transition-all"
                    >
                      <FcGoogle size={18} className="mr-2" />
                      Google
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => authService.loginWithFacebook()}
                      disabled={isLoading}
                      className="h-11 bg-transparent border border-[#191c1d]/15 hover:bg-[#f3f4f5] text-[#191c1d] rounded-lg transition-all"
                    >
                      <FaFacebook className="h-4 w-4 text-[#1877F2] mr-2" />
                      Facebook
                    </Button>
                  </div>

                  <FieldDescription className="text-center mt-6 text-sm text-[#191c1d]/60">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="text-[#003d9b] font-semibold hover:underline transition-all">
                      Create an account
                    </Link>
                  </FieldDescription>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}