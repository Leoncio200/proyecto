import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MongoClient, MongoNetworkError } from 'mongodb';
import { ObjectId } from 'mongodb';
import Event from '@ioc:Adonis/Core/Event';


export default class SalonesController {
  urls = [
    'mongodb://3.86.35.139:27017/mongosh?directConnection=true',
    'mongodb://3.86.35.139:27018/mongosh?directConnection=true',
    'mongodb://3.86.35.139:27019/mongosh?directConnection=true'
  ];
  dbName = 'Sensores';
  client: MongoClient | null = null;

  private async connect(url: string) {
    try {
      this.client = new MongoClient(url);
      await this.client.connect();
    } catch (e) {
      console.error(`Error connecting to MongoDB: ${e}`);
      this.client = null;
      throw e;
    }
  }

  private async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  public async obtenerSalones ({ request, response, auth }: HttpContextContract) {
    let lastError = null;
    for (const url of this.urls) {
      try {
        await this.connect(url);
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const pipeline = [
          { $match: { "user.id": Number(auth.user?.id) } },
          { $sort: { ubicacion: 1 } }
        ];
        const findResult = await collection.aggregate(pipeline).toArray();
        await this.disconnect();
        return findResult;
      } catch (e) {
        lastError = e;
        await this.disconnect();
      }
    }
    console.error(`Error connecting to all MongoDB instances: ${lastError}`);
    throw lastError;
  }
  
  

  
  
  public async addSalon({ request, response, auth }: HttpContextContract) {
    let lastError = null;
    for (const url of this.urls) {
      try {
        await this.connect(url);
        request.body().user = auth.user;
        const salon = request.body();
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const insertResult = await collection.insertOne(salon);
        Event.emit('message', 'Se agregó un salón');
        console.log(salon);
        return response.status(201).send({ message: 'Salón agregado correctamente' });
      } catch (e) {
        lastError = e;
        await this.disconnect();
      }
    }
    console.error(`Error connecting to all MongoDB instances: ${lastError}`);
    throw lastError;
  }
  
  
  public async deleteSalon({ params, response }: HttpContextContract) {
    let lastError = null;
    for (const url of this.urls) {
      try {
        await this.connect(url);
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(params.id) });
        if (deleteResult.deletedCount === 0) {
          return response.status(404).json({ message: 'Salon no encontrado.' });
        }
        Event.emit('message', 'se elimino un salon');
        return response.status(200).json({ message: 'Salon eliminado correctamente.' });
      } catch (e) {
        lastError = e;
        await this.disconnect();
      }
    }
    console.error(`Error connecting to all MongoDB instances: ${lastError}`);
    throw lastError;
  }
  
  
  public async obtenerSalon({ params, response, auth }: HttpContextContract) {
    let lastError = null;
    for (const url of this.urls) {
      try {
        await this.connect(url);
        const { id } = params;
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
        await this.disconnect();
        if (sensor.length === 0) {
          return response.status(404).json({ message: 'Salon no encontrado.' });
        }
        return response.status(200).json(sensor[0]);
      } catch (e) {
        lastError = e;
        await this.disconnect();
      }
    }
    console.error(`Error connecting to all MongoDB instances: ${lastError}`);
    throw lastError;
  }
  

  
  
  public async actualizarSalon({ request, response }: HttpContextContract) {
    let lastError = null;
    const { id } = request.params();
    const sensor = request.all();
    for (const url of this.urls) {
      try {
        await this.connect(url);
        const db = this.client.db(this.dbName);
        const collection = db.collection('Salones');
        const updateResult = await collection.updateOne({ _id: new ObjectId(id) }, { $set: sensor });
        if (updateResult.matchedCount === 0) {
          await this.disconnect();
          return response.status(404).json({ message: 'Salon no encontrado.' });
        }
        Event.emit('message', 'se actualizo un salon')
        await this.disconnect();
        return response.status(200).json({ message: 'Salon actualizado correctamente.' });
      } catch (e) {
        lastError = e;
        await this.disconnect();
      }
    }
    console.error(`Error connecting to all MongoDB instances: ${lastError}`);
    throw lastError;
  }
  
}
