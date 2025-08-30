import React, { useState } from "react";
import axios from "axios";   // ✅ axios import
import { X } from "lucide-react";

function FileUpload() {
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUser, setUploadedUser] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!username) {
      alert("Please enter a username!");
      return;
    }
    if (!file) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("image", file);

    try {
      setUploading(true);

      // ✅ Axios POST request
      const res = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success:", res.data);
      setUploadedUser(res.data);
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    document.getElementById("fileInput").value = ""; // reset input
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center">
        <h2 className="text-lg font-bold mb-6">User Upload</h2>

        {/* Username Input */}
        <div className="mb-4 text-left">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            User Name
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3"
          />
        </div>

        {/* File Input */}
        <div className="mb-4 text-left">
          <label
            htmlFor="fileInput"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            User Image
          </label>
          <div className="relative">
            <input
              id="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3"
            />
            {file && (
              <button
                onClick={clearFile}
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-red-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border"
          />
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Show Uploaded User */}
        {uploadedUser && (
          <div className="mt-6 text-sm text-left">
            <p>
              <strong>Saved Username:</strong> {uploadedUser.user.username}
            </p>
            <p>
              <strong>Saved Image:</strong>{" "}
              <a
                href={uploadedUser.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {uploadedUser.user.image}
              </a>
            </p>
            <img
              src={uploadedUser.imageUrl}
              alt="Uploaded"
              className="w-20 h-20 object-cover rounded-full mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
