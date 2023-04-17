import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Event from '@ioc:Adonis/Core/Event';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
export default class SensoresController {
    url = 'mongodb://admin:1234@54.163.191.225/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0&authMechanism=DEFAULT';
    client = new MongoClient(this.url);
    dbName = 'Sensores';
    
    public async sensores ({ request, response }: HttpContextContract){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('SensoresInformacion');

        const findResult = await collection.find({}).toArray();
        // the following code examples can be pasted here...

        return findResult;
    }

    public async tipoSensor ({ request, response }: HttpContextContract){
        await this.client.connect();
        const db = this.client.db(this.dbName);
        const collection = db.collection('SensoresInformacion');

        const findResult = await collection.find({ tipo: "temperatura" }).toArray();
        // the following code examples can be pasted here...

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

        return response.status(200).json(findResult);
    }

    public async addSensor({ request, response, auth }: HttpContextContract){
    const sensor = request.all();

    await this.client.connect();
    const db = this.client.db(this.dbName);
    const collection = db.collection('SensoresInformacion');

    const insertResult = await collection.insertOne(sensor);
    Event.emit('message', 'se añadio un sensor')
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
    return response.status(200).json({ message: 'Sensor eliminado correctamente.' });
}

public async obtenerSensor({ params, response }: HttpContextContract) {
    const { id } = params;

    await this.client.connect();
    const db = this.client.db(this.dbName);
    const collection = db.collection('SensoresInformacion');

    const sensor = await collection.findOne({ _id: new ObjectId(id) });

    if (!sensor) {
    return response.status(404).json({ message: 'Sensor no encontrado.' });
}

    return response.status(200).json(sensor);
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
    return response.status(200).json({ message: 'Sensor actualizado correctamente.' });
}




public async obtenerDatos({ params, response }: HttpContextContract){
    const url = 'mongodb://admin:1234@54.163.191.225/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0&authMechanism=DEFAULT';
    const client = new MongoClient(url);
    const dbName = 'Sensores';

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('sensoresDatos');

    const id = params.id;
    const sensor = await collection.findOne({ "sensor._id": id });

    if(!sensor){
        return response.status(404).json({ message: 'Sensor no encontrado' });
    }

    return response.json(sensor);
    }
}
