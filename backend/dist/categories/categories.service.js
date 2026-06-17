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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.category.create({
            data: { ...dto, userId },
        });
    }
    async findAll(userId) {
        return this.prisma.category.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async update(userId, id, dto) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.category.update({ where: { id }, data: dto });
    }
    async remove(userId, id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map