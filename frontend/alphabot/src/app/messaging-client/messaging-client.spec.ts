import {TestBed} from '@angular/core/testing';

import {MessagingClient} from './messaging-client';
import {MqttClientModule} from '../mqtt-client';

describe('MessagingClientService', () => {
  let service: MessagingClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MqttClientModule.forSpec(),
      ],
    });
    service = TestBed.inject(MessagingClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
