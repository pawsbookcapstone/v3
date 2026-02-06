import { PetPostDetails } from "./PetType";

export type TPost = {
  id: string;
  user: string;
  profileImage?: string;
  cover_photo?: string;
  bio?: string;
  time: string;
  content: string;
  images: string[];
  liked: boolean;
  likesCount: number;
  comments: TComment[];
  showComments: boolean;
  taggedPets?: { id: string; name: string; image?: string }[];
  isFriend: boolean;
  sharesCount: number;
  sharedPost?: TPost; //  Added field
  isPage?: boolean;
  isFollowing?: boolean;
  followers?: string;
  following?: string;
};

export type TComment = {
  id: string;
  user: string;
  profileImage?: string;
  text: string;
};

export type Post = {
  id?: string;
  creator_id: string;
  creator_name: string;
  creator_img_path?: string;
  body: string;
  date: string;
  shares: number;
  liked: boolean | undefined;
  img_paths: string[] | undefined;
  pets?: PetPostDetails[];
  showComments: boolean;
};
