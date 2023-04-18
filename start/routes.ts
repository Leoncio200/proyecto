/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Event from '@ioc:Adonis/Core/Event';

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/api/user', ({ auth }) => {
  return auth.user;
}).middleware(['auth']);

Route.put('/Validacion', 'LoginController.Validacion').as('validacion')
Route.post('/api/user', 'LoginController.user')//
Route.post('/api/login', 'LoginController.Login')//
Route.delete('/api/logout', 'LoginController.Logout').middleware(['auth', 'status'])//

Route.group(() => {

  Route.get('/roles','SeleccionarController.SeleccionarRoles').middleware(['Rol:1,2']);    

  Route.get('/usuario/:id?', 'SeleccionarController.SeleccionarUsuarios').middleware(['Rol:1'])


Route.get('/usuario/UP/:id', 'CambiarController.editUsuario').middleware('Rol:1')
Route.put('/usuario/:id', 'CambiarController.CambiarUsuario').where('id', /^[0-9]+$/).middleware(['Rol:1']);

Route.delete('/usuario/:id', 'BorrarController.borrarUsuario').where('id', /^[0-9]+$/).middleware(['Rol:1']);

}).prefix('api/v2').middleware(['auth:api', 'status'])
Route.get('/stream','LoginController.serverSentStream');
Route.post('/api/insertvalues',async () => {
  Event.emit('message', 'Hola mundo')
})
Route.get('api/v2/sensores', 'SensoresController.sensores');//mostarsensores
Route.post('api/v2/sensores/:id', 'SensoresController.addSensor');//insertarSensores
Route.delete('api/v2/sensores/:id', 'SensoresController.deleteSensor');//eliminarSensores
Route.get('/api/v2/sensores/UP/:id', 'SensoresController.obtenerSensor')//obtenerSensor
Route.put('/api/v2/sensores/:id', 'SensoresController.actualizarSensor')//actualizarSensor

Route.get('/api/v2/sensores/:id', 'SensoresController.obtenerDatos')//obtenerDatos

Route.get('api/v2/salones', 'SalonesController.obtenerSalones').middleware(['auth']);//mostarsalones



Route.post('api/v2/salones/add', 'SalonesController.addSalon').middleware(['auth']);//insertarSalones
Route.delete('api/v2/salones/:id', 'SalonesController.deleteSalon');//eliminarSalones
Route.get('/api/v2/salones/UP/:id', 'SalonesController.obtenerSalon')//obtenerSalon
Route.put('/api/v2/salones/:id', 'SalonesController.actualizarSalon')//actualizarSensor

