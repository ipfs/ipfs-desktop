# Developer notes

Below are helpful notes for developers hacking on or releasing new versions of IPFS Desktop.

## Release checklist

Before cutting a new release of IPFS Desktop, please go through the following process:

### Manual testing

Manually test a few things that don't transfer well to automated testing:


1. **Mac & Windows (both must to be checked):** Confirm that drag-and-drop file import works:
   - Open _Files_ screen
   - Drag file(s) into it (PDF, images, or videos)
   - Confirm file(s) import was successful by clicking on newly imported file to preview
2. **Mac & Windows (one check is sufficient):** Confirm that import via _Import_ button works:
   - Open _Files_ screen
   - Click on _Import_ button and select files(s) (directory, or standalone PDF, images, or videos)
   - Confirm file(s) import was successful by clicking on newly imported file to preview
3. **Mac only:** Drag/drop onto menubar icon behaves as expected when dragging one file, several files, and a combination of files/folders:
   - File(s) import correctly
   - Correct link is copied to clipboard
4. **Windows only:** Right-click on a file and "Add to IPFS" from context menu works as expected:
   - File(s) import correctly
   - Correct link is copied to clipboard
5. **Mac & Windows (both must to be checked):** Confirm that OS-wide protocol handler was registered by opening <a href="ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi">`ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi`</a> in a stock web browser (Edge, Safari, Google Chrome) _without_ IPFS Companion

### Main release process

Release PRs are created automatically by release-please whenever new changes are merged into the `main` branch. A release is created automatically by CI when that release PR is merged. See the changes made in https://github.com/ipfs/ipfs-desktop/pull/2664 for more information on that process.

So the first step is to merge the release PR. Once that is merged, the release will be created automatically by CI. Once the release is created, the following steps need to be done manually:

#### Mark the latest release as `latest` and publish it.

1. Check out the [releases page](https://github.com/ipfs/ipfs-desktop/releases) and find the latest release.
1. Click the `Edit` button for the version we want to release
1. Ensure the release notes are correct and the binaries and other artifacts are attached. (there should be 15 attached assets total)
    * The `latest.yml, latest-mac.yml, latest-linux.yml` files on the release are used by the app to determine when an app update is available.
    * `Source code (tar.gz)` & `Source code (zip)` are attached by github automatically when the release is published.
1. Check the `Set as the latest release` box.
1. Then click `Publish release`.

#### When the above PR is merged and github release is created, bump the brew cask version

All it takes for this is [a simple command which will open a PR for you](https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md#updating-a-cask):

```bash
brew bump --open-pr homebrew/cask/ipfs
```

### Manual release process

Be sure you have an environment variable `GITHUB_TOKEN` set to a valid GitHub token with `repo` scope.

```bash
### Create release PR
npm run release-pr

### create github release
npm run release-gh

### When the above PR is merged and github release is created, bump the brew cask version:
brew bump --open-pr homebrew/cask/ipfs
# see https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md#updating-a-cask if you run into issues.
```

<!-- OLD RELEASE PROCESS (keep for now, until we're sure the new one works)
1. Update the version using `npm version [major|minor|patch]` (it will create a new tag `vA.B.C`, note it down)
1. Update all links and badges in `README.md` to point to the new version (`A.B.C`).
   - You may use `ts-node scripts/release/updateReadme.ts <oldVersion> <newVersion>` to update the readme. e.g. `ts-node scripts/release/updateReadme.ts 0.26.0 0.26.1`
      - If you do, confirm everything is updated properly.
1. Update the latest version commit `git tag -d vA.B.C && git add README.md && git commit --amend --no-edit && git tag vA.B.C`
1. Publish local changes and the tag to the GitHub repo: `git push && git push origin vA.B.C`.
1. Wait for the CI to upload the binaries to the draft release (a new one will be created if you haven't drafted one).
1. Publish a release draft.
   - Once a release is published, users should receive the app update (see https://www.electron.build/auto-update for details).
   - The `latest.yml, latest-mac.yml, latest-linux.yml` files on the release are used by the app to determine when an app update is available.
1. Update `CHANGELOG.md` with details from release/release draft.
1. Update selected package managers:
   - Wait for CI to finish and confirm that it updated [Snap](https://snapcraft.io/ipfs-desktop), and is at least pending review on [Chocolatey](https://chocolatey.org/packages/ipfs-desktop#versionhistory).
   - Update the [Homebrew cask](https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md#updating-a-cask).
-->

### Manually notarize `.dmg` with Apple

These steps are only needed as a fallback if CI is not correctly notarizing the `.dmg` file. For context, see [#1365](https://github.com/ipfs-shipyard/ipfs-desktop/issues/1211).

1. Download the `.dmg` from `https://github.com/ipfs-shipyard/ipfs-desktop/releases/vA.B.C`.
2. Ensure `APPLEID` and `APPLEIDPASS` are set either as environment variables or entries in `.env` file. These need to belong to the same org as the certificate used for signing.
3. Run `node pkgs/macos/notarize-cli.js ./IPFS-Desktop-A.B.C.dmg`.
4. Debug errors by calling the tool directly: `xcrun altool --notarize-app -f /path/to/IPFS-Desktop-0.X.0.dmg --primary-bundle-id io.ipfs.desktop -u XXX-from-vault-XXX -p XXX-app-specific-password-from-vault-XXX`; also, see the [long list of hoops Apple may ask you to jump through](https://github.com/ipfs-shipyard/ipfs-desktop/pull/1365#issuecomment-598127684).

### Notarization failures

You may get an error when notarizing the .dmg for macOS, something like

> Error: You do not have required contracts to perform an operation. With error code FORBIDDEN_ERROR.CONTRACT_NOT_VALID for id ca5a6ab7-758b-44a7-973e-b59147a573b8 You do not have required contracts to perform an operation (-19208)

Apple requires this every few months: new paperwork, but only Admin can click the Approve button on https://appstoreconnect.apple.com/agreements/#/

Contact the PL Apple Developer account Admin (account holder viewed at https://appstoreconnect.apple.com/access/users) in order to approve new contracts/agreements.
