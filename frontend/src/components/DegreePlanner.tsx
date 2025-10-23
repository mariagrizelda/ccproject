"use client";
import { useState } from "react";
import { GraduationCap, Trash2, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course, PlannedCourse } from "@/types/course";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DegreePlannerProps {
  plannedCourses: PlannedCourse[];
  pendingCourse: Course | null;
  availableSemesters: string[];
  onRemove: (courseId: number) => void;
  onUpdateSemester: (courseId: number, semester: string) => void;
  onConfirmAdd: (semester: string) => void;
  onCancelAdd: () => void;
  onAddSemester: () => void;
  onDeleteSemester: () => void;
}

const DegreePlanner = ({ 
  plannedCourses, 
  pendingCourse,
  availableSemesters,
  onRemove, 
  onUpdateSemester,
  onConfirmAdd,
  onCancelAdd,
  onAddSemester,
  onDeleteSemester
}: DegreePlannerProps) => {
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const groupedCourses = plannedCourses.reduce((acc, course) => {
    if (!acc[course.plannedSemester]) {
      acc[course.plannedSemester] = [];
    }
    acc[course.plannedSemester].push(course);
    return acc;
  }, {} as Record<string, PlannedCourse[]>);

  const totalCredits = plannedCourses.reduce((sum, course) => sum + course.credits, 0);

  const handleConfirm = () => {
    if (selectedSemester) {
      onConfirmAdd(selectedSemester);
      setSelectedSemester("");
    }
  };

  const handleCancel = () => {
    onCancelAdd();
    setSelectedSemester("");
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!pendingCourse} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Semester</DialogTitle>
            <DialogDescription>
              Select which semester you want to add this course to:
            </DialogDescription>
          </DialogHeader>
          
          {pendingCourse && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4 p-4 bg-secondary/50 rounded-lg">
                <Badge variant="secondary" className="font-mono">
                  {pendingCourse.code}
                </Badge>
                <div>
                  <h4 className="font-semibold">{pendingCourse.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {pendingCourse.credits} credits • {pendingCourse.study_area}
                  </p>
                </div>
              </div>
              
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {availableSemesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedSemester}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Planner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Degree Planner</h2>
        </div>
        <p className="text-primary-foreground/90">
          {plannedCourses.length} courses • {totalCredits} total credits
        </p>
      </div>

      {plannedCourses.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your planner is empty</p>
            <p className="text-muted-foreground">Add courses from the catalog to start planning your degree</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {availableSemesters.map((semester) => {
            const courses = groupedCourses[semester] || [];
            const semesterCredits = courses.reduce((sum, course) => sum + course.credits, 0);
            
            return (
              <Card key={semester} className="border-border">
                <CardHeader className="bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{semester}</CardTitle>
                    <Badge variant="outline">{semesterCredits} credits</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {courses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No courses planned</p>
                  ) : (
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {course.code}
                              </Badge>
                              <h4 className="font-semibold">{course.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {course.credits} credits • {course.study_area}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select
                              value={course.plannedSemester}
                              onValueChange={(value) => onUpdateSemester(course.id, value)}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSemesters.map((sem) => (
                                  <SelectItem key={sem} value={sem}>
                                    {sem}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemove(course.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          <Card className="border-dashed border-2">
            <CardContent className="flex items-center justify-center py-8 gap-4">
              <Button onClick={onAddSemester} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Another Semester
              </Button>
              {availableSemesters.length > 0 && (
                <Button onClick={onDeleteSemester} variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  Delete Latest Semester
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DegreePlanner;
