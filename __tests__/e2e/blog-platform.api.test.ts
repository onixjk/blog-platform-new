import request from "supertest";
import express from "express";
import {setupApp} from "../../src/setup-app";
import {HttpStatuses} from "../../src/core/types/http-statuses";

describe('/blog', () => {

    const app = express();
    setupApp(app);

    beforeAll(async () => {
        await request(app).delete(`/testing/all-data`);
    })

    it('should return 404', async () => {
        await request(app)
            .get('/blog')
            .expect(HttpStatuses.NotFound_404)
    });

    it('should return 404', async () => {
        await request(app)
            .get('/blog')
            .expect(HttpStatuses.NotFound_404)
    });




})