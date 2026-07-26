import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

/**
 * End-to-end smoke test.
 * Requires a running Redis (REDIS_URL) — the full BullMQ wiring is booted.
 */
describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /v1/health reports service status', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/health')
      .expect(200);

    expect(response.body.status).toBeDefined();
    expect(response.body.services).toHaveProperty('redis');
  });

  it('POST /v1/health/queue enqueues a heartbeat job', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/health/queue')
      .expect(201);

    expect(response.body.enqueued).toBe(true);
    expect(response.body.jobId).toBeDefined();
  });
});
