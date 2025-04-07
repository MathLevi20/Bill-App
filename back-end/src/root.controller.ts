
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Root Test Endpoint' })
  @ApiResponse({ status: 200 })
  getRoot() {
    return { message: 'Root endpoint is working!' };
  }
}