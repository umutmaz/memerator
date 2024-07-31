import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageLayoutEnum, Meme } from './schemas/meme.schema';
import { CreateMemeDto } from './dtos/CreateMemeDto';
import * as sharp from 'sharp';
import { randomInt } from 'crypto';
import { UpdateMemeDto } from './dtos/UpdateMemeDto';
@Injectable()
export class MemesService implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Meme.name) private readonly memeModel: Model<Meme>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    // if there is data in db, do not load from web.
    const existingData = await this.memeModel.exists({});
    if (!existingData) {
      const { data } = await this.httpService.axiosRef.get(
        'https://api.memegen.link/templates/',
      );
      const fetchedMemes: CreateMemeDto[] = await Promise.all(
        data.map(async (data: any) => {
          const dto = new CreateMemeDto(data);

          return dto;
        }),
      );

      for (const meme of fetchedMemes) {
        meme.metadata = await this.getImageInformation(meme.blank);
      }

      const fetchedMemeModels = await this.memeModel.create(
        fetchedMemes as Meme[],
      );

      console.log(
        `Data is initialized to the Database. ${fetchedMemeModels.length} memes are there now`,
      );
    }
  }
  getImageLayout(aspectRatio: number): ImageLayoutEnum {
    let layoutType: ImageLayoutEnum;
    if (aspectRatio === 1) {
      layoutType = ImageLayoutEnum.Square;
    } else if (aspectRatio < 1) {
      layoutType = ImageLayoutEnum.Vertical;
    } else {
      layoutType = ImageLayoutEnum.Horizontal;
    }
    return layoutType;
  }

  async getImageInformation(url: string): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(url, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(data, 'utf-8');
    let memeWidth, memeHeight, memeSize;
    try {
      await sharp(imageBuffer.buffer)
        .metadata()
        .then((metadata) => {
          memeWidth = metadata.width;
          memeHeight = metadata.height;
          memeSize = metadata.size;
        });
    } catch (error) {
      console.log(error);
    }

    const aspectRatio = memeWidth! / memeHeight!;

    return {
      aspectRatio,
      layoutType: this.getImageLayout(aspectRatio),
      width: memeWidth,
      height: memeHeight,
      size: memeSize,
    };
  }

  async getMemes(query?: {
    width?: number;
    height?: number;
    source?: string;
  }): Promise<any> {
    const existingMemes = await this.memeModel.aggregate([
      {
        $match: {
          ...(query && query.width && { width: query.width }),
          ...(query && query.height && { height: query.height }),
          ...(query && query.source && { source: query.source }),
        },
      },
      {
        $group: {
          _id: '$metadata.layoutType',
          memes: {
            $push: {
              url: '$blank',
              size: '$metadata.size',
              aspectRatio: '$metadata.aspectRatio',
              source: '$source',
              id: '$id',
            },
          },
        },
      },
    ]);

    const memeData = existingMemes.map((meme) => ({
      layoutType: meme._id,
      memes: meme.memes,
    }));

    return memeData;
  }
  async getSearchedMemes(query?: {
    name?: string;
    keyword?: string;
    text?: string;
  }): Promise<any> {
    const existingMemes = await this.memeModel.aggregate([
      {
        $match: {
          ...(query && query.name && { name: new RegExp(query.name, 'i') }),
          ...(query &&
            query.keyword && {
              keywords: {
                $elemMatch: { $regex: new RegExp(query.keyword, 'i') },
              },
            }),
          ...(query &&
            query.text && {
              example: {
                text: { $elemMatch: { $regex: new RegExp(query.text, 'i') } },
              },
            }),
        },
      },
      {
        $group: {
          _id: '$metadata.layoutType',
          memes: {
            $push: {
              url: '$blank',
              size: '$metadata.size',
              aspectRatio: '$metadata.aspectRatio',
              source: '$source',
              id: '$id',
            },
          },
        },
      },
    ]);

    const memeData = existingMemes.map((meme) => ({
      layoutType: meme._id,
      memes: meme.memes,
    }));

    return memeData;
  }
  async deleteMeme(id: string): Promise<string> {
    const result = await this.memeModel.findOneAndDelete({ id });
    if (result) {
      return `Successfully deleted`;
    } else {
      return `Meme with id ${id} not found`;
    }
  }

  async getRandom(): Promise<any> {
    const count = await this.memeModel.countDocuments();
    const random = Math.floor(Math.random() * count);
    const meme = await this.memeModel
      .findOne()
      .skip(random)
      .select(['blank', 'metadata.aspectRatio', 'metadata.size'])
      .exec();

    return {
      url: meme?.blank,
      aspectRatio: meme?.metadata.aspectRatio,
      size: meme?.metadata.size,
    };
  }

  async createCustomMeme({ id, text }: { id: string; text: string[] }) {
    const existingMeme = await this.memeModel.findOne({ id });
    if (existingMeme === null) {
      return `Meme with ${id} does not exist.`;
    }

    const newMeme = new CreateMemeDto(existingMeme);
    newMeme.id = `${newMeme.id}-${randomInt(999999999).toString()}`;
    newMeme.example.text = text;
    return this.memeModel.create(newMeme);
  }

  async updateMeme(id: string, updates: UpdateMemeDto) {
    const existingMeme = await this.memeModel.findOne({ id });
    const aspectRatio =
      existingMeme?.metadata.width / existingMeme?.metadata.height;

    if (updates.width && !updates.height) {
      updates.height = updates.width / aspectRatio;
    }

    if (updates.height && !updates.width) {
      updates.width = updates.height * aspectRatio;
    }

    const updateObject = {
      ...(updates.name && { name: updates.name }),
      ...(updates.keywords && { keywords: updates.keywords }),
      ...(updates.source && { source: updates.source }),
      metadata: { width: updates.width, height: updates.height },
    };

    if (existingMeme === null) {
      return `Meme with ${id} does not exist.`;
    }

    return await this.memeModel.findOneAndUpdate({ id }, updateObject, {
      new: true,
    });
  }
}
