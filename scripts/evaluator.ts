import { AIFeedback, CriterionRating, CriterionLevel, Rewrites } from '../types';
import { isProfaneOrInsult, getProfaneReaction } from '../utils/moderation';

// Strict mapping: score to level
export function scoreToLevel(score: number): CriterionLevel {
  if (score >= 2) return 'Rất tốt';
  if (score === 1) return 'Khá tốt';
  return 'Cần chú ý';
}

// Strict mapping: level to score
export function levelToScore(level: string): 0 | 1 | 2 {
  if (level === 'Rất tốt') return 2;
  if (level === 'Khá tốt') return 1;
  return 0;
}

/**
 * Validates, normalizes, and sanitizes evaluation feedback to ensure:
 * 1. Exactly 3 criteria: 'Rõ ràng', 'Lịch sự', 'Phù hợp'
 * 2. Strict synchronization: score = 2 <=> "Rất tốt", 1 <=> "Khá tốt", 0 <=> "Cần chú ý"
 * 3. Evidence-based strengths and improvements without contradictory praise
 * 4. Proper rewrites and follow-up dialogue
 */
export function validateAndNormalizeFeedback(
  raw: any,
  scenarioTitle: string,
  partnerName: string,
  studentResponse: string
): AIFeedback {
  const text = (studentResponse || '').trim();
  const lowerText = text.toLowerCase();

  // Validate or construct criteria
  const targetNames: Array<'Rõ ràng' | 'Lịch sự' | 'Phù hợp'> = ['Rõ ràng', 'Lịch sự', 'Phù hợp'];
  const rawCriteria = Array.isArray(raw?.criteria) ? raw.criteria : [];

  const normalizedCriteria: CriterionRating[] = targetNames.map(name => {
    const found = rawCriteria.find((c: any) => c?.name === name || String(c?.name || '').includes(name));

    let score: 0 | 1 | 2 = 1;
    if (typeof found?.score === 'number' && [0, 1, 2].includes(found.score)) {
      score = found.score as 0 | 1 | 2;
    } else if (typeof found?.score === 'string') {
      score = levelToScore(found.score);
    } else if (typeof found?.level === 'string') {
      score = levelToScore(found.level);
    }

    const level = scoreToLevel(score);
    const reason = (found?.reason || found?.detail || '').trim() ||
      (score === 2 ? 'Thể hiện rất tốt theo chuẩn mực giao tiếp.' : score === 1 ? 'Đạt mức khá, có thể diễn đạt trọn vẹn hơn.' : 'Cần chú ý điều chỉnh cách diễn đạt cho phù hợp.');

    return {
      name,
      score,
      level,
      reason,
      detail: reason
    };
  });

  const clarityCrit = normalizedCriteria.find(c => c.name === 'Rõ ràng')!;
  const politeCrit = normalizedCriteria.find(c => c.name === 'Lịch sự')!;
  const fitCrit = normalizedCriteria.find(c => c.name === 'Phù hợp')!;

  // Sanitize strengths against fake or contradictory praise
  let strengths = typeof raw?.strengths === 'string' ? raw.strengths.trim() : '';

  // If politeness is 0 or inappropriate, remove contradictory praise
  const hasFakePraise = /bình tĩnh lắng nghe|rất tôn trọng|rất lịch sự|rất hòa nhã|giao tiếp tốt|ứng xử khéo léo/i.test(strengths);
  if (politeCrit.score === 0 || fitCrit.score === 0 || isProfaneOrInsult(text)) {
    if (hasFakePraise || !strengths) {
      if (clarityCrit.score === 2 && fitCrit.score === 2 && politeCrit.score === 0) {
        // e.g. "Không, tự lo đi" (refusing cheating)
        strengths = 'Em có ý thức đúng đắn và dứt khoát từ chối hành vi gian lận trong giờ kiểm tra.';
      } else if (clarityCrit.score === 2) {
        strengths = 'Em đã thể hiện rõ ràng và thẳng thắn ý kiến của mình, không quanh co lấp lửng.';
      } else {
        strengths = 'Em đã phản hồi trực tiếp vào tình huống giao tiếp.';
      }
    }
  }

  if (!strengths) {
    strengths = 'Em đã phản hồi đúng thông điệp chính và thể hiện quan điểm của bản thân.';
  }

  // Sanitize improvements
  let improvements = typeof raw?.improvements === 'string' ? raw.improvements.trim() : '';
  if (!improvements) {
    if (politeCrit.score === 0) {
      improvements = 'Em cần thay đổi cách xưng hô và dùng từ ngữ hòa nhã, tránh lời lẽ cộc cằn, xua đuổi hoặc xúc phạm đối phương.';
    } else if (fitCrit.score === 0) {
      improvements = 'Em cần tập trung vào đúng trọng tâm vấn đề của tình huống và tuân thủ các quy tắc ứng xử học đường.';
    } else {
      improvements = 'Em có thể thêm câu hỏi quan tâm hoặc đề xuất giải pháp để câu chuyện diễn ra cởi mở và gắn kết hơn.';
    }
  }

  // Normalize rewrites
  const friendlyRewrite =
    raw?.rewrites?.friendly ||
    raw?.shortSuggestion ||
    getDefaultFriendlyRewrite(scenarioTitle, partnerName, studentResponse);

  const politeConfidentRewrite =
    raw?.rewrites?.polite_confident ||
    raw?.alternativeSuggestion ||
    getDefaultPoliteConfidentRewrite(scenarioTitle, partnerName, studentResponse);

  const cleanFriendly = friendlyRewrite.replace(/^["“]|["”]$/g, '').trim();
  const cleanPoliteConfident = politeConfidentRewrite.replace(/^["“]|["”]$/g, '').trim();

  // Normalize follow-up dialogue
  let characterFollowUp =
    raw?.character_follow_up ||
    raw?.followUpDialogue ||
    getDefaultFollowUp(scenarioTitle, partnerName, studentResponse, politeCrit.score, fitCrit.score);

  characterFollowUp = characterFollowUp.replace(/^["“]|["”]$/g, '').trim();

  const rewrites: Rewrites = {
    friendly: `“${cleanFriendly}”`,
    polite_confident: `“${cleanPoliteConfident}”`
  };

  return {
    criteria: normalizedCriteria,
    strengths,
    improvements,
    rewrites,
    character_follow_up: characterFollowUp,
    shortSuggestion: rewrites.friendly,
    alternativeSuggestion: rewrites.polite_confident,
    followUpDialogue: characterFollowUp
  };
}

