import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp,
  writeBatch,
  WriteBatch,
} from "firebase/firestore";
import { db } from "./firebase";


const collectionName = (path: string, ...pathSegments: string[]) => whereMainProcess(false, [], path, pathSegments)
const collectionGroupName = (path: string) => whereMainProcess(true, [], path, [])

const whereMainProcess = (group:boolean, whereCond: QueryConstraint[], path: string, pathSegments: string[]) => {
  const proccess = (key:string, condition:WhereFilterOp, value: any) => {
    whereCond.push(where(key, condition, value))
    return whereMainProcess(group, whereCond, path, pathSegments)
  }
  
  return {
    where: (key:string, condition: WhereFilterOp, value: any) => proccess(key, condition, value),
    whereEquals: (key:string, value: any) => proccess(key, "==", value),
    whereNotEquals: (key:string, value: any) => proccess(key, "!=", value),
    whereIn: (key:string, value: any) => proccess(key, "in", value),
    whereNotIn: (key:string, value: any) => proccess(key, "not-in", value),
    whereGreaterThan: (key:string, value: any) => proccess(key, ">", value),
    whereLessThan: (key:string, value: any) => proccess(key, "<", value),
    whereGreaterThanOrEqual: (key:string, value: any) => proccess(key, ">=", value),
    whereLessThanOrEqual: (key:string, value: any) => proccess(key, "<=", value),
    whereArrayContains: (key:string, value: any) => proccess(key, "array-contains", value),
    whereArrayContainsAny: (key:string, value: any) => proccess(key, "array-contains-any", value),
    orderBy: (key:string) => {
      whereCond.push(orderBy(key))
      return whereMainProcess(group, whereCond, path, pathSegments)
    },
    orderByDesc: (key:string) => {
      whereCond.push(orderBy(key,'desc'))
      return whereMainProcess(group, whereCond, path, pathSegments)
    },
    limit: (total:number) => {
      whereCond.push(limit(total))
      return whereMainProcess(group, whereCond, path, pathSegments)
    },
    createQuery: () => (whereCond.length > 0) 
      ? query(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments), ...whereCond)
      : (group ? collectionGroup(db, path) : collection(db, path, ...pathSegments)),
    count: async () => (whereCond.length > 0
      ? await getCountFromServer(query(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments), ...whereCond)) 
      : await getCountFromServer(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments))
    ).data().count,
    get: async () => (whereCond.length > 0) 
      ? await getDocs(query(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments), ...whereCond)) 
      : await getDocs(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments)),
    getMapped: async (mapper?: (id:string, data: any) => any) => 
      ((whereCond.length > 0) 
        ? await getDocs(query(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments), ...whereCond)) 
        : await getDocs(group ? collectionGroup(db, path) : collection(db, path, ...pathSegments))
      ).docs.map(res => mapper ? mapper(res.id, res.data()) : ({id:res.id, ...res.data()}))
  }
} 



const map = (func: (id:string, data: any) => any) => {
  return {
    get: (path: string, ...pathSegments: string[]) => {
      return {
        where: async (...whereCond: QueryConstraint[]) =>
          (await getDocs(query(collection(db, path, ...pathSegments), ...whereCond)))
          .docs.map(res => func(res.id, res.data())),
      };
    }
  }
}

const find = async (path: string, ...pathSegments: string[]) => {
  return await getDoc(doc(db, path, ...pathSegments));
};

const all = async (path: string, ...pathSegments: string[]) => {
  return await getDocs(collection(db, path, ...pathSegments));
};

const get = (path: string, ...pathSegments: string[]) => {
  return {
    where: async (...whereCond: QueryConstraint[]) =>
      await getDocs(query(collection(db, path, ...pathSegments), ...whereCond)),
  };
};

const set = (path: string, ...pathSegments: string[]) => {
  return {
    value: async (data: any) =>
      await setDoc(doc(db, path, ...pathSegments), data, { merge: true }),
  };
};

const setUnMerged = (path: string, ...pathSegments: string[]) => {
  return {
    value: async (data: any) =>
      await setDoc(doc(db, path, ...pathSegments), data),
  };
};

const add = (path: string, ...pathSegments: string[]) => {
  return {
    value: async (data: any) =>
      await addDoc(collection(db, path, ...pathSegments), data),
  };
};

const update = (path: string, ...pathSegments: string[]) => {
  return {
    value: async (data: any) => {
      await updateDoc(doc(db, path, ...pathSegments), data);
    },
  };
};

const remove = async (path: string, ...pathSegments: string[]) => {
  await deleteDoc(doc(db, path, ...pathSegments));
};

const count = (path: string, ...pathSegments: string[]) => {
  return {
    where: async (...whereCond: QueryConstraint[]) => {
      const snap = await getCountFromServer(
        query(collection(db, path, ...pathSegments), ...whereCond),
      );

      return snap.data().count;
    },
  };
};

const saveBatch = (ops: ((batch: WriteBatch) => void)[]) => {
    while (ops.length) {
      const batch = writeBatch(db);
      ops.splice(0, 400).forEach((op) => op(batch));
      batch.commit();
    }
}

const getUserSavedItems = (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  return {
    where: async (...whereCond: QueryConstraint[]) =>
      await get("users", userId, "savedItems").where(...whereCond),
  };
};

export {
  add,
  all, collectionGroupName, collectionName, count, find,
  get, getUserSavedItems, map, orderBy,
  remove, saveBatch, serverTimestamp, set,
  setUnMerged,
  update,
  where
};

