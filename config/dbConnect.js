const mongoose = require('mongoose');
require('dotenv').config(); // .env 파일 로드

async function dbConnect() {
    try {
        // 환경 변수에서 MongoDB URI, 사용자명, 비밀번호 가져오기
        const uri = process.env.MONGO_URI
            .replace('<DB_USER>', process.env.DB_USER)
            .replace('<DB_PASS>', encodeURIComponent(process.env.DB_PASS)); // 비밀번호 특수문자 처리

        await mongoose.connect(uri);

        console.log('Successfully connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

module.exports = dbConnect;
