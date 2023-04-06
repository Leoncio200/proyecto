import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class Rol {
  public async handle ({ auth, response }: HttpContextContract, next: () => Promise<void>, ...roles: string[]) {
    const user = await auth.authenticate()
    const foundUser = await User.find(user?.id)
  
    const roleIds = roles.join().split(',').map(role => parseInt(role))
  
    if (!foundUser || !roleIds.includes(foundUser.rol_id)) {
      return response.status(400).send('Permiso Denegado')
    }
  
    await next()
  }
}
