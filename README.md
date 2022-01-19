# Custom github actions


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
    ~/code/act/dist/local/act --artifact-server-path ./tmp
    ```

# Current issues with ACT:
- 'uses' in composite workflows (merged, but not released): https://github.com/nektos/act/pull/793
  - we can get around this in the short term with cloning the repo, then building it locally (`make build`)
- reusuable workflows are not supported by ACT