/**
 * Helper to match Vietnamese phrases without relying on ASCII \b word boundaries
 */
function containsPhrase(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some(p => lower.includes(p.toLowerCase()));
}

/**
 * Deterministic Pedagogical Evaluator
 * Used for fallback evaluation and offline scoring.
 * Follows the exact 3-criteria guidelines:
 * - Clarity: 2 (clear intent, short != penalized), 1 (missing details), 0 (vague/confusing)
 * - Politeness: 2 (respectful, disagreeing is allowed), 1 (a bit abrupt), 0 (insulting, dismissive)
 * - Appropriateness: 2 (fitting situational resolution), 1 (partial resolution), 0 (off-topic or unethical)
 */
export function evaluateResponse(
  scenarioTitle: string,
  partnerName: string,
  studentResponse: string,
  scenarioId?: string
): AIFeedback {
  const text = studentResponse.trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const titleLower = scenarioTitle.toLowerCase();
  const isTeacher = partnerName.startsWith('Cô') || partnerName.startsWith('Thầy');

  // Specific scenario flags
  const isMakeFriends = titleLower.includes('chuyển trường') || titleLower.includes('làm quen') || scenarioId === 'make-friends';
  const isCheating = titleLower.includes('chép bài') || scenarioId === 'refuse-cheating';
  const isBaoTuong = titleLower.includes('báo tường') || titleLower.includes('góp ý khi không đồng ý') || scenarioId === 'disagree-politely';
  const isGroupWork = titleLower.includes('thuyết trình') || titleLower.includes('ý tưởng') || scenarioId === 'group-work';
  const isDeadline = titleLower.includes('đúng hạn') || titleLower.includes('deadline') || scenarioId === 'remind-deadline';
  const isRefusePlay = titleLower.includes('đá bóng') || titleLower.includes('ôn bài') || scenarioId === 'refuse-politely';
  const isForgotHomework = titleLower.includes('quên') || titleLower.includes('vở') || scenarioId === 'explain-forgotten-hw';

  // Phrase detection without ASCII \b
  const isRudeDismissive = containsPhrase(lower, [
    'biến đi', 'cút', 'cút đi', 'tự lo đi', 'kệ xác', 'mặc xác', 'vô duyên',
    'đồ điên', 'ngu', 'chết chứ bệnh tật gì', 'rác rưởi', 'đống rác', 'vô trách nhiệm'
  ]);
  const hasProfanity = isProfaneOrInsult(text);
  const isCheatingAgreed = containsPhrase(lower, [
    'cho chép', 'chép đi', 'được, chép', 'được chứ chép', 'chép câu', 'đưa bài cho', 'đưa tớ chép'
  ]);
  const isOffTopicDisagreed = isBaoTuong && containsPhrase(lower, [
    'đá cầu', 'đá bóng', 'chơi game', 'ăn kem', 'uống nước', 'đi net'
  ]);
  const isRefusingHelp = containsPhrase(lower, ['không', 'từ chối', 'đừng', 'không được', 'không cho', 'tự lo']);
  const hasPoliteGreeting = containsPhrase(lower, ['chào', 'dạ', 'thưa', 'vâng', 'cảm ơn', 'xin lỗi', 'phiền', 'nhé', 'nha', 'ạ']);
  const hasPronouns = containsPhrase(lower, ['tớ', 'mình', 'cậu', 'bạn', 'em', 'thầy', 'cô']);

  // 1. CLARITY EVALUATION (0, 1, 2)
  let clarityScore: 0 | 1 | 2 = 2;
  let clarityReason = 'Ý định và thông điệp diễn đạt rất rõ ràng, dễ hiểu.';

  if (wordCount === 0) {
    clarityScore = 0;
    clarityReason = 'Câu trả lời trống, không có thông điệp giao tiếp.';
  } else if (wordCount === 1 && (lower === 'ừ' || lower === 'ờ' || lower === 'hả')) {
    clarityScore = 1;
    clarityReason = 'Câu trả lời quá ngắn và lấp lửng, chưa rõ ý định cụ thể.';
  } else if (lower === 'tớ không thích' || lower === 'sao cũng được' || lower === 'tùy') {
    clarityScore = 1;
    clarityReason = 'Đã nêu được cảm xúc cá nhân nhưng chưa rõ lý do hoặc ý định cụ thể.';
  } else {
    // Short sentences like "Biến đi.", "Không, tự lo đi.", "Không.", "Được chứ, ngồi đi bạn."
    // convey clear intention. Per guidelines: "Không tự động đánh giá thấp chỉ vì câu ngắn."
    clarityScore = 2;
    clarityReason = 'Thông điệp và ý định giao tiếp rất rõ ràng, đối phương hiểu được ngay.';
  }

  // 2. POLITENESS EVALUATION (0, 1, 2)
  let politenessScore: 0 | 1 | 2 = 2;
  let politenessReason = 'Diễn đạt tôn trọng, dùng từ ngữ hòa nhã và phù hợp.';

  if (hasProfanity || isRudeDismissive) {
    politenessScore = 0;
    politenessReason = 'Dùng lời lẽ thô lỗ, cộc cằn, xua đuổi hoặc coi thường đối phương.';
  } else if (isTeacher && !lower.includes('dạ') && !lower.includes('thưa') && !lower.includes('ạ')) {
    politenessScore = 0;
    politenessReason = 'Nói trổng với thầy cô giáo, thiếu chủ vị và kính ngữ bắt buộc trong học đường.';
  } else if (wordCount <= 2 && !hasPoliteGreeting && !hasPronouns) {
    // E.g. "Không.", "Chỗ này có người rồi." -> Hơi cụt lốc nhưng không xúc phạm
    politenessScore = 1;
    politenessReason = 'Cách diễn đạt hơi cộc lốc hoặc thiếu từ ngữ xưng hô, nhưng không có ý xúc phạm.';
  } else if (lower.includes('sao cũng được') || lower.includes('thích làm gì thì làm')) {
    politenessScore = 1;
    politenessReason = 'Thái độ hơi bàng quan, chưa thể hiện sự nhiệt tình và gắn kết với bạn bè.';
  } else if (lower.includes('tớ không thích') && wordCount < 5) {
    politenessScore = 1;
    politenessReason = 'Cách từ chối hoặc bày tỏ cảm xúc hơi ngắn gọn, thiếu sự khéo léo.';
  } else {
    politenessScore = 2;
    politenessReason = 'Thái độ tôn trọng, xưng hô phù hợp chuẩn mực học sinh.';
  }

  // 3. APPROPRIATENESS EVALUATION (0, 1, 2)
  let appropriatenessScore: 0 | 1 | 2 = 2;
  let appropriatenessReason = 'Đáp ứng đúng tình huống và có cách xử lý hợp lý, đúng chuẩn mực.';

  if (isCheating) {
    if (isCheatingAgreed) {
      // Cheating agreed -> 0 points!
      appropriatenessScore = 0;
      appropriatenessReason = 'Đồng ý cho bạn chép bài hoặc tiếp tay cho gian lận thi cử là vi phạm nghiêm trọng nội quy học tập.';
    } else if (isRefusingHelp || lower.includes('không')) {
      // Refused cheating -> 2 points! Even if abrupt, refusing cheating is correct!
      if (politenessScore === 0 && (lower.includes('ngu') || lower.includes('chết'))) {
        appropriatenessScore = 1;
        appropriatenessReason = 'Có ý thức không cho chép bài nhưng cách phản ứng xúc phạm gây xung đột không đáng có.';
      } else {
        appropriatenessScore = 2;
        appropriatenessReason = 'Từ chối hành vi gian lận trong giờ kiểm tra là hoàn toàn đúng đắn và phù hợp quy tắc học tập.';
      }
    }
  } else if (isOffTopicDisagreed) {
    // Off-topic in discussion
    appropriatenessScore = 0;
    appropriatenessReason = 'Câu trả lời hoàn toàn lạc đề, né tránh vấn đề cần thảo luận và góp ý.';
  } else if (isMakeFriends && (lower.includes('biến đi') || hasProfanity)) {
    appropriatenessScore = 0;
    appropriatenessReason = 'Cách từ chối thô bạo không phù hợp với hoàn cảnh làm quen học đường, gây tổn thương bạn mới.';
  } else if (isMakeFriends && lower.includes('chỗ này có người')) {
    appropriatenessScore = 1;
    appropriatenessReason = 'Giải thích lý do thực tế nhưng chưa gợi ý hỗ trợ giúp bạn mới tìm vị trí khác trong lớp.';
  } else if (isBaoTuong && (lower.includes('đống rác') || lower.includes('xấu tệ hại'))) {
    appropriatenessScore = 0;
    appropriatenessReason = 'Chỉ trích mang tính phá hoại, không phù hợp với mục tiêu hợp tác làm báo tường.';
  } else if (isBaoTuong && lower === 'tớ không thích') {
    appropriatenessScore = 1;
    appropriatenessReason = 'Chưa đưa ra giải pháp hay lý do cụ thể để giúp bạn hoàn thiện bài báo tường.';
  } else if (isGroupWork && (lower.includes('sao cũng được') || lower.includes('thích làm gì thì làm'))) {
    appropriatenessScore = 1;
    appropriatenessReason = 'Chưa đáp ứng được yêu cầu đóng góp ý tưởng xây dựng bài thuyết trình cùng nhóm.';
  } else if (isDeadline && politenessScore === 0) {
    appropriatenessScore = 1;
    appropriatenessReason = 'Mục đích là giục nộp bài nhưng cách xử lý gay gắt làm rạn nứt tinh thần đồng đội.';
  } else if (isForgotHomework && politenessScore === 0) {
    appropriatenessScore = 1;
    appropriatenessReason = 'Nêu được sự việc để quên vở nhưng thái độ và cách báo cáo chưa phù hợp với tác phong học sinh.';
  }

  // Construct strengths and improvements
  let strengths = '';
  if (politenessScore === 0 && appropriatenessScore === 0) {
    strengths = 'Em đã bộc lộ ý định dứt khoát, nhưng cần rèn luyện cách biểu đạt văn minh và lịch sự hơn.';
  } else if (politenessScore === 0 && appropriatenessScore === 2) {
    strengths = 'Em có lập trường đúng đắn và kiên quyết tuân thủ quy chế thi cử, không tiếp tay cho gian lận.';
  } else if (appropriatenessScore === 0) {
    strengths = 'Em có cách diễn đạt tự nhiên và rõ ràng khi trò chuyện.';
  } else if (politenessScore === 2 && appropriatenessScore === 2 && clarityScore === 2) {
    strengths = `Em đã diễn đạt rất chuẩn mực, vừa tôn trọng ${partnerName} vừa giải quyết tình huống khéo léo, đúng mực.`;
  } else {
    strengths = 'Em đã phản hồi trực tiếp vào nội dung cuộc trò chuyện một cách rõ ràng.';
  }

  let improvements = '';
  if (politenessScore === 0) {
    improvements = isTeacher
      ? 'Khi giao tiếp với thầy cô, em cần luôn nhớ dùng kính ngữ "Dạ thưa thầy/cô" và "ạ" ở cuối câu để thể hiện sự lễ phép.'
      : 'Em cần học cách kiềm chế cảm xúc, dùng từ ngữ hòa nhã và tôn trọng người khác, tuyệt đối không xua đuổi hay xúc phạm bạn bè.';
  } else if (appropriatenessScore === 0) {
    improvements = isCheating
      ? 'Trong giờ kiểm tra, tuyệt đối không cho bạn chép bài. Hãy kiên quyết từ chối lịch sự và hẹn giảng lại bài cho bạn sau giờ học.'
      : 'Em cần tập trung vào đúng chủ đề đối phương đang trao đổi, tránh né tránh hoặc nói sang chuyện khác.';
  } else if (politenessScore === 1 || appropriatenessScore === 1) {
    improvements = 'Em có thể bổ sung thêm lý do cụ thể hoặc đề xuất giải pháp thay thế để câu chuyện thêm trọn vẹn và thuyết phục.';
  } else {
    improvements = 'Em hãy tiếp tục phát huy phản xạ giao tiếp tự tin, kết hợp ánh mắt và nụ cười thân thiện nhé!';
  }

  const raw = {
    criteria: [
      { name: 'Rõ ràng', score: clarityScore, level: scoreToLevel(clarityScore), reason: clarityReason },
      { name: 'Lịch sự', score: politenessScore, level: scoreToLevel(politenessScore), reason: politenessReason },
      { name: 'Phù hợp', score: appropriatenessScore, level: scoreToLevel(appropriatenessScore), reason: appropriatenessReason }
    ],
    strengths,
    improvements
  };

  return validateAndNormalizeFeedback(raw, scenarioTitle, partnerName, studentResponse);
}

