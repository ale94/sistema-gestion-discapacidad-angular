import { Event } from "./event.interface";

export interface GroupedEvent {
  month: string;
  monthIndex: number;
  events: Event[];
}
