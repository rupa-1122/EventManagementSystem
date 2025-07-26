import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { sendRegistrationEmail } from "@/lib/emailjs";
import type { Event, User, RegistrationFormData } from "@shared/schema";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  currentUser: User | null;
  onSuccess: () => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onSuccess,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    emailAddress: currentUser?.email || "",
    phoneNumber: "",
    branch: "",
    yearOfStudy: "",
    eventCategories: [] as string[],
  });

  const { toast } = useToast();

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response.json();
    },
    onSuccess: async () => {
      try {
        // Send email notification
        await sendRegistrationEmail({
          eventName: event?.name || "",
          studentName: formData.fullName,
          rollNumber: formData.rollNumber,
          email: formData.emailAddress,
          phone: formData.phoneNumber,
          branch: formData.branch,
          year: formData.yearOfStudy,
          categories: formData.eventCategories.join(", "),
          registrationTime: new Date().toLocaleString(),
        });

        toast({
          title: "Registration successful!",
          description: "Admin has been notified via email.",
        });
      } catch (emailError) {
        toast({
          title: "Registration submitted",
          description: "Registration was successful, but there was an issue sending the notification email.",
          variant: "destructive",
        });
      }
      
      onSuccess();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      rollNumber: "",
      emailAddress: currentUser?.email || "",
      phoneNumber: "",
      branch: "",
      yearOfStudy: "",
      eventCategories: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !formData.fullName || !formData.rollNumber || !formData.emailAddress || 
        !formData.phoneNumber || !formData.branch || !formData.yearOfStudy || 
        formData.eventCategories.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and select at least one event category",
        variant: "destructive",
      });
      return;
    }

    registrationMutation.mutate({
      eventId: event.id,
      fullName: formData.fullName,
      rollNumber: formData.rollNumber,
      emailAddress: formData.emailAddress,
      phoneNumber: formData.phoneNumber,
      branch: formData.branch,
      yearOfStudy: formData.yearOfStudy,
      eventCategories: formData.eventCategories,
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      eventCategories: checked
        ? [...prev.eventCategories, category]
        : prev.eventCategories.filter(c => c !== category),
    }));
  };

  const eventCategories = [
    "Arts & Crafts",
    "Cultural", 
    "Dance",
    "Photography",
    "Singing",
    "Sports",
    "Technical",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {event?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                placeholder="e.g., 21XM1A0501"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="emailAddress">Email Address *</Label>
              <Input
                id="emailAddress"
                type="email"
                placeholder="21XM1A0501@view.edu.in"
                value={formData.emailAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="branch">Branch *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}>
                <SelectTrigger className="mt-2">
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
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, yearOfStudy: value }))}>
                <SelectTrigger className="mt-2">
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
            <Label className="text-sm font-medium text-gray-700 mb-4">
              Event Categories for Yuvatarang Fest *
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select the events you're interested in participating in:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {eventCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={formData.eventCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={category} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={registrationMutation.isPending} className="bg-blue-500 hover:bg-blue-600">
              {registrationMutation.isPending ? "Sending..." : "✈ Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