function getDefaultFriendlyRewrite(scenarioTitle: string, partnerName: string, studentResponse: string): string {
  const lower = studentResponse.toLowerCase();
  const titleLower = scenarioTitle.toLowerCase();

  // Preserve student's legitimate intent
  if (lower.includes('biến đi') || lower.includes('chỗ này có người') || lower.includes('từ chối')) {
    if (titleLower.includes('làm quen') || titleLower.includes('chuyển trường')) {
      return `“Chào cậu nha, bàn này tớ lỡ để cặp giữ chỗ cho bạn cùng bàn rồi. Cậu thử sang bàn phía trước ngồi cùng bạn Nam xem sao nhé!”`;
    }
  }

  if (titleLower.includes('chép bài') || lower.includes('tự lo') || lower.includes('không')) {
    return `“Suỵt, giám thị đang để ý đấy! Cậu ráng nhớ lại bài đi, giờ kiểm tra không được đưa bài, lát ra chơi tớ chỉ lại cho nha!”`;
  }

  if (titleLower.includes('báo tường') || titleLower.includes('góp ý')) {
    return `“Tớ thấy ý tưởng của cậu rất nổi bật, nhưng nếu nền đỏ thẫm quá thì chữ sẽ bị chìm. Hay mình thử đổi sang nền kem viền đỏ xem sao?”`;
  }

  if (titleLower.includes('thầy') || titleLower.includes('cô')) {
    return `“Dạ thưa thầy/cô, sáng nay em vội quá nên để quên vở ở nhà ạ. Em xin phép mai nộp bù cho thầy/cô chấm được không ạ?”`;
  }

  return `“Chào ${partnerName}, mình hiểu ý bạn rồi. Tụi mình cùng trao đổi thêm để tìm cách tối ưu nhất nhé!”`;
}

