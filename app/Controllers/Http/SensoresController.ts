import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '@ioc:Adonis/Core/Event';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
export default class SensoresController {
    url = 'mongodb+srv://Leoncio:Leoncio2@cluster0.kk3lull.mongodb.net/?retryWrites=true&w=majority';
    client = new MongoClient(this.url);
    dbName = 'Sensores';
    
    public async sensores({ request, response }: HttpContextContract) {
        try {
          await this.client.connect();
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
    
          this.client.close();
          return response.json(aggregationResult);
        } catch (error) {
          console.log(error);
          return response.status(500).json({ message: 'Error interno del servidor' });
        }
    }
      

    public async tipoSensor ({ request, response }: HttpContextContract){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('SensoresInformacion');

        const findResult = await collection.find({ tipo: "temperatura" }).toArray();
        // the following code examples can be pasted here...
        this.client.close();
        return findResult;
    }

    public async actualizarUbicacion({ request, response }: HttpContextContract){
        const { id } = request.params();
        const { ubicacion } = request.all();
    
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('SensoresInformacion');
    
        const updateResult = await collection.updateOne({ _id: id }, { $set: { ubicacion: ubicacion } });
    
        if (updateResult.matchedCount === 0) {
            return response.status(404).json({ message: 'Sensor no encontrado.' });
        }
    
        this.client.close();
        return response.status(200).json({ message: 'Sensor actualizado correctamente.' });
    }

    public async obtenerDescripcion({ request, response }: HttpContextContract){
        const { id } = request.params();

        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('SensoresInformacion');

        const findResult = await collection.findOne({ _id: id }, { projection: { descripcion: 1 } });

        if (!findResult) {
            return response.status(404).json({ message: 'Sensor no encontrado.' });
        }

        this.client.close();
        return response.status(200).json(findResult);
    }

    public async addSensor({ request, response, auth }: HttpContextContract){
    const sensores = request.input("sensores");
    const object = request.params();

    await this.client.connect();
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
    this.client.close();
    return response.status(201).json(insertResult.ops);
}

public async deleteSensor({ params, response }: HttpContextContract) {
    const { id } = params;

    await this.client.connect();
    const db = this.client.db(this.dbName);
    const collection = db.collection('SensoresInformacion');

    const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
    return response.status(404).json({ message: 'Sensor no encontrado.' });
}
    Event.emit('message', 'se elimino un sensor')

    this.client.close();
    return response.status(200).json({ message: 'Sensor eliminado correctamente.' });
}

public async obtenerSensor({ params, response }: HttpContextContract) {
    const { id } = params;
  
    await this.client.connect();
    const db = this.client.db(this.dbName);
    const collection = db.collection('SensoresInformacion');
  
    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      { $sort: { nombre: 1 } }
    ];
    const sensor = await collection.aggregate(pipeline).toArray();
  
    if (!sensor.length) {
      return response.status(404).json({ message: 'Sensor no encontrado.' });
    }
  
    this.client.close();
    return response.status(200).json(sensor[0]);
  }
  

public async actualizarSensor({ request, response }: HttpContextContract){
    const { id } = request.params();
    const sensor = request.all();

    await this.client.connect();
    const db = this.client.db(this.dbName);
    const collection = db.collection('SensoresInformacion');
    
    const updateResult = await collection.updateOne({ _id: new ObjectId(id) }, { $set: sensor });

    if (updateResult.matchedCount === 0) {
    return response.status(404).json({ message: 'Sensor no encontrado.' });
}
    Event.emit('message', 'se actualizo un sensor')

    this.client.close();
    return response.status(200).json({ message: 'Sensor actualizado correctamente.' });
}




public async obtenerDatos({ params, response }: HttpContextContract) {
    const url = 'mongodb+srv://Leoncio:Leoncio2@cluster0.kk3lull.mongodb.net/?retryWrites=true&w=majority';
    const client = new MongoClient(url);
    const dbName = 'Sensores';

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('sensoresDatos');

    const id = params.id;
    const sensor = await collection.find({ type: id })
        .sort({ fecha_creacion: -1 })
        .limit(1)
        .toArray();

    if(sensor.length === 0){
        return response.status(404).json({ message: 'Sensor no encontrado' });
    }
    sensor[0].unidad = sensor[0].sensor.unidad;
    await client.close();    

    return response.json(sensor[0]);
}

}
