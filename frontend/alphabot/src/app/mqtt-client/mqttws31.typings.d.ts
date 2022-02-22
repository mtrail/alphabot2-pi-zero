/*
 * This file contains the type definitions for Eclipse Paho JavaScript Client (assets/js/mqttws31.js).
 *
 * Because Paho does not provide a type definition itself, nor there is a type definition publicly available [1], this file was crafted manually.
 *
 * [1] https://microsoft.github.io/TypeSearch/, https://github.com/DefinitelyTyped/DefinitelyTyped, https://npmsearch.com/
 */

/** Paho provided by MQTT library (mqttws31.js) */
declare const Paho: any;

declare namespace mqtt {

  interface Client {
    /**
     * The server's DNS hostname or dotted decimal IP address.
     */
    host: string;
    port: number;
    path: string;
    clientId: string;

    /**
     * Called when a connection has been lost after a connect() method has succeeded.
     * Establish the call back used when a connection has been lost. The connection may be lost because the client initiates a disconnect or because the server or network
     * cause the client to be disconnected. The disconnect call back may be called without the connectionComplete call back being invoked if, for example the client fails to
     * connect.
     */
    onConnectionLost: (failure: ConnectionLostFailure) => void;

    /**
     * Called when a message has been delivered.
     * All processing that this Client will ever do has been completed. So, for example, in the case of a Qos=2 message sent by this client, the PubComp flow has been received from the server
     * and the message has been removed from persistent storage before this callback is invoked.
     */
    onMessageDelivered: (message: Message) => void;

    /**
     * Called when a message has arrived.
     */
    onMessageArrived: (message: Message) => void;

    /**
     * Connect this Messaging client to its server.
     *
     * @param options used to connect to the broker.
     * @param <CTX> invocation context (`this`-reference) of the caller to be used in callbacks.
     */
    connect<CTX>(options: ConnectOptions<CTX>): void;

    /**
     * Subscribe for messages, request receipt of a copy of messages sent to the destinations described by the filter.
     *
     * @param filter describing the destinations to receive messages from.
     * @param options used to control the subscription
     * @param <CTX> invocation context (`this`-reference) of the caller to be used in callbacks.
     */
    subscribe<CTX>(filter: string, options?: SubscribeOptions<CTX>): void;

    /**
     * Unsubscribe for messages, stop receiving messages sent to destinations described by the filter.
     *
     * @param filter describing the destinations to receive messages from.
     * @param options used to control the subscription.
     * @param <CTX> invocation context (`this`-reference) of the caller to be used in callbacks.
     */
    unsubscribe<CTX>(filter: string, options?: UnsubscribeOptions<CTX>): void;

    /**
     * Send a message to the consumers of the destination in the Message.
     *
     * @param topic The name of the destination to which the message is to be sent. If it is the only parameter, used as {@link Message} object.
     * @param payload The message data to be sent.
     * @param qos The Quality of Service used to deliver the message.
     *          0: Best effort (default)
     *          1: At least once
     *          2: Exactly once
     * @param retained If true, the message is to be retained by the server and delivered to both current and future subscriptions.
     *                 If false the server only delivers the message to current subscribers, this is the default for new Messages.
     *                 A received message has the retained boolean set to true if the message was published with the retained boolean
     *                 set to true and the subscrption was made after the message has been published.
     */
    send(topic: string | Message, payload: string | ArrayBuffer, qos: number, retained: boolean): void;

    /**
     * Normal disconnect of this Messaging client from its server.
     */
    disconnect(): void;

    /**
     * Get the contents of the trace log.
     */
    getTraceLog(): unknown;

    /**
     * Start tracing.
     */
    startTrace(): void;

    /**
     * Stop tracing.
     */
    stopTrace(): void;

    isConnected(): boolean;
  }

  /**
   * Attributes used with the connection.
   */
  interface ConnectOptions<CTX> {
    /**
     * If the connect has not succeeded within this number of seconds, it is deemed to have failed. The default is 30 seconds
     */
    timeout?: number;

    /**
     * Authentication username for this connection.
     */
    userName?: string;

    /**
     * Authentication password for this connection.
     */
    password?: string;

    /**
     * Sent by the server when the client disconnects abnormally.
     */
    willMessage?: Message;

    /**
     * The server disconnects this client if there is no activity for this number of seconds.
     * The default value of 60 seconds is assumed if not set.
     */
    keepAliveInterval?: number;

