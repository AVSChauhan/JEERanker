import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserID } from '../types';

export function useCollection<T>(collectionName: string, filters?: { field: string; operator: any; value: any }[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, collectionName));
    
    if (filters) {
      filters.forEach(f => {
        q = query(q, where(f.field, f.operator, f.value));
      });
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters)]);

  return { data, loading };
}

export function useSharedData<T>(collectionName: string) {
  return useCollection<T>(collectionName, [{ field: 'isShared', operator: '==', value: true }]);
}
