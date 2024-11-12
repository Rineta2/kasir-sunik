"use client";

import { db } from "@/utils/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

export function useAdmin({ uid }) {
  const { data, error } = useSWRSubscription(
    [`admins/${uid}`],
    ([path], { next }) => {
      const ref = doc(db, path);

      const unsub = onSnapshot(
        ref,
        (snaps) => {
          next(null, snaps.exists() ? snaps.data() : null);
        },
        (error) => {
          next(error?.message);
        }
      );
      return () => unsub();
    }
  );

  return {
    data,
    error,
    isLoading: data === undefined && !error,
  };
}
