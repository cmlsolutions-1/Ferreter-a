import express, { Router } from 'express';
import cors from 'cors';
// import compression from 'compression';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
 

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}


export class Server {

  private app = express();
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }



  async start() {


    //* Middlewares
    this.app.use(cors());
    this.app.use(express.json()); // raw
    this.app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
    // this.app.use( compression() )

    
    const app = express();


    //* Routes
    this.app.use(this.routes);

    this.app.use(errorHandler);


    this.app.use((req, res) => {
      res.status(404).json({ message: "Not Found" });
    });


    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });

  }

}
