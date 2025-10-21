import { ApiCourse, Course, AssessmentType, AreaOfStudy, Semester } from "@/types/course";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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

export interface DropdownOption {
  value: string;
  label: string;
}

export async function fetchAssessmentTypes(): Promise<DropdownOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/assessment-types/`);
    
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
    const response = await fetch(`${API_BASE_URL}/study-areas/`);
    
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

export async function me(accessToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Me failed: ${res.status}`);
  return res.json();
}

export async function fetchProgramLevels(): Promise<DropdownOption[]> {
  const res = await fetch(`${API_BASE_URL}/program-levels/`);
  if (!res.ok) throw new Error(`Program levels failed: ${res.status}`);
  return res.json();
}

export interface ProgramOption extends DropdownOption { id: number; }

export async function fetchPrograms(level?: string): Promise<ProgramOption[]> {
  const url = new URL(`${API_BASE_URL}/programs/`);
  if (level) url.searchParams.set("level", level);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Programs failed: ${res.status}`);
  const data = await res.json();
  return data.map((p: any) => ({ id: p.id, value: String(p.id), label: `${p.name} (${p.level_label})` }));
}
