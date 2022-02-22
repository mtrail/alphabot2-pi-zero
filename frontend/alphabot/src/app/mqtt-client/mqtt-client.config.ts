/**
 * Specifies how to connect to messaging broker.
 */
export interface MqttClientConfig {

  /**
   * Specifies the client identifier for this connection.
   */
  clientId: string;

  /**
   * Time [ms] to wait before reconnecting to the broker if the connection cannot be established.
   */
  reconnectInterval: number;

  /**
   * The address of the messaging server, as a fully qualified WebSocket URI, as a DNS name or dotted decimal IP address.
   */
  host: string;

  /**
   * The port number to connect to - only required if host is not a URI.
   */
  port: number;

  /**
   * The path on the host to connect to - only used if host is not a URI. Default: '/mqtt'.
   */
  path?: string;

  /**
   * Optional configuration given to Paho client to connect to the broker.
   */
  connectOptions?: mqtt.ConnectOptions<any>;
}
