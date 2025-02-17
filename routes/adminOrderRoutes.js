const express = require('express');
const Order = require('../models/order');

const router = express.Router();

// **GET 요청: 모든 주문 조회** 📌8081포트에서 필요
router.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find(); // MongoDB에서 모든 주문 조회

        res.render('admin_list');
        // res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; // 모듈 내보내기
