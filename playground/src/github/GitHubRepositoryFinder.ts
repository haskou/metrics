import { measure } from '../../../src/index.js';
import { GitHubRepositoryRequestError } from '../errors/GitHubRepositoryRequestError.js';
import { InvalidGitHubRepositoryNameError } from '../errors/InvalidGitHubRepositoryNameError.js';
import type { GitHubRepositorySummary } from './GitHubRepositorySummary.js';

interface GitHubRepositoryResponse {
  readonly description: string | null;
  readonly forks_count: number;
  readonly full_name: string;
  readonly html_url: string;
  readonly open_issues_count: number;
  readonly stargazers_count: number;
  readonly updated_at: string;
}

export class GitHubRepositoryFinder {
  public async find(repository: string): Promise<GitHubRepositorySummary> {
    const normalizedRepository = repository.trim();

    return measure(
      'GitHubRepositoryFinder.find',
      async () => this.findRepository(normalizedRepository),
      {
        attributes: {
          repository: normalizedRepository,
        },
      },
    );
  }

  private async findRepository(
    repository: string,
  ): Promise<GitHubRepositorySummary> {
    const segments = repository.split('/');

    if (segments.length !== 2 || segments.some((segment) => !segment)) {
      throw new InvalidGitHubRepositoryNameError(repository);
    }

    const path = segments.map(encodeURIComponent).join('/');
    const response = await fetch(`https://api.github.com/repos/${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      throw new GitHubRepositoryRequestError(repository, response.status);
    }

    const payload: GitHubRepositoryResponse = await response.json();

    return Object.freeze({
      description: payload.description,
      forks: payload.forks_count,
      fullName: payload.full_name,
      openIssues: payload.open_issues_count,
      stars: payload.stargazers_count,
      updatedAt: payload.updated_at,
      url: payload.html_url,
    });
  }
}
