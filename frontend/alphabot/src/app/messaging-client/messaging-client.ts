import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {MqttClient} from '../mqtt-client';
import {merge, MonoTypeOperatorFunction, Observable, Observer, Subject, TeardownLogic} from 'rxjs';
import {filter, finalize, takeUntil} from 'rxjs/operators';
import {TopicSubscriptionCounter} from './topic-subscription-counter';
import {TopicMatcher} from './topic-matcher';
import {throwIfInAngularZone} from '../util/operators';

export type ContinueExecutionFn = () => void;
export type ExecutionFn = (fn: ContinueExecutionFn) => void;
export function observeInside<T>(executionFn: ExecutionFn): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> => {
    return new Observable((observer: Observer<T>): TeardownLogic => {
      const subscription = source.subscribe({
        next: next => executionFn(() => observer.next(next)),
        error: error => executionFn(() => observer.error(error)),
        complete: () => executionFn(() => observer.complete()),
      });

      return () => subscription.unsubscribe();
    });
  };
}

@Injectable({
  providedIn: 'root',
})
export class MessagingClient implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _subscriptionCounter = new TopicSubscriptionCounter();

  constructor(private _mqttClient: MqttClient,
              private _topicMatcher: TopicMatcher,
              private _zone: NgZone) {
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public publish(destination: string, payload: string): void {
    this._mqttClient.publish(destination, payload, 0, false);
  }

  public observe$(topic: string): Observable<mqtt.Message> {
    return new Observable<mqtt.Message>((observer: Observer<mqtt.Message>): TeardownLogic => {
      console.log('[msgc] observer subscribed:', topic);
      const unsubscribe$ = new Subject<void>();

      this._zone.runOutsideAngular(() => {
        this._mqttClient.stream$.pipe(
          throwIfInAngularZone('MQTT'),
          filter(message => this._topicMatcher.matchesSubscriptionTopic(message.destinationName, topic)),
          observeInside(continueFn => this._zone.run(continueFn)),
          takeUntil(merge(this._destroy$, unsubscribe$)),
          finalize(() => {
            console.log('[msgc] finalize:', topic);
            // Unsubscribe from the topic on the mqtt-client, but only if being the last subscription on that topic
            if (this._subscriptionCounter.decrementAndGet(topic) === 0) {
              console.log('[msgc] unsubscribe:', topic);
              this._mqttClient.unsubscribe(topic);
            }
          }),
        ).subscribe(observer);

        // Subscribe to the topic on the mqtt-client, but only if being the first subscription on that topic.
        if (this._subscriptionCounter.incrementAndGet(topic) === 1) {
          console.log('[msgc] subscribe:', topic);
          this._mqttClient.subscribe(topic).then();
        }
      });

      return (): void => {
        unsubscribe$.next();
      };
    });
  }
}
