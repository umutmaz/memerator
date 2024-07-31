import { Module } from '@nestjs/common';
import { MemesController } from './memes.controller';
import { MemesService } from './memes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meme, MemeSchema } from './schemas/meme.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meme.name, schema: MemeSchema }]),
    HttpModule,
  ],
  controllers: [MemesController],
  providers: [MemesService],
  exports: [MemesService],
})
export class MemesModule {}
