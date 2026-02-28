import axios from "axios";

const uploadImageUri = async (uri) => {
  try {
    const formData = new FormData();

    const param = {
      uri: uri,
      type: "image/jpeg",
      name: "pawsbook_image.jpeg",
    };

    formData.append("file", param);
    formData.append("upload_preset", "images");
    // formData.append("upload_preset", "upload_file");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dnvnkh2md/image/upload",
      // "https://api.cloudinary.com/v1_1/diwwrxy8b/image/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data.secure_url;
  } catch (e) {
    return null;
  }
};

const uploadVideoUri = async (uri) => {
  try {
    const formData = new FormData();

    const param = {
      uri: uri,
      type: "video/mp4",
      name: "pawsbook_video.mp4",
    };

    formData.append("file", param);
    formData.append("upload_preset", "images");
    // formData.append("upload_preset", "upload_file");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dnvnkh2md/image/upload",
      // "https://api.cloudinary.com/v1_1/diwwrxy8b/image/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return res.data.secure_url;
  } catch (e) {
    return null;
  }
};

const uploadAnyMedia = async (file) => {
  try {
    const formData = new FormData();

    const isVideo = file.type?.startsWith("video");

    const param = {
      uri: file.uri,
      type: isVideo ? "video/mp4" : "image/jpeg",
      name: isVideo ? "pawsbook_video.mp4" : "pawsbook_image.jpeg",
    };

    formData.append("resource_type", "auto");
    formData.append("file", param);
    formData.append("upload_preset", "images");
    // formData.append("upload_preset", "upload_file");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dnvnkh2md/auto/upload",
      // "https://api.cloudinary.com/v1_1/diwwrxy8b/image/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    if (isVideo) return { video_path: res.data.secure_url };
    return { img_path: res.data.secure_url };
  } catch (e) {
    return {};
  }
};

export { uploadAnyMedia, uploadImageUri, uploadVideoUri };
