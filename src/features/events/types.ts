export type EventStatus = "draft" | "scheduled" | "cancelled" | "completed";

export type EventSummary = {
  id: string;
  title: string;
  status: EventStatus;
  startAt: string;
  endAt: string;
};
