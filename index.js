import express, { json } from "express";
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { v4 as uuid } from 'uuid';
import Joi from "joi";
dotenv.config();

let users = [];
let sessions = [];

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

app.post('/sign-in', (req, res) => {
    const { body, headers } = req;
    if(users.some((el) => bcrypt.compareSync(body.senha, el.senhaCrypt) && el.email == body.email)){
        const token = uuid();
        sessions.push({'user': body.email, 'token': token});
        res.status(200).send(token);
    }else res.status(401).send('senha incorreta');
})
let entrada = [];
app.post('/move', (req, res) => {
    const { body, headers } = req;
    console.log(headers.token);
    if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
        entrada.push(body);
        res.sendStatus(200);
    }else res.sendStatus(401);
})

app.put('/move', (req, res) => {
    const { body, headers } = req;
    if(!sessions.some((el) => headers.user == el.user && headers.token == el.token)) 
        return res.sendStatus(404);
    if(entrada.some((el) => headers == el)){
        //substiutui por body
        res.sendStatus(200);
    }else res.sendStatus(400);
})

app.get('/move', (req, res) => {
    const { headers } = req;
    if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
        res.status(200).send(entrada);
    }else res.sendStatus(401);
})

app.listen(5000, () => {
    console.log("server on");
})