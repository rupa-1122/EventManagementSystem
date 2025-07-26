import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Shield, Info } from "lucide-react";
import type { LoginRequest } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store user data in localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("sessionId", data.sessionId);
      
      toast({
        title: "Login successful",
        description: `Welcome ${data.user.role === "admin" ? "Admin" : "back"}!`,
      });

      // Redirect based on role
      if (data.user.role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/student-dashboard");
      }
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "student" && !email.includes("@view.edu.in")) {
      toast({
        title: "Invalid email",
        description: "Please use your VIEW email address",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Vignan's IEVW</h1>
              <span className="ml-2 text-sm text-muted-foreground">Student Portal</span>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "student" ? "default" : "ghost"}
                onClick={() => setActiveTab("student")}
                className={`border-b-2 rounded-none ${
                  activeTab === "student" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Student Login
              </Button>
              <Button
                variant={activeTab === "admin" ? "default" : "ghost"}
                onClick={() => setActiveTab("admin")}
                className={`border-b-2 rounded-none ${
                  activeTab === "admin" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                  {activeTab === "student" ? (
                    <GraduationCap className="w-6 h-6 text-primary" />
                  ) : (
                    <Shield className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === "student" ? "Student Access" : "Admin Access"}
                </h2>
                <p className="text-muted-foreground">
                  {activeTab === "student" ? "VIEW Events Portal" : "Event Management Portal"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">
                    {activeTab === "student" ? "Email Address" : "Admin Email"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      activeTab === "student" 
                        ? "21XM1A0501@view.edu.in" 
                        : "admin@view.edu.in"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : `Sign In as ${activeTab === "student" ? "Student" : "Admin"}`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Student Registration Info */}
          {activeTab === "student" && (
            <Card className="mt-6 bg-secondary">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-primary mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-primary mb-1">Student Registration</h3>
                    <p className="text-xs text-muted-foreground">
                      Students register with their VIEW email format: 21XM1A0501@view.edu.in. 
                      Password must contain uppercase, number, and special character.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
