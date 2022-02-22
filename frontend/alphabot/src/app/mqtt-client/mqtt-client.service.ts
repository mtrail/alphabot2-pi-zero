import {Observable} from 'rxjs';

/**
 * MQTT-Client (Message Queue Telemetry Transport) to connect to a MQTT broker.
 *
 * Allows MQTT over Websockets to consume data from MQTT message broker.
 */
export abstract class MqttClient {

  /**
   * Stream of messages which this MQTT-Client is subscribed to.
   *
   * Use a filter to consume messages which are sent to a specific destination.
   *
   * ```
   * stream$().filter(Destinations.filterFor(...))
   * ```
   */
  public abstract get stream$(): Observable<mqtt.Message>;

  /**
   * To observe the connection state to the broker.
   */
  public abstract get connection$(): Observable<ConnectionState>;

  /**
   * Connects to the broker if not connected yet.
   */
  public abstract connect(): void;

  public abstract publish(destination: string, payload: string, qos: number, retained: boolean): void;

  /**
   * Subscribes to receive data sent to the specified destination. If not connected to the broker yet, a connection is established.
   *
   * @return Promise which is resolved upon successful subscription, or rejected if subscription fails.
   *
   * @see stream$ to consume data.
   */
  public abstract subscribe<CTX>(destination: string, options?: mqtt.SubscribeOptions<CTX>): Promise<void>;

  /**
   * Unsubscribes from the specified destination.
   */
  public abstract unsubscribe<CTX>(destination: string, options?: mqtt.UnsubscribeOptions<CTX>): void;

  /**
   * Disconnects from the broker and frees resources.
   */
  public abstract destroy(): void;
}

/**
 * Represents the connection state to the message broker.
 */
export enum ConnectionState {
  /**
   * Initial state upon construction as long as no connection attempt is done.
   */
  NO_CONNECT,
  /**
   * Indicates the link to the broker to be online, meaning that messages are received.
   */
  ONLINE,
  /**
   * Indicates the link to the broker to be offline, meaning that no messages are received.
   */
  OFFLINE
}

