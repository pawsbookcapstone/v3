import { useAppContext } from "@/AppsProvider";
import { add, collectionGroupName, collectionName, find, remove, serverTimestamp, set } from "@/helpers/db";
import { computeTimePassed } from "@/helpers/timeConverter";
import { Colors } from "@/shared/colors/Colors";
import HeaderWithActions from "@/shared/components/HeaderSet";
import HeaderLayout from "@/shared/components/MainHeaderLayout";
import ProfileSkeleton from "@/shared/components/ProfileSkeleton";
import { screens } from "@/shared/styles/styles";
import { Entypo, Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  View
} from "react-native";

const maxImagesToShow = 3;

const PageProfile = () => {
  const {userId, isPage, userName, userImagePath} = useAppContext()

  const {pageId}: {pageId: string} = useLocalSearchParams()

  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedPostImages, setSelectedPostImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [profile, setProfile] = useState<any>({})

  const dummyProfile = {
    id: 1,
    name: "Happy Paws Pet Care",
    email: "contact@happypaws.com",
    phone_number: "09171234567",
    bio: "Professional pet care and grooming services 🐾",
    profile_photo: "https://randomuser.me/api/portraits/women/44.jpg",
    cover_photo: "https://picsum.photos/800/400",
    address: "123 Pet Street, Manila, Philippines",
    isOpen: true,
    following: 100,
    followers: 50,
  };

  const [posts, setPosts] = useState<any>([]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     setLoading(true)
  //     try{
  //       const _profile = await find("users", pageId)
  //       const d = _profile.data()
  //       setProfile(d)

  //       const followingCount = await collectionGroupName("followers")
  //         .whereEquals("follower_id", pageId)
  //         .count()
  //       setFollowing(followingCount)
  //       const followersCount = await collectionName("users", pageId, "followers").count()
  //       setFollowers(followersCount)

  //       const postsSnap = await collectionName("posts")
  //         .whereEquals("creator_id", pageId)
  //         .orderByDesc("date")
  //         .get()

  //       const _posts: any = [];
  //       for (const i in postsSnap.docs) {
  //         const dc = postsSnap.docs[i];
  //         const d = dc.data();

  //         let shared = null
  //         if (d.shared_post_id){
  //           const shareSnap = await find('posts', d.shared_post_id)
  //           shared = shareSnap.data()
  //         }

  //         const commentSnap = await collectionName("posts", dc.id, "comments").get();
  //         _posts.push({
  //           id: dc.id,
  //           ...d,
  //           liked: Array.isArray(d.liked_by_ids)
  //             ? d.liked_by_ids.includes(userId)
  //             : false,
  //           showComments: false,
  //           shared:shared,
  //           comments: commentSnap.docs.map((_comment: any) => ({
  //             id: _comment.id,
  //             ..._comment.data(),
  //           })),
  //           date_ago: computeTimePassed(d.date.toDate()),
  //         });
  //       }

  //       setPosts(_posts);
  //     } finally{
  //       setLoading(false)
  //     }
  //   }
    
  //   fetch()
  // }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      try {
        if (pageId !== userId){
          find("users", pageId, "followers", userId)
            .then(d => {
              setFollowed(d.exists())
            })
        }
        
        // 1️⃣ Fetch profile + counts + posts IN PARALLEL
        const [
          profileSnap,
          followingCount,
          followersCount,
          postsSnap,
        ] = await Promise.all([
          find("users", pageId),
          collectionGroupName("followers")
            .whereEquals("follower_id", pageId)
            .count(),
          collectionName("users", pageId, "followers").count(),
          collectionName("posts")
            .whereEquals("creator_id", pageId)
            .orderByDesc("date")
            .get(),
        ]);

        setProfile(profileSnap.data());
        setFollowing(followingCount);
        setFollowers(followersCount);

        // 2️⃣ Collect shared post IDs
        const sharedIds = postsSnap.docs
          .map((d) => d.data().shared_post_id)
          .filter(Boolean);

        // 3️⃣ Fetch all shared posts in parallel
        const sharedMap = new Map<string, any>();

        await Promise.all(
          sharedIds.map(async (id) => {
            const snap = await find("posts", id);
            if (snap.exists()) sharedMap.set(id, snap.data());
          })
        );

        // 4️⃣ Fetch comments in parallel
        const posts = await Promise.all(
          postsSnap.docs.map(async (dc) => {
            const d = dc.data();

            const commentSnap = await collectionName(
              "posts",
              dc.id,
              "comments"
            ).get();

            return {
              id: dc.id,
              ...d,
              liked: Array.isArray(d.liked_by_ids)
                ? d.liked_by_ids.includes(userId)
                : false,
              showComments: false,
              shared: d.shared_post_id
                ? sharedMap.get(d.shared_post_id) ?? null
                : null,
              comments: commentSnap.docs.map((c) => ({
                id: c.id,
                ...c.data(),
              })),
              date_ago: computeTimePassed(d.date.toDate()),
            };
          })
        );

        setPosts(posts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);


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
      prev.map((p: any) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, data],
            }
          : p,
      ),
    );
    setComment("");
  };

  const openImageModal = (images: string[], index: number) => {
    setSelectedPostImages(images);
    setSelectedIndex(index);
    setImageModalVisible(true);
  };
    
  const handleSeeProfile = (post: any) => {
    if (pageId == post.creator_id) return

    if (post.creator_is_page) {
      router.push({
        pathname: "/other-user/profile",
        params: {
          pageId: post.id
        }
      });
      return;
    }

    router.push({
      pathname: "/usable/user-profile",
      params: { userToViewId: post.creator_id },
    });
  };
  
  const handleFollow = () => {
    const _followed = !followed
    setFollowed(_followed)
    if (_followed){
      set("users", pageId, "followers", userId).value({
        follower_id: userId,
      })
      return
    }
    remove("users", pageId, "followers", userId)
  }

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
    <View style={screens.screen}>
      <HeaderLayout noBorderRadius>
        <HeaderWithActions
          title={profile.firstname}
          onBack={() => router.back()}
          centerTitle={true}
          onAction={() => router.push("/pet-owner/search")}
          actionIcon="search"
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
          {/* --- Cover Photo --- */}
          <View style={styles.coverPhoto}>
            <Image
              source={{ uri: profile.cover_photo_path ?? '' }}
              style={styles.coverImage}
            />
          </View>

          {/* --- Profile Info --- */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePhoto}>
              <Image
                source={{ uri: profile.img_path ?? '' }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.firstname}</Text>
              <Text style={styles.followers}>
                <Text style={{ fontWeight: "bold" }}>
                  {followers}{" "}
                </Text>
                Followers,{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {following}{" "}
                </Text>
                Following
              </Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          </View>

          {/* --- Action Buttons --- */}
          {userId === pageId
            ? <View style={styles.actionWrapper}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                onPress={() => router.push('/pet-owner/edit-profile')}
              >
                <MaterialIcons name="edit" size={17} color="black" />
                <Text style={[styles.actionButtonText, { color: "black" }]}>
                  Edit Profile
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: "#ddd", paddingHorizontal: 20 },
                ]}
                onPress={() => router.push("/pet-owner/acc-settings")}
              >
                <Entypo name="dots-three-vertical" size={17} color="black" />
              </Pressable>
            </View> 
            : <View style={styles.actionWrapper}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                onPress={handleFollow}
              >
                <MaterialIcons name={followed ? "remove" : "add"} size={17} color="black" />
                <Text style={[styles.actionButtonText, { color: "black" }]}>
                  {followed ? 'Unfollow' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          }

          {/* --- Tabs --- */}
          <View style={styles.tabsContainer}>
            {["posts", "about"].map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab as "posts" | "about")}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* --- Tab Content --- */}
          {activeTab === "posts" && (
            <View style={styles.postsSection}>
              {/* <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>About</Text>
                <View style={styles.aboutRow}>
                  <MaterialIcons
                    name="location-on"
                    size={30}
                    color={Colors.primary}
                  />
                  <Text style={styles.aboutText}>{dummyProfile.address}</Text>
                </View>

                <View style={styles.aboutRow}>
                  <MaterialIcons
                    name="phone"
                    size={30}
                    color={Colors.primary}
                  />
                  <Text style={styles.aboutText}>
                    {dummyProfile.phone_number}
                  </Text>
                </View>
                <View style={styles.aboutRow}>
                  <MaterialIcons
                    name="email"
                    size={30}
                    color={Colors.primary}
                  />
                  <Text style={styles.aboutText}>{dummyProfile.email}</Text>
                </View>
                <View style={styles.aboutRow}>
                  <Octicons
                    name="clock-fill"
                    size={25}
                    color={Colors.primary}
                  />
                  <Text style={styles.aboutText}>
                    {dummyProfile.isOpen ? "Open" : "Closed"}
                  </Text>
                </View>
              </View> */}

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
                  onPress={() => router.push('/pet-owner/post')}
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
                      source={{ uri: profile.img_path }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 30,
                      }}
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
                  <MaterialIcons name="image" size={24} color={"green"} />
                </Pressable>
              </View>

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
          )}

          {activeTab === "about" && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>About</Text>
              <View style={styles.aboutRow}>
                <MaterialIcons
                  name="location-on"
                  size={30}
                  color={Colors.primary}
                />
                <Text style={styles.aboutText}>{profile.address}</Text>
              </View>

              <View style={styles.aboutRow}>
                <MaterialIcons name="phone" size={30} color={Colors.primary} />
                <Text style={styles.aboutText}>
                  {profile.phone_number}
                </Text>
              </View>
              <View style={styles.aboutRow}>
                <MaterialIcons name="email" size={30} color={Colors.primary} />
                <Text style={styles.aboutText}>{profile.email}</Text>
              </View>
              <View style={styles.aboutRow}>
                <Octicons name="clock-fill" size={25} color={Colors.primary} />
                <Text style={styles.aboutText}>
                  {profile.is_open ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          )}
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

