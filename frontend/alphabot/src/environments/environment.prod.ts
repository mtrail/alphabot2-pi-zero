import {MqttClientConfig} from '../app/mqtt-client';

const MQTT_CLIENT_CONFIG: MqttClientConfig = {
  clientId: 'tst-ui',
  reconnectInterval: 10000,
  host: 'alphabot2.local',
  port: 8080,
  path: '/mqtt/',
  connectOptions: {
    useSSL: false,
    timeout: 60,
  },
};

export const environment = {
  production: false,
  mqttConfig: MQTT_CLIENT_CONFIG,
};
