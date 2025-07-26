import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Users, LogOut, Trophy, CheckCircle, Star } from "lucide-react";
import RegistrationModal from "@/components/registration-modal";
import type { Event, User } from "@shared/schema";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      setLocation("/");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== "student") {
      setLocation("/");
      return;
    }
    
    setCurrentUser(user);
  }, [setLocation]);

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!currentUser,
  });

  const { data: userRegistrations = [] } = useQuery<any[]>({
    queryKey: ["/api/registrations/user", currentUser?.id],
    enabled: !!currentUser?.id,
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

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    queryClient.invalidateQueries({ queryKey: ["/api/registrations/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    toast({
      title: "Registration successful!",
      description: "You have been registered for the event.",
    });
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-muted-foreground">Welcome back to the VIEW Events Portal</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Events</p>
                  <p className="text-2xl font-bold text-gray-900">{userRegistrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attended Events</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Points Earned</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Campus Events */}
        <Card>
          <CardHeader>
            <CardTitle>Available Campus Events</CardTitle>
            <p className="text-sm text-muted-foreground">Register for upcoming events and workshops</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event: Event) => (
                <Card key={event.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        event.category === "Art" ? "bg-purple-100" : "bg-blue-100"
                      }`}>
                        {event.category === "Art" ? (
                          <Trophy className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        event.category === "Art" 
                          ? "text-purple-600 bg-purple-100" 
                          : "text-blue-600 bg-blue-100"
                      }`}>
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.name}</h3>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {event.date || "TBD"}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {event.time || "TBD"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Seats: {event.currentRegistrations}/{event.maxSeats}
                      </span>
                      <Button onClick={() => handleRegister(event)}>
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        currentUser={currentUser}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
