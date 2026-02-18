import type { EventSummary } from "../types";
import { useQuery } from "@tanstack/react-query";

type UseEventsResult = {
  data: Array<EventSummary> | undefined;
  isLoading: boolean;
};

export function useEvents(): UseEventsResult {
  const query = useQuery<Array<EventSummary>>({
    queryKey: ["events"],
    queryFn: async () => [],
    enabled: false,
  });

  return { data: query.data, isLoading: query.isLoading };
}
