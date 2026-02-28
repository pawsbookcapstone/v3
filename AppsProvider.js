import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { collectionName, find, update } from "./helpers/db";
import { db } from "./helpers/firebase";

const AppContext = createContext();

const descriptions = {
  Like: "Liked your post",
  Comment: "Commented on your post",
  "Sent Friend Request": "Sent you a friend request",
  "Confirm Friend Request": "Accepted your friend request",
  "Sent a Message": "Sent you a message",
  "Sent a Image": "Sent you an image",
  "Sent a Video": "Sent you an video",
  Share: "Shared your post",
};

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppsProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userFirstName, setUserFirstName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userImagePath, setUserImagePath] = useState(null);
  const [pageCreator, setPageCreator] = useState(null);
  const [func, setFunc] = useState(null);

  const notificationListenerRef = useRef(null);
  const notifClickListenerRef = useRef(null);

  const userName = useMemo(() => {
    return `${userFirstName} ${userLastName}`;
  }, [userFirstName, userLastName]);

  const isPage = useMemo(() => {
    return pageCreator ? true : false;
  }, [pageCreator, userId]);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true, // Show notification alert
          shouldPlaySound: true, // Play sound
          shouldSetBadge: true, // Optionally set the badge on the app icon
        }),
      });
    }

    requestPermissions();
  }, []);

  const removeListeners = () => {
    if (notifClickListenerRef.current) notifClickListenerRef.current.remove();
    if (notificationListenerRef.current) notificationListenerRef.current();
  };

  useEffect(() => {
    if (!userId) return;

    const subscription = AppState.addEventListener("change", async (state) => {
      updateDoc(doc(db, "users", userId), {
        last_online_at: serverTimestamp(),
        active_status: state == "active" ? "active" : "inactive",
      });
    });

    notifClickListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        const href = data?.href;
        if (!href) return;

        if (!userId || userId !== data.receiver_id) {
          router.push("/auth/Login");
          return;
        }

        if (data.is_gc) {
          find("chats", data.params.groupChatId).then((g) => {
            router.push({
              pathname: "/pet-owner/group-chat",
              params: {
                chatDetailsStr: JSON.stringify({
                  id: g.id,
                  ...g.data(),
                }),
              },
            });
          });
          return;
        }

        router.push({
          pathname: href,
          params: data.params,
        });
      });

    const q = collectionName("notifications")
      .whereEquals("receiver_id", userId)
      .whereEquals("seen", false)
      .whereEquals("prompt", false)
      .orderByDesc("sent_at")
      .createQuery();
    notificationListenerRef.current = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(async (dc) => {
        const notif = dc.data();

        update("notifications", dc.id).value({
          prompt: true,
        });

        Notifications.scheduleNotificationAsync({
          content: {
            title: notif.type,
            body: descriptions[notif.type],
            data: {
              receiver_id: notif.receiver_id,
              href: notif.href,
              is_gc:
                notif.type === "Sent a Message" && notif.params?.groupChatId,
              notifId: dc.id,
              params: notif.params,
            },
          },
          trigger: null,
          sound: "default",
        });
      });
    });

    return () => {
      subscription.remove();
      removeListeners();
      updateDoc(doc(db, "users", userId), {
        last_online_at: serverTimestamp(),
        active_status: "inactive",
      });
    };
  }, [userId]);

  const reset = () => {
    setUserId(null);
    setUserFirstName(null);
    setUserLastName(null);
    setUserEmail(null);
    setUserImagePath(null);
    setPageCreator(null);
    setFunc(null);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        userFirstName,
        setUserFirstName,
        userLastName,
        setUserLastName,
        userEmail,
        setUserEmail,
        userImagePath,
        setUserImagePath,
        userName,
        func,
        setFunc,
        pageCreator,
        setPageCreator,
        reset,
        isPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
