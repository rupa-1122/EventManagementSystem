import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  LogOut, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  Zap, 
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import type { User } from "@shared/schema";

interface AdminStats {
  totalEvents: number;
  registeredStudents: number;
  totalRegistrations: number;
  activeEvents: number;
}

interface StudentActivity {
  id: string;
  studentName: string;
  email: string;
  loginTime: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      setLocation("/");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      setLocation("/");
      return;
    }
    
    setCurrentUser(user);
  }, [setLocation]);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!currentUser,
  });

  const { data: studentActivity = [] } = useQuery<StudentActivity[]>({
    queryKey: ["/api/admin/student-activity"],
    enabled: !!currentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("sessionId");
      return apiRequest("POST", "/api/auth/logout", { sessionId });
    },
    onSuccess: () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("sessionId");
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const eventCategories = [
    { name: "Arts & Crafts", description: "Creative arts, crafts, and design competitions" },
    { name: "Cultural", description: "Cultural events and traditional performances" },
    { name: "Dance", description: "Traditional and modern dance competitions" },
    { name: "Photography", description: "Creative photography contests and exhibitions" },
    { name: "Singing", description: "Vocal performances and singing competitions" },
    { name: "Sports", description: "Various sports events and competitions" },
    { name: "Technical", description: "Programming, coding, and technical competitions" },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-muted-foreground">Event Management & Student Analytics</p>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.registeredStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <ClipboardCheck className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalRegistrations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event Categories for Yuvatarang</CardTitle>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventCategories.map((category) => (
                  <Card key={category.name} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Management and Student Activity */}
          <div className="space-y-6">
            {/* Event Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Event Management</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Techritz</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      dec 15 2025
                      <span className="mx-2">•</span>
                      <Users className="w-4 h-4 mr-1" />
                      0 / 500
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">0% capacity filled</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">yuvatarang</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-gray-400">TBD</span>
                      <span className="mx-2">•</span>
                      <Users className="w-4 h-4 mr-1" />
                      0 / 5000
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">0% capacity filled</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Student Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <p className="text-sm text-muted-foreground">Latest registrations and student engagement</p>
              </CardHeader>
              <CardContent>
                {studentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto w-12 h-12 text-gray-400" />
                    <p className="text-muted-foreground mt-2">No recent activity.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {activity.studentName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.studentName}</p>
                            <p className="text-sm text-muted-foreground">{activity.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Logged in</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.loginTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
