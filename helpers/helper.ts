export const generateChatId = (user1: any, user2: any) => {
  const users = [user1, user2].sort();
  return users.join("_");
};

// export const generateChatId = (user1: any, user2: any) => {
//   return `${user1}_${user2}`;
// };
