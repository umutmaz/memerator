import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MemesService } from './memes.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCustomMemeDto } from './dtos/CreateCustomMemeDto';
import { UpdateMemeDto } from './dtos/UpdateMemeDto';

@Controller('memes')
@ApiTags('memes')
export class MemesController {
  constructor(private readonly memesService: MemesService) {}

  @Get()
  @ApiQuery({ name: 'width', type: Number, required: false })
  @ApiQuery({ name: 'height', type: Number, required: false })
  @ApiQuery({ name: 'source', type: String, required: false })
  getMeme(
    @Query() query?: { width?: number; height?: number; source?: string },
  ): Promise<any> {
    return this.memesService.getMemes(query);
  }

  @Get('/search')
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiQuery({ name: 'keyword', type: String, required: false })
  @ApiQuery({ name: 'text', type: String, required: false })
  getSearchedMeme(
    @Query() query?: { name?: string; keyword?: string; text?: string },
  ): Promise<any> {
    return this.memesService.getSearchedMemes(query);
  }

  @Post('/custom-text')
  @ApiBody({ type: CreateCustomMemeDto })
  createCustomMeme(@Body() body: CreateCustomMemeDto) {
    return this.memesService.createCustomMeme({ id: body.id, text: body.text });
  }

  @Put('/:id')
  @ApiBody({ type: UpdateMemeDto })
  updateMeme(@Param('id') id: string, @Body() body: UpdateMemeDto) {
    return this.memesService.updateMeme(id, body);
  }

  @Get('/random')
  getRandomMeme(): Promise<any> {
    return this.memesService.getRandom();
  }

  @Delete('/:id')
  deleteMeme(@Param('id') id: string): Promise<any> {
    return this.memesService.deleteMeme(id);
  }
}
