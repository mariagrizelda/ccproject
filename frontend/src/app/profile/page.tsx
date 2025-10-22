"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Edit, Save, X, Mail, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { me, fetchProgramLevels, fetchPrograms, updateProfile, ProgramOption } from "@/lib/api";

interface UserProfile {
  username: string;
  email: string;
  profile: {
    program_level: string;
    program: string;
    year_intake: string;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    email: "",
    program_level: "",
    program: "",
    year_intake: "",
  });
  
  const [programLevels, setProgramLevels] = useState<{ value: string; label: string }[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userData = await me();
        setProfile(userData);
        setEditForm({
          email: userData.email || "",
          program_level: userData.profile?.program_level || "",
          program: userData.profile?.program || "",
          year_intake: userData.profile?.year_intake || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast({
          title: "Failed to load profile",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  useEffect(() => {
    const loadProgramData = async () => {
      try {
        const [levels, programsData] = await Promise.all([
          fetchProgramLevels(),
          fetchPrograms(editForm.program_level),
        ]);
        setProgramLevels(levels);
        setPrograms(programsData);
      } catch (error) {
        console.error("Failed to load program data:", error);
      }
    };

    if (editForm.program_level) {
      loadProgramData();
    }
  }, [editForm.program_level]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({
        program_level: editForm.program_level,
        program: editForm.program,
        year_intake: editForm.year_intake,
      });
      
      // Reload profile data
      const updatedProfile = await me();
      setProfile(updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      email: profile?.email || "",
      program_level: profile?.profile?.program_level || "",
      program: profile?.profile?.program || "",
      year_intake: profile?.profile?.year_intake || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-lg">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">Unable to load your profile information.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Profile</h1>
              <p className="text-xl text-muted-foreground">Manage your account settings</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    disabled
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Your program and study details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Program Level</Label>
                  {editing ? (
                    <Select
                      value={editForm.program_level}
                      onValueChange={(value) => setEditForm({ ...editForm, program_level: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select program level" />
                      </SelectTrigger>
                      <SelectContent>
                        {programLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge variant="secondary">
                        {profile.profile?.program_level === "UNDERGRAD" ? "Undergraduate" : "Postgraduate"}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Program</Label>
                  {editing ? (
                    <Select
                      value={editForm.program}
                      onValueChange={(value) => setEditForm({ ...editForm, program: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.label}>
                            {program.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm">{profile.profile?.program || "Not specified"}</p>
                  )}
                </div>

                <div>
                  <Label>Year Intake</Label>
                  {editing ? (
                    <Select
                      value={editForm.year_intake}
                      onValueChange={(value) => setEditForm({ ...editForm, year_intake: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select intake" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEM1">Semester 1</SelectItem>
                        <SelectItem value="SEM2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm">
                      {profile.profile?.year_intake === "SEM1" ? "Semester 1" : "Semester 2"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Member Since</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium">Account Status</h4>
                  <Badge variant="secondary" className="mt-1">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
