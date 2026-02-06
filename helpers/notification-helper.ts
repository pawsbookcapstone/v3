import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

type NotificationType =
  | "like"
  | "comment"
  | "friend_request"
  | "friend_accepted"
  | "share"
  | "info";

interface NotifyParams {
  userId: string; // receiver
  actorId: string; // sender
  name: string;
  profile: string;
  type: NotificationType;
  postId?: string;
}

export const createNotification = async ({
  userId,
  actorId,
  name,
  profile,
  type,
  postId,
}: NotifyParams) => {
  if (userId === actorId) return;

  let description = "";

  switch (type) {
    case "friend_request":
      description = "sent you a friend request";
      break;
    case "friend_accepted":
      description = "accepted your friend request";
      break;
    case "like":
      description = "liked your post";
      break;
    case "comment":
      description = "commented on your post";
      break;
    case "share":
      description = "shared your post";
      break;
    default:
      description = "sent you a notification";
  }

  await addDoc(collection(db, "notifications"), {
    userId,
    actorId,
    name,
    profile,
    description,
    type,
    postId: postId ?? null,
    time: serverTimestamp(),
  });
};
