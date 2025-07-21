
import { envs } from './config/envs';
import { AppRoutes } from './domain/presentation/routes';
import { MongoDatabase } from './data/mongo-database';
import { Server } from './domain/presentation/server';




(async () => {
    main();
})();


async function main() {

    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL,
    });

    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes,
    });

    server.start();
}