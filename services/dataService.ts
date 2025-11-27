
import { SubjectClass, SubjectId, Student, SUBJECTS } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_Id-_iX3VcM64P98Nfj3ddf_NcsU2YXKlE5d9W0ozdSbE4rJDu8LJnVqXdMtIZIZsRg/exec"; 
const USE_MOCK_DATA = false; 
// ==========================================

// Mock Data Generator (Fallback)
const generateMockStudents = (count: number, prefix: string): Student[] => {
  const firstNames = ['สมชาย', 'วิชัย', 'สุดา', 'มานี', 'ปิติ', 'ชูใจ', 'วีระ', 'สมศรี', 'กานดา', 'อาทิตย์'];
  const lastNames = ['ใจดี', 'รักเรียน', 'ขยันยิ่ง', 'มั่งมี', 'ศรีสุข', 'เจริญผล', 'มั่นคง', 'ยอดเยี่ยม'];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}${String(i + 1).padStart(3, '0')}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    scores: {
      collected: Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 8) + 2), // Random 2-10
      midterm: Math.floor(Math.random() * 10) + 10, // Random 10-20
      final: Math.floor(Math.random() * 10) + 10, // Random 10-20
    },
    status: Math.random() > 0.9 ? 'ร' : (Math.random() > 0.95 ? 'มส.' : 'Normal'),
    redeemedDraws: Math.floor(Math.random() * 3)
  }));
};

const INITIAL_MOCK_DATA: SubjectClass[] = [
  { id: 'M1_History', name: 'ม.1 ประวัติศาสตร์', students: generateMockStudents(20, '661') },
  { id: 'M1_Social', name: 'ม.1 สังคมศึกษา', students: generateMockStudents(20, '661') },
  { id: 'M5_History', name: 'ม.5 ประวัติศาสตร์', students: generateMockStudents(15, '665') },
  { id: 'M5_Social', name: 'ม.5 สังคมศึกษา', students: generateMockStudents(15, '665') },
  { id: 'M6_Social', name: 'ม.6 สังคมศึกษา', students: generateMockStudents(25, '666') },
];

const STORAGE_KEY = 'gradebook_data_v3';

// Helper to simulate delay for mock data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DataService = {
  // Fetch all data (Async)
  loadAll: async (): Promise<SubjectClass[]> => {
    if (USE_MOCK_DATA) {
      await delay(500); // Simulate network
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }

    try {
      // Add timestamp to prevent caching
      console.log("Fetching from:", GOOGLE_SCRIPT_URL);
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      const data: any[] = await response.json();
      
      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        throw new Error("Invalid data format from server");
      }
      
      // Map API response to Client Type, ensuring redeemedDraws is read if available
      // Assumption: API might return students with an extra field if GAS is updated
      const typedData: SubjectClass[] = data.map((subject: any) => ({
        ...subject,
        students: subject.students.map((s: any) => ({
            ...s,
            redeemedDraws: s.redeemedDraws !== undefined ? Number(s.redeemedDraws) : 0
        }))
      }));

      console.log("Received Subjects:", typedData.map(d => d.id));
      return typedData;
    } catch (error) {
      console.error("Failed to fetch from Google Sheets:", error);
      // Return empty array to allow UI to show error state
      return [];
    }
  },

  // Save specific subject (Async)
  saveSubject: async (subjectId: SubjectId, students: Student[]) => {
    if (USE_MOCK_DATA) {
      await delay(800);
      const currentDataString = localStorage.getItem(STORAGE_KEY);
      const currentData = currentDataString ? JSON.parse(currentDataString) : INITIAL_MOCK_DATA;
      const updatedData = currentData.map((subj: SubjectClass) => 
        subj.id === subjectId ? { ...subj, students } : subj
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return true;
    }

    try {
      // Using standard POST. 
      // The payload includes the full student object including redeemedDraws
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({ sheetId: subjectId, students: students })
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Failed to save:", error);
      return false;
    }
  },
  
  // Find student across all subjects (Async)
  getStudentSubjects: async (studentId: string): Promise<{ student: Student, subject: SubjectClass }[]> => {
    const allData = await DataService.loadAll();
    const results: { student: Student, subject: SubjectClass }[] = [];
    
    if (!allData || allData.length === 0) return results;

    for (const subj of allData) {
      const found = subj.students.find(s => s.id === studentId);
      if (found) {
        results.push({ student: found, subject: subj });
      }
    }
    return results;
  }
};
