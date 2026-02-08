import { useAppContext } from "@/AppsProvider";
import { all, remove, serverTimestamp, set, update } from "@/helpers/db";
import { useOnFocusHook } from "@/hooks/onFocusHook";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import { screens } from "@/shared/styles/styles";
import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
  ToastAndroid,
  View,
} from "react-native";

const myProfileImage = "https://randomuser.me/api/portraits/men/32.jpg";

interface Comment {
  id: string;
  user: string;
  text: string;
  profileImage: string;
}

interface Post {
  id: string;
  user: string;
  profileImage: string;
  time: string;
  content: string;
  images: string[] | null;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
  newComment: string;
}

export default function GroupProfile() {
  const { userId, userName, userImagePath } = useAppContext();
  const { id, title, members, profile, type, privacy, questions } =
    useLocalSearchParams();
  const imageUri = Array.isArray(profile) ? profile[0] : profile;
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [answers, setAnswers] = useState(["", "", ""]);

  let membershipQuestions: string[] = [];

  if (typeof questions === "string") {
    membershipQuestions = questions.split(",");
  } else if (Array.isArray(questions)) {
    membershipQuestions = questions;
  }
  const groupId = Array.isArray(id) ? id[0] : id;

  // useEffect(() => {
  //   console.log("ID", id);
  // }, []);
  const [posts, setPosts] = useState<Post[]>([
    // {
    //   id: "1",
    //   user: "John Doe",
    //   profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
    //   time: "2h ago",
    //   content: "Enjoying the sunny day with my dog 🐶",
    //   images: "https://images.unsplash.com/photo-1507149833265-60c372daea22",
    //   likes: 4,
    //   liked: false,
    //   comments: [
    //     {
    //       id: "c1",
    //       user: "Jane Smith",
    //       text: "So cute!",
    //       profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
    //     },
    //   ],
    //   showComments: false,
    //   newComment: "",
    // },
  ]);

  useOnFocusHook(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await all("groups", groupId, "posts");
        const items = postsData.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            user: data.user,
            profileImage: data.profileImage,
            time: data.createdAt?.toDate().toLocaleString() ?? "",
            content: data.content,
            images: data.images || null,
            likes: data.likes || 0,
            liked: data.liked || false,
            comments: data.comments || [],
            showComments: false,
            newComment: data.newComment || "",
          };
        });

        setPosts(items);
        // console.log("Fetched posts:", items);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // ❤️ Like toggle
  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  // 💬 Toggle comments section
  const toggleComments = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, showComments: !post.showComments }
          : post,
      ),
    );
  };

  // 📝 Add new comment
  const handleAddComment = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId && post.newComment.trim()) {
          const newComment: Comment = {
            id: Date.now().toString(),
            user: "You",
            text: post.newComment,
            profileImage: userImagePath,
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
            newComment: "",
          };
        }
        return post;
      }),
    );
  };

  const confirmLeaveGroup = async () => {
    try {
      await remove("users", userId, "joined-groups", groupId);
      await remove("groups", groupId, "members", userId);
      await update("groups", groupId).value({
        members: Number(members) - 1,
      });

      setShowLeaveModal(false);
      router.push("/pet-owner/(menu)/community");
      console.log("Item deleted successfully!");
    } catch (error) {
      console.error("Failed to delete item:", error);
      // return;
    }

    // router.back();
  };

  // 🟢 Join group logic
  const handleJoinGroup = async () => {
    console.log(privacy);
    if (privacy === "Private") {
      setShowQuestionModal(true);
    } else {
      try {
        const joinRequest = {
          userId,
          joinedAt: serverTimestamp(),
        };

        await set("groups", groupId, "members", userId).value({
          userId,
          joinedAt: serverTimestamp(),
        });

        await set("users", userId, "joined-groups", groupId).value({
          groupId,
          groupName: title,
          joinedAt: serverTimestamp(),
        });

        await update("groups", groupId).value({
          members: Number(members) + 1,
        });

        ToastAndroid.show("Joined group successfully!", ToastAndroid.SHORT);
        router.push({
          pathname: "/pet-owner/(menu)/community",
        });
      } catch (error) {
        console.error("Error joining group:", error);
        alert("Failed to send join request. Try again.");
      }
    }
    if (joinRequestSent) {
      // cancel request
      setJoinRequestSent(false);
      ToastAndroid.show("Join request cancelled.", ToastAndroid.SHORT);
      return;
    }
  };

  const handleSubmitAnswers = async () => {
    setShowQuestionModal(false);

    try {
      const cleanAnswers = answers.map((a) => a.trim()).filter(Boolean);

      const joinRequest = {
        userId,
        answers: cleanAnswers,
        joinedAt: serverTimestamp(),
      };

      set("groups", groupId, "join-request", userId).value({
        userId,
        answers: cleanAnswers,
        joinedAt: serverTimestamp(),
      });

      ToastAndroid.show(
        "Join request sent! Waiting for admin approval.",
        ToastAndroid.LONG,
      );

      setAnswers(Array(answers.length).fill(""));

      router.push({
        pathname: "/pet-owner/(menu)/community",
      });
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to send join request. Try again.");
    }
  };

  const handleCreate = async () => {
    // if (!groupName.trim()) return;
  };

  return (
    <View style={[screens.screen, { backgroundColor: Colors.background }]}>
      <HeaderLayout noBorderRadius bottomBorder>
        <HeaderWithActions
          title={title as string}
          onBack={() => {
            router.push("/pet-owner/(menu)/community");
          }}
          centerTitle
        />
      </HeaderLayout>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.title}>{title}</Text>
          <View style={{ flexDirection: "row", marginLeft: 15 }}>
            <Text style={[styles.members, { fontWeight: "600" }]}>
              {members}
            </Text>
            <Text style={styles.members}> members</Text>
          </View>

          {/*  Leave / Join button */}
          <Pressable
            style={[
              styles.leaveButton,
              {
                backgroundColor:
                  type === "JoinedGroup"
                    ? "#FF3F33" // red for leave
                    : type === "MyGroup"
                      ? Colors.primary // blue for manage
                      : Colors.primary, // blue for suggestion/join
              },
            ]}
            onPress={() => {
              if (type === "Suggestion") {
                handleJoinGroup();
              } else if (type === "JoinedGroup") {
                setShowLeaveModal(true);
              } else if (type === "MyGroup") {
                router.push({
                  pathname: "/usable/manage-group",
                  params: { groupId: groupId },
                });
              }
            }}
          >
            {type === "Suggestion" && (
              <>
                <FontAwesome5
                  name={joinRequestSent ? "user-times" : "users"}
                  size={15}
                  color="white"
                />
                <Text style={styles.btnText}>
                  {joinRequestSent ? "Cancel Request" : "Join Group"}
                </Text>
              </>
            )}

            {type === "JoinedGroup" && (
              <>
                <Entypo name="log-out" size={15} color="white" />
                <Text style={styles.btnText}>Leave Group</Text>
              </>
            )}

            {type === "MyGroup" && (
              <>
                <Ionicons name="settings-outline" size={16} color="white" />
                <Text style={styles.btnText}>Manage Group</Text>
              </>
            )}
          </Pressable>
        </View>

        {/*  Add Post (MyGroup only) */}
        {type === "MyGroup" ||
          (type === "JoinedGroup" && (
            <View style={styles.addPost}>
              <Pressable
                style={styles.postInputRow}
                onPress={() =>
                  router.push({
                    pathname: "/usable/anonymous-posting",
                    params: { id: groupId },
                  })
                }
              >
                <Image
                  source={{ uri: userImagePath }}
                  style={styles.myProfileImage}
                />
                <Text style={styles.postInputPlaceholder}>
                  What's on your mind?
                </Text>
                <MaterialIcons name="image" size={24} color={"#08CB00"} />
              </Pressable>
            </View>
          ))}

        {/*  Posts Section */}
        <View style={styles.postsSection}>
          {posts.map((post) => {
            const postImages = post.images ?? [];

            const maxImagesToShow = 3;
            const extraImages = postImages.length - maxImagesToShow;

            return (
              <View key={post.id} style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Image
                      source={{ uri: post.profileImage }}
                      style={styles.profileImage}
                    />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.userName}>{post.user}</Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                  </View>

                  <Entypo
                    name="dots-three-horizontal"
                    size={18}
                    color="#555"
                    style={{ marginRight: 5 }}
                  />
                </View>

                {/* Content */}
                {post.content ? (
                  <Text style={styles.postContent}>{post.content}</Text>
                ) : null}

                {/* Image Grid */}
                {postImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {postImages.slice(0, maxImagesToShow).map((img, idx) => (
                      <Pressable
                        key={idx}
                        style={styles.imageWrapper}
                        onPress={() => {
                          setSelectedPostImages(postImages);
                          setSelectedIndex(idx);
                          setImageModalVisible(true);
                        }}
                      >
                        <Image source={{ uri: img }} style={styles.gridImage} />
                        {idx === maxImagesToShow - 1 && extraImages > 0 && (
                          <View style={styles.overlay}>
                            <Text style={styles.overlayText}>
                              +{extraImages}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() => toggleLike(post.id)}
                    style={styles.actionBtn}
                  >
                    <Ionicons
                      name={post.liked ? "heart-sharp" : "heart-outline"}
                      size={23}
                      color={post.liked ? "red" : "black"}
                    />
                    <Text style={styles.countText}>{post.likes}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => toggleComments(post.id)}
                    style={styles.actionBtn}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="black"
                    />
                    <Text style={styles.countText}>{post.comments.length}</Text>
                  </Pressable>
                </View>

                {/* Comments */}
                {post.showComments && (
                  <View style={styles.commentSection}>
                    {post.comments.map((comment) => (
                      <View key={comment.id} style={styles.commentRow}>
                        <Image
                          source={{ uri: comment.profileImage }}
                          style={styles.commentProfile}
                        />
                        <View style={styles.commentBubble}>
                          <Text style={styles.commentUser}>{comment.user}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      </View>
                    ))}

                    {/* Add comment */}
                    <View style={styles.addCommentRow}>
                      <Image
                        source={{ uri: userImagePath }}
                        style={styles.commentProfile}
                      />
                      <TextInput
                        placeholder="Write a comment..."
                        style={styles.commentInput}
                        value={post.newComment}
                        onChangeText={(text) =>
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.id === post.id ? { ...p, newComment: text } : p,
                            ),
                          )
                        }
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

      {/* 🚪 Leave Modal */}
      <Modal transparent visible={showLeaveModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Leave Group</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to leave this group?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "red" }]}
                onPress={confirmLeaveGroup}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  Leave
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/*  Join Question Modal */}
      <Modal transparent visible={showQuestionModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { width: "90%" }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.modalTitle}>Membership Questions</Text>
              <Pressable onPress={() => setShowQuestionModal(false)}>
                <Ionicons name="close-circle" size={26} color="#555" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {membershipQuestions.map((q, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.questionLabel}>{q}</Text>
                  <TextInput
                    style={styles.questionInput}
                    placeholder="Your answer..."
                    value={answers[index]}
                    onChangeText={(text) => {
                      const updated = [...answers];
                      updated[index] = text;
                      setAnswers(updated);
                    }}
                  />
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
              onPress={handleSubmitAnswers}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                Submit Answers
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {imageModalVisible && (
        <Modal visible={imageModalVisible} transparent={true}>
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
              {selectedPostImages.map((uri, i) => (
                <View key={i} style={styles.fullImageWrapper}>
                  <Image
                    source={{ uri }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width: "100%", height: 200 },
  image: { width: "100%", height: "100%" },
  groupInfo: { backgroundColor: "#fff", paddingVertical: 15 },
  leaveButton: {
    borderRadius: 10,
    width: "50%",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 15,
  },
  btnText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "600", marginLeft: 15 },
  members: { fontSize: 15, color: "#555" },
  addPost: { backgroundColor: "#fff", padding: 10, marginTop: 5 },
  postInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myProfileImage: { width: 50, height: 50, borderRadius: 25 },
  postInputPlaceholder: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 25,
    color: "#444",
  },
  postsSection: { marginTop: 5 },
  postCard: {
    backgroundColor: Colors.white,
    marginTop: 5,
    padding: 10,
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
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
  commentSection: {
    marginTop: 10,
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

  //  Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalMessage: { fontSize: 14, color: "#333", marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  modalBtnText: { fontWeight: "600" },
  questionLabel: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  questionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    fontSize: 13,
  },
});
