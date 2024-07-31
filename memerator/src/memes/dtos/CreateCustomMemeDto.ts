import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomMemeDto {
  @ApiProperty({ name: 'id', type: String })
  id: string;

  @ApiProperty({ name: 'text', type: Array<string> })
  text: string[];
}
