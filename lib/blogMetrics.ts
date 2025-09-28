export interface ReactionAggregate {
  likes_count?: number | null;
  reactions_count?: number | null;
  likes?: unknown[] | null;
  reactions?: unknown[] | null;
}

export interface CommentAggregate {
  totalComments?: number | null;
  comments?: unknown;
  children?: unknown;
  replies?: unknown;
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function resolveReactionTotal(entity: ReactionAggregate): number {
  const candidateValues = [entity.likes_count, entity.reactions_count]
    .map((candidate) => toFiniteNumber(candidate ?? null))
    .filter((candidate): candidate is number => candidate !== null);

  for (const candidate of candidateValues) {
    if (candidate > 0) {
      return candidate;
    }
  }

  if (Array.isArray(entity.likes) && entity.likes.length > 0) {
    return entity.likes.length;
  }

  if (Array.isArray(entity.reactions) && entity.reactions.length > 0) {
    return entity.reactions.length;
  }

  if (candidateValues.length > 0) {
    return candidateValues[0];
  }

  return 0;
}

export function resolveCommentTotal(entity: CommentAggregate): number {
  const directTotal = toFiniteNumber(entity.totalComments ?? null);

  if (typeof directTotal === "number" && directTotal > 0) {
    return directTotal;
  }

  const collections = [entity.children, entity.comments, entity.replies];

  for (const candidate of collections) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.length;
    }
  }

  if (typeof directTotal === "number") {
    return directTotal;
  }

  return 0;
}

export function formatMetricNumber(
  value: number | null | undefined,
  locale: Intl.LocalesArgument,
): string {
  return new Intl.NumberFormat(locale).format(value ?? 0);
}
