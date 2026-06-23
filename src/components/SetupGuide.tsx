import { useState } from "react";
import { Download, CheckCircle, Info, Bot, Power, Key } from "lucide-react";

export function SetupGuide() {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // สคริปต์นี้มีความสามารถในการ Auto-install รวบจบในตัวเดียว
  const pythonCode = `import os
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
            print(f"[*] ไม่พบ {pip_name} ในเครื่อง... กำลังดาวน์โหลดและติดตั้งให้รบกวนรอสักครู่")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "--quiet"])

auto_install_requirements()
print("[✔] เตรียมระบบเสร็จสิ้น! กำลังสตาร์ท AI...")

# 2. เริ่มโหลดเครื่องมือหลังจากที่มี Library ครบแล้ว
import threading
import json
import mss
import mss.tools
from flask import Flask, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# KEY ที่รับมาจากหน้าเว็บ
API_KEY = "${apiKeyInput}"

app = Flask(__name__)
CORS(app)

latest_advice = {"status": "waiting", "message": "กำลังรอจ้องมองหน้าจอ..."}

def analyze_screen():
    global latest_advice
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"❌ โหลด AI ไม่ได้: {e}")
        return
        
    with mss.mss() as sct:
        while True:
            try:
                # ถ่ายภาพหน้าจอ 
                filename = sct.shot(mon=-1, output='temp.jpg')
                print(f"[{time.strftime('%X')}] 📸 เห็นหน้าจอแล้ว กำลังให้ AI พิจารณากราฟ...")

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
                print(f"[{time.strftime('%X')}] ✅ ได้คำแนะนำแล้ว! (หน้าเว็บจะอัปเดตอัตโนมัติ)")

            except Exception as e:
                print(f"[{time.strftime('%X')}] ❌ เครื่องวิเคราะห์สะดุดเล็กน้อย กำลังลองใหม่... {str(e)}")
            
            # ถ่ายรูปวิเคราะห์ใหม่ทุกๆ 5 วินาที
            time.sleep(5)

@app.route('/api/tune-advice', methods=['GET'])
def get_advice():
    return jsonify(latest_advice)

if __name__ == '__main__':
    t = threading.Thread(target=analyze_screen, daemon=True)
    t.start()

    print("\\n========================================")
    print("🟢 โหมดผู้ช่วย AI กำลังทำงาน!")
    print("🟢 สลับกลับไปที่แท็บ 'Dashboard' บนเว็บไซต์ได้เลย")
    print("⚠️ (ปล่อยหน้าต่างนี้เปิดทิ้งไว้ขณะจูนรถจ้า) ⚠️")
    print("========================================\\n")
    
    import logging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
`;

  const handleDownload = () => {
    if (!apiKeyInput.trim()) return;

    const blob = new Blob([pythonCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AI-GasTuning-Setup.py";
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
          <Bot className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
          <h2 className="text-3xl font-bold mb-3">ลงโปรแกรมใน 1 คลิก!</h2>
          <p className="text-blue-100 text-lg max-w-2xl relative z-10">
            ไม่ต้องพิมพ์โค้ด ไม่ต้องใช้ Command Prompt ให้วุ่นวาย โหลดไฟล์เดียว ดับเบิ้ลคลิก แล้ว AI จะเริ่มจ้องตารางจูนแก๊สให้คุณทันที 🚀
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-8 items-center text-center max-w-md mx-auto">
            {/* Step 1 */}
            <div className="space-y-4 w-full">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-sm border border-blue-200">1</div>
              <h3 className="text-xl font-bold text-slate-800">ใส่ API Key แล้วดาวน์โหลด</h3>
              <p className="text-slate-600 text-sm">
                นำ API Key ของคุณมาใส่ที่นี่ ระบบจะสร้างสคริปต์ที่พร้อมใช้งานให้ทันที (ปลอดภัยแน่นอน ไม่มีการเก็บข้อมูลไว้บนเซิร์ฟเวอร์)
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
                {isDownloaded ? 'กำลังดาวน์โหลด...' : 'โหลดไฟล์จูนแก๊ส (สำหรับ Windows)'}
              </button>
              <p className="text-xs text-slate-400">ขนาดไฟล์เล็กมาก (~3 KB) ไฟล์นามสกุล .py</p>
            </div>
            
            <div className="w-full h-px bg-slate-200"></div>

            {/* Step 2 */}
            <div className="space-y-4 w-full">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold shadow-sm border border-indigo-200">2</div>
              <h3 className="text-xl font-bold text-slate-800">ดับเบิ้ลคลิกเปิดใช้งาน</h3>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-sm text-slate-600 space-y-4">
                <p className="flex gap-3 items-start">
                  <Power className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span>ดับเบิ้ลคลิกไฟล์ <strong>AI-GasTuning-Setup.py</strong> ที่เพิ่งดาวน์โหลดลงเครื่อง</span>
                </p>
                 <p className="flex gap-3 items-start">
                  <Bot className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>โปรแกรมจะจัดการตั้งค่าตัวเองและเริ่มจับภาพหน้าจอทุกๆ 5 วินาที</span>
                </p>
                <p className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                   <span>เปิดหน้าจอโปรแกรมจูนของคุณทิ้งไว้ แล้วสลับไปแท็บ <strong>Live Dashboard</strong> บนเว็บนี้เพื่อรอดูคำประมวลผลได้เลย!</span>
                </p>
              </div>
            </div>

             <div className="w-full text-center space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm text-left">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                      <Info size={16} /> ดับเบิ้ลคลิกแล้วไม่เกิดอะไรขึ้น ใช่ไหม?
                    </h4>
                    <p className="mb-2">นั่นเป็นเพราะเครื่องของคุณยังไม่ได้ติดตั้งโปรแกรม <strong>Python</strong> ครับ</p>
                    <ol className="list-decimal ml-5 space-y-1 text-amber-700">
                      <li>ไปที่ <b>Microsoft Store</b> ใน Windows ค้นหาคำว่า "Python 3.11" แล้วกดติดตั้ง (ง่ายที่สุด)</li>
                      <li>หรือ ดาวน์โหลดจาก <a href="https://www.python.org/downloads/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Python.org</a> <br/>
                      <span className="text-red-600 font-semibold">*สำคัญมาก:*</span> ตอนกดติดตั้ง ต้อง<b>ติ๊กถูกที่ช่อง "Add python.exe to PATH"</b> (อยู่ด้านล่างสุดของตัวติดตั้ง) ด้วยนะครับ ไม่เช่นนั้นระบบจะหาโปรแกรมไม่เจอ</li>
                      <li>ติดตั้งเสร็จ ลองดับเบิ้ลคลิกไฟล์ใหม่อีกครั้ง หากเปิดขึ้นมาเป็นหน้าต่างสีดำ (Terminal) ถือว่าใช้งานได้แล้ว!</li>
                    </ol>
                </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
