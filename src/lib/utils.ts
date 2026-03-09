import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Foreign'];
export const DRIVE_STATUSES = ['Yes', 'No'];

export interface Record {
  id: number;
  candidate_name: string;
  college_name: string;
  date: string;
  place: string;
  region: string;
  contact_number: string;
  email_id: string;
  date_of_drive: string;
  drive_status: string;
  round_1_person: string;
  round_2_person: string;
  comments: string;
  training_period_date: string;
  resume?: string;
  offer_letter?: string;
  created_at: string;
  updated_at: string;
}
