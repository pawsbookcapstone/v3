import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
  WriteBatch,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

async function commitBatches(ops: ((batch: WriteBatch) => void)[]) {
  while (ops.length) {
    const batch = writeBatch(db);
    ops.splice(0, 400).forEach((op) => op(batch));
    await batch.commit();
  }
}
export async function updateUserProfile(
  userId: string,
  newName: string,
  newImage: string | null = null,
) {
  const ops: ((batch: WriteBatch) => void)[] = [];

  const postSnap = await getDocs(
    query(collection(db, "posts"), where("creator_id", "==", userId)),
  );

  postSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        creator_name: newName,
        creator_img_path: newImage,
      }),
    );
  });

  const commentedBySnap = await getDocs(
    query(
      collectionGroup(db, "comments"),
      where("commented_by_id", "==", userId),
    ),
  );

  commentedBySnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        commented_by_name: newName,
        commented_by_img_path: newImage,
      }),
    );
  });

  const searchedSnap = await getDocs(
    query(collectionGroup(db, "recent_searches"), where("id", "==", userId)),
  );

  searchedSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        name: newName,
        img_path: newImage,
      }),
    );
  });

  const friendSnap = await getDocs(
    query(collection(db, "friends"), where("users", "array-contains", userId)),
  );

  friendSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        [`details.${userId}.name`]: newName,
        [`details.${userId}.img_path`]: newImage,
      }),
    );
  });

  const chatSnap = await getDocs(
    query(collection(db, "chats"), where("users", "array-contains", userId)),
  );

  chatSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.set(
        docSnap.ref,
        {
          [userId]: {
            name: newName,
            img_path: newImage,
          },
        },
        { merge: true },
      ),
    );
  });

  const marketPlaceSnap = await getDocs(
    query(collection(db, "marketPlace"), where("ownerId", "==", userId)),
  );

  marketPlaceSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        ownerName: newName,
        ownerImg: newImage,
      }),
    );
  });

  const adoptSnap = await getDocs(
    query(collection(db, "post-adopt"), where("userId", "==", userId)),
  );

  adoptSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        userName: newName,
        userImage: newImage,
      }),
    );
  });

  const lostFoundSnap = await getDocs(
    query(collection(db, "lost-and-found"), where("userId", "==", userId)),
  );

  lostFoundSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        userName: newName,
        userImage: newImage,
      }),
    );
  });

  const savedSnap = await getDocs(
    query(collectionGroup(db, "savedItems"), where("ownerId", "==", userId)),
  );

  savedSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        ownerName: newName,
        ownerImage: newImage,
      }),
    );
  });

  const notifSnap = await getDocs(
    query(collection(db, "notifications"), where("sender_id", "==", userId)),
  );

  notifSnap.forEach((docSnap) => {
    ops.push((batch) =>
      batch.update(docSnap.ref, {
        sender_name: newName,
        sender_img_path: newImage,
      }),
    );
  });

  await commitBatches(ops);
}
