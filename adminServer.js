const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.get('/main', (req, res) => {
    res.render('admin_main');
});

app.get('/admin_crud', (req, res) => {
    res.render('admin_crud');
});

app.get('/admin_list', (req, res) => {
    res.render('admin_list');
});

app.get('/admin_statistics', (req, res) => {
    res.render('admin_statistics');
});

app.get('/logout', (req, res) => {
    res.render('admin_login');
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
