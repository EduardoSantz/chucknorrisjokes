require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: [
    process.env.FRONTEND_PROD_URL,
    process.env.FRONTEND_DEV_URL
  ],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Rotas
app.get('/favorites', async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/favorites', async (req, res) => {
  try {
    const { id, text, image } = req.body;
    
    if (!id || !text) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const existing = await prisma.favorite.findUnique({ where: { id } });
    if (existing) return res.status(409).json({ error: 'Piada já existe' });

    const favorite = await prisma.favorite.create({
      data: { id, text, image }
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Falha ao salvar favorito' });
  }
});

app.delete('/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.favorite.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Não encontrado' });
    }
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo quebrou! Chuck Norris já foi avisado...' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});