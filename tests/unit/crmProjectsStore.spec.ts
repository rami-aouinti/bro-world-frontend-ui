import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";

import { createPinia } from "~/lib/pinia-shim";
import { crmProjectsMock } from "~/lib/mock/crm-projects";
import { __resetNuxtStateMocks } from "#imports";

const resolveApiFetcherMock = vi.hoisted(() => vi.fn());

vi.mock("~/lib/api/fetcher", () => ({
  resolveApiFetcher: resolveApiFetcherMock,
}));

const defaultRuntimeConfig = {
  public: {
    siteUrl: "",
    apiBase: "/api",
    postsApiBase: "https://fallback.test/",
    redis: {
      listTtl: 60,
      itemTtl: 300,
    },
    crmProjects: {
      useMocks: true,
    },
  },
  redis: {
    listTtl: 60,
    itemTtl: 300,
  },
};

type RuntimeConfigOverride = {
  public?: {
    crmProjects?: {
      useMocks?: boolean | string | number;
    };
  } & Record<string, unknown>;
  [key: string]: unknown;
};

function stubRuntimeConfig(overrides: RuntimeConfigOverride = {}) {
  const merged = {
    ...defaultRuntimeConfig,
    ...overrides,
    public: {
      ...defaultRuntimeConfig.public,
      ...(overrides.public ?? {}),
      crmProjects: {
        ...defaultRuntimeConfig.public.crmProjects,
        ...(overrides.public?.crmProjects ?? {}),
      },
    },
  };

  vi.stubGlobal("useRuntimeConfig", () => merged);
}

