import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { MeUseCase } from '../../application/use-cases/me.use-case';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly meUseCase: MeUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica usuário e retorna token JWT' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute({ email: dto.email, senha: dto.senha });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna nome e email do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário logado' })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado',
  })
  me(@CurrentUser() userId: number) {
    return this.meUseCase.execute({ userId });
  }
}
