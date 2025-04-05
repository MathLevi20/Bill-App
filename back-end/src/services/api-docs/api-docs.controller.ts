import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('documentation')
@Controller('docs')
export class ApiDocsController {
  
  @Get('swagger.json')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename=swagger.json')
  @ApiOperation({ summary: 'Download Swagger JSON file' })
  @ApiResponse({ status: 200, description: 'Swagger specification in JSON format' })
  @ApiResponse({ status: 404, description: 'Swagger specification file not found' })
  downloadSwaggerJson(@Res() res: Response): void {
    const filePath = path.resolve(process.cwd(), 'swagger-spec.json');
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'swagger.json');
    } else {
      res.status(404).json({ message: 'Arquivo swagger.json não encontrado' });
    }
  }
}
