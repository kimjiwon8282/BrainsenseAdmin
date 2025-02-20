const express = require('express');
const Order = require('../models/order');

const router = express.Router();

// **GET 요청: 모든 주문 조회** 📌8081포트에서 필요
router.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ timestamp: -1 });

        res.render('admin_order_list',{orders:orders});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 주문 상태 업데이트
router.put('/api/order/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
        }

        res.json({ success: true, message: '주문 상태가 업데이트되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router; // 모듈 내보내기

