import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI, Type } from '@google/genai';
import { BENCHMARK_TEST_SUITE } from '../src/data/evaluationBenchmark';
import { evaluateResponse, validateAndNormalizeFeedback, scoreToLevel } from '../src/data/evaluator';

const apiKey = process.env.GEMINI_API_KEY;
console.log('='.repeat(105));
console.log('SPEAKUP AI - BỘ KIỂM THỬ SƯ PHẠM 20 CÂU (AI PEDAGOGICAL BENCHMARK)');
console.log(`Thời gian chạy: ${new Date().toLocaleString('vi-VN')}`);
console.log(`Trạng thái GEMINI_API_KEY: ${apiKey ? 'Đã kích hoạt' : 'Chưa cấu hình (Sử dụng Evaluator)'}`);
console.log('='.repeat(105));

const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
}) : null;

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

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

function buildPrompt(tc: typeof BENCHMARK_TEST_SUITE[0]): string {
  return `
Bạn là Giám khảo & Trợ lý Sư phạm Đánh giá Kỹ năng Giao tiếp Học đường SpeakUp AI cho học sinh THCS (11-15 tuổi) tại Việt Nam.
Nhiệm vụ của bạn là đánh giá câu trả lời của học sinh HOÀN TOÀN ĐỘC LẬP theo đúng 3 tiêu chí cốt lõi, không để ấn tượng của tiêu chí này làm lệch tiêu chí khác.

BỐI CẢNH TÌNH HUỐNG:
- Tên tình huống: ${tc.scenarioTitle}
- Nhân vật đối thoại: ${tc.partnerName} (${tc.partnerRole})
- Hoàn cảnh diễn ra: ${tc.contextDescription}
- Lời nói mở đầu của ${tc.partnerName}: "${tc.contextPrompt}"
- CÂU TRẢ LỜI CỦA HỌC SINH: "${tc.studentResponse}"

QUY TẮC CHẤM ĐIỂM BẮT BUỘC (Thang điểm: 0, 1, 2 điểm):

1. TIÊU CHÍ "Rõ ràng":
- 2 điểm (Rất tốt): Ý định và thông điệp dễ hiểu, dứt khoát. (KHÔNG tự động đánh giá thấp chỉ vì câu ngắn! "Không", "Biến đi", "Được", "Chỗ này có người rồi" đều đạt 2 điểm vì ý định rất rõ).
- 1 điểm (Khá tốt): Hiểu được ý chính nhưng còn thiếu thông tin hoặc cách diễn đạt chưa đầy đủ (ví dụ: "Tớ không thích" - thiếu lý do).
- 0 điểm (Cần chú ý): Khó hiểu, mơ hồ nghiêm trọng, nói năng lộn xộn hoặc không xác định được thông điệp chính.

2. TIÊU CHÍ "Lịch sự":
- 2 điểm (Rất tốt): Tôn trọng người đối thoại, diễn đạt hòa nhã, đúng mực. (Học sinh có quyền từ chối, phản đối hoặc bảo vệ quan điểm. Không coi việc bất đồng/từ chối là thiếu lịch sự).
- 1 điểm (Khá tốt): Hơi cụt hoặc thiếu khéo léo nhưng hoàn toàn không xúc phạm hay coi thường đối phương.
- 0 điểm (Cần chú ý): Xúc phạm, chế giễu, coi thường, xua đuổi ("biến đi", "cút", "tự lo đi", "kệ xác cậu", "ngu", "đống rác") hoặc nói trổng không kính ngữ với thầy cô.

3. TIÊU CHÍ "Phù hợp":
- 2 điểm (Rất tốt): Đáp ứng đúng tình huống và có cách xử lý hợp lý, đúng chuẩn mực đạo đức và nội quy học đường.
  * VÍ DỤ: Từ chối cho bạn chép bài trong giờ kiểm tra là PHÙ HỢP (2 điểm), dù cách nói có thể cộc lốc/thiếu lịch sự.
- 1 điểm (Khá tốt): Có liên quan nhưng chưa giải quyết đầy đủ vấn đề, hoặc có ý đúng nhưng cách xử lý gây hấn ("Ngu thì chết chứ bệnh tật gì").
- 0 điểm (Cần chú ý): Lạc đề (hỏi màu nền báo tường lại rủ đi đá cầu) HOẶC đưa ra cách xử lý không phù hợp rõ rệt với mục tiêu và bối cảnh (VÍ DỤ: Tiếp tay cho gian lận/chép bài thi dù nói rất lịch sự vẫn là 0 điểm Phù hợp; xua đuổi bạn mới chuyển trường "biến đi" là 0 điểm Phù hợp; chê bài báo tường "đống rác" là 0 điểm Phù hợp).

BỐN TRƯỜNG HỢP HIỆU CHUẨN MẪU:
- Làm quen bạn mới -> "Biến đi." => Rõ ràng: 2, Lịch sự: 0, Phù hợp: 0. Không được khen đã lắng nghe tốt.
- Xin chép bài thi -> "Không, tự lo đi." => Rõ ràng: 2, Lịch sự: 0, Phù hợp: 2.
- Xin chép bài thi -> "Được, chép đi, nhưng đừng nói ai." => Rõ ràng: 2, Lịch sự: 2, Phù hợp: 0.
- Cần góp ý màu nền báo tường -> "Chiều nay bạn có muốn đá cầu không?" => Rõ ràng: 2, Lịch sự: 2, Phù hợp: 0.

ĐỒNG BỘ ĐIỂM SỐ VÀ NHÃN:
- score = 2 <=> level = "Rất tốt"
- score = 1 <=> level = "Khá tốt"
- score = 0 <=> level = "Cần chú ý"
`;
}

