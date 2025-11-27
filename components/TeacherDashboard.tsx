
import React, { useState, useEffect, useMemo } from 'react';
import { SubjectId, SubjectClass, Student, SpecialStatus, MAX_SCORES, SUBJECTS } from '../types';
import { DataService } from '../services/dataService';
import { calculateGrade, getGradeColor, getRankInfo, getTicketInfo } from '../services/gradingUtils';
import { Save, Download, Users, BarChart3, TrendingUp, AlertCircle, Loader2, RefreshCw, Ticket, Gift } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('M1_History');
  const [classes, setClasses] = useState<SubjectClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await DataService.loadAll();
    setClasses(data);
    setIsLoading(false);
  };

  // Find class safely
  const currentClass = classes.find(c => c.id === activeSubjectId);

  const handleScoreChange = (studentIndex: number, field: 'midterm' | 'final', value: string) => {
    if (!currentClass) return;
    const numValue = value === '' ? 0 : parseFloat(value);
    const max = field === 'midterm' ? MAX_SCORES.midterm : MAX_SCORES.final;
    
    // Clamp value
    const safeValue = Math.min(Math.max(numValue, 0), max);

    const updatedStudents = [...currentClass.students];
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      scores: {
        ...updatedStudents[studentIndex].scores,
        [field]: safeValue
      }
    };
    updateLocalState(updatedStudents);
  };

  const handleCollectedScoreChange = (studentIndex: number, scoreIndex: number, value: string) => {
    if (!currentClass) return;
    const numValue = value === '' ? 0 : parseFloat(value);
    const safeValue = Math.min(Math.max(numValue, 0), MAX_SCORES.collected);

    const updatedStudents = [...currentClass.students];
    const newCollected = [...updatedStudents[studentIndex].scores.collected];
    newCollected[scoreIndex] = safeValue;
    
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      scores: {
        ...updatedStudents[studentIndex].scores,
        collected: newCollected
      }
    };
    updateLocalState(updatedStudents);
  };

  const handleStatusChange = (studentIndex: number, status: SpecialStatus) => {
    if (!currentClass) return;
    const updatedStudents = [...currentClass.students];
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      status: status
    };
    updateLocalState(updatedStudents);
  };

  const handleRedeemedChange = (studentIndex: number, value: string) => {
    if (!currentClass) return;
    const numValue = Math.max(0, parseInt(value) || 0);
    const updatedStudents = [...currentClass.students];
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      redeemedDraws: numValue
    };
    updateLocalState(updatedStudents);
  };

  const updateLocalState = (newStudents: Student[]) => {
    const updatedClasses = classes.map(c => 
      c.id === activeSubjectId ? { ...c, students: newStudents } : c
    );
    setClasses(updatedClasses);
  };

  const saveToCloud = async () => {
    if(!currentClass) return;
    setIsSaving(true);
    const success = await DataService.saveSubject(activeSubjectId, currentClass.students);
    setIsSaving(false);
    if(success) {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก หรือเชื่อมต่อ Google Sheets ไม่ได้\n\nโปรดตรวจสอบว่าได้ทำการ "Deploy > New Version" ใน Apps Script แล้ว');
    }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    if (!currentClass) return null;
    const grades = currentClass.students.map(s => calculateGrade(s));
    const totalScores = grades.map(g => g.totalScore);
    const validScores = totalScores.filter(s => s > 0);

    const gradeDistribution = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0].map(g => ({
      name: String(g),
      count: grades.filter(r => r.grade === g).length
    }));
    
    const specialCounts = {
      'ร': grades.filter(r => r.grade === 'ร').length,
      'มส.': grades.filter(r => r.grade === 'มส.').length
    };

    return {
      avg: validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 0,
      max: validScores.length ? Math.max(...validScores) : 0,
      min: validScores.length ? Math.min(...validScores) : 0,
      distribution: gradeDistribution,
      special: specialCounts
    };
  }, [currentClass]);

  const exportData = () => {
    if (!currentClass) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,C1,C2,C3,C4,C5,C6,Midterm,Final,Total,Grade,Status,RedeemedDraws\n"
      + currentClass.students.map(s => {
          const res = calculateGrade(s);
          const c = s.scores.collected;
          return `${s.id},${s.name},${c[0]},${c[1]},${c[2]},${c[3]},${c[4]},${c[5]},${s.scores.midterm},${s.scores.final},${res.totalScore},${res.grade},${s.status},${s.redeemedDraws || 0}`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeSubjectId}_grades.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mb-4 text-emerald-500" size={40} />
        <p className="font-medium">กำลังเชื่อมต่อกับ Google Sheets...</p>
        <p className="text-sm mt-2 text-gray-400">กรุณารอสักครู่</p>
      </div>
    );
  }

  // Error State
  if (!currentClass) {
    return (
      <div className="space-y-6">
         {/* Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSubjectId === subj.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {subj.name}
              </button>
            ))}
          </div>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} /> รีเฟรชข้อมูล
          </button>
        </div>

        {/* Error Card */}
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลรายวิชา {activeSubjectId}</h3>
            <p className="text-gray-500 max-w-lg mb-6">
                ระบบไม่ได้รับข้อมูลของวิชานี้จาก Google Sheets กรุณาตรวจสอบชื่อ Tab ใน Sheets และกด Deploy Script เป็นเวอร์ชันใหม่
            </p>
        </div>
      </div>
    );
  }

  // Normal Render
  return (
    <div className="space-y-6 font-sans">
      {/* Subject Tabs and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setActiveSubjectId(subj.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                activeSubjectId === subj.id
                  ? 'bg-indigo-600 text-white transform scale-105 shadow-indigo-300'
                  : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'
              }`}
            >
              {subj.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={loadData}
                disabled={isLoading || isSaving}
                className="flex items-center gap-2 px-3 py-2 bg-sky-100 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-200 transition-colors shadow-sm font-medium"
            >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                รีเฟรช
            </button>
            <button 
            onClick={saveToCloud}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-md transition-all ${
                isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-300 transform hover:-translate-y-0.5'
            }`}
            >
            {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
        </div>
      </div>

      {/* Dashboard Stats - Vibrant Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* นักเรียนทั้งหมด - Blue */}
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide">นักเรียนทั้งหมด</span>
          </div>
          <div className="text-3xl font-black text-blue-800 mt-2">{currentClass.students.length} คน</div>
        </div>

        {/* คะแนนเฉลี่ย - Yellow/Amber */}
        <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
             <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp size={20} />
             </div>
            <span className="text-sm font-bold uppercase tracking-wide">คะแนนเฉลี่ย</span>
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{stats?.avg}</div>
        </div>

        {/* Max/Min - Green */}
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200 hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 text-emerald-600 mb-2">
             <div className="p-2 bg-emerald-100 rounded-lg">
                <BarChart3 size={20} />
             </div>
            <span className="text-sm font-bold uppercase tracking-wide">Max / Min</span>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-700">{stats?.max}</span>
            <span className="text-sm text-emerald-400 mb-2 font-bold">/</span>
            <span className="text-3xl font-black text-emerald-500/60">{stats?.min}</span>
          </div>
        </div>

        {/* สถานะพิเศษ - Pink/Red */}
        <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-200 hover:shadow-md transition-shadow flex flex-col justify-between">
           <div className="flex items-center gap-3 text-rose-600">
             <div className="p-2 bg-rose-100 rounded-lg">
                <AlertCircle size={20} />
             </div>
            <span className="text-sm font-bold uppercase tracking-wide">สถานะพิเศษ</span>
          </div>
          <div className="flex gap-4 mt-3">
             <div className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-rose-100"><span className="font-bold text-orange-500">ร:</span> {stats?.special['ร']}</div>
             <div className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-rose-100"><span className="font-bold text-red-600">มส.:</span> {stats?.special['มส.']}</div>
          </div>
        </div>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
            รายชื่อและคะแนนสอบ
          </h3>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all font-bold"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-slate-100 z-10 w-24 border-r border-slate-200 text-slate-600">รหัส</th>
                <th className="px-4 py-3 sticky left-24 bg-slate-100 z-10 w-64 shadow-lg border-r border-slate-200 text-slate-600">ชื่อ-สกุล / Rank</th>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <th key={i} className="px-2 py-3 text-center min-w-[60px] bg-yellow-50/80 text-yellow-800 border-r border-yellow-100">
                    เก็บ {i} <br/><span className="text-[10px] opacity-60">(10)</span>
                  </th>
                ))}
                <th className="px-2 py-3 text-center bg-sky-50 text-sky-800 border-r border-sky-100 min-w-[70px]">
                    กลางภาค <br/><span className="text-[10px] opacity-60">(20)</span>
                </th>
                <th className="px-2 py-3 text-center bg-purple-50 text-purple-800 border-r border-purple-100 min-w-[70px]">
                    ปลายภาค <br/><span className="text-[10px] opacity-60">(20)</span>
                </th>
                <th className="px-4 py-3 text-center font-bold text-emerald-800 bg-emerald-50 border-r border-emerald-100">รวม</th>
                <th className="px-4 py-3 text-center font-bold text-indigo-800 bg-indigo-50 border-r border-indigo-100">เกรด</th>
                <th className="px-4 py-3 text-center min-w-[100px] bg-slate-50 text-slate-600">สถานะ</th>
                <th className="px-3 py-3 text-center bg-amber-50 text-amber-800 min-w-[140px]">
                    Gacha Tickets <br/>
                    <span className="text-[10px] opacity-60">(Available / Used / Total)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentClass.students.map((student, idx) => {
                const result = calculateGrade(student);
                const {current: rank, avatarUrl, skinName, rankIndex} = getRankInfo(result.totalScore, student.name, student.id);
                const ticketInfo = getTicketInfo(rankIndex, student.redeemedDraws || 0);

                return (
                  <tr key={student.id} className="border-b hover:bg-slate-50 group transition-colors">
                    <td className="px-4 py-3 font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-slate-500 border-r border-slate-100">{student.id}</td>
                    <td className="px-4 py-2 sticky left-24 bg-white group-hover:bg-slate-50 z-10 shadow-lg border-r border-slate-100">
                        <div className="flex items-center gap-3">
                             {/* Avatar */}
                             <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-md bg-stone-100 object-contain border border-gray-200" />
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                    {student.name}
                                </span>
                                <span className={`text-[10px] font-bold ${rank.textColor} flex items-center gap-1 uppercase`}>
                                    {skinName}
                                </span>
                             </div>
                        </div>
                    </td>
                    
                    {/* Collected Scores */}
                    {student.scores.collected.map((score, sIdx) => (
                      <td key={sIdx} className="px-1 py-2 text-center border-r border-slate-100">
                        <input 
                          type="number" 
                          min="0" max="10"
                          value={score === 0 ? '' : score}
                          placeholder={score === 0 ? '0' : ''}
                          onChange={(e) => handleCollectedScoreChange(idx, sIdx, e.target.value)}
                          className="w-10 text-center border-slate-200 rounded focus:ring-yellow-500 focus:border-yellow-500 p-1 text-slate-700 bg-yellow-50/30 focus:bg-white transition-colors font-medium"
                        />
                      </td>
                    ))}

                    {/* Exams */}
                    <td className="px-1 py-2 text-center bg-sky-50/20 border-r border-slate-100">
                      <input 
                        type="number" min="0" max="20"
                        value={student.scores.midterm === 0 ? '' : student.scores.midterm}
                        placeholder={student.scores.midterm === 0 ? '0' : ''}
                        onChange={(e) => handleScoreChange(idx, 'midterm', e.target.value)}
                        className="w-12 text-center border-sky-200 rounded focus:ring-sky-500 focus:border-sky-500 p-1 font-bold text-sky-800 bg-white"
                      />
                    </td>
                    <td className="px-1 py-2 text-center bg-purple-50/20 border-r border-slate-100">
                      <input 
                        type="number" min="0" max="20"
                        value={student.scores.final === 0 ? '' : student.scores.final}
                        placeholder={student.scores.final === 0 ? '0' : ''}
                        onChange={(e) => handleScoreChange(idx, 'final', e.target.value)}
                        className="w-12 text-center border-purple-200 rounded focus:ring-purple-500 focus:border-purple-500 p-1 font-bold text-purple-800 bg-white"
                      />
                    </td>

                    {/* Result */}
                    <td className="px-4 py-3 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-emerald-100">
                      {result.totalScore}
                    </td>
                    <td className={`px-4 py-3 text-center text-lg font-black bg-indigo-50/30 border-r border-indigo-100 ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3 text-center border-r border-slate-100">
                      <select 
                        value={student.status}
                        onChange={(e) => handleStatusChange(idx, e.target.value as SpecialStatus)}
                        className={`text-xs p-1 rounded-md border-none focus:ring-2 font-bold cursor-pointer transition-colors ${
                          student.status === 'Normal' ? 'bg-slate-100 text-slate-500 focus:ring-slate-300' : 
                          student.status === 'ร' ? 'bg-orange-100 text-orange-600 focus:ring-orange-300' : 'bg-red-100 text-red-600 focus:ring-red-300'
                        }`}
                      >
                        <option value="Normal">ปกติ</option>
                        <option value="ร">ร</option>
                        <option value="มส.">มส.</option>
                      </select>
                    </td>

                     {/* Redeemed Draws - Detailed View */}
                     <td className="px-3 py-2 text-center bg-amber-50/30">
                        <div className="flex flex-row items-center justify-center gap-3">
                            {/* Available */}
                             <div className="flex flex-col items-center">
                                <span className={`text-xs font-bold ${ticketInfo.available > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {ticketInfo.available}
                                </span>
                                <span className="text-[9px] text-gray-400 uppercase">เหลือ</span>
                             </div>

                             <div className="h-6 w-[1px] bg-amber-200"></div>

                            {/* Used (Editable) */}
                             <div className="flex flex-col items-center">
                                <input 
                                    type="number" min="0"
                                    value={student.redeemedDraws || 0}
                                    onChange={(e) => handleRedeemedChange(idx, e.target.value)}
                                    className="w-10 text-center border-amber-200 rounded focus:ring-amber-500 p-0.5 text-xs bg-white text-amber-800 font-bold"
                                />
                                <span className="text-[9px] text-gray-400 uppercase">ใช้ไป</span>
                             </div>

                             <div className="h-6 w-[1px] bg-amber-200"></div>

                            {/* Total */}
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-gray-600">{ticketInfo.earned}</span>
                                <span className="text-[9px] text-gray-400 uppercase">ทั้งหมด</span>
                            </div>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
