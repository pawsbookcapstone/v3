import { useAppContext } from "@/AppsProvider";
import { db } from "@/helpers/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useNotificationHook(){
    const {userId} = useAppContext()
    const [hasNotif, setHasNotif] = useState(false)

    useEffect(() => {
        if (!userId) return
        
        const q = query(
            collection(db, "notifications"), 
            where('receiver_id', '==', userId), 
            where('seen', '!=', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const count = snapshot.docs.length;

            setHasNotif(count > 0);
        });

        return () => {
            unsubscribe()
        }
    }, [userId])

    return hasNotif
}