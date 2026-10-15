import { BenchmarkTestCase } from '../types';

export const BENCHMARK_TEST_SUITE: BenchmarkTestCase[] = [
  // --- NHÓM 4 TRƯỜNG HỢP BẮT BUỘC (PHẦN 3) ---
  {
    id: 'TC01',
    scenarioId: 'make-friends',
    scenarioTitle: 'Làm quen với bạn mới chuyển trường',
    partnerName: 'Hải Đăng',
    partnerRole: 'Bạn học sinh mới chuyển đến lớp',
    contextDescription: 'Giờ ra chơi, một bạn mới chuyển trường đang ngồi một mình ở bàn cuối, nhìn xung quanh có vẻ bỡ ngỡ và ngập ngừng.',
    contextPrompt: 'Chào bạn... Mình mới chuyển trường đến hôm qua nên chưa quen ai trong lớp cả. Mình có thể ngồi cùng bạn một lát được không?',
    studentResponse: 'Biến đi.',
    categoryDescription: 'Trường hợp A (Bắt buộc): Xua đuổi, thiếu lịch sự và không phù hợp',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 0
    },
    expectedReasons: {
      clarity: 'Ý định từ chối rất dứt khoát và dễ hiểu.',
      politeness: 'Cách diễn đạt thô lỗ, xua đuổi, thiếu tôn trọng đối phương nghiêm trọng.',
      appropriateness: 'Cách từ chối không phù hợp với bối cảnh làm quen học đường, gây tổn thương cho bạn mới.'
    }
  },
  {
    id: 'TC02',
    scenarioId: 'refuse-cheating',
    scenarioTitle: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    contextPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    studentResponse: 'Không, tự lo đi.',
    categoryDescription: 'Trường hợp B (Bắt buộc): Từ chối gian lận là đúng đắn, nhưng cách nói thiếu lịch sự',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Thông điệp từ chối dứt khoát, rõ ràng, không lấp lửng.',
      politeness: 'Cách nói cộc cằn, gắt gỏng, thiếu tôn trọng bạn cùng lớp.',
      appropriateness: 'Từ chối hành vi gian lận trong giờ kiểm tra là hoàn toàn đúng đắn và tuân thủ quy chế học tập.'
    }
  },
  {
    id: 'TC03',
    scenarioId: 'refuse-cheating',
    scenarioTitle: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    contextPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    studentResponse: 'Được, chép đi, nhưng đừng nói ai.',
    categoryDescription: 'Trường hợp C (Bắt buộc): Diễn đạt không xúc phạm nhưng tiếp tay gian lận (không phù hợp)',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 0
    },
    expectedReasons: {
      clarity: 'Ý định đồng ý và lời dặn giữ bí mật diễn đạt rất dễ hiểu.',
      politeness: 'Xét riêng cách xưng hô và diễn đạt không có lời lẽ xúc phạm hay thô lỗ.',
      appropriateness: 'Tiếp tay cho hành vi gian lận thi cử, vi phạm nghiêm trọng nội quy học tập và đạo đức học đường.'
    }
  },
  {
    id: 'TC04',
    scenarioId: 'disagree-politely',
    scenarioTitle: 'Góp ý khi không đồng ý cách làm',
    partnerName: 'Quốc Bảo',
    partnerRole: 'Bạn cùng bàn làm báo tường 20/11',
    contextDescription: 'Bạn đề xuất tô kín toàn bộ nền báo tường bằng màu đỏ thẫm rồi viết chữ đen thật dày, em thấy làm vậy sẽ khiến người xem rất chói mắt.',
    contextPrompt: 'Tớ thấy tờ báo tường này cứ tô kín nền đỏ tươi rồi viết chữ thật dày đặc lên là nổi bật nhất khối luôn! Cậu thấy ý tưởng của tớ thế nào?',
    studentResponse: 'Chiều nay bạn có muốn đá cầu không?',
    categoryDescription: 'Trường hợp D (Bắt buộc): Lạc đề hoàn toàn so với yêu cầu góp ý',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 0
    },
    expectedReasons: {
      clarity: 'Câu hỏi rủ bạn đi đá cầu diễn đạt rất rõ ràng.',
      politeness: 'Lời rủ thân mật, hòa nhã, tôn trọng bạn.',
      appropriateness: 'Hoàn toàn lạc đề, né tránh vấn đề góp ý màu nền báo tường mà bạn đang hỏi.'
    }
  },

  // --- CÁC TRƯỜNG HỢP KIỂM THỬ ĐA DẠNG BỔ SUNG (TC05 - TC20) ---
  {
    id: 'TC05',
    scenarioId: 'make-friends',
    scenarioTitle: 'Làm quen với bạn mới chuyển trường',
    partnerName: 'Hải Đăng',
    partnerRole: 'Bạn học sinh mới chuyển đến lớp',
    contextDescription: 'Giờ ra chơi, một bạn mới chuyển trường đang ngồi một mình ở bàn cuối, nhìn xung quanh có vẻ bỡ ngỡ và ngập ngừng.',
    contextPrompt: 'Chào bạn... Mình mới chuyển trường đến hôm qua nên chưa quen ai trong lớp cả. Mình có thể ngồi cùng bạn một lát được không?',
    studentResponse: 'Chào bạn! Bàn này còn trống nè, cậu cứ ngồi cùng tớ cho vui nhé!',
    categoryDescription: 'Câu trả lời tốt toàn diện: Rõ ràng, lịch sự, đúng ngữ cảnh làm quen',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Lời chào và lời mời ngồi cùng rất rành mạch, dễ hiểu.',
      politeness: 'Xưng hô thân thiện, nồng nhiệt, tạo cảm giác gần gũi và tôn trọng.',
      appropriateness: 'Xử lý tình huống tuyệt vời, giúp bạn mới hòa nhập và bớt bỡ ngỡ.'
    }
  },
  {
    id: 'TC06',
    scenarioId: 'make-friends',
    scenarioTitle: 'Làm quen với bạn mới chuyển trường',
    partnerName: 'Hải Đăng',
    partnerRole: 'Bạn học sinh mới chuyển đến lớp',
    contextDescription: 'Giờ ra chơi, một bạn mới chuyển trường đang ngồi một mình ở bàn cuối, nhìn xung quanh có vẻ bỡ ngỡ và ngập ngừng.',
    contextPrompt: 'Chào bạn... Mình mới chuyển trường đến hôm qua nên chưa quen ai trong lớp cả. Mình có thể ngồi cùng bạn một lát được không?',
    studentResponse: 'Được chứ, ngồi đi bạn.',
    categoryDescription: 'Câu trả lời ngắn nhưng rõ ràng và thân thiện (Không phạt vì ngắn)',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Câu ngắn nhưng ý định đồng ý cho bạn ngồi cùng rất rõ ràng.',
      politeness: 'Dùng từ ngữ hòa nhã, có xưng hô "bạn", không có dấu hiệu khó chịu.',
      appropriateness: 'Đáp ứng đúng mong muốn của bạn mới, giải quyết tốt tình huống.'
    }
  },
  {
    id: 'TC07',
    scenarioId: 'make-friends',
    scenarioTitle: 'Làm quen với bạn mới chuyển trường',
    partnerName: 'Hải Đăng',
    partnerRole: 'Bạn học sinh mới chuyển đến lớp',
    contextDescription: 'Giờ ra chơi, một bạn mới chuyển trường đang ngồi một mình ở bàn cuối, nhìn xung quanh có vẻ bỡ ngỡ và ngập ngừng.',
    contextPrompt: 'Chào bạn... Mình mới chuyển trường đến hôm qua nên chưa quen ai trong lớp cả. Mình có thể ngồi cùng bạn một lát được không?',
    studentResponse: 'Chỗ này có người rồi.',
    categoryDescription: 'Từ chối ngắn, hơi cộc nhưng không xúc phạm, chưa trọn vẹn giải pháp',
    expectedScores: {
      clarity: 2,
      politeness: 1,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Thông báo lý do chỗ ngồi đã có người rõ ràng.',
      politeness: 'Hơi cộc lốc do thiếu xưng hô mở đầu, nhưng không mang tính xúc phạm.',
      appropriateness: 'Nêu lý do thực tế nhưng chưa gợi ý hướng giải quyết khác giúp bạn mới tìm chỗ.'
    }
  },
  {
    id: 'TC08',
    scenarioId: 'refuse-cheating',
    scenarioTitle: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    contextPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    studentResponse: 'Đạt ơi thông cảm cho tớ nha, giờ kiểm tra không cho chép bài được. Lát tan học tớ giảng lại cặn kẽ cho cậu!',
    categoryDescription: 'Từ chối đúng cách, chuẩn mực sư phạm và giải pháp thay thế tích cực',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Từ chối dứt khoát, lý do rành mạch.',
      politeness: 'Xưng hô tên bạn thân tình, lời lẽ lịch thiệp và thấu hiểu.',
      appropriateness: 'Tuân thủ nghiêm túc quy chế thi cử, đồng thời đề xuất hỗ trợ học tập sau giờ học.'
    }
  },
  {
    id: 'TC09',
    scenarioId: 'refuse-cheating',
    scenarioTitle: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    contextPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    studentResponse: 'Không.',
    categoryDescription: 'Câu trả lời cực ngắn (1 từ) nhưng rõ ràng và từ chối đúng đắn',
    expectedScores: {
      clarity: 2,
      politeness: 1,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Một từ dứt khoát, thông điệp từ chối hoàn toàn rõ ràng.',
      politeness: 'Hơi cộc lốc do chỉ đáp 1 từ, nhưng không chứa từ ngữ thô tục hay lăng mạ.',
      appropriateness: 'Kiên quyết từ chối gian lận là hành vi hoàn toàn phù hợp quy định kiểm tra.'
    }
  },
  {
    id: 'TC10',
    scenarioId: 'refuse-cheating',
    scenarioTitle: 'Từ chối cho bạn chép bài trong giờ kiểm tra',
    partnerName: 'Tiến Đạt',
    partnerRole: 'Bạn ngồi cạnh trong phòng thi',
    contextDescription: 'Trong giờ kiểm tra 1 tiết môn Sử, bạn ngồi bàn kế bên loay hoay không làm được và liên tục huých tay thì thầm xin chép đáp án.',
    contextPrompt: 'Suỵt... Cậu làm xong câu 2 chưa? Đưa tớ chép câu đó với câu 3 với, tớ quên sạch rồi, không chép là tớ bị điểm liệt mất!',
    studentResponse: 'Ngu thì chết chứ bệnh tật gì, ai mượn không chịu học.',
    categoryDescription: 'Thiếu lịch sự, sỉ nhục miệt thị bạn khi từ chối',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Ý định từ chối và chê bai bạn rất rõ ràng.',
      politeness: 'Dùng từ ngữ miệt thị ("ngu", "chết"), xúc phạm nhân phẩm bạn nặng nề.',
      appropriateness: 'Có ý thức không cho chép bài nhưng cách giải quyết thô bạo, gây xích mích học đường.'
    }
  },
  {
    id: 'TC11',
    scenarioId: 'disagree-politely',
    scenarioTitle: 'Góp ý khi không đồng ý cách làm',
    partnerName: 'Quốc Bảo',
    partnerRole: 'Bạn cùng bàn làm báo tường 20/11',
    contextDescription: 'Bạn đề xuất tô kín toàn bộ nền báo tường bằng màu đỏ thẫm rồi viết chữ đen thật dày, em thấy làm vậy sẽ khiến người xem rất chói mắt.',
    contextPrompt: 'Tớ thấy tờ báo tường này cứ tô kín nền đỏ tươi rồi viết chữ thật dày đặc lên là nổi bật nhất khối luôn! Cậu thấy ý tưởng của tớ thế nào?',
    studentResponse: 'Ý tưởng của cậu xấu tệ hại, làm thế chẳng khác nào đống rác.',
    categoryDescription: 'Thiếu lịch sự: Xúc phạm sản phẩm của bạn, phá hỏng hợp tác',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 0
    },
    expectedReasons: {
      clarity: 'Quan điểm chê bai diễn đạt rõ ràng.',
      politeness: 'Dùng từ ngữ coi thường, thô thiển ("xấu tệ hại", "đống rác"), xúc phạm bạn.',
      appropriateness: 'Không mang tính xây dựng khi làm việc nhóm, phá vỡ mối quan hệ bạn bè.'
    }
  },
  {
    id: 'TC12',
    scenarioId: 'disagree-politely',
    scenarioTitle: 'Góp ý khi không đồng ý cách làm',
    partnerName: 'Quốc Bảo',
    partnerRole: 'Bạn cùng bàn làm báo tường 20/11',
    contextDescription: 'Bạn đề xuất tô kín toàn bộ nền báo tường bằng màu đỏ thẫm rồi viết chữ đen thật dày, em thấy làm vậy sẽ khiến người xem rất chói mắt.',
    contextPrompt: 'Tớ thấy tờ báo tường này cứ tô kín nền đỏ tươi rồi viết chữ thật dày đặc lên là nổi bật nhất khối luôn! Cậu thấy ý tưởng của tớ thế nào?',
    studentResponse: 'Tớ thấy nền đỏ thẫm sẽ hơi khó đọc chữ. Hay là tụi mình đổi sang nền sáng rồi viền đỏ xem sao?',
    categoryDescription: 'Góp ý chuẩn mực: Nêu lý do khách quan và đề xuất giải pháp thay thế',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Lập luận rành mạch, chỉ rõ điểm bất cập và hướng xử lý.',
      politeness: 'Cách diễn đạt tôn trọng, dùng từ ngữ góp ý nhẹ nhàng mang tính xây dựng.',
      appropriateness: 'Rất phù hợp mục tiêu hoàn thiện báo tường đẹp và dễ đọc.'
    }
  },
  {
    id: 'TC13',
    scenarioId: 'disagree-politely',
    scenarioTitle: 'Góp ý khi không đồng ý cách làm',
    partnerName: 'Quốc Bảo',
    partnerRole: 'Bạn cùng bàn làm báo tường 20/11',
    contextDescription: 'Bạn đề xuất tô kín toàn bộ nền báo tường bằng màu đỏ thẫm rồi viết chữ đen thật dày, em thấy làm vậy sẽ khiến người xem rất chói mắt.',
    contextPrompt: 'Tớ thấy tờ báo tường này cứ tô kín nền đỏ tươi rồi viết chữ thật dày đặc lên là nổi bật nhất khối luôn! Cậu thấy ý tưởng của tớ thế nào?',
    studentResponse: 'Tớ không thích.',
    categoryDescription: 'Thiếu lý do và chưa giải quyết được vấn đề',
    expectedScores: {
      clarity: 1,
      politeness: 1,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Nêu được cảm xúc cá nhân nhưng chưa rõ lý do vì sao không thích.',
      politeness: 'Hơi cộc lốc, chưa thể hiện sự khéo léo khi đối thoại nhóm.',
      appropriateness: 'Chưa đóng góp được giải pháp hay phân tích nào để cùng bạn làm báo tường.'
    }
  },
  {
    id: 'TC14',
    scenarioId: 'group-work',
    scenarioTitle: 'Đề xuất ý tưởng thuyết trình nhóm',
    partnerName: 'Minh Thảo',
    partnerRole: 'Nhóm trưởng thảo luận',
    contextDescription: 'Nhóm đang thảo luận chọn đề tài cho bài thuyết trình môn Khoa học tuần tới và nhóm trưởng đang thăm dò ý kiến của các thành viên.',
    contextPrompt: 'Nhóm mình đang cần thêm ý tưởng sáng tạo cho bài thuyết trình tuần sau. Bạn có đề xuất hoặc sáng kiến nào muốn chia sẻ với cả nhóm không?',
    studentResponse: 'Tớ có ý tưởng này: nhóm mình có thể làm sơ đồ tư duy kết hợp đố vui đầu giờ để các bạn chú ý hơn!',
    categoryDescription: 'Đóng góp ý tưởng xuất sắc, gắn kết nhóm',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Ý tưởng rõ ràng, có cấu trúc đề xuất cụ thể.',
      politeness: 'Thái độ hào hứng, gắn kết với tập thể.',
      appropriateness: 'Trúng đích yêu cầu cần sáng kiến cho bài thuyết trình khoa học.'
    }
  },
  {
    id: 'TC15',
    scenarioId: 'group-work',
    scenarioTitle: 'Đề xuất ý tưởng thuyết trình nhóm',
    partnerName: 'Minh Thảo',
    partnerRole: 'Nhóm trưởng thảo luận',
    contextDescription: 'Nhóm đang thảo luận chọn đề tài cho bài thuyết trình môn Khoa học tuần tới và nhóm trưởng đang thăm dò ý kiến của các thành viên.',
    contextPrompt: 'Nhóm mình đang cần thêm ý tưởng sáng tạo cho bài thuyết trình tuần sau. Bạn có đề xuất hoặc sáng kiến nào muốn chia sẻ với cả nhóm không?',
    studentResponse: 'Mọi người thích làm gì thì làm, tớ sao cũng được.',
    categoryDescription: 'Thiếu tinh thần xây dựng, né tránh đóng góp ý kiến',
    expectedScores: {
      clarity: 2,
      politeness: 1,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Ý định phó mặc diễn đạt rõ ràng.',
      politeness: 'Hơi bàng quan, thiếu nhiệt tình với nhóm bạn.',
      appropriateness: 'Chưa đáp ứng được lời kêu gọi đóng góp ý tưởng xây dựng bài học chung.'
    }
  },
  {
    id: 'TC16',
    scenarioId: 'remind-deadline',
    scenarioTitle: 'Nhắc nhở bạn nộp bài nhóm đúng hạn',
    partnerName: 'Hoàng Long',
    partnerRole: 'Thành viên phụ trách phần 2',
    contextDescription: 'Chỉ còn một ngày nữa là tới hạn nộp bài báo cáo của nhóm nhưng Long vẫn chưa gửi phần nội dung của bạn ấy cho nhóm trưởng.',
    contextPrompt: 'Ôi tớ bận quá nên chưa kịp gõ xong phần của tớ. Mai mới nộp bài mà, tối nay tớ thức làm vội cũng được chứ gì?',
    studentResponse: 'Long ơi, nhóm cần bài trước 8h tối nay để kịp sửa lỗi. Cậu ráng gửi đúng hạn giúp nhóm nhé, nếu kẹt phần nào cứ ới tụi mình!',
    categoryDescription: 'Nhắc nhở hạn nộp bài chuẩn mực: Rõ mốc giờ, lịch thiệp và sẵn sàng hỗ trợ',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Thời hạn 8h tối và lý do cần ghép bài nêu rất rõ ràng.',
      politeness: 'Lời nhắc chân thành, khích lệ và đề nghị tương trợ đồng đội.',
      appropriateness: 'Đảm bảo tiến độ làm việc nhóm mà không gây áp lực tiêu cực.'
    }
  },
  {
    id: 'TC17',
    scenarioId: 'remind-deadline',
    scenarioTitle: 'Nhắc nhở bạn nộp bài nhóm đúng hạn',
    partnerName: 'Hoàng Long',
    partnerRole: 'Thành viên phụ trách phần 2',
    contextDescription: 'Chỉ còn một ngày nữa là tới hạn nộp bài báo cáo của nhóm nhưng Long vẫn chưa gửi phần nội dung của bạn ấy cho nhóm trưởng.',
    contextPrompt: 'Ôi tớ bận quá nên chưa kịp gõ xong phần của tớ. Mai mới nộp bài mà, tối nay tớ thức làm vội cũng được chứ gì?',
    studentResponse: 'Không nộp thì tự đi mà chịu điểm 0, đồ vô trách nhiệm.',
    categoryDescription: 'Thiếu lịch sự: Chỉ trích gay gắt, xúc phạm thành viên nhóm',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Thông điệp cảnh báo điểm 0 rất rõ ràng.',
      politeness: 'Dùng lời lẽ công kích cá nhân ("đồ vô trách nhiệm"), thiếu tôn trọng.',
      appropriateness: 'Mục đích là giục nộp bài nhưng cách xử lý làm rạn nứt tinh thần đồng đội.'
    }
  },
  {
    id: 'TC18',
    scenarioId: 'refuse-politely',
    scenarioTitle: 'Từ chối lời rủ đi chơi để ôn bài và giúp mẹ',
    partnerName: 'Đức Anh',
    partnerRole: 'Bạn thân',
    contextDescription: 'Tan học, bạn rủ em đi đá bóng và ghé quán nước mía ngay, nhưng chiều nay em đã hứa phụ mẹ dọn nhà và có bài kiểm tra ngày mai.',
    contextPrompt: 'Chiều nay được về sớm, tụi mình đi đá bóng rồi ghé uống nước mía một lát đi! Lâu lắm mới có buổi rảnh rỗi, cậu đi cùng tớ nhé?',
    studentResponse: 'Cảm ơn Đức Anh nhé! Chiều nay tớ lỡ hẹn phụ mẹ dọn nhà và ôn bài rồi. Chiều thứ Bảy tụi mình đi bù nha!',
    categoryDescription: 'Từ chối khéo léo, nêu lý do chính đáng kèm lời hẹn thay thế',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Lời từ chối và lý do bận việc gia đình rất rành mạch.',
      politeness: 'Biết ơn lời rủ, xưng hô ấm áp và có thiện chí hẹn lại.',
      appropriateness: 'Giữ chữ tín với gia đình, có trách nhiệm học tập mà vẫn giữ được tình bạn.'
    }
  },
  {
    id: 'TC19',
    scenarioId: 'explain-forgotten-hw',
    scenarioTitle: 'Trình bày lý do để quên vở bài tập ở nhà',
    partnerName: 'Thầy Hùng',
    partnerRole: 'Giáo viên môn Ngữ Văn',
    contextDescription: 'Đầu giờ học, thầy gọi kiểm tra vở bài tập. Em đã làm bài đầy đủ tối qua nhưng sáng vội quá nên để quên trên bàn học ở nhà.',
    contextPrompt: 'Thầy kiểm tra đến bàn em rồi. Vở bài tập của em đã làm xong chưa, mang lên cho thầy xem nào?',
    studentResponse: 'Dạ thưa thầy, tối qua em làm bài đầy đủ rồi nhưng sáng nay vội quá em để quên vở ở nhà ạ. Em xin phép mai nộp bù cho thầy ạ.',
    categoryDescription: 'Lễ phép với thầy cô: Có kính ngữ dạ thưa, thành thật nhận lỗi',
    expectedScores: {
      clarity: 2,
      politeness: 2,
      appropriateness: 2
    },
    expectedReasons: {
      clarity: 'Trình bày sự việc và xin nộp bù rất rõ ràng, khúc chiết.',
      politeness: 'Kính cẩn, dùng đúng kính ngữ "Dạ thưa thầy", "ạ".',
      appropriateness: 'Thành thật nhận trách nhiệm và chủ động đề xuất giải pháp nộp bù hợp lý.'
    }
  },
  {
    id: 'TC20',
    scenarioId: 'explain-forgotten-hw',
    scenarioTitle: 'Trình bày lý do để quên vở bài tập ở nhà',
    partnerName: 'Thầy Hùng',
    partnerRole: 'Giáo viên môn Ngữ Văn',
    contextDescription: 'Đầu giờ học, thầy gọi kiểm tra vở bài tập. Em đã làm bài đầy đủ tối qua nhưng sáng vội quá nên để quên trên bàn học ở nhà.',
    contextPrompt: 'Thầy kiểm tra đến bàn em rồi. Vở bài tập của em đã làm xong chưa, mang lên cho thầy xem nào?',
    studentResponse: 'Quên ở nhà rồi.',
    categoryDescription: 'Nói trổng với thầy cô: Thiếu kính ngữ và thiếu lễ độ',
    expectedScores: {
      clarity: 2,
      politeness: 0,
      appropriateness: 1
    },
    expectedReasons: {
      clarity: 'Thông báo sự việc để quên vở rõ ràng.',
      politeness: 'Nói trổng, không có chủ vị, thiếu hoàn toàn kính ngữ với thầy giáo.',
      appropriateness: 'Báo cáo được lý do nhưng vi phạm tác phong ứng xử học sinh đối với giáo viên.'
    }
  }
];
