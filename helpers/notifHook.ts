import { useAppContext } from "@/AppsProvider";
import { Href } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type NotifType =
  | "Like"
  | "Comment"
  | "Sent Friend Request"
  | "Confirm Friend Request"
  | "Sent a Message"
  | "Sent a Image"
  | "Share";

type Notif = {
  receiver_id: string;
  href: Href;
  type: NotifType;
  params?: any;
};

export function useNotifHook() {
  const { userId, userName, userImagePath } = useAppContext();

  function addNotif(data: Notif) {
    if (data.receiver_id == userId) return;

    addDoc(collection(db, "notifications"), {
      ...data,
      sender_id: userId,
      sender_name: userName,
      sender_img_path: userImagePath,
      sent_at: serverTimestamp(),
      seen:false,
    });
  }
  return addNotif;
}
