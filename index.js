import express, { json } from "express";
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
dotenv.config();
import Joi from "joi";

let users = [];

const app = express();
app.use(json());
app.use(cors());

app.post('/sign-up', (req, res) => {
    const { body } = req;
    console.log(body);
    const senhaCriptografada = bcrypt.hashSync(body.senha, 10);
    console.log(senhaCriptografada);
    users.push({'name': body.nome, email: body.email, senhaCrypt: senhaCriptografada});
    res.sendStatus(201);
})

app.post('/login', (req, res) => {
    const { body } = req;
    if(users.some((el) => bcrypt.compareSync(body.senha, el.senhaCrypt) && el.email == body.email)){
        res.sendStatus(200);
    }else res.status(401).send('senha incorreta');
})
let entrada = [];
app.post('/entrada', (req, res) => {
    const { body } = req;
    if(body.valor){
        entrada.push(body);
        res.sendStatus(200);
    }else res.sendStatus(400);
})
let saida = [];
app.post('/saida', (req, res) => {
    const { body } = req;
    if(body.valor){
        saida.push(body);
        res.sendStatus(200);
    }else res.sendStatus(400);
})

app.put('/entrada', (req, res) => {
    const { body, headers } = req;
    if(entrada.some((el) => headers == el)){
        //substiutui por body
        res.sendStatus(200);
    }else res.sendStatus(400);
})

app.put('/saida', (req, res) => {
    const { body, headers } = req;
    if(saida.some((el) => headers == el)){
        //substiutui por body
        res.sendStatus(200);
    }else res.sendStatus(400);
})

// app.get()

app.listen(5000, () => {
    console.log("server on");
})