import { metrics } from '../../src/index.js';
import { MissingPlaygroundElementError } from './errors/MissingPlaygroundElementError.js';
import { GitHubRepositoryFinder } from './github/GitHubRepositoryFinder.js';
import type { GitHubRepositorySummary } from './github/GitHubRepositorySummary.js';

import './style.css';

const finder = new GitHubRepositoryFinder();

function element<ElementType extends HTMLElement>(
  identifier: string,
): ElementType {
  const found = document.getElementById(identifier);

  if (!found) {
    throw new MissingPlaygroundElementError(identifier);
  }

  return found as ElementType;
}

const form = element<HTMLFormElement>('repository-form');
const repositoryInput = element<HTMLInputElement>('repository');
const submitButton = element<HTMLButtonElement>('inspect');
const result = element<HTMLElement>('result');
const resultStatus = element<HTMLElement>('result-status');
const resultName = element<HTMLAnchorElement>('result-name');
const resultDescription = element<HTMLElement>('result-description');
const resultStars = element<HTMLElement>('result-stars');
const resultForks = element<HTMLElement>('result-forks');
const resultIssues = element<HTMLElement>('result-issues');
const resultUpdated = element<HTMLElement>('result-updated');
const metricOutput = element<HTMLUListElement>('metric-output');
const logOutput = element<HTMLUListElement>('log-output');

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);
}

function emptyEvent(message: string): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'empty-event';
  item.textContent = message;
  return item;
}

function renderTelemetry(): void {
  const snapshot = metrics.snapshot();
  const calls = snapshot.metrics.filter(({ name }) => name.endsWith('.calls'));
  const failures = snapshot.metrics.filter(({ name }) =>
    name.endsWith('.failures'),
  );
  const durations = snapshot.metrics.filter(({ name }) =>
    name.endsWith('.duration'),
  );
  const lastDuration = durations.at(-1);

  element('calls').textContent = calls.length.toString();
  element('failures').textContent = failures.length.toString();
  element('duration').textContent = lastDuration
    ? `${lastDuration.value.toFixed(1)} ms`
    : '0 ms';
  element('logs').textContent = snapshot.logs.length.toString();

  const metricEvents = snapshot.metrics
    .toReversed()
    .slice(0, 12)
    .map((entry) => {
      const item = document.createElement('li');
      const heading = document.createElement('div');
      const name = document.createElement('strong');
      const timestamp = document.createElement('time');
      const value = document.createElement('span');

      item.className = 'event';
      heading.className = 'event-heading';
      name.textContent = entry.name;
      timestamp.textContent = formatTimestamp(entry.recordedAt);
      timestamp.dateTime = new Date(entry.recordedAt).toISOString();
      value.className = 'event-value';
      value.textContent = `${entry.value.toFixed(entry.unit === 'milliseconds' ? 1 : 0)} ${entry.unit}`;
      heading.append(name, timestamp);
      item.append(heading, value);
      return item;
    });

  metricOutput.replaceChildren(
    ...(metricEvents.length
      ? metricEvents
      : [emptyEvent('Inspect a repository to collect metrics.')]),
  );

  const logEvents = snapshot.logs
    .toReversed()
    .slice(0, 8)
    .map((entry) => {
      const item = document.createElement('li');
      const heading = document.createElement('div');
      const level = document.createElement('span');
      const timestamp = document.createElement('time');
      const message = document.createElement('strong');

      item.className = `event log-${entry.level}`;
      heading.className = 'event-heading';
      level.className = 'log-level';
      level.textContent = entry.level;
      timestamp.textContent = formatTimestamp(entry.recordedAt);
      timestamp.dateTime = new Date(entry.recordedAt).toISOString();
      message.className = 'log-message';
      message.textContent = entry.message;
      heading.append(level, timestamp);
      item.append(heading, message);

      if (entry.stackTrace) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const stackTrace = document.createElement('pre');

        summary.textContent = 'Stack trace';
        stackTrace.textContent = entry.stackTrace;
        details.append(summary, stackTrace);
        item.append(details);
      }

      return item;
    });

  logOutput.replaceChildren(
    ...(logEvents.length
      ? logEvents
      : [emptyEvent('Method calls and failures will appear here.')]),
  );
}

function renderRepository(repository: GitHubRepositorySummary): void {
  result.className = 'result result-success';
  resultStatus.textContent = 'Live response from GitHub';
  resultName.textContent = repository.fullName;
  resultName.href = repository.url;
  resultDescription.textContent =
    repository.description ?? 'This repository has no description.';
  resultStars.textContent = repository.stars.toLocaleString('en');
  resultForks.textContent = repository.forks.toLocaleString('en');
  resultIssues.textContent = repository.openIssues.toLocaleString('en');
  resultUpdated.textContent = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(repository.updatedAt));
}

function renderFailure(error: unknown): void {
  result.className = 'result result-failure';
  resultStatus.textContent = 'Request failed';
  resultName.removeAttribute('href');
  resultName.textContent = 'GitHub did not return a repository';
  resultDescription.textContent =
    error instanceof Error ? error.message : String(error);
  resultStars.textContent = '—';
  resultForks.textContent = '—';
  resultIssues.textContent = '—';
  resultUpdated.textContent = '—';
}

async function inspectRepository(): Promise<void> {
  submitButton.disabled = true;
  submitButton.textContent = 'Inspecting…';
  resultStatus.textContent = 'Calling GitHub…';

  try {
    renderRepository(await finder.find(repositoryInput.value));
  } catch (error) {
    renderFailure(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Inspect repository';
    renderTelemetry();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void inspectRepository();
});

element('clear').addEventListener('click', () => {
  metrics.clear();
  renderTelemetry();
});

renderTelemetry();
