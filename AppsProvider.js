import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { db } from "./helpers/firebase";

const AppContext = createContext();

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

  const userName = useMemo(() => {
    return `${userFirstName} ${userLastName}`;
  }, [userFirstName, userLastName]);

  const isPage = useMemo(() => {
    return pageCreator ? true : false;
  }, [pageCreator]);

  useEffect(() => {
    if (!userId) return;

    const subscription = AppState.addEventListener("change", async (state) => {
      setDoc(doc(db, "users", userId), {
        last_online_at: serverTimestamp(), active_status: state == 'active' ? 'active' : 'inactive'
      }, { merge: true })
    });

    return () => {
      setDoc(doc(db, "users", userId), {
        last_online_at: serverTimestamp(), active_status: 'inactive'
      }, { merge: true })
      subscription.remove();
    }
  }, [userId]);

  const reset = () => {
    setUserId(null)
    setUserFirstName(null)
    setUserLastName(null)
    setUserEmail(null)
    setUserImagePath(null)
    setPageCreator(null)
    setFunc(null)
  }

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
        isPage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
