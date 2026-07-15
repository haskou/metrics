export class GitHubRepositoryRequestError extends Error {
  public constructor(repository: string, status: number) {
    super(`GitHub returned HTTP ${status} for "${repository}".`);
    this.name = 'GitHubRepositoryRequestError';
  }
}
