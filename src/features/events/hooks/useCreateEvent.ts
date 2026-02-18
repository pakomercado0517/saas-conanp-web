import type { EventSummary } from "../types";
import { useMutation } from "@tanstack/react-query";

type UseCreateEventResult = {
  create: (payload: EventSummary) => Promise<EventSummary>;
};

export function useCreateEvent() {
  const mutation = useMutation<EventSummary, Error, EventSummary>({
    mutationKey: ["events", "create"],
    mutationFn: async (payload) => payload,
  });

  return {
    create: async (payload: EventSummary) => mutation.mutateAsync(payload),
  } satisfies UseCreateEventResult;
}
