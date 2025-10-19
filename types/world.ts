export type WorldVisibility = "public" | "private";

export interface WorldFormState {
  name: string;
  slug: string;
  description: string;
  visibility: WorldVisibility;
  theme: string;
  region: string;
  launchDate: string;
  tags: string[];
  guidelines: string;
  enableMonetization: boolean;
  enableIntegrations: boolean;
  requireVerification: boolean;
  allowGuests: boolean;
}

export type WorldSubmissionAction = "preview" | "publish";

export interface CreateWorldRequestPayload extends WorldFormState {
  pluginIds: string[];
  action: WorldSubmissionAction;
}
