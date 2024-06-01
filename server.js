import express from 'express';
import { PrismaClient } from '@prisma/client';
const cors = require('cors');

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/colaboradores', async (req, res) => {
    try {
        await prisma.user.create({
            data: {
                username: req.body.username,
                password: req.body.password
            }
        });

        res.status(201).json(req.body);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar o colaborador.' });
    }
});

app.get('/colaboradores', async (req, res) => {
    try {
        let users = [];

        if (req.query.username && req.query.password) {
            users = await prisma.user.findMany({
                where: {
                    username: req.query.username.toString(),
                    password: req.query.password.toString()
                }
            });
        } else {
            users = await prisma.user.findMany();
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar os colaboradores.' });
    }
});

app.put('/colaboradores/:id', async (req, res) => {
    try {
        await prisma.user.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                username: req.body.username,
                password: req.body.password
            }
        });

        res.status(201).json(req.body);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o colaborador.' });
    }
});

app.delete('/colaboradores/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        res.status(200).json({ message: 'Colaborador deletado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar o colaborador.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
