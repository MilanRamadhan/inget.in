"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const express = require("express");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const expressServer = express();
const ALLOWED_ORIGINS = ["http://localhost:3000", "https://inget-in.vercel.app"];
let appReady = null;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressServer));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin))
                callback(null, true);
            else
                callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.init();
}
if (require.main === module) {
    bootstrap().then(() => {
        const port = process.env.PORT || 3001;
        expressServer.listen(port, () => {
            console.log(`Backend running on http://localhost:${port}`);
        });
    });
}
module.exports = async (req, res) => {
    const origin = req.headers.origin || "";
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
    if (!appReady)
        appReady = bootstrap();
    try {
        await appReady;
    }
    catch (err) {
        appReady = null;
        console.error("[Bootstrap Error]", err);
        res.status(500).json({
            statusCode: 500,
            message: "Server initialization failed",
            error: String(err?.message || err),
            hasDbUrl: !!process.env.DATABASE_URL,
        });
        return;
    }
    expressServer(req, res);
};
//# sourceMappingURL=main.js.map