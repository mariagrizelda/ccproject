import { Course } from "@/types/course";

export const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    credits: 3,
    level: "1",
    area: "Computer Science",
    assessment: "Mix",
    semester: ["Semester 1", "Semester 2"],
    description: "Learn fundamental programming concepts using Python. Cover variables, control structures, functions, and basic data structures."
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures",
    credits: 4,
    level: "2",
    area: "Computer Science",
    assessment: "Exam",
    semester: ["Semester 1", "Semester 2"],
    description: "Study fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs.",
    prerequisites: ["CS101"]
  },
  {
    id: "3",
    code: "CS301",
    name: "Algorithms",
    credits: 4,
    level: "3",
    area: "Computer Science",
    assessment: "Project",
    semester: ["Semester 1"],
    description: "Advanced study of algorithm design and analysis. Topics include sorting, searching, dynamic programming, and graph algorithms.",
    prerequisites: ["CS201"]
  },
  {
    id: "4",
    code: "MATH150",
    name: "Calculus I",
    credits: 4,
    level: "1",
    area: "Mathematics",
    assessment: "Exam",
    semester: ["Semester 1", "Semester 2", "Summer Semester"],
    description: "Introduction to differential calculus including limits, derivatives, and applications."
  },
  {
    id: "5",
    code: "MATH250",
    name: "Linear Algebra",
    credits: 3,
    level: "2",
    area: "Mathematics",
    assessment: "Mix",
    semester: ["Semester 1", "Semester 2"],
    description: "Study of vector spaces, matrices, determinants, eigenvalues, and linear transformations."
  },
  {
    id: "6",
    code: "ENG102",
    name: "Technical Writing",
    credits: 3,
    level: "1",
    area: "Arts",
    assessment: "Assignment",
    semester: ["Semester 1", "Semester 2"],
    description: "Develop professional writing skills for technical documentation, reports, and presentations."
  },
  {
    id: "7",
    code: "CS401",
    name: "Machine Learning",
    credits: 4,
    level: "4",
    area: "Computer Science",
    assessment: "Project",
    semester: ["Semester 2"],
    description: "Introduction to machine learning algorithms, neural networks, and practical applications.",
    prerequisites: ["CS301", "MATH250"]
  },
  {
    id: "8",
    code: "BUS201",
    name: "Business Analytics",
    credits: 3,
    level: "2",
    area: "Business",
    assessment: "Mix",
    semester: ["Semester 1", "Semester 2"],
    description: "Learn data-driven decision making, statistical analysis, and business intelligence tools."
  },
  {
    id: "9",
    code: "ENG210",
    name: "Thermodynamics",
    credits: 4,
    level: "2",
    area: "Engineering",
    assessment: "Exam",
    semester: ["Semester 1"],
    description: "Study of energy transfer, heat engines, and thermodynamic cycles."
  },
  {
    id: "10",
    code: "SCI150",
    name: "Physics I",
    credits: 4,
    level: "1",
    area: "Science",
    assessment: "Mix",
    semester: ["Semester 1", "Semester 2"],
    description: "Classical mechanics including kinematics, dynamics, energy, and momentum."
  },
  {
    id: "11",
    code: "CS350",
    name: "Database Systems",
    credits: 3,
    level: "3",
    area: "Computer Science",
    assessment: "Project",
    semester: ["Semester 2"],
    description: "Design and implementation of database systems, SQL, normalization, and transactions.",
    prerequisites: ["CS201"]
  },
  {
    id: "12",
    code: "CS320",
    name: "Web Development",
    credits: 3,
    level: "3",
    area: "Computer Science",
    assessment: "Project",
    semester: ["Semester 1", "Semester 2"],
    description: "Modern web development using HTML, CSS, JavaScript, and frameworks like React.",
    prerequisites: ["CS101"]
  }
];
