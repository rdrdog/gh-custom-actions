const defaultArgs =
  '--publish-quiet --tags "not @ignore" --require "build/**/*.js" -f @cucumber/pretty-formatter -f json:results.json ';
module.exports = {
  localk8s: defaultArgs + "",
  dev: defaultArgs + "--parallel 4",
  test: defaultArgs + "--parallel 4",
  prod: defaultArgs + "--parallel 4 --tags @smoke",
};
