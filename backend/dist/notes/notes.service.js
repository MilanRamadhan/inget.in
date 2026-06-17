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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotesService = class NotesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.note.create({
            data: {
                ...dto,
                userId,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
            },
            include: { category: true },
        });
    }
    async findAll(userId, filters) {
        const where = { userId };
        if (filters.category)
            where.categoryId = filters.category;
        if (filters.done !== undefined)
            where.isDone = filters.done === 'true';
        if (filters.date) {
            const start = new Date(filters.date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.date);
            end.setHours(23, 59, 59, 999);
            where.scheduledAt = { gte: start, lte: end };
        }
        return this.prisma.note.findMany({
            where,
            include: { category: true },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async findOne(userId, id) {
        const note = await this.prisma.note.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.userId !== userId)
            throw new common_1.ForbiddenException();
        return note;
    }
    async update(userId, id, dto) {
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.note.update({
            where: { id },
            data: {
                ...dto,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
            },
            include: { category: true },
        });
    }
    async remove(userId, id) {
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.note.delete({ where: { id } });
        return { message: 'Note deleted' };
    }
    async toggleDone(userId, id) {
        const note = await this.prisma.note.findUnique({ where: { id } });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.note.update({
            where: { id },
            data: { isDone: !note.isDone },
            include: { category: true },
        });
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map