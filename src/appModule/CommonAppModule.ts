import { DynamicModule, Global, Module, Scope } from "@nestjs/common"
import { ConfigModule } from "../config/ConfigModule"
import { LoggerModule } from "../logger/LoggerModule"
import { APP_FILTER, HttpAdapterHost, REQUEST } from "@nestjs/core"
import { LoggerConfig } from "../logger/LoggerConfig"
import { LoggerService } from "../logger/LoggerService"
import TenantContext from "../context/TenantContext"
import { ServerException } from "../errorHandling/exceptions/ServerException"
import { GlobalErrorFilter } from "../errorHandling/GlobalErrorFilter"
import { TenantContextFactory } from "../context/TenantContextFactory"
import { RetailCommonConfig } from "../config/interface/RetailCommonConfig"
import { ConfigMapper } from "../config/legacyInterfaces/ConfigMapper"
import { LoadBalancingTimeoutBootstrap } from "../helpers/LoadBalancingTimeoutBootstrap"
import { RetailCommonConfigProvider } from "../config/RetailCommonConfigProvider"

/**
 * Import this module from AppModule in your projects like this:
 * imports: [CommonAppModule.register(config),...]
 * You must pass in a config object that
 */
@Global()
@Module({})
export class CommonAppModule {
  static forRoot(config: RetailCommonConfig): DynamicModule {
    const configProvider = new RetailCommonConfigProvider(config)
    const loggerConfig: LoggerConfig = ConfigMapper.mapToLoggerConfig(configProvider.config)
    const logger = new LoggerService(loggerConfig)

    if (process.listenerCount("unhandledRejection") > 0) {
      logger.warn(
        "CommonAppModule",
        "There is already an 'unhandledRejection' handler, not adding sprinting-retail-common one."
      )
    } else {
      process.on("unhandledRejection", (reason) => {
        logger.logError(
          new ServerException("UnhandledRejectionError", "A Promise rejection was not handled.", null, <Error>reason)
        )
      })
    }

    return {
      module: CommonAppModule, // needed for dynamic modules
      imports: [ConfigModule.forRoot(configProvider), LoggerModule.forRoot(configProvider)],
      providers: [
        {
          provide: LoadBalancingTimeoutBootstrap,
          useFactory: (refHost: HttpAdapterHost<any>, logger: LoggerService) =>
            new LoadBalancingTimeoutBootstrap(refHost, logger),
          inject: [HttpAdapterHost, LoggerService],
        },
        {
          provide: TenantContext,
          scope: Scope.REQUEST,
          useFactory: (request: Request) => TenantContextFactory.getTenantContext(request),
          inject: [REQUEST],
        },
        {
          provide: APP_FILTER,
          useFactory: (logger: LoggerService, tenantContext: TenantContext) =>
            new GlobalErrorFilter(logger, { tenantId: tenantContext.tenantIdOrUndefined }),
          inject: [LoggerService, TenantContext],
          scope: Scope.REQUEST,
        },
      ],
      exports: [ConfigModule, LoggerModule, TenantContext],
    }
  }
}
