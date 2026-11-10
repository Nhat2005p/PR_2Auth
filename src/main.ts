import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình global prefix /api
  app.setGlobalPrefix('api');

  // Cấu hình ValidationPipe tự động validate DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Cấu hình Swagger Documentation tại /api/docs
  const config = new DocumentBuilder()
    .setTitle('NestJS Tutorial')
    .setDescription('The NestJS Tutorial API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Hello')
    .addTag('Auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}/api/hello`);
  console.log(`Swagger UI is running on: http://localhost:${port}/api/docs`);
}

bootstrap();
