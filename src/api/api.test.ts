import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { setAccessToken } from "@/api/api";

describe("api interceptors", () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(api);
        setAccessToken(null);
        sessionStorage.clear();
    });

    it("sets Authorization header from sessionStorage token", async () => {
        setAccessToken("test-token-123");
        mock.onGet("/test").reply((config) => {
            return [200, { auth: config.headers?.Authorization }];
        });

        const { data } = await api.get("/test");
        expect(data.auth).toBe("Bearer test-token-123");
    });

    it("reads token at request time, not module load time", async () => {
        mock.onGet("/test").reply((config) => {
            return [200, { auth: config.headers?.Authorization }];
        });

        // No token initially
        const { data: noAuth } = await api.get("/test");
        expect(noAuth.auth).toBeUndefined();

        // Set token mid-session
        setAccessToken("mid-session-token");
        const { data: withAuth } = await api.get("/test");
        expect(withAuth.auth).toBe("Bearer mid-session-token");
    });

    it("does not retry POST on ECONNABORTED", async () => {
        mock.onPost("/orders").timeout();

        await expect(api.post("/orders", {})).rejects.toMatchObject({
            code: "ECONNABORTED",
        });
    });

    it("retries GET once on ECONNABORTED", async () => {
        // First call times out, second succeeds
        mock.onGet("/menu-items")
            .timeoutOnce()
            .onGet("/menu-items")
            .reply(200, []);

        const { data } = await api.get("/menu-items");
        expect(data).toEqual([]);
    });
});
