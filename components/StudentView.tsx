
import React, { useState, useEffect } from 'react';
import { Student, SubjectClass } from '../types';
import { calculateGrade, getGradeColor, getRankInfo, getTicketInfo, HeroClass } from '../services/gradingUtils';
import { DataService } from '../services/dataService';
import { Compass, Map, Leaf, Target, Tent, Scroll, Mountain, Skull, Backpack, Box, Trophy, Zap, Ticket, Gift, Sparkles, Loader2 } from 'lucide-react';

interface StudentViewProps {
  enrolled: { student: Student, subject: SubjectClass }[];
}

const ClassIcon: React.FC<{ type: HeroClass; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'Warrior': return <Box className={className} />; 
    case 'Mage': return <Zap className={className} />; 
    case 'Assassin': return <Compass className={className} />; 
    case 'Tank': return <ShieldIcon className={className} />; 
    case 'Support': return <Tent className={className} />; 
    case 'Carry': return <Target className={className} />; 
    default: return <Backpack className={className} />;
  }
};

const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export const StudentView: React.FC<StudentViewProps> = ({ enrolled }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Map SubjectID -> RedeemedCount to maintain optimistic state across tab switches
  const [redeemedMap, setRedeemedMap] = useState<Record<string, number>>({});

  if (!enrolled || enrolled.length === 0) return <div>No data</div>;

  const current = enrolled[selectedIndex];
  const { student, subject } = current;
  const result = calculateGrade(student);
  const collectSum = student.scores.collected.reduce((a,b)=>a+(b||0),0);
  
  const { current: rank, next: nextRank, progress, avatarUrl, heroClass, gender, skinName, rankIndex } = getRankInfo(result.totalScore, student.name, student.id);
  
  // Determine Redeemed Count: Use local optimistic state if exists, otherwise server data
  const currentRedeemed = redeemedMap[subject.id] ?? (student.redeemedDraws || 0);
  const { available: ticketsAvailable, earned: totalEarned } = getTicketInfo(rankIndex, currentRedeemed);

  const handleRedeem = async () => {
    if (ticketsAvailable <= 0) return;
    if (!window.confirm("ยืนยันการใช้สิทธิ์จับรางวัล?\n\nเมื่อกดแล้วตั๋วจะถูกใช้ไปและคุณจะได้สิทธิ์ในการจับรางวัลกับอาจารย์")) return;

    setIsRedeeming(true);
    const newRedeemed = currentRedeemed + 1;

    // Optimistic Update
    setRedeemedMap(prev => ({
        ...prev,
        [subject.id]: newRedeemed
    }));
    
    try {
        // Prepare updated student object
        const updatedStudent = {
            ...student,
            redeemedDraws: newRedeemed
        };

        // Replace student in the full class list (needed for DataService)
        const updatedStudentsList = subject.students.map(s => s.id === student.id ? updatedStudent : s);
        
        // Save to cloud
        const success = await DataService.saveSubject(subject.id, updatedStudentsList);
        
        if (success) {
            // Success: Notify user
            setTimeout(() => {
                alert("✅ บันทึกการใช้สิทธิ์สำเร็จ! \nแคปหน้าจอนี้เพื่อยืนยันสิทธิ์จับรางวัลกับอาจารย์");
            }, 300);
        } else {
            // Failure: Revert state
            setRedeemedMap(prev => {
                const copy = {...prev};
                delete copy[subject.id];
                return copy;
            });
            alert("❌ ไม่สามารถบันทึกข้อมูลได้ \nกรุณาแจ้งอาจารย์ให้ตรวจสอบว่าเพิ่มคอลัมน์ L (Redeemed) ใน Google Sheets แล้วหรือยัง");
        }
    } catch (e) {
        // Error: Revert state
        setRedeemedMap(prev => {
            const copy = {...prev};
            delete copy[subject.id];
            return copy;
        });
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
        setIsRedeeming(false);
    }
  };

  // Roblox/Lego Studs Pattern
  const studsPattern = {
    backgroundImage: `radial-gradient(rgba(0,0,0,0.2) 20%, transparent 20%), radial-gradient(rgba(0,0,0,0.2) 20%, transparent 20%)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 overflow-x-hidden relative`}>
      {/* Background Texture - Roblox Studs */}
      <div className={`fixed inset-0 bg-gradient-to-br ${rank.bgGradient} opacity-80 z-0`}></div>
      <div className="fixed inset-0 opacity-30 z-0" style={studsPattern}></div>
      
      {/* Top Navigation */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 px-4 py-3 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
           <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 w-full">
            {enrolled.map((item, idx) => (
                <button
                key={item.subject.id}
                onClick={() => { setSelectedIndex(idx); }}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                    selectedIndex === idx
                    ? `bg-slate-700 border-slate-900 text-white`
                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                }`}
                >
                {item.subject.name}
                </button>
            ))}
            </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6 relative z-10">
        
        {/* --- ROBLOX AVATAR CARD --- */}
        <div className="relative w-full aspect-[3/4] max-h-[500px] mx-auto rounded-xl overflow-hidden shadow-2xl group border-[8px] border-slate-800 bg-slate-800">
            
            {/* Card Background */}
            <div className={`absolute inset-0 ${rank.bgGradient} opacity-90`}></div>
            <div className="absolute inset-0 opacity-20" style={studsPattern}></div>

            {/* Main Content */}
            <div className="relative h-full w-full flex flex-col items-center pt-8">
                
                {/* Rank Badge Header */}
                <div className={`px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border ${rank.ringColor} mb-4 flex items-center gap-2 shadow-lg`}>
                    <Trophy size={14} className={rank.textColor} />
                    <span className={`text-sm font-black uppercase tracking-widest ${rank.textColor}`}>{rank.tier}</span>
                </div>

                {/* Avatar Image (Robox Cartoon) */}
                <div className="relative w-56 h-56 transition-transform duration-500 group-hover:scale-105">
                     {/* Glow behind avatar */}
                    <div className={`absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75`}></div>
                    <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                    />
                </div>

                {/* Info Box */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md p-5 border-t-4 border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700`}>
                           {skinName}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <ClassIcon type={heroClass} className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase">{heroClass}</span>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black text-white leading-none mb-1 font-sans tracking-tight">
                        {student.name.split(' ')[0]}
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        {student.name.split(' ').slice(1).join(' ')}
                    </p>

                    {/* Blocky Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-400">
                            <span>Level Progress</span>
                            <span className={rank.textColor}>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-800 rounded-sm border border-slate-600 p-0.5">
                            <div 
                                className={`h-full ${rank.bgGradient} relative rounded-sm transition-all duration-1000`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- STATS BLOCKS (Inventory Style) --- */}
        <div className="grid grid-cols-3 gap-3">
             {/* Total Score */}
             <div className="bg-slate-800 border-b-4 border-slate-950 rounded-lg p-3 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group active:translate-y-1 active:border-b-0 transition-all">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Score</span>
                <span className="text-2xl font-black text-white">{result.totalScore}</span>
             </div>
             
             {/* Grade */}
             <div className="bg-slate-800 border-b-4 border-slate-950 rounded-lg p-3 flex flex-col items-center justify-center shadow-lg relative overflow-hidden active:translate-y-1 active:border-b-0 transition-all">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Grade</span>
                <span className={`text-3xl font-black ${getGradeColor(result.grade)}`}>{result.grade}</span>
             </div>

             {/* Status */}
             <div className="bg-slate-800 border-b-4 border-slate-950 rounded-lg p-3 flex flex-col items-center justify-center shadow-lg active:translate-y-1 active:border-b-0 transition-all">
                 <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Status</span>
                 <span className={`text-xs font-bold uppercase tracking-wider ${student.status === 'Normal' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {student.status === 'Normal' ? 'Online' : student.status}
                 </span>
             </div>
        </div>

        {/* --- BONUS REWARDS / LUCKY DRAW --- */}
        <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-600/30 rounded-lg p-5 shadow-xl relative overflow-hidden group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)] animate-pulse"></div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Gift size={16} className="text-amber-400" />
                        <h3 className="text-xs font-black text-amber-100 uppercase tracking-widest">Bonus Rewards</h3>
                    </div>
                    <p className="text-[10px] text-amber-200/70">
                        {ticketsAvailable > 0 ? "You have rewards waiting!" : "Rank up to earn more tickets"}
                    </p>
                </div>
                
                <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-amber-400 font-black text-2xl">
                        <Ticket size={20} />
                        <span>{ticketsAvailable}</span>
                    </div>
                    <span className="text-[9px] text-amber-500 uppercase font-bold tracking-wider">Tickets Available</span>
                </div>
            </div>

            {/* Redeem Button */}
            {ticketsAvailable > 0 && (
                <button 
                    onClick={handleRedeem}
                    disabled={isRedeeming}
                    className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black uppercase tracking-widest py-3 rounded shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                >
                    {isRedeeming ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    {isRedeeming ? 'Processing...' : 'Redeem Ticket Now'}
                </button>
            )}
        </div>

        {/* --- QUEST LOG --- */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                <Scroll size={16} className="text-slate-400"/>
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Quest Log</h3>
            </div>
            
            {/* GATHERING */}
            <div className="relative z-10">
                <div className="flex justify-between mb-1 items-end">
                    <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Farming (Daily)</span>
                    <span className="text-xs font-black text-white">{collectSum} / 60</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-sm overflow-hidden border border-slate-700">
                    <div className="h-full bg-emerald-500" style={{width: `${(collectSum/60)*100}%`}}></div>
                </div>
            </div>

            {/* EXPEDITION */}
            <div className="relative z-10">
                <div className="flex justify-between mb-1 items-end">
                    <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Midterm Event</span>
                    <span className="text-xs font-black text-white">{student.scores.midterm} / 20</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-sm overflow-hidden border border-slate-700">
                    <div className="h-full bg-amber-500" style={{width: `${(student.scores.midterm/20)*100}%`}}></div>
                </div>
            </div>

            {/* BOSS RAID */}
            <div className="relative z-10">
                <div className="flex justify-between mb-1 items-end">
                    <span className="text-xs font-bold uppercase text-rose-400 tracking-wider">Final Boss</span>
                    <span className="text-xs font-black text-white">{student.scores.final} / 20</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-sm overflow-hidden border border-slate-700">
                    <div className="h-full bg-rose-500" style={{width: `${(student.scores.final/20)*100}%`}}></div>
                </div>
            </div>

            <div className="text-center pb-8 pt-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Powered by ROBOX Engine</p>
            </div>

      </div>
    </div>
  );
};
