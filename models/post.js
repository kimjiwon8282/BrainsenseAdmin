const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    source: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [
      {
        originalName: { type: String, required: true }, // 업로드 시 원래 파일명
        safeName: { type: String, required: true }, // 서버에 저장된 안전한 파일명
      },
    ],
  },
  { timestamps: true }
); // ✅ timestamps 추가

module.exports = mongoose.model('Post', postSchema);
