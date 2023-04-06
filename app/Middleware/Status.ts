import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Status {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    let user = auth.use('api').user
    if (user?.active == 0) {
      return response.status(400).send({ error: "Usuario inactivo"})
    }
    await next()
  }
}
