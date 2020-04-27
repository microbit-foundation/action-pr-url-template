![build-test](https://github.com/microbit-foundation/action-pr-url-template/workflows/build-test/badge.svg)

# Comment on a PR when it's opened with a templated URL

Useful when some other CI system deploys a build to URLs that include the 
branch name but doesn't integrate with GitHub sufficiently to update the 
pull request.

Usage:

```
To be completed when this has actually been tried for real!
```

## Development docs

As per the (TypeScript action)[https://github.com/actions/typescript-action/].

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
