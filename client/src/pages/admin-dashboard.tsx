import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  Zap, 
  Plus,
  Trash2,
  Edit,
  UserCog
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
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    category: "",
    date: "",
    time: "",
    maxSeats: 100,
  });
  const { toast } = useToast();

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

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentUser,
  });

  const { data: eventCategories = [] } = useQuery<string[]>({
    queryKey: ["/api/admin/event-categories"],
    enabled: !!currentUser,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
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

  // Mutations for managing categories
  const addCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return apiRequest("POST", "/api/admin/event-categories", { category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-categories"] });
      toast({ title: "Category added successfully" });
      setNewCategory("");
      setShowCategoryModal(false);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return apiRequest("DELETE", `/api/admin/event-categories/${encodeURIComponent(category)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-categories"] });
      toast({ title: "Category deleted successfully" });
    },
  });

  // Mutations for user management
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
  });

  // Mutations for event management
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest("POST", "/api/admin/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created successfully" });
      setNewEvent({
        name: "",
        description: "",
        category: "",
        date: "",
        time: "",
        maxSeats: 100,
      });
      setShowCreateEventModal(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest("DELETE", `/api/admin/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully" });
    },
  });

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

        {/* Management Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowUserManagement(!showUserManagement)} variant="outline">
            <UserCog className="mr-2 h-4 w-4" />
            User Management
          </Button>
          <Button onClick={() => setShowCategoryModal(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={() => setShowCreateEventModal(true)} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* User Management Section */}
        {showUserManagement && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm">Role: {user.role}</p>
                    </div>
                    <Button
                      onClick={() => setEditingUser(user)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Role
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

      {/* Category Management Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Event Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button 
                onClick={() => addCategoryMutation.mutate(newCategory)}
                disabled={!newCategory || addCategoryMutation.isPending}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {eventCategories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 border rounded">
                  <span>{category}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(category)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Role Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={editingUser.fullName} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  defaultValue={editingUser.role}
                  onValueChange={(value) => 
                    updateUserMutation.mutate({ 
                      id: editingUser.id, 
                      updates: { role: value as "student" | "admin" } 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={showCreateEventModal} onOpenChange={setShowCreateEventModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createEventMutation.mutate(newEvent); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label>Max Seats</Label>
                <Input
                  type="number"
                  value={newEvent.maxSeats}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, maxSeats: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
