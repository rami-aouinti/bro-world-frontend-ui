import { defineStore } from "pinia"

export type JobSummary = Record<string, unknown>

interface JobState {
  jobs: JobSummary[]
  total: number
  page: number
  loaded: boolean
}

export const useJobStore = defineStore("job", {
  state: (): JobState => ({
    jobs: [],
    total: 0,
    page: 0,
    loaded: false,
  }),
  actions: {
    setJobs(jobs: JobSummary[]) {
      this.jobs = jobs
    },
    setTotal(total: number) {
      this.total = total
    },
    setPage(page: number) {
      this.page = page
    },
    setLoaded(status: boolean) {
      this.loaded = status
    },
    reset() {
      this.jobs = []
      this.total = 0
      this.page = 0
      this.loaded = false
    },
  },
})
