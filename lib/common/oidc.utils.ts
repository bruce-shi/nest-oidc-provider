import { ExecutionContext } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

export function validatePath(pathname?: string) {
  return (
    '/' +
    (pathname || '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\/+/g, '/')
  );
}

export function getReqRes(ctx: ExecutionContext) {
  const http = ctx.switchToHttp();
  return {
    req: http.getRequest<FastifyRequest>().raw,
    res: http.getResponse<FastifyReply>().raw,
  };
}
