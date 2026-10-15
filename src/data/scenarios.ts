import { Scenario } from '../types';

export const SCENARIO_CATEGORIES = [
  { id: 'all', label: 'Tất cả chủ đề' },
  { id: 'friends', label: '🎒 Kết bạn & Giao lưu' },
  { id: 'team', label: '👥 Làm việc nhóm' },
  { id: 'discussion', label: '🎨 Góp ý & Tranh luận' },
  { id: 'apology', label: '🤝 Hòa giải & Xin lỗi' },
  { id: 'refusal', label: '🛡️ Từ chối khéo léo' },
  { id: 'teacher', label: '👩‍🏫 Thầy cô giáo' }
] as const;

export const DIFFICULTY_LEVELS = [
  {
    id: 'all',
    label: 'Tất cả cấp độ',
    badge: 'Tất cả',
    icon: '🌟',
    description: 'Toàn bộ 14 tình huống từ cơ bản đến nâng cao'
  },
  {
    id: 'easy',
    label: 'Dễ (Khởi động)',
    badge: 'Dễ',
    icon: '🌱',
    colorText: 'text-emerald-300',
    colorBg: 'bg-emerald-500/15',
    colorBorder: 'border-emerald-500/30',
    description: 'Giao lưu gần gũi, áp lực thấp, dễ mở lời kết bạn & hỏi bài'
  },
  {
    id: 'medium',
    label: 'Vừa sức (Rèn luyện)',
    badge: 'Vừa sức',
    icon: '⚡',
    colorText: 'text-amber-300',
    colorBg: 'bg-amber-500/15',
    colorBorder: 'border-amber-500/30',
    description: 'Hợp tác nhóm, san sẻ công việc, xin lỗi & giải thích tế nhị'
  },
  {
    id: 'hard',
    label: 'Thử thách (Chuyên sâu)',
    badge: 'Thử thách',
    icon: '🔥',
    colorText: 'text-rose-300',
    colorBg: 'bg-rose-500/15',
    colorBorder: 'border-rose-500/30',
    description: 'Bảo vệ chính kiến, từ chối áp lực bạn bè & hóa giải xung đột'
  }
] as const;

export interface CommonResponseChip {
  id: string;
  label: string;
  text: string;
  badge: string;
  englishHint: string;
}

export const COMMON_RESPONSE_CHIPS: CommonResponseChip[] = [
  {
    id: 'understand',
    label: 'Mình hiểu ý bạn rồi...',
    text: 'Mình hiểu ý bạn rồi, nhưng mà ',
    badge: 'Hiểu & Lắng nghe',
    englishHint: 'Yes, I understand...'
  },
  {
    id: 'explain-more',
    label: 'Bạn có thể nói rõ hơn chút được không?',
    text: 'Bạn có thể giải thích rõ hơn một chút được không? ',
    badge: 'Hỏi thêm thông tin',
    englishHint: 'Could you explain more?'
  },
  {
    id: 'propose-idea',
    label: 'Theo mình thì tụi mình có thể...',
    text: 'Theo mình thấy thì hay là tụi mình thử ',
    badge: 'Đề xuất giải pháp',
    englishHint: 'I suggest that...'
  },
  {
    id: 'polite-thanks',
    label: 'Cảm ơn bạn đã rủ / chia sẻ nhé...',
    text: 'Cảm ơn bạn đã chia sẻ và nhắc nhở mình nhé! ',
    badge: 'Cảm ơn lịch thiệp',
    englishHint: 'Thank you for sharing...'
  },
  {
    id: 'gentle-refusal',
    label: 'Tiếc quá, hiện tại mình bận một chút...',
    text: 'Tiếc quá, hiện tại mình đang bận một chút nên ',
    badge: 'Từ chối khéo léo',
    englishHint: 'Unfortunately I am busy...'
  },
  {
    id: 'sincere-apology',
    label: 'Mình thật lòng xin lỗi bạn nhiều nha...',
    text: 'Mình thật lòng xin lỗi bạn nhiều nha, ',
    badge: 'Xin lỗi chân thành',
    englishHint: 'I am so sorry...'
  },
  {
    id: 'teacher-polite',
    label: 'Dạ thưa thầy / cô, em xin phép...',
    text: 'Dạ thưa cô/thầy, em xin phép được ',
    badge: 'Kính ngữ thầy cô',
    englishHint: 'Dear teacher, may I...'
  }
];

