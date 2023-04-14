import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import Event from '@ioc:Adonis/Core/Event';
export default class SalonesController {
    url = 'mongodb://admin:1234@44.203.117.76:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0&authMechanism=DEFAULT';
    client = new MongoClient(this.url);
    dbName = 'Sensores';

    public async obtenerSalones ({ request, response, auth }: HttpContextContract){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const findResult = await collection.find({"user.id": Number(auth.user?.id)}).toArray();
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
            Event.emit('message', 'se agrego un salon')
            console.log(sensor)
        }


        public async deleteSalon({ params, response }: HttpContextContract) {
            const { id } = params;
          
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection('Salones');
          
            const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
          
            if (deleteResult.deletedCount === 0) {
              return response.status(404).json({ message: 'Salon no encontrado.' });
            }
            Event.emit('message', 'se elimino un salon')
            return response.status(200).json({ message: 'Salon eliminado correctamente.' });
          }

          public async obtenerSalon({ params, response }: HttpContextContract) {
            const { id } = params;
          
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection('Salones');
          
            const sensor = await collection.findOne({ _id: new ObjectId(id) });
          
            if (!sensor) {
              return response.status(404).json({ message: 'Salon no encontrado.' });
            }
          
            return response.status(200).json(sensor);
          }


          public async actualizarSalon({ request, response }: HttpContextContract){
            const { id } = request.params();
            const sensor = request.all();
          
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection('Salones');
          
            const updateResult = await collection.updateOne({ _id: new ObjectId(id) }, { $set: sensor });
          
            if (updateResult.matchedCount === 0) {
              return response.status(404).json({ message: 'Salon no encontrado.' });
            }
            Event.emit('message', 'se actualizo un salon')
            return response.status(200).json({ message: 'Salon actualizado correctamente.' });
          }
}
