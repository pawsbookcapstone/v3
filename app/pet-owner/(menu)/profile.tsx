import { useAppContext } from "@/AppsProvider";
import { add, all, count, find, get, set, where } from "@/helpers/db";
import { computeTimePassed } from "@/helpers/timeConverter";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import ProfileSkeleton from "@/shared/components/ProfileSkeleton";
import { screens, ShadowStyle } from "@/shared/styles/styles";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { limit, orderBy, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const { userId, userName, userImagePath } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [friends, setFriends] = useState<any>([]);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [comment, setComment] = useState("");

  const [posts, setPosts] = useState<any>([]);

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const snap = await find("users", userId);
  //     const data: any = snap.data();
  //     setProfile(data);

  //     const friendsSnap = await get("friends").where(
  //       where("users", "array-contains", userId),
  //       where("confirmed", "==", true),
  //       limit(6)
  //     );

  //     const _friends = friendsSnap.docs.map((f) => {
  //       const d = f.data();
  //       const otherUserId = d.users[0] === userId ? d.users[1] : d.users[0];
  //       return {
  //         id: f.id,
  //         user_id: otherUserId,
  //         ...d.details[otherUserId],
  //       };
  //     });
  //     setFriends(_friends);

  //     if (_friends.length < 6) {
  //       setFriendsCount(_friends.length);
  //     } else {
  //       const _count = await count("friends").where(
  //         where("users", "array-contains", userId),
  //         where("confirmed", "==", true)
  //       );
  //       setFriendsCount(_count);
  //     }

  //     const postsSnap = await get("posts").where(
  //       where("creator_id", "==", userId),
  //       orderBy("date", "desc")
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

  //   fetchProfile();
  // }, []);

  useEffect(() => {
  let mounted = true;

  const fetchProfile = async () => {
    setLoading(true);

    try {
      /** =========================
       *  1️⃣ Parallel base queries
       ========================== */
      const [userSnap, friendsSnap, postsSnap] = await Promise.all([
        find("users", userId),
        get("friends").where(
          where("users", "array-contains", userId),
          where("confirmed", "==", true),
          limit(6)
        ),
        get("posts").where(
          where("creator_id", "==", userId),
          orderBy("date", "desc")
        ),
      ]);

      if (!mounted) return;

      const profileData: any = userSnap.data();
      setProfile(profileData);

      /** =========================
       *  2️⃣ Friends list + count
       ========================== */
      const _friends = friendsSnap.docs.map(f => {
        const d = f.data();
        const otherUserId = d.users[0] === userId ? d.users[1] : d.users[0];
        return {
          id: f.id,
          user_id: otherUserId,
          ...d.details[otherUserId],
        };
      });

      setFriends(_friends);

      if (_friends.length < 6) {
        setFriendsCount(_friends.length);
      } else {
        const _count = await count("friends").where(
          where("users", "array-contains", userId),
          where("confirmed", "==", true)
        );
        setFriendsCount(_count);
      }

      /** =========================
       *  3️⃣ Optimize posts (parallel shared + comments)
       ========================== */
      const _posts = await Promise.all(
        postsSnap.docs.map(async dc => {
          const d = dc.data();

          // fetch shared post + comments in parallel
          const [sharedSnap, commentSnap] = await Promise.all([
            d.shared_post_id ? find("posts", d.shared_post_id) : Promise.resolve(null),
            all("posts", dc.id, "comments")
          ]);

          return {
            id: dc.id,
            ...d,
            liked: Array.isArray(d.liked_by_ids) ? d.liked_by_ids.includes(userId) : false,
            showComments: false,
            shared: sharedSnap?.data() ?? null,
            comments: commentSnap.docs.map(c => ({
              id: c.id,
              ...c.data()
            })),
            date_ago: computeTimePassed(d.date.toDate())
          };
        })
      );

      if (!mounted) return;
      setPosts(_posts);

    } catch (err) {
      console.error(err);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  fetchProfile();

  return () => {
    mounted = false;
  };
}, []);


  // const dummyprofile = {
  //   profile_photo: profile as string,
  //   name: "name as string",
  //   email: "V5tZM@example.com",
  //   friends: "100",
  //   phone_number: "1234567890",
  //   bio: "Dog Lover 4",
  // };

  const handleEditProfile = () => {
    router.push("/pet-owner/(menu)/edit-profile");
  };

  const toggleLike = async (id: string) => {
    console.log(id);

    // const _posts = Promise.all(

    // );
    setPosts((_posts: any) =>
      _posts.map((p: any) => {
        if (p.id !== id) return p;

        let liked_by_ids = [];
        if (!p.liked_by_ids) liked_by_ids = [userId];
        else {
          if (p.liked) {
            liked_by_ids = p.liked_by_ids.filter((l: any) => l !== userId);
          } else liked_by_ids = [...p.liked_by_ids, userId];
        }

        set("posts", id).value({ liked_by_ids: liked_by_ids });
        return {
          ...p,
          liked_by_ids: [...liked_by_ids],
          liked: !p.liked,
        };
      })
    );
  };

  const toggleComments = (id: string) => {
    setComment("");
    setPosts((prev: any) =>
      prev.map((p: any) =>
        p.id === id ? { ...p, showComments: !p.showComments } : p
      )
    );
  };
  
    const handleSeeProfile = (post: any) => {
      if (post.creator_id === userId) return
      
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
      prev.map((p: any) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, data],
            }
          : p
      )
    );
    setComment("");

    // setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
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
          )}
        </View>)
        }

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      <HeaderLayout noBorderRadius>
        <HeaderWithActions
          title={userName}
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
          <View
            style={[styles.profileContainer, { paddingBottom: 5, height: 385 }]}
          >
            {/* --- Cover Photo --- */}
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

            {/* --- Profile Photo and Info --- */}
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
                {userImagePath ? (
                  <Image
                    source={{ uri: userImagePath }}
                    style={styles.profileImage}
                  />
                ) : (
                  <FontAwesome name="user" size={50} color={Colors.gray} />
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
                <Text style={styles.name}>{userName}</Text>
                {profile.bio ? (
                  <Text style={styles.bio}>{profile.bio}</Text>
                ) : (
                  <Pressable
                    onPress={() =>
                      router.push("/pet-owner/(menu)/edit-profile")
                    }
                  >
                    <Text
                      style={[
                        styles.bio,
                        { color: Colors.primary, fontWeight: "600" },
                      ]}
                    >
                      Add Bio
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* --- Buttons --- */}
            <View style={styles.actionWrapper}>
              <Pressable
                style={styles.actionButton}
                onPress={handleEditProfile}
              >
                <MaterialIcons name="edit" size={17} color="white" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </Pressable>
              <Pressable
                style={styles.more}
                onPress={() => router.push("/pet-owner/(menu)/acc-settings")}
              >
                <Entypo name="dots-three-vertical" size={17} color="black" />
                {/* <Text style={[styles.actionButtonText, { color: "black" }]}>
                  Others
                </Text> */}
              </Pressable>
            </View>
          </View>

          <View style={styles.fiendListContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  gap: 5,
                  alignSelf: "flex-start",
                }}
              >
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
              <Text
                style={styles.find}
                onPress={() => router.push("/pet-owner/(friends)/suggestions")}
              >
                Find friends
              </Text>
            </View>

            {/* --- Friends Grid --- */}
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
              onPress={() => router.push("/pet-owner/(friends)/my-friends")}
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
                gap: 10,
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
                  source={{ uri: userImagePath }}
                  style={{ width: "100%", height: "100%", borderRadius: 30 }}
                />
              </View>

              <Text
                style={{
                  flex: 1,

                  borderRadius: 10,
                  padding: 15,
                }}
                // placeholder="What's on your mind?"
                // onPress={() => router.push("/pet-owner/(home)/post")}
              >
                What's on your mind?{" "}
              </Text>
              <MaterialIcons name="image" size={24} color={Colors.gray} />
            </Pressable>
          </View>

          {/* --- Posts Section --- */}
          <View style={styles.postsSection}>
            {posts.map((post: any) => (
              <View key={post.id} style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: userImagePath ?? null }}
                    style={styles.postProfile}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.userName}>{userName}</Text>
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
                {post.pets && post.pets.length > 0 && (
                  <View style={styles.taggedPetsContainer}>
                    {post.pets.map((pet: any) => (
                      <TouchableOpacity
                        key={pet.id}
                        style={styles.petChip}
                        onPress={() =>
                          console.log("Go to pet profile:", pet.name)
                        }
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

                {post.img_paths && (
                  <Image
                    source={{ uri: post.img_paths[0] }}
                    style={styles.postImage}
                  />
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
                      {post.comments?.length}
                    </Text>
                  </Pressable>
                </View>

                {/* Comments */}
                {post.showComments && (
                  <View style={styles.commentSection}>
                    {post.comments.map((c: any, idx:number) => (
                      <View key={idx} style={styles.commentRow}>
                        {c.commented_by_img_path ? (
                          <Image
                            source={{ uri: c.commented_by_img_path }}
                            style={styles.commentProfile}
                          />
                        ) : (
                          <View style={styles.commentProfile} />
                        )}
                        <View style={styles.commentBubble}>
                          <Text style={styles.commentUser}>{c.commented_by_name}</Text>
                          <Text style={styles.commentText}>{c.message}</Text>
                        </View>
                      </View>
                    ))}

                    {/* Add Comment */}
                    <View style={styles.addCommentRow}>
                      <Image
                        source={{ uri: userImagePath }}
                        style={styles.commentProfile}
                      />
                      <TextInput
                        placeholder="Write a comment..."
                        style={styles.commentInput}
                        value={comment}
                onChangeText={setComment}
                        // onChangeText={(text) =>
                        //   setPosts((prev: any) =>
                        //     prev.map((p: any) =>
                        //       p.id === post.id ? { ...p, newComment: text } : p
                        //     )
                        //   )
                        // }
                      />
                      <Pressable onPress={() => handleAddComment(post.id)}>
                        <Text style={styles.postCommentBtn}>Post</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
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
  actionWrapper: {
    flexDirection: "row",
    alignContent: "center",
    alignSelf: "center",
    gap: 5,
    justifyContent: "center",
    top: -65,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    width: "70%",
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
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  postFooter: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  countText: {
    marginLeft: 5,
    color: Colors.gray,
    fontSize: 13,
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
});