function getDefaultPoliteConfidentRewrite(scenarioTitle: string, partnerName: string, studentResponse: string): string {
  const lower = studentResponse.toLowerCase();
  const titleLower = scenarioTitle.toLowerCase();

  if (titleLower.includes('chép bài') || lower.includes('tự lo') || lower.includes('không')) {
    return `“Đạt ơi thông cảm cho tớ nhé, tụi mình phải tự làm bài kiểm tra thì mới công bằng và không bị hủy bài. Tan học tớ sẽ kèm lại phần này cho cậu.”`;
  }

  if (titleLower.includes('làm quen') || titleLower.includes('chuyển trường')) {
    return `“Chào bạn, bàn này hiện có bạn ngồi rồi nên hơi chật. Bạn có thể sang dãy bàn 2 còn trống nhé, lát ra chơi tụi mình cùng trò chuyện thêm!”`;
  }

  if (titleLower.includes('báo tường') || titleLower.includes('góp ý')) {
    return `“Cảm ơn Quốc Bảo đã chia sẻ ý tưởng. Theo quan sát của tớ, để bài báo tường đạt điểm thẩm mỹ cao thì độ dễ đọc rất quan trọng. Mình cùng thử nghiệm phối màu sáng hơn nhé.”`;
  }

  if (titleLower.includes('thầy') || titleLower.includes('cô')) {
    return `“Dạ em thành thật xin lỗi thầy/cô vì sự sơ suất này ạ! Tối qua em đã làm bài xong, giờ ra chơi em xin phép nhờ phụ huynh chụp ảnh gửi qua để thầy/cô xem trước ạ.”`;
  }

  return `“Cảm ơn ${partnerName} đã chia sẻ thẳng thắn. Mình nghĩ tụi mình có thể cân nhắc giải pháp này để đôi bên đều thoải mái...”`;
}

