import { useAppContext } from "@/AppsProvider";
import PostDropdown from "@/components/modals/PostDropdown";
import ReportPostModal from "@/components/modals/ReportPostModal";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  add,
  collectionGroupName,
  collectionName,
  find,
  remove,
  serverTimestamp,
  update,
} from "@/helpers/db";
import { useNotifHook } from "@/helpers/notifHook";
import { savePost } from "@/helpers/savedItems";
import { computeTimePassed } from "@/helpers/timeConverter";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import SkeletonPost from "@/shared/components/SkeletalLoader";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const RenderPost = ({
  userToViewProfileId,
  useMap,
}: {
  userToViewProfileId?: string;
  useMap?: boolean;
}) => {
  const { userId, userName, userImagePath, isPage } = useAppContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useState<any>([]);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedPostVideos, setSelectedPostVideos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const buttonRefs = useRef<any>({});

  const addNotif = useNotifHook();

  const getPostPerUser = async () => {
    const data = await (userToViewProfileId === userId
      ? collectionName("posts")
          .whereEquals("creator_id", userToViewProfileId)
          .orderByDesc("date")
          .get()
      : collectionName("posts")
          .whereEquals("creator_id", userToViewProfileId)
          .whereNotEquals("visibility", "Only Me")
          .orderByDesc("date")
          .get());
    return data.docs;
  };

  const getPostsOnHome = async () => {
    const connectedIds: string[] = [];

    const following = await collectionGroupName("followers")
      .whereEquals("follower_id", userId)
      .get();

    const pageIds = following.docs.map((d) => d.ref.parent.parent?.id ?? "");
    connectedIds.push(...pageIds);

    if (!isPage) {
      // 1️⃣ Fetch friends
      const friendsSnap = await collectionName("friends")
        .whereArrayContains("users", userId)
        .whereEquals("confirmed", true)
        .get();

      const friendIds = friendsSnap.docs.map((d) => {
        const { users } = d.data();
        return users[0] === userId ? users[1] : users[0];
      });
      connectedIds.push(...friendIds);
    }

    const postSnaps = isPage
      ? await collectionName("posts")
          .whereEquals("creator_is_page", true)
          .orderByDesc("date")
          .get()
      : await collectionName("posts").orderByDesc("date").get();

    return postSnaps.docs.filter((v) => {
      const d = v.data();

      if (d.visibility === "Only Me" && d.creator_id !== userId) return false;
      if (
        d.visibility === "Friends Only" &&
        d.creator_id !== userId &&
        !connectedIds.some((s) => s === d.creator_id)
      )
        return false;
      return true;
    });
  };

  const onRefresh = async () => {
    if (!userId || loading) return;

    try {
      setLoading(true);

      const finalPosts = userToViewProfileId
        ? await getPostPerUser()
        : await getPostsOnHome();

      // 3️⃣ Collect shared post IDs
      const sharedIds = [
        ...new Set(
          finalPosts.map((d) => d.data().shared_post_id).filter(Boolean),
        ),
      ];

      // 4️⃣ Fetch shared posts in parallel
      const sharedMap: Record<string, any> = {};
      await Promise.all(
        sharedIds.map(async (id: any) => {
          const snap = await find("posts", id);
          if (snap.exists()) sharedMap[id] = snap.data();
        }),
      );

      // 5️⃣ Fetch comments in parallel
      const commentsMap: Record<string, any[]> = {};
      await Promise.all(
        finalPosts.map(async (dc: any) => {
          const commentMapped = await collectionName(
            "posts",
            dc.id,
            "comments",
          ).getMapped();
          commentsMap[dc.id] = commentMapped;
        }),
      );

      // 6️⃣ Build final posts
      const _posts = finalPosts.map((dc: any) => {
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
      console.log("sfddf");

      setLoading(false);
    }
  };

  useOnFocusHook(() => {
    onRefresh();

    return () => {
      setShowDropdown(false);
    };
  }, [userId]);

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
        update("posts", id).value({ liked_by_ids });

        // 🔔 SEND NOTIFICATION (only if liking)
        if (isLiking) {
          addNotif({
            receiver_id: p.creator_id,
            href: "/pet-owner/profile",
            type: "Like",
          });
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
  };

  const handleShare = (post: any) => {
    router.push({
      pathname: "/usable/share-post",
      params: { post: JSON.stringify(post) },
    });
  };

  const openDropdown = (event: any, postId: string) => {
    const ref = buttonRefs.current[postId];

    if (ref) {
      const f = buttonRefs.current[posts[0].id];
      f.measureInWindow((_x: any, _y: any, _width: any, _height: any) => {
        ref.measureInWindow((x: any, y: any, width: any, height: any) => {
          const nY = (useMap ? y - _y + 22 : y) + height;

          setDropdownPos({ x, y: nY });
          setSelectedPostId(postId);
          setShowDropdown(true);
        });
      });
    }
    // const handle = findNodeHandle(event.target);
    // if (handle) {
    //   UIManager.measure(handle, (_x, _y, _w, _h, pageX, pageY) => {
    //     setDropdownPos({ x: pageX, y: pageY + 20 });
    //     setSelectedPostId(postId);
    //     setShowDropdown(true);
    //   });
    // }
  };

  const handleSavePost = async (postId: string, _unSavedId: string | null) => {
    const selectedPost = posts.find((p: any) => p.id === selectedPostId);
    //  console.log("saved",  JSON.stringify(selectedPost))
    if (_unSavedId) remove("users", userId, "savedItems", _unSavedId);
    else
      await savePost(userId, {
        id: selectedPostId as string,
        caption: selectedPost.body,
        images: selectedPost.img_paths,
        videos: selectedPost.video_paths,
        ownerId: selectedPost.creator_id,
        ownerName: selectedPost.creator_name,
        ownerImage: selectedPost.creator_img_path,
        saveCategory: "posts",
        postCreatedAt: selectedPost.date,
      });
  };

  const handleSeeProfile = (post: any) => {
    if (post.creator_id === userToViewProfileId) return;

    if (post.creator_id === userId) {
      if (!post.creator_is_page) router.push("/pet-owner/profile");
      else
        router.push({
          pathname: "/other-user/profile",
          params: {
            pageId: post.creator_id,
          },
        });
      return;
    }

    if (post.creator_is_page)
      router.push({
        pathname: "/other-user/profile",
        params: {
          pageId: post.creator_id,
        },
      });
    else
      router.push({
        pathname: "/usable/user-profile",
        params: { userToViewId: post.creator_id },
      });
  };

  const deletePost = (postId: string) => {
    try {
      // Delete from Firestore
      remove("posts", postId); // or deleteDoc(doc(db, "posts", postId));

      // Update local state
      setPosts((prev: any) => prev.filter((p: any) => p.id !== postId));

      // Feedback
      ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
    } catch (e) {
      console.log("Failed to delete post:", e);
      Alert.alert("Error", "Failed to delete post");
    }
  };

  //for report
  const handleReport = (reason: any) => {
    const dataReport = {
      reporterName: userName,
      reporterImg: userImagePath,
      postId: selectedPostId,
      reason: reason,
      status: "pending",
      time: serverTimestamp(),
      type: "post",
    };
    add("reported-post").value(dataReport);
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
        <View style={styles.imageGrid}>
          {item.img_paths && item.img_paths.length > 0 && (
            <>
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
            </>
          )}
          {item.video_paths &&
            item.video_paths.length > 0 &&
            maxImagesToShow - (item.img_paths?.length ?? 0) > 0 && (
              <>
                {item.video_paths
                  .slice(0, maxImagesToShow - (item.img_paths?.length ?? 0))
                  .map((vid: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.imageWrapper}
                      onPress={() => {
                        setSelectedPostVideos(item.video_paths ?? []);
                        setSelectedIndex(idx);
                        setVideoModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <VideoPlayer style={styles.gridImage} url={vid} />
                      {idx === maxImagesToShow - 1 && extraImages > 0 && (
                        <View style={styles.overlay}>
                          <Text style={styles.overlayText}>+{extraImages}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
              </>
            )}
        </View>
      </View>
    );
  };

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
            <TouchableOpacity
              ref={(ref) => {
                buttonRefs.current[item.id] = ref;
              }}
              onPress={(e) => openDropdown(e, item.id ?? "")}
            >
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

        {/* Images Grid */}
        <View style={styles.imageGrid}>
          {item.img_paths && item.img_paths.length > 0 && (
            <>
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
            </>
          )}
          {item.video_paths &&
            item.video_paths.length > 0 &&
            maxImagesToShow - (item.img_paths?.length ?? 0) > 0 && (
              <>
                {item.video_paths
                  .slice(0, maxImagesToShow - (item.img_paths?.length ?? 0))
                  .map((vid: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.imageWrapper}
                      onPress={() => {
                        setSelectedPostVideos(item.video_paths ?? []);
                        setSelectedIndex(idx);
                        setVideoModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <VideoPlayer style={styles.gridImage} url={vid} />
                      {idx === maxImagesToShow - 1 && extraImages > 0 && (
                        <View style={styles.overlay}>
                          <Text style={styles.overlayText}>+{extraImages}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
              </>
            )}
        </View>

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
                source={require("../../assets/images/share.png")}
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
    <>
      {loading ? (
        useMap ? (
          [1, 2, 3, 4].map((v) => <SkeletonPost key={v} />)
        ) : (
          <FlatList
            data={[1, 2, 3, 4]}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonPost />}
          />
        )
      ) : useMap ? (
        posts.map((item: any) => (
          <View key={item.id}>{renderPost({ item })}</View>
        ))
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
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
      <Modal visible={videoModalVisible} transparent={true}>
        <View style={styles.modalBackground}>
          <FlatList
            data={selectedPostVideos}
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
                <VideoPlayer url={item} style={styles.fullImage} />
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVideoModalVisible(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
                    params: {
                      editPost: JSON.stringify(selectedPost),
                      title: "Edit Post",
                    },
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
          handleReport(reason);
          // Remove the reported post from the feed
          if (selectedPostId) {
            setPosts((prev: any) =>
              prev.filter((p: any) => p.id !== selectedPostId),
            );
          }

          setReportModalVisible(false);
        }}
      />
    </>
  );
};

export default RenderPost;

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C3C0C0",
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
    borderBottomWidth: 0,
    borderColor: Colors.lightGray,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
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
