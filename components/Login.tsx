import React, { useState } from 'react';
import { UserRole } from '../types';
import { User, Lock, ArrowRight, Loader2, Shield, Sword, AlertCircle } from 'lucide-react';
import { DataService } from '../services/dataService';

interface LoginProps {
  onLogin: (role: UserRole, id?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'TEACHER') {
        if (password === 'admin') {
          onLogin('TEACHER');
        } else {
          setError('Invalid Password (Hint: admin)');
        }
      } else {
        const found = await DataService.getStudentSubjects(studentId);
        if (found.length > 0) {
          onLogin('STUDENT', studentId);
        } else {
          setError('ไม่พบรหัสนักเรียน หรือ ระบบขัดข้อง');
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b14] relative overflow-hidden font-sans text-slate-200">
      {/* --- BACKGROUND ATMOSPHERE --- */}
      {/* Dark Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#090e1a] to-[#020617]"></div>
      
      {/* Mystical Fog/Clouds */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      
      {/* Hero Glows */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]"></div>

      {/* Hexagon Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 w-full max-w-[380px] px-4">
        
        {/* --- MAIN CARD CONTAINER --- */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-t-lg rounded-b-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            
            {/* Top Gold Border Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
            
            {/* Corners Decors */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>

            {/* --- LOGO AREA --- */}
            <div className="pt-12 pb-8 text-center relative flex flex-col items-center justify-center">
                <div className="relative group-hover:scale-105 transition-transform duration-500 ease-out">
                    {/* Rotating Ring Effect */}
                    <div className="absolute inset-[-10px] border border-amber-500/30 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
                    
                    {/* Back Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-blue-600 opacity-40 blur-[30px] rounded-full"></div>
                    
                    {/* Emblem Container */}
                    <div className="w-28 h-28 bg-gradient-to-b from-slate-800 to-black rounded-full flex items-center justify-center border-[2px] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] relative z-10 p-3 ring-4 ring-black">
                        <img 
                            src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />
                    </div>
                    
                    {/* Rank Wing Decor (CSS Shapes) */}
                    <div className="absolute top-1/2 left-[-30px] w-8 h-1 bg-gradient-to-l from-amber-500 to-transparent -rotate-12"></div>
                    <div className="absolute top-1/2 right-[-30px] w-8 h-1 bg-gradient-to-r from-amber-500 to-transparent rotate-12"></div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-1">
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 font-black tracking-[0.2em] text-sm uppercase drop-shadow-sm font-sans">
                        Social & History
                    </h2>
                    <div className="h-[1px] w-12 bg-slate-600 my-1"></div>
                    <span className="text-xs text-blue-200 font-bold tracking-[0.3em] uppercase glow-text">อภิชาติ ชุมพล</span>
                </div>
            </div>

            {/* --- ROLE TABS --- */}
            <div className="flex px-6 mb-8 gap-3">
                <button
                    onClick={() => { setActiveTab('STUDENT'); setError(''); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative transition-all skew-x-[-10deg] border-b-2 ${
                        activeTab === 'STUDENT' 
                        ? 'bg-gradient-to-b from-blue-900/50 to-blue-950/80 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2 skew-x-[10deg]">
                        <Shield size={14} className={activeTab === 'STUDENT' ? "text-blue-400" : "text-slate-600"}/> 
                        Player
                    </div>
                </button>

                <button
                    onClick={() => { setActiveTab('TEACHER'); setError(''); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative transition-all skew-x-[-10deg] border-b-2 ${
                        activeTab === 'TEACHER' 
                        ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                >
                     <div className="flex items-center justify-center gap-2 skew-x-[10deg]">
                        <Sword size={14} className={activeTab === 'TEACHER' ? "text-amber-400" : "text-slate-600"}/> 
                        Master
                    </div>
                </button>
            </div>

            {/* --- INPUT FORM --- */}
            <form onSubmit={handleLogin} className="px-8 pb-10 space-y-6 relative z-10">
                
                {activeTab === 'STUDENT' ? (
                    <div className="space-y-2 group">
                        <div className="flex justify-between items-end">
                             <label className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">Player ID</label>
                             <div className="w-10 h-[1px] bg-blue-500/30"></div>
                        </div>
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800/50 flex items-center justify-center border-r border-slate-700 rounded-l-md">
                                <User className="text-slate-400 group-focus-within:text-blue-400 transition-colors" size={16} />
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="ENTER ID"
                                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-700 text-blue-100 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-bold tracking-widest text-sm rounded-md shadow-inner"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 group">
                        <div className="flex justify-between items-end">
                             <label className="text-[9px] font-bold text-amber-300/70 uppercase tracking-widest ml-1 group-focus-within:text-amber-400 transition-colors">Access Key</label>
                             <div className="w-10 h-[1px] bg-amber-500/30"></div>
                        </div>
                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800/50 flex items-center justify-center border-r border-slate-700 rounded-l-md">
                                <Lock className="text-slate-400 group-focus-within:text-amber-400 transition-colors" size={16} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="PASSWORD"
                                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-700 text-amber-100 placeholder-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all font-bold tracking-widest text-sm rounded-md shadow-inner"
                                required
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-950/50 border border-red-900/50 text-red-400 text-[10px] font-bold uppercase tracking-wide p-3 rounded flex items-center gap-2 animate-shake shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                        <AlertCircle size={12} className="text-red-500" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full relative overflow-hidden group py-4 font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 shadow-lg transform active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${
                        activeTab === 'STUDENT' 
                        ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-blue-900/50 border border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-white shadow-amber-900/50 border border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    }`}
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>Start <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </span>
                    
                    {/* Metal Shine Effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 skew-x-12"></div>
                </button>
            </form>

            {/* --- FOOTER --- */}
            <div className="bg-[#0f172a] py-3 text-center border-t border-white/5 relative z-10">
                <div className="flex justify-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    <span>Server: TH-1</span>
                    <span>•</span>
                    <span className="text-green-500">System Online</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};