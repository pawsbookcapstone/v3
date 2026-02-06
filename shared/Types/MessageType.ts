export type TMessage = {
  id: string;
  text: string;
  sender: "me" | "other";
  image?: string;
};
