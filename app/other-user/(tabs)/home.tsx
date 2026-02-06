import { useAppContext } from "@/AppsProvider";
import PostDropdown from "@/components/modals/PostDropdown";
import ReportPostModal from "@/components/modals/ReportPostModal";
import { Colors } from "@/shared/colors/Colors";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import SkeletonPost from "@/shared/components/SkeletalLoader";
import { screens } from "@/shared/styles/styles";
import { TPost } from "@/shared/Types/PostType";
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  findNodeHandle,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

const myProfileImage = {
  profile: "https://randomuser.me/api/portraits/women/44.jpg",
  name: "Jane Smith",
};

const initialPosts: TPost[] = [
  {
    id: "1",
    user: "Jane Doe",
    profileImage: "https://i.pravatar.cc/100?img=10",
    cover_photo: "https://picsum.photos/300/200",
    bio: "Dog Lover",
    time: "2h ago",
    content: "Lovely walk with my dog today!",
    images: [
      "https://picsum.photos/300/200",
      "https://picsum.photos/301/200",
      "https://picsum.photos/302/200",
    ],
    liked: false,
    likesCount: 2,
    sharesCount: 5,
    comments: [
      {
        id: "c1",
        user: "John Smith",
        profileImage: "https://i.pravatar.cc/100?img=2",
        text: "So cute!",
      },
    ],
    showComments: false,
    taggedPets: [
      { id: "p1", name: "Buddy", image: "https://i.pravatar.cc/100?img=12" },
      { id: "p2", name: "Luna", image: "https://i.pravatar.cc/100?img=13" },
    ],
    isFriend: true,
  },
  {
    id: "2",
    user: "John Smith",
    profileImage: "https://i.pravatar.cc/100?img=5",
    cover_photo: "https://picsum.photos/302/200",
    bio: "Cat Lover",
    time: "4h ago",
    content: "Just finished grooming Max! 🐶✨",
    images: ["https://picsum.photos/303/200"],
    liked: true,
    likesCount: 12,
    sharesCount: 5, // ✅ Added
    comments: [
      {
        id: "c2",
        user: "Jane Doe",
        profileImage: "https://i.pravatar.cc/100?img=10",
        text: "He looks so clean!",
      },
      {
        id: "c3",
        user: "Alex Lee",
        profileImage: "https://i.pravatar.cc/100?img=7",
        text: "A happy dog indeed!",
      },
    ],
    showComments: false,
    taggedPets: [
      { id: "p3", name: "Max", image: "https://i.pravatar.cc/100?img=15" },
    ],
    isFriend: false,
  },
  {
    id: "3",
    user: "Emily Johnson",
    profileImage: "https://i.pravatar.cc/100?img=8",
    cover_photo: "https://picsum.photos/303/200",
    bio: "Cat Lover",
    time: "1d ago",
    content: "Adopted a new kitten today 😻 Meet Mochi!",
    images: ["https://picsum.photos/304/200", "https://picsum.photos/305/200"],
    liked: false,
    likesCount: 25,
    sharesCount: 5, // ✅ Added
    comments: [
      {
        id: "c4",
        user: "Sarah Kim",
        profileImage: "https://i.pravatar.cc/100?img=4",
        text: "Omg, so cute!!",
      },
    ],
    showComments: false,
    taggedPets: [
      { id: "p4", name: "Mochi", image: "https://i.pravatar.cc/100?img=19" },
    ],
    isFriend: true,
  },
  {
    id: "4",
    user: "Michael Chen",
    profileImage: "https://i.pravatar.cc/100?img=6",
    cover_photo: "https://picsum.photos/304/200",
    bio: "Dog Lover",
    time: "3d ago",
    content: "Took Bella to the vet today — she's doing great!",
    images: ["https://picsum.photos/306/200"],
    liked: false,
    likesCount: 8,
    sharesCount: 5, // ✅ Added
    comments: [],
    showComments: false,
    taggedPets: [
      { id: "p5", name: "Bella", image: "https://i.pravatar.cc/100?img=16" },
    ],
    isFriend: false,
  },
  {
    id: "5",
    user: "Sarah Kim",
    profileImage: "https://i.pravatar.cc/100?img=4",
    cover_photo: "https://picsum.photos/306/200",
    bio: "Dog Lover",
    time: "5d ago",
    content: "Throwback to our weekend hike 🏞️🐕",
    images: [
      "https://picsum.photos/307/200",
      "https://picsum.photos/308/200",
      "https://picsum.photos/309/200",
      "https://picsum.photos/310/200",
    ],
    liked: true,
    likesCount: 40,
    sharesCount: 5, // ✅ Added
    comments: [
      {
        id: "c5",
        user: "Michael Chen",
        profileImage: "https://i.pravatar.cc/100?img=6",
        text: "Looks amazing!",
      },
      {
        id: "c6",
        user: "Jane Doe",
        profileImage: "https://i.pravatar.cc/100?img=10",
        text: "Beautiful views!",
      },
    ],
    showComments: false,
    taggedPets: [
      { id: "p6", name: "Rocky", image: "https://i.pravatar.cc/100?img=17" },
      { id: "p7", name: "Coco", image: "https://i.pravatar.cc/100?img=18" },
    ],
    isFriend: true,
  },
  {
    id: "6",
    user: "Happy Paws Veterinary Clinic",
    profileImage: "https://i.pravatar.cc/100?img=40",
    cover_photo: "https://picsum.photos/312/200",
    bio: "Professional care for your pets 🐾",
    time: "1d ago",
    content: "Did you know? Regular checkups can extend your pet’s lifespan!",
    images: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=3",
      "https://picsum.photos/400/300?random=4",
      "https://picsum.photos/400/300?random=5",
      "https://picsum.photos/400/300?random=6",
      "https://picsum.photos/400/300?random=7",
    ],
    liked: false,
    likesCount: 10,
    sharesCount: 2,
    comments: [],
    showComments: false,
    isFriend: false,
    isPage: true,
    isFollowing: true,
    followers: "1200",
    following: "150",
  },
];

