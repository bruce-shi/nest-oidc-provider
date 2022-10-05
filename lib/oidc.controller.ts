import {
  All,
  Controller,
  Req,
  Res,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Provider } from 'oidc-provider';
import { PATH_METADATA, VERSION_METADATA } from '@nestjs/common/constants';
import { IncomingMessage, ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller()
export class OidcController {
  private callback: (req: IncomingMessage, res: ServerResponse) => void;

  constructor(
    readonly provider: Provider,
    private readonly moduleRef: ModuleRef,
  ) {
    this.callback = provider.callback();
  }

  private getUrl(originalUrl: string) {
    let resultUrl = originalUrl;
    const appConfig = this.moduleRef['container']!.applicationConfig;
    const globalPrefix = appConfig!.getGlobalPrefix();
    const versioning = appConfig!.getVersioning();

    // Remove global prefix
    if (globalPrefix) {
      resultUrl = resultUrl.replace(globalPrefix, '');
    }

    // Remove version
    if (versioning?.type === VersioningType.URI) {
      const version: string | symbol =
        Reflect.getMetadata(VERSION_METADATA, OidcController) ??
        versioning.defaultVersion;

      if (version && version !== VERSION_NEUTRAL) {
        resultUrl = resultUrl.replace(/^\/*[^\/]+/, '');
      }
    }

    // Remove controller path
    const controllerPath = Reflect.getMetadata(PATH_METADATA, OidcController);
    resultUrl = resultUrl.replace(controllerPath, '');

    // Normalize
    return `/${resultUrl}`.replace(/^\/+/, '/');
  }

  @All('/*')
  public mountedOidc(@Req() req: FastifyRequest, @Res() res: FastifyReply): void {
    const request = req.raw;
    //@ts-ignore
    request.body = req.body
    request.url = this.getUrl(req.url)
    return this.callback(request, res.raw);
  }
}