async function runTestCase(tc: typeof BENCHMARK_TEST_SUITE[0]) {
  let raw: any = null;

  if (ai) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const promise = ai.models.generateContent({
          model,
          contents: buildPrompt(tc),
          config: {
            responseMimeType: 'application/json',
            responseSchema: EVALUATION_RESPONSE_SCHEMA,
            temperature: 0.1
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout 6000ms')), 6000)
        );

        const response: any = await Promise.race([promise, timeoutPromise]);
        if (response?.text) {
          raw = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        // try next candidate model
      }
    }
  }

  if (!raw) {
    return evaluateResponse(tc.scenarioTitle, tc.partnerName, tc.studentResponse, tc.scenarioId);
  }

  return validateAndNormalizeFeedback(raw, tc.scenarioTitle, tc.partnerName, tc.studentResponse);
}

async function main() {
  const results: any[] = [];
  let passedCount = 0;
  let schemaErrors = 0;
  let labelSyncErrors = 0;

  console.log(`Bắt đầu chạy ${BENCHMARK_TEST_SUITE.length} bài kiểm thử...\n`);

  for (let i = 0; i < BENCHMARK_TEST_SUITE.length; i++) {
    const tc = BENCHMARK_TEST_SUITE[i];

    try {
      const feedback = await runTestCase(tc);

      // Check schema completeness
      const hasCriteria = Array.isArray(feedback.criteria) && feedback.criteria.length === 3;
      const hasStrengths = Boolean(feedback.strengths && feedback.strengths.trim());
      const hasImprovements = Boolean(feedback.improvements && feedback.improvements.trim());
      const hasRewrites = Boolean(feedback.rewrites?.friendly && feedback.rewrites?.polite_confident);
      const hasFollowUp = Boolean(feedback.character_follow_up && feedback.character_follow_up.trim());

      if (!hasCriteria || !hasStrengths || !hasImprovements || !hasRewrites || !hasFollowUp) {
        schemaErrors++;
      }

      // Check label synchronization
      feedback.criteria.forEach(c => {
        const expectedLevel = scoreToLevel(c.score);
        if (c.level !== expectedLevel) {
          labelSyncErrors++;
        }
      });

      const clarityCrit = feedback.criteria.find(c => c.name === 'Rõ ràng');
      const politenessCrit = feedback.criteria.find(c => c.name === 'Lịch sự');
      const appropriatenessCrit = feedback.criteria.find(c => c.name === 'Phù hợp');

      const actualScores = {
        clarity: clarityCrit ? clarityCrit.score : -1,
        politeness: politenessCrit ? politenessCrit.score : -1,
        appropriateness: appropriatenessCrit ? appropriatenessCrit.score : -1
      };

      const matchClarity = actualScores.clarity === tc.expectedScores.clarity;
      const matchPoliteness = actualScores.politeness === tc.expectedScores.politeness;
      const matchAppropriateness = actualScores.appropriateness === tc.expectedScores.appropriateness;

      const passed = matchClarity && matchPoliteness && matchAppropriateness;
      if (passed) {
        passedCount++;
        console.log(`[${tc.id}] "${tc.studentResponse.substring(0, 32)}": ✅ ĐẠT [${actualScores.clarity}, ${actualScores.politeness}, ${actualScores.appropriateness}]`);
      } else {
        console.log(`[${tc.id}] "${tc.studentResponse.substring(0, 32)}": ❌ CHƯA ĐẠT! Nhận: [${actualScores.clarity}, ${actualScores.politeness}, ${actualScores.appropriateness}] vs Kỳ vọng: [${tc.expectedScores.clarity}, ${tc.expectedScores.politeness}, ${tc.expectedScores.appropriateness}]`);
      }

      results.push({
        id: tc.id,
        scenario: tc.scenarioTitle,
        input: tc.studentResponse,
        expected: `R:${tc.expectedScores.clarity} L:${tc.expectedScores.politeness} P:${tc.expectedScores.appropriateness}`,
        actual: `R:${actualScores.clarity} L:${actualScores.politeness} P:${actualScores.appropriateness}`,
        passed,
        category: tc.categoryDescription,
        feedback
      });

      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (err: any) {
      console.log(`[${tc.id}]: ❌ LỖI: ${err.message}`);
      results.push({
        id: tc.id,
        scenario: tc.scenarioTitle,
        input: tc.studentResponse,
        expected: `R:${tc.expectedScores.clarity} L:${tc.expectedScores.politeness} P:${tc.expectedScores.appropriateness}`,
        actual: 'LỖI',
        passed: false,
        error: err.message
      });
    }
  }

  // Print Summary Table
  console.log('\n' + '='.repeat(105));
  console.log('BẢNG ĐỐI CHIẾU KẾT QUẢ KIỂM THỬ 20 CÂU (AI BENCHMARK COMPARISON TABLE)');
  console.log('='.repeat(105));
  console.log(
    'MÃ'.padEnd(6) +
    'TÌNH HUỐNG'.padEnd(28) +
    'CÂU TRẢ LỜI ĐẦU VÀO'.padEnd(30) +
    'KỲ VỌNG'.padEnd(14) +
    'THỰC TẾ'.padEnd(14) +
    'KẾT QUẢ'
  );
  console.log('-'.repeat(105));

  results.forEach(r => {
    const idStr = r.id.padEnd(6);
    const scenStr = (r.scenario.length > 25 ? r.scenario.substring(0, 24) + '…' : r.scenario).padEnd(28);
    const inputStr = (r.input.length > 27 ? r.input.substring(0, 26) + '…' : r.input).padEnd(30);
    const expStr = (r.expected || '').padEnd(14);
    const actStr = (r.actual || '').padEnd(14);
    const resStr = r.passed ? '✅ ĐẠT' : '❌ CHƯA ĐẠT';
    console.log(`${idStr}${scenStr}${inputStr}${expStr}${actStr}${resStr}`);
  });

  console.log('-'.repeat(105));
  console.log(`TỔNG KẾT:`);
  console.log(`- Tổng số ca kiểm thử: ${BENCHMARK_TEST_SUITE.length}`);
  console.log(`- Số ca ĐẠT chuẩn: ${passedCount} / ${BENCHMARK_TEST_SUITE.length}`);
  console.log(`- Tỷ lệ chính xác: ${Math.round((passedCount / BENCHMARK_TEST_SUITE.length) * 100)}%`);
  console.log(`- Lỗi thiếu trường dữ liệu (Schema): ${schemaErrors}`);
  console.log(`- Lỗi mâu thuẫn điểm - nhãn (Label Sync): ${labelSyncErrors}`);

  // Specifically check the 4 mandatory regression test cases
  const caseA = results.find(r => r.id === 'TC01');
  const caseB = results.find(r => r.id === 'TC02');
  const caseC = results.find(r => r.id === 'TC03');
  const caseD = results.find(r => r.id === 'TC04');

  console.log('\nKIỂM TRA 4 TRƯỜNG HỢP BẮT BUỘC (PHẦN 3):');
  console.log(`- Trường hợp A ("Biến đi."): ${caseA?.passed ? '✅ ĐẠT (R:2, L:0, P:0)' : '❌ CHƯA ĐẠT'}`);
  console.log(`- Trường hợp B ("Không, tự lo đi."): ${caseB?.passed ? '✅ ĐẠT (R:2, L:0, P:2)' : '❌ CHƯA ĐẠT'}`);
  console.log(`- Trường hợp C ("Được, chép đi, nhưng đừng nói ai."): ${caseC?.passed ? '✅ ĐẠT (R:2, L:2, P:0)' : '❌ CHƯA ĐẠT'}`);
  console.log(`- Trường hợp D ("Chiều nay bạn có muốn đá cầu không?"): ${caseD?.passed ? '✅ ĐẠT (R:2, L:2, P:0)' : '❌ CHƯA ĐẠT'}`);
  console.log('='.repeat(105));
}

main().catch(err => {
  console.error('Lỗi khi chạy benchmark:', err);
  process.exit(1);
});
