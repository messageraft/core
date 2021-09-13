import {
  EmailProvider,
  InstantiatedProvider,
  ProviderClass,
  Provider,
  ProviderName,
  ProviderType,
  SmsOptions,
  SmsProvider,
  EmailOptions,
  Logger,
  DirectMessageProvider,
  DirectMessageOptions,
} from '@messageraft/common'
import clc from 'cli-color'

interface Options {
  providers: Provider[]
  logger: any
}

export class Core {
  providers: InstantiatedProvider[] = []
  logger: Logger

  constructor(options: Options) {
    this.logger = new options.logger('Core')
    this.providers = options.providers.map((provider) => {
      const {
        provider: providerClass,
      }: { provider: ProviderClass } = require(`@messageraft/${provider.name.toLowerCase()}`)

      if (!providerClass) {
        throw new Error(`Malformed package for provider ${provider.name}`)
      }

      const ProviderRef = new providerClass(provider.options)

      return ProviderRef
    })
    this.logger.log(
      clc.xterm(81)(
        `Loaded following providers: [${this.providers
          .map((provider) => provider.name)
          .join(', ')}]`
      )
    )
  }

  async send(data: EmailOptions | SmsOptions, providerName: ProviderName) {
    const requiredProvider = this.providers.find((provider) => provider.name === providerName)

    if (!requiredProvider) {
      throw new Error(`Provider: [${providerName}] is not loaded/installed`)
    }

    switch (requiredProvider.type) {
      case ProviderType.EMAIL:
        return (requiredProvider as EmailProvider).send(data as EmailOptions)
      case ProviderType.SMS:
        return (requiredProvider as SmsProvider).send(data as SmsOptions)
      case ProviderType.DIRECT_MESSAGE:
        return (requiredProvider as DirectMessageProvider).send(data as DirectMessageOptions)
      default:
        throw new Error(`Provider type ${requiredProvider.type} is not supported`)
    }
  }
}
