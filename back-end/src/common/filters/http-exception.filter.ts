import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Ignorar erros 404 na rota raiz
    if (exception instanceof HttpException && exception.getStatus() === HttpStatus.NOT_FOUND && request.url === '/') {
      this.logger.warn(`Rota raiz não encontrada: ${request.url}`);
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Rota raiz não encontrada, mas o filtro está ignorando.',
        path: request.url,
      });
      return;
    }
    
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message || 'Erro interno do servidor';

    this.logger.error(`${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`);
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
