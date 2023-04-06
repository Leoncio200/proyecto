import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
export default class SalonesController {
    url = 'mongodb+srv://Leoncio:Leoncio2@cluster0.kk3lull.mongodb.net/?retryWrites=true&w=majority';
    client = new MongoClient(this.url);
    dbName = 'Sensores';

    public async obtenerSalones ({ request, response }: HttpContextContract){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const findResult = await collection.find({}).toArray();
        // the following code examples can be pasted here...
        return findResult;
    }
        public async addSalon ({ request, response, auth }: HttpContextContract){
            request.body().user = auth.user;
            const sensor = request.body();  
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection('Salones');
            
            const insertResult = await collection.insertOne(sensor);
            console.log(sensor)
        }
}
