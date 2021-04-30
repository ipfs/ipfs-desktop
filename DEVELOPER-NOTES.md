# Developer notes

Below are helpful notes for developers hacking on or releasing new versions of IPFS Desktop.

## Release checklist

Before cutting a new release of IPFS Desktop, please go through the following process:

### Manual testing

Manually test a few things that don't transfer well to automated testing:

1. **Mac/Windows/Linux:** Confirm that "Take Screenshot" under the menubar/system tray menu works as expected for both single- and multi-monitor setups:
   - File(s) import correctly
   - Correct link is copied to clipboard
2. **Mac only:** Drag/drop onto menubar icon behaves as expected when dragging one file, several files, and a combination of files/folders:
   - File(s) import correctly
   - Correct link is copied to clipboard
3. **Windows only:** Right-click on a file and "Add to IPFS" from context menu works as expected:
   - File(s) import correctly
   - Correct link is copied to clipboard
4. **Mac/Windows:** Confirm that OS-wide protocol handler was registered by opening <a href="ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi">`ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi`</a> in a user agent _without_ IPFS Companion
     
### Main release process
1. Fetch new translations from Transifex: `tx pull -af`.
2. Commit the changes.
3. Bump the version in `package.json`.
4. Commit the changes.
5. Create a tag with the same version as your bump: `git tag vA.B.C`.
6. Publish local changes and the tag to the GitHub repo: `git push && git push origin vA.B.C`.
7. Wait for the CI to upload the binaries to the draft release (a new one will be created if you haven't drafted one).
8. Publish a release draft.
   - Once a release is published, users should receive the app update (see https://www.electron.build/auto-update for details).
   - The `latest.yml, latest-mac.yml, latest-linux.yml` files on the release are used by the app to determine when an app update is available.
9. Update all links and badges in `README.md` to point to the new version (`A.B.C`).
10. Update `CHANGELOG.md` with details from release/release draft.
11. Update selected package managers:
   - Wait for CI to finish and confirm that it updated [Snap](https://snapcraft.io/ipfs-desktop), and is at least pending review on [Chocolatey](https://chocolatey.org/packages/ipfs-desktop#versionhistory).
   - Update the [Homebrew cask](https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md#updating-a-cask).
12. To start work on the next version, bump the version in `package.json`.

### Manually notarize `.dmg` with Apple

These steps are only needed as a fallback if CI is not correctly notarizing the `.dmg` file. For context, see [#1365](https://github.com/ipfs-shipyard/ipfs-desktop/issues/1211).

1. Download the `.dmg` from `https://github.com/ipfs-shipyard/ipfs-desktop/releases/vA.B.C`.
2. Ensure `APPLEID` and `APPLEIDPASS` are set either as environment variables or entries in `.env` file. These need to belong to the same org as the certificate used for signing.
3. Run `node pkgs/macos/notarize-cli.js ./IPFS-Desktop-A.B.C.dmg`.
4. Debug errors by calling the tool directly: `xcrun altool --notarize-app -f /path/to/IPFS-Desktop-0.X.0.dmg --primary-bundle-id io.ipfs.desktop -u XXX-from-vault-XXX -p XXX-app-specific-password-from-vault-XXX`; also, see the [long list of hoops Apple may ask you to jump through](https://github.com/ipfs-shipyard/ipfs-desktop/pull/1365#issuecomment-598127684).
