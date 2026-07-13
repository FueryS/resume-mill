"use client";

import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Sparkles,
  Download,
  FileDown,
  Plus,
  Trash2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { generatePortfolioZip } from "@/utils/zipGenerator";
import DonationModal from "@/components/DonationModal";

const initialFormState = {
  personal: {
    fullName: "",
    role: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    summary: "",
  },
  experience: [
    {
      id: "1",
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  projects: [
    { id: "1", name: "", description: "", technologies: "", link: "" },
  ],
  education: [
    {
      id: "1",
      institution: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
    },
  ],
  skills: "",
};

export default function BuilderPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizingField, setOptimizingField] = useState(null); // { section, id, field }
  const [showDonation, setShowDonation] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("modern"); // 'modern' | 'minimal'

  // Step names
  const steps = [
    { name: "Profile & Summary", icon: <User size={18} /> },
    { name: "Experience", icon: <Briefcase size={18} /> },
    { name: "Projects", icon: <FolderGit2 size={18} /> },
    { name: "Education & Skills", icon: <GraduationCap size={18} /> },
    { name: "Preview & Export", icon: <Download size={18} /> },
  ];

  // 1. Load draft from LocalStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("resume-mill-draft");
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Auto-save draft on data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("resume-mill-draft", JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  // Form input change handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value },
    }));
  };

  const handleArrayChange = (section, id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addArrayItem = (section) => {
    let newItem = {};
    if (section === "experience") {
      newItem = {
        id: Date.now().toString(),
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      };
    } else if (section === "projects") {
      newItem = {
        id: Date.now().toString(),
        name: "",
        description: "",
        technologies: "",
        link: "",
      };
    } else if (section === "education") {
      newItem = {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        location: "",
        startDate: "",
        endDate: "",
        grade: "",
      };
    }
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeArrayItem = (section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  // 3. Gemini ATS Optimization Call
  const handleAIQuery = async (section, id, field, originalText) => {
    if (!originalText || !originalText.trim()) return;

    const key = `${section}-${id || "personal"}-${field}`;
    setOptimizingField(key);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          section,
          role: formData.personal.role,
        }),
      });

      const result = await response.json();

      if (response.ok && result.optimizedText) {
        // Track optimization in GA if loaded
        if (window.gtag) {
          window.gtag("event", "gemini_api_call", {
            event_category: "ai_tool",
            event_label: key,
          });
        }

        if (section === "personal") {
          setFormData((prev) => ({
            ...prev,
            personal: { ...prev.personal, [field]: result.optimizedText },
          }));
        } else {
          handleArrayChange(section, id, field, result.optimizedText);
        }
      } else {
        alert(
          result.error ||
            "Failed to optimize. Please check your network connection.",
        );
      }
    } catch (error) {
      console.error(error);
      alert("Error communicating with backend optimize API.");
    } finally {
      setOptimizingField(null);
    }
  };

  // Clear current draft
  const handleClearDraft = () => {
    if (
      confirm(
        "Are you sure you want to clear your current resume draft? All input details will be lost.",
      )
    ) {
      setFormData(initialFormState);
      localStorage.removeItem("resume-mill-draft");
    }
  };

  // 4. Download PDF (via native vector-sharp Print UI)
  const handleDownloadPDF = async () => {
    // Increment Vercel KV stats counter in background
    fetch("/api/stats", { method: "POST" }).catch(() => {});

    // Trigger standard Google Analytics event
    if (window.gtag) {
      window.gtag("event", "generate_resume_pdf", {
        event_category: "download",
        event_label: activeTemplate,
      });
    }

    // Trigger Print Dialog
    window.print();

    // Delay showing the support request popup slightly
    setTimeout(() => {
      setShowDonation(true);
    }, 1500);
  };

  // 5. Download Portfolio ZIP (via JSZip client-side compiler)
  const handleDownloadPortfolio = async () => {
    // Trigger GA Event
    if (window.gtag) {
      window.gtag("event", "generate_portfolio_zip", {
        event_category: "download",
        event_label: "client_portfolio",
      });
    }

    try {
      const blob = await generatePortfolioZip(formData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(formData.personal.fullName || "My").replace(/\s+/g, "_")}_Portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setShowDonation(true);
      }, 1500);
    } catch (e) {
      console.error(e);
      alert("Failed to generate ZIP. Please check your data.");
    }
  };

  return (
    <>
      <div className="builder-page">
        {/* Main Interface Wrapper */}
        <div className="container builder-grid">
          {/* Left panel: Multi-step Form */}
          <div className="form-panel">
            <div className="form-header">
              <div className="form-step-indicators">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`step-indicator ${activeStep === idx ? "active" : ""}`}
                    title={step.name}
                  >
                    {step.icon}
                  </button>
                ))}
              </div>
              <div className="step-label">
                <span>Step {activeStep + 1} of 5:</span>{" "}
                {steps[activeStep].name}
              </div>
            </div>

            <div className="form-body">
              {/* STEP 1: Personal Profile */}
              {activeStep === 0 && (
                <div className="form-section animate-scale-in">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.personal.fullName}
                        onChange={handlePersonalChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Role</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.personal.role}
                        onChange={handlePersonalChange}
                        placeholder="Frontend Engineer / Product Manager"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.personal.email}
                        onChange={handlePersonalChange}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.personal.phone}
                        onChange={handlePersonalChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input
                        type="url"
                        name="github"
                        value={formData.personal.github}
                        onChange={handlePersonalChange}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn URL</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.personal.linkedin}
                        onChange={handlePersonalChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="label-with-ai">
                      <label>Professional Summary</label>
                      <button
                        className="btn-ai-optimize"
                        onClick={() =>
                          handleAIQuery(
                            "personal",
                            null,
                            "summary",
                            formData.personal.summary,
                          )
                        }
                        disabled={
                          optimizingField === "personal-personal-summary"
                        }
                      >
                        {optimizingField === "personal-personal-summary" ? (
                          <RefreshCw size={12} className="spin-icon" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        <span>
                          {optimizingField === "personal-personal-summary"
                            ? "Refining..."
                            : "ATS Optimize (Gemini)"}
                        </span>
                      </button>
                    </div>
                    <textarea
                      name="summary"
                      rows="4"
                      value={formData.personal.summary}
                      onChange={handlePersonalChange}
                      placeholder="Summarize your professional experience, technical expertise, and career objectives."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Work Experience */}
              {activeStep === 1 && (
                <div className="form-section animate-scale-in">
                  {formData.experience.map((exp, idx) => (
                    <div key={exp.id} className="item-card">
                      <div className="item-card-header">
                        <h5>Position #{idx + 1}</h5>
                        <button
                          className="btn-remove"
                          onClick={() => removeArrayItem("experience", exp.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Company / Organization</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                exp.id,
                                "company",
                                e.target.value,
                              )
                            }
                            placeholder="Google"
                          />
                        </div>
                        <div className="form-group">
                          <label>Job Title / Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                exp.id,
                                "role",
                                e.target.value,
                              )
                            }
                            placeholder="Software Engineering Intern"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) =>
                              handleArrayChange(
                                "experience",
                                exp.id,
                                "location",
                                e.target.value,
                              )
                            }
                            placeholder="Bangalore, India"
                          />
                        </div>
                        <div
                          className="form-row"
                          style={{ flex: 1, gap: "10px" }}
                        >
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) =>
                                handleArrayChange(
                                  "experience",
                                  exp.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              placeholder="June 2024"
                            />
                          </div>
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="text"
                              value={exp.endDate}
                              disabled={exp.current}
                              onChange={(e) =>
                                handleArrayChange(
                                  "experience",
                                  exp.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              placeholder={
                                exp.current ? "Present" : "August 2024"
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-checkbox">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) =>
                            handleArrayChange(
                              "experience",
                              exp.id,
                              "current",
                              e.target.checked,
                            )
                          }
                        />
                        <label htmlFor={`current-${exp.id}`}>
                          I currently work here
                        </label>
                      </div>

                      <div className="form-group">
                        <div className="label-with-ai">
                          <label>Job Description / Responsibilities</label>
                          <button
                            className="btn-ai-optimize"
                            onClick={() =>
                              handleAIQuery(
                                "experience",
                                exp.id,
                                "description",
                                exp.description,
                              )
                            }
                            disabled={
                              optimizingField ===
                              `experience-${exp.id}-description`
                            }
                          >
                            {optimizingField ===
                            `experience-${exp.id}-description` ? (
                              <RefreshCw size={12} className="spin-icon" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>
                              {optimizingField ===
                              `experience-${exp.id}-description`
                                ? "Refining..."
                                : "ATS Optimize (Gemini)"}
                            </span>
                          </button>
                        </div>
                        <textarea
                          rows="4"
                          value={exp.description}
                          onChange={(e) =>
                            handleArrayChange(
                              "experience",
                              exp.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40% and improved search speed by 1.5s."
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn btn-secondary btn-add"
                    onClick={() => addArrayItem("experience")}
                  >
                    <Plus size={16} />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}

              {/* STEP 3: Projects */}
              {activeStep === 2 && (
                <div className="form-section animate-scale-in">
                  {formData.projects.map((proj, idx) => (
                    <div key={proj.id} className="item-card">
                      <div className="item-card-header">
                        <h5>Project #{idx + 1}</h5>
                        <button
                          className="btn-remove"
                          onClick={() => removeArrayItem("projects", proj.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Project Name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                proj.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="E-Commerce Store"
                          />
                        </div>
                        <div className="form-group">
                          <label>Project Link / Repository</label>
                          <input
                            type="url"
                            value={proj.link}
                            onChange={(e) =>
                              handleArrayChange(
                                "projects",
                                proj.id,
                                "link",
                                e.target.value,
                              )
                            }
                            placeholder="https://github.com/my-project"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Technologies Used (comma separated)</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) =>
                            handleArrayChange(
                              "projects",
                              proj.id,
                              "technologies",
                              e.target.value,
                            )
                          }
                          placeholder="Next.js, TailwindCSS, MongoDB, Stripe"
                        />
                      </div>

                      <div className="form-group">
                        <div className="label-with-ai">
                          <label>Project Description</label>
                          <button
                            className="btn-ai-optimize"
                            onClick={() =>
                              handleAIQuery(
                                "projects",
                                proj.id,
                                "description",
                                proj.description,
                              )
                            }
                            disabled={
                              optimizingField ===
                              `projects-${proj.id}-description`
                            }
                          >
                            {optimizingField ===
                            `projects-${proj.id}-description` ? (
                              <RefreshCw size={12} className="spin-icon" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>
                              {optimizingField ===
                              `projects-${proj.id}-description`
                                ? "Refining..."
                                : "ATS Optimize (Gemini)"}
                            </span>
                          </button>
                        </div>
                        <textarea
                          rows="3"
                          value={proj.description}
                          onChange={(e) =>
                            handleArrayChange(
                              "projects",
                              proj.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Briefly describe what you built, what tech stack was chosen, and key performance improvements."
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn btn-secondary btn-add"
                    onClick={() => addArrayItem("projects")}
                  >
                    <Plus size={16} />
                    <span>Add Project</span>
                  </button>
                </div>
              )}

              {/* STEP 4: Education & Skills */}
              {activeStep === 3 && (
                <div className="form-section animate-scale-in">
                  <h4 className="subsection-title">Education</h4>
                  {formData.education.map((edu, idx) => (
                    <div key={edu.id} className="item-card">
                      <div className="item-card-header">
                        <h5>Institution #{idx + 1}</h5>
                        <button
                          className="btn-remove"
                          onClick={() => removeArrayItem("education", edu.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Institution Name</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                edu.id,
                                "institution",
                                e.target.value,
                              )
                            }
                            placeholder="Indian Institute of Technology"
                          />
                        </div>
                        <div className="form-group">
                          <label>Degree / Qualification</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                edu.id,
                                "degree",
                                e.target.value,
                              )
                            }
                            placeholder="Bachelor of Technology in Computer Science"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) =>
                              handleArrayChange(
                                "education",
                                edu.id,
                                "location",
                                e.target.value,
                              )
                            }
                            placeholder="Mumbai, India"
                          />
                        </div>
                        <div
                          className="form-row"
                          style={{ flex: 1, gap: "10px" }}
                        >
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) =>
                                handleArrayChange(
                                  "education",
                                  edu.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              placeholder="2021"
                            />
                          </div>
                          <div className="form-group">
                            <label>End Date (or Expected)</label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) =>
                                handleArrayChange(
                                  "education",
                                  edu.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              placeholder="2025"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Grade / CGPA / Percentage</label>
                        <input
                          type="text"
                          value={edu.grade}
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              edu.id,
                              "grade",
                              e.target.value,
                            )
                          }
                          placeholder="9.2 CGPA / 88%"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn btn-secondary btn-add"
                    onClick={() => addArrayItem("education")}
                  >
                    <Plus size={16} />
                    <span>Add Education</span>
                  </button>

                  <h4
                    className="subsection-title"
                    style={{ marginTop: "30px" }}
                  >
                    Skills & Frameworks
                  </h4>
                  <div className="form-group">
                    <label>Skills list (comma separated)</label>
                    <textarea
                      rows="4"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          skills: e.target.value,
                        }))
                      }
                      placeholder="React, Next.js, JavaScript, Node.js, Git, HTML, CSS, SQL, Python"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Previews & Exports */}
              {activeStep === 4 && (
                <div className="form-section final-step-panel animate-scale-in">
                  <div className="template-selection-box">
                    <h4>Choose Resume Template</h4>
                    <div className="template-selectors">
                      <button
                        className={`template-btn ${activeTemplate === "modern" ? "active" : ""}`}
                        onClick={() => setActiveTemplate("modern")}
                      >
                        <FileDown size={18} />
                        <span>Modern Minimalist (Recommended)</span>
                      </button>
                      <button
                        className={`template-btn ${activeTemplate === "elegant" ? "active" : ""}`}
                        onClick={() => setActiveTemplate("elegant")}
                      >
                        <Eye size={18} />
                        <span>Elegant Executive</span>
                      </button>
                    </div>
                  </div>

                  <div className="exports-action-box">
                    <h4>Generate Files</h4>
                    <p>
                      Both downloads run 100% in your browser. No personal data
                      ever leaves your device.
                    </p>

                    <div className="actions-vertical">
                      <button
                        onClick={handleDownloadPDF}
                        className="btn btn-accent action-export-btn"
                      >
                        <Download size={20} />
                        <span>Download Resume PDF</span>
                      </button>

                      <button
                        onClick={handleDownloadPortfolio}
                        className="btn btn-primary action-export-btn"
                      >
                        <FileDown size={20} />
                        <span>Download Portfolio ZIP</span>
                      </button>

                      <button
                        onClick={handleClearDraft}
                        className="btn-clear-draft"
                      >
                        Reset Draft Form
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              {activeStep < 4 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowDonation(true)}
                  className="btn btn-accent"
                >
                  <Heart size={16} />
                  <span>Support Project</span>
                </button>
              )}
            </div>
          </div>

          {/* Right panel: Dynamic Vector Resume Preview */}
          <div className="preview-panel">
            <div className="preview-header">
              <span className="live-badge">Live A4 Print Preview</span>
              <span className="preview-hint">
                This matches exactly what saves as PDF (A4 size).
              </span>
            </div>

            {/* The A4 Resume page */}
            <div
              id="resume-printable-area"
              className={`resume-a4-page template-${activeTemplate}`}
            >
              {/* Header */}
              <div className="resume-header-block">
                <h1 className="resume-name">
                  {formData.personal.fullName || "YOUR NAME"}
                </h1>
                <p className="resume-role-subtitle">
                  {formData.personal.role || "TARGET ROLE / TITLE"}
                </p>

                <div className="resume-contact-bar">
                  {formData.personal.email && (
                    <span>{formData.personal.email}</span>
                  )}
                  {formData.personal.phone && (
                    <span>{formData.personal.phone}</span>
                  )}
                  {formData.personal.github && <span>GitHub</span>}
                  {formData.personal.linkedin && <span>LinkedIn</span>}
                </div>
              </div>

              {/* Summary */}
              {formData.personal.summary && (
                <div className="resume-section-block">
                  <h3 className="resume-sec-title">Professional Summary</h3>
                  <div className="resume-sec-divider"></div>
                  <p className="resume-summary-text">
                    {formData.personal.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {formData.experience.some((e) => e.company || e.role) && (
                <div className="resume-section-block">
                  <h3 className="resume-sec-title">Work Experience</h3>
                  <div className="resume-sec-divider"></div>
                  {formData.experience.map(
                    (exp, idx) =>
                      (exp.company || exp.role) && (
                        <div key={idx} className="resume-item-block">
                          <div className="resume-item-header">
                            <div>
                              <strong>{exp.role || "Job Role"}</strong> |{" "}
                              <span>{exp.company || "Company"}</span>
                            </div>
                            <span className="resume-item-dates">
                              {exp.startDate || "Start"} -{" "}
                              {exp.endDate || (exp.current ? "Present" : "End")}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="resume-item-location">
                              {exp.location}
                            </div>
                          )}
                          {exp.description && (
                            <p className="resume-item-desc">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ),
                  )}
                </div>
              )}

              {/* Projects */}
              {formData.projects.some((p) => p.name || p.description) && (
                <div className="resume-section-block">
                  <h3 className="resume-sec-title">Key Projects</h3>
                  <div className="resume-sec-divider"></div>
                  {formData.projects.map(
                    (proj, idx) =>
                      (proj.name || proj.description) && (
                        <div key={idx} className="resume-item-block">
                          <div className="resume-item-header">
                            <strong>{proj.name || "Project Name"}</strong>
                            {proj.link && (
                              <span className="resume-item-dates">
                                Demo Link
                              </span>
                            )}
                          </div>
                          {proj.technologies && (
                            <div className="resume-item-tech">
                              Technologies: {proj.technologies}
                            </div>
                          )}
                          {proj.description && (
                            <p className="resume-item-desc">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ),
                  )}
                </div>
              )}

              {/* Education */}
              {formData.education.some((e) => e.institution || e.degree) && (
                <div className="resume-section-block">
                  <h3 className="resume-sec-title">Education</h3>
                  <div className="resume-sec-divider"></div>
                  {formData.education.map(
                    (edu, idx) =>
                      (edu.institution || edu.degree) && (
                        <div key={idx} className="resume-item-block">
                          <div className="resume-item-header">
                            <div>
                              <strong>{edu.degree || "Degree"}</strong>,{" "}
                              <span>{edu.institution || "Institution"}</span>
                            </div>
                            <span className="resume-item-dates">
                              {edu.startDate || "Start"} -{" "}
                              {edu.endDate || "End"}
                            </span>
                          </div>
                          <div className="resume-item-location">
                            {edu.location && <span>{edu.location}</span>}
                            {edu.grade && (
                              <span> &bull; Grade: {edu.grade}</span>
                            )}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}

              {/* Skills */}
              {formData.skills && (
                <div className="resume-section-block">
                  <h3 className="resume-sec-title">Skills & Technologies</h3>
                  <div className="resume-sec-divider"></div>
                  <p className="resume-skills-text">{formData.skills}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation widget trigger */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
      />

      {/* STYLING FOR DRAFT BUILDER */}
      <style jsx>{`
        .builder-page {
          padding: var(--space-8) 0;
          font-family: var(--font-sans);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .builder-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--space-8);
          align-items: start;
          flex: 1;
        }

        /* Form panel */
        .form-panel {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 600px;
        }

        .form-header {
          border-bottom: 1px solid var(--border-color);
          padding: var(--space-5) var(--space-6);
          background-color: var(--bg-primary);
        }

        .form-step-indicators {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-4);
          position: relative;
        }

        .form-step-indicators::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 5%;
          width: 90%;
          height: 2px;
          background-color: var(--border-color);
          z-index: 1;
          transform: translateY(-50%);
        }

        .step-indicator {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          position: relative;
          z-index: 2;
          transition: all var(--transition-bounce);
        }

        .step-indicator.active {
          background-color: var(--primary);
          color: var(--text-inverse);
          border-color: var(--primary);
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
          transform: scale(1.1);
        }

        .step-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .step-label span {
          color: var(--text-muted);
          font-weight: 600;
        }

        .form-body {
          padding: var(--space-6);
          flex: 1;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-row {
          display: flex;
          gap: var(--space-4);
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-family: inherit;
          color: var(--text-main);
          outline: none;
          background-color: var(--bg-secondary);
          transition: border-color var(--transition-fast);
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: var(--primary);
        }

        /* Label with AI Optimize button */
        .label-with-ai {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-ai-optimize {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--accent-light);
          color: var(--accent);
          border: 1px solid rgba(249, 115, 22, 0.15);
          border-radius: var(--radius-sm);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-ai-optimize:hover:not(:disabled) {
          background-color: var(--accent);
          color: var(--text-inverse);
        }

        .btn-ai-optimize:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Array items cards styling */
        .item-card {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          background-color: var(--bg-primary);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: relative;
        }

        .item-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: var(--space-2);
        }

        .item-card-header h5 {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .btn-remove {
          color: var(--error);
          opacity: 0.6;
          transition: opacity var(--transition-fast);
          padding: 2px;
          border-radius: var(--radius-sm);
        }

        .btn-remove:hover {
          opacity: 1;
          background-color: rgba(239, 68, 68, 0.05);
        }

        .btn-add {
          width: 100%;
          justify-content: center;
          padding: 12px;
          border: 1px dashed var(--border-hover);
        }

        .form-checkbox {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .form-checkbox label {
          font-size: 13.5px;
          color: var(--text-main);
          font-weight: 600;
          cursor: pointer;
        }

        .subsection-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-main);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: var(--space-2);
        }

        /* Final step templates & exports */
        .final-step-panel {
          gap: var(--space-6);
        }

        .template-selection-box h4,
        .exports-action-box h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: var(--space-3);
        }

        .template-selectors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .template-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 13.5px;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .template-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-main);
          background-color: var(--bg-tertiary);
        }

        .template-btn.active {
          border-color: var(--primary);
          color: var(--primary);
          background-color: var(--primary-light);
          box-shadow: var(--shadow-sm);
        }

        .exports-action-box {
          border-top: 1px solid var(--border-color);
          padding-top: var(--space-5);
        }

        .exports-action-box p {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: var(--space-4);
        }

        .actions-vertical {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .action-export-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          justify-content: center;
        }

        .btn-clear-draft {
          margin-top: var(--space-2);
          background: none;
          border: none;
          color: var(--error);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity var(--transition-fast);
        }

        .btn-clear-draft:hover {
          opacity: 1;
          text-decoration: underline;
        }

        /* Form Footer navigation */
        .form-footer {
          border-top: 1px solid var(--border-color);
          padding: var(--space-4) var(--space-6);
          background-color: var(--bg-primary);
          display: flex;
          justify-content: space-between;
        }

        /* Preview panel styling */
        .preview-panel {
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          height: calc(100vh - 120px);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .live-badge {
          background-color: var(--success);
          color: #ffffff;
          font-weight: 700;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .preview-hint {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        /* The Live A4 Paper Box */
        .resume-a4-page {
          flex: 1;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: var(--radius-sm);
          padding: 45px;
          overflow-y: auto;
          font-family: Arial, Helvetica, sans-serif;
          color: #333333;
          line-height: 1.4;
          font-size: 13px;
        }

        /* Template Specific Styling */
        .template-modern .resume-name {
          font-family: var(--font-sans);
          font-weight: 800;
          font-size: 26px;
          color: #111827;
          margin-bottom: 2px;
          text-align: left;
        }

        .template-modern .resume-role-subtitle {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 15px;
          color: var(--primary);
          margin-bottom: 12px;
          text-align: left;
        }

        .template-modern .resume-sec-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          color: #111827;
          margin-top: 15px;
        }

        .template-modern .resume-sec-divider {
          width: 100%;
          height: 1px;
          background-color: #e5e7eb;
          margin: 4px 0 8px 0;
        }

        /* Template Elegant Specifics */
        .template-elegant {
          font-family: Georgia, serif;
          font-size: 13.5px;
        }

        .template-elegant .resume-header-block {
          text-align: center;
          border-bottom: 2px solid #374151;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }

        .template-elegant .resume-name {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: 28px;
          letter-spacing: 0.05em;
          color: #111827;
        }

        .template-elegant .resume-role-subtitle {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6b7280;
          margin-top: 4px;
        }

        .template-elegant .resume-contact-bar {
          justify-content: center;
          font-size: 11.5px;
        }

        .template-elegant .resume-sec-title {
          font-family: Georgia, serif;
          font-weight: 700;
          font-size: 14px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 20px;
        }

        .template-elegant .resume-sec-divider {
          width: 80px;
          height: 1px;
          background-color: #374151;
          margin: 6px auto 12px auto;
        }

        /* Generic Inside Styles */
        .resume-contact-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: var(--space-4);
        }

        .resume-contact-bar span {
          display: flex;
          align-items: center;
        }

        .resume-section-block {
          margin-bottom: 15px;
        }

        .resume-summary-text {
          font-size: 12.5px;
          color: #4b5563;
          text-align: justify;
        }

        .resume-item-block {
          margin-bottom: 12px;
        }

        .resume-item-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #111827;
        }

        .resume-item-dates {
          font-size: 11.5px;
          color: #6b7280;
        }

        .resume-item-location {
          font-size: 11.5px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .resume-item-desc {
          font-size: 12px;
          color: #4b5563;
          margin-top: 2px;
          white-space: pre-line;
        }

        .resume-item-tech {
          font-size: 11.5px;
          font-weight: 600;
          color: #4b5563;
        }

        .resume-skills-text {
          font-size: 12.5px;
          color: #374151;
        }

        /* Print stylesheet rule inject for browser print trigger */
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-printable-area,
          #resume-printable-area * {
            visibility: visible;
          }
          #resume-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm; /* A4 width */
            height: 297mm; /* A4 height */
            padding: 20mm;
            border: none;
            box-shadow: none;
            overflow: visible;
          }
        }

        /* Mobile responsive */
        @media (max-width: 968px) {
          .builder-grid {
            grid-template-columns: 1fr;
          }

          .preview-panel {
            position: relative;
            top: 0;
            height: auto;
            margin-top: var(--space-6);
          }

          .resume-a4-page {
            min-height: 500px;
          }
        }
      `}</style>
    </>
  );
}
