import { Meeting as PrismaMeeting } from '@prisma/client';

export interface Meeting extends PrismaMeeting {
  // You can add any additional properties or override existing ones here
  // For example:
  // customField?: string;
}

// If you need to create a type for creating a new meeting that doesn't require all fields:
export type CreateMeetingInput = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};