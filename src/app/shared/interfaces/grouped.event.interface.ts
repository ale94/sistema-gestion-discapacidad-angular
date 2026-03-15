import { Event } from "./event";

export interface GroupedEvent {
  month: string;
  monthIndex: number;
  events: Event[];
}
