const express = require('express');
const Order = require('../models/order');
const router = express.Router();

// **POST 요청: 새로운 주문 생성** 📌8080포트에서 필요
router.post('/api/order', async (req, res) => {
    try {
        const newOrder = new Order(req.body); // 요청 데이터로 Order 생성
        await newOrder.save(); // MongoDB에 저장
        console.log("주문요청 생성됨")
        res.status(201).json({ message: '✅ Order created successfully', data: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; // 모듈 내보내기
