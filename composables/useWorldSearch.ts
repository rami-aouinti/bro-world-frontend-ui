import { useState } from "#imports";

export function useWorldSearchQuery() {
  return useState<string>("world-search-query", () => "");
}