    /**
     * If true(default) the client and server persistent state is deleted on successful connect.
     */
    cleanSession?: boolean;

    /**
     * If present and true, use an SSL Websocket connection.
     */
    useSSL?: boolean;

    /**
     * Passed to the 'onSuccess' or 'onFailure' callback.
     */
    invocationContext?: CTX;

    /**
     * If present this contains either a set of hostnames or fully qualified WebSocket URIs (ws://example.com:1883/mqtt),
     * that are tried in order in place of the host and port paramater on the construtor. The hosts are tried one at at
     * time in order until one of then succeeds.
     */
    hosts?: string[];

    /**
     * If present the set of ports matching the hosts. If hosts contains URIs, this property is not used.
     */
    ports?: number[];

    /**
     * MQTT version
     */
    mqttVersion?: number;

    /**
     * Called when the connect acknowledgement has been received from the server.
     */
    onSuccess?(success: ConnectSuccess<CTX>): void;

    /**
     * Called when the connect request has failed or timed out.
     */
    onFailure?(failure: ConnectFailure<CTX>): void;
  }

  interface ConnectSuccess<CTX> {
    /**
     * as passed in {@link ConnectOptions}.
     */
    invocationContext: CTX;
  }

  interface ConnectFailure<CTX> {
    /**
     * as passed in {@link ConnectOptions}.
     */
    invocationContext: CTX;
    errorCode: number;
    errorMessage: string;
  }

  interface ConnectionLostFailure {
    errorCode?: number;
    errorMessage?: string;
  }

  interface SubscribeOptions<CTX> {
    /**
     * the maximum qos of any publications sent as a result of making this subscription.
     */
    qos?: number;
    /**
     * passed to the 'onSuccess' or 'onFailure' callback.
     */
    invocationContext?: CTX;
    /**
     * which, if present, determines the number of seconds after which the onFailure calback is called.
     * The presence of a timeout does not prevent the onSuccess callback from being called when the subscribe completes.
     */
    timeout?: number;

    /**
     * called when the subscribe acknowledgement has been received from the server.
     */
    onSuccess?(success: SubscribeSuccess<CTX>): void;

    /**
     * called when the subscribe request has failed or timed out.
     */
    onFailure?(failure: SubscribeFailure<CTX>): void;
  }

  interface UnsubscribeOptions<CTX> {
    /**
     * passed to the 'onSuccess' or 'onFailure' callback.
     */
    invocationContext?: CTX;
    /**
     * which, if present, determines the number of seconds after which the onFailure callback is called.
     * The presence of a timeout does not prevent the onSuccess callback from being called when the unsubscribe completes.
     */
    timeout?: number;

    /**
     * called when the unsubscribe acknowledgement has been received from the server.
     */
    onSuccess?(success: SubscribeSuccess<CTX>): void;

    /**
     * called when the unsubscribe request has failed or timed out.
     */
    onFailure?(failure: SubscribeFailure<CTX>): void;
  }

  interface SubscribeSuccess<CTX> {
    /**
     * as passed in {@link SubscribeOptions}.
     */
    invocationContext: CTX;
  }

  interface SubscribeFailure<CTX> {
    /**
     * as passed in {@link SubscribeOptions}.
     */
    invocationContext: CTX;
    errorCode: number;
    errorMessage: string;
  }

  /**
   * An application message, sent or received.
   *
   * All attributes may be null, which implies the default values.
   */
  interface Message {
    /**
     * The payload as a string if the payload consists of valid UTF-8 characters.
     */
    payloadString?: string;

    /**
     * The payload as an array buffer.
     */
    payloadBytes?: ArrayBuffer;

    /**
     * The name of the destination to which the message is to be sent or the name of the destination from which the message has been received.
     */
    destinationName: string;

    /**
     * The Quality of Service used to deliver the message.
     *  0: Best effort (default)
     *  1: At least once
     *  2: Exactly once
     *
     */
    qos: number;

    /**
     * If true, the message is to be retained by the server and delivered to both current and future subscriptions.
     * If false the server only delivers the message to current subscribers, this is the default for new Messages.
     * A received message has the retained boolean set to true if the message was published with the retained boolean set to true and the subscrption was made after the message has been published.
     */
    retained: boolean;

    /**
     * If true, this message might be a duplicate of one which has already been received.
     * This is only set on messages received from the server.
     */
    duplicate: boolean;
  }
}
