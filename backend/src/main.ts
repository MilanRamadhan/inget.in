import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import * as express from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

const expressServer = express();

const ALLOWED_ORIGINS = ["http://localhost:3000", "https://inget-in.vercel.app"];

let appReady: Promise<void> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressServer));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(helmet({ crossOriginResourcePolicy: false }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
}

// Local dev: start TCP server
if (require.main === module) {
  bootstrap().then(() => {
    const port = process.env.PORT || 3001;
    expressServer.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  });
}

// Vercel serverless: export request handler
module.exports = async (req: express.Request, res: express.Response) => {
  // Set CORS headers immediately — before NestJS, so they're present even if bootstrap fails
  const origin = (req.headers.origin as string) || "";
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (!appReady) appReady = bootstrap();
  try {
    await appReady;
  } catch (err) {
    appReady = null; // reset so next request retries bootstrap
    console.error("[Bootstrap Error]", err);
    res.status(500).json({ statusCode: 500, message: "Server initialization failed" });
    return;
  }

  expressServer(req, res);
};
