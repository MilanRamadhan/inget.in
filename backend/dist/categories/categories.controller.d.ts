import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    create(user: any, dto: CreateCategoryDto): Promise<{
        status: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        };
    }>;
    findAll(user: any): Promise<{
        status: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        }[];
    }>;
    update(user: any, id: string, dto: UpdateCategoryDto): Promise<{
        status: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            color: string;
        };
    }>;
    remove(user: any, id: string): Promise<{
        status: string;
        data: {
            message: string;
        };
    }>;
}
