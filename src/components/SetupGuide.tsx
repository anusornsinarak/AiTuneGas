import { useState } from "react";
import { Download, CheckCircle, Bot, Power, Key, MonitorPlay } from "lucide-react";

export function SetupGuide() {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // ไฟล์ Bat Script ทำงานแบบ Polyglot (เป็นทั้ง Bat และ Python ในไฟล์เดียวกัน)
  const batCode = `@echo off & chcp 65001 >nul & (python --version >nul 2>&1 || (echo ============================================== & echo [X] ไมพบโปรแกรม Python ในเครื่องคอมพิวเตอร์ & echo ============================================== & echo. & echo เลื่อนลงมาล่างสุด และติ๊กถูกที่ช่อง Add python.exe to PATH ก่อนกด Install นะครับ & echo. & start https://www.python.org/downloads/ & pause & exit /b)) & cls & python -x "%~f0" %* & pause & exit /b
import os
import sys
import subprocess
import time

print("========================================")
print("🚀 ยินดีต้อนรับสู่ระบบ AI Gas Tuning Assistant")
print("========================================")

# 1. ฟังก์ชันเช็คและติดตั้งไลบรารีอัตโนมัติ (Automagic Installation)
def auto_install_requirements():
    packages = {
        "flask": "flask",
        "flask-cors": "flask_cors",
        "mss": "mss",
        "pillow": "PIL",
        "google-genai": "google.genai"
    }
    for pip_name, module_name in packages.items():
        try:
            __import__(module_name)
        except ImportError:
            print(f"[*] ไม่พบ {pip_name} ในเครื่อง... กำลังดาวน์โหลดให้ รอสักครู่ครับ...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "--quiet"])

auto_install_requirements()
print("[✔] เตรียมระบบเสร็จสิ้น! กำลังเชื่อมต่อระบบ AI...")

import threading
import json
import mss
import mss.tools
from flask import Flask, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

API_KEY = "${apiKeyInput}"

app = Flask(__name__)
CORS(app)

latest_advice = {"status": "waiting", "message": "กำลังรอจ้องมองหน้าจอ..."}

def analyze_screen():
    global latest_advice
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"❌ โหลด AI ไม่สำเร็จ (เช็ค API Key ของคุณอีกครั้ง): {e}")
        return
        
    with mss.mss() as sct:
        while True:
            try:
                filename = sct.shot(mon=-1, output='temp.jpg')
                print(f"[{time.strftime('%X')}] 📸 กำลังวิเคราะห์กราฟและตารางจูนแก๊สของคุณ...")

                myfile = client.files.upload(file=filename)

                system_instruction = """
คุณคือผู้เชี่ยวชาญด้านการจูนแก๊สรถยนต์ (Car Gas Tuning AI Assistant) ที่มีความสามารถสูง
หน้าที่ของคุณคือ:
1. วิเคราะห์หน้าจอโปรแกรมจูนแก๊สที่ผู้ใช้เปิดอยู่
2. ตรวจสอบตารางการจ่ายเชื้อเพลิง, ค่าน้ำมัน, ค่าแก๊ส, กราฟ, หรือ Load ของเครื่องยนต์
3. ให้คำแนะนำเชิงลึกว่าควรปรับจูน (เพิ่ม/ลด) ในช่วงใด หรือมีการตั้งค่าใดที่อันตรายหรือไม่
4. ประเมินว่ากราฟตารางการจูนจุดต่างๆ สมบูรณ์แล้วหรือไม่ หากทับซ้อนเนียนดีหรือไม่มีจุดไหนต้องแก้แล้ว ถือว่า "เสร็จสิ้น"

**กฎเหล็ก**: คุณต้องตอบกลับเป็นฟอร์แมต JSON เท่านั้น ห้ามมีข้อความอื่นปนเด็ดขาด
รูปแบบ JSON ที่ต้องการ:
{
  "status": "ok",
  "rpm_analysis": "อธิบายภาพรวมของรอบเครื่องยนต์...",
  "load_analysis": "อธิบายเกี่ยวกับภาระของเครื่องยนต์...",
  "recommendation": "คำแนะนำว่าควรปรับจูนแก้ไขกราฟแบบไหนกี่ %...",
  "danger_warnings": "คำเตือนหากพบจุดที่เป็นอันตราย (ถ้าไม่มีให้ระบุว่า ไม่มีข้อควรระวัง)",
  "is_finished": false
}
"""
                prompt = "วิเคราะห์หน้าจอตารางจูนแก๊สรถยนต์นี้อย่างละเอียดให้หน่อย"

                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[myfile, prompt],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )

                raw_text = response.text.replace("\`\`\`json", "").replace("\`\`\`", "").strip()
                latest_advice = json.loads(raw_text)
                print(f"[{time.strftime('%X')}] ✅ ให้คำแนะนำเสร็จแล้ว! (หน้าเว็บจะอัปเดตอัตโนมัติ)")

            except Exception as e:
                pass
            
            time.sleep(5)

@app.route('/api/tune-advice', methods=['GET'])
def get_advice():
    return jsonify(latest_advice)

if __name__ == '__main__':
    t = threading.Thread(target=analyze_screen, daemon=True)
    t.start()

    print("\\n========================================")
    print("🟢 โปรแกรมทำงานแล้ว! ย่อหน้าต่างนี้เก็บไว้ได้เลย")
    print("🟢 สลับกลับไปที่แท็บ 'Dashboard' บนเว็บไซต์ เพื่อดูผู้ช่วยแนะนำ...")
    print("========================================\\n")
    
    import logging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
`;

  const handleDownload = () => {
    if (!apiKeyInput.trim()) return;

    // ดาวน์โหลดเป็นไฟล์นามสกุล .bat จะสามารถดับเบิ้ลคลิกใช้งานได้เลยบน Windows
    const blob = new Blob([batCode], { type: "application/bat" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Start_AITuner.bat";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <MonitorPlay className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
          <h2 className="text-3xl font-bold mb-3">แอปโปรแกรมสำหรับ Desktop (คลิ๊กเดียวใช้งานได้เลย)</h2>
          <p className="text-blue-100 text-lg max-w-2xl relative z-10">
            ระบบแก้ปัญหาเรื่องไฟล์ ".py" ให้เป็นไฟล์โปรแกรม ".bat" ให้แล้วครับ! เพียงแค่คุณใส่ API แล้วโหลดไฟล์นี้ไป ก็สามารถดับเบิ้ลคลิกเปิดใช้งานบน Windows ได้เหมือนโปรแกรมสำเร็จรูปในเครื่องปกติเลย
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-8 items-center text-center max-w-md mx-auto">
            {/* Step 1 */}
            <div className="space-y-4 w-full">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-sm border border-blue-200">1</div>
              <h3 className="text-xl font-bold text-slate-800">ใส่ API Key แล้วดาวน์โหลด</h3>
              <p className="text-slate-600 text-sm">
                นำ API Key ของคุณมาใส่ที่นี่ แล้วระบบจะสร้างโปรแกรมแบบคลิกเดียวจบให้ท่านทันที
              </p>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="วาง API Key ของคุณที่นี่..."
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                />
              </div>

              <button 
                onClick={handleDownload}
                disabled={!apiKeyInput.trim()}
                className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${apiKeyInput.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 hover:shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isDownloaded ? <CheckCircle className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                {isDownloaded ? 'กำลังดาวน์โหลด...' : 'โหลดโปรแกรม AI Tuner (.bat)'}
              </button>
            </div>
            
            <div className="w-full h-px bg-slate-200"></div>

            {/* Step 2 */}
            <div className="space-y-4 w-full">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-sm border border-indigo-200">2</div>
              <h3 className="text-xl font-bold text-slate-800">ดับเบิ้ลคลิก (Run) เพื่อใช้งาน</h3>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-sm text-slate-600 space-y-4">
                <p className="flex gap-3 items-start">
                  <Power className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span>ไม่ต้องพิมพ์คำสั่งใดๆ ให้ปวดหัว! เพียงแค่ดับเบิ้ลคลิกไฟล์คอมพิวเตอร์ <strong>Start_AITuner.bat</strong> พึ่งดาวน์โหลดไป</span>
                </p>
                 <p className="flex gap-3 items-start">
                  <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>โปรแกรมจะจัดการตั้งค่าตัวเอง <strong>(หากไม่มี Python ระบบจะแจ้งเตือนและพาไปโหลดอัตโนมัติ)</strong> และเริ่มแคปจอทันที</span>
                </p>
                <p className="flex gap-3 items-start">
                  <MonitorPlay className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                   <span>ย่อหน้าต่างเก็บไว้ แล้วเปิดปะกับหน้าจอโปรแกรมจูนได้เลย! คุณสามารถมาดูผลลัพธ์ผ่านหน้าเว็บนี้ได้ตลอด</span>
                </p>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
