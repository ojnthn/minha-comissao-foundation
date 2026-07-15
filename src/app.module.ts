import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging/logging.interceptor';
import { AppController } from './app.controller';
import { ProdutosModule } from './modules/produtos/produtos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    ProdutosModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
