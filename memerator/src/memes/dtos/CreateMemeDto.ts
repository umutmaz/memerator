export class CreateMemeDto {
  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.lines = data.lines;
    this.overlays = data.overlays;
    this.styles = data.styles;
    this.blank = data.blank;
    this.example = data.example;
    this.metadata = data.metadata;
    this.source = data.source;
    this.keywords = data.keywords;
    this._self = data._self;
  }

  id: string;

  name: string;

  lines: number;

  overlays: number;

  styles: string[];

  blank: string;

  example: Record<string, any>;
  metadata?: Record<string, any>;

  source: string;

  keywords: string[];

  _self: string;
}
