import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export function useFirestore<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError("Firestore is not initialized.");
      setLoading(false);
      return;
    }

    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (err) => {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const addItem = useCallback(async (item: T) => {
    if (!db) return;
    try {
      await setDoc(doc(db, collectionName, item.id), item);
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, collectionName, id), updates as any);
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  const deleteItem = useCallback(async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
      throw err;
    }
  }, [collectionName]);

  return { data, loading, error, addItem, updateItem, deleteItem };
}
