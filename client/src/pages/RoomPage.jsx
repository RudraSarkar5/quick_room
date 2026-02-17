import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { showToast } from "../utils/Toast"; 

function RoomPage() {
  const navigate = useNavigate();
  const roomId = localStorage.getItem("roomId");

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [contents, setContents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchContents();
    }
  }, []);

  const fetchContents = async () => {
    try {
      const res = await API.get("/contents");
      setContents(res.data.contents);
    } catch (err) {
      console.error(err);
      setContents([]);
      showToast("Failed to load contents", "error");
    }
  };

  const handleAddText = async () => {
    if (!text.trim()) {
      showToast("Text cannot be empty", "error");
      return;
    }
    try {
      await API.post("/contents/text", { text });
      setText("");
      closeModal();
      fetchContents();
      showToast("Text added successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add text", "error");
    }
  };

 const handleUploadFile = async () => {
  if (!file) {
    showToast("Please select a file to upload", "error");
    return;
  }

  try {
    // 1️⃣ Ask backend for S3 upload URL
    const res = await API.post("/s3/upload-url", {
      fileName: file.name,
      fileType: file.type,
    });

    const { uploadUrl, key } = res.data;

    // 2️⃣ Upload file directly to S3
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // 3️⃣ Save file info in your database (VERY IMPORTANT)
    await API.post("/contents/file", {
      fileName: file.name,
      filePath: key,
    });

    setFile(null);
    closeModal();
    fetchContents();

    showToast("File uploaded successfully", "success");

  } catch (err) {
    console.error(err);
    showToast(
      "Failed to upload: " + (err.response?.data?.message || err.message),
      "error"
    );
  }
};


  const handleDeleteContent = async (id) => {
    try {
      await API.delete(`/contents/${id}`);
      fetchContents();
      showToast("Content deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete content", "error");
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await API.delete(`/rooms/${roomId}`);
      localStorage.clear();
      navigate("/");
      showToast("Room deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete room", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    showToast("Logged out successfully", "success");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedType(null);
    setText("");
    setFile(null);
  };

  // const getFileURL = (path) => `http://localhost:5000/${path}`;

  // utils/files.js (or top of your component)
const S3BucketDomain = "https://quickroom.s3.ap-south-2.amazonaws.com";

 function getFileURL(key = "") {
  // Safely encode each path segment to handle spaces & special chars
  const safeKey = key.split("/").map(encodeURIComponent).join("/");
  return `${S3BucketDomain}/${safeKey}`;
}

  const renderFilePreview = (item) => {
    const fileURL = getFileURL(item.filePath);
    const fileName = item.fileName.toLowerCase();

    if (fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
      return <img src={fileURL} alt="preview" style={styles.previewImage} />;
    }
    if (fileName.match(/\.(mp4|webm|ogg)$/)) {
      return <video src={fileURL} controls style={styles.previewVideo} />;
    }
    if (fileName.match(/\.(mp3|wav)$/)) {
      return <audio src={fileURL} controls style={{ width: "100%", marginTop: "10px" }} />;
    }
    if (fileName.match(/\.(pdf)$/)) {
      return <iframe src={fileURL} title="pdf" style={styles.previewPDF} />;
    }
    return null;
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Room: {roomId}</h2>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
          <button style={styles.deleteRoomBtn} onClick={() => setShowDeleteConfirm(true)}>
            Delete Room
          </button>
        </div>
      </div>

      {/* Room Contents */}
      <div style={styles.contentContainer}>
        {contents.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>No content yet. Click + to add.</p>
        )}

        {contents &&
          contents.map((item) => (
            <div key={item._id} style={styles.card}>
              {item.type === "text" && (
                <div style={styles.textPreviewCard} onClick={() => setSelectedText(item.text)}>
                  {item.text.length > 120 ? item.text.substring(0, 120) + "..." : item.text}
                </div>
              )}

              {/* {item.type === "file" && (
                <div>
                  <p style={{ fontWeight: "600" }}>{item.fileName}</p>
                  {renderFilePreview(item)}
                  <a href={getFileURL(item.filePath)} target="_blank" rel="noreferrer" style={styles.link}>
                    Open Full File
                  </a>
                </div>
              )} */}

              {item.type === "file" && (
  <div>
    <p style={{ fontWeight: "600" }}>{item.fileName}</p>

    {/* If you already have renderFilePreview, make sure it uses getFileURL too */}
    {renderFilePreview(item)}

    <a
      href={getFileURL(item.filePath)}
      target="_blank"
      rel="noreferrer"
      style={styles.link}
    >
      Open Full File
    </a>
  </div>
)}

              <button style={styles.deleteBtn} onClick={() => handleDeleteContent(item._id)}>
                Delete
              </button>
            </div>
          ))}
      </div>

      {/* Floating Add Button */}
      <button style={styles.floatingBtn} onClick={() => setShowModal(true)}>
        +
      </button>

      {/* Add Content Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {!selectedType && (
              <>
                <h3>Add Content</h3>
                <button style={styles.optionBtn} onClick={() => setSelectedType("text")}>Add Text</button>
                <button style={styles.optionBtn} onClick={() => setSelectedType("file")}>Upload File</button>
                <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              </>
            )}

            {selectedType === "text" && (
              <>
                <h3>Add Text</h3>
                <textarea
                  rows="4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter your text..."
                />
                <button style={styles.primaryBtn} onClick={handleAddText}>Submit</button>
                <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              </>
            )}

            {selectedType === "file" && (
              <>
                <h3>Upload File</h3>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <button style={styles.primaryBtn} onClick={handleUploadFile}>Upload</button>
                <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Text Modal */}
      {selectedText && (
        <div style={styles.fullscreenOverlay}>
          <div style={styles.fullscreenModal}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Full Text</h2>
              <button style={styles.closeBtn} onClick={() => setSelectedText(null)}>✕</button>
            </div>
            <div style={styles.fullTextContent}>{selectedText}</div>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Are you sure you want to delete this room?</h3>
            <button style={styles.primaryBtn} onClick={handleDeleteRoom}>Yes, Delete</button>
            <button style={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}




const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f4f6f9", padding: "30px", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  logoutBtn: { backgroundColor: "#ff4d4f", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", marginRight: "10px" },
  deleteRoomBtn: { backgroundColor: "#d4380d", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" },
  contentContainer: { maxWidth: "700px", margin: "0 auto" },
  card: { background: "white", padding: "15px", borderRadius: "10px", marginBottom: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  textPreviewCard: { backgroundColor: "#f5f7fa", padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", lineHeight: "1.5" },
  link: { color: "#1677ff", textDecoration: "none", display: "block", marginTop: "10px" },
  deleteBtn: { marginTop: "10px", backgroundColor: "#eee", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" },
  floatingBtn: { position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#1677ff", color: "white", fontSize: "30px", border: "none", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "white", padding: "25px", borderRadius: "12px", width: "350px", textAlign: "center" },
  optionBtn: { display: "block", width: "100%", margin: "10px 0", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", cursor: "pointer" },
  primaryBtn: { backgroundColor: "#1677ff", color: "white", border: "none", padding: "10px", borderRadius: "6px", width: "100%", marginTop: "10px", cursor: "pointer" },
  cancelBtn: { marginTop: "10px", backgroundColor: "#eee", border: "none", padding: "8px", borderRadius: "6px", width: "100%", cursor: "pointer" },
  deleteConfirmBtn: { backgroundColor: "#d4380d", color: "white", border: "none", padding: "10px", borderRadius: "6px", width: "100%", marginTop: "10px", cursor: "pointer" },
  textarea: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "10px" },
  previewImage: { width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" },
  previewVideo: { width: "100%", maxHeight: "250px", borderRadius: "8px", marginTop: "10px" },
  previewPDF: { width: "100%", height: "250px", marginTop: "10px", borderRadius: "8px" },
  fullscreenOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  fullscreenModal: { backgroundColor: "white", width: "80%", maxWidth: "900px", height: "80vh", borderRadius: "16px", display: "flex", flexDirection: "column", padding: "25px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeBtn: { background: "none", border: "none", fontSize: "22px", cursor: "pointer" },
  fullTextContent: { flex: 1, overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "15px" },
};

export default RoomPage;
