/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function App() {
  const [uid, setUid] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!uid.trim()) {
      setError("অনুগ্রহ করে একটি সঠিক ইউআইডি (UID) লিখুন।");
      return;
    }

    setLoading(true);
    setError(null);
    setNickname(null);

    try {
      const response = await fetch(`/api/check-uid/${uid}`);
      const data = await response.json();

      if (response.ok) {
        setNickname(data.nickname);
      } else {
        setError(data.error || "ইউআইডি পাওয়া যায়নি বা সার্ভারে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setError("সার্ভারের সাথে যোগাযোগ করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-orange-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[150px]"></div>
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase border border-orange-500/30 rounded-full bg-orange-500/10"
            >
              System v4.2.0-Live
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">
              PLAYER <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">IDENTIFIER</span>
            </h1>
            <p className="mt-3 text-slate-400 font-medium italic text-lg">ফ্রী ফায়ার গ্লোবাল অ্যাকাউন্ট ভেরিফিকেশন সিস্টেম</p>
          </div>

          {/* Main Search Interface */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 opacity-50" />
            
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
                  Enter Player UID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ইউআইডি (UID) লিখুন..."
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-5 px-6 text-2xl font-mono text-white placeholder-slate-800 focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <Search className="w-6 h-6 text-slate-700 group-focus-within:text-orange-500/50 transition-colors" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl text-xl shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    প্রসেসিং হচ্ছে...
                  </>
                ) : (
                  <>চেক নিকনেম (Check Nickname)</>
                )}
              </button>
            </div>

            {/* Results & Errors */}
            <AnimatePresence mode="wait">
              {nickname && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 40 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="border-t border-slate-800/50 pt-8 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner group relative overflow-hidden">
                      <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <User className="text-orange-500 w-10 h-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Account Nickname Found</div>
                      <h2 className="text-4xl font-black text-white tracking-wide break-all">
                        {nickname}
                      </h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">[Status: Active]</span>
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">[Verified]</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400"
                >
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Meta Info */}
          <div className="flex flex-col md:flex-row justify-between items-center px-4 mt-8 gap-4">
            <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>API Server: Online</span>
            </div>
            <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] flex flex-col md:flex-row items-center gap-2 md:gap-6">
              <span>&copy; 2026 FF_IDENTIFIER • CLOUD_LINK</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Developed by:</span>
                <a 
                  href="https://t.me/Tamim_Hasan10" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 border-b border-orange-500/20"
                >
                  Tamim Hasan
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Decorative Bar */}
      <div className="fixed bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
    </div>
  );
}
