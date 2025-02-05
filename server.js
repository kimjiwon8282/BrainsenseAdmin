const express = require('express')
const app = express();
const port = 8080

app.listen(port, () => {
    console.log(`main server listening on port ${port}`)
});

app.get("/",(req,res)=>{
    res.send('사용자 메인페이지')
});
