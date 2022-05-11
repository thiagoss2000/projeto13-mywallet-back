import dayjs from "dayjs";
import dataBase from "../db.js";
import { ObjectId } from "mongodb";

export async function inputMovement (req, res) {
    const { body, headers } = req;
    try {
        const sessions = await dataBase.collection("sessions").find({}).toArray();
        if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
            await dataBase.collection("movimento").insertOne(
                {'valor': parseFloat(body.valor).toFixed(2), 
                'descricao': body.descricao, 
                'date' : dayjs().format('DD-MM'), 
                'tipo': body.tipo, 
                'user': headers.user}
                );
            res.sendStatus(200);
        }else res.sendStatus(401);
    } catch { res.sendStatus(500) };
}

export async function updateMovement (req, res) {
    const { body, headers, query } = req;
    try {
        const sessions = await dataBase.collection("sessions").find({}).toArray();
        if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
            await dataBase.collection("movimento").updateOne({'_id' : ObjectId(query.ID)}, {$set: {'valor': parseFloat(body.valor).toFixed(2), 'descricao': body.descricao}});
            res.sendStatus(200);
        }else res.sendStatus(401);
    } catch { res.sendStatus(500) };
}

export async function outputMovement (req, res) {
    const { headers } = req;
    try {
        const name = await dataBase.collection("contas").findOne({email: headers.user}); 
        const movimento = await dataBase.collection("movimento").find({user: headers.user}).toArray();
        const sessions = await dataBase.collection("sessions").find({}).toArray();
        if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
            res.status(200).send({movimento: movimento, name: name.name});
        }else res.sendStatus(401);
    } catch {
        res.sendStatus(501);
    }
}

export async function deleteMovement (req, res) {
    const { headers, query } = req;
    try {
        const sessions = await dataBase.collection("sessions").find({}).toArray();
        if(sessions.some((el) => headers.user == el.user && headers.token == el.token)){
            console.log(query.ID);
            await dataBase.collection("movimento").deleteOne({'_id' : ObjectId(query.ID)});
            res.sendStatus(200);
        }else res.sendStatus(401);
    } catch {
        res.sendStatus(500);
    }
}
