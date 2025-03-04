document.addEventListener('DOMContentLoaded', function () {
    // ✅ Quill 에디터 초기화 함수
    function initializeQuill(editorId) {
      return new Quill(editorId, {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link', 'image', 'video', 'code-block', 'blockquote'],
            [{ font: [] }],
            [{ size: [] }],
            [{ color: [] }, { background: [] }],
            ['clean'],
          ],
        },
      });
    }
  
    // ✅ Quill 에디터 초기화
    var quill = initializeQuill('#editor');
    var editQuill = initializeQuill('#editEditor');
  
    // 📌 게시글 작성 (Create)
    var newPostForm = document.getElementById('newPostForm');
    if (newPostForm) {
      newPostForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.getElementById('newPostContent').value = quill.root.innerHTML;
        var formData = new FormData(newPostForm);
        $.ajax({
          url: '/api/posts',
          method: 'POST',
          processData: false,
          contentType: false,
          data: formData,
          success: function () {
            alert('게시글이 추가되었습니다.');
            location.reload();
          },
          error: function (error) {
            console.log('게시글 추가 오류', error);
            alert('게시글 추가에 실패했습니다.');
          },
        });
      });
    }
  
    // 📌 게시글 수정 (Update)
    document.addEventListener('click', function (event) {
      let button = event.target.closest("[data-bs-target='#editModal']");
      if (button) {
        let postId = button.getAttribute('data-id');
        let postTitle = button.getAttribute('data-title');
        let postSource = button.getAttribute('data-source');
        let postContent = button.getAttribute('data-content');
        let attachments = JSON.parse(
          button.getAttribute('data-attachments') || '[]'
        );
  
        console.log('수정 모달 열기 - 첨부 파일 목록:', attachments);
  
        document.getElementById('postId').value = postId;
        document.getElementById('postTitle').value = postTitle;
        document.getElementById('postSource').value = postSource;
        editQuill.root.innerHTML = '';
        editQuill.clipboard.dangerouslyPasteHTML(postContent);
  
        let editAttachmentsContainer = document.getElementById(
          'editAttachmentsContainer'
        );
        editAttachmentsContainer.innerHTML = '';
  
        if (attachments.length > 0) {
          attachments.forEach((fileUrl) => {
            let fileName = fileUrl.split('/').pop();
            editAttachmentsContainer.innerHTML += `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                  <a href="${fileUrl}" target="_blank" download class="text-decoration-none">${fileName}</a>
              </li>
            `;
          });
        } else {
          editAttachmentsContainer.innerHTML =
            "<p class='text-muted'>첨부된 파일이 없습니다.</p>";
        }
      }
    });
  
    // 📌 게시글 보기 (Read)
document.addEventListener('click', function (event) {
    let button = event.target.closest('.post-link');
    if (!button) return;

    let postTitle = button.getAttribute('data-title');
    let postContent = button.getAttribute('data-content');

    if (!postContent || postContent.trim() === '') {
        console.error('내용이 비어 있습니다');
        document.getElementById('viewPostContent').textContent = '표시할 내용이 없습니다.';
        return;
    }

    document.getElementById('viewPostTitle').textContent = postTitle;

    // 📌 날짜 표시
    document.getElementById('viewPostTime').textContent = `작성: ${createdAt} | 수정: ${updatedAt}`;

    // 📌 첨부 파일 표시
    let attachmentsContainer = document.getElementById('viewPostAttachments');
    attachmentsContainer.innerHTML = '';

    if (attachments.length > 0) {
        let fileList = "<h6>📎 첨부 파일</h6><ul class='list-group'>";
        attachments.forEach((file) => {
            let fileName = file.split('/').pop();
            fileList += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href="${file}" target="_blank" download class="text-decoration-none">${fileName}</a>
                </li>
            `;
        });
        fileList += '</ul>';
        attachmentsContainer.innerHTML = fileList;
    }
});

  
    // 📌 게시글 삭제 (Delete)
    window.confirmDelete = function (postId) {
      if (confirm('진짜 삭제하겠습니까?')) {
        $.ajax({
          url: '/api/posts/' + postId,
          method: 'DELETE',
          success: function () {
            alert('게시글이 삭제되었습니다.');
            location.reload();
          },
          error: function (error) {
            console.log('삭제 오류', error);
            alert('삭제에 실패했습니다.');
          },
        });
      }
    };
  });
  