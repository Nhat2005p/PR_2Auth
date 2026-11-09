import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockI18nService = {
    t: jest.fn((key: string, options?: any) => {
      if (key === 'app.hello') {
        return Promise.resolve(
          options?.lang === 'vi' ? 'Xin chào thế giới!' : 'Hello World!',
        );
      }
      return Promise.resolve(key);
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello World!" for English', async () => {
      const result = await appController.getHello('en');
      expect(result).toBe('Hello World!');
    });

    it('should return "Xin chào thế giới!" for Vietnamese', async () => {
      const result = await appController.getHello('vi', 'vi');
      expect(result).toBe('Xin chào thế giới!');
    });
  });
});
