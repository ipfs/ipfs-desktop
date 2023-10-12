// import { Commit, ConventionalCommit } from 'release-please/build/src/commit';
import { type ConventionalCommit } from 'release-please/build/src/commit';
import { GitHub } from 'release-please/build/src/github';
// import { WorkspacePlugin } from 'release-please/build/src/';
import { type CandidateReleasePullRequest, type RepositoryConfig } from 'release-please/build/src/manifest';
import {ManifestPlugin} from 'release-please/build/src/plugin';
// import { Release } from 'release-please/build/src/release';
// import { Strategy } from 'release-please/build/src/strategy';

export class ReadMePlugin extends ManifestPlugin {
  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
  ) {
    super(github, targetBranch, repositoryConfig);
    // this.specialWords = new Set(
    //   specialWords ? [...specialWords] : SPECIAL_WORDS
    // );
    this.logger.info('ReadMeUpdater initialized.');
  }

  /**
   * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L680
   */
  // preconfigure(strategiesByPath: Record<string, Strategy>, _commitsByPath: Record<string, Commit[]>, _releasesByPath: Record<string, Release>): Promise<Record<string, Strategy>> {

  // }

  /**
   *
   * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L703
   */
  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    // for (const commit of commits) {
    //   // if (commit.message.startsWith('chore:')) {
    //   //   commit.releaseType = 'none';
    //   // }
    // }
    // find the update to the CHANGELOG.md file and add a README.md update to that commit
    // const commit = commits.find(commit => {
    //   const files = commit.files.map(f => f.filename);
    //   if (files.includes('CHANGELOG.md')) {
    //     commit.files.push({ filename: 'README.md', patches: [] });
    //     return true;
    //   }
    //   return false;
    // })
    return commits

  }

  /**
   * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L757
   */
  async run(pullRequests: CandidateReleasePullRequest[]): Promise<CandidateReleasePullRequest[]> {
    return pullRequests
  }
}
