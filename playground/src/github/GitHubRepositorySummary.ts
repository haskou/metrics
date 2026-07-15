export interface GitHubRepositorySummary {
  readonly description: string | null;
  readonly forks: number;
  readonly fullName: string;
  readonly openIssues: number;
  readonly stars: number;
  readonly updatedAt: string;
  readonly url: string;
}
