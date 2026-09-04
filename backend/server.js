import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
  res.json({ message: 'Бэкенд успешно подключен!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});