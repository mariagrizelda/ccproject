export type AssessmentType = "EXAM" | "ASSIGNMENT" | "PROJECT" | "MIX";
export type CourseLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type AreaOfStudy = "BEL" | "EAIT" | "HABS" | "HMB" | "HASS" | "SCI";
export type Semester = "Semester 1" | "Semester 2" | "Summer Semester";

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  level: CourseLevel;
  study_area: AreaOfStudy;
  assessment_type: AssessmentType;
  offered_sem_1: boolean;
  offered_sem_2: boolean;
  offered_summer: boolean;
  description: string;
  aim: string;
  prerequisites: string[];
}

// API response type
export interface ApiCourse {
  id: number;
  name: string;
  code: string;
  level: number;
  credits: number;
  aim: string;
  assessment_type: string;
  study_area: string;
  offered_sem_1: boolean;
  offered_sem_2: boolean;
  offered_summer: boolean;
  description: string;
  prerequisites: string[];
}

export interface PlannedCourse extends Course {
  plannedSemester: string; // e.g., "Fall 2024"
}
