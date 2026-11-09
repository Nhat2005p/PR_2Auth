import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AppService } from './app.service';

@ApiTags('Hello')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @ApiOperation({ summary: 'API Hello World đa ngôn ngữ (i18n)' })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['en', 'vi'],
    description: 'Ngôn ngữ: en hoặc vi (mặc định: en)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về lời chào localized',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async getHello(
    @I18nLang() lang: string,
    @Query('lang') queryLang?: string,
  ): Promise<string> {
    const selectedLang = queryLang || lang || 'en';
    return this.appService.getHello(selectedLang);
  }
}
