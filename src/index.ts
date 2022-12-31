import {app} from "./app";
import {runDB} from "./adapters/dbAdapters";

const port = process.env.PORT ? +process.env.PORT : 5001;

async function bootstrap() {
    try {
        await runDB();
        app.listen(port, () => {
            console.log(`[App] Server on post:${port} is start `);
        });
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

bootstrap().then();

