const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer'); //이미지 처리를 위한 multer
const fs = require('fs').promises;
const path = require('path'); // 파일 경로 추가
const { v4: uuidv4 } = require('uuid'); // UUID 생성 라이브러리

// 📌 Multer 설정 (이미지를 'uploads/' 폴더에 저장)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // 저장 경로
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase(); // 파일 확장자 추출 (.png, .jpg 등)
        const safeFilename = file.originalname.replace(/[^a-zA-Z0-9]/g, '_'); // 특수문자 제거
        const newFilename = `${uuidv4()}${ext}`; // UUID + 안전한 파일명
        cb(null, newFilename);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find({}).sort({createdAt:-1});
        res.render('admin_crud', { posts });
    } catch (err) {
        console.error("게시글 조회 오류:", err);
        res.status(500).send("서버 오류");
    }
});

// 📌 새 게시글 추가 (이미지 업로드 포함)
router.post('/api/posts', upload.array('images', 5), async (req, res) => {
    try {
        const { title, content } = req.body;
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`); // 파일 URL 생성

        const newPost = new Post({ title, content, images: imageUrls });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (err) {
        console.error("게시글 추가 오류:", err);
        res.status(500).json({ error: "서버 오류 발생" });
    }
});

// 📌 게시글 수정 API (PUT /api/posts/:id)
router.put("/api/posts/:id", upload.array("images", 5), async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, deletedImages } = req.body;

        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        let updatedImages = existingPost.images || [];

        // 📌 클라이언트에서 삭제된 이미지가 있다면, 파일 및 DB에서 제거
        if (deletedImages) {
            const imagesToDelete = JSON.parse(deletedImages); // 문자열을 배열로 변환
            updatedImages = updatedImages.filter(image => !imagesToDelete.includes(image));

            for (const image of imagesToDelete) {
                const filePath = path.join(__dirname, '..', 'public', image);
                try {
                    await fs.access(filePath); // 파일 존재 여부 확인
                    await fs.unlink(filePath); // 파일 삭제
                    console.log(`삭제된 파일: ${filePath}`);
                } catch (err) {
                    console.error(`파일 삭제 실패 (${filePath}):`, err.message);
                }
            }
        }

        // 📌 새로 업로드된 이미지 추가
        if (req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            updatedImages = [...updatedImages, ...newImages];
        }

        // 📌 MongoDB 업데이트
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, content, images: updatedImages },
            { new: true }
        );

        res.json({ message: "게시글이 수정되었습니다.", post: updatedPost });
    } catch (err) {
        console.error("게시글 수정 오류:", err);
        res.status(500).json({ error: "서버 오류 발생" });
    }
});

// 게시글 삭제 (DELETE /api/posts/:id)
router.delete('/api/posts/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        // 📌 업로드된 이미지 삭제 (파일과 DB에서 제거)
        if (deletedPost.images && Array.isArray(deletedPost.images)) {
            for (const imagePath of deletedPost.images) {
                const filePath = path.join(__dirname, '..', 'public', imagePath);

                console.log(`📁 삭제 시도 파일 경로: ${filePath}`);

                try {
                    await fs.access(filePath); // 파일이 존재하는지 확인
                    await fs.unlink(filePath); // 파일 삭제
                    console.log(`✅ 삭제된 파일: ${filePath}`);
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        console.warn(`⚠️ 파일이 이미 존재하지 않음: ${filePath}`);
                    } else {
                        console.error(`❌ 파일 삭제 실패 (${filePath}):`, err.message);
                    }
                }
            }
        }

        res.json({ message: "게시글과 관련된 이미지가 삭제되었습니다." });
    } catch (err) {
        console.error("게시글 삭제 오류:", err);
        res.status(500).json({ error: "서버 오류 발생" });
    }
});

module.exports = router;
