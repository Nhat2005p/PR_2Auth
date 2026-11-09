import { Module } from '@nestjs/common';
import * as path from 'path';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
