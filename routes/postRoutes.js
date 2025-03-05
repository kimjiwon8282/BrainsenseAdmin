const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 📌 클라이언트 프로젝트 폴더 경로
const CLIENT_UPLOAD_PATH =
  '/Users/jeongda-eun/Desktop/brainsenseWeb-client_daeun/public/uploads';

// 📌 Multer 설정 (파일을 'uploads/' 폴더에 저장)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // 저장 경로
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase(); // 확장자 추출
    const newFilename = `${Date.now()}${ext}`; // UUID + 안전한 파일명
    cb(null, newFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 📌 파일을 클라이언트 폴더에도 복사하는 함수
async function copyToClientFolder(files) {
  try {
      await fs.access(CLIENT_UPLOAD_PATH);
  } catch (err) {
      console.warn(`📂 클라이언트 폴더가 없어서 생성 중: ${CLIENT_UPLOAD_PATH}`);
      await fs.mkdir(CLIENT_UPLOAD_PATH, { recursive: true });
  }

  for (const file of files) {
      const sourcePath = path.join('public/uploads', file.filename);
      const destPath = path.join(CLIENT_UPLOAD_PATH, file.filename);

      try {
          await fs.copyFile(sourcePath, destPath);
          console.log(`✅ 파일 복사 완료: ${destPath}`);
      } catch (err) {
          console.error(`❌ 파일 복사 실패: ${destPath}`, err.message);
      }
  }
}


// 📌 게시글 조회 (GET /api/posts)
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.render('admin_crud', { posts });
  } catch (err) {
    console.error('게시글 조회 오류:', err);
    res.status(500).send('서버 오류');
  }
});

// 📌 새 게시글 추가 (파일 업로드 포함)
router.post('/api/posts', upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, content, source } = req.body;
    const files = req.files || [];
    // 📌 업로드 개수 확인
    if (files.length > 5) {
      return res
        .status(400)
        .json({ error: '최대 업로드 파일 수(5개)를 초과했습니다.' });
    }

    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`); // 파일 URL 생성

    // 📌 클라이언트 폴더에도 복사 실행
    await copyToClientFolder(files);

    const newPost = new Post({ title, source, content, attachments: fileUrls });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('게시글 추가 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 📌 클라이언트 프로젝트에서도 파일 삭제
async function deleteFromClientFolder(filePaths) {
  for (const file of filePaths) {
    const clientFilePath = path.join(CLIENT_UPLOAD_PATH, path.basename(file));
    try {
      await fs.access(clientFilePath);
      await fs.unlink(clientFilePath);
      console.log(`✅ 클라이언트 파일 삭제 완료: ${clientFilePath}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`⚠️ 클라이언트 폴더에 파일 없음: ${clientFilePath}`);
      } else {
        console.error(
          `❌ 클라이언트 파일 삭제 실패: ${clientFilePath}`,
          err.message
        );
      }
    }
  }
}

// 📌 게시글 수정 API (PUT /api/posts/:id)
router.put(
  '/api/posts/:id',
  upload.array('attachments', 5),
  async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, source, content, deletedAttachments } = req.body;

      const existingPost = await Post.findById(postId);
      if (!existingPost) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      }

      let updatedAttachments = existingPost.attachments || [];

      // 📌 삭제 요청된 파일 제거 (서버 & 클라이언트)
      if (deletedAttachments) {
        const filesToDelete = JSON.parse(deletedAttachments);
        updatedAttachments = updatedAttachments.filter(
          (file) => !filesToDelete.includes(file)
        );

        for (const file of filesToDelete) {
          const filePath = path.join(__dirname, '..', 'public', file);
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`✅ 서버에서 삭제된 파일: ${filePath}`);
          } catch (err) {
            console.error(`❌ 서버 파일 삭제 실패: ${filePath}`, err.message);
          }
        }

        // 📌 클라이언트 폴더에서도 삭제 실행
        await deleteFromClientFolder(filesToDelete);
      }

      // 📌 업로드 가능한 파일 개수 확인
      const remainFiles = 5 - updatedAttachments.length;
      if (req.files.length > remainFiles) {
        // 초과 파일을 삭제하여 저장되지 않도록 처리
        for (let i = remainFiles; i < req.files.length; i++) {
          const filePath = path.join(
            __dirname,
            '..',
            'public/uploads',
            req.files[i].filename
          );
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`⚠️ 초과 파일 삭제됨: ${filePath}`);
          } catch (err) {
            console.error(`❌ 초과 파일 삭제 실패 (${filePath}):`, err.message);
          }
        }
        return res
          .status(400)
          .json({ error: '최대 업로드 파일 수(5개)를 초과했습니다.' });
      }

      // 📌 새 파일 추가
      if (req.files.length > 0) {
        const newAttachments = req.files.map(
          (file) => `/uploads/${file.filename}`
        );
        updatedAttachments = [...updatedAttachments, ...newAttachments];
        // 📌 클라이언트 폴더에도 복사
        await copyToClientFolder(req.files);
      }

      // 📌 MongoDB 업데이트
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, source, content, attachments: updatedAttachments },
        { new: true }
      );

      res.json({ message: '게시글이 수정되었습니다.', post: updatedPost });
    } catch (err) {
      console.error('게시글 수정 오류:', err);
      res.status(500).json({ error: '서버 오류 발생' });
    }
  }
);

// 📌 게시글 삭제 (DELETE /api/posts/:id)
router.delete('/api/posts/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 📌 첨부된 파일 삭제
    if (deletedPost.attachments && Array.isArray(deletedPost.attachments)) {
      for (const filePath of deletedPost.attachments) {
        const fullPath = path.join(__dirname, '..', 'public', filePath);
        console.log(`📁 삭제 시도 파일 경로: ${fullPath}`);

        try {
          await fs.access(fullPath);
          await fs.unlink(fullPath);
          console.log(`✅ 삭제된 파일: ${fullPath}`);
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.warn(`⚠️ 파일이 이미 존재하지 않음: ${fullPath}`);
          } else {
            console.error(`❌ 파일 삭제 실패 (${fullPath}):`, err.message);
          }
        }
      }
      await deleteFromClientFolder(deletedPost.attachments);
    }

    res.json({ message: '게시글과 관련된 첨부 파일이 삭제되었습니다.' });
  } catch (err) {
    console.error('게시글 삭제 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

module.exports = router;
