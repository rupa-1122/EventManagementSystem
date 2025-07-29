import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Shield, Info } from "lucide-react";
import type { LoginRequest } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    fullName: "",
    rollNumber: "",
    email: "",
    phoneNumber: "",
    branch: "",
    yearOfStudy: "",
    password: "",
  });
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

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "You can now login with your credentials",
      });
      setShowRegister(false);
      setEmail(registerData.email);
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.fullName || !registerData.rollNumber || !registerData.email || 
        !registerData.phoneNumber || !registerData.branch || !registerData.yearOfStudy || 
        !registerData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!registerData.email.includes("@view.edu.in")) {
      toast({
        title: "Invalid email",
        description: "Please use your VIEW email address",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Vignan Event Management</h1>
              <span className="ml-2 text-sm text-muted-foreground"> Portal</span>
            </div>
            <div className="flex space-x-2">
  <Button
    variant="ghost"
    onClick={() => setActiveTab("student")}
    className={`rounded-md px-4 py-2 font-medium transition-all duration-200 ${
      activeTab === "student"
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    Student Login
  </Button>
  <Button
    variant="ghost"
    onClick={() => setActiveTab("admin")}
    className={`rounded-md px-4 py-2 font-medium transition-all duration-200 ${
      activeTab === "admin"
        ? "bg-purple-600 text-white shadow-md"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

{!showRegister ? (
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
                          : "view123@view.edu.in"
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
                  
                  {activeTab === "student" && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setShowRegister(true)}
                          className="text-primary hover:underline font-medium"
                        >
                          Create an account
                        </button>
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input
                        id="rollNumber"
                        placeholder="e.g., 21XM1A0501"
                        value={registerData.rollNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, rollNumber: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registerEmail">Email Address *</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="21XM1A0501@view.edu.in"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="9876543210"
                        value={registerData.phoneNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch *</Label>
                      <Select onValueChange={(value) => setRegisterData(prev => ({ ...prev, branch: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                          <SelectItem value="ECE">Electronics & Communication</SelectItem>
                          <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                          <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                          <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                          <SelectItem value="IT">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearOfStudy">Year of Study *</Label>
                      <Select onValueChange={(value) => setRegisterData(prev => ({ ...prev, yearOfStudy: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="registerPassword">Password *</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="Password (uppercase, number, special character required)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowRegister(false)}
                      className="flex-1"
                    >
                      Back to Login
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              )}
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
                      Students register with their VIEW email format: 21XM1AXX01@view.edu.in. 
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