function getDefaultFollowUp(
  scenarioTitle: string,
  partnerName: string,
  studentResponse: string,
  politenessScore: number,
  appropriatenessScore: number
): string {
  const lower = studentResponse.toLowerCase();
  const titleLower = scenarioTitle.toLowerCase();
  const isTeacher = partnerName.startsWith('Cô') || partnerName.startsWith('Thầy');

  // Make offline/server-failure responses specific to the active scenario.
  if (appropriatenessScore === 0 && titleLower.includes('chép bài')) {
    return `${partnerName} ngập ngừng rồi nói: “Tớ biết cậu muốn giúp, nhưng nghĩ lại mình không nên chép bài trong giờ kiểm tra. Tớ sẽ tự làm phần còn lại nhé.”`;
  }

  if (politenessScore === 0 && (titleLower.includes('chuyển trường') || titleLower.includes('làm quen'))) {
    return `${partnerName} hơi sững lại và buồn bã nói: “Mình chỉ muốn làm quen thôi. Nếu bạn không muốn trò chuyện thì có thể nói nhẹ nhàng hơn mà...”`;
  }

  if (politenessScore === 0) {
    if (isTeacher) {
      return `${partnerName} rất buồn vì thái độ nói trổng của em. Lần sau nói chuyện với thầy cô, em cần dùng kính ngữ "Dạ thưa" nhé.`;
    }
    return `Sao cậu lại gắt gỏng và nặng lời với tớ thế... Có gì tụi mình cứ bình tĩnh nói chuyện với nhau chứ.`;
  }

  if (appropriatenessScore === 0 && scenarioTitle.toLowerCase().includes('chép bài')) {
    return `May quá, có cậu cứu bồ rồi! Nhưng tụi mình phải che cẩn thận kẻo thầy giám thị bắt được thì to chuyện đấy.`;
  }

  if (appropriatenessScore === 0 && lower.includes('đá cầu')) {
    return `Ủa tớ đang hỏi cậu về màu nền tờ báo tường cơ mà, sao tự nhiên cậu lại rủ đi đá cầu thế? Cậu thấy nền đỏ có ổn không?`;
  }

  if (scenarioTitle.toLowerCase().includes('chép bài')) {
    return `Ừ nhỉ, tý nữa là bị thầy ghi vào sổ đầu bài rồi. Lát tan học cậu nhớ giảng lại bài này cho tớ nhé, cảm ơn cậu!`;
  }

  if (scenarioTitle.toLowerCase().includes('chuyển trường')) {
    return `Cảm ơn bạn nhiều lắm nha! May quá gặp được bạn tốt bụng, tự nhiên mình thấy đỡ bỡ ngỡ hẳn luôn.`;
  }

  return `Hay quá, nghe cậu nói thế tớ thấy an tâm và hiểu ý cậu hơn nhiều rồi! Cảm ơn cậu nhé.`;
}
