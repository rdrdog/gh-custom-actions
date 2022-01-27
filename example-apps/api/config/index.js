const config = {
  corsOrigins: []
};

switch (process.env.ENVIRONMENT_NAME) {
  case 'localk8s':
    config.corsOrigins = ['http://localhost:5000', `http://${process.env.APPLICATION_HOST_NAME}`];
    break;
  case 'dev':
    config.corsOrigins = ['http://localhost:5000', `https://${process.env.APPLICATION_HOST_NAME}`];
    break;
  case 'test':
    config.corsOrigins = [`https://${process.env.APPLICATION_HOST_NAME}`];
    break;
  case 'prod':
    config.corsOrigins = [`https://${process.env.APPLICATION_HOST_NAME}`];
    break;
  default:
    console.warn(`No configuration overrides for environment with name ${process.env.ENVIRONMENT_NAME}`);
}

module.exports = config;
