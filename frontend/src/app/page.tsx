"use client";

import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "@/components/SearchBar";
import CourseFilters from "@/components/CourseFilters";
import CourseCard from "@/components/CourseCard";
import DegreePlanner from "@/components/DegreePlanner";
import { fetchCourses, getSemesters, getArea, getAssessment } from "@/lib/api";
import { Course, PlannedCourse } from "@/types/course";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assessmentFilter, setAssessmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("catalog");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [availableSemesters, setAvailableSemesters] = useState<string[]>([
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
  ]);

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await fetchCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAssessment =
      assessmentFilter === "all" || getAssessment(course) === assessmentFilter;
    
    const matchesLevel = levelFilter === "all" || course.level.toString() === levelFilter;
    
    const matchesArea = areaFilter === "all" || getArea(course) === areaFilter;
    
    const matchesSemester =
      semesterFilter === "all" || getSemesters(course).includes(semesterFilter as "Semester 1" | "Semester 2" | "Summer Semester");

    return matchesSearch && matchesAssessment && matchesLevel && matchesArea && matchesSemester;
  });

  const handleAddCourse = (course: Course) => {
    const isAlreadyAdded = plannedCourses.some((c) => c.id === course.id);
    
    if (isAlreadyAdded) {
      toast({
        title: "Course already added",
        description: `${course.code} is already in your planner.`,
        variant: "destructive",
      });
      return;
    }

    setPendingCourse(course);
    setActiveTab("planner");
  };

  const handleConfirmAddCourse = (semester: string) => {
    if (!pendingCourse) return;

    const plannedCourse: PlannedCourse = {
      ...pendingCourse,
      plannedSemester: semester,
    };

    setPlannedCourses([...plannedCourses, plannedCourse]);
    setPendingCourse(null);
    
    toast({
      title: "Course added!",
      description: `${pendingCourse.code} - ${pendingCourse.name} has been added to ${semester}.`,
    });
  };

  const handleCancelAddCourse = () => {
    setPendingCourse(null);
  };

  const handleAddSemester = () => {
    const nextSemesterNumber = availableSemesters.length + 1;
    setAvailableSemesters([...availableSemesters, `Semester ${nextSemesterNumber}`]);
  };

  const handleRemoveCourse = (courseId: number) => {
    setPlannedCourses(plannedCourses.filter((c) => c.id !== courseId));
    
    toast({
      title: "Course removed",
      description: "The course has been removed from your planner.",
    });
  };

  const handleUpdateSemester = (courseId: number, semester: string) => {
    setPlannedCourses(
      plannedCourses.map((c) =>
        c.id === courseId ? { ...c, plannedSemester: semester } : c
      )
    );
  };

  const handleClearFilters = () => {
    setAssessmentFilter("all");
    setLevelFilter("all");
    setAreaFilter("all");
    setSemesterFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <GraduationCap className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">UQ Courses</h1>
          </div>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Plan your academic journey with ease. Search, filter, and organize your courses by semester.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="catalog" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Course Catalog
            </TabsTrigger>
            <TabsTrigger value="planner" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              My Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            {/* Search */}
            <div className="flex justify-center">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Filters */}
            <CourseFilters
              assessment={assessmentFilter}
              level={levelFilter}
              area={areaFilter}
              semester={semesterFilter}
              onAssessmentChange={setAssessmentFilter}
              onLevelChange={setLevelFilter}
              onAreaChange={setAreaFilter}
              onSemesterChange={setSemesterFilter}
              onClearFilters={handleClearFilters}
            />

            {/* Results */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {loading ? "Loading..." : `${filteredCourses.length} ${filteredCourses.length === 1 ? "Course" : "Courses"} Found`}
                </h2>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2 text-lg">Loading courses...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-lg text-destructive mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onAdd={handleAddCourse}
                        isAdded={plannedCourses.some((c) => c.id === course.id)}
                      />
                    ))}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">
                        No courses found matching your criteria. Try adjusting your filters.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="planner">
            <DegreePlanner
              plannedCourses={plannedCourses}
              pendingCourse={pendingCourse}
              availableSemesters={availableSemesters}
              onRemove={handleRemoveCourse}
              onUpdateSemester={handleUpdateSemester}
              onConfirmAdd={handleConfirmAddCourse}
              onCancelAdd={handleCancelAddCourse}
              onAddSemester={handleAddSemester}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
