// Utility to detect profanity, insults, vulgarity, and toxic speech in school communication context

const PROFANITY_PATTERNS: RegExp[] = [
  // Common Vietnamese profanities and swear words
  /\b(đm|dcm|đcm|vcl|vkl|vch|đmm|dmm|đệt|đéo|éo|vl|đ cụ|đ mẹ|mẹ mày|bố mày|bà già mày|ông già mày)\b/i,
  /\b(lồn|cặc|buồi|địt|đụ|dâm|chịch|lồz|chim|cu|dái)\b/i,
  /\b(chó|thằng chó|con chó|óc chó|chó chết|súc vật|cẩu)\b/i,
  /\b(ngu|ngu như bò|ngu vcl|óc lợn|óc heo|ngu dốt|đần|đần độn)\b/i,
  /\b(cút|cút đi|cút mẹ mày đi|biến đi|biến mẹ|cút xéo)\b/i,
  /\b(câm|câm mồm|câm họng|ngậm mồm|ngậm mồm lại|câm đi)\b/i,
  /\b(đồ điên|thằng điên|con điên|khùng|dở hơi|thần kinh)\b/i,
  /\b(mất dạy|khốn nạn|đồ khốn|rác rưởi|rẻ rách|đồ rác)\b/i,
  /\b(đĩ|phò|con đĩ|cave)\b/i,
  /\b(ăn cứt|ăn cặn|ỉa|đái)\b/i,
  /\b(mả bố|mả mẹ|tiên sư|tiên sư cha)\b/i,
  // Common English profanities
  /\b(fuck|fucking|fucker|shit|bitch|asshole|bastard|idiot|stfu|shut up|dick|pussy|cunt)\b/i
];

export function isProfaneOrInsult(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const cleanText = text.trim().toLowerCase();
  return PROFANITY_PATTERNS.some(regex => regex.test(cleanText));
}

export function getProfaneReaction(partnerName: string, partnerRole: string): string {
  const isTeacher = partnerName.startsWith('Cô') || partnerName.startsWith('Thầy') || partnerRole.toLowerCase().includes('giáo');

  if (isTeacher) {
    return `${partnerName} rất buồn và nghiêm khắc nhắc nhở em! Lời nói vừa rồi của em đã vi phạm nghiêm trọng chuẩn mực đạo đức giao tiếp với thầy cô. Em cần kiểm soát cảm xúc, chấn chỉnh lại thái độ và lời nói ngay!`;
  }

  return `Sao bạn lại chửi bới và dùng từ ngữ xúc phạm mình nặng nề như vậy? Tụi mình là bạn bè cùng lớp, nếu bạn không đồng ý hay đang tức giận điều gì thì hãy nói chuyện lịch sự và tôn trọng nhau chứ!`;
}
