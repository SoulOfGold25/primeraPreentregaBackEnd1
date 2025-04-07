import passport from 'passport';
import passportLocal from 'passport-local';
import jwtStrategy from 'passport-jwt';

import userModel from '../models/user.model.js';
import { createHash, PRIVATE_KEY, cookieExtractor } from '../utils.js'
import cartModel from '../models/cart.model.js'; // Importar el modelo de carrito

//Declaramos nuestra estrategia:
const localStrategy = passportLocal.Strategy;

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
    /*=============================================
    =                JWTStrategy                  =
    =============================================*/
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: PRIVATE_KEY
        }, async (jwt_payload, done) => {
            console.log("Entrando a passport Strategy con JWT.");
            try {
                console.log("JWT obtenido del payload");
                console.log(jwt_payload);
                return done(null, jwt_payload.user);
            } catch (error) {
                console.error(error);
                return done(error);
            }
        }
    ));


    /*=============================================
    =                localStrategy                =
    =============================================*/
    //Estrategia de registro de usuario
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {

            console.log("userModel", username);

            const { first_name, last_name, email, age } = req.body;
            try {
                const exists = await userModel.findOne({ email: username });
                if (exists) {
                    console.log("El usuario ya existe.");
                    return done(null, false);
                }

                // Crear un nuevo carrito para el usuario
                const newCart = await cartModel.create({ products: [] });

                const user = {
                    first_name,
                    last_name,
                    email,
                    username,
                    age,
                    password: createHash(password),
                    cart: newCart._id, // Asociar el carrito al usuario
                    loggedBy: "App"
                };
                const result = await userModel.create(user);
                //Todo sale OK
                return done(null, result);
            } catch (error) {
                return done("Error registrando el usuario: " + error);
            }
        }
    ));

    /*=============================================
    = Funciones de Serializacion y Desserializacion =
    =============================================*/
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    });


    // const opts = {
    //     jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    //     secretOrKey: PRIVATE_KEY
    // };
    
    // passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    //     try {
    //         const user = { id: jwtPayload.id, email: jwtPayload.email }; // Simulación
    //         if (user) {
    //             return done(null, user);
    //         } else {
    //             return done(null, false);
    //         }
    //     } catch (error) {
    //         return done(error, false);
    //     }
    // }));

}

export default initializePassport;


