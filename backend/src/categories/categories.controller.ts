import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(user.id, dto);
    return { status: 'success', data };
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const data = await this.categoriesService.findAll(user.id);
    return { status: 'success', data };
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(user.id, id, dto);
    return { status: 'success', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.categoriesService.remove(user.id, id);
    return { status: 'success', data };
  }
}
