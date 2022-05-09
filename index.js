import express, { json } from "express";
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";
import Joi from "joi";
dotenv.config();

// let users = [];
let sessions = [];

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.required()
})

const logupSchema = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.required()
})

const app = express();
app.use(json());
app.use(cors());

let dataBase = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(() => {
    dataBase = mongoClient.db("data_mywallet");
    console.log('banco conectado');
})

app.post('/sign-up', async (req, res) => {
    const { body } = req;
    try {
        const { error, value } = logupSchema.validate(body);
        if(error){ 
            res.sendStatus(422);
            return;
        }
        const users = await dataBase.collection("contas").find({}).toArray();
        if(users.some(el => el.email == value.email)){
            res.sendStatus(409);
            return;
        }
        const senhaCriptografada = bcrypt.hashSync(value.senha, 10);
        await dataBase.collection("contas").insertOne({'name': value.nome, 'email': value.email, 'senhaCrypt': senhaCriptografada});
        // users.push({'name': body.nome, email: body.email, senhaCrypt: senhaCriptografada});
        res.sendStatus(201);
    } catch {
        res.sendStatus(500);        
    }
})

app.post('/sign-in', async (req, res) => {
    const { body } = req;
    try {
        const users = await dataBase.collection("contas").find({}).toArray();
        const { error, value } = loginSchema.validate(body);
        if(error){ 
            res.sendStatus(422);
            return;
        }
        if(users.some((el) => bcrypt.compareSync(value.senha, el.senhaCrypt) && el.email == value.email)){
            const token = uuid();
            sessions.push({'user': value.email, 'token': token});
            res.status(200).send(token);
        }else res.status(401).send('senha incorreta');
    } catch {
        res.sendStatus(500);        
    }
})
let entrada = [];
app.post('/move', async (req, res) => {
    const { body, headers } = req;
    console.log(headers.token);
    if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
        try {
            await dataBase.collection("movimento").insertOne(
                {'valor': parseFloat(body.valor).toFixed(2), 
                'descricao': body.descricao, 
                'date' : dayjs().format('DD-MM'), 
                'tipo': body.tipo, 
                'user': headers.user}
                );
        //entrada.push({'valor': body.valor, 'descricao': body.descricao, 'date' : dayjs().format('DD-MM'), 'tipo': body.tipo});
            res.sendStatus(200);
        } catch { res.sendStatus(500) };
    }else res.sendStatus(401);
})

app.put('/move', async (req, res) => {
    const { body, headers, query } = req;
    console.log(headers.token);
    if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
        try {
            await dataBase.collection("movimento").updateOne({'_id' : ObjectId(query.ID)}, {$set: {'valor': parseFloat(body.valor).toFixed(2), 'descricao': body.descricao}});
        //entrada.push({'valor': body.valor, 'descricao': body.descricao, 'date' : dayjs().format('DD-MM'), 'tipo': body.tipo});
            res.sendStatus(200);
        } catch { res.sendStatus(500) };
    }else res.sendStatus(401);
})

app.get('/move', async (req, res) => {
    const { headers } = req;
    console.log(headers.token)
    try {
        const name = await dataBase.collection("contas").findOne({email: headers.user}); 
        const movimento = await dataBase.collection("movimento").find({user: headers.user}).toArray();
        // const movimento = movimentosAll.filter((el) => headers.user == el.user);
        if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
            res.status(200).send({movimento: movimento, name: name.name});
        }else res.sendStatus(401);
    } catch {
        res.sendStatus(501);
    }
})

app.delete('/move', async (req, res) => {
    const { headers, query } = req;
    if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
        console.log(query.ID);
        await dataBase.collection("movimento").deleteOne({'_id' : ObjectId(query.ID)});
        res.sendStatus(200);
    }else res.sendStatus(401);
})

app.listen(5000, () => {
    console.log("server on");
})