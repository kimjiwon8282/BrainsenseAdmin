// 주문 상태 업데이트
function updateStatus(orderId) {
    const status = document.getElementById(`status-${orderId}`).value;

    fetch(`/api/order/status/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("상태가 성공적으로 업데이트되었습니다.");
        } else {
            alert("상태 업데이트에 실패했습니다.");
        }
    })
    .catch(error => {
        alert("상태 업데이트 중 오류 발생.");
        console.error(error);
    });
}

// 모달에 주문 상세 정보 채우기
$('#orderDetailsModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget); // 버튼에서 데이터 가져오기
    const customerName = button.data('customer-name');
    const companyName = button.data('company-name');
    const orderType = button.data('order-type');
    const details = button.data('details');
    const status = button.data('status');
    const companyEmail = button.data('email');
    const companyPhone = button.data('phone');
    const attachments = button.data('attachments'); // 배열

    // 모달의 요소에 데이터 설정
    $('#modalCustomerName').text(customerName);
    $('#modalCompanyName').text(companyName);
    $('#modalOrderType').text(orderType);
    $('#modalDetails').text(details);
    $('#modalCompanyEmail').text(companyEmail);
    $('#modalCompanyPhone').text(companyPhone);
    $('#modalStatus').text(status);

    // 첨부파일 처리: 파일 URL 리스트를 링크로 표시
    if (attachments && attachments.length > 0) {
        let attachmentsHtml = '<ul class="list-group">';
        attachments.forEach(function(file) {
            const fileName = file.split('/').pop();
            attachmentsHtml += `<li class="list-group-item"><a href="${file}" target="_blank">${fileName}</a></li>`;
        });
        attachmentsHtml += '</ul>';
        $('#modalAttachments').html(attachmentsHtml);
    } else {
        $('#modalAttachments').html('<p class="text-muted">첨부 파일이 없습니다.</p>');
    }
});
