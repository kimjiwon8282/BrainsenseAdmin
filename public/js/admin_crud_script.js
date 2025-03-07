document.addEventListener('DOMContentLoaded', function () {
  // ✅ Quill 에디터 초기화 함수
  function initializeQuill(editorId) {
    var quill = new Quill(editorId, {
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

    // 📌 MutationObserver 적용: DOM 변경 감지
    let observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          console.log('Quill content changed.');
        }
      });
    });

    observer.observe(quill.root, {
      childList: true, // 자식 노드 변경 감지
      subtree: true, // 하위 트리까지 감지
    });

    return quill;
  }

  // ✅ Quill 에디터 초기화 (게시글 작성)
  var quill = initializeQuill('#editor');

  // ✅ Quill 에디터 초기화 (게시글 수정)
  var editQuill = initializeQuill('#editEditor');

  // 📌 게시글 작성 (Create)
  var newPostForm = document.getElementById('newPostForm');
  var newPostAttachments = document.getElementById('newPostAttachments');
  var newAttachmentPreview = document.getElementById('newAttachmentPreview');

  if (newPostAttachments) {
    newPostAttachments.addEventListener('change', function () {
      newAttachmentPreview.innerHTML = '';
      let fileList = "<h6>📎 업로드된 파일 목록</h6><ul class='list-group'>";

      Array.from(newPostAttachments.files).forEach((file) => {
        fileList += `
                    <li class="list-group-item">${file.name}</li>
                `;
      });

      fileList += '</ul>';
      newAttachmentPreview.innerHTML = fileList;
    });
  }

  if (newPostForm) {
    newPostForm.addEventListener('submit', function (event) {
      event.preventDefault();
      document.getElementById('newPostContent').value = quill.root.innerHTML;
      var formData = new FormData(newPostForm);

      console.log('전송할 formData : ', [...formData.entries()]);

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
          console.log('게시글 추가 오류', error.responseJSON);
          if (error.responseJSON && error.responseJSON.error) {
            alert('오류 : ' + error.responseJSON.error);
          } else {
            alert('게시글 추가에 실패했습니다.');
          }
        },
      });
    });
  }

  // 📌 게시글 수정 (Update)
  let editModal = document.getElementById('editModal');
  let deletedAttachments = []; // 삭제된 파일 목록 저장

  if (editModal) {
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

        console.log('받아온 첨부 파일 목록:', attachments); // 🛠 확인용 로그

        document.getElementById('postId').value = postId;
        document.getElementById('postTitle').value = postTitle;
        document.getElementById('postSource').value = postSource;
        editQuill.root.innerHTML = '';
        editQuill.clipboard.dangerouslyPasteHTML(postContent);

        deletedAttachments = [];

        // 📌 기존 첨부 파일(이미지 + 문서) 미리보기 추가
        let editAttachmentsContainer = document.getElementById(
          'editAttachmentsContainer'
        );
        editAttachmentsContainer.innerHTML = '';

        if (attachments.length > 0) {
          attachments.forEach((file) => {
            editAttachmentsContainer.innerHTML += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <a href="${
                                  file.safeName
                                }" target="_blank" download class="text-decoration-none">${
              file.originalName
            }</a>
                                <button class="btn btn-sm btn-danger remove-attachment" data-file="${JSON.stringify(
                                  file
                                )}">
                                    삭제
                                </button>
                            </li>
                        `;
          });
          editAttachmentsContainer.innerHTML += '</ul>';
        } else {
          editAttachmentsContainer.innerHTML =
            "<p class='text-muted'>첨부된 파일이 없습니다.</p>";
        }
      }
    });

    // 📌 동적 이벤트 위임 (기존 파일 삭제 버튼 동작)
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('remove-attachment')) {
        let fileData = JSON.parse(event.target.getAttribute('data-file'));
        deletedAttachments.push(fileData);
        event.target.parentElement.remove(); // 리스트에서 제거
      }
    });

    var editForm = document.getElementById('editForm');
    if (editForm) {
      editForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.getElementById('editPostContent').value =
          editQuill.root.innerHTML;

        let postId = document.getElementById('postId').value;
        let formData = new FormData(editForm);
        formData.append(
          'deletedAttachments',
          JSON.stringify(deletedAttachments)
        );

        $.ajax({
          url: '/api/posts/' + postId,
          method: 'PUT',
          processData: false,
          contentType: false,
          data: formData,
          success: function () {
            alert('게시글이 수정되었습니다.');
            location.reload();
          },
          error: function (error) {
            console.log('수정 오류', error);
            alert('수정에 실패했습니다.');
          },
        });
      });
    }
  }

  // 📌 새 파일 선택 시 업로드한 파일 목록 표시
  var editPostAttachments = document.getElementById('editPostAttachments');
  var attachmentPreview = document.getElementById('attachmentPreview');

  if (editPostAttachments) {
    editPostAttachments.addEventListener('change', function () {
      attachmentPreview.innerHTML = '';
      let fileList = "<h6>📎 업로드된 파일 목록</h6><ul class='list-group'>";

      Array.from(editPostAttachments.files).forEach((file) => {
        fileList += `
                    <li class="list-group-item">${file.name}</li>
                `;
      });

      fileList += '</ul>';
      attachmentPreview.innerHTML = fileList;
    });
  }

  // 📌 게시글 보기 (Read)
  var viewPostModal = document.getElementById('viewPostModal');
  if (viewPostModal) {
    document.addEventListener('click', function (event) {
      let button = event.target.closest("[data-bs-target='#viewPostModal']");
      if (button) {
        let postTitle = button.getAttribute('data-title');
        let postSource = button.getAttribute('data-source');
        let postContent = button.getAttribute('data-content');
        let attachments = JSON.parse(
          button.getAttribute('data-attachments') || '[]'
        );

        let createdAt = button.getAttribute('data-created-at');
        let updatedAt = button.getAttribute('data-updated-at');

        document.getElementById('viewPostTitle').textContent = postTitle;
        // document.getElementById("viewPostContent").innerHTML = postContent;
        // 📌 Quill 스타일 적용 (기존 내용에 ql-editor 클래스를 추가)
        document.getElementById(
          'viewPostContent'
        ).innerHTML = `<div class="ql-editor">${postContent}</div>`;
        document.getElementById('viewPostSource').textContent = postSource;

        // 📌 날짜 포맷 변경 (YYYY-MM-DD HH:mm:ss 형식)
        function formatDate(dateString) {
          let date = new Date(dateString);
          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }

        // 📌 생성시간 및 수정시간 표시
        let timeDisplay = `작성: ${formatDate(createdAt)}`;
        if (updatedAt && createdAt !== updatedAt) {
          timeDisplay += ` | 수정: ${formatDate(updatedAt)}`;
        }
        document.getElementById('viewPostTime').textContent = timeDisplay;

        let attachmentsContainer = document.getElementById(
          'viewPostAttachments'
        );
        attachmentsContainer.innerHTML = '';

        if (attachments.length > 0) {
          let fileList = "<h6>📎 첨부 파일</h6><ul class='list-group'>";
          attachments.forEach((file) => {
            fileList += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <a href="${file.safeName}" target="_blank" download class="text-decoration-none">${file.originalName}</a>
                                <button class="btn btn-sm btn-primary download-btn" data-file="${file.safeName}" data-filename="${file.originalName}">
                                    다운로드
                                </button>
                            </li>
                        `;
          });
          fileList += '</ul>';
          attachmentsContainer.innerHTML = fileList;

          document.querySelectorAll('.download-btn').forEach((btn) => {
            btn.addEventListener('click', function () {
              let fileUrl = this.getAttribute('data-file');
              let fileName = this.getAttribute('data-filename');

              let a = document.createElement('a');
              a.href = fileUrl;
              a.setAttribute('download', fileName);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
          });
        }
      }
    });
  }
});

// 📌 게시글 삭제 (Delete)
function confirmDelete(postId) {
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
}
