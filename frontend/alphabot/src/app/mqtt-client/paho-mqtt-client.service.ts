import {Inject} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Connector} from './connector';
import {ConnectionState, MqttClient} from './mqtt-client.service';
import {MqttClientConfig} from './mqtt-client.config';
import {MQTT_CLIENT_CONFIG} from './mqtt-client.token';

export class PahoMqttClient extends MqttClient {

  private connector: Connector;
  private subscriptions: Map<string, mqtt.SubscribeOptions<any>>;

  private _stream$: Subject<mqtt.Message>;

  public get stream$(): Observable<mqtt.Message> {
    return this._stream$.asObservable();
  }

  private _connection$: BehaviorSubject<ConnectionState>;

  public get connection$(): Observable<ConnectionState> {
    return this._connection$.asObservable();
  }

  // Use project specific typings for Paho client because more accurate than typings from ng2-mqtt/mqttws31
  constructor(_client: mqtt.Client, @Inject(MQTT_CLIENT_CONFIG) config: MqttClientConfig) {
    super();
    this.subscriptions = new Map<string, mqtt.SubscribeOptions<any>>();

    this._stream$ = new Subject<mqtt.Message>();
    this._connection$ = new BehaviorSubject<ConnectionState>(ConnectionState.NO_CONNECT);

    _client.onConnectionLost = this.onConnectionLost.bind(this);
    _client.onMessageArrived = this.onMessage.bind(this);
    this.connector = new Connector(_client, this.onConnect.bind(this), this.onConnectFailed.bind(this), config);
  }

  public connect(): void {
    this.connector.connect$().then();
  }

  public publish(destination: string, payload: string, qos: number, retained: boolean): void {
    this.connector.connect$().then((client: mqtt.Client) => client.send(destination, payload, qos, retained));
  }

  public subscribe<CTX>(destination: string, options: mqtt.SubscribeOptions<CTX> = {}): Promise<void> {
    return this.connector.connect$().then((client: mqtt.Client): Promise<void> => new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {  // tslint:disable-line:typedef
      client.subscribe<CTX>(destination, {
        ...options,
        onSuccess: (success: mqtt.SubscribeSuccess<CTX>): void => {
          console.log(`Subscribed to destination '${destination}'`);
          if (options.onSuccess) {
            options.onSuccess(success);
          }
          resolve();
        },
        onFailure: (failure: mqtt.SubscribeFailure<CTX>): void => {
          console.error(`Failed to subscribe to destination '${destination}' [errorCode=${failure.errorCode}, errorMsg=${failure.errorMessage}]`);
          if (options.onFailure) {
            options.onFailure(failure);
          }
          reject(failure);
        },
      } as mqtt.SubscribeOptions<CTX>);
      this.subscriptions.set(destination, options);
    }));
  }

  public unsubscribe<CTX>(destination: string, options?: mqtt.UnsubscribeOptions<CTX>): void {
    // Add success and error handler if not set yet
    const onSuccess = (): void => console.log(`Unsubscribed from destination '${destination}'`);
    const onFailure = (failure: mqtt.SubscribeFailure<CTX>): void => console.error(`Failed to unsubscribe from destination '${destination}' [errorCode=${failure.errorCode}, errorMsg=${failure.errorMessage}]`);
    options = {onSuccess, onFailure, ...options};

    this.subscriptions.delete(destination);
    this.connector.ifConnectedThen(client => client.unsubscribe<CTX>(destination, options));
  }

  public destroy(): void {
    this.connector.destroy();
  }

  /**
   * Invoked if connected to the message broker.
   */
  private onConnect(client: mqtt.Client): void {
    console.log(`Connected to message broker [host=${client.host}:${client.port}, path=${client.path}, clientId=${client.clientId}]`);
    this._connection$.next(ConnectionState.ONLINE);
  }

  /**
   * Invoked if there could not be established a connection to the message broker.
   */
  private onConnectFailed(failure: mqtt.ConnectFailure<Connector>, client: mqtt.Client): void {
    console.warn(`Failed to connect to message broker. [code=${failure.errorCode}, cause=${failure.errorMessage}, host=${client.host}:${client.port}, path=${client.path}, clientId=${client.clientId}]`); // tslint:disable-line:max-line-length
    this._connection$.next(ConnectionState.OFFLINE);
  }

  /**
   * Invoked upon connection loss to the message broker.
   */
  private onConnectionLost(failure: mqtt.ConnectionLostFailure): void {
    console.warn(`Connection lost to message broker. Trying to reconnect [error=${failure.errorMessage}]`);
    this._connection$.next(ConnectionState.OFFLINE);
    this.connector.connect$().then(this.restoreSubscriptions.bind(this));
  }

  /**
   * Invoked upon the receipt of a message.
   */
  private onMessage(message: mqtt.Message): void {
    // console.debug(`Message received [dest=${message.destinationName}, payload=${message.payloadString}]`);
    this._stream$.next(message);
  }

  /**
   * Restores subscriptions upon a connection loss.
   */
  private restoreSubscriptions(client: mqtt.Client): void {
    this.subscriptions.forEach((options: mqtt.SubscribeOptions<any>, destination: string) => {
      console.log(`Restore subscription [dest=${destination}]`);
      client.subscribe(destination, options);
    });
  }
}