export default PageProfile;

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
  scrollContainer: { flex: 1, paddingBottom: 100 },
  coverPhoto: { width: "100%", height: 200, backgroundColor: "#ccc" },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  profileHeader: {
    flexDirection: "column",
    marginTop: -70,
    paddingHorizontal: 10,
  },
  profilePhoto: {
    width: 130,
    height: 130,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 70 },
  profileInfo: { marginLeft: 10, marginTop: 10 },
  name: { fontSize: 24, fontFamily: "RobotoSemiBold", color: "#000" },
  bio: { fontSize: 15, color: "#555", marginTop: 25, marginBottom: 10 },
  followers: { fontSize: 15, color: "#555", marginTop: 5 },
  actionWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 75,
  },
  actionButtonText: {
    fontSize: 14,
    color: "white",
    fontFamily: "RobotoSemiBold",
  },

  tabsContainer: {
    flexDirection: "row",
    marginLeft: 15,
    gap: 10,
    marginTop: 15,
    // marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: 15,
    color: "#000",
    fontFamily: "RobotoSemiBold",
  },
  activeTabText: { color: "#fff" },
  addPost: {
    width: "100%",
    paddingVertical: 5,
    backgroundColor: "#fff",
    marginTop: 5,
    marginBottom: 5,
  },
  postsSection: { marginTop: 10 },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  postHeader: { flexDirection: "row", alignItems: "center" },
  postProfile: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: "600", fontSize: 15 },
  postTime: { color: Colors.gray, fontSize: 12 },
  postContent: { marginVertical: 8, fontSize: 14, color: "#333" },
  postImage: { width: "100%", height: 200, borderRadius: 8 },
  postFooter: { flexDirection: "row", marginTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  countText: { marginLeft: 5, color: Colors.gray },

  /** Image Grid **/
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
    fontSize: 28,
    color: "white",
  },

  aboutSection: { padding: 15, borderBottomWidth: 1, borderColor: "#eee" },
  aboutTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  aboutRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  aboutText: { marginLeft: 10, fontSize: 15, color: "#333" },

  appointmentSection: { marginTop: 20, padding: 15 },
  setAppointmentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  setAppointmentText: { fontSize: 15, color: Colors.primary },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600" },
  appointmentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  appointmentPet: { fontSize: 16, fontWeight: "600" },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  appointmentDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  appointmentDetail: { fontSize: 14, color: "#333" },
});
