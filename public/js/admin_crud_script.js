document.addEventListener("DOMContentLoaded", function() {
    //console.log("admin_crud_script.js 로드됨");

    // 📌 게시글 작성 (Create)
    var newPostForm = document.getElementById("newPostForm");
    if (newPostForm) {
        newPostForm.addEventListener("submit", function(event) {
            event.preventDefault();
            var formData = new FormData(newPostForm); // FormData 사용

            $.ajax({
                url: "/api/posts",
                method: "POST",
                processData: false,
                contentType: false,
                data: formData,
                success: function(response) {
                    alert("게시글이 추가되었습니다.");
                    location.reload();
                },
                error: function(error) {
                    console.log("게시글 추가 오류", error);
                    alert("게시글 추가에 실패했습니다.");
                }
            });
        });
    }

    let deletedImages = []; // 삭제된 이미지 목록을 저장할 배열

    // 📌 게시글 수정 (Update)
    let editModal = document.getElementById("editModal");
    if (editModal) {
        document.addEventListener("click", function(event) {
            let button = event.target.closest("[data-bs-target='#editModal']");
            if (button) {
                let postId = button.getAttribute("data-id");
                let postTitle = button.getAttribute("data-title");
                let postContent = button.getAttribute("data-content");
                let images = JSON.parse(button.getAttribute("data-images"));

                document.getElementById("postId").value = postId;
                document.getElementById("postTitle").value = postTitle;
                document.getElementById("postContent").value = postContent;

                deletedImages = []; // 초기화

                // 기존 이미지 미리보기 추가
                let currentImagesContainer = document.getElementById("currentImagesContainer");
                currentImagesContainer.innerHTML = "";

                if (images.length > 0) {
                    images.forEach((imgUrl) => {
                        let imgWrapper = document.createElement("div");
                        imgWrapper.classList.add("d-inline-block", "m-1", "position-relative");

                        let imgElement = document.createElement("img");
                        imgElement.src = imgUrl;
                        imgElement.classList.add("img-thumbnail");
                        imgElement.style.width = "100px";

                        let deleteButton = document.createElement("button");
                        deleteButton.innerHTML = "❌";
                        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "position-absolute", "top-0", "end-0");
                        deleteButton.addEventListener("click", function() {
                            deletedImages.push(imgUrl); // 삭제된 이미지 리스트에 추가
                            imgWrapper.remove(); // 이미지 삭제
                        });

                        imgWrapper.appendChild(imgElement);
                        imgWrapper.appendChild(deleteButton);
                        currentImagesContainer.appendChild(imgWrapper);
                    });
                }
            }
        });

        var editForm = document.getElementById("editForm");
        if (editForm) {
            editForm.addEventListener("submit", function(event) {
                event.preventDefault();
                
                let postId = document.getElementById("postId").value;
                let formData = new FormData();

                // 제목과 내용 추가
                formData.append("title", document.getElementById("postTitle").value);
                formData.append("content", document.getElementById("postContent").value);

                // 삭제된 이미지 리스트 추가
                formData.append("deletedImages", JSON.stringify(deletedImages));

                // 새 이미지 추가
                let editPostImages = document.getElementById("editPostImages").files;
                for (let i = 0; i < editPostImages.length; i++) {
                    formData.append("images", editPostImages[i]);
                }

                $.ajax({
                    url: "/api/posts/" + postId,
                    method: "PUT",
                    processData: false,
                    contentType: false,
                    data: formData,
                    success: function(response) {
                        alert("게시글이 수정되었습니다.");
                        location.reload();
                    },
                    error: function(error) {
                        console.log("수정 오류", error);
                        alert("수정에 실패했습니다.");
                    }
                });
            });
        }
    }
});

    // 📌 게시글 보기 (Read)
    var viewPostModal = document.getElementById("viewPostModal");
    if (viewPostModal) {
        document.addEventListener("click", function (event) {
            let button = event.target.closest("[data-bs-target='#viewPostModal']");
            if (button) {
                let postTitle = button.getAttribute("data-title");
                let postContent = button.getAttribute("data-content");
                let images = JSON.parse(button.getAttribute("data-images"));
    
                document.getElementById("viewPostTitle").textContent = postTitle;
                document.getElementById("viewPostContent").textContent = postContent;
    
                let carouselInner = document.getElementById("viewPostImages");
                carouselInner.innerHTML = "";
    
                if (images.length > 0) {
                    images.forEach((imgUrl, index) => {
                        let activeClass = index === 0 ? "active" : "";
                        carouselInner.innerHTML += `
                            <div class="carousel-item ${activeClass}">
                                <div class="image-container">
                                    <img src="${imgUrl}" class="d-block" alt="게시글 이미지">
                                </div>
                            </div>
                        `;
                    });
                } else {
                    // 이미지가 없을 때 기본 회색 배경과 "이미지 없음" 표시
                    carouselInner.innerHTML = `
                        <div class="carousel-item active">
                            <div class="image-container">
                                <div class="image-placeholder">이미지 없음</div>
                            </div>
                        </div>
                    `;
                }
            }
        });
    }

    // 📌 새 이미지 선택 시 미리보기 기능
    var editPostImages = document.getElementById("editPostImages");
    var imagePreview = document.getElementById("imagePreview");

    if (editPostImages) {
        editPostImages.addEventListener("change", function () {
            imagePreview.innerHTML = "";
            Array.from(editPostImages.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imgElement = document.createElement("img");
                    imgElement.src = e.target.result;
                    imgElement.classList.add("img-thumbnail", "m-1");
                    imgElement.style.width = "100px";
                    imagePreview.appendChild(imgElement);
                };
                reader.readAsDataURL(file);
            });
        });
    }

// 📌 게시글 삭제 (Delete)
function confirmDelete(postId) {
    if (confirm("진짜 삭제하겠습니까?")) {
        $.ajax({
            url: "/api/posts/" + postId,
            method: "DELETE",
            success: function(response) {
                alert("게시글이 삭제되었습니다.");
                location.reload();
            },
            error: function(error) {
                console.log("삭제 오류", error);
                alert("삭제에 실패했습니다.");
            }
        });
    }
}