const Home = () => {
  const { userId, userName, userImagePath } = useAppContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  // const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { newPost } = useLocalSearchParams();
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TPost[]>(initialPosts);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(
    null
  );

  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  //  useFocusEffect(
  //     React.useCallback(() => {
  //       const backAction = () => {
  //         Alert.alert('Exit App?', 'Are you sure you want to exit the app?', [
  //           { text: 'Cancel', style: 'cancel' },
  //           { text: 'Yes', onPress: () => router.replace('/other-user/(tabs)/home') },
  //         ]);
  //         return true;
  //       };

  //       BackHandler.addEventListener('hardwareBackPress', backAction);

  //       return () =>
  //         BackHandler.removeEventListener('hardwareBackPress', backAction);
  //     }, [])
  //   );

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPosts(initialPosts);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    setTimeout(() => {
      setPosts((prev) => (prev.length === 0 ? initialPosts : prev));
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (newPost) {
      try {
        const parsed: TPost = JSON.parse(newPost as string);
        setPosts((prev) => [parsed, ...prev]);
      } catch (e) {
        console.error(" Invalid JSON newPost:", e, newPost);
      }
    }
  }, [newPost]);

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const toggleComments = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, showComments: !p.showComments } : p
      )
    );
  };

  const addComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Date.now().toString(),
                  user: "You",
                  profileImage: myProfileImage.profile,
                  text,
                },
              ],
            }
          : p
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleShare = (post: TPost) => {
    // Increment share count
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, sharesCount: p.sharesCount + 1 } : p
      )
    );

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
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isFollowing: true } : p))
    );
    ToastAndroid.show("You are now following this page!", ToastAndroid.SHORT);
  };

  // const handleReport = (postId: string) => {
  //   setSelectedPostId(postId);
  //   setReportModalVisible(true);
  // };

  const renderPost = ({ item }: { item: TPost }) => {
    const maxImagesToShow = 3;
    const extraImages = item.images.length - maxImagesToShow;

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              const routePath = item.isPage
                ? "/usable/page-profile"
                : "/usable/user-profile";

              router.push({
                pathname: routePath,
                params: {
                  id: item.id,
                  name: item.user,
                  bio: item.bio,
                  profileImage: item.profileImage,
                  cover_photo: item.cover_photo,
                  isFriend: item.isFriend ? "true" : "false",
                  isPage: item.isPage ? "true" : "false",
                  isFollowing: item.isFollowing ? "true" : "false",
                  shareCount: item.sharesCount,
                  followerCount: item.followers,
                  followingCount: item.following,
                },
              });
            }}
          >
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
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
                <Text style={styles.userName}>{item.user}</Text>
                <Text style={styles.postTime}>{item.time}</Text>
              </View>

              {item.isPage && !item.isFollowing && (
                <Pressable
                  onPress={() => handleFollow(item.id)}
                  style={styles.followButton}
                >
                  <Text style={styles.followButtonText}>Follow</Text>
                </Pressable>
              )}
            </View>
          </Pressable>

          <View style={{ position: "absolute", top: 10, right: 10 }}>
            <TouchableOpacity onPress={(e) => openDropdown(e, item.id)}>
              <Feather name="more-vertical" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Tagged Pets */}
        {item.taggedPets && item.taggedPets.length > 0 && (
          <View style={styles.taggedPetsContainer}>
            {item.taggedPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petChip}
                onPress={() => console.log("Go to pet profile:", pet.name)}
              >
                {pet.image ? (
                  <Image source={{ uri: pet.image }} style={styles.petAvatar} />
                ) : (
                  <View style={styles.petAvatar} />
                )}
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* If this is a shared post, show the embedded original post */}
        {item.sharedPost && (
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
        )}

        {/* Images Grid */}
        {item.images.length > 0 && (
          <View style={styles.imageGrid}>
            {item.images.slice(0, maxImagesToShow).map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.imageWrapper}
                onPress={() => {
                  setSelectedPostImages(item.images);
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
            <Text style={styles.countText}>{item.likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleComments(item.id)}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={20} color="black" />
            <Text style={styles.countText}>{item.comments.length}</Text>
          </TouchableOpacity>

          {/* ✅ Share Button */}
          {item.user !== "You" && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(item)}
            >
              <Image
                source={require("../../../assets/images/share.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={styles.countText}>{item.sharesCount ?? 0}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments */}
        {item.showComments && (
          <View style={styles.commentSection}>
            {item.comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                {c.profileImage ? (
                  <Image
                    source={{ uri: c.profileImage }}
                    style={styles.commentProfile}
                  />
                ) : (
                  <View style={styles.commentProfile} />
                )}
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
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
                value={commentInputs[item.id] || ""}
                onChangeText={(text) =>
                  setCommentInputs((prev) => ({ ...prev, [item.id]: text }))
                }
              />
              <TouchableOpacity onPress={() => addComment(item.id)}>
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
          <Pressable onPress={() => router.push("/pet-owner/post")}>
            <FontAwesome name="plus-square-o" size={24} color="black" />
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
              const routePath = "/other-user/profile";

              router.push({
                pathname: routePath,
                // params: {
                //   profile: myProfileImage.profile,
                //   name: myProfileImage.name,
                // },
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
            placeholderTextColor={"#000"}
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
          keyExtractor={(item) => item.id.toString()}
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
          const selectedPost = posts.find((p) => p.id === selectedPostId);
          const isMyPost = selectedPost?.user === "You";

          return (
            <PostDropdown
              postId={selectedPostId}
              x={dropdownPos.x}
              y={dropdownPos.y}
              onSave={() => {
                if (isMyPost) {
                  console.log("Edit post", selectedPostId);
                  router.push({
                    pathname: "/pet-owner/post",
                    params: { editPost: JSON.stringify(selectedPost) },
                  });
                } else {
                  console.log("Save post", selectedPostId);
                }
                setShowDropdown(false);
              }}
              onReport={(id) => {
                if (isMyPost) {
                  // Delete post
                  setPosts((prev) => prev.filter((p) => p.id !== id));
                  ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
                } else {
                  setSelectedPostId(id);
                  setTimeout(() => setReportModalVisible(true), 50);
                }
                setShowDropdown(false);
              }}
              onClose={() => setShowDropdown(false)}
              isMyPost={isMyPost} // 👈 pass flag down to PostDropdown
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
            setPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
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
