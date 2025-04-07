import { Controller, Get, All } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Home Endpoint', description: 'Returns information about the API' })
  @ApiResponse({ status: 200, description: 'API information returned successfully' })
  getHello() {
    return this.appService.getHello();
  }
  
  // Rota adicional como fallback para garantir que a raiz seja capturada
  @All()
  @ApiOperation({ summary: 'Root fallback endpoint', description: 'Fallback for root path' })
  getRootFallback() {
    return this.getHello();
  }
}
