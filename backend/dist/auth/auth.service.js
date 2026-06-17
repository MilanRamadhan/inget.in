"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    signTokens(userId, email) {
        const payload = { sub: userId, email };
        return {
            accessToken: this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            }),
            refreshToken: this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            }),
        };
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: { name: dto.name, email: dto.email, password: hashed },
        });
        const tokens = this.signTokens(user.id, user.email);
        return { user: { id: user.id, name: user.name, email: user.email }, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = this.signTokens(user.id, user.email);
        return { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, ...tokens };
    }
    async googleAuth(data) {
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: { name: data.name, email: data.email, avatar: data.avatar },
            });
        }
        const tokens = this.signTokens(user.id, user.email);
        return { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, ...tokens };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const tokens = this.signTokens(payload.sub, payload.email);
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map