import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateNoteDto): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        } | null;
    } & {
        note: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        scheduledAt: Date | null;
        categoryId: string | null;
        isDone: boolean;
        userId: string;
    }>;
    findAll(userId: string, filters: {
        category?: string;
        date?: string;
        done?: string;
    }): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        } | null;
    } & {
        note: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        scheduledAt: Date | null;
        categoryId: string | null;
        isDone: boolean;
        userId: string;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        } | null;
    } & {
        note: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        scheduledAt: Date | null;
        categoryId: string | null;
        isDone: boolean;
        userId: string;
    }>;
    update(userId: string, id: string, dto: UpdateNoteDto): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        } | null;
    } & {
        note: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        scheduledAt: Date | null;
        categoryId: string | null;
        isDone: boolean;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    toggleDone(userId: string, id: string): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        } | null;
    } & {
        note: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        scheduledAt: Date | null;
        categoryId: string | null;
        isDone: boolean;
        userId: string;
    }>;
}
