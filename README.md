![build-test](https://github.com/microbit-foundation/action-pr-url-template/workflows/build-test/badge.svg)

# Comment on a PR when it's opened with a templated URL

## Project status

The Micro:bit Educational Foundation maintain this for internal use but are not able to commit significant time to extending it beyond our usecase. It's open source in the hope that it will be useful to the GitHub community.

## Introduction

Useful when some other CI system deploys a build to URLs that include the 
branch name but doesn't integrate with GitHub sufficiently to update the 
pull request.

To use it create a workflow that triggers the action when a PR is opened. For example, create a file at `.github/workflows/pr-url.yml` and specify:

```
name: "pr-url"
on:
  pull_request:
    types: [opened]
jobs:
  pr-url:
    runs-on: ubuntu-latest
    steps:
    - uses: microbit-foundation/action-pr-url-template@v0.1.0
      with:
        uri-template: "http://{branch}.example.com/"
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

The `repo-token` line does not need to be modified. It makes the GitHub token available to the action to allow it to comment on the PR via the GitHub API.

The `uri-template` line should be changed to put the branch name at the correct point in the URL. The template is an [RFC 6570](https://tools.ietf.org/html/rfc6570) URI template.

## Development docs

As per the [TypeScript action](https://github.com/actions/typescript-action/).

### Code in Master

Install the dependencies

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run pack
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

### Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

### Tagging

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action

### Code of Conduct

Trust, partnership, simplicity and passion are our core values we live and breathe in our daily work life and within our projects. Our open-source projects are no exception. We have an active community which spans the globe and we welcome and encourage participation and contributions to our projects by everyone. We work to foster a positive, open, inclusive and supportive environment and trust that our community respects the micro:bit code of conduct. Please see our [code of conduct](https://microbit.org/safeguarding/) which outlines our expectations for all those that participate in our community and details on how to report any concerns and what would happen should breaches occur.
