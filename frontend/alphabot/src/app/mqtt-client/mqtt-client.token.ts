import {InjectionToken} from '@angular/core';
import {MqttClientConfig} from './mqtt-client.config';

/**
 * Token to register the MQTT-Client configuration.
 */
export const MQTT_CLIENT_CONFIG = new InjectionToken<MqttClientConfig>('MQTT_CLIENT_CONFIG');
