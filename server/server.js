require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Configuração CORS para produção
app.use(cors({
  origin: [
    'https://chucknorrisjokes-c05ntuf7n-eduardos-projects-c7046de4.vercel.app',
    'http://localhost:5500'
  ]
}));

app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.send('API Chuck Norris Jokes Online');
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
    
    const existingFavorite = await prisma.favorite.findUnique({ 
      where: { id } 
    });
    
    if (existingFavorite) {
      return res.status(409).json({ error: 'Piada já favoritada' });
    }

    const newFavorite = await prisma.favorite.create({
      data: { id, text, image }
    });
    
    res.status(201).json(newFavorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Falha ao salvar favorito' });
  }
});

app.delete('/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.favorite.delete({ 
      where: { id } 
    });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao excluir favorito' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});