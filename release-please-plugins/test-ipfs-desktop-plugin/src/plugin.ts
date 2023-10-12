import { type ConventionalCommit } from 'release-please/build/src/commit';
import { GitHub } from 'release-please/build/src/github';
import { type CandidateReleasePullRequest, type RepositoryConfig } from 'release-please/build/src/manifest';
import {ManifestPlugin} from 'release-please/build/src/plugin';
import { Update } from 'release-please/build/src/update';
import { UpdateVersionsInReadme } from './readme-updater';

export class CustomPlugin extends ManifestPlugin {
  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: Record<string, unknown> = {}
  ) {
    super(github, targetBranch, repositoryConfig);

    // this.specialWords = new Set(
    //   specialWords ? [...specialWords] : SPECIAL_WORDS
    // );
    this.logger.info('ReadMeUpdater initialized with options: ', options);
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
  async run(pullRequestCandidates: CandidateReleasePullRequest[]): Promise<CandidateReleasePullRequest[]> {
    const releasePleaseCreatedPr = pullRequestCandidates.find((prCandidate) => {
      return prCandidate.pullRequest.body.toString().includes('This PR was generated with [Release Please](https://github.com/googleapis/release-please)')

    })
    if (releasePleaseCreatedPr == null) {
      this.logger.info('no release please created pr found')
      return pullRequestCandidates
    }

    this.logger.info(`pr candidate: path=${releasePleaseCreatedPr.path}`)

    const { pullRequest, config } = releasePleaseCreatedPr
    this.logger.info(`candidate config info: ${JSON.stringify(config)}`)
    // log some information about each pull request
    this.logger.info(`Pull request info: version=${pullRequest.version}, title=${pullRequest.title}, body=${pullRequest.body}`)
    if (pullRequest.version == null) {
      this.logger.info('no version found in pull request')
      return pullRequestCandidates
    }
    this.logger.info('Adding new `UpdateVersionsInReadme` update to the release-please pull request.')
    // creating new updates
    const updateVersionsInReadme: Update = {
      path: 'README.md',
      createIfMissing: false,
      updater: new UpdateVersionsInReadme({
        version: pullRequest.version,
      })
    }
    pullRequest.updates.push(updateVersionsInReadme)

    return pullRequestCandidates
  }
}
