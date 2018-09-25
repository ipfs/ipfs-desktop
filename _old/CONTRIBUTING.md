# Contributing

## Making changes

Ensure you are following [standard](https://github.com/feross/standard) for code style.
You can run linting at any point using

```bash
$ npm run lint
```

When you are ready to commit please be sure to follow the
[commit convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md).

## Available Scripts

```bash
$ npm run clean         # Clean the build directory
$ npm run start         # Start a development instance
$ npm run lint          # Run linting on all files
$ npm run dist          # Create a package for the current platform
$ npm run dist-all      # Create a package for all platforms
$ npm run start:prod    # Start a packaged instance
$ npm run changelog     # Generate the changelog using conventional-changelog
$ npm run changelog:github # Publish the release and changelog to github
```

## Release

```bash
$ npm run lint
$ npm version --no-git-tag-version [major | minor | patch | premajor | preminor | prepatch | prerelease]
$ npm run changelog
$ git add package.json CHANGELOG.md
$ git commit -m "chore: Release v<new version>"
$ git tag v<new version>
$ git push upstream master
$ git push upstream master --tags
$ npm run changelog:github
$ npm run dist-all
```

Missing: How to upload and distribute packages
