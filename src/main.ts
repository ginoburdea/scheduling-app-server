import { AppModule } from './app.module'
import { buildApp } from './utils/buildApp'

async function bootstrap() {
    const app = await buildApp(AppModule)
    await app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST)
}
bootstrap()
