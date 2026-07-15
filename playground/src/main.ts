import { Metrics, metrics } from '../../src/index.js';
import { DemoUserCreationError } from './errors/DemoUserCreationError.js';
import { MissingPlaygroundElementError } from './errors/MissingPlaygroundElementError.js';

import './style.css';

class UserCreator {
  @Metrics()
  public async create(shouldFail = false): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (shouldFail) {
      throw new DemoUserCreationError();
    }
  }
}

const creator = new UserCreator();

function element(identifier: string): HTMLElement {
  const found = document.getElementById(identifier);

  if (!found) {
    throw new MissingPlaygroundElementError(identifier);
  }

  return found;
}

function render(): void {
  const snapshot = metrics.snapshot();
  const calls = snapshot.metrics.filter(({ name }) => name.endsWith('.calls'));
  const failures = snapshot.metrics.filter(({ name }) =>
    name.endsWith('.failures'),
  );
  const durations = snapshot.metrics.filter(({ name }) =>
    name.endsWith('.duration'),
  );
  const averageDuration = durations.length
    ? durations.reduce((total, entry) => total + entry.value, 0) /
      durations.length
    : 0;

  element('calls').textContent = calls.length.toString();
  element('failures').textContent = failures.length.toString();
  element('duration').textContent = `${averageDuration.toFixed(1)} ms`;
  element('buffered').textContent = (
    snapshot.metrics.length + snapshot.logs.length
  ).toString();
  element('metric-output').textContent = snapshot.metrics.length
    ? JSON.stringify(snapshot.metrics.toReversed().slice(0, 12), null, 2)
    : 'Run an action to collect metrics.';
  element('log-output').textContent = snapshot.logs.length
    ? JSON.stringify(snapshot.logs.toReversed().slice(0, 8), null, 2)
    : 'Run an action to collect logs.';
}

async function run(shouldFail: boolean): Promise<void> {
  try {
    await creator.create(shouldFail);
  } catch {
    // The failure appears in the log panel with its stack trace.
  }

  render();
}

element('success').addEventListener('click', () => void run(false));
element('failure').addEventListener('click', () => void run(true));
element('clear').addEventListener('click', () => {
  metrics.clear();
  render();
});

render();