export const SCENARIOS: Scenario[] = [
  // 1. KẾT BẠN & GIAO LƯU
  {
    id: 'make-friends',
    title: 'Làm quen với bạn mới chuyển trường',
    category: 'Giao lưu bạn bè',
    categoryTag: 'friends',
    difficulty: 'easy',
    partnerName: 'Hải Đăng',
    partnerRole: 'Bạn học sinh mới chuyển đến lớp',
    partnerAvatar: '🎒',
    contextDescription: 'Giờ ra chơi, một bạn mới chuyển trường đang ngồi một mình ở bàn cuối, nhìn xung quanh có vẻ bỡ ngỡ và ngập ngừng.',
    initialPrompt: 'Chào bạn... Mình mới chuyển trường đến hôm qua nên chưa quen ai trong lớp cả. Mình có thể ngồi cùng bạn một lát được không?',
    quickStarters: [
      'Chào bạn! Bàn này còn trống nè, cậu cứ ngồi cùng tớ cho vui nhé!',
      'Rất vui được làm quen với cậu nha! Tớ là học sinh lớp mình, có gì bỡ ngỡ cứ hỏi tớ nhé.',
      'Cậu ngồi đi! Lát nữa ra chơi tớ dẫn cậu đi tham quan các dãy phòng học và thư viện nha.'
    ]
  },
  {
    id: 'canteen-chat',
    title: 'Chủ động bắt chuyện ở giờ giải lao',
    category: 'Giao lưu bạn bè',
    categoryTag: 'friends',
    difficulty: 'easy',
    partnerName: 'Tuấn Kiệt',
    partnerRole: 'Bạn học cùng khối lớp',
    partnerAvatar: '📖',
    contextDescription: 'Ở góc ghế đá sân trường, em thấy một bạn cùng khối đang đọc say mê cuốn truyện tranh/sách khoa học mà em cũng rất yêu thích.',
    initialPrompt: 'A, bạn cũng đọc bộ sách này à? Đoạn cuối tập 3 bất ngờ ghê luôn ấy, bạn đọc đến đoạn đó chưa?',
    quickStarters: [
      'Tớ đọc qua đoạn đó rồi nè! Kịch tính dã man luôn, cậu thấy nhân vật chính xử lý thế nào?',
      'A chào bạn! Tớ cũng theo dõi bộ này từ tập 1, đoạn cuối tập 3 làm tớ bất ngờ ghê luôn.',
      'Bạn có thể kể thêm đoạn bạn thấy ấn tượng nhất không? Tớ cũng mê cuốn này lắm!'
    ]
  },

  // 2. LÀM VIỆC NHÓM
  {
    id: 'group-work',
    title: 'Đề xuất ý tưởng thuyết trình nhóm',
    category: 'Làm việc nhóm',
    categoryTag: 'team',
    difficulty: 'easy',
    partnerName: 'Minh Thảo',
    partnerRole: 'Nhóm trưởng thảo luận',
    partnerAvatar: '🧪',
    contextDescription: 'Nhóm đang thảo luận chọn đề tài cho bài thuyết trình môn Khoa học tuần tới và nhóm trưởng đang thăm dò ý kiến của các thành viên.',
    initialPrompt: 'Nhóm mình đang cần thêm ý tưởng sáng tạo cho bài thuyết trình tuần sau. Bạn có đề xuất hoặc sáng kiến nào muốn chia sẻ với cả nhóm không?',
    quickStarters: [
      'Tớ có ý tưởng này: nhóm mình có thể làm sơ đồ tư duy kết hợp đố vui đầu giờ để các bạn chú ý hơn!',
      'Mình hiểu ý nhóm trưởng rồi, hay là nhóm mình làm một video phỏng vấn ngắn khoảng 1 phút chiếu mở màn?',
      'Theo mình thì đề tài về bảo vệ môi trường trường học rất thực tế, nhóm mình chia nhau làm nhé!'
    ]
  },
  {
    id: 'share-workload',
    title: 'Đề nghị san sẻ công việc khi bạn quá tải',
    category: 'Làm việc nhóm',
    categoryTag: 'team',
    difficulty: 'medium',
    partnerName: 'Khánh Linh',
    partnerRole: 'Bạn phụ trách thiết kế slide',
    partnerAvatar: '💻',
    contextDescription: 'Bạn được phân công làm toàn bộ slide và đang thở dài mệt mỏi vì vừa phải soạn nội dung vừa phải tìm hình ảnh gấp trong đêm.',
    initialPrompt: 'Hôm nay tớ phải ôn kiểm tra Toán nữa mà slide nhóm mình dài quá, tớ làm mãi vẫn chưa xong một nửa, lo quá cậu ơi...',
    quickStarters: [
      'Linh ơi cậu đừng lo một mình! Để tớ làm phụ phần tìm hình ảnh và định dạng chữ cho cậu nhé.',
      'Mình hiểu bạn đang rất vất vả, hay là gửi file qua tớ chia đôi số trang làm cùng cậu nhé!',
      'Cậu cứ tập trung ôn bài Toán trước đi, phần slide còn lại để tớ và các bạn trong nhóm hỗ trợ gánh bớt.'
    ]
  },
  {
    id: 'remind-deadline',
    title: 'Nhắc nhở bạn nộp bài nhóm đúng hạn',
    category: 'Làm việc nhóm',
    categoryTag: 'team',
    difficulty: 'medium',
    partnerName: 'Hoàng Long',
    partnerRole: 'Thành viên phụ trách phần 2',
    partnerAvatar: '⏳',
    contextDescription: 'Chỉ còn một ngày nữa là tới hạn nộp bài báo cáo của nhóm nhưng Long vẫn chưa gửi phần nội dung của bạn ấy cho nhóm trưởng.',
    initialPrompt: 'Ôi tớ bận quá nên chưa kịp gõ xong phần của tớ. Mai mới nộp bài mà, tối nay tớ thức làm vội cũng được chứ gì?',
    quickStarters: [
      'Long ơi, nhóm mình cần ghép bài sớm trước 8h tối nay để còn kiểm tra lỗi và chỉnh sửa slide nữa...',
      'Tớ hiểu cậu bận, nhưng bài tính điểm chung cả nhóm. Cậu gửi sớm để nhóm trưởng kịp tổng hợp nhé!',
      'Cậu có gặp khó khăn ở đoạn nào không? Nếu kẹt phần tài liệu thì cứ ới tụi mình hỗ trợ nè.'
    ]
  },

  // 3. GÓP Ý & TRANH LUẬN
  {
    id: 'disagree-politely',
    title: 'Góp ý khi không đồng ý cách làm',
    category: 'Góp ý & Tranh luận',
    categoryTag: 'discussion',
    difficulty: 'medium',
    partnerName: 'Quốc Bảo',
    partnerRole: 'Bạn cùng bàn làm báo tường 20/11',
    partnerAvatar: '🎨',
    contextDescription: 'Bạn đề xuất tô kín toàn bộ nền báo tường bằng màu đỏ thẫm rồi viết chữ đen thật dày, em thấy làm vậy sẽ khiến người xem rất chói mắt.',
    initialPrompt: 'Tớ thấy tờ báo tường này cứ tô kín nền đỏ tươi rồi viết chữ thật dày đặc lên là nổi bật nhất khối luôn! Cậu thấy ý tưởng của tớ thế nào?',
    quickStarters: [
      'Tớ thấy ý tưởng của cậu rất nhiệt huyết, nhưng nếu nền đỏ thẫm quá thì các bạn phía xa sẽ khó đọc chữ...',
      'Mình hiểu ý bạn muốn báo tường nổi bật, hay là mình dùng nền kem sáng rồi điểm xuyết viền hoa đỏ cho thanh lịch?',
      'Bạn có thể thử làm một mẫu nháp nhỏ trước xem sao? Tớ sợ màu đỏ kín nền nhìn lâu sẽ hơi chói mắt.'
    ]
  },
  {
    id: 'defend-opinion',
    title: 'Bảo vệ ý kiến một cách hòa nhã',
    category: 'Góp ý & Tranh luận',
    categoryTag: 'discussion',
    difficulty: 'hard',
    partnerName: 'Ngọc Mai',
    partnerRole: 'Thành viên ban cán sự lớp',
    partnerAvatar: '💡',
    contextDescription: 'Em đề xuất tổ chức một góc chia sẻ sách cũ ở góc lớp, nhưng bạn Mai gạt đi vì cho rằng sẽ bừa bộn và không ai tham gia.',
    initialPrompt: 'Ý tưởng để sách cũ ở lớp của cậu không khả thi đâu, vừa bừa bộn lớp học mà các bạn giờ ra chơi chỉ thích chạy nhảy thôi, ai đọc làm gì!',
    quickStarters: [
      'Cảm ơn Mai đã góp ý thẳng thắn! Tớ hiểu lo lắng của cậu về việc bừa bộn, nhưng nếu tụi mình có nội quy mượn rõ ràng...',
      'Mình hiểu ý Mai rồi, hay là lớp mình thử nghiệm trong 2 tuần trước xem phản hồi của các bạn thế nào?',
      'Bạn có thể cho mình thêm 1 phút giải thích kế hoạch phân công người trông coi góc sách được không?'
    ]
  },

  // 4. HÒA GIẢI & XIN LỖI
  {
    id: 'apologize',
    title: 'Xin lỗi khi vô tình làm hỏng đồ của bạn',
    category: 'Hòa giải & Xin lỗi',
    categoryTag: 'apology',
    difficulty: 'medium',
    partnerName: 'Phương Linh',
    partnerRole: 'Bạn cùng bàn',
    partnerAvatar: '📚',
    contextDescription: 'Em mượn cuốn sách bài tập bìa đẹp của bạn nhưng vô tình làm gập mép bìa và quên mang trả bạn đúng giờ kiểm tra sáng nay.',
    initialPrompt: 'Sao góc bìa cuốn sách tớ quý lại bị gập cong queo thế này... Với lại sáng nay có bài kiểm tra mà đến giờ ra chơi cậu mới trả làm tớ lo mãi!',
    quickStarters: [
      'Phương Linh ơi, tớ thật lòng xin lỗi cậu nhiều nha! Tớ bất cẩn quá, tớ đã vuốt phẳng lại mép bìa rồi...',
      'Tớ xin lỗi cậu vì đã làm cậu lo lắng suốt buổi sáng. Lần sau mượn đồ tớ hứa sẽ giữ gìn cẩn thận gấp đôi!',
      'Tớ hiểu cậu quý cuốn sách này lắm. Tớ có mua tặng cậu chiếc kẹp sách này để chuộc lỗi, cậu tha lỗi cho tớ nha!'
    ]
  },
  {
    id: 'resolve-rumor',
    title: 'Hóa giải hiểu lầm và tin đồn thất thiệt',
    category: 'Hòa giải & Xin lỗi',
    categoryTag: 'apology',
    difficulty: 'hard',
    partnerName: 'Thanh Trúc',
    partnerRole: 'Bạn cùng lớp',
    partnerAvatar: '💬',
    contextDescription: 'Có bạn khác nói với Trúc rằng em chê bai bài vẽ của Trúc trong giờ Mỹ thuật, khiến Trúc giận và nhìn em bằng ánh mắt xa lánh.',
    initialPrompt: 'Có người bảo với tớ là hôm qua cậu đi nói với cả lớp là bài vẽ của tớ xấu tệ hại đúng không? Sao cậu lại làm thế với tớ?',
    quickStarters: [
      'Trúc ơi không hề có chuyện đó đâu! Hôm qua tớ còn khen với các bạn là màu tranh của cậu vẽ rất sáng tạo mà.',
      'May quá cậu hỏi thẳng tớ chứ không để bụng! Chắc có ai đó đã hiểu lầm rồi truyền đạt sai, cậu đừng buồn tớ nha.',
      'Mình hiểu cảm giác của Trúc khi nghe tin như vậy. Tớ khẳng định là tớ luôn tôn trọng và quý mến bạn.'
    ]
  },
  {
    id: 'calm-dispute',
    title: 'Can ngăn hai người bạn đang to tiếng',
    category: 'Hòa giải & Xin lỗi',
    categoryTag: 'apology',
    difficulty: 'hard',
    partnerName: 'Gia Huy',
    partnerRole: 'Bạn chơi thể thao cùng đội',
    partnerAvatar: '🏀',
    contextDescription: 'Trong trận bóng rổ, Huy và một bạn khác va chạm và chuẩn bị lao vào xô xát, to tiếng gay gắt ngay giữa sân bóng.',
    initialPrompt: 'Nó cố tình gạt chân tớ trước rõ ràng! Hôm nay tớ không bỏ qua đâu, để tớ xử lý nó ra ngô ra khoai!',
    quickStarters: [
      'Huy ơi bình tĩnh lại một chút đã! Trận bóng giao hữu vui là chính, cậu ngồi xuống uống ngụm nước hạ hỏa đi.',
      'Tớ hiểu cậu đang rất ức chế, nhưng bạn bè cùng trường cả, đánh nhau là bị phạt nặng và cấm thi đấu đấy!',
      'Dừng lại đi Huy! Để tớ ra trao đổi với đội bạn xem tình huống đó thế nào, cậu đừng nóng vội mất khôn nhé.'
    ]
  },

  // 5. TỪ CHỐI KHÉO LÉO
  {
    id: 'refuse-politely',
    title: 'Từ chối lời rủ đi chơi để ôn bài và giúp mẹ',
    category: 'Từ chối khéo léo',
    categoryTag: 'refusal',
    difficulty: 'easy',
    partnerName: 'Đức Anh',
    partnerRole: 'Bạn thân',
    partnerAvatar: '⚽',
    contextDescription: 'Tan học, bạn rủ em đi đá bóng và ghé quán nước mía ngay, nhưng chiều nay em đã hứa phụ mẹ dọn nhà và có bài kiểm tra ngày mai.',
    initialPrompt: 'Chiều nay được về sớm, tụi mình đi đá bóng rồi ghé uống nước mía một lát đi! Lâu lắm mới có buổi rảnh rỗi, cậu đi cùng tớ nhé?',
    quickStarters: [
      'Cảm ơn Đức Anh đã rủ tớ nhé! Nhưng chiều nay tớ lỡ hẹn phụ mẹ dọn nhà và ôn thi Toán mất rồi.',
      'Tiếc ghê hôm nay tớ bận việc gia đình mất rồi! Chiều thứ Bảy tụi mình đi đá bóng bù được không cậu?',
      'Tớ cũng thích đi lắm nhưng mai kiểm tra 1 tiết rồi. Cậu đi vui vẻ nha, hẹn cậu cuối tuần này!'
    ]
  },
  {
    id: 'refuse-cheating',
    title: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    category: 'Từ chối khéo léo',
    categoryTag: 'refusal',
    difficulty: 'hard',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    partnerAvatar: '📝',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    initialPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    quickStarters: [
      'Suỵt, thầy cô đang nhìn đấy! Cậu ráng nhớ lại công thức bài 2 đi, đưa bài là bị hủy bài cả hai đó.',
      'Đạt ơi thông cảm cho tớ nha, giờ kiểm tra không cho chép bài được. Lát tan học tớ giảng lại cặn kẽ cho cậu!',
      'Cậu cố làm những câu dễ trước đi! Giám thị đang đứng gần bàn mình lắm, tập trung làm đi nhé.'
    ]
  },

  // 6. GIAO TIẾP VỚI THẦY CÔ
  {
    id: 'ask-teacher',
    title: 'Nhờ thầy cô giảng lại bài tập chưa hiểu',
    category: 'Giao tiếp thầy cô',
    categoryTag: 'teacher',
    difficulty: 'easy',
    partnerName: 'Cô Mai Lan',
    partnerRole: 'Giáo viên dạy Toán',
    partnerAvatar: '👩‍🏫',
    contextDescription: 'Sau tiết học Đại số, em vẫn chưa hiểu rõ bước biến đổi hằng đẳng thức ở ví dụ 3 trên bảng và muốn gặp cô hỏi lại trong giờ ra chơi.',
    initialPrompt: 'Em chào cô ạ! Em có chuyện gì cần cô giúp đỡ hay trao đổi về tiết học vừa rồi không em?',
    quickStarters: [
      'Dạ thưa cô, ở tiết học vừa rồi ở ví dụ 3 phần hằng đẳng thức em vẫn chưa nắm vững, cô giảng lại giúp em được không ạ?',
      'Dạ em chào cô ạ! Giờ ra chơi cô có thể cho em xin ít phút để cô hướng dẫn lại bước biến đổi này được không ạ?',
      'Dạ thưa cô, em đang làm bài tập củng cố nhưng bị vướng ở câu 3, em nhờ cô chỉ giúp em chỗ sai với ạ.'
    ]
  },
  {
    id: 'explain-forgotten-hw',
    title: 'Trình bày lý do để quên vở bài tập ở nhà',
    category: 'Giao tiếp thầy cô',
    categoryTag: 'teacher',
    difficulty: 'medium',
    partnerName: 'Thầy Hùng',
    partnerRole: 'Giáo viên môn Ngữ Văn',
    partnerAvatar: '👨‍🏫',
    contextDescription: 'Đầu giờ học, thầy gọi kiểm tra vở bài tập. Em đã làm bài đầy đủ tối qua nhưng sáng vội quá nên để quên trên bàn học ở nhà.',
    initialPrompt: 'Thầy kiểm tra đến bàn em rồi. Vở bài tập của em đã làm xong chưa, mang lên cho thầy xem nào?',
    quickStarters: [
      'Dạ thưa thầy, tối qua em đã làm bài tập đầy đủ rồi nhưng sáng nay vội quá em để quên vở trên bàn học ở nhà ạ...',
      'Dạ em thành thật xin lỗi thầy vì sự sơ suất này ạ! Em xin phép chiều nay hoặc sáng mai nộp bù cho thầy được không ạ?',
      'Dạ thưa thầy, em đã làm xong bài, giờ ra chơi em xin phép nhờ người nhà chụp bài gửi qua để thầy kiểm tra trước ạ.'
    ]
  }
];
