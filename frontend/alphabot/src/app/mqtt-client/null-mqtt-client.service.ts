import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ConnectionState, MqttClient} from './mqtt-client.service';

/**
 * MQTT-Client (Message Queue Telemetry Transport) which does not do anything and is based on dummy {Observable}s.
 */
@Injectable()
export class NullMqttClient extends MqttClient {

  private _stream$ = new Subject<mqtt.Message>();

  public get stream$(): Observable<mqtt.Message> {
    return this._stream$.asObservable();
  }

  private _connection$ = new BehaviorSubject<ConnectionState>(ConnectionState.NO_CONNECT);

  public get connection$(): Observable<ConnectionState> {
    return this._connection$.asObservable();
  }

  constructor() {
    super();
    console.log('Using \'NullMqttClient\' for MQTT messaging');
  }

  public connect(): void {
    this._connection$.next(ConnectionState.ONLINE);
  }

  public publish(destination: string, payload: string, qos: number, retained: boolean): void {
    console.log('publish ' + destination + ' ' + payload);
  }

  public subscribe<CTX>(destination: string, options?: mqtt.SubscribeOptions<CTX>): Promise<void> {
    return Promise.resolve();
  }

  public unsubscribe<CTX>(destination: string, options?: mqtt.UnsubscribeOptions<CTX>): void {
    console.log('unsubscribe ' + destination);
  }

  public destroy(): void {
    this._connection$.next(ConnectionState.OFFLINE);
  }
}
