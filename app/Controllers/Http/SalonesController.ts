import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import Event from '@ioc:Adonis/Core/Event';
export default class SalonesController {
    url = 'mongodb+srv://Leoncio:Leoncio2@cluster0.kk3lull.mongodb.net/?retryWrites=true&w=majority';
    client = new MongoClient(this.url);
    dbName = 'Sensores';

    public async obtenerSalones ({ request, response, auth }: HttpContextContract){
      try {
          await this.client.connect();
          const db = this.client.db(this.dbName);
          const collection = db.collection('Salones');
          const pipeline = [
              { $match: { "user.id": Number(auth.user?.id) } },
              { $sort: { ubicacion: 1 } } // Ordenar por nombre en orden ascendente
          ];
          const findResult = await collection.aggregate(pipeline).toArray();
          return findResult;
      } finally {
          await this.client.close();
      }
    }
    
  
  
  public async addSalon ({ request, response, auth }: HttpContextContract){
      try {
          request.body().user = auth.user;
          const sensor = request.body();  
          await this.client.connect();
          const db = this.client.db(this.dbName);
          const collection = db.collection('Salones');
          const insertResult = await collection.insertOne(sensor);
          Event.emit('message', 'se agrego un salon')
          console.log(sensor)
      } finally {
          await this.client.close();
      }
  }
  
  public async deleteSalon({ params, response }: HttpContextContract) {
      try {
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
      } finally {
          await this.client.close();
      }
  }
  
  public async obtenerSalon({ params, response }: HttpContextContract) {
    try {
        const { id } = params;
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const pipeline = [
          {
            $match: { _id: new ObjectId(id) }
          },
          {
            $lookup: {
              from: 'Sensores',
              localField: '_id',
              foreignField: 'salonId',
              as: 'sensores'
            }
          },
          {
            $addFields: {
              numSensores: { $size: '$sensores' }
            }
          },
          {
            $sort: { nombre: 1 }
          }
        ];
        const sensor = await collection.aggregate(pipeline).toArray();
        if (sensor.length === 0) {
            return response.status(404).json({ message: 'Salon no encontrado.' });
        }
        return response.status(200).json(sensor[0]);
    } finally {
        await this.client.close();
    }
  }
  
  
  public async actualizarSalon({ request, response }: HttpContextContract){
      try {
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
      } finally {
          await this.client.close();
      }
  }
}
