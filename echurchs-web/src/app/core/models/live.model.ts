export interface LiveService {
  id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: string;
  streamUrl?: string;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  recordingUrl?: string;
  createdAt: string;
}

export interface ServiceSchedule {
  id: string;
  name: string;
  dayOfWeek: string;
  time: string;
  frequency: string;
  isActive: boolean;
}
