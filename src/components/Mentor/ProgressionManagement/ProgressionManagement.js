import React, { useEffect, useState } from "react";
import MentorSidebar from "../Layout/MentorSidebar";
import Header from "../Layout/MentorHeader";
import {
  FaEye,
  FaUserGraduate,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaLevelUpAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../ApiUrl";

const MentorProgressionPage = () => {
  const [data, setData] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch ALL APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [validationRes, candidateRes, deptRes, levelRes] =
          await Promise.all([
            fetch(`${BASE_URL}/api/candidate/competencies/validation/`),
            fetch(`${BASE_URL}/api/candidate/candidates/`),
            fetch(`${BASE_URL}/api/admin/departments/`),
            fetch(`${BASE_URL}/api/admin/levels/`),
          ]);

        const validationJson = await validationRes.json();
        const candidateJson = await candidateRes.json();
        const deptJson = await deptRes.json();
        const levelJson = await levelRes.json();

        if (validationJson.status) {
          setData(validationJson.data.results || []);
        }

        if (candidateJson.status) {
          setCandidates(candidateJson.data || []);
        }

        if (deptJson.status) {
          setDepartments(deptJson.data || []);
        }

        if (levelJson.status) {
          setLevels(levelJson.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Helpers
  const getCandidate = (id) =>
    candidates.find((c) => Number(c.id) === Number(id));

  const getDepartment = (id) =>
    departments.find((d) => Number(d.id) === Number(id));

  const getLevel = (id) => levels.find((l) => Number(l.id) === Number(id));

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    action: "",
    level: "",
    comments: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.action) {
      alert("Please select action");
      return;
    }

    if (formData.action === "approve" && !formData.level) {
      alert("Please select level");
      return;
    }

    try {
      const payload = {
        action: formData.action,
        candidate_id: selectedItem.candidate_id,
        department_id: selectedItem.department_id,
        current_level_id: selectedItem.level_id,
        mentor_name: "tharun", // 🔥 make dynamic later
        ...(formData.action === "approve" && {
          target_level_id: Number(formData.level),
        }),
        comments: formData.comments,
      };

      console.log("Payload:", payload);

      const res = await fetch(
        `${BASE_URL}/api/candidate/competencies/progression/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Action successful");
      setShowModal(false);

      // refresh data
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  //   if (loading) return <p>Loading...</p>;

  return (
    <div className="ta-layout-wrapper">
      <MentorSidebar />

      <div className="ta-main-wrapper">
        <Header />

        <div className="ta-content-area container-fluid">
          <h4 className="mb-3">Competency Validation</h4>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Current Level</th>
                  <th>Department Level</th>
                  <th>Avg Score</th>
                  <th>Required</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No Data
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    const candidate = getCandidate(item.candidate_id);
                    const department = getDepartment(item.department_id);
                    const level = getLevel(item.level_id);

                    return (
                      <tr key={index}>
                        {/* Candidate */}
                        <td>
                          <FaUserGraduate className="me-2" />
                          {candidate?.full_name || `ID: ${item.candidate_id}`}
                        </td>

                        {/* Contact */}
                        <td>
                          <div>
                            <div>
                              <FaEnvelope size={12} />{" "}
                              {candidate?.email || "N/A"}
                            </div>
                            <div>
                              <FaPhone size={12} />{" "}
                              {candidate?.phone_number || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td>
                          <FaBuilding className="me-1" />
                          {department?.name || "N/A"}
                        </td>

                        {/* Level */}
                        <td>
                          <FaLevelUpAlt className="me-1" />
                          {level?.name || item.department_level_name}
                        </td>
                        <td>{item.department_level_name}</td>

                        {/* Scores */}
                        <td>{item.candidate_average_score}</td>
                        <td>{item.minimum_required_score}</td>

                        {/* Status */}
                        <td>
                          {item.passed ? (
                            <span className="badge bg-success">Passed</span>
                          ) : (
                            <span className="badge bg-danger">Failed</span>
                          )}
                        </td>

                        {/* Action */}
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData({
                                action: "",
                                level: "",
                                comments: "",
                              });
                              setShowModal(true);
                            }}
                          >
                            Take Action
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show fade d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">Progression Action</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                {/* Action */}
                <div className="mb-3">
                  <label className="form-label">Action</label>
                  <select
                    className="form-select"
                    name="action"
                    value={formData.action}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                {/* Level (only for approve) */}
                {formData.action === "approve" && (
                  <div className="mb-3">
                    <label className="form-label">Select Level</label>
                    <select
                      className="form-select"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                    >
                      <option value="">Select Level</option>
                      {selectedItem?.progression_approval?.eligible_levels?.map(
                        (lvl) => (
                          <option key={lvl.level_id} value={lvl.level_id}>
                            {lvl.level_name} {lvl.is_double_progression && "⚡"}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                )}

                {/* Comments */}
                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-control"
                    name="comments"
                    rows="3"
                    value={formData.comments}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProgressionPage;
