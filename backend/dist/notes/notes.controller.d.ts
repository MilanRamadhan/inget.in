import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private notesService;
    constructor(notesService: NotesService);
    create(user: any, dto: CreateNoteDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    findAll(user: any, category?: string, date?: string, done?: string): Promise<{
        status: string;
        data: ({
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
        })[];
    }>;
    findOne(user: any, id: string): Promise<{
        status: string;
        data: {
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
        };
    }>;
    update(user: any, id: string, dto: UpdateNoteDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    remove(user: any, id: string): Promise<{
        status: string;
        data: {
            message: string;
        };
    }>;
    toggleDone(user: any, id: string): Promise<{
        status: string;
        data: {
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
        };
    }>;
}
