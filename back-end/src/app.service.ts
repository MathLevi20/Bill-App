import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'online',
      name: 'Bill-App API',
      version: '1.0.0',
      description: 'API para gerenciamento de faturas de energia elétrica',
      endpoints: {
        api_docs: '/api',
        clients: '/clients',
        bills: '/bills',
      },
      timestamp: new Date().toISOString()
    };
  }
}