function validateFileSize(input){
    const maxFileSize = 5 * 1024 * 1024;
    const maxFileCount = 5;
    const files = input.files;

    if(files.length > maxFileCount){
        alert(`최대 ${maxFileCount}개까지 파일을 업로드 할 수 있습니다.`);
        input.value = "";
        return;
    }

    for(let i = 0; i < files.length; i++){
        if(files[i].size > maxFileSize){
            alert(`${files[i].name} 파일의 크기가 5MB를 초과합니다.`);
            input.value = "";
            return ;
        }
    }

}
