import { useState, useEffect } from "react";
import { AlertCircle,  Server, Activity, Zap, CheckCircle2, AlertTriangle, ShieldAlert, Trophy } from "lucide-react";
import type { TuneAdvice } from "../types";

export function Dashboard() {
  const [data, setData] = useState<TuneAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // ฟังก์ชันเพื่อดึงข้อมูลจาก Local Python Backend
    const fetchAdvice = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/tune-advice");
        if (!response.ok) {
          throw new Error("Cannot connect to server");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
        setLastUpdated(new Date());
      } catch (err: any) {
        setError("ไม่สามารถเชื่อมต่อกับ Python Backend ได้ (กรุณาเช็คว่าได้สั่งรัน python backend.py แล้วหรือไม่)");
      }
    };

    // ดึงทันที
    fetchAdvice();

    // และดึงใหม่ทุกๆ 2 วินาที
    const interval = setInterval(fetchAdvice, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      
      {/* ส่วนหัวแสดงสถานะการเชื่อมต่อ */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Live Dashboard
          </h2>
          <p className="text-slate-500 mt-1">หน้าจรแสสดผลวิเคราะห์การจูนแก๊สแบบ Real-time</p>
        </div>

        <div className="flex flex-col items-end">
          {error ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold border border-red-100">
              <Server size={16} />
              Backend: Offline
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Backend: Connected
            </div>
          )}
          {lastUpdated && !error && (
             <div className="text-xs text-slate-400 mt-2">
               อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString()}
             </div>
          )}
        </div>
      </div>

      {/* ถ้า Error หรือกำลังรอข้อมูล */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-amber-900 mb-2">ไม่พบสัญญาณจาก Local Backend</h3>
          <p className="text-amber-700 max-w-lg mx-auto">
            {error} กรุณากลับไปดูคู่มือที่แท็บ <strong>"Setup Guide"</strong> เพื่อติดตั้งและเปิดใช้งาน Python Script จับภาพหน้าจอ จากนั้นระบบจะแสดงผลตรงหน้านี้โดยอัตโนมัติ
          </p>
        </div>
      )}

      {/* ข้อมูลเริ่มแสดง (กรณีต่อได้) */}
      {!error && data && data.status === "waiting" && (
         <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">รอการวิเคราะห์รูปภาพแรก...</h3>
             <p className="text-slate-600">
               Python script กำลังถ่ายภาพและส่งให้ Gemini AI วิเคราะห์
             </p>
         </div>
      )}

      {!error && data && data.status !== "waiting" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* แสดง Banner ความสำเร็จเมื่อการจูนสมบูรณ์ */}
           {data.is_finished && (
             <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg md:col-span-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">🎉 การจูนสมบูรณ์แบบแล้ว (Perfect Tune)</h3>
                  <p className="text-emerald-50 text-lg">AI ประเมินว่ากราฟและตารางการจ่ายเชื้อเพลิงในหน้าจออยู่ในเกณฑ์ดีเยี่ยม ไม่จำเป็นต้องปรับตั้งค่าใดๆ เพิ่มเติมแล้ว</p>
                </div>
             </div>
           )}

           {/* Card 1: คำแนะนำหลัก */}
           <div className={`rounded-2xl p-6 text-white shadow-lg md:col-span-2 ${data.is_finished ? 'bg-slate-800' : 'bg-blue-600'}`}>
              <h3 className="text-lg font-semibold text-blue-100 mb-2 flex items-center gap-2">
                 <Zap size={20} /> Recommendations
              </h3>
              <p className="text-2xl font-medium leading-relaxed">
                {data.recommendation || data.message || "ไม่มีคำแนะนำการปรับจูนในตอนนี้"}
              </p>
           </div>

           {/* Card 2: วิเคราะห์รอบเครื่อง */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-4 flex items-center gap-2">
                 <Activity size={16} /> RPM Analysis
              </h3>
              <p className="text-slate-800 text-lg">
                {data.rpm_analysis || "ไม่พบข้อมูลวิเคราะห์รอบเครื่องยนต์"}
              </p>
           </div>

           {/* Card 3: วิเคราะห์ภาระ */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-4 flex items-center gap-2">
                 <Server size={16} /> Load Analysis
              </h3>
              <p className="text-slate-800 text-lg">
                {data.load_analysis || "ไม่พบข้อมูลวิเคราะห์ภาระของเครื่องยนต์"}
              </p>
           </div>

           {/* Card 4: คำเตือนความปลอดภัย (ถ้ามี) */}
           {data.danger_warnings && data.danger_warnings !== "ไม่มี" && !data.danger_warnings.includes("ไม่มีข้อควรระวัง") && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm md:col-span-2 flex gap-4">
                 <div className="bg-red-100 p-3 rounded-full h-fit flex-shrink-0">
                    <ShieldAlert className="text-red-600 w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">
                      ข้อควรระวัง / อันตราย!
                    </h3>
                    <p className="text-red-700 text-lg">
                      {data.danger_warnings}
                    </p>
                 </div>
              </div>
           )}

           {/* โชว์ความปลอดภัยแบบ Clean ถ้าไม่มีอันตราย */}
           {(!data.danger_warnings || data.danger_warnings === "ไม่มี" || data.danger_warnings.includes("ไม่มีข้อควรระวัง")) && (
             <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm md:col-span-2 flex items-center gap-4">
                 <div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
                    <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                 </div>
                 <p className="text-emerald-700 font-medium">
                   ไม่พบจุดที่เป็นอันตรายในตารางจูนปัจจุบัน
                 </p>
             </div>
           )}

        </div>
      )}

    </div>
  );
}
