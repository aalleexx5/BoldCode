import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const logActivity = async (
  userId: string,
  userName: string,
  action: string,
  entityType: 'request' | 'client' | 'cost_tracker' | 'comment' | 'link',
  entityId: string,
  details: string
) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      user_id: userId,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
