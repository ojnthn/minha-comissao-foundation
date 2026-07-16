import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging/logging.interceptor';
import { AppController } from './app.controller';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { AuthModule } from './modules/auth/auth.module';
import { MarceneiroModule } from './modules/marceneiro/marceneiro.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    ProdutosModule,
    AuthModule,
    MarceneiroModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
