import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTIONS = [
  "users",
  "site_settings",
  "posts",
  "leads",
  "projects",
  "transactions",
  "content_calendar",
  "contact_submissions",
  "newsletter",
  "page_views",
  "portfolio",
  "files",
] as const;

type CollectionName = (typeof COLLECTIONS)[number];

function convertTimestamps<T>(data: unknown): T {
  if (!data || typeof data !== "object") return data as T;

  const obj = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = convertTimestamps<unknown>(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === "object" ? convertTimestamps<unknown>(item) : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

export async function addDocument<T extends { id: string }>(
  collectionName: CollectionName,
  data: Omit<T, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getDocuments<T extends { id: string }>(
  collectionName: CollectionName
): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps<Omit<T, "id">>(docSnap.data()),
  })) as T[];
}

export async function getDocument<T extends { id: string }>(
  collectionName: CollectionName,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...convertTimestamps<Omit<T, "id">>(docSnap.data()),
  } as T;
}

export async function updateDocument<T extends { id: string }>(
  collectionName: CollectionName,
  id: string,
  data: Partial<Omit<T, "id">>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function queryDocuments<T extends { id: string }>(
  collectionName: CollectionName,
  field: string,
  operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in" | "not-in" | "array-contains-any",
  value: unknown
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps<Omit<T, "id">>(docSnap.data()),
  })) as T[];
}

export function subscribeToCollection<T extends { id: string }>(
  collectionName: CollectionName,
  callback: (data: T[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...convertTimestamps<Omit<T, "id">>(docSnap.data()),
    })) as T[];
    callback(data);
  });
}

export function subscribeToDocument<T extends { id: string }>(
  collectionName: CollectionName,
  id: string,
  callback: (data: T | null) => void
): Unsubscribe {
  const docRef = doc(db, collectionName, id);
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    callback({
      id: docSnap.id,
      ...convertTimestamps<Omit<T, "id">>(docSnap.data()),
    } as T);
  });
}
