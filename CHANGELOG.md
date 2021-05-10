# Change Log

All notable changes to the "GitCherry" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [v1.0.0-eap] (03.05.2021)

### features
- integration with github; branches, labels, reviewers receiving
- [cherry-pick to multiple branches](./README.md#cherry-pick-to-multiple-branches)
- [multiple pull requests creating](./README.md##multiple-pull-requests-creating)
- pull request customization: title and description
- cherry-picking to already checked out branch
- empty commits skip during cherry-picking
- info, errors, warnings showing and logging
- [merge conflicts solving](./README.md#merge-conflicts-solving)
- [abort cherry-picking when merge conflict is detected](./README.md#abort-cherry-pick-when-merge-conflict-is-detected)
- [data tree refresh](./README.md#data-tree-refreshing)
- dark theme support
- possibility to use origin instead of upstream

## [v1.0.0-eap.1] (03.05.2021)

### bug fixed

- regression: [Reviewers are not added to pull request anymore](https://github.com/ksercs/GitCherry/issues/27)

## [v1.1.0-alpha] (10.05.2021)

### bug fixes

- standalone pull requests creating is fixed ([issue](https://github.com/ksercs/GitCherry/issues/35))
- added `NotStagedChangesFound` error showing when extension tries to check out branch with not staged changes

## [v1.1.1-alpha] (10.05.2021)

### bug fixes

- extension name conflict is resolved. All commands and view are added to the unique namespace

## [NEXT RELEASE]
