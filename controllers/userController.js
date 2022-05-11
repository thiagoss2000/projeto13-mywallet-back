import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import Joi from "joi";
import dataBase from '../db.js';

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.required()
})

const logupSchema = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.required()
})

export async function regiterUser (req, res) {
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
        res.sendStatus(201);
    } catch (e) {
        console.log(e)
        res.sendStatus(500);        
    }
}

export async function logUser (req, res) {
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
            await dataBase.collection("sessions").insertOne({'user': value.email, 'token': token});
            res.status(200).send(token);
        }else res.status(401).send('senha incorreta');
    } catch (e) {
        res.sendStatus(500);   
        console.log(e);     
    }
}
