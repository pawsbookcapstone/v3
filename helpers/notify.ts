import { createNotification } from "./notification-helper";

export const notifyFriendRequest = (payload: {
  toUserId: string;
  fromUserId: string;
  name: string;
  profile: string;
}) =>
  createNotification({
    userId: payload.toUserId,
    actorId: payload.fromUserId,
    name: payload.name,
    profile: payload.profile,
    type: "friend_request",
  });

export const notifyFriendAccepted = (payload: {
  toUserId: string;
  fromUserId: string;
  name: string;
  profile: string;
}) =>
  createNotification({
    userId: payload.toUserId,
    actorId: payload.fromUserId,
    name: payload.name,
    profile: payload.profile,
    type: "friend_accepted",
  });

export const notifyLikePost = (payload: {
  toUserId: string;
  fromUserId: string;
  name: string;
  profile: string;
  postId: string;
}) =>
  createNotification({
    userId: payload.toUserId,
    actorId: payload.fromUserId,
    name: payload.name,
    profile: payload.profile,
    type: "like",
    postId: payload.postId,
  });

export const notifyCommentPost = (payload: {
  toUserId: string;
  fromUserId: string;
  name: string;
  profile: string;
  postId: string;
}) =>
  createNotification({
    userId: payload.toUserId,
    actorId: payload.fromUserId,
    name: payload.name,
    profile: payload.profile,
    type: "comment",
    postId: payload.postId,
  });

export const notifySharePost = (payload: {
  toUserId: string;
  fromUserId: string;
  name: string;
  profile: string;
  postId: string;
}) =>
  createNotification({
    userId: payload.toUserId,
    actorId: payload.fromUserId,
    name: payload.name,
    profile: payload.profile,
    type: "share",
    postId: payload.postId,
  });
