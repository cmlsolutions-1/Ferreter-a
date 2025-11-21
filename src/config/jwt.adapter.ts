import jwt from 'jsonwebtoken';
import { envs } from './envs';


const JWT_SEED = envs.JWT_SEED;



export class JwtAdapter {

  // DI?

  public static async generateToken( payload:any, duration=86400) {

    return new Promise((resolve) => {

      jwt.sign(payload, JWT_SEED, { expiresIn: duration  }, (err, token) => {
        
        if ( err ) return resolve(null);

        resolve(token)

      });
    })
  }


  public static validateToken<T>(token: string): Promise< T | null> {
    
    return new Promise( (resolve) => {

      jwt.verify( token, JWT_SEED, (err, decoded) => {

        if( err ) return resolve(null);

        resolve( decoded as T);

      });
    })
  }


}

