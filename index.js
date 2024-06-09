import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000

const JWT_SECRET = 'admin';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        req.user = user;
        next();
    });
};

app.post('/colaborador', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar o colaborador pelo username no banco de dados
        const colaborador = await prisma.colaborador.findUnique({
            where: {
                username
            }
        });

        // Verificar se o colaborador existe
        if (!colaborador) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        // Verificar se a senha está correta
        if (password !== colaborador.password) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        // Se chegou até aqui, o usuário está autenticado com sucesso
        res.status(200).json({ message: 'Autenticação bem-sucedida.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao autenticar o usuário.' });
    }
});


app.post('/colaboradores', async (req, res) => {
    try {
        const { username, name, telefone, email } = req.body;

        // Gerar senha simples com 8 caracteres
        const password = generateSimplePassword();

        // Criar novo colaborador com senha simples
        const newColaborador = await prisma.colaborador.create({
            data: {
                username,
                password, // Armazenar senha simples sem criptografia
                name,
                telefone,
                email
            },
        });

        res.status(201).json(newColaborador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar colaborador.' });
    }
});

const generateSimplePassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
};




// Rota para listar todos os colaboradores
app.get('/colaboradores', async (req, res) => {
    try {
        const colaboradores = await prisma.colaborador.findMany();
        res.status(200).json(colaboradores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar colaboradores.' });
    }
});

// Rota para obter um colaborador pelo ID
app.get('/colaboradores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const colaborador = await prisma.colaborador.findUnique({
            where: { id: parseInt(id) },
        });

        if (!colaborador) {
            return res.status(404).json({ error: 'Colaborador não encontrado.' });
        }

        res.status(200).json(colaborador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter colaborador.' });
    }
});

// Rota para atualizar um colaborador pelo ID (autenticada)
app.put('/colaboradores/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, name, telefone, email } = req.body;

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const updatedColaborador = await prisma.colaborador.update({
            where: { id: parseInt(id) },
            data: {
                username,
                password: hashedPassword,
                name,
                telefone,
                email
            },
        });

        res.status(200).json(updatedColaborador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar colaborador.' });
    }
});

// Rota para deletar um colaborador pelo ID (autenticada)
app.delete('/colaboradores/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.colaborador.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar colaborador.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
