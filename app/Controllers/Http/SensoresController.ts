import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '@ioc:Adonis/Core/Event';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';


export default class SensoresController {
    urls = [
        'mongodb://3.86.35.139:27017/mongosh?directConnection=true',
        'mongodb://3.86.35.139:27018/mongosh?directConnection=true',
        'mongodb://3.86.35.139:27019/mongosh?directConnection=true'
      ];
      client: MongoClient | null = null;
    dbName = 'Sensores';

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
    
      public async sensores({ request, response }: HttpContextContract) {
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const db = this.client.db(this.dbName);
            const collection = db.collection('SensoresInformacion');
            
            // Creamos el índice para ordenar por nombre (si no existe)
            await collection.createIndex({ nombre: 1 });
    
            const id = request.param('id');
    
            const aggregationPipeline = [
              { $match: { id: id } },
              { $sort: { nombre: 1 } } // Ordenamos por nombre (1: ascendente, -1: descendente)
            ];
    
            const aggregationResult = await collection.aggregate(aggregationPipeline).toArray();
    
            await this.disconnect();
            return response.json(aggregationResult);
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        return response.status(500).json({ message: 'Error interno del servidor' });
      }
      


    public async addSensor({ request, response, auth }: HttpContextContract){
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const sensores = request.input("sensores");
            const object = request.params();
            const db = this.client.db(this.dbName);
            const collection = db.collection('SensoresInformacion');
            const colecion = db.collection('Salones');
            const findResult = await colecion.findOne({ _id: new ObjectId(object.id) });
            if(!findResult)
              return response.status(404).json({
                message: 'No se encontro el salon',
                mm: findResult
              });
            for (var i = 0; i < sensores.length; i++) {
              sensores[i].salon = findResult;
            }
            const insertResult = await collection.insertMany(sensores);
            Event.emit('message', 'se añadio un sensor')
            await this.disconnect();
            return response.status(201).json(insertResult.ops);
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        throw lastError;
      }

      public async deleteSensor({ params, response }: HttpContextContract) {
        const { id } = params;
    
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const db = this.client.db(this.dbName);
            const collection = db.collection('SensoresInformacion');
            const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
            await this.disconnect();
            if (deleteResult.deletedCount === 0) {
              return response.status(404).json({ message: 'Sensor no encontrado.' });
            }
            Event.emit('message', 'se elimino un sensor')
            return response.status(200).json({ message: 'Sensor eliminado correctamente.' });
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        throw lastError;
      }
    

      public async obtenerSensor({ params, response }: HttpContextContract) {
        const { id } = params;
      
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const db = this.client.db(this.dbName);
            const collection = db.collection('SensoresInformacion');
      
            const pipeline = [
              { $match: { _id: new ObjectId(id) } },
              { $sort: { nombre: 1 } }
            ];
            const sensor = await collection.aggregate(pipeline).toArray();
            await this.disconnect();
            if (!sensor.length) {
              return response.status(404).json({ message: 'Sensor no encontrado.' });
            }
            return response.status(200).json(sensor[0]);
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        return response.status(500).json({ message: 'Error de servidor.' });
      }
      
  

      public async actualizarSensor({ request, response }: HttpContextContract) {
        const { id } = request.params();
        const sensor = request.all();
    
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const db = this.client.db(this.dbName);
            const collection = db.collection('SensoresInformacion');
    
            const updateResult = await collection.updateOne(
              { _id: new ObjectId(id) },
              { $set: sensor }
            );
    
            if (updateResult.matchedCount === 0) {
              return response.status(404).json({ message: 'Sensor no encontrado.' });
            }
            Event.emit('message', 'se actualizo un sensor');
    
            await this.disconnect();
            return response.status(200).json({ message: 'Sensor actualizado correctamente.' });
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        throw lastError;
      }



      public async obtenerDatos({ params, response }: HttpContextContract) {
        let lastError = null;
        for (const url of this.urls) {
          try {
            await this.connect(url);
            const db = this.client.db(this.dbName);
            const collection = db.collection('sensoresDatos');
            
            const id = params.id;
            const sensor = await collection.find({ type: id })
              .sort({ fecha_creacion: -1 })
              .limit(1)
              .toArray();
            
            if (sensor.length === 0) {
              return response.status(404).json({ message: 'Sensor no encontrado' });
            }
            
            sensor[0].unidad = sensor[0].sensor.unidad;
            await this.disconnect();    
            
            return response.json(sensor[0]);
          } catch (e) {
            lastError = e;
            await this.disconnect();
          }
        }
        
        console.error(`Error connecting to all MongoDB instances: ${lastError}`);
        throw lastError;
      }
      






}
