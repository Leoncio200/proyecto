// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Correo from 'App/Mailers/Correo'

export default class LoginController {
    axios = require ('axios')
    telefono: any
    numero: any
    public async Login({ auth, request, response }){
        const { email, password } = request.all();
      
        const validationSchema = schema.create({
            email: schema.string({}, [rules.required(), rules.email()]),
            password: schema.string({}, [rules.required()])
          })
        
          try {
            await request.validate({ schema: validationSchema })

        const user = await User.findBy('email', email)
        if (!user) {
            return response.unauthorized('usuario inexistente')
        }
        const isPasswordValid = await Hash.verify(user.password, password) 
        try {
            if (isPasswordValid) {
                const token = await auth.use('api').generate(user)
                return response.json({
                    status: 200,
                    message: "Usuario logeado exitosamente",
                    token: token.token,
                    user: token.user
                })
                } else {
                    return response.unauthorized('Usuario o contraseña incorrectos')
                }
          } catch (error) {
    if (error.messages) {
      return response.badRequest(error.messages)
    } else {
      return response.unauthorized('a ocurrido un error')
    }
}}catch (error) { 
    response.badRequest({
        status: 'Error al crear usuario',
        message: error.messages
        })
    }}
    
    
    public async user({ request, response }){
        const validationSchema = schema.create({
            name: schema.string({}, [
              rules.required(),
              rules.maxLength(255)
            ]),
            email: schema.string({}, [
              rules.email(),
              rules.required(),
              rules.maxLength(255)
            ]),
            phone: schema.number([
                rules.required()
              ]),
            password: schema.string({}, [
              rules.required(),
              rules.minLength(2),
              rules.maxLength(60)
            ]),
          })
      
          try {
            const payload = await request.validate({
              schema: validationSchema
            })
        const numero_aleatorio = Math.floor(Math.random()*(9999-1000)+1000);
        const passwordHash = await Hash.make(request.input('password'))
        const user = await User.create({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            rol_id: 2,
            active: 0,
            CodeTemporal: numero_aleatorio,
            password: passwordHash,
          })
          await new Correo(user).send()
        try {

            const apiResponse = await this.axios.post('https://rest.nexmo.com/sms/json', { 
                from:"Vonage APIs",
                text:`Codigo de verificacion: ${numero_aleatorio}`,
                to:`52${payload.phone}`,
            }, {
            auth: { username: '129f8e3e',
            password: 'ipaqBEtiPDnHg9dS' }
            })
            response.json({
                status:apiResponse.status})
        } catch (error) {
            response.status(500).send('Error al enviar el SMS')
        }
        response.json({
             status: 'Usuario creado',
            usuario: user
        })
    }catch (error) {
      console.log(error.messages)
      }}


      
      public async Logout({auth,response}){
        await auth.use('api').revoke()
        return response.json({
            status: 'Sesion cerrada'
        })
      }

      

    public async Validacion({ request, response }){
      const { Correo, Verificacion } = request.all();
      if (request.hasValidSignature()) {
      const user = User.findByOrFail('email', Correo);
      if ((await user).CodeTemporal == Verificacion){
        (await user).active = 1;
        (await user).save();
      return response.json({
        message: 'Usuario verificado'
      })
      }
      else{
        return response.json({
          message: 'Usuario o contraseña incorrectos'
        })
      }
      }   
      else{     
      return 'Signature is missing or URL was tampered.'
      }
    }
}
