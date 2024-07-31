import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMemeDto {
  @ApiPropertyOptional({ name: 'name', type: String })
  name?: string;

  @ApiPropertyOptional({ name: 'keywords', type: Array<string> })
  keywords?: string[];

  @ApiPropertyOptional({ name: 'width', type: Number })
  width?: number;
  @ApiPropertyOptional({ name: 'height', type: Number })
  height?: number;

  @ApiPropertyOptional({ name: 'source', type: String })
  source?: string;
}
