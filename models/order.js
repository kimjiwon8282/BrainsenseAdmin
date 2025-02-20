const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    companyName: { type: String, required: true }, // 회사 이름
    companyAddress: { type: String, required: true }, // 회사 주소
    companyEmail: { type: String, required: true }, // 회사 이메일
    companyPhone: { type: String, required: true }, // 회사 전화번호
    orderType: { 
        type: String, 
        enum: ['외주 문의', '기타 문의'], 
        required: true 
    }, // 외주 유형
    details: { type: String, required: true }, // 세부 문의 사항
    privacyConsent: { type: Boolean, required: true }, // 개인정보 수집 동의
    timestamp: { type: Date, default: Date.now }, // 생성 시간
    status: { 
        type: String, 
        enum: ['처리전','완료'], 
        default: '처리전' 
    } // 진행 상태
});

// Order 모델 생성
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;