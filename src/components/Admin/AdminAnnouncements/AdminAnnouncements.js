import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import "./Announcements.css";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaClock,
  FaList,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" or "pending"
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [showBulkUpdateForm, setShowBulkUpdateForm] = useState(false);

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

      setAnnouncements(fetchedData);
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
    navigate("/add-announcement");
  };

  const handleEdit = (id) => {
    navigate(`/add-announcement/${id}`);
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

  // Handle checkbox selection
  const handleSelectAnnouncement = (id) => {
    setSelectedAnnouncements((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAnnouncements.length === filteredAnnouncements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(filteredAnnouncements.map((item) => item.id));
    }
  };

  // Handle bulk status update
  const handleBulkUpdate = async (status, comments) => {
    const adminUser = JSON.parse(localStorage.getItem("admin_user"));

    if (!adminUser || !adminUser.user_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Admin user not found. Please login again.",
      });
      return;
    }

    const payload = {
      news_ids: selectedAnnouncements,
      status: status,
      approved_by: adminUser.user_id,
      approval_comments: comments,
    };

    console.log("Update Payload", payload);

    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/news-announcements/bulk-status-update/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bulk update response:", result);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${selectedAnnouncements.length} announcement(s) have been updated successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset selections and refresh data
      setSelectedAnnouncements([]);
      setShowBulkUpdateForm(false);
      await fetchAnnouncements();
    } catch (err) {
      console.error("Error in bulk update:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update announcements. Please try again.",
      });
    }
  };

  // Show bulk update form
  const showBulkUpdateModal = () => {
    if (selectedAnnouncements.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one announcement to update.",
      });
      return;
    }
    setShowBulkUpdateForm(true);
  };

  // Filter announcements based on search term and active filter
  const getFilteredAnnouncements = () => {
    let filtered = announcements;

    // Apply pending approvals filter if active
    if (activeFilter === "pending") {
      filtered = filtered.filter((item) => {
        return (
          item.status !== "published" 
          // &&
          // (item.author_type === "candidate" || item.author_type === "mentor")
        );
      });
    }

    // Apply search filter
    if (searchTerm !== "") {
      filtered = filtered.filter((item) => {
        return (
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  // Get count of pending approvals
  const getPendingCount = () => {
    return announcements.filter((item) => {
      return (
        item.status !== "published" 
        // &&
        // (item.author_type === "candidate" || item.author_type === "mentor")
      );
    }).length;
  };

  // Bulk Update Modal Component
  const BulkUpdateModal = () => {
    const [status, setStatus] = useState(""); // Empty string instead of "approved"
    const [comments, setComments] = useState("");

    const handleSubmit = () => {
      if (!status) {
        Swal.fire({
          icon: "warning",
          title: "Status Required",
          text: "Please select a status.",
        });
        return;
      }

      if (!comments.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Comment Required",
          text: "Please enter approval comments.",
        });
        return;
      }

      handleBulkUpdate(status, comments);
    };

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "500px",
            maxWidth: "90%",
          }}
        >
          <h3>Bulk Status Update</h3>
          <p>
            Selected Announcements:{" "}
            <strong>{selectedAnnouncements.length}</strong>
          </p>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Status: <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="" disabled selected>
                Select Status
              </option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Approval Comments: <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments here..."
              rows="4"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              onClick={() => setShowBulkUpdateForm(false)}
              style={{
                padding: "8px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "8px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                {/* <p>Total: {announcements.length}</p> */}
              </div>
              <button
                onClick={handleAddAnnouncement}
                className="btn btn-primary"
              >
                Add Announcement
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {/* Filter Buttons - Left side */}
              <div
                className="announcements-filter-buttons"
                style={{ display: "flex", gap: "10px" }}
              >
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchTerm("");
                    setSelectedAnnouncements([]);
                  }}
                  className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor:
                      activeFilter === "all" ? "#007bff" : "transparent",
                    color: activeFilter === "all" ? "white" : "#333",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "500",
                  }}
                >
                  <FaList />
                  All Announcements
                  <span
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        activeFilter === "all"
                          ? "rgba(255,255,255,0.3)"
                          : "#e0e0e0",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {announcements.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveFilter("pending");
                    setSearchTerm("");
                    setSelectedAnnouncements([]);
                  }}
                  className={`filter-btn ${activeFilter === "pending" ? "active" : ""}`}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor:
                      activeFilter === "pending" ? "#ffc107" : "transparent",
                    color: activeFilter === "pending" ? "white" : "#333",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "500",
                  }}
                >
                  <FaClock />
                  Pending Approvals
                  <span
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        activeFilter === "pending"
                          ? "rgba(255,255,255,0.3)"
                          : "#e0e0e0",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {getPendingCount()}
                  </span>
                </button>
              </div>

              {/* Search - Right side with border */}
              <div
                className="announcements-search"
                style={{
                  minWidth: "250px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              >
                <div style={{ position: "relative" }}>
                  <FaSearch
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "8px 10px 8px 35px",
                      border: "none",
                      backgroundColor: "transparent",
                      borderRadius: "4px",
                      width: "100%",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Active Filter Indicator */}
            {/* {activeFilter === "pending" && (
              <div className="alert alert-info mt-2 mb-2">
                <strong>Showing Pending Approvals:</strong> Announcements from
                Candidates and Mentors that are not yet published.
                <button
                  onClick={() => setActiveFilter("all")}
                  className="btn btn-sm btn-link float-end"
                >
                  View All
                </button>
              </div>
            )} */}

            {/* Bulk Update Button for Pending Approvals */}
            {activeFilter === "pending" && selectedAnnouncements.length > 0 && (
              <div
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={showBulkUpdateModal}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaCheckCircle />
                  Update Selected ({selectedAnnouncements.length})
                </button>
              </div>
            )}

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
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      {activeFilter === "pending" && (
                        <th style={{ width: "40px" }}>
                          <input
                            type="checkbox"
                            checked={
                              selectedAnnouncements.length ===
                                filteredAnnouncements.length &&
                              filteredAnnouncements.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th style={{ width: "60px" }}>S No</th>
                      <th>Title</th>
                      <th>Content</th>
                      <th>Content Type</th>
                      <th>Priority</th>
                      <th>Target Audience</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Date</th>
                      {activeFilter !== "pending" && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((item, index) => (
                        <AnnouncementRow
                          key={item.id}
                          index={index}
                          announcement={item}
                          formatDate={formatDate}
                          onEdit={handleEdit}
                          onDelete={confirmDelete}
                          isPendingFilter={activeFilter === "pending"}
                          isSelected={selectedAnnouncements.includes(item.id)}
                          onSelect={handleSelectAnnouncement}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={activeFilter === "pending" ? 11 : 10}
                          className="text-center"
                        >
                          {activeFilter === "pending"
                            ? "No pending approvals found"
                            : searchTerm
                              ? "No announcements match your search"
                              : "No data found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {showBulkUpdateForm && <BulkUpdateModal />}
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

const STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const AUTHOR_TYPE_LABELS = {
  admin: "Admin",
  mentor: "Mentor",
  candidate: "Candidate",
};

/* Row Component */
/* Row Component */
const AnnouncementRow = ({
  announcement,
  formatDate,
  onEdit,
  onDelete,
  isPendingFilter,
  isSelected,
  onSelect,
  index,
}) => {
  const truncate = (text, len = 100) =>
    text && text.length > len ? text.substring(0, len) + "..." : text;

  return (
    <tr>
      {isPendingFilter && (
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(announcement.id)}
          />
        </td>
      )}
      <td>{index + 1}</td>
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
      <td>
        {AUTHOR_TYPE_LABELS[announcement.author_type] ||
          announcement.author_type ||
          "N/A"}
      </td>
      <td>
        <span className={`status-badge status-${announcement.status}`}>
          {STATUS_LABELS[announcement.status] || announcement.status || "N/A"}
        </span>
      </td>
      <td>{formatDate(announcement.created_at)}</td>
      {!isPendingFilter && (
        <td>
          <FaEdit
            onClick={() => onEdit(announcement.id)}
            style={{ cursor: "pointer", marginRight: "10px", color: "blue" }}
          />
          <FaTrash
            onClick={() => onDelete(announcement)}
            style={{ cursor: "pointer", color: "red" }}
          />
        </td>
      )}
    </tr>
  );
};

export default Announcements;
