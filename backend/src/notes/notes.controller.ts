import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateNoteDto) {
    const data = await this.notesService.create(user.id, dto);
    return { status: 'success', data };
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('category') category?: string,
    @Query('date') date?: string,
    @Query('done') done?: string,
  ) {
    const data = await this.notesService.findAll(user.id, { category, date, done });
    return { status: 'success', data };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.notesService.findOne(user.id, id);
    return { status: 'success', data };
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    const data = await this.notesService.update(user.id, id, dto);
    return { status: 'success', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.notesService.remove(user.id, id);
    return { status: 'success', data };
  }

  @Patch(':id/done')
  async toggleDone(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.notesService.toggleDone(user.id, id);
    return { status: 'success', data };
  }
}
