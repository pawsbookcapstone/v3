import { useAppContext } from "@/AppsProvider";
import PostDropdown from "@/components/modals/PostDropdown";
import ReportPostModal from "@/components/modals/ReportPostModal";
import {
  add,
  all,
  collectionGroupName,
  find,
  get,
  orderBy,
  remove,
  serverTimestamp,
  set,
  where
} from "@/helpers/db";
import { useNotifHook } from "@/helpers/notifHook";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useNotificationHook } from "@/hooks/notificationHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import SkeletonPost from "@/shared/components/SkeletalLoader";
import { screens } from "@/shared/styles/styles";
import { Post } from "@/shared/Types/PostType";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  findNodeHandle,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

const myProfileImage = {
  profile: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "John Doe",
};
//

const Home = () => {
  const { userId, userName, userImagePath, isPage } = useAppContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  // const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { newPost } = useLocalSearchParams();
  const [post, setPost] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(
    null,
  );

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {},
  );

  const addNotif = useNotifHook();
  const hasNotif = useNotificationHook()

  // const onRefresh = async () => {
  //   setLoading(true);
  //   try {
  //     const friendsSnap = await get("friends").where(
  //       where("users", "array-contains", userId),
  //       where("confirmed", "==", true),
  //     );
  //     const friend_ids = friendsSnap.docs.map((d) => {
  //       const t = d.data();
  //       return t.users[0] === userId ? t.users[1] : t.users[0];
  //     });
  //     friend_ids.push(userId);

  //     const snap = await get("posts").where(
  //       where("creator_id", "in", friend_ids),
  //       orderBy("date", "desc"),
  //     );
  //     const _posts: any = [];

  //     for (const i in snap.docs) {
  //       const dc = snap.docs[i];
  //       const d = dc.data();

  //       let shared = null
  //       if (d.shared_post_id){
  //         const shareSnap = (await find('posts', d.shared_post_id))
  //         shared = shareSnap.data()
  //       }

  //       const commentSnap = await all("posts", dc.id, "comments");
  //       _posts.push({
  //         id: dc.id,
  //         ...d,
  //         liked: Array.isArray(d.liked_by_ids)
  //           ? d.liked_by_ids.includes(userId)
  //           : false,
  //         shared:shared,
  //         showComments: false,
  //         comments: commentSnap.docs.map((_comment: any) => ({
  //           id: _comment.id,
  //           ..._comment.data(),
  //         })),
  //         date_ago: computeTimePassed(d.date.toDate()),
  //       });
        
  //     }

  //     setPosts(_posts);
  //   } finally {
  //     // catch (e) {
  //     //   Alert.alert("Error", e + "");
  //     // }
  //     setLoading(false);
  //   }
  //   // setTimeout(() => {
  //   //   setPosts([]);
  //   //   setLoading(false);
  //   // }, 1500);
  // };


  const onRefresh = async () => {
    if (!userId) return
    
    setLoading(true);

    try {
      let connectedIds = [userId]

      const following = await collectionGroupName("followers")
        .whereEquals("follower_id", userId)
        .get();

      const pageIds = following.docs.map(d => d.ref.parent.parent?.id)
      connectedIds.push(...pageIds)
    
      if (!isPage){
        // 1️⃣ Fetch friends
        const friendsSnap = await get("friends").where(
          where("users", "array-contains", userId),
          where("confirmed", "==", true),
        );
  
        const friendIds = friendsSnap.docs.map((d) => {
          const { users } = d.data();
          return users[0] === userId ? users[1] : users[0];
        });
        connectedIds.push(...friendIds)
      }

      const chunk = (arr: any[], size = 10) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );

      // 2️⃣ Fetch posts (handle Firestore IN limit)
      const postSnaps = await Promise.all(
        chunk(connectedIds).map((ids:string[]) =>
          get("posts").where(
            where("creator_id", "in", ids),
            orderBy("date", "desc"),
          )
        )
      );

      const postsDocs = postSnaps.flatMap((s) => s.docs);

      // 3️⃣ Collect shared post IDs
      const sharedIds = [
        ...new Set(
          postsDocs
            .map((d) => d.data().shared_post_id)
            .filter(Boolean)
        ),
      ];

      // 4️⃣ Fetch shared posts in parallel
      const sharedMap: Record<string, any> = {};
      await Promise.all(
        sharedIds.map(async (id:any) => {
          const snap = await find("posts", id);
          if (snap.exists()) sharedMap[id] = snap.data();
        })
      );

      // 5️⃣ Fetch comments in parallel
      const commentsMap: Record<string, any[]> = {};
      await Promise.all(
        postsDocs.map(async (dc:any) => {
          const commentSnap = await all("posts", dc.id, "comments");
          commentsMap[dc.id] = commentSnap.docs.map((c: any) => ({
            id: c.id,
            ...c.data(),
          }));
        })
      );

      // 6️⃣ Build final posts
      const _posts = postsDocs.map((dc:any) => {
        const d = dc.data();

        return {
          id: dc.id,
          ...d,
          liked: Array.isArray(d.liked_by_ids)
            ? d.liked_by_ids.includes(userId)
            : false,
          shared: d.shared_post_id ? sharedMap[d.shared_post_id] : null,
          showComments: false,
          comments: commentsMap[dc.id] ?? [],
          date_ago: computeTimePassed(d.date.toDate()),
        };
      });

      setPosts(_posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    onRefresh();
    // setTimeout(() => {
    //   // setPosts((prev) => (prev.length === 0 ? initialPosts : prev));
    //   setLoading(false);
    // }, 2000);
  }, [userId]);

  // useEffect(() => {
  //   // console.log(userId, userName, userImagePath);
  //   if (newPost) {
  //     try {
  //       const parsed: TPost = JSON.parse(newPost as string);
  //       // setPosts((prev) => [parsed, ...prev]);
  //     } catch (e) {
  //       console.error(" Invalid JSON newPost:", e, newPost);
  //     }
  //   }
  // }, [newPost]);

  const toggleLike = async (id: string) => {
    setPosts((posts: any[]) =>
      posts.map((p: any) => {
        if (p.id !== id) return p;

        const isLiking = !p.liked;

        let liked_by_ids = [];

        if (!p.liked_by_ids) {
          liked_by_ids = [userId];
        } else {
          liked_by_ids = p.liked
            ? p.liked_by_ids.filter((l: string) => l !== userId)
            : [...p.liked_by_ids, userId];
        }

        // 🔥 Update Firestore
        set("posts", id).value({ liked_by_ids });

        // 🔔 SEND NOTIFICATION (only if liking)
        if (isLiking) {
          addNotif({
            receiver_id: p.creator_id,
            href: "/pet-owner/profile",
            type: "Like",
          });
          // notifyLikePost({
          //   toUserId: id, // post owner
          //   fromUserId: userId,
          //   name: userName,
          //   profile: userImagePath,
          //   postId: id,
          // });
        }

        return {
          ...p,
          liked_by_ids,
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

  const handleShare = (post: Post) => {
    // Increment share count
    // setPosts((prev) =>
    //   prev.map((p) =>
    //     p.id === post.id ? { ...p, sharesCount: p.sharesCount + 1 } : p
    //   )
    // );
    // Navigate to share-post screen and pass full post data
    router.push({
      pathname: "/usable/share-post",
      params: { post: JSON.stringify(post) },
    });
  };

  const openDropdown = (event: any, postId: string) => {
    const handle = findNodeHandle(event.target);
    if (handle) {
      UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
        setDropdownPos({ x: pageX, y: pageY + 20 });
        setSelectedPostId(postId);
        setShowDropdown(true);
      });
    }
  };
  const handleFollow = (postId: string) => {
    setPosts((prev: any) =>
      prev.map((p: any) => (p.id === postId ? { ...p, isFollowing: true } : p)),
    );
    ToastAndroid.show("You are now following this page!", ToastAndroid.SHORT);
  };

  const handleSavePost = (postId: string, _unSavedId: string | null) => {
    if (_unSavedId) remove("users", userId, "saved", _unSavedId);
    else
      add("users", userId, "saved").value({
        saved_id: postId,
        saved_at: serverTimestamp(),
        is_post: true,
      });
  };

  const handleSeeProfile = (post: any) => {
    if (post.creator_id === userId) {
      if (!post.creator_is_page)
        router.push("/pet-owner/profile");
      else
        router.push({
          pathname: '/other-user/profile',
          params: {
            pageId: post.creator_id
          }
        })
      return;
    }
    console.log(post);
    
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

  // const handleReport = (postId: string) => {
  //   setSelectedPostId(postId);
  //   setReportModalVisible(true);
  // };
  const deletePost = async (postId: string) => {
    try {
      // Delete from Firestore
      await remove("posts", postId); // or deleteDoc(doc(db, "posts", postId));

      // Update local state
      setPosts((prev: any) => prev.filter((p: any) => p.id !== postId));

      // Feedback
      ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
    } catch (e) {
      console.log("Failed to delete post:", e);
      Alert.alert("Error", "Failed to delete post");
    }
  };

  const renderShared = (item: any) => {
    const maxImagesToShow = 3;
    const extraImages = (item.img_paths ?? []).length - maxImagesToShow;

    return (
      <View style={styles.sharedPostCard}>
        <View style={styles.postHeader}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => handleSeeProfile(item)}
          >
            {item.creator_img_path ? (
              <Image
                source={{ uri: item.creator_img_path }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImage} />
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
                <Text style={styles.userName}>{item.creator_name}</Text>
                <Text style={styles.postTime}>{item.date_ago}</Text>
              </View>
            </View>
          </Pressable>
          </View>

        {/* Content */}
        <Text style={styles.postContent}>{item.body}</Text>

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
                    setSelectedPostImages(item.img_paths ?? []);
                    setSelectedIndex(idx);
                    setImageModalVisible(true);
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

  const renderPost = ({ item }: any) => {
    const maxImagesToShow = 3;
    const extraImages = (item.img_paths ?? []).length - maxImagesToShow;

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => handleSeeProfile(item)}
          >
            {item.creator_img_path ? (
              <Image
                source={{ uri: item.creator_img_path }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImage} />
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
                <Text style={styles.userName}>{item.creator_name}</Text>
                <Text style={styles.postTime}>{item.date_ago}</Text>
              </View>

              {/* {item.isPage && !item.isFollowing && (
                <Pressable
                  onPress={() => handleFollow(item.id)}
                  style={styles.followButton}
                >
                  <Text style={styles.followButtonText}>Follow</Text>
                </Pressable>
              )} */}
            </View>
          </Pressable>

          <View style={{ position: "absolute", top: 10, right: 10 }}>
            <TouchableOpacity onPress={(e) => openDropdown(e, item.id ?? "")}>
              <Feather name="more-vertical" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{item.body}</Text>

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
        {/* If this is a shared post, show the embedded original post */}
        {/* {item.sharedPost && (
          <View style={styles.sharedPostContainer}>
            <View>
              <Image
                source={{ uri: item.sharedPost.profileImage }}
                style={styles.sharedProfileImage}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.sharedUserName}>
                  {item.sharedPost.user}
                </Text>
                <Text style={styles.sharedPostTime}>
                  {item.sharedPost.time}
                </Text>
              </View>
            </View>

            {item.sharedPost.content ? (
              <Text style={styles.sharedContent}>
                {item.sharedPost.content}
              </Text>
            ) : null}

            {item.sharedPost.images?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.sharedPost.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img }}
                    style={styles.sharedImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )} */}

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
                    setSelectedPostImages(item.img_paths ?? []);
                    setSelectedIndex(idx);
                    setImageModalVisible(true);
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

        {item.shared && renderShared(item.shared)}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => toggleLike(item.id)}
            style={styles.actionBtn}
          >
            <Ionicons
              name={item.liked ? "heart-sharp" : "heart-outline"}
              size={23}
              color={item.liked ? "red" : "black"}
            />
            <Text style={styles.countText}>
              {(item.liked_by_ids ?? []).length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleComments(item.id)}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={20} color="black" />
            <Text style={styles.countText}>{item.comments.length}</Text>
          </TouchableOpacity>

          {/* ✅ Share Button */}
          {item.creator_id !== userId && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(item)}
            >
              <Image
                source={require("../../../assets/images/share.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={styles.countText}>{item.shares}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments */}
        {item.showComments && (
          <View style={styles.commentSection}>
            {item.comments.map((c: any, idx: number) => (
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
                // value={commentInputs[item.id] || ""}
                // onChangeText={(text) =>
                //   setCommentInputs((prev) => ({ ...prev, [item.id]: text }))
                // }
              />
              <TouchableOpacity onPress={() => handleAddComment(item.id)}>
                <Text style={styles.postCommentBtn}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      <HeaderLayout noBorderRadius>
        <Image
          source={require("../../../assets/images/logo/headerlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.iconWrapper}>
          <Pressable
            onPress={() => {
              const routePath = "/pet-owner/post";

              router.push({
                pathname: routePath,
                params: {
                  profile: myProfileImage.profile,
                  name: myProfileImage.name,
                },
              });
            }}
          >
            <FontAwesome name="plus-square-o" size={24} color="black" />
          </Pressable>
          <Pressable onPress={() => router.push("/pet-owner/notifications")}>
            <Feather name="bell" size={24} color="black" />
            {
              hasNotif && 
                    <View
                      style={{
                        position: "absolute",
                        top: -1,
                        right: 1,
                        width: 8,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "red",
                      }}
                    />}
          </Pressable>
          <Pressable onPress={() => router.push("/pet-owner/search")}>
            <Feather name="search" size={24} color="black" />
          </Pressable>
        </View>
      </HeaderLayout>

      {/* Post input */}
      <View style={styles.postInputContainer}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Pressable
            onPress={() => {
              const routePath = "/pet-owner/profile";

              router.push({
                pathname: routePath,
                params: {
                  profile: myProfileImage.profile,
                  name: myProfileImage.name,
                },
              });
            }}
          >
            <Image
              source={{ uri: userImagePath }}
              style={styles.profileImage}
            />
          </Pressable>
          <TextInput
            placeholder="What's on your mind?"
            value={post}
            onChangeText={setPost}
            onPress={() => {
              const routePath = "/pet-owner/(home)/post";

              router.push({
                pathname: routePath,
                params: {
                  profile: myProfileImage.profile,
                  name: myProfileImage.name,
                },
              });
            }}
            style={styles.input}
          />
        </View>
      </View>

      {/* Posts */}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonPost />}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
              <FontAwesome5 name="pager" size={20} color="gray" />
              <Text style={{ color: "gray", fontSize: 12 }}>
                No posts yet. Be the first to share something!
              </Text>
            </View>
          )}
        />
      )}

      {/* Modal viewer with swipe */}
      {imageModalVisible && (
        <Modal visible={imageModalVisible} transparent={true}>
          <View style={styles.modalBackground}>
            <FlatList
              data={selectedPostImages}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: Dimensions.get("window").width,
                offset: Dimensions.get("window").width * index,
                index,
              })}
              keyExtractor={(uri, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.fullImageWrapper}>
                  <Image
                    source={{ uri: item }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {showDropdown &&
        selectedPostId &&
        (() => {
          const selectedPost = posts.find((p: any) => p.id === selectedPostId);
          const isMyPost = selectedPost?.creator_id === userId;

          return (
            <PostDropdown
              postId={selectedPostId}
              x={dropdownPos.x}
              y={dropdownPos.y}
              onClose={() => setShowDropdown(false)}
              isMyPost={isMyPost}
              onSave={(_unSavedId) => {
                if (isMyPost) {
                  console.log("Edit post", selectedPostId);
                  router.push({
                    pathname: "/pet-owner/post",
                    params: { editPost: JSON.stringify(selectedPost) },
                  });
                } else {
                  handleSavePost(selectedPostId, _unSavedId);
                }
                setShowDropdown(false);
              }}
              onReport={(id: string) => {
                if (isMyPost) {
                  deletePost(id);
                } else {
                  setSelectedPostId(id);
                  setTimeout(() => setReportModalVisible(true), 50);
                }

                setShowDropdown(false);
              }}
            />
          );
        })()}

      <ReportPostModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={(reason) => {
          ToastAndroid.show(`Reported: ${reason}`, ToastAndroid.SHORT);
          console.log("Reported Post:", selectedPostId, "Reason:", reason);

          // Remove the reported post from the feed
          if (selectedPostId) {
            setPosts((prev: any) =>
              prev.filter((p: any) => p.id !== selectedPostId),
            );
          }

          setReportModalVisible(false);
        }}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  iconWrapper: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: "flex-start",
    top: 30,
  },
  postInputContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    // marginTop: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C3C0C0",
  },
  input: {
    fontSize: 13,
    fontFamily: "Roboto",
    color: "#808080",
    width: "85%",
    paddingVertical: 4,
  },
  postCard: {
    backgroundColor: Colors.white,
    marginTop: 5,
    padding: 10,
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
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
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  followButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  userName: {
    fontWeight: "600",
    fontSize: 14,
  },
  postTime: {
    fontSize: 12,
    color: "#888",
  },
  postContent: {
    marginVertical: 5,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 5,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countText: {
    fontSize: 13,
    color: "#555",
  },
  sharedPostContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  sharedProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 18,
  },
  sharedUserName: {
    fontWeight: "600",
    fontSize: 13,
  },
  sharedPostTime: {
    fontSize: 11,
    color: "#777",
  },
  sharedContent: {
    fontSize: 13,
    marginVertical: 6,
    color: "#333",
  },
  sharedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },

  commentSection: {
    marginTop: 15,
    paddingLeft: 5,
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
  // ✅ NEW STYLES
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  fullImageWrapper: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
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
  taggedPetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5,
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
