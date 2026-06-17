import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string;
    }>;
    findAll(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string;
    }[]>;
    update(userId: string, id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        color: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
