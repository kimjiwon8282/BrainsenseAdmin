const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.render('admin_crud', { posts });
    } catch (err) {
        console.error("게시글 조회 오류:", err);
        res.status(500).send("서버 오류");
    }
});

// 게시글 수정 API (POST /api/posts/:id)
router.put('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        console.log(postId);
        const { title, content } = req.body;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, content },
            { new: true } // 업데이트된 문서를 반환
        );

        if (!updatedPost) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 수정되었습니다.", post: updatedPost });
    } catch (err) {
        console.error("게시글 수정 중 오류 발생:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});

module.exports = router;
