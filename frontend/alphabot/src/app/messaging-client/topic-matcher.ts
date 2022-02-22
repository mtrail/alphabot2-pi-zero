import {Injectable} from '@angular/core';

/**
 * Matches exact topics as used when publishing messages against subscription topics.
 *
 */
@Injectable({
  providedIn: 'root',
})
export class TopicMatcher {

  public matchesSubscriptionTopic(testeeTopic: string, subscriptionTopic: string): boolean {
    const testeeSegments = testeeTopic.split('/');
    const subscriptionTopicSegments = subscriptionTopic.split('/');

    for (let i = 0; i < subscriptionTopicSegments.length; i++) {
      const subscriptionTopicSegment = subscriptionTopicSegments[i];
      const testee = testeeSegments[i];
      const isLastSubscriptionTopicSegment = (i === subscriptionTopicSegments.length - 1);

      if (testee === undefined) {
        return false;
      }

      if (subscriptionTopicSegment === '#' && isLastSubscriptionTopicSegment) {
        return true;
      }

      if (subscriptionTopicSegment === '+') {
        continue;
      }

      if (subscriptionTopicSegment !== testee) {
        return false;
      }
    }
    return testeeSegments.length === subscriptionTopicSegments.length;
  }
}
