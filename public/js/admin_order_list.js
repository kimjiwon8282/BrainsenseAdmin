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
    const button = $(event.relatedTarget); // 버튼에서 데이터를 가져오기
    const companyName = button.data('company-name');
    const orderType = button.data('order-type');
    const details = button.data('details');
    const status = button.data('status');
    const companyEmail = button.data('email');
    const companyPhone = button.data('phone');

    // 모달의 요소에 데이터 설정
    $('#modalCompanyName').text(companyName);
    $('#modalOrderType').text(orderType);
    $('#modalDetails').text(details);
    $('#modalCompanyEmail').text(companyEmail);
    $('#modalCompanyPhone').text(companyPhone);
    $('#modalStatus').text(status);
});
