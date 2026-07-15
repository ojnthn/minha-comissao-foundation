import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Verifica se a API está no ar' })
  @ApiResponse({ status: 200, description: 'API operacional' })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
