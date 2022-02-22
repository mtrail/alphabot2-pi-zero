import {MqttClientConfig} from './mqtt-client.config';

/**
 * Connects to the message broker.
 */
export class Connector {

  private connectHandles: any[] = [];

  /**
   * Promise used while establishing a connection to the broker.
   */
  private whenConnected$: Promise<mqtt.Client> | null = null;

  /**
   * @param client to communicate with message broker.
   * @param onConnect is invoked after the connection is established.
   * @param onConnectFailed is invoked if the connection cannot be established.
   * @param config MQTT configuration
   */
  constructor(private client: mqtt.Client, private onConnect: OnConnect, private onConnectFailed: OnConnectFailed, private config: MqttClientConfig) {
  }

  /**
   * Connects to the message broker if not connected yet.
   *
   * If it fails to connect, connecting is retried after configured 'reconnectInterval' until the
   * connection can be established.
   *
   * @return promise to interact with the broker upon successful connection.
   *         If already connected the promise is resolved immediately.
   */
  public connect$(): Promise<mqtt.Client> {
    if (this.client.isConnected()) {
      return Promise.resolve(this.client);
    }

    return this.whenConnected$ || (this.whenConnected$ = new Promise<mqtt.Client>((resolve: (client: mqtt.Client) => void): void => {
      const options: mqtt.ConnectOptions<any> = this.config.connectOptions || {};

      this.connectHandles.length = 0;
      this.client.connect<any>({
        ...options,
        onSuccess: (success: mqtt.ConnectSuccess<any>): void => {
          if (options && options.onSuccess) {
            options.onSuccess(success); // delegate to configured 'onSuccess' method
          }

          this.whenConnected$ = null;
          this.onConnect(this.client);
          resolve(this.client);
        },
        onFailure: (failure: mqtt.ConnectFailure<any>): void => {
          if (options && options.onFailure) {
            options.onFailure(failure); // delegate to configured 'onFailure' method
          }

          this.whenConnected$ = null;
          this.onConnectFailed(failure, this.client);

          // Reconnecting to message broker
          const millis = this.config.reconnectInterval;
          console.log(`Reconnect to the message broker in ${millis}ms`);
          const handle = setTimeout(() => this.connect$().then(resolve), millis);
          this.connectHandles.push(handle);
        },
      } as mqtt.ConnectOptions<any>);
    }));
  }

  public destroy(): void {
    this.connectHandles.forEach(handle => clearTimeout(handle));
    this.connectHandles.length = 0;
    this.ifConnectedThen(client => client.disconnect());
  }

  /**
   * Executes the specified action if connected to the broker.
   */
  public ifConnectedThen(thenFn: (client: mqtt.Client) => void): void {
    if (this.client.isConnected()) {
      thenFn(this.client);
    }
  }
}

/**
 * Invoked after the connection is established.
 */
export type OnConnect = (client: mqtt.Client) => void;

/**
 * Invoked if no connection could be established to reconnect to the message broker.
 *
 * @param failure the cause of the connecting problem.
 * @param client used to connect to the message broker.
 *
 * @return handle for the reconnect.
 */
export type OnConnectFailed = (failure: mqtt.ConnectFailure<Connector>, client: mqtt.Client) => void;
