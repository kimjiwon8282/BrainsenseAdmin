const express = require('express');
const app = express();
const port = 8081;

app.listen(port, () => {
    console.log(`Admin server listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('관리자 메인페이지');
});



