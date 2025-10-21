"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAssessmentTypes, fetchStudyAreas, DropdownOption } from "@/lib/api";

interface CourseFiltersProps {
  assessment: string;
  level: string;
  area: string;
  semester: string;
  onAssessmentChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onClearFilters: () => void;
}

const CourseFilters = ({
  assessment,
  level,
  area,
  semester,
  onAssessmentChange,
  onLevelChange,
  onAreaChange,
  onSemesterChange,
  onClearFilters,
}: CourseFiltersProps) => {
  const [assessmentTypes, setAssessmentTypes] = useState<DropdownOption[]>([]);
  const [studyAreas, setStudyAreas] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const [assessmentData, studyAreaData] = await Promise.all([
          fetchAssessmentTypes(),
          fetchStudyAreas()
        ]);
        setAssessmentTypes(assessmentData);
        setStudyAreas(studyAreaData);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Filter Courses</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Assessment</label>
          <Select value={assessment} onValueChange={onAssessmentChange} disabled={loading}>
            <SelectTrigger className="text-left">
              <SelectValue placeholder={loading ? "Loading..." : "All Types"} />
            </SelectTrigger>
            <SelectContent className="min-w-[200px]">
              <SelectItem value="all">All Types</SelectItem>
              {assessmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="whitespace-nowrap">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Level</label>
          <Select value={level} onValueChange={onLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
              <SelectItem value="5">Level 5</SelectItem>
              <SelectItem value="6">Level 6</SelectItem>
              <SelectItem value="7">Level 7</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Area of Study</label>
          <Select value={area} onValueChange={onAreaChange} disabled={loading}>
            <SelectTrigger className="text-left">
              <SelectValue placeholder={loading ? "Loading..." : "All Areas"} />
            </SelectTrigger>
            <SelectContent className="min-w-[300px]">
              <SelectItem value="all">All Areas</SelectItem>
              {studyAreas.map((area) => (
                <SelectItem key={area.value} value={area.value} className="whitespace-nowrap">
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Semester</label>
          <Select value={semester} onValueChange={onSemesterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="Semester 1">Semester 1</SelectItem>
              <SelectItem value="Semester 2">Semester 2</SelectItem>
              <SelectItem value="Summer Semester">Summer Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={onClearFilters}
        className="mt-4"
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default CourseFilters;
