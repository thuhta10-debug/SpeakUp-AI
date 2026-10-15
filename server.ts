import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { evaluateResponse, validateAndNormalizeFeedback, scoreToLevel } from "./src/data/evaluator";
import { BENCHMARK_TEST_SUITE } from "./src/data/evaluationBenchmark";
import { BenchmarkTestResult } from "./src/types";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Recommended text models in priority order
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

// Structured response schema for Evaluation API
const EVALUATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.INTEGER },
          level: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "score", "level", "reason"]
      }
    },
    strengths: { type: Type.STRING },
    improvements: { type: Type.STRING },
    rewrites: {
      type: Type.OBJECT,
      properties: {
        friendly: { type: Type.STRING },
        polite_confident: { type: Type.STRING }
      },
      required: ["friendly", "polite_confident"]
    },
    character_follow_up: { type: Type.STRING }
  },
  required: ["criteria", "strengths", "improvements", "rewrites", "character_follow_up"]
};

async function generateWithGemini(
  prompt: string,
  schema?: any,
  temperature = 0.1
): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = {
        responseMimeType: "application/json",
        temperature
      };
      if (schema) {
        config.responseSchema = schema;
      }

      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Model timeout 7000ms')), 7000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      if (response?.text) {
        return response.text;
      }
    } catch (err: any) {
      const status = err?.status || err?.code;
      const errMsg = String(err?.message || '');
      const isTemporary = status === 503 || status === 429 || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('resource exhausted') || errMsg.includes('timeout');

      if (isTemporary) {
        console.warn(`[Gemini API] Model ${model} unavailable (${status || errMsg}), trying next candidate model...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }

      console.warn(`[Gemini API] Model ${model} encountered issue: ${errMsg}. Trying candidate fallback...`);
    }
  }

  return null;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

export function buildEvaluationPrompt(params: {
  scenarioTitle: string;
  partnerName: string;
  partnerRole: string;
  contextDescription: string;
  contextPrompt: string;
  studentResponse: string;
  dialogueHistory?: any[];
}): string {
  const {
    scenarioTitle,
    partnerName,
    partnerRole,
    contextDescription,
    contextPrompt,
    studentResponse,
    dialogueHistory
  } = params;

  const historyContext = Array.isArray(dialogueHistory) && dialogueHistory.length > 0
    ? `\nLỊCH SỬ ĐỐI THOẠI TRƯỚC ĐÓ:\n${dialogueHistory.map((m: any) => `- ${m.sender === 'student' ? 'Học sinh' : partnerName}: "${m.text}"`).join('\n')}`
    : '';

  return `
Bạn là Giám khảo & Trợ lý Sư phạm Đánh giá Kỹ năng Giao tiếp Học đường SpeakUp AI cho học sinh THCS (11-15 tuổi) tại Việt Nam.
Nhiệm vụ của bạn là đánh giá câu trả lời của học sinh HOÀN TOÀN ĐỘC LẬP theo đúng 3 tiêu chí cốt lõi, không để ấn tượng của tiêu chí này làm lệch tiêu chí khác.

BỐI CẢNH TÌNH HUỐNG:
- Tên tình huống: ${scenarioTitle}
- Nhân vật đối thoại: ${partnerName} (${partnerRole})
- Hoàn cảnh diễn ra: ${contextDescription}
- Lời nói mở đầu / gần nhất của ${partnerName}: "${contextPrompt}"${historyContext}
- CÂU TRẢ LỜI CỦA HỌC SINH: "${studentResponse}"

================================================================================
QUY TẮC CHẤM ĐIỂM BẮT BUỘC THEO 3 TIÊU CHÍ (Thang điểm: 0, 1, 2 điểm):
================================================================================

1. TIÊU CHÍ "Rõ ràng":
- 2 điểm – Rất tốt: Ý định và thông điệp dễ hiểu, dứt khoát.
  * QUY TẮC BẮT BUỘC: KHÔNG tự động đánh giá thấp một câu trả lời chỉ vì câu đó ngắn! Các câu ngắn như "Không", "Biến đi", "Được", "Chỗ này có người rồi" đều thể hiện ý định cực kỳ rõ ràng -> Đạt 2 điểm Rõ ràng.
- 1 điểm – Khá tốt: Hiểu được ý chính nhưng còn thiếu thông tin, lấp lửng hoặc cách diễn đạt chưa đầy đủ (ví dụ: "Tớ không thích" - chưa nêu lý do).
- 0 điểm – Cần chú ý: Khó hiểu, mơ hồ nghiêm trọng, nói năng lộn xộn hoặc không xác định được thông điệp chính.

2. TIÊU CHÍ "Lịch sự":
- 2 điểm – Rất tốt: Tôn trọng người đối thoại, diễn đạt phù hợp, hòa nhã.
  * QUY TẮC BẮT BUỘC: Học sinh có quyền từ chối, phản đối hoặc bảo vệ quan điểm của mình. KHÔNG coi việc bất đồng hay từ chối là thiếu lịch sự.
- 1 điểm – Khá tốt: Hơi cụt hoặc thiếu khéo léo nhưng hoàn toàn không xúc phạm hay coi thường đối phương.
- 0 điểm – Cần chú ý: Xúc phạm, chế giễu, coi thường, xua đuổi ("biến đi", "cút", "tự lo đi", "kệ xác cậu", "vô duyên", chửi thề, "ngu", "đống rác") hoặc có lời lẽ thiếu tôn trọng rõ rệt (hoặc nói trổng không kính ngữ với thầy cô).

3. TIÊU CHÍ "Phù hợp":
- 2 điểm – Rất tốt: Đáp ứng đúng tình huống và có cách xử lý hợp lý, đúng chuẩn mực đạo đức và nội quy học đường.
  * VÍ DỤ: Từ chối cho bạn chép bài trong giờ kiểm tra là PHÙ HỢP với quy tắc học tập (2 điểm), dù cách nói có thể cộc lốc/thiếu lịch sự.
- 1 điểm – Khá tốt: Có liên quan nhưng chưa giải quyết đầy đủ vấn đề hoặc còn nửa vời.
- 0 điểm – Cần chú ý: Lạc đề (hỏi màu nền báo tường lại rủ đi đá cầu) HOẶC đưa ra cách xử lý không phù hợp rõ rệt với mục tiêu và bối cảnh (VÍ DỤ: Đồng ý cho bạn chép bài/gian lận dù nói rất lịch sự vẫn là 0 điểm Phù hợp vì tiếp tay cho sai trái; xua đuổi bạn mới chuyển trường "biến đi" là 0 điểm Phù hợp vì phá vỡ mục tiêu làm quen).
  * QUY TẮC BẮT BUỘC: Phải xét nội dung tình huống cụ thể, KHÔNG chỉ xét câu nói có vẻ lịch sự hay không!

================================================================================
BỐN TRƯỜNG HỢP HIỆU CHUẨN MẪU (CHUẨN SƯ PHẠM BẮT BUỘC TUÂN THỦ):
================================================================================
- Trường hợp A: Tình huống làm quen bạn mới -> Trả lời: "Biến đi."
  => Rõ ràng: 2 điểm (ý định từ chối rõ ràng). Lịch sự: 0 điểm (xua đuổi thô lỗ). Phù hợp: 0 điểm (không phù hợp làm quen học đường).
  => Tuyệt đối KHÔNG nhận xét là học sinh đã bình tĩnh lắng nghe hay giao tiếp tốt!
- Trường hợp B: Đề nghị chép bài trong giờ kiểm tra -> Trả lời: "Không, tự lo đi."
  => Rõ ràng: 2 điểm (từ chối rõ ràng). Lịch sự: 0 điểm (cộc cằn, gắt gỏng). Phù hợp: 2 điểm (từ chối gian lận là hoàn toàn đúng đắn).
- Trường hợp C: Đề nghị chép bài trong giờ kiểm tra -> Trả lời: "Được, chép đi, nhưng đừng nói ai."
  => Rõ ràng: 2 điểm. Lịch sự: 2 điểm (xét riêng cách nói không xúc phạm). Phù hợp: 0 điểm (khuyến khích gian lận, vi phạm nội quy).
- Trường hợp D: Cần góp ý màu nền báo tường/thuyết trình -> Trả lời: "Chiều nay bạn có muốn đá cầu không?"
  => Rõ ràng: 2 điểm. Lịch sự: 2 điểm. Phù hợp: 0 điểm (hoàn toàn lạc đề).

================================================================================
QUY TẮC TẠO LỜI NHẬN XÉT VÀ CÂU MẪU:
================================================================================
1. "strengths": Điểm em làm tốt, CHỈ DỰA TRÊN BẰNG CHỨNG THỰC TẾ trong câu trả lời. Nếu câu trả lời thiếu lịch sự hoặc tiếp tay gian lận, TUYỆT ĐỐI KHÔNG KHEN chung chung hay bịa đặt rằng em đã lịch sự/lắng nghe tốt.
2. "improvements": Điểm em có thể cải thiện, nêu rõ vấn đề và cách khắc phục thiết thực.
3. "rewrites":
   - "friendly": Câu trả lời mẫu 1 (tự nhiên, thân thiện).
   - "polite_confident": Câu trả lời mẫu 2 (rõ ràng, lịch sự và tự tin).
   * LƯU Ý SƯ PHẠM QUAN TRỌNG: Hai câu trả lời mẫu PHẢI GIỮ ĐÚNG Ý ĐỊNH HỢP LÝ CỦA HỌC SINH (nếu học sinh từ chối gian lận, mẫu câu cũng là từ chối một cách khéo léo; không ép học sinh phải đồng ý hay từ bỏ ranh giới cá nhân).
4. "character_follow_up": Lời đáp tiếp theo của nhân vật ${partnerName}, bám sát câu trả lời vừa nhận được để cuộc hội thoại tiếp tục tự nhiên.

QUY TẮC ĐỒNG BỘ ĐIỂM SỐ VÀ NHÃN:
- score = 2 thì level = "Rất tốt"
- score = 1 thì level = "Khá tốt"
- score = 0 thì level = "Cần chú ý"
`;
}

// Communication evaluation endpoint
app.post("/api/analyze", async (req, res) => {
  const {
    scenarioTitle,
    partnerName,
    partnerRole,
    contextDescription,
    contextPrompt,
    studentResponse,
    dialogueHistory
  } = req.body;

  if (!studentResponse || typeof studentResponse !== "string" || !studentResponse.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập câu trả lời của học sinh." });
  }

  const prompt = buildEvaluationPrompt({
    scenarioTitle: scenarioTitle || "Tình huống giao tiếp",
    partnerName: partnerName || "Bạn",
    partnerRole: partnerRole || "Người đối thoại",
    contextDescription: contextDescription || "Bối cảnh học đường",
    contextPrompt: contextPrompt || "Chào bạn...",
    studentResponse,
    dialogueHistory
  });

  const responseText = await generateWithGemini(prompt, EVALUATION_RESPONSE_SCHEMA, 0.1);
  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      const validated = validateAndNormalizeFeedback(
        parsed,
        scenarioTitle || "Tình huống giao tiếp",
        partnerName || "Bạn",
        studentResponse
      );
      return res.json(validated);
    } catch (parseErr) {
      console.warn("JSON parse issue from Gemini response, using fallback evaluator:", parseErr);
    }
  }

  // Fallback if no API key or call failed
  const fallback = evaluateResponse(
    scenarioTitle || "Tình huống giao tiếp",
    partnerName || "bạn",
    studentResponse
  );
  return res.json(fallback);
});

// Real-time Interactive AI Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { scenario, dialogueHistory = [], studentMessage } = req.body;

  if (!studentMessage || typeof studentMessage !== "string" || !studentMessage.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập tin nhắn của em." });
  }

  const scenarioTitle = scenario?.title || "Tình huống giao tiếp";
  const partnerName = scenario?.partnerName || "Bạn";
  const partnerRole = scenario?.partnerRole || "Người đối thoại";
  const contextDescription = scenario?.contextDescription || "Trò chuyện học đường";

  const historyContext = Array.isArray(dialogueHistory) && dialogueHistory.length > 0
    ? `\nLỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ:\n${dialogueHistory.map((m: any) => `- ${m.sender === 'student' ? 'Học sinh' : partnerName}: "${m.text}"`).join('\n')}`
    : '';

  const prompt = `
Bạn là Trợ lý Sư phạm Giao tiếp Học đường SpeakUp AI.
1. Đóng vai nhân vật ${partnerName} (${partnerRole}) phản ứng chân thực với câu nói của học sinh THCS.
2. Đánh giá câu nói của học sinh theo 3 tiêu chí sư phạm độc lập: Rõ ràng (0-2), Lịch sự (0-2), Phù hợp (0-2).
   - "Biến đi" -> Lịch sự: 0, Phù hợp: 0. Phản ứng của ${partnerName} phải là ngỡ ngàng, buồn bã hoặc tổn thương.
   - Từ chối gian lận -> Phù hợp: 2 điểm.
   - Đồng ý gian lận -> Phù hợp: 0 điểm.

BỐI CẢNH:
- Tiêu đề: ${scenarioTitle}
- Nhân vật: ${partnerName} (${partnerRole})
- Hoàn cảnh: ${contextDescription}${historyContext}
- HỌC SINH VỪA NHẮN: "${studentMessage}"

YÊU CẦU ĐẦU RA JSON:
{
  "partnerReply": "Phản ứng chân thực của ${partnerName} với điều học sinh vừa nói",
  "criteria": [
    { "name": "Rõ ràng", "score": 0 | 1 | 2, "level": "Rất tốt" | "Khá tốt" | "Cần chú ý", "reason": "..." },
    { "name": "Lịch sự", "score": 0 | 1 | 2, "level": "Rất tốt" | "Khá tốt" | "Cần chú ý", "reason": "..." },
    { "name": "Phù hợp", "score": 0 | 1 | 2, "level": "Rất tốt" | "Khá tốt" | "Cần chú ý", "reason": "..." }
  ],
  "quickScore": 0.0 - 10.0 (tính trung thực từ tổng điểm 3 tiêu chí, tối đa 10.0),
  "quickPraise": "Nhận xét có căn cứ thực tế, không bịa đặt khen ngợi",
  "strengths": "Điểm làm tốt thực tế",
  "improvements": "Điểm cần khắc phục",
  "bestResponses": [
    {
      "style": "🌱 Tự nhiên & Gần gũi",
      "text": "Câu thoại mẫu 1 giữ đúng ý định hợp lý của học sinh",
      "explanation": "Lý do vì sao câu này hiệu quả"
    },
    {
      "style": "✨ Lịch thiệp & Tự tin",
      "text": "Câu thoại mẫu 2 giữ đúng ý định hợp lý của học sinh",
      "explanation": "Lý do vì sao câu này hiệu quả"
    }
  ]
}
`;

  const CHAT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      partnerReply: { type: Type.STRING },
      criteria: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            score: { type: Type.INTEGER },
            level: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["name", "score", "level", "reason"]
        }
      },
      quickScore: { type: Type.NUMBER },
      quickPraise: { type: Type.STRING },
      strengths: { type: Type.STRING },
      improvements: { type: Type.STRING },
      bestResponses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            text: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["style", "text", "explanation"]
        }
      }
    },
    required: ["partnerReply", "criteria", "quickScore", "quickPraise", "bestResponses"]
  };

  const responseText = await generateWithGemini(prompt, CHAT_SCHEMA, 0.2);
  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      const normalized = validateAndNormalizeFeedback(
        parsed,
        scenarioTitle,
        partnerName,
        studentMessage
      );

      // Re-calculate quickScore accurately from normalized criteria
      const totalCriteriaScore = normalized.criteria.reduce((s, c) => s + c.score, 0);
      const accurateScore = Math.round((totalCriteriaScore / 6) * 100) / 10;

      return res.json({
        partnerReply: parsed.partnerReply || normalized.followUpDialogue,
        quickScore: accurateScore,
        quickPraise: parsed.quickPraise || normalized.strengths,
        bestResponses: parsed.bestResponses && parsed.bestResponses.length > 0
          ? parsed.bestResponses
          : [
              {
                style: "🌱 Tự nhiên & Gần gũi",
                text: normalized.shortSuggestion,
                explanation: "Diễn đạt tự nhiên, giữ trọn ý định giao tiếp của em."
              },
              {
                style: "✨ Lịch thiệp & Tự tin",
                text: normalized.alternativeSuggestion || normalized.shortSuggestion,
                explanation: "Chững chạc, lịch sự và rõ ràng mục tiêu."
              }
            ],
        criteria: normalized.criteria,
        strengths: normalized.strengths,
        improvements: normalized.improvements
      });
    } catch (parseErr) {
      console.warn("JSON parse issue from Gemini chat, using fallback:", parseErr);
    }
  }

  // Fallback response for chat
  const fallbackEvaluation = evaluateResponse(scenarioTitle, partnerName, studentMessage);
  const totalCriteriaScore = fallbackEvaluation.criteria.reduce((s, c) => s + c.score, 0);
  const fallbackScore = Math.round((totalCriteriaScore / 6) * 100) / 10;

  return res.json({
    partnerReply: fallbackEvaluation.followUpDialogue,
    quickScore: fallbackScore,
    quickPraise: fallbackEvaluation.strengths,
    bestResponses: [
      {
        style: "🌱 Tự nhiên & Gần gũi",
        text: fallbackEvaluation.shortSuggestion,
        explanation: "Thân thiện, ấm áp và diễn đạt rõ ràng."
      },
      {
        style: "✨ Lịch thiệp & Tự tin",
        text: fallbackEvaluation.alternativeSuggestion || fallbackEvaluation.shortSuggestion,
        explanation: "Chững chạc, lễ phép và diễn đạt rõ ràng mục tiêu giao tiếp."
      }
    ],
    criteria: fallbackEvaluation.criteria,
    strengths: fallbackEvaluation.strengths,
    improvements: fallbackEvaluation.improvements
  });
});

// Endpoint to generate Best Responses on demand
app.post("/api/best-response", async (req, res) => {
  const { scenario, currentPrompt, dialogueHistory = [] } = req.body;

  const scenarioTitle = scenario?.title || "Tình huống giao tiếp";
  const partnerName = scenario?.partnerName || "Bạn";
  const partnerRole = scenario?.partnerRole || "Người đối thoại";
  const contextDescription = scenario?.contextDescription || "Trò chuyện học đường";
  const promptText = currentPrompt || scenario?.initialPrompt || "";

  const prompt = `
Bạn là Chuyên gia Kỹ năng Giao tiếp Học đường SpeakUp AI.
Tạo 3 "CÂU ĐỐI ĐÁP CHUẨN NHẤT" (Best Responses) cho học sinh THCS trong tình huống:
- Tiêu đề: ${scenarioTitle}
- Nhân vật: ${partnerName} (${partnerRole})
- Hoàn cảnh: ${contextDescription}
- Lời nói của ${partnerName}: "${promptText}"

YÊU CẦU:
1. "🌱 Tự nhiên & Gần gũi" (thân mật, dí dỏm, chân thành)
2. "✨ Lịch thiệp & Tự tin" (chững chạc, lễ phép, rành mạch)
3. "🎯 Khéo léo & Đồng cảm" (thấu hiểu tâm lý, giải quyết tình huống thông minh)

Trả về JSON:
{
  "bestResponses": [
    {
      "style": "🌱 Tự nhiên & Gần gũi",
      "text": "Câu thoại mẫu đặt trong ngoặc kép",
      "explanation": "Giải thích ngắn vì sao câu này tạo ấn tượng tốt"
    },
    {
      "style": "✨ Lịch thiệp & Tự tin",
      "text": "Câu thoại mẫu đặt trong ngoặc kép",
      "explanation": "Giải thích ngắn"
    },
    {
      "style": "🎯 Khéo léo & Đồng cảm",
      "text": "Câu thoại mẫu đặt trong ngoặc kép",
      "explanation": "Giải thích ngắn"
    }
  ]
}
`;

  const BEST_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      bestResponses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            text: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["style", "text", "explanation"]
        }
      }
    },
    required: ["bestResponses"]
  };

  const responseText = await generateWithGemini(prompt, BEST_RESPONSE_SCHEMA, 0.5);
  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (parseErr) {
      console.warn("JSON parse issue from Gemini best-response, using fallback:", parseErr);
    }
  }

  // Fallback
  return res.json({
    bestResponses: [
      {
        style: "🌱 Tự nhiên & Gần gũi",
        text: `"${partnerName} ơi, để mình cùng trao đổi về chuyện này nhé!"`,
        explanation: "Mở đầu thân mật, tạo không khí cởi mở và thiện chí hợp tác."
      },
      {
        style: "✨ Lịch thiệp & Tự tin",
        text: `"Mình rất hiểu suy nghĩ của ${partnerName}, để mình giải thích thêm một chút nhé."`,
        explanation: "Biết lắng nghe và tôn trọng quan điểm của người khác trước khi trình bày."
      }
    ]
  });
});

// Endpoint to run the 20-case Benchmark suite
app.get("/api/benchmark", async (_req, res) => {
  res.json({
    totalCases: BENCHMARK_TEST_SUITE.length,
    testCases: BENCHMARK_TEST_SUITE
  });
});

// Execute Benchmark Run live via AI
app.post("/api/benchmark/run", async (req, res) => {
  const { testCaseId, mode = "all" } = req.body || {};

  const casesToRun = testCaseId
    ? BENCHMARK_TEST_SUITE.filter(tc => tc.id === testCaseId)
    : BENCHMARK_TEST_SUITE;

  const results: BenchmarkTestResult[] = [];

  for (const tc of casesToRun) {
    try {
      let feedback;
      const prompt = buildEvaluationPrompt({
        scenarioTitle: tc.scenarioTitle,
        partnerName: tc.partnerName,
        partnerRole: tc.partnerRole,
        contextDescription: tc.contextDescription,
        contextPrompt: tc.contextPrompt,
        studentResponse: tc.studentResponse
      });

      const responseText = await generateWithGemini(prompt, EVALUATION_RESPONSE_SCHEMA, 0.1);
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          feedback = validateAndNormalizeFeedback(
            parsed,
            tc.scenarioTitle,
            tc.partnerName,
            tc.studentResponse
          );
        } catch {
          feedback = evaluateResponse(tc.scenarioTitle, tc.partnerName, tc.studentResponse, tc.scenarioId);
        }
      } else {
        feedback = evaluateResponse(tc.scenarioTitle, tc.partnerName, tc.studentResponse, tc.scenarioId);
      }

      const clarityCrit = feedback.criteria.find(c => c.name === 'Rõ ràng');
      const politenessCrit = feedback.criteria.find(c => c.name === 'Lịch sự');
      const appropriatenessCrit = feedback.criteria.find(c => c.name === 'Phù hợp');

      const actualScores = {
        clarity: clarityCrit ? (clarityCrit.score as 0 | 1 | 2) : (0 as const),
        politeness: politenessCrit ? (politenessCrit.score as 0 | 1 | 2) : (0 as const),
        appropriateness: appropriatenessCrit ? (appropriatenessCrit.score as 0 | 1 | 2) : (0 as const)
      };

      const actualLevels = {
        clarity: scoreToLevel(actualScores.clarity),
        politeness: scoreToLevel(actualScores.politeness),
        appropriateness: scoreToLevel(actualScores.appropriateness)
      };

      const actualReasons = {
        clarity: clarityCrit?.reason || '',
        politeness: politenessCrit?.reason || '',
        appropriateness: appropriatenessCrit?.reason || ''
      };

      const clarityMatch = actualScores.clarity === tc.expectedScores.clarity;
      const politenessMatch = actualScores.politeness === tc.expectedScores.politeness;
      const appropriatenessMatch = actualScores.appropriateness === tc.expectedScores.appropriateness;
      const passed = clarityMatch && politenessMatch && appropriatenessMatch;

      const errorNotes = !passed
        ? [
            !clarityMatch ? `Rõ ràng: nhận ${actualScores.clarity} (kỳ vọng ${tc.expectedScores.clarity})` : '',
            !politenessMatch ? `Lịch sự: nhận ${actualScores.politeness} (kỳ vọng ${tc.expectedScores.politeness})` : '',
            !appropriatenessMatch ? `Phù hợp: nhận ${actualScores.appropriateness} (kỳ vọng ${tc.expectedScores.appropriateness})` : ''
          ].filter(Boolean).join('; ')
        : 'Hoàn toàn khớp kỳ vọng sư phạm';

      results.push({
        ...tc,
        actualScores,
        actualLevels,
        actualReasons,
        passed,
        errorNotes,
        rawFeedback: feedback
      });
    } catch (err: any) {
      results.push({
        ...tc,
        passed: false,
        errorNotes: `Lỗi xử lý kiểm thử: ${err?.message || err}`
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const passRate = Math.round((passedCount / results.length) * 100);

  res.json({
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    passRate,
    results
  });
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SpeakUp AI server running on http://localhost:${PORT}`);
  });
}

startServer();
