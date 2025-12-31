import type { Timestamp, GeoPoint } from 'firebase/firestore';

export interface Chatroom {
  id?: string;
  name: string;
  radius: number; // in meters
  center: GeoPoint;
  createdAt: Timestamp;
  creatorId: string;
  distance?: number; // Optional distance in meters
}

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderDisplayName: string;
  createdAt: Timestamp;
  isReported: boolean;
  chatroomId: string;
}
