export class InvalidGitHubRepositoryNameError extends Error {
  public constructor(repository: string) {
    super(`"${repository}" must use the owner/repository format.`);
    this.name = 'InvalidGitHubRepositoryNameError';
  }
}
