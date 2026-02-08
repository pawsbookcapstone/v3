import axios from "axios";

const uploadImage = async (file, filename) => {
  const formData = new FormData();
  const imageExtension = file.fileName.substring(
    file.fileName.lastIndexOf(".")
  );

  const param = {
    uri: file.uri,
    type: "image/jpeg",
    name: filename + imageExtension,
  };

  formData.append("file", param);
  formData.append("upload_preset", "upload_file");

  const res = await axios.post(
    "https://api.cloudinary.com/v1_1/diwwrxy8b/image/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data.secure_url;
};

const uploadImageUri = async (uri) => {
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
    }
  );

  return res.data.secure_url;
};

export { uploadImage, uploadImageUri };
