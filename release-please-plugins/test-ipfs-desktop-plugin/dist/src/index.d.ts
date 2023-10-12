import { type ConventionalCommit } from 'release-please/build/src/commit';
import { GitHub } from 'release-please/build/src/github';
import { type CandidateReleasePullRequest, type RepositoryConfig } from 'release-please/build/src/manifest';
import { ManifestPlugin } from 'release-please/build/src/plugin';
export declare class ReadMePlugin extends ManifestPlugin {
    constructor(github: GitHub, targetBranch: string, repositoryConfig: RepositoryConfig);
    /**
     * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L680
     */
    /**
     *
     * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L703
     */
    processCommits(commits: ConventionalCommit[]): ConventionalCommit[];
    /**
     * called by https://github.com/googleapis/release-please/blob/71dcc7b3b2df4bb3d3e0884b3f0bfb96700cb76a/src/manifest.ts#L757
     */
    run(pullRequests: CandidateReleasePullRequest[]): Promise<CandidateReleasePullRequest[]>;
}
//# sourceMappingURL=index.d.ts.map