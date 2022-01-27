process.env.ENVIRONMENT_NAME = 'test';

const request = require('supertest');
const app = require('./app.js');

describe('on GET /', () => {
  it('should return a hello world message', async () => {
    const res = await request(app.mainApi)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .send();

    expect(res.body.message).toContain('Hello World!');
  });

  it('should contain env vars in the response', async () => {
    process.env.COMMIT_SHA = 'abc123';
    process.env.BUILD_NUMBER = 'def456';
    const res = await request(app.mainApi)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .send();

    expect(res.body.message).toContain(process.env.COMMIT_SHA);
    expect(res.body.message).toContain(process.env.BUILD_NUMBER);
  });

  afterEach(() => {
    process.env.COMMIT_SHA = null;
    process.env.BUILD_NUMBER = null;
  });
});

describe('Probe endpoints', () => {
  it('should return a 200 for /health/live', async () => {
    await request(app.probeApi)
      .get('/health/live')
      .expect(200)
      .send();
  });

  it('should return a 200 for /health/ready', async () => {
    await request(app.probeApi)
      .get('/health/ready')
      .expect(200)
      .send();
  });
});
