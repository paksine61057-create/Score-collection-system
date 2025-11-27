import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentView } from './components/StudentView';
import { UserRole, Student, SubjectClass } from './types';
import { DataService } from './services/dataService';
import { LogOut, LayoutDashboard, UserCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | undefined>(undefined);
  
  // Student Data State
  const [studentData, setStudentData] = useState<{ student: Student, subject: SubjectClass }[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    if (role === 'STUDENT' && currentStudentId) {
      loadStudentData(currentStudentId);
    }
  }, [role, currentStudentId]);

  const loadStudentData = async (id: string) => {
    setLoadingStudent(true);
    const data = await DataService.getStudentSubjects(id);
    setStudentData(data);
    setLoadingStudent(false);
  };

  // Handlers
  const handleLogin = (newRole: UserRole, id?: string) => {
    setRole(newRole);
    if (id) setCurrentStudentId(id);
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentStudentId(undefined);
    setStudentData([]);
  };

  // Rendering logic based on role
  const renderContent = () => {
    if (!role) {
      return <Login onLogin={handleLogin} />;
    }

    if (role === 'TEACHER') {
      return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600">
                        <LayoutDashboard size={24} />
                        <span className="font-bold text-lg">Teacher Console</span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium">
                        ออกจากระบบ <LogOut size={16} />
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <TeacherDashboard />
            </main>
        </div>
      );
    }

    if (role === 'STUDENT') {
      if (loadingStudent) {
         return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
         );
      }

      if (!studentData || studentData.length === 0) return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-gray-500 mb-4">ไม่พบข้อมูลสำหรับรหัสนี้</p>
              <button onClick={handleLogout} className="text-amber-600 hover:underline">กลับไปหน้าล็อกอิน</button>
          </div>
      );

      const studentName = studentData[0].student.name;

      return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                        <UserCircle size={24} />
                        <span className="font-semibold">{studentName}</span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>
            <main className="max-w-md mx-auto px-4 py-8">
                <StudentView enrolled={studentData} />
            </main>
        </div>
      );
    }

    return null;
  };

  return renderContent();
}