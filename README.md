# Custom github actions
[![Action unit tests](https://github.com/rdrdog/gh-custom-actions/actions/workflows/validate-actions.yml/badge.svg)](https://github.com/rdrdog/gh-custom-actions/actions/workflows/validate-actions.yml)

# Local usage
> Because the released version of ACT doesn't yet support custom actions inside actions, we need to build ACT from source.

In another folder, outside of this repo:
1. clone and build act:
    ```
    git clone https://github.com/nektos/act
    cd act
    make build
    ```
1. using the binary created in the act repo (e.g. `~/code/act/dist/local/act`), run the github actions locally, specifying a temporary artifact path:
    ```
    ~/code/act/dist/local/act --artifact-server-path ./tmp -W .github/workflows/build-and-deploy.yml
    ```

# Running tests
To run all tests, run the validate-actions.yml github action:

```
act -W .github/workflows/validate-actions.yml
```

To run specific tests, run `npm test` (or `npm test-watch`) from each folder under _./actions_.

# Current issues with ACT:
- 'uses' in composite workflows (merged, but not released): https://github.com/nektos/act/pull/793
  - we can get around this in the short term with cloning the repo, then building it locally (`make build`)
- reusuable workflows are not supported by ACT
