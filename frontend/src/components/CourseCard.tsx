"use client";

import { Plus, BookOpen, Award, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types/course";
import { getArea, getAssessment, getSemesters } from "@/lib/api";

interface CourseCardProps {
  course: Course;
  onAdd: (course: Course) => void;
  isAdded?: boolean;
}

const CourseCard = ({ course, onAdd, isAdded }: CourseCardProps) => {
  const levelColor: Record<string, string> = {
    "100": "bg-green-500/10 text-green-700 dark:text-green-400",
    "200": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "300": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    "400": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd(course);
  };

  return (
    <Link href={`/course/${course.id}`}>
      <Card className="group hover:shadow-[var(--shadow-hover)] transition-[box-shadow] duration-300 border-border bg-card cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="font-mono">{course.code}</Badge>
            <Badge className={levelColor[String(course.level)] ?? ""}>Level {course.level}</Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {course.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{getArea(course)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{course.credits} Credits • {getAssessment(course)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getSemesters(course).join(", ")}</span>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Prerequisites: {course.prerequisites.join(", ")}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            onClick={handleAddClick}
            disabled={isAdded}
            className="w-full"
            variant={isAdded ? "secondary" : "default"}
          >
            {isAdded ? (
              "Added to Planner"
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Planner
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
