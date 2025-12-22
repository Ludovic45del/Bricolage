import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = req.user?.id || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = res;
        const responseTime = Date.now() - now;

        // Log réussi
        this.logger.log({
          method,
          url,
          statusCode,
          responseTime: `${responseTime}ms`,
          userId,
          ip,
          userAgent: userAgent.substring(0, 100), // Limiter la longueur
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;

        // Log erreur
        this.logger.error({
          method,
          url,
          statusCode: error.status || 500,
          responseTime: `${responseTime}ms`,
          userId,
          ip,
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });

        throw error;
      }),
    );
  }
}
