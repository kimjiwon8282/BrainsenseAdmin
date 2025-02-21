const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true }, // 성명,이름
  companyName: { type: String, required: true }, // 소속 및 직급
  companyPhone: { type: String, required: true }, // 회사 전화번호
  companyEmail: { type: String, required: true }, // 회사 이메일
  orderType: {
    type: String,
    enum: ['제품 및 서비스', '외주', '협력 및 제안','기타'],
    required: true,
  }, // 외주 유형
  details: { type: String, required: true }, // 세부 문의 사항
  attachments: { type: [String], required: false }, // ✅ timestamps 추가
  privacyConsent: { type: Boolean, required: true }, // 개인정보 수집 동의
  timestamp: { type: Date, default: Date.now }, // 생성 시간
  status: {
    type: String,
    enum: ['처리전', '완료'],
    default: '처리전',
  }, // 진행 상태
});

// Order 모델 생성
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
