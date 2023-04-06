import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Rol from 'App/Models/Rol';
import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash';

export default class extends BaseSeeder {
  public async run () {
    await Rol.createMany([
      { nombre: 'admin' },
      { nombre: 'user' },
      { nombre: 'guest' },
    ]);

    await User.create({
      name: 'bryan',
      email: 'bryansoe871@gmail.com',
      phone: '8717819048',
      rol_id: 1,
      active: 1,
      CodeTemporal: 1234,
      password: await Hash.make('12345'),
    });
  }
}
