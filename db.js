import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let dataBase = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
try {
    await mongoClient.connect();
    dataBase = mongoClient.db("data_mywallet");
    console.log('banco conectado');
} catch {
    console.log('Erro ao se conectar com banco de dados!', e);
}
export default dataBase;