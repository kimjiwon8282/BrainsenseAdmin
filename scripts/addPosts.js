require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

// 환경 변수에서 MongoDB URI, 사용자명, 비밀번호 가져오기
const uri = process.env.MONGO_URI
    .replace('<DB_USER>', process.env.DB_USER)
    .replace('<DB_PASS>', encodeURIComponent(process.env.DB_PASS)); // 비밀번호 특수문자 처리

mongoose.connect(uri)
    .then(async () => {
        console.log("MongoDB 연결 성공");

        // 기존 데이터 삭제 (테스트 데이터 중복 방지)
        await Post.deleteMany({});

        // 테스트 데이터 삽입
        const testPosts = [
            { title: "첫 번째 게시글", content: "이것은 첫 번째 게시글의 내용입니다." },
            { title: "두 번째 게시글", content: "이것은 두 번째 게시글의 내용입니다." },
            { title: "세 번째 게시글", content: "이것은 세 번째 게시글의 내용입니다." }
        ];

        await Post.insertMany(testPosts);
        console.log("테스트 게시글 추가 완료");

        mongoose.connection.close();
    })
    .catch(err => {
        console.error("MongoDB 연결 오류:", err);
        mongoose.connection.close();
    });
