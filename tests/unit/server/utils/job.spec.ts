import { beforeEach, describe, expect, it, vi } from "vitest";

import type { JobData } from "~/server/utils/job";

const readFileMock = vi.hoisted(() => vi.fn());
const readCachedJobsMock = vi.hoisted(() => vi.fn<[], Promise<JobData | null>>());
const writeCachedJobsMock = vi.hoisted(() => vi.fn<[JobData], Promise<void>>());
const invalidateCachedJobsMock = vi.hoisted(() => vi.fn<[], Promise<void>>());

vi.mock("node:fs/promises", () => ({
  readFile: readFileMock,
  default: { readFile: readFileMock },
}));

vi.mock("~/server/utils/cache/jobs", () => ({
  readCachedJobs: readCachedJobsMock,
  writeCachedJobs: writeCachedJobsMock,
  invalidateCachedJobs: invalidateCachedJobsMock,
}));

const cachedData: JobData = {
  companies: [
    { id: "c-1", name: "Cached Co" },
  ],
  jobs: [
    {
      id: "j-1",
      title: "Cached Role",
      companyId: "c-1",
      company: { name: "Cached Co" },
      works: [],
      contracts: [],
      skills: [],
      requirements: [],
      languages: [],
      benefits: [],
      locationTags: [],
      keywords: [],
    },
  ],
};

const rawFileData = {
  companies: [
    { name: "File Co", description: "desc" },
  ],
  jobs: [
    {
      id: "raw-1",
      title: "File Role",
      company: { name: "File Co", description: "desc" },
      works: ["Remote"],
      contracts: ["Full-time"],
      skills: ["TypeScript"],
      requirements: ["5 years"],
      languages: [{ name: "English" }],
      benefits: ["Health"],
      locationTags: ["Paris"],
      keywords: ["Nuxt"],
    },
  ],
};

beforeEach(() => {
  readFileMock.mockReset();
  readCachedJobsMock.mockReset();
  writeCachedJobsMock.mockReset();
  invalidateCachedJobsMock.mockReset();
  vi.resetModules();
});

describe("job utilities", () => {
  it("returns cached data without touching the filesystem", async () => {
    readCachedJobsMock.mockResolvedValue(cachedData);

    const { listJobs, listCompanies } = await import("~/server/utils/job");

    const jobs = await listJobs();
    const companies = await listCompanies();

    expect(jobs.data).toEqual(cachedData.jobs);
    expect(companies).toEqual(cachedData.companies);
    expect(readFileMock).not.toHaveBeenCalled();
    expect(writeCachedJobsMock).not.toHaveBeenCalled();
  });

  it("reads the job file when cache is missing and rewrites the cache", async () => {
    readCachedJobsMock.mockResolvedValue(null);
    readFileMock.mockResolvedValueOnce(JSON.stringify(rawFileData));

    const { listJobs } = await import("~/server/utils/job");

    const result = await listJobs();

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(writeCachedJobsMock).toHaveBeenCalledTimes(1);

    const [writtenData] = writeCachedJobsMock.mock.calls[0];
    expect(writtenData.companies[0]).toMatchObject({
      id: "File Co",
      name: "File Co",
      description: "desc",
    });
    expect(writtenData.jobs[0]).toMatchObject({
      id: "raw-1",
      companyId: undefined,
      company: { name: "File Co", description: "desc" },
      works: ["Remote"],
      contracts: ["Full-time"],
      skills: ["TypeScript"],
      requirements: ["5 years"],
      languages: [{ name: "English" }],
      benefits: ["Health"],
      locationTags: ["Paris"],
      keywords: ["Nuxt"],
    });

    expect(result.data[0].id).toBe("raw-1");
  });

  it("exposes a cache invalidation helper", async () => {
    const { invalidateJobsCache } = await import("~/server/utils/job");

    await invalidateJobsCache();

    expect(invalidateCachedJobsMock).toHaveBeenCalledTimes(1);
  });
});
