import {Inject, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';

import {MqttClient} from './mqtt-client.service';
import {MqttClientConfig} from './mqtt-client.config';
import {PahoMqttClient} from './paho-mqtt-client.service';
import {NullMqttClient} from './null-mqtt-client.service';
import {Paho} from 'ng4-mqtt/mqttws31'; // simply provides 'mqttws31.js' as NPM artifact
import {MQTT_CLIENT_CONFIG} from './mqtt-client.token';
import {UUID} from '../util/uuid.util';

/**
 * Provides global MQTT-Client functionality.
 */
@NgModule()
export class MqttClientModule {

  constructor(@Optional() @SkipSelf() parentModule: MqttClientModule) {
    MqttClientModule.throwIfAlreadyLoaded(parentModule);
  }

  private static throwIfAlreadyLoaded(parentModule: any): void {
    if (parentModule) {
      throw new Error(`MqttClientModule.forRoot() called twice. Lazy loaded modules should use MqttClientModule.forChild() instead.`); // tslint:disable-line:max-line-length
    }
  }

  /**
   * To manifest a dependency to 'mqtt-client.module' from application module, AppModule.
   *
   * Call `forRoot` only in the root application module. Calling it in any other module, particularly in a
   * lazy-loaded module, will produce a runtime error.
   *
   * ```
   * @NgModule({
   *   declarations: [
   *     ...
   *   ],
   *   imports: [
   *     ...
   *     MqttClientModule.forRoot(environment.MQTT_CLIENT_CONFIG)
   *   ],
   *   providers: [
   *     ...
   *   ],
   *   bootstrap: [AppComponent],
   * })
   * export class AppModule { }
   * ```
   * @param config MQTT-Client configuration.
   *
   */
  public static forRoot(config: MqttClientConfig): ModuleWithProviders<MqttClientModule> {
    return {
      ngModule: MqttClientModule,
      providers: [
        {
          provide: MQTT_CLIENT_CONFIG,
          useValue: config,
        },
        {
          provide: MqttClient,
          useFactory: pahoMqttClientFactory,
          deps: [[new Inject(MQTT_CLIENT_CONFIG)]],
        },
      ],
    };
  }

  /**
   * To manifest a dependency to 'mqtt-client.module' from within a feature module.
   */
  public static forChild(): ModuleWithProviders<MqttClientModule> {
    return {
      ngModule: MqttClientModule,
      providers: [], // do not register any providers in 'forChild' but in 'forRoot' instead
    };
  }

  /**
   * To manifest a dependency to 'mqtt-client.module' from tests to install a {NullMqttClient} which does nothing.
   */
  public static forSpec(): ModuleWithProviders<MqttClientModule> {
    return {
      ngModule: MqttClientModule,
      providers: [
        {
          provide: MqttClient,
          useClass: NullMqttClient,
        },
      ],
    };
  }
}

export function pahoMqttClientFactory(config: MqttClientConfig): MqttClient {
  const clientId = `${config.clientId}-${UUID.randomUUID()}`;
  const host = config.host ? config.host : window.location.hostname;
  const client: any = new Paho.MQTT.Client(host, config.port, config.path || '/mqtt', clientId);
  return new PahoMqttClient(client, config);
}

