const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');

// Google Cloud Storage 설정
const GCLOUD_BUCKET = 'bucket-quickstart_brainsense-455803';
const GCLOUD_PROJECT_ID = 'brainsense-455803';
const GCLOUD_KEYFILE = path.join(__dirname, '..', 'brainsense-455803-dcda0e4146ff.json');

// GCS 클라이언트 생성
const storageClient = new Storage({
  projectId: GCLOUD_PROJECT_ID,
  keyFilename: GCLOUD_KEYFILE,
});

// multer 메모리 스토리지 사용 (로컬 저장 없음)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
    fieldSize: 10 * 1024 * 1024,
    fieldNameSize: 255,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("파일 이름이 없습니다."));
    }
    const allowedExtensions = /\.(png|jpg|jpeg|gif|webp|svg|pdf|docx)$/i;
    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error('허용되지 않는 파일 형식입니다.'));
    }
    cb(null, true);
  },
});

// GCS에 파일 업로드 함수 (news 폴더에 저장)
async function uploadFileToGCS(fileBuffer, filename) {
  const bucket = storageClient.bucket(GCLOUD_BUCKET);
  const destination = `news/${filename}`;
  const file = bucket.file(destination);
  await file.save(fileBuffer, {
    public: true,
    resumable: false,
  });
  return `https://storage.googleapis.com/${GCLOUD_BUCKET}/${destination}`;
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

router.post('/api/posts', upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, content, source } = req.body;
    let attachments = [];

    // 각 파일을 GCS에 업로드 후, 첨부파일 정보를 생성
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      // 원본 파일명을 올바른 인코딩(UTF-8)으로 디코딩합니다.
      const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const safeName = `${Date.now()}${ext}`; // 안전한 파일명 생성
      const cloudUrl = await uploadFileToGCS(file.buffer, safeName);
      attachments.push({
        originalName: decodedOriginalName, // 디코딩된 파일명 사용
        safeName: safeName,
        cloudPath: cloudUrl,
      });
    }

    const newPost = new Post({
      title,
      source,
      content,
      attachments,
    });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('게시글 추가 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 게시글 삭제 (DELETE /api/posts/:id)
router.delete('/api/posts/:id', async (req, res) => {
  try {
    // 1) DB에서 게시글 삭제
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 2) Google Cloud Storage의 news 폴더에서 첨부 파일 삭제
    if (deletedPost.attachments && Array.isArray(deletedPost.attachments)) {
      for (const attachment of deletedPost.attachments) {
        // DB에 저장된 safeName은 "17438308643074.pdf" 같은 형태라고 가정
        // GCS에는 "news/17438308643074.pdf" 로 저장되었으므로 아래와 같이 경로를 만듭니다.
        const fileName = path.basename(attachment.safeName); // 혹시 앞에 /uploads/ 등이 붙어 있으면 제거
        const gcsFilePath = `news/${fileName}`;

        try {
          await storageClient.bucket(GCLOUD_BUCKET).file(gcsFilePath).delete();
          console.log(`✅ GCS 파일 삭제 완료: ${gcsFilePath}`);
        } catch (err) {
          if (err.code === 404) {
            console.warn(`⚠️ GCS 파일이 이미 존재하지 않음: ${gcsFilePath}`);
          } else {
            console.error(`❌ GCS 파일 삭제 실패 (${gcsFilePath}):`, err.message);
          }
        }
      }
    }

    // 최종 응답
    res.json({ message: '게시글과 관련된 첨부 파일이 삭제되었습니다.' });
  } catch (err) {
    console.error('게시글 삭제 오류:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 📌 게시글 수정 API (PUT /api/posts/:id)
router.put('/api/posts/:id', upload.array('attachments', 5), async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, source, content, deletedAttachments } = req.body;

    // 기존 게시글 조회
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    let updatedAttachments = existingPost.attachments || [];

    // 삭제 요청된 첨부파일 처리
    if (deletedAttachments) {
      const filesToDelete = JSON.parse(deletedAttachments); // JSON 배열 형태로 전달됨
      // DB에서 삭제할 항목 제거
      updatedAttachments = updatedAttachments.filter(
        (file) => !filesToDelete.some((del) => del.safeName === file.safeName)
      );

      // GCS에서 파일 삭제
      for (const file of filesToDelete) {
        const fileName = path.basename(file.safeName); // 예: "1743835622331.jpg"
        const gcsFilePath = `news/${fileName}`;
        try {
          await storageClient.bucket(GCLOUD_BUCKET).file(gcsFilePath).delete();
          console.log(`✅ GCS 파일 삭제 완료: ${gcsFilePath}`);
        } catch (err) {
          if (err.code === 404) {
            console.warn(`⚠️ GCS 파일이 이미 존재하지 않음: ${gcsFilePath}`);
          } else {
            console.error(`❌ GCS 파일 삭제 실패 (${gcsFilePath}):`, err.message);
          }
        }
      }
    }

    // 최대 파일 개수 체크 (총 5개)
    const remainFiles = 5 - updatedAttachments.length;
    if (req.files.length > remainFiles) {
      return res
        .status(400)
        .json({ error: '최대 업로드 파일 수(5개)를 초과했습니다.' });
    }

    // 새 첨부파일 처리 (GCS에 업로드)
    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      // 파일명을 올바른 인코딩(UTF-8)으로 디코딩
      const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const safeName = `${Date.now()}${ext}`; // 안전한 파일명 생성
      const cloudUrl = await uploadFileToGCS(file.buffer, safeName);
      updatedAttachments.push({
        originalName: decodedOriginalName,
        safeName: safeName,
        cloudPath: cloudUrl,
      });
    }

    // DB 업데이트 (제목, 출처, 내용, 첨부파일 배열)
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
});


module.exports = router;
