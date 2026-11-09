import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình global prefix /api
  app.setGlobalPrefix('api');

  // Cấu hình Swagger Documentation tại /api/docs
  const config = new DocumentBuilder()
    .setTitle('NestJS Tutorial')
    .setDescription('The NestJS Tutorial API description')
    .setVersion('1.0')
    .addTag('Hello')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('Server is running on: http://localhost:3000/api/hello');
  console.log('Swagger UI is running on: http://localhost:3000/api/docs');
}

bootstrap();
