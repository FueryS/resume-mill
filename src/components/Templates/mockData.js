/**
 * src/components/Templates/mockData.js
 * 
 * Purpose:
 * Stores highly professional mockup profile data for resume rendering.
 * Used during previewing or to dynamically fill in empty sections when
 * the user toggles "Use Placeholders".
 */

export const mockResumeData = {
  personal: {
    fullName: "Alex Rivera",
    role: "Senior Software Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    github: "github.com/alexrivera",
    linkedin: "linkedin.com/in/alex-rivera",
    summary: "Innovative Senior Software Engineer with 6+ years of experience leading cross-functional teams to build scalable cloud architectures and modern web applications. Expert in React, Next.js, and automated deployment pipelines, with a proven track record of reducing API latencies by 40%."
  },
  experience: [
    {
      id: "1",
      company: "TechNova Solutions",
      role: "Lead Software Architect",
      location: "San Francisco, CA",
      startDate: "Jan 2023",
      endDate: "Present",
      current: true,
      description: "Architected microservices infrastructure handling 5M+ daily requests using Next.js, Node.js, and AWS ECS. Mentored 8 junior developers and implemented CI/CD pipelines, slashing development-to-deployment times by 35%."
    },
    {
      id: "2",
      company: "PixelCraft Studios",
      role: "Full Stack Engineer",
      location: "Austin, TX",
      startDate: "Mar 2020",
      endDate: "Dec 2022",
      current: false,
      description: "Designed and optimized user-facing dashboards with React and Redux, improving user retention rate by 18%. Refactored PostgreSQL databases, boosting query efficiency and lowering server load by 25%."
    }
  ],
  projects: [
    {
      id: "1",
      name: "Gemini Resume Architect",
      description: "An AI-powered document optimizer that rewrites resume bullets based on keyword densities for applicant tracking systems.",
      technologies: "React, Gemini AI, Node.js, HSL CSS",
      link: "https://resumemill.vercel.app"
    },
    {
      id: "2",
      name: "VeloCloud Distributed DB",
      description: "Lightweight, event-driven in-memory key-value database built in Go, implementing Raft consensus for high availability.",
      technologies: "Go, Raft Protocol, Docker, gRPC",
      link: "https://github.com/alexrivera/velocloud"
    }
  ],
  education: [
    {
      id: "1",
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      location: "Stanford, CA",
      startDate: "2016",
      endDate: "2020",
      grade: "3.8 GPA"
    }
  ],
  skills: "React, Next.js, JavaScript (ES6+), Node.js, Python, AWS, Docker, Git, REST APIs, SQL, Agile Methods, CI/CD"
};
