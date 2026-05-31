"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, 
  HelpCircle, MessageSquare, Info, ShieldAlert, BookOpen
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function CivilianChat() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  
  // Chat configuration
  const [language, setLanguage] = useState<"en" | "ta" | "hi" | "te">("ta");
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "வணக்கம்! நான் உங்கள் சாலையின் குரல் உதவி ரோபோ. தமிழ்நாடு நெடுஞ்சாலைச் சட்டம், புகார் செயல்முறை மற்றும் பரிசுத் திட்டம் பற்றி நீங்கள் கேட்கலாம். (Hello! I am your சாலையின் குரல் AI assistant. Ask me about PWD guidelines, SLA timelines, or rewards.)"
    }
  ]);

  const [loadingResponse, setLoadingResponse] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Web Speech API recognition instances
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const sess = localStorage.getItem("roadguard_session");
    if (!sess) {
      router.push("/login");
      return;
    }
    setSession(JSON.parse(sess));

    // Scroll to bottom on mount
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [router]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition client side
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Set language code based on state
      const langCodeMap = { en: "en-IN", ta: "ta-IN", hi: "hi-IN", te: "te-IN" };
      rec.lang = langCodeMap[language];

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);
      
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported on this browser version.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Configure lang
      const langCodeMap = { en: "en-IN", ta: "ta-IN", hi: "hi-IN", te: "te-IN" };
      recognitionRef.current.lang = langCodeMap[language];
      recognitionRef.current.start();
    }
  };

  // Speaks response aloud using Web Speech Synthesis
  const speakText = (text: string) => {
    if (!voiceOutputEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    // stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCodeMap = { en: "en-IN", ta: "ta-IN", hi: "hi-IN", te: "te-IN" };
    utterance.lang = langCodeMap[language];
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const newMsg: Message = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoadingResponse(true);

    // Mock API delay & response matching Tamil Nadu Highways Act / CMDA standards
    setTimeout(() => {
      setLoadingResponse(false);
      
      let replyText = "";
      const lower = textToSend.toLowerCase();

      // Bot rules answers
      if (language === "ta") {
        if (lower.includes("புகார்") || lower.includes("எப்படி")) {
          replyText = "தமிழ்நாடு நெடுஞ்சாலைச் சட்டம் 2002 (NH Act 2002) விதிமுறைப்படி, பொதுமக்கள் புகார் செய்தவுடன் மாநகராட்சி எல்லைக்குள் உள்ள குழிகள் 7 நாட்களுக்குள் சரிசெய்யப்பட வேண்டும். புகார் செய்ய 'புகார் செய்' பக்கத்திற்குச் சென்று புகைப்படத்தைப் பதிவேற்றவும்.";
        } else if (lower.includes("புள்ளி") || lower.includes("பரிசு")) {
          replyText = "நீங்கள் புகார் அளித்து அது அதிகாரிகளால் சரிபார்க்கப்பட்டால் 100 முதல் 250 புள்ளிகள் வரை வழங்கப்படும். அப்புள்ளிகளைக் கொண்டு பசுமை அங்காடிகளில் மரக்கன்றுகள் அல்லது பாரம்பரிய அரிசிப் பைகளைப் பெற்றுக் கொள்ளலாம்.";
        } else {
          replyText = "நெடுஞ்சாலை வாரிய SLA விதிகளின்படி, உங்கள் பகுதியில் உள்ள சாலைச் சேதங்களை ரோடு கார்டு செயலி மூலம் 2 நிமிடங்களில் புகார் செய்யலாம். புகார் சமர்ப்பிக்கப்பட்டால் 24 மணிநேரத்திற்குள் சரிபார்க்கப்படும்.";
        }
      } else if (language === "en") {
        if (lower.includes("how") || lower.includes("report")) {
          replyText = "According to the Tamil Nadu Highway Act 2002, municipal potholes must be resolved within 7 days of validation by the PWD department. You can report by going to the 'Report Issue' page and capturing a photo.";
        } else if (lower.includes("points") || lower.includes("rewards")) {
          replyText = "Verified reports earn between 100 to 250 points based on the severity of the damage. Points can be redeemed for Neem saplings or compost kits under our sustainability program.";
        } else {
          replyText = "According to PWD road maintenance SLA guidelines (CMDA 2024), major road damage needs to be triaged within 24 hours. Let me know if you need assistance submitting details!";
        }
      } else if (language === "hi") {
        replyText = "तमिलनाडु राजमार्ग अधिनियम 2002 के नियमों के अनुसार, गड्ढों को 7 दिनों के भीतर ठीक किया जाना अनिवार्य है। शिकायत दर्ज करने के लिए फ़ोटो अपलोड करें और पुरस्कार अंक प्राप्त करें।";
      } else {
        // telugu
        replyText = "తమిళనాడు హైవేస్ యాక్ట్ 2002 నిబంధనల ప్రకారం, రహదారి గుంతలను 7 రోజులలోపు తప్పనిసరిగా పరిష్కరించాలి. పాయింట్లు సంపాదించి ఉచిత మొక్కలు పొందండి.";
      }

      setMessages(prev => [...prev, { sender: "bot", text: replyText }]);
      speakText(replyText);
    }, 1200);
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  // Quick reply chips based on language
  const chips = language === "ta" 
    ? ["புகார் செய்வது எப்படி?", "எனது புள்ளிகள் என்ன?", "குழிகள் சரிசெய்ய எவ்வளவு நாள் ஆகும்?"]
    : ["How to report road damage?", "How does rewards work?", "What is the pothole repair SLA timeline?"];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors pb-12">
      <Navbar portal="civilian" userName={session?.name} />

      <main className="flex-1 max-w-md md:max-w-2xl w-full mx-auto px-4 mt-6 flex flex-col justify-between h-[calc(100vh-140px)]">
        
        {/* Chat Header card */}
        <div className="p-4 rounded-2xl glass border border-slate-200 dark:border-slate-800 shadow-md flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-sm dark:text-white text-secondary leading-tight">
                சாலையின் குரல் Voice Bot
              </h2>
              <span className="text-[9.5px] font-mono text-slate-500 block uppercase">PWD Regulations Assistant</span>
            </div>
          </div>

          {/* Voice Output controls & Language selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className={`p-1.5 rounded-lg border ${
                voiceOutputEnabled 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400"
              } transition`}
              title="Toggle Read-Aloud"
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="py-1 px-2 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              <option value="ta">தமிழ்</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl glass border border-slate-200 dark:border-slate-800 shadow-lg my-4 space-y-4 max-h-[400px]">
          {messages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={index}
                className={`flex w-full ${isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-sm ${
                    isBot
                      ? "bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-tl-none text-slate-700 dark:text-slate-200"
                      : "bg-primary text-white rounded-tr-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
          {loadingResponse && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-tl-none flex items-center space-x-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick reply chips */}
        <div className="flex overflow-x-auto space-x-2 pb-2 shrink-0 max-w-full">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-650 dark:text-slate-350 whitespace-nowrap transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-2.5 rounded-2xl glass border border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0">
          <button
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border transition ${
              isRecording 
                ? "bg-danger text-white border-danger animate-pulse" 
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-450"
            }`}
            title="Voice Record (Web Speech)"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            placeholder={language === "ta" ? "இங்கு தட்டச்சு செய்யவும்..." : "Ask AI chatbot about road standards..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(input);
            }}
            className="flex-grow py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-primary transition"
          />
          <button
            onClick={() => handleSendMessage(input)}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition shadow-md shadow-primary/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </main>
    </div>
  );
}
