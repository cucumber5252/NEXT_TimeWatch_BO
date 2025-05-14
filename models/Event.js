import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
});

const EventSchema = new mongoose.Schema({
    eventId: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    img: { type: String, required: true },
    companies: [CompanySchema],
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// 복합 인덱스 설정: date + eventId 조합이 고유해야 함
EventSchema.index({ date: 1, eventId: 1 }, { unique: true });

// 날짜별로 조회하기 위한 인덱스
EventSchema.index({ date: 1 });

// mongoose.models는 이미 컴파일된 모델을 캐시하는 객체입니다.
// Next.js의 핫 리로딩으로 인해 모델이 여러 번 정의되는 것을 방지합니다.
export default mongoose.models.Event || mongoose.model('Event', EventSchema, 'events');
