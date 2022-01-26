export interface IConfig {
  apiBaseUrl: string;
  hostName?: string;
}

export let config: IConfig;

const envName = process.env.ENVIRONMENT_NAME;
console.log(`Environment name = ${envName}`);

switch (envName) {
  case 'local':
    // configuration for when running locally in k8s
    config = {
      apiBaseUrl: 'http://host.docker.internal/example-api-milford',
      // For local deployment, we route using the 'host.docker.internal' hostname, but pass the 'example.localhost' host header
      hostName: process.env.APPLICATION_HOST_NAME
    };
    break;
  case 'dev':
  case 'test':
  case 'prod':
    config = {
      apiBaseUrl: `https://${process.env.APPLICATION_HOST_NAME}${process.env.APPLICATION_PATH_PREFIX}example-api`,
      hostName: process.env.APPLICATION_HOST_NAME
    };
    break;
  default:
    console.log('No env name specified - default config in use');
    config = {
      apiBaseUrl: 'http://localhost:3000'
    };
    break;
}

console.log(`Environment config:\n${JSON.stringify(config)}`);
