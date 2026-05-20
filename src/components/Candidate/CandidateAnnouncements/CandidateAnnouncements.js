import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/CandidateSidebar";
import Header from "../Layout/CandidateHeader";
import "./Announcements.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

const fetchAnnouncements = async () => {
  try {
    setLoading(true);

    const response = await fetch(`${BASE_URL}/api/admin/news-announcements/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Announcements API Response:", result);

    let fetchedData = [];
    if (result.status && result.data) {
      fetchedData = result.data;
    } else if (Array.isArray(result)) {
      fetchedData = result;
    }

    // ✅ Get candidate user
    const candidateUser = JSON.parse(localStorage.getItem("candidate_user"));

    // ✅ Filter announcements based on author_type
    const filteredData = candidateUser
      ? fetchedData.filter(
          (item) => item.author_type === candidateUser.user_type
        )
      : fetchedData;

    setAnnouncements(filteredData);
    setError(null);
  } catch (err) {
    console.error("Error fetching announcements:", err);

    setError("Failed to load announcements");
    setAnnouncements([]);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch announcements. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  const handleAddAnnouncement = () => {
    navigate("/candidate-add-announcement");
  };

  const handleEdit = (id) => {
    navigate(`/candidate-add-announcement/${id}`);
  };

  const handleDelete = async (id, title) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/news-announcements/${id}/`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAnnouncements();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `"${title}" has been deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting announcement:", err);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete announcement. Please try again.",
      });
    }
  };

  const confirmDelete = (announcement) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${announcement.title}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(announcement.id, announcement.title);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    return (
      searchTerm === "" ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="ta-layout-wrapper">
      <Sidebar />
      <div className="ta-main-wrapper">
        <Header />
        <div className="ta-content-area">
          <div className="announcements-wrapper">
            {/* Header */}
            <div className="announcements-header">
              <div>
                <h2>Announcements Management</h2>
                <p>Total: {announcements.length}</p>
              </div>
              <button
                onClick={handleAddAnnouncement}
                className="btn btn-primary"
              >
                Add Announcement
              </button>
            </div>

            {/* Search */}
            <div className="announcements-filters-box">
              <div className="announcements-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center p-5">
                <div className="spinner-border" />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="alert alert-danger">
                {error}
                <button
                  onClick={fetchAnnouncements}
                  className="btn btn-sm btn-primary ms-2"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Content Type</th>
                    <th>Priority</th>
                    <th>Target Audience</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((item) => (
                      <AnnouncementRow
                        key={item.id}
                        announcement={item}
                        formatDate={formatDate}
                        onEdit={handleEdit}
                        onDelete={confirmDelete}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CONTENT_TYPE_LABELS = {
  news: "News",
  announcement: "Announcement",
  incident_report: "Incident Report",
  circular: "Circular",
  notice: "Notice",
  alert: "Alert",
  update: "Update",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const AUDIENCE_LABELS = {
  all: "All Users",
  admin_only: "Admin Only",
  mentor_only: "Mentor Only",
  candidate_only: "Candidate Only",
  specific_department: "Specific Department",
  specific_level: "Specific Level",
};

/* Row Component */
const AnnouncementRow = ({ announcement, formatDate, onEdit, onDelete }) => {
  const truncate = (text, len = 100) =>
    text && text.length > len ? text.substring(0, len) + "..." : text;

  return (
    <tr>
      <td>{announcement.title || "N/A"}</td>
      <td>{truncate(announcement.content) || "N/A"}</td>
      <td>
        {CONTENT_TYPE_LABELS[announcement.content_type] ||
          announcement.content_type ||
          "N/A"}
      </td>
      <td>
        {PRIORITY_LABELS[announcement.priority] ||
          announcement.priority ||
          "N/A"}
      </td>
      <td>
        {AUDIENCE_LABELS[announcement.target_audience] ||
          announcement.target_audience ||
          "N/A"}
      </td>
      <td>{formatDate(announcement.created_at)}</td>
      <td>
        <FaEdit
          onClick={() => onEdit(announcement.id)}
          style={{ cursor: "pointer", marginRight: "10px", color:'blue' }}
        />
        <FaTrash
          onClick={() => onDelete(announcement)}
          style={{ cursor: "pointer", color:"red" }}
        />
      </td>
    </tr>
  );
};

export default Announcements;
