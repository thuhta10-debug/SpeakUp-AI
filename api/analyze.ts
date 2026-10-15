import { GoogleGenAI, Type } from "@google/genai";
import { evaluateResponse, validateAndNormalizeFeedback } from "../src/data/evaluator";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

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

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as is
      }
    }

    const {
      scenarioTitle,
      partnerName,
      partnerRole,
      contextDescription,
      contextPrompt,
      studentResponse,
      dialogueHistory
    } = body || {};

    if (!studentResponse || typeof studentResponse !== "string" || !studentResponse.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập câu trả lời của học sinh." });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const historyContext = Array.isArray(dialogueHistory) && dialogueHistory.length > 0
          ? `\nLỊCH SỬ ĐỐI THOẠI TRƯỚC ĐÓ:\n${dialogueHistory.map((m: any) => `- ${m.sender === 'student' ? 'Học sinh' : partnerName}: "${m.text}"`).join('\n')}`
          : '';

        const prompt = `
Bạn là Giám khảo & Trợ lý Sư phạm Đánh giá Kỹ năng Giao tiếp Học đường SpeakUp AI cho học sinh THCS (11-15 tuổi) tại Việt Nam.
Nhiệm vụ của bạn là đánh giá câu trả lời của học sinh HOÀN TOÀN ĐỘC LẬP theo đúng 3 tiêu chí cốt lõi (0, 1, 2 điểm):

BỐI CẢNH TÌNH HUỐNG:
- Tên tình huống: ${scenarioTitle || "Tình huống giao tiếp"}
- Nhân vật đối thoại: ${partnerName || "Bạn"} (${partnerRole || "Người đối thoại"})
- Hoàn cảnh diễn ra: ${contextDescription || "Bối cảnh học đường"}
- Lời nói mở đầu / gần nhất của ${partnerName || "Bạn"}: "${contextPrompt || "Chào bạn..."}"${historyContext}
- CÂU TRẢ LỜI CỦA HỌC SINH: "${studentResponse}"

QUY TẮC CHẤM ĐIỂM:
1. Rõ ràng: 2 (ý định/thông điệp dễ hiểu, không phạt vì ngắn), 1 (thiếu thông tin/chưa đủ), 0 (khó hiểu/mơ hồ).
2. Lịch sự: 2 (tôn trọng/hòa nhã, bất đồng/từ chối vẫn được 2), 1 (hơi cộc nhưng không xúc phạm), 0 (xúc phạm/xua đuổi "biến đi", "cút", "tự lo đi", nói trổng với thầy cô).
3. Phù hợp: 2 (xử lý hợp lý; từ chối chép bài kiểm tra là 2 điểm dù cộc lốc), 1 (chưa giải quyết xong), 0 (lạc đề; hoặc tiếp tay gian lận chép bài dù nói lịch sự vẫn là 0; hoặc xua đuổi thô bạo bạn mới làm quen).

BỐN TRƯỜNG HỢP HIỆU CHUẨN MẪU:
- Làm quen bạn mới -> "Biến đi." => Rõ ràng: 2, Lịch sự: 0, Phù hợp: 0. Không được khen đã lắng nghe tốt.
- Xin chép bài thi -> "Không, tự lo đi." => Rõ ràng: 2, Lịch sự: 0, Phù hợp: 2 (từ chối gian lận là đúng).
- Xin chép bài thi -> "Được, chép đi, nhưng đừng nói ai." => Rõ ràng: 2, Lịch sự: 2, Phù hợp: 0 (tiếp tay gian lận).
- Cần góp ý màu nền báo tường -> "Chiều nay bạn có muốn đá cầu không?" => Rõ ràng: 2, Lịch sự: 2, Phù hợp: 0 (lạc đề).

ĐỒNG BỘ:
- score = 2 <=> level = "Rất tốt"
- score = 1 <=> level = "Khá tốt"
- score = 0 <=> level = "Cần chú ý"
- rewrites.friendly: Mẫu câu tự nhiên, thân thiện (giữ nguyên ý định hợp lý của học sinh).
- rewrites.polite_confident: Mẫu câu rõ ràng, lịch sự và tự tin (giữ nguyên ý định hợp lý của học sinh).
- character_follow_up: Lời đáp tiếp theo của ${partnerName || "Bạn"} bám sát câu trả lời vừa nhận.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: EVALUATION_RESPONSE_SCHEMA,
            temperature: 0.1
          }
        });

        const responseText = response.text;
        if (responseText) {
          const parsed = JSON.parse(responseText);
          const validated = validateAndNormalizeFeedback(
            parsed,
            scenarioTitle || "Tình huống giao tiếp",
            partnerName || "Bạn",
            studentResponse
          );
          return res.status(200).json(validated);
        }
      } catch (apiError) {
        console.error("Gemini API error, falling back to evaluator:", apiError);
      }
    }

    const fallbackData = evaluateResponse(
      scenarioTitle || "Giao tiếp học đường",
      partnerName || "Bạn học",
      studentResponse
    );
    return res.status(200).json(fallbackData);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Lỗi xử lý yêu cầu phân tích." });
  }
}
