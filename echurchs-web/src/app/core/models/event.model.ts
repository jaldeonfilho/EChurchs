export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees: number;
  registeredCount: number;
  isRecurring: boolean;
  createdAt: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees: number;
  isRecurring: boolean;
  recurrencePattern?: string;
}
