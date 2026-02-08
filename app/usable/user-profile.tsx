import { useAppContext } from "@/AppsProvider";
import { add, all, count, find, get, remove, set, update, where } from "@/helpers/db";
import { generateChatId } from "@/helpers/helper";
import { useNotifHook } from "@/helpers/notifHook";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import ProfileSkeleton from "@/shared/components/ProfileSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { limit, orderBy, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const { userId, userName, userImagePath, isPage } = useAppContext();
  const { userToViewId } = useLocalSearchParams<{
    userToViewId: string;
  }>();
  

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [friends, setFriends] = useState<any>([]);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [posts, setPosts] = useState<any>([]);
  const [comment, setComment] = useState("");
  const [friendStatus, setFriendStatus] = useState("Unfriend");
  const [blocked, setBlocked] = useState(false);

  const addNotif = useNotifHook()

  // useEffect(() => {
  //   const fetch = async () => {
  //     setLoading(true);

  //     const snap = await find("users", userToViewId);
  //     const data: any = snap.data();
  //     setProfile(data);

  //     const bsnap = await find("users", userId, "blocked_users", userToViewId)
  //     setBlocked(bsnap.exists())

  //     if (data.is_page){
        
  //     }
  //     else {
  //       const usnap = await find("friends", generateChatId(userId, userToViewId))
  //       if (usnap.exists()){
  //         const d = usnap.data()
  //         if (d.confirmed)
  //           setFriendStatus("Friend")
  //         else{
  //           if (d.users[0] === userId)
  //             setFriendStatus("Your Request")
  //           else
  //             setFriendStatus("Other Request")
  //         }
  //       }
        
  //       const friendsSnap = await get("friends").where(
  //         where("users", "array-contains", userToViewId),
  //         where("confirmed", "==", true),
  //         limit(6),
  //       );
  
  //       const _friends = friendsSnap.docs.map((f) => {
  //         const d = f.data();
  //         const otherUserId =
  //           d.users[0] === userToViewId ? d.users[1] : d.users[0];
  //         return {
  //           id: f.id,
  //           user_id: otherUserId,
  //           ...d.details[otherUserId],
  //         };
  //       });
  //       setFriends(_friends);
  
  //       if (_friends.length < 6) {
  //         setFriendsCount(_friends.length);
  //       } else {
  //         const _count = await count("friends").where(
  //           where("users", "array-contains", userToViewId),
  //           where("confirmed", "==", true),
  //         );
  //         setFriendsCount(_count);
  //       }
  //     }

  //     const postsSnap = await get("posts").where(
  //       where("creator_id", "==", userToViewId),
  //       orderBy("date", "desc"),
  //     );
  //     const _posts: any = [];

  //     for (const i in postsSnap.docs) {
  //       const dc = postsSnap.docs[i];
  //       const d = dc.data();

  //       let shared = null
  //       if (d.shared_post_id){
  //         const shareSnap = await find('posts', d.shared_post_id)
  //         shared = shareSnap.data()
  //       }

  //       const commentSnap = await all("posts", dc.id, "comments");
  //       _posts.push({
  //         id: dc.id,
  //         ...d,
  //         liked: Array.isArray(d.liked_by_ids)
  //           ? d.liked_by_ids.includes(userId)
  //           : false,
  //         showComments: false,
  //         shared:shared,
  //         comments: commentSnap.docs.map((_comment: any) => ({
  //           id: _comment.id,
  //           ..._comment.data(),
  //         })),
  //         date_ago: computeTimePassed(d.date.toDate()),
  //       });
  //     }

  //     setPosts(_posts);

  //     setLoading(false);
  //   };
  //   fetch();
  // }, []);

  useOnFocusHook(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);

      try {
        /** =========================
         *  PARALLEL BASE QUERIES
         ========================== */
        const [
          userSnap,
          blockSnap,
          postsSnap,
        ] = await Promise.all([
          find("users", userToViewId),
          find("users", userId, "blocked_users", userToViewId),
          get("posts").where(
            where("creator_id", "==", userToViewId),
            orderBy("date", "desc")
          ),
        ]);

        if (!mounted) return;

        const profileData: any = userSnap.data();
        setProfile(profileData);
        setBlocked(blockSnap.exists());

        /** =========================
         *  FRIEND / PAGE LOGIC
         ========================== */
        if (!profileData.is_page) {
          const chatId = generateChatId(userId, userToViewId);

          const friendSnap = await find("friends", chatId);

          if (friendSnap.exists()) {
            const d = friendSnap.data();
            if (d.confirmed) setFriendStatus("Friend");
            else if (d.users[0] === userId) setFriendStatus("Your Request");
            else setFriendStatus("Other Request");
          }

          const friendsSnap = await get("friends").where(
            where("users", "array-contains", userToViewId),
            where("confirmed", "==", true),
            limit(6)
          );

          const friends = friendsSnap.docs.map(f => {
            const d = f.data();
            const otherId =
              d.users[0] === userToViewId ? d.users[1] : d.users[0];

            return {
              id: f.id,
              user_id: otherId,
              ...d.details?.[otherId],
            };
          });

          setFriends(friends);

          if (friends.length < 6) {
            setFriendsCount(friends.length);
          } else {
            const countSnap = await count("friends").where(
              where("users", "array-contains", userToViewId),
              where("confirmed", "==", true)
            );
            setFriendsCount(countSnap);
          }
        }

        /** =========================
         *  POSTS OPTIMIZATION
         ========================== */
        const posts = await Promise.all(
          postsSnap.docs.map(async dc => {
            const d = dc.data();

            const [sharedSnap, commentsSnap] = await Promise.all([
              d.shared_post_id
                ? find("posts", d.shared_post_id)
                : Promise.resolve(null),
              all("posts", dc.id, "comments"),
            ]);

            return {
              id: dc.id,
              ...d,
              liked: Array.isArray(d.liked_by_ids)
                ? d.liked_by_ids.includes(userId)
                : false,
              showComments: false,
              shared: sharedSnap?.data() ?? null,
              comments: commentsSnap.docs.map(c => ({
                id: c.id,
                ...c.data(),
              })),
              date_ago: computeTimePassed(d.date.toDate()),
            };
          })
        );

        if (mounted) setPosts(posts);

      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, []);


  const openImageModal = (images: string[], index: number) => {
    setSelectedPostImages(images);
    setSelectedIndex(index);
    setImageModalVisible(true);
  };

  const toggleLike = async (id: string) => {
    console.log(id);

    // const _posts = Promise.all(

    // );
    setPosts((_posts: any) =>
      _posts.map((p: any) => {
        if (p.id !== id) return p;

        const isLiking = !p.liked;
        
        let liked_by_ids = [];
        if (!p.liked_by_ids) liked_by_ids = [userId];
        else {
          if (p.liked) {
            liked_by_ids = p.liked_by_ids.filter((l: any) => l !== userId);
          } else liked_by_ids = [...p.liked_by_ids, userId];
        }

        update("posts", id).value({ liked_by_ids: liked_by_ids });
        if (isLiking)
          addNotif({
            receiver_id: p.creator_id,
            href: "/pet-owner/profile",
            type: "Like",
          });
        return {
          ...p,
          liked_by_ids: [...liked_by_ids],
          liked: isLiking,
        };
      }),
    );
  };

  const toggleComments = (id: string) => {
    setComment("");
    setPosts((prev: any) =>
      prev.map((p: any) =>
        p.id === id ? { ...p, showComments: !p.showComments } : p,
      ),
    );
  };

  const unBlock = () => {
    remove("users", userId, "blocked_users", userToViewId)
    setBlocked(false)
  }

  const block = () => {
    set("users", userId, "blocked_users", userToViewId).value({})
    setBlocked(true)
  }

  const addFriend = () => {
    const generatedId = generateChatId(userId, userToViewId)
    set("friends", generatedId).value({
      users: [userId, userToViewId],
      date_requested: serverTimestamp(),
      requested_by_id: userId,
      confirmed: false,
      details: {
        // Save info of the friend you are requesting
        [userToViewId]: {
          name: `${profile.firstname} ${profile.lastname}`,
          img_path: profile.img_path ?? "",
        },
        // Optionally, save current user info too
        [userId]: {
          name: userName,
          img_path: userImagePath ?? "",
        },
      },
    })
    setFriendStatus("Your Request")
    addNotif({
      receiver_id: userToViewId,
      href: "/pet-owner/add-friend",
      type: "Sent Friend Request",
      params: {
        id: generatedId,
      }
    });
  }

  const unfriendOrCancelRequest = () => {
    remove("friends", generateChatId(userId, userToViewId))
    setFriendStatus("Unfriend")
  }

  const handleAddComment = (postId: string) => {
    // const text = commentInputs[postId]?.trim();
    // if (!text) return;

    const data = {
      commented_by_id: userId,
      commented_by_name: userName,
      commented_by_img_path: userImagePath ?? null,
      message: comment,
      date: serverTimestamp(),
    };

    add("posts", postId, "comments").value(data);

    setPosts((prev: any) =>
      prev.map((p: any) => {
        if (p.id !== postId) return p;

        addNotif({
          receiver_id: p.creator_id,
          href: "/pet-owner/(menu)/profile",
          type: "Comment",
        });

        return {
          ...p,
          comments: [...p.comments, data],
        };
      }),
    );
    setComment("");

    // setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };
    
  const handleSeeProfile = (post: any) => {
    if (post.creator_id === userId) {
      router.push("/pet-owner/profile");
      return;
    }

    if (post.creator_is_page)
      router.push({
        pathname: '/other-user/profile',
        params: {
          pageId: post.creator_id
        }
      })
    else
      router.push({
        pathname: "/usable/user-profile",
        params: { userToViewId: post.creator_id },
      });
  };


  const renderShared = (item: any) => {
    const maxImagesToShow = 3;
    const extraImages = (item.img_paths ?? []).length - maxImagesToShow;

    return (
      <View style={styles.sharedPostCard}>
        <View style={styles.sharedPostHeader}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => handleSeeProfile(item)}
          >
            {item.creator_img_path ? (
              <Image
                source={{ uri: item.creator_img_path }}
                style={styles.sharedProfileImage}
              />
            ) : (
              <View style={styles.sharedProfileImage} />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 8,
                flex: 1,
                gap: 10,
              }}
            >
              <View>
                <Text style={styles.sharedUserName}>{item.creator_name}</Text>
                <Text style={styles.sharedPostTime}>{item.date_ago}</Text>
              </View>
            </View>
          </Pressable>
          </View>

        {/* Content */}
        <Text style={styles.sharedPostContent}>{item.body}</Text>

        {/* Tagged Pets */}
        {item.pets && item.pets.length > 0 && (
          <View style={styles.taggedPetsContainer}>
            {item.pets.map((pet: any) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petChip}
                onPress={() => console.log("Go to pet profile:", pet.name)}
              >
                {pet.img_path ? (
                  <Image
                    source={{ uri: pet.img_path }}
                    style={styles.petAvatar}
                  />
                ) : (
                  <View style={styles.petAvatar} />
                )}
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Images Grid */}
        {item.img_paths && item.img_paths.length > 0 && (
          <View style={styles.imageGrid}>
            {item.img_paths
              .slice(0, maxImagesToShow)
              .map((img: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.imageWrapper}
                  onPress={() => {
                    // setSelectedPostImages(item.img_paths ?? []);
                    // setSelectedIndex(idx);
                    // setImageModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {idx === maxImagesToShow - 1 && extraImages > 0 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>+{extraImages}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        )
      }
    </View>)
  }

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      <HeaderLayout noBorderRadius>
        <HeaderWithActions
          title={`${profile.firstname ?? ''} ${profile.lastname ?? ''}`}
          onBack={() => router.back()}
          onAction={() => router.push("/pet-owner/search")}
          actionIcon="search"
          centerTitle={true}
        />
      </HeaderLayout>

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Profile Header --- */}
          <View
            style={[
              styles.profileContainer,
              { height: 380, paddingBottom: 10 },
            ]}
          >
            {/* Cover Photo */}
            <View style={styles.coverPhoto}>
              {profile.cover_photo_path ? (
                <Image
                  source={{ uri: profile.cover_photo_path }}
                  style={styles.coverImage}
                />
              ) : (
                <FontAwesome name="photo" size={50} color={Colors.gray} />
              )}
            </View>

            {/* Profile Photo + Info */}
            <View
              style={{
                flexDirection: "column",
                gap: 5,
                alignSelf: "flex-start",
                marginLeft: 10,
                top: -80,
              }}
            >
              <View style={styles.profilePhoto}>
                {profile.img_path ? (
                  <Image
                    source={{ uri: profile.img_path }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Image
                    source={{
                      uri: "https://res.cloudinary.com/diwwrxy8b/image/upload/v1769641991/jzibxr8wuvqhfqwcnusm.jpg",
                    }}
                    style={styles.profileImage}
                  />
                )}
              </View>

              <View
                style={{
                  flexDirection: "column",
                  gap: 5,
                  alignSelf: "flex-start",
                  marginLeft: 20,
                }}
              >
                <Text
                  style={styles.name}
                >{`${profile.firstname} ${profile.lastname}`}</Text>
                <Text style={styles.bio}>{profile.bio}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionWrapper}>
              {!isPage && friendStatus != "Other Request" &&
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: friendStatus === "Your Request" ? Colors.red : (friendStatus == 'Friend' ? "#ccc" : Colors.primary) },
                  ]}
                  onPress={() => {
                    if (friendStatus === "Friend" || friendStatus === "Your Request") {
                      unfriendOrCancelRequest()
                    } else {
                      addFriend()
                    }
                  }}
                >
                  {(friendStatus === "Friend") && (
                    <>
                      <FontAwesome5 name="user-times" size={17} color="black" />
                      <Text style={[styles.actionButtonText, { color: "black" }]}>
                        Unfriend
                      </Text>
                    </>
                  )}
                  {friendStatus === "Unfriend" && (
                    <>
                      <FontAwesome5 name="user-plus" size={17} color="black" />
                      <Text style={[styles.actionButtonText, { color: "black" }]}>
                        Add Friend
                      </Text>
                    </>
                  )}
                  {friendStatus === "Your Request" && (
                    <>
                      <FontAwesome5 name="user-plus" size={17} color="black" />
                      <Text style={[styles.actionButtonText, { color: "black" }]}>
                        Cancel Request
                      </Text>
                    </>
                  )}
                </Pressable>
              }

              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: Colors.primary },
                ]}
                onPress={() => router.push({
                  pathname:"/pet-owner/(chat)/chat-field",
                  params: {
                    otherUserId: profile.id,
                    otherUserName: `${profile.firstname} ${profile.lastname}`,
                    otherUserImgPath: profile.img_path,
                    otherUserIsPage: profile.is_page
                  }
                })}
              >
                <Ionicons name="chatbubble-sharp" size={17} color="white" />
                <Text style={styles.actionButtonText}>Message</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: blocked ? Colors.primary : Colors.red },
                ]}
                onPress={() => {
                  if (blocked) unBlock()
                  else block()
                }}
              >
                {blocked ? (
                  <>
                    <FontAwesome5 name="user-times" size={17} color="black" />
                    <Text style={[styles.actionButtonText, { color: "black" }]}>
                      Unblock
                    </Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="user-plus" size={17} color="black" />
                    <Text style={[styles.actionButtonText, { color: "black" }]}>
                      Block
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* --- Friends Section --- */}
          <View style={styles.fiendListContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <View style={{ flexDirection: "column", gap: 5 }}>
                <Text style={styles.title}>Friends</Text>
                <Text style={styles.friendsCount}>
                  {friendsCount}{" "}
                  <Text
                    style={{
                      color: Colors.gray,
                      fontSize: 12,
                      fontFamily: "Roboto",
                    }}
                  >
                    Friends
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.friendGrid}>
              {friends.map((friend: any) => (
                <View key={friend.id} style={styles.friendCard}>
                  <Image
                    source={{ uri: friend.img_path }}
                    style={styles.friendImage}
                  />
                  <Text style={styles.friendName} numberOfLines={2}>
                    {friend.name}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.viewall}
              onPress={() => router.push({
                pathname: "/pet-owner/(friends)/my-friends",
                params: {userToViewId}
              })}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: "#000", fontFamily: "RobotoSemiBold" },
                ]}
              >
                See all friends
              </Text>
            </Pressable>
          </View>

          {/* --- Add Post --- */}
          <View style={styles.addPost}>
            <Text
              style={{
                fontFamily: "RobotoSemiBold",
                fontSize: 16,
                color: "#000",
                marginLeft: 10,
                marginTop: 5,
              }}
            >
              Add Post
            </Text>

            <Pressable
              style={{
                flexDirection: "row",
                marginLeft: 10,
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 10,
              }}
              onPress={() => router.push("/pet-owner/(home)/post")}
            >
              <View
                style={{
                  borderRadius: 30,
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                }}
              >
                <Image
                  source={{ uri: profile.cover_photo_path }}
                  style={{ width: "100%", height: "100%", borderRadius: 30 }}
                />
              </View>

              <Text
                style={{
                  flex: 1,
                  borderRadius: 10,
                  padding: 15,
                }}
              >
                Write something about{" "}
                {`${profile.firstname} ${profile.lastname}`}...
              </Text>
              <MaterialIcons name="image" size={24} color={"#08CB00"} />
            </Pressable>
          </View>

          {/* --- Posts Section --- */}
          <View style={styles.postsSection}>
            {posts.map((post: any) => {
              const maxImagesToShow = 3;
              const extraImages =
                post.img_paths && post.img_paths.length > maxImagesToShow
                  ? post.img_paths.length - maxImagesToShow
                  : 0;
              return (
                <View key={post.id} style={styles.postCard}>
                  {/* Header */}
                  <View style={styles.postHeader}>
                    <Image
                      source={{ uri: post.creator_img_path }}
                      style={styles.postProfile}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.userName}>{post.creator_name}</Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                    <Entypo
                      name="dots-three-horizontal"
                      size={18}
                      color={Colors.gray}
                    />
                  </View>

                  {/* Content */}
                  <Text style={styles.postContent}>{post.body}</Text>

                  {post.img_paths && post.img_paths.length > 0 && (
                    <View style={styles.imageGrid}>
                      {post.img_paths
                        .slice(0, maxImagesToShow)
                        .map((img: any, idx: any) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.imageWrapper}
                            onPress={() => openImageModal(post.img_paths, idx)}
                            activeOpacity={0.8}
                          >
                            <Image
                              source={{ uri: img }}
                              style={styles.gridImage}
                              resizeMode="cover"
                            />
                            {idx === maxImagesToShow - 1 && extraImages > 0 && (
                              <View style={styles.overlay}>
                                <Text style={styles.overlayText}>
                                  +{extraImages}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                  
                {post.shared && renderShared(post.shared)}

                  {/* Footer */}
                  <View style={styles.postFooter}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => toggleLike(post.id)}
                    >
                      <Ionicons
                        name={post.liked ? "heart-sharp" : "heart-outline"}
                        size={23}
                        color={post.liked ? "red" : "black"}
                      />
                      <Text style={styles.countText}>
                        {(post.liked_by_ids ?? []).length}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => toggleComments(post.id)}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color="black"
                      />
                      <Text style={styles.countText}>
                        {post.comments.length}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Comments */}
                  {post.showComments && (
                    <View style={styles.commentSection}>
                      {post.comments.map((c: any, idx:number) => (
                        <View key={idx} style={styles.commentRow}>
                          <Image
                            source={{ uri: c.profileImage }}
                            style={styles.commentProfile}
                          />
                          <View style={styles.commentBubble}>
                            <Text style={styles.commentUser}>{c.commented_by_name}</Text>
                            <Text style={styles.commentText}>{c.message}</Text>
                          </View>
                        </View>
                      ))}

                      <View style={styles.addCommentRow}>
                        <Image
                          source={{ uri: profile.img_path }}
                          style={styles.commentProfile}
                        />
                        <TextInput
                          placeholder="Write a comment..."
                          style={styles.commentInput}
                          value={comment}
                          onChangeText={setComment}
                        />
                        <Pressable onPress={() => handleAddComment(post.id)}>
                          <Text style={styles.postCommentBtn}>Post</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{
              x: selectedIndex * Dimensions.get("window").width,
              y: 0,
            }}
          >
            {selectedPostImages.map((img, idx) => (
              <View key={idx} style={styles.fullImageWrapper}>
                <Image source={{ uri: img }} style={styles.fullImage} />
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  sharedProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C3C0C0",
  },
  sharedPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sharedPostCard: {
    borderWidth: 1,
    borderBottomWidth:0,
    borderColor: Colors.lightGray,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderBottomRightRadius:0,
    borderBottomLeftRadius:0,
    width: "95%",
    alignSelf: "center",
  },
  sharedUserName: {
    fontWeight: "600",
    fontSize: 14,
  },
  sharedPostContent: {
    marginVertical: 5,
    fontSize: 14,
  },
  sharedPostTime: {
    fontSize: 12,
    color: "#888",
  },
  taggedPetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  petChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  petAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: "#ccc",
  },
  petName: {
    fontSize: 12,
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  profileContainer: {
    width: "100%",
    backgroundColor: "#fff",
  },
  coverPhoto: {
    width: "100%",
    height: 200,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profilePhoto: {
    padding: 2,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    width: 130,
    height: 130,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.white,
    alignSelf: "flex-start",
    marginLeft: 10,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    resizeMode: "cover",
  },
  actionWrapper: {
    flexDirection: "row",
    alignContent: "center",
    alignSelf: "center",
    gap: 5,
    justifyContent: "center",
    top: -65,
    marginHorizontal: 10,
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    backgroundColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,

    paddingHorizontal: 20,
    alignSelf: "center",
  },
  more: {
    width: "15%",
    backgroundColor: Colors.lightGray,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    alignContent: "center",
  },
  actionButtonText: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "white",
  },
  name: {
    fontSize: 24,
    fontFamily: "RobotoSemiBold",
    color: Colors.black,
  },
  bio: {
    fontSize: 16,
    fontFamily: "Roboto",
    color: Colors.black,
    marginTop: 8,
  },
  friendsCount: {
    fontSize: 16,
    fontFamily: "RobotoSemibold",
    color: "black",
  },
  fiendListContainer: {
    width: "100%",
    paddingVertical: 5,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  title: {
    fontSize: 17,
    fontFamily: "RobotoSemiBold",
    color: "#000",
    marginTop: 20,
  },
  find: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: Colors.primary,
    marginTop: 20, // ✅ instead of top: 20
    marginRight: 10,
  },

  friendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 3,
    marginTop: 10,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  friendCard: {
    width: "30%", // 3 per row
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    ...ShadowStyle,
    // overflow: "hidden",
    height: 170,
  },
  friendImage: {
    width: "100%",
    height: 115,
    // borderRadiu: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    resizeMode: "cover",
  },
  friendName: {
    fontFamily: "RobotoSemiBold",
    fontSize: 15,
    color: Colors.black,
    marginTop: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
    maxWidth: 100,
    lineHeight: 18,
    flexWrap: "wrap",
  },
  viewall: {
    backgroundColor: "#ccc",
    alignSelf: "center",
    width: "95%",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  addPost: {
    width: "100%",
    paddingVertical: 5,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  postsSection: {
    marginTop: 5,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 5,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontWeight: "600",
    fontSize: 15,
  },
  postTime: {
    color: Colors.gray,
    fontSize: 12,
  },
  postContent: {
    marginVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
  },
  imageWrapper: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 15,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countText: {
    fontSize: 13,
    color: "#000",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageWrapper: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  commentSection: {
    marginTop: 10,

    paddingTop: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  commentProfile: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C3C0C0",
    marginRight: 8,
  },
  commentBubble: {
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    padding: 6,
    maxWidth: "85%",
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: "#333",
  },
  addCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  commentInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 15,
    paddingHorizontal: 10,
    fontSize: 12,
    height: 40,
  },
  postCommentBtn: {
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 5,
  },
});
