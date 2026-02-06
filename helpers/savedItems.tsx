import { db } from "@/helpers/firebase";
import { doc, setDoc } from "firebase/firestore";

export const saveItemForUser = async (
  userId: string,
  item: {
    id: string;
    title: string;
    price: number;
    images: string[];
    ownerId?: string;
    saveCategory: string;
    ownerName: string;
    ownerImage: string;
    description: string;
  },
) => {
  try {
    if (!userId) throw new Error("User ID is required");

    // Reference to user's savedItems subcollection
    const savedRef = doc(db, "users", userId, "savedItems", item.id);

    await setDoc(savedRef, {
      title: item.title,
      price: item.price,
      images: item.images,
      ownerId: item.ownerId || null,
      ownerName: item.ownerName,
      ownerImage: item.ownerImage,
      savedAt: new Date(),
      saveCategory: "marketplace",
      description: item.description,
    });

    console.log("Item saved!");
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

export const saveAdoptPet = async (
  userId: string,
  item: {
    id: string;
    caption: string;
    petCategory: string;
    petImage: string;
    ownerId?: string;
    ownerName: string;
    ownerImage: string;
    saveCategory: string;
  },
) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!item.id) throw new Error("Post ID is required");

    const savedRef = doc(db, "users", userId, "savedItems", item.id);

    await setDoc(savedRef, {
      caption: item.caption || "",
      petCategory: item.petCategory || "",
      petImage: item.petImage || "",
      ownerId: item.ownerId || null,
      ownerName: item.ownerName || "",
      ownerImage: item.ownerImage || "",
      saveCategory: "adopt",
      savedAt: new Date(),
    });

    console.log("Adoption post saved!");
  } catch (error) {
    console.error("Error saving adoption post:", error);
    throw error; // important so UI knows it failed
  }
};