describe("crm projects store", () => {
  let crudOperations: { list: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let crudFactoryMock: ReturnType<typeof vi.fn>;

  async function createStore() {
    const { useCrmProjectsStore } = await import("~/stores/crm-projects");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof useCrmProjectsStore>;
    app.runWithContext(() => {
      store = useCrmProjectsStore();
    });

    return store;
  }

  beforeEach(() => {
    __resetNuxtStateMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    resolveApiFetcherMock.mockReset();

    crudOperations = {
      list: vi.fn(),
      create: vi.fn(),
    };
    crudFactoryMock = vi.fn(() => crudOperations);

    resolveApiFetcherMock.mockReturnValue({
      crud: crudFactoryMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS;
  });

  describe("with mock backend", () => {
    it("loads projects from the mock dataset by default", async () => {
      const store = await createStore();

      const promise = store.listProjects();
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(resolveApiFetcherMock).not.toHaveBeenCalled();
      expect(result).toHaveLength(crmProjectsMock.length);
      expect(result[0]).toMatchObject({
        id: crmProjectsMock[0].id,
        name: crmProjectsMock[0].name,
        clientName: crmProjectsMock[0].clientName,
        __optimistic: false,
      });
      expect(store.total.value).toBe(crmProjectsMock.length);
      expect(store.meta.value).toBeNull();
      expect(store.pending.value).toBe(false);
    });

    it("creates a project locally and updates totals", async () => {
      const store = await createStore();

      const listPromise = store.listProjects();
      await vi.runAllTimersAsync();
      await listPromise;

      const createPromise = store.createProject({
        name: "Nouvelle campagne", 
        status: "planning",
        finishDate: "2024-10-01T10:00:00Z",
        tags: ["nouveau"],
      });

      expect(store.projects.value[0].__optimistic).toBe(true);

      await vi.runAllTimersAsync();
      const created = await createPromise;

      expect(resolveApiFetcherMock).not.toHaveBeenCalled();
      expect(created).toMatchObject({
        name: "Nouvelle campagne",
        status: "planning",
        finishDate: "2024-10-01T10:00:00.000Z",
        __optimistic: false,
      });
      expect(store.projects.value[0]).toMatchObject({ id: created.id, __optimistic: false });
      expect(store.total.value).toBe(crmProjectsMock.length + 1);
      expect(store.createError.value).toBeNull();
    });
  });

  describe("with API backend", () => {
    it("fetches projects and normalizes the response", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockResolvedValue({
        data: [
          {
            id: "1",
            name: "  Project One  ",
            status: "active ",
            labels: ["vip", "", 3],
            created_at: "2024-01-05T09:30:00Z",
            updated_at: "2024-01-06T10:00:00Z",
          },
        ],
        meta: { total: 10, page: 2, perPage: 5 },
      });

      const store = await createStore();

      const result = await store.listProjects();

      expect(resolveApiFetcherMock).toHaveBeenCalledTimes(1);
      expect(crudFactoryMock).toHaveBeenCalledWith("/projects");
      expect(crudOperations.list).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "1",
        name: "Project One",
        status: "active",
        tags: ["vip"],
        createdAt: "2024-01-05T09:30:00.000Z",
        updatedAt: "2024-01-06T10:00:00.000Z",
        __optimistic: false,
      });
      expect(store.total.value).toBe(10);
      expect(store.meta.value).toEqual({ page: 2, pageSize: 5 });
      expect(store.error.value).toBeNull();
    });

    it("caches list results until the ttl expires", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });

      const store = await createStore();

      await store.listProjects();
      expect(crudOperations.list).toHaveBeenCalledTimes(1);

      crudOperations.list.mockClear();

      await store.listProjects();
      expect(crudOperations.list).not.toHaveBeenCalled();

      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });
      await vi.advanceTimersByTimeAsync(60_001);

      await store.listProjects();
      expect(crudOperations.list).toHaveBeenCalledTimes(1);
    });

    it("refetches when query parameters change", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });

      const store = await createStore();

      await store.listProjects({ params: { stage: "new" } });
      expect(crudOperations.list).toHaveBeenCalledWith({ stage: "new" });

      crudOperations.list.mockClear();
      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });

      await store.listProjects({ params: { stage: "in-progress" } });
      expect(crudOperations.list).toHaveBeenCalledWith({ stage: "in-progress" });
    });

    it("sets a helpful error message when fetching fails", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockRejectedValue({
        response: { data: { message: "<strong>Failure</strong>" } },
      });

      const store = await createStore();

      await expect(store.listProjects()).rejects.toThrow("Unable to load projects.");
      expect(store.error.value).toBe("Unable to load projects.");
      expect(store.pending.value).toBe(false);
    });

    it("creates a project and replaces the optimistic entry", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });

      const store = await createStore();
      await store.listProjects();

      crudOperations.create.mockResolvedValue({
        data: {
          id: "p-2",
          name: " Beta ",
          status: "new",
          ownerName: "Taylor",
          tags: ["priority", ""],
        },
      });

      const created = await store.createProject({ name: "  Beta  ", status: "new" });

      expect(crudOperations.create).toHaveBeenCalledWith({ name: "  Beta  ", status: "new" });
      expect(created).toMatchObject({
        id: "p-2",
        name: "Beta",
        status: "new",
        ownerName: "Taylor",
        tags: ["priority"],
        __optimistic: false,
      });
      expect(store.projects.value[0]).toMatchObject({ id: "p-2", __optimistic: false });
      expect(store.createError.value).toBeNull();
      expect(store.creating.value).toBe(false);
      expect(store.total.value).toBe(1);
    });

    it("cleans up the optimistic project when creation fails", async () => {
      stubRuntimeConfig({
        public: { crmProjects: { useMocks: false } },
      });
      process.env.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS = "false";
      crudOperations.list.mockResolvedValue({ data: [], meta: { total: 0 } });

      const store = await createStore();
      await store.listProjects();

      crudOperations.create.mockRejectedValue({ message: "<div>nope</div>" });

      await expect(store.createProject({ name: "Gamma" })).rejects.toThrow(
        "Unable to create project.",
      );
      expect(store.projects.value).toHaveLength(0);
      expect(store.createError.value).toBe("Unable to create project.");
      expect(store.creating.value).toBe(false);
    });
  });

  it("validates required fields before creating a project", async () => {
    const store = await createStore();

    await expect(store.createProject({ name: "  " })).rejects.toThrow(
      "A project name is required.",
    );
    expect(crudOperations.create).not.toHaveBeenCalled();
    expect(store.createError.value).toBe("A project name is required.");
  });
});
