import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Star,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Flame,
  Copy,
  Check,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { Scenario, LiveChatMessage, BestResponseItem, AIFeedback, SessionAttempt } from '../types';

interface LiveAIChatRoomProps {
  scenario: Scenario;
  onSessionCompleted?: (attempt: Omit<SessionAttempt, 'id' | 'timestamp' | 'scoreNumber'>) => void;
  onResetScenario?: () => void;
}

export const LiveAIChatRoom: React.FC<LiveAIChatRoomProps> = ({
  scenario,
  onSessionCompleted,
  onResetScenario
}) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>([
    {
      id: 'init-1',
      sender: 'partner',
      text: scenario.initialPrompt,
      timestamp: 'Vừa xong'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);

  // Best response drawer state
  const [bestResponses, setBestResponses] = useState<BestResponseItem[] | null>(null);
  const [isLoadingBestResponse, setIsLoadingBestResponse] = useState(false);
  const [showBestResponsePanel, setShowBestResponsePanel] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, showBestResponsePanel]);

  // Reset chat when scenario changes
  useEffect(() => {
    setMessages([
      {
        id: `init-${scenario.id}`,
        sender: 'partner',
        text: scenario.initialPrompt,
        timestamp: 'Vừa xong'
      }
    ]);
    setInputMessage('');
    setBestResponses(null);
    setShowBestResponsePanel(false);
    setServiceNotice(null);
  }, [scenario]);

  // Request best response suggestions for the current turn
  const fetchBestResponses = async () => {
    setIsLoadingBestResponse(true);
    setShowBestResponsePanel(true);
    try {
      // Find latest partner message
      const lastPartnerMsg = [...messages].reverse().find(m => m.sender === 'partner');
      const currentPromptText = lastPartnerMsg ? lastPartnerMsg.text : scenario.initialPrompt;

      const res = await fetch('/api/best-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: {
            id: scenario.id,
            title: scenario.title,
            partnerName: scenario.partnerName,
            partnerRole: scenario.partnerRole,
            contextDescription: scenario.contextDescription
          },
          currentPrompt: currentPromptText,
          dialogueHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!res.ok) {
        throw new Error(`API best-response error status: ${res.status}`);
      }
      const data = await res.json();
      if (data.bestResponses && Array.isArray(data.bestResponses)) {
        setBestResponses(data.bestResponses);
      }
      if (data.aiGenerated === false && data.serviceWarning) {
        setServiceNotice(data.serviceWarning);
      }
    } catch (e) {
      console.error('Error fetching best responses:', e);
      setServiceNotice('Chưa tải được gợi ý AI. Em thử lại sau nhé.');
    } finally {
      setIsLoadingBestResponse(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsgId = `student-${Date.now()}`;
    const userMessage: LiveChatMessage = {
      id: userMsgId,
      sender: 'student',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);
    setServiceNotice(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: {
            id: scenario.id,
            title: scenario.title,
            partnerName: scenario.partnerName,
            partnerRole: scenario.partnerRole,
            contextDescription: scenario.contextDescription
          },
          dialogueHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
          studentMessage: userText
        })
      });

      if (!res.ok) {
        throw new Error('API chat error status: ' + res.status);
      }

      const data = await res.json();
      setServiceNotice(data.aiGenerated === false
        ? (data.serviceWarning || 'Gemini chưa phản hồi; hiện đang dùng phản hồi dự phòng.')
        : null);

      // Construct AIFeedback structure for recording
      const friendlyRewrite = data.bestResponses?.[0]?.text || `“${userText}”`;
      const politeRewrite = data.bestResponses?.[1]?.text || friendlyRewrite;
      const partnerReply = data.partnerReply || '';
      const feedbackObj: AIFeedback = {
        criteria: data.criteria || [
          { name: 'Rõ ràng', score: 2, level: 'Rất tốt', reason: 'Diễn đạt rõ ý.' },
          { name: 'Lịch sự', score: 2, level: 'Rất tốt', reason: 'Xưng hô thân thiện, lịch thiệp.' },
          { name: 'Phù hợp', score: 2, level: 'Rất tốt', reason: 'Hợp ngữ cảnh học đường.' }
        ],
        strengths: data.strengths || data.quickPraise || 'Cách nói tự nhiên, lịch sự và chân thành.',
        improvements: data.improvements || 'Có thể bổ sung thêm lý do hoặc đề xuất để cuộc trò chuyện rõ ràng hơn.',
        rewrites: { friendly: friendlyRewrite, polite_confident: politeRewrite },
        character_follow_up: partnerReply,
        shortSuggestion: friendlyRewrite,
        alternativeSuggestion: politeRewrite,
        followUpDialogue: partnerReply
      };

      // Update student message with score & praise
      setMessages(prev =>
        prev.map(m =>
          m.id === userMsgId
            ? {
                ...m,
                quickScore: typeof data.quickScore === 'number' ? data.quickScore : 9.2,
                quickPraise: data.quickPraise,
                feedback: feedbackObj,
                bestResponses: data.bestResponses
              }
            : m
        )
      );

      // Add partner response bubble
      const partnerMsgId = `partner-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: partnerMsgId,
          sender: 'partner',
          text: data.partnerReply || `Cảm ơn em! ${scenario.partnerName} rất vui được trò chuyện.`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          bestResponses: data.bestResponses
        }
      ]);

      // If new best responses returned, update panel if open
      if (data.bestResponses) {
        setBestResponses(data.bestResponses);
      }

      // Record to global session history
      if (onSessionCompleted) {
        onSessionCompleted({
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          category: scenario.category,
          categoryTag: scenario.categoryTag,
          difficulty: scenario.difficulty,
          partnerName: scenario.partnerName,
          partnerAvatar: scenario.partnerAvatar,
          studentResponse: userText,
          feedback: feedbackObj
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Do not pretend the AI understood the student when the API failed.
      setServiceNotice('Chưa kết nối được với máy chủ AI nên chưa có phản hồi cho câu này. Kiểm tra API trên Vercel rồi thử gửi lại nhé.');
    } finally {
      setIsSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyBestResponse = (text: string) => {
    // Strip surrounding quotes if present
    const cleaned = text.replace(/^["“]|["”]$/g, '').trim();
    setInputMessage(cleaned);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = (text: string, index: number) => {
    const cleaned = text.replace(/^["“]|["”]$/g, '').trim();
    navigator.clipboard.writeText(cleaned);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'partner',
        text: scenario.initialPrompt,
        timestamp: 'Vừa xong'
      }
    ]);
    setInputMessage('');
    setBestResponses(null);
    setShowBestResponsePanel(false);
    setServiceNotice(null);
    if (onResetScenario) {
      onResetScenario();
    }
  };

  return (
    <div className="flex flex-col h-[640px] bg-[#070e28] rounded-2xl border border-sky-500/30 overflow-hidden shadow-[0_8px_32px_rgba(2,6,23,0.7)] relative">
      {/* Top Messenger Header */}
      <div className="bg-gradient-to-r from-[#0e193f] via-[#091230] to-[#060c23] px-4 sm:px-6 py-3.5 border-b border-sky-500/25 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-sky-500/20 border border-sky-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              {scenario.partnerAvatar}
            </div>
            {/* Live Online Pulse Indicator */}
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#070e28] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                <span>{scenario.partnerName}</span>
                <span className="text-[11px] font-normal text-slate-400">({scenario.partnerRole})</span>
              </h4>
              <span className="hidden sm:inline-block text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-400/30">
                AI Real-time
              </span>
            </div>
            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Đang trực tuyến • Sẵn sàng đối thoại như người thật</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Best Response Helper Trigger Button */}
          <motion.button
            type="button"
            onClick={() => {
              if (!showBestResponsePanel && !bestResponses) {
                fetchBestResponses();
              } else {
                setShowBestResponsePanel(prev => !prev);
              }
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              showBestResponsePanel
                ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-amber-500/30 text-amber-300 hover:border-amber-400/60'
            }`}
            title="Nhận gợi ý những câu đối đáp xuất sắc nhất cho lượt này"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Câu đối đáp hay nhất</span>
            <span className="sm:hidden">Gợi ý vàng</span>
          </motion.button>

          {/* Reset Chat Button */}
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            title="Bắt đầu lại cuộc trò chuyện từ đầu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scenario Brief Context Bar */}
      <div className="bg-[#050b20] px-4 py-2 border-b border-sky-500/15 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white">Bối cảnh:</strong> {scenario.contextDescription}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {scenario.difficulty && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              scenario.difficulty === 'easy'
                ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400/40'
                : scenario.difficulty === 'medium'
                ? 'text-amber-300 bg-amber-950/80 border-amber-400/40'
                : 'text-rose-300 bg-rose-950/80 border-rose-400/40'
            }`}>
              <span>{scenario.difficulty === 'easy' ? '🌱 Dễ' : scenario.difficulty === 'medium' ? '⚡ Vừa sức' : '🔥 Thử thách'}</span>
            </span>
          )}
          <span className="text-[10px] text-sky-400 font-semibold bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-500/20">
            {scenario.category}
          </span>
        </div>
      </div>

      {serviceNotice && (
        <div role="status" className="shrink-0 px-4 py-2 border-b border-amber-400/25 bg-amber-950/40 text-amber-200 text-xs leading-relaxed">
          <span className="font-semibold">Lưu ý về AI:</span> {serviceNotice}
        </div>
      )}

      {/* Main Chat Stream */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
      >
        {messages.map((msg, index) => {
          const isPartner = msg.sender === 'partner';
          const isExpanded = expandedFeedbackId === msg.id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2.5 sm:gap-3 max-w-2xl ${
                isPartner ? '' : 'ml-auto justify-end'
              }`}
            >
              {/* Partner Avatar */}
              {isPartner && (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-400/30 text-white flex items-center justify-center text-lg shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.2)] mt-0.5">
                  {scenario.partnerAvatar}
                </div>
              )}

              <div className={`space-y-1.5 max-w-[85%] sm:max-w-[80%]`}>
                {/* Bubble Container */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border relative shadow-md ${
                    isPartner
                      ? 'bg-[#0d1738] border-sky-500/25 text-slate-100 rounded-tl-xs shadow-[0_4px_20px_rgba(2,6,23,0.4)]'
                      : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 border-cyan-400/30 text-white rounded-tr-xs shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-semibold opacity-90">
                    <span className={isPartner ? 'text-cyan-300 flex items-center gap-1' : 'text-sky-100'}>
                      {isPartner ? scenario.partnerName : 'Em'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap font-normal">{msg.text}</p>

                  {/* AI Quick Evaluation Tag for Student Messages */}
                  {!isPartner && msg.quickScore && (
                    <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{msg.quickScore.toFixed(1)}/10</span>
                        </span>
                        {msg.quickPraise && (
                          <span className="text-[11px] text-cyan-100 italic truncate max-w-[200px] sm:max-w-[280px]">
                            {msg.quickPraise}
                          </span>
                        )}
                      </div>

                      {msg.feedback && (
                        <button
                          type="button"
                          onClick={() => setExpandedFeedbackId(isExpanded ? null : msg.id)}
                          className="text-[10px] text-cyan-200 hover:text-white font-medium flex items-center gap-0.5 bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Detailed Feedback Drawer under Student Bubble */}
                <AnimatePresence>
                  {isExpanded && msg.feedback && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#050b20]/95 border border-sky-500/30 rounded-xl p-3 text-xs space-y-2.5 shadow-lg overflow-hidden"
                    >
                      <div className="text-[11px] font-bold text-sky-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Đánh giá 3 tiêu chí từ AI:</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {msg.feedback.criteria.map((cr, idx) => (
                          <div key={idx} className="bg-[#0c1638] p-2 rounded-lg border border-sky-500/20 text-center">
                            <span className="text-[10px] text-slate-400 block font-medium">{cr.name}</span>
                            <span className="text-[11px] font-bold text-cyan-300 block mt-0.5">{cr.score}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-emerald-200/90 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                        <strong className="text-emerald-300">Điểm sáng:</strong> {msg.feedback.strengths}
                      </div>

                      {msg.feedback.improvements && (
                        <div className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                          <strong className="text-amber-300">Gợi ý mẹo:</strong> {msg.feedback.improvements}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Student Avatar */}
              {!isPartner && (
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.4)] mt-0.5">
                  Em
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Realistic Animated AI Typing Indicator */}
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 sm:gap-3 max-w-md"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-400/30 text-white flex items-center justify-center text-lg shrink-0">
              {scenario.partnerAvatar}
            </div>
            <div className="bg-[#0d1738] border border-sky-500/25 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-300 text-xs flex items-center gap-3 shadow-md">
              <span className="font-medium text-cyan-300">{scenario.partnerName} đang soạn tin...</span>
              <div className="flex items-center gap-1">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut', delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating/Collapsible Best Response Helper Panel */}
      <AnimatePresence>
        {showBestResponsePanel && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="bg-[#081232]/95 border-t border-amber-500/35 p-3.5 sm:p-4 backdrop-blur-md shadow-[0_-8px_25px_rgba(2,6,23,0.6)] shrink-0 max-h-[260px] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-amber-200 flex items-center gap-1.5">
                    <span>Gợi ý câu đối đáp chuẩn nhất (Best Responses)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                      AI Coach
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-300">
                    Bấm vào câu em thích để điền vào ô nhập hoặc tham khảo cách diễn đạt
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={fetchBestResponses}
                  disabled={isLoadingBestResponse}
                  className="text-[11px] text-amber-300 hover:text-white px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tạo gợi ý mới cho tình huống này"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingBestResponse ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBestResponsePanel(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {isLoadingBestResponse ? (
              <div className="py-6 text-center text-xs text-sky-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>AI Coach đang phân tích ngữ cảnh để đề xuất câu đối đáp đỉnh nhất...</span>
              </div>
            ) : bestResponses && bestResponses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {bestResponses.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="bg-gradient-to-br from-[#0e1a42] to-[#0a1233] border border-amber-500/30 hover:border-amber-400/60 rounded-xl p-3 text-xs flex flex-col justify-between gap-2 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-300">{item.style}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.text, idx)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/50 transition-colors"
                            title="Sao chép"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-100 font-medium leading-relaxed italic bg-black/20 p-2 rounded-lg border border-sky-500/10">
                        {item.text}
                      </p>
                      <p className="text-[10.5px] text-sky-300/80 mt-1.5 leading-snug">
                        💡 {item.explanation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyBestResponse(item.text)}
                      className="w-full mt-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Sử dụng câu này</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Chưa có gợi ý. Hãy bấm "Làm mới" để AI Coach tạo câu đối đáp cho em nhé!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input & Starter Chips Bar */}
      <div className="bg-[#091230] border-t border-sky-500/25 p-3 sm:p-4 space-y-2.5 z-10 shrink-0">
        {/* Quick Starter Chips */}
        {scenario.quickStarters && scenario.quickStarters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Gợi ý mở lời:</span>
            </span>
            {scenario.quickStarters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMessage(starter);
                  if (textareaRef.current) textareaRef.current.focus();
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 text-sky-200 hover:text-white text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Nhập câu đối thoại với ${scenario.partnerName}... (Nhấn Enter để gửi, Shift+Enter xuống dòng)`}
              className="w-full bg-[#050b20] border border-sky-500/30 focus:border-cyan-400 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 resize-none leading-relaxed transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Best response quick button */}
            <button
              type="button"
              onClick={() => {
                if (!showBestResponsePanel && !bestResponses) {
                  fetchBestResponses();
                } else {
                  setShowBestResponsePanel(prev => !prev);
                }
              }}
              className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              title="Gợi ý câu đối đáp chuẩn nhất"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Send Message Button */}
            <motion.button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl font-semibold transition-all flex items-center justify-center cursor-pointer shadow-md ${
                !inputMessage.trim() || isSending
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              }`}
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};
