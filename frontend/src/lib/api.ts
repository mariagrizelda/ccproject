import { ApiCourse, Course, AssessmentType, AreaOfStudy, Semester } from "@/types/course";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = typeof globalThis !== "undefined" && (globalThis as any).localStorage ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Transform API course to internal Course format
export function transformApiCourse(apiCourse: ApiCourse): Course {
  // Map assessment types
  const assessmentMap: Record<string, AssessmentType> = {
    "EXAM": "EXAM",
    "ASSIGNMENT": "ASSIGNMENT", 
    "PROJECT": "PROJECT",
    "MIX": "MIX"
  };

  // Map study areas
  const areaMap: Record<string, AreaOfStudy> = {
    "BEL": "BEL",
    "EAIT": "EAIT",
    "HABS": "HABS",
    "HMB": "HMB",
    "HASS": "HASS",
    "SCI": "SCI"
  };

  return {
    id: apiCourse.id,
    code: apiCourse.code,
    name: apiCourse.name,
    credits: apiCourse.credits,
    level: apiCourse.level as 1 | 2 | 3 | 4,
    study_area: areaMap[apiCourse.study_area] || "EAIT",
    assessment_type: assessmentMap[apiCourse.assessment_type] || "MIX",
    offered_sem_1: apiCourse.offered_sem_1,
    offered_sem_2: apiCourse.offered_sem_2,
    offered_summer: apiCourse.offered_summer,
    description: apiCourse.description,
    aim: apiCourse.aim,
    prerequisites: apiCourse.prerequisites
  };
}

// Helper function to get semester array from boolean flags
export function getSemesters(course: Course): Semester[] {
  const semesters: Semester[] = [];
  if (course.offered_sem_1) semesters.push("Semester 1");
  if (course.offered_sem_2) semesters.push("Semester 2");
  if (course.offered_summer) semesters.push("Summer Semester");
  return semesters;
}

// Helper function to get area for filtering
export function getArea(course: Course): AreaOfStudy {
  return course.study_area;
}

// Helper function to get assessment for filtering  
export function getAssessment(course: Course): AssessmentType {
  return course.assessment_type;
}

export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiCourses: ApiCourse[] = await response.json();
    return apiCourses.map(transformApiCourse);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw error;
  }
}

export async function fetchCourseDetails(courseId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch course details:", error);
    throw error;
  }
}

export interface DropdownOption {
  value: string;
  label: string;
}

export async function fetchAssessmentTypes(): Promise<DropdownOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/catalog/assessment-types/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch assessment types:", error);
    throw error;
  }
}

export async function fetchStudyAreas(): Promise<DropdownOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/catalog/study-areas/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch study areas:", error);
    throw error;
  }
}

// ===== Auth =====
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  program_level: "UNDERGRAD" | "POSTGRAD";
  program: string;
  year_intake: "SEM1" | "SEM2";
}

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.status}`);
  return res.json(); // { access, refresh }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { access, refresh }
}

export async function me() {
  const res = await fetch(`${API_BASE_URL}/auth/me/`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Me failed: ${res.status}`);
  return res.json();
}

export async function fetchProgramLevels(): Promise<DropdownOption[]> {
  const res = await fetch(`${API_BASE_URL}/catalog/program-levels/`);
  console.log(API_BASE_URL);
  if (!res.ok) throw new Error(`Program levels failed: ${res.status}`);
  console.log(res.json);
  return res.json();
}

export interface ProgramOption extends DropdownOption { id: number; }

export async function fetchPrograms(level?: string, search?: string): Promise<ProgramOption[]> {
  const url = new URL(`${API_BASE_URL}/catalog/programs/`);
  if (level) url.searchParams.set("level", level);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Programs failed: ${res.status}`);
  const data = await res.json();
  return data.map((p: any) => ({ id: p.id, value: String(p.id), label: `${p.name} (${p.level_label})` }));
}

// ===== Planned courses =====
export interface PlannedCourseDTO {
  id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  semester: number;
}

export async function fetchPlannedCourses(): Promise<PlannedCourseDTO[]> {
  const res = await fetch(`${API_BASE_URL}/planned-courses/`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Fetch planned courses failed: ${res.status}`);
  return res.json();
}

export async function addOrUpdatePlannedCourse(
  courseId: number, 
  courseCode: string, 
  courseName: string, 
  semester: number
) {
  const res = await fetch(`${API_BASE_URL}/planned-courses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ 
      course_id: courseId, 
      course_code: courseCode, 
      course_name: courseName, 
      semester 
    }),
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Add/update planned course failed: ${res.status}`);
  return res.json();
}

export async function updatePlannedCourseSemester(courseId: number, semester: number) {
  const res = await fetch(`${API_BASE_URL}/planned-courses/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ course_id: courseId, semester }),
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Update planned course failed: ${res.status}`);
  return res.json();
}

export async function deletePlannedCourse(courseId: number) {
  const res = await fetch(`${API_BASE_URL}/planned-courses/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ course_id: courseId }),
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok && res.status !== 204) throw new Error(`Delete planned course failed: ${res.status}`);
}

// ===== Semesters =====
export interface SemesterDTO {
  id: number;
  semester_number: number;
  created_at: string;
}

export async function fetchSemesters(): Promise<SemesterDTO[]> {
  const res = await fetch(`${API_BASE_URL}/planned-courses/semesters/`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Fetch semesters failed: ${res.status}`);
  return res.json();
}

export async function addSemester(): Promise<SemesterDTO> {
  const res = await fetch(`${API_BASE_URL}/planned-courses/semesters/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Add semester failed: ${res.status}`);
  return res.json();
}

export async function deleteSemester(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/planned-courses/semesters/`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 400) {
    const data = await res.json();
    throw new Error(data.detail || "Cannot delete semester");
  }
  if (!res.ok && res.status !== 204) throw new Error(`Delete semester failed: ${res.status}`);
}

// ===== Course Reviews =====
export interface CourseReview {
  id: number;
  review: number;
  description?: string;
  created_at: string;
  user: string;
}

export async function fetchCourseReviews(courseId: number): Promise<CourseReview[]> {
  const res = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews/`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Fetch course reviews failed: ${res.status}`);
  return res.json();
}

export async function submitCourseReview(courseId: number, review: number, description?: string) {
  const res = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ review, description }),
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Submit review failed: ${res.status}`);
  return res.json();
}

// ===== Profile Management =====
export async function updateProfile(profileData: {
  program_level?: string;
  program?: string;
  year_intake?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(profileData),
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Update profile failed: ${res.status}`);
  return res.json();
}
