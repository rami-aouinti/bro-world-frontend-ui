import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface MockCompany {
  id: string;
  name: string;
  description?: string;
  location?: string;
  industry?: string;
  size?: string;
}

interface MockLanguage {
  name?: string;
  level?: string;
}

interface MockJob {
  id: string;
  title: string;
  companyId?: string;
  company?: { name?: string; description?: string };
  workLocation?: string;
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  workType?: string;
  experience?: string | number;
  experienceMin?: number;
  contractType?: string;
  works?: string[];
  contracts?: string[];
  skills?: string[];
  requirements?: string[];
  languages?: MockLanguage[];
  description?: string;
  work?: string;
  benefits?: string[];
  postedAt?: string;
  locationTags?: string[];
  keywords?: string[];
}

interface JobData {
  companies: MockCompany[];
  jobs: MockJob[];
}

export interface ListJobsQuery {
  title?: string;
  company?: string;
  experience?: number | null;
  salaryMin?: number | null;
  skills?: string[];
  works?: string[];
  contracts?: string[];
  location?: string;
  page?: number;
  limit?: number;
}

interface PaginatedJobs {
  data: MockJob[];
  count: number;
  page: number;
  limit: number;
}

let cache: JobData | null = null;

async function readJobData(): Promise<JobData> {
  if (cache) {
    return cache;
  }

  const filePath = join(process.cwd(), "server/mock/jobs.json");
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as JobData;

  const companies = (parsed.companies ?? []).map((company) => ({
    ...company,
    id: company.id || company.name,
  }));

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  const jobs = (parsed.jobs ?? []).map((job) => {
    const company = job.companyId ? companyMap.get(job.companyId) : undefined;
    const companyDetails = job.company ?? (company ? { name: company.name, description: company.description } : undefined);

    return {
      ...job,
      companyId: job.companyId ?? company?.id,
      company: companyDetails,
      works: Array.isArray(job.works) ? job.works : [],
      contracts: Array.isArray(job.contracts) ? job.contracts : [],
      skills: Array.isArray(job.skills) ? job.skills : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      languages: Array.isArray(job.languages) ? job.languages : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      locationTags: Array.isArray(job.locationTags) ? job.locationTags : [],
      keywords: Array.isArray(job.keywords) ? job.keywords : [],
    } satisfies MockJob;
  });

  cache = { companies, jobs };
  return cache;
}

function normaliseList(values?: string[]): string[] {
  return (values ?? []).map((value) => value.toLowerCase());
}

function parseExperience(value: number | string | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\d+(?:[.,]\d+)?/);
    if (match) {
      return Number.parseFloat(match[0].replace(",", "."));
    }
  }

  return null;
}

function parseSalary(value: number | string | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\d+(?:[.,]\d+)?/);
    if (match) {
      return Number.parseFloat(match[0].replace(",", ".")) * (value.includes("€") ? 1 : 1000);
    }
  }

  return null;
}

function matchesAny(haystack: string[], needles: string[]): boolean {
  if (!needles.length) {
    return true;
  }

  const lowerHaystack = normaliseList(haystack);
  return needles.some((needle) => lowerHaystack.includes(needle.toLowerCase()));
}

function matchesAll(haystack: string[], needles: string[]): boolean {
  if (!needles.length) {
    return true;
  }

  const lowerHaystack = normaliseList(haystack);
  return needles.every((needle) => lowerHaystack.includes(needle.toLowerCase()));
}

export async function listCompanies(): Promise<MockCompany[]> {
  const data = await readJobData();
  return data.companies.map((company) => ({ ...company }));
}

export async function listJobs(query: ListJobsQuery = {}): Promise<PaginatedJobs> {
  const data = await readJobData();
  const {
    title,
    company,
    experience,
    salaryMin,
    skills = [],
    works = [],
    contracts = [],
    location,
    page = 1,
    limit = 10,
  } = query;

  const normalisedTitle = title?.trim().toLowerCase();
  const normalisedCompany = company?.trim().toLowerCase();
  const normalisedLocation = location?.trim().toLowerCase();
  const skillFilters = skills.map((skill) => skill.toLowerCase());
  const workFilters = works.map((work) => work.toLowerCase());
  const contractFilters = contracts.map((contract) => contract.toLowerCase());

  let filtered = data.jobs.filter((job) => {
    if (normalisedTitle) {
      const combined = [
        job.title,
        job.description,
        job.work,
        ...(job.keywords ?? []),
      ]
        .filter(Boolean)
        .map((value) => value!.toString().toLowerCase());
      if (!combined.some((value) => value.includes(normalisedTitle))) {
        return false;
      }
    }

    if (normalisedCompany) {
      const companyName = job.company?.name?.toLowerCase() ?? "";
      if (!companyName.includes(normalisedCompany)) {
        return false;
      }
    }

    if (typeof experience === "number" && !Number.isNaN(experience)) {
      const jobExperience = job.experienceMin ?? parseExperience(job.experience);
      if (jobExperience !== null && jobExperience > experience) {
        return false;
      }
    }

    if (typeof salaryMin === "number" && !Number.isNaN(salaryMin)) {
      const jobSalary = job.salaryMin ?? parseSalary(job.salaryRange);
      if (jobSalary !== null && jobSalary < salaryMin) {
        return false;
      }
    }

    if (skillFilters.length && !matchesAll(job.skills ?? [], skillFilters)) {
      return false;
    }

    if (workFilters.length && !matchesAny(job.works ?? [], workFilters)) {
      return false;
    }

    if (contractFilters.length && !matchesAny(job.contracts ?? [], contractFilters)) {
      return false;
    }

    if (normalisedLocation) {
      const locations = [
        job.workLocation ?? "",
        ...(job.locationTags ?? []),
      ]
        .filter(Boolean)
        .map((value) => value!.toString().toLowerCase());

      if (!locations.some((value) => value.includes(normalisedLocation))) {
        return false;
      }
    }

    return true;
  });

  filtered = filtered.sort((a, b) => {
    const dateA = a.postedAt ? Date.parse(a.postedAt) : 0;
    const dateB = b.postedAt ? Date.parse(b.postedAt) : 0;
    return dateB - dateA;
  });

  const safeLimit = Math.max(1, Math.min(Number.isFinite(limit) ? Math.trunc(limit) : 10, 50));
  const safePage = Math.max(1, Number.isFinite(page) ? Math.trunc(page) : 1);
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;

  const paginated = filtered.slice(start, end).map((job) => ({ ...job }));

  return {
    data: paginated,
    count: filtered.length,
    page: safePage,
    limit: safeLimit,
  };
}

export function clearJobCache() {
  cache = null;
}
