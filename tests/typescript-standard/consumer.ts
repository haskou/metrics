import { Metrics } from '@haskou/metrics';

class StandardDecoratorConsumer {
  @Metrics()
  public create(identifier: string): string {
    return identifier;
  }
}

const identifier: string = new StandardDecoratorConsumer().create('user-id');

void identifier;
