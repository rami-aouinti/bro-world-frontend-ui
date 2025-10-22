import { useNavbarSearchQuery } from "./useNavbarSearch";

export function useWorldSearchQuery() {
  return useNavbarSearchQuery({ context: "worlds" }).query;
}

export { useNavbarSearchQuery } from "./useNavbarSearch";
