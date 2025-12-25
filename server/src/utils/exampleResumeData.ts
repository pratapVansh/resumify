/**
 * Example Resume Data
 * This file contains sample resume data to help understand the structure
 */

export const exampleResume = {
  title: "Full Stack Developer Resume",
  
  personalInfo: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@email.com",
    phone: "+1-555-123-4567",
    location: "New York, NY",
    website: "https://janesmith.dev",
    linkedin: "https://linkedin.com/in/janesmith",
    github: "https://github.com/janesmith"
  },
  
  summary: "Results-driven Full Stack Developer with 6+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-quality software solutions.",
  
  experience: [
    {
      company: "TechCorp Solutions",
      position: "Senior Full Stack Developer",
      location: "New York, NY",
      startDate: new Date("2021-03-01"),
      endDate: new Date("2024-12-01"),
      current: false,
      description: "Led the development of enterprise-level web applications serving 100K+ users. Architected and implemented microservices infrastructure using Node.js and Docker.",
      achievements: [
        "Reduced page load time by 60% through optimization techniques",
        "Mentored 8 junior developers and conducted code reviews",
        "Implemented CI/CD pipeline reducing deployment time by 75%",
        "Led migration from monolith to microservices architecture"
      ]
    },
    {
      company: "StartupXYZ",
      position: "Full Stack Developer",
      location: "San Francisco, CA",
      startDate: new Date("2019-01-15"),
      endDate: new Date("2021-02-28"),
      current: false,
      description: "Developed and maintained customer-facing web applications using React and Express. Collaborated with product team to implement new features.",
      achievements: [
        "Built real-time chat feature serving 50K+ daily active users",
        "Improved test coverage from 40% to 85%",
        "Implemented responsive design increasing mobile traffic by 120%"
      ]
    },
    {
      company: "Digital Agency Inc",
      position: "Junior Web Developer",
      location: "Boston, MA",
      startDate: new Date("2017-06-01"),
      endDate: new Date("2018-12-31"),
      current: false,
      description: "Developed client websites and maintained existing web applications. Worked with designers to implement pixel-perfect UI components.",
      achievements: [
        "Delivered 20+ client projects on time and within budget",
        "Implemented automated testing reducing bugs by 40%"
      ]
    }
  ],
  
  education: [
    {
      institution: "Massachusetts Institute of Technology",
      degree: "Master of Science",
      field: "Computer Science",
      location: "Cambridge, MA",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2017-05-31"),
      current: false,
      gpa: "3.9",
      achievements: [
        "Teaching Assistant for Advanced Algorithms course",
        "Published research paper on distributed systems",
        "Dean's List all semesters"
      ]
    },
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Berkeley, CA",
      startDate: new Date("2011-09-01"),
      endDate: new Date("2015-05-31"),
      current: false,
      gpa: "3.7",
      achievements: [
        "Summa Cum Laude",
        "CS Department Honors",
        "Hackathon Winner 2014"
      ]
    }
  ],
  
  projects: [
    {
      name: "Open Source Task Manager",
      description: "Built a collaborative task management application with real-time synchronization across devices. Features include drag-and-drop interface, team collaboration, and analytics dashboard.",
      technologies: [
        "React",
        "TypeScript",
        "Node.js",
        "MongoDB",
        "Socket.io",
        "AWS"
      ],
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-08-31"),
      url: "https://taskmaster-app.com",
      github: "https://github.com/janesmith/taskmaster",
      highlights: [
        "1000+ GitHub stars",
        "Featured on Product Hunt",
        "Used by 10K+ teams worldwide",
        "Published npm package with 50K+ downloads"
      ]
    },
    {
      name: "AI Code Review Assistant",
      description: "Developed an AI-powered code review tool that provides automated feedback on pull requests. Uses machine learning to detect code smells and suggest improvements.",
      technologies: [
        "Python",
        "TensorFlow",
        "FastAPI",
        "React",
        "PostgreSQL"
      ],
      startDate: new Date("2022-06-01"),
      endDate: new Date("2022-12-31"),
      url: "https://codereview-ai.dev",
      github: "https://github.com/janesmith/code-review-ai",
      highlights: [
        "Achieved 85% accuracy in detecting code issues",
        "Integrated with GitHub and GitLab",
        "500+ active users"
      ]
    },
    {
      name: "E-commerce Platform",
      description: "Full-featured e-commerce platform with payment processing, inventory management, and admin dashboard.",
      technologies: [
        "Next.js",
        "Stripe",
        "Prisma",
        "PostgreSQL",
        "Tailwind CSS"
      ],
      startDate: new Date("2021-09-01"),
      endDate: new Date("2022-03-31"),
      url: "https://shop-demo.com",
      github: "https://github.com/janesmith/ecommerce-platform",
      highlights: [
        "Handles 1000+ daily transactions",
        "99.9% uptime",
        "Integrated with multiple payment gateways"
      ]
    }
  ],
  
  skills: [
    // Frontend
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue.js",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "Redux",
    
    // Backend
    "Node.js",
    "Express",
    "Python",
    "Django",
    "FastAPI",
    "GraphQL",
    "REST APIs",
    
    // Databases
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    
    // Cloud & DevOps
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "GitHub Actions",
    "Terraform",
    
    // Tools & Others
    "Git",
    "Jest",
    "Cypress",
    "Webpack",
    "Vite",
    "Agile/Scrum"
  ],
  
  languages: [
    "English (Native)",
    "Spanish (Professional Working Proficiency)",
    "Mandarin (Elementary)"
  ],
  
  certifications: [
    "AWS Certified Solutions Architect - Associate (2023)",
    "Google Cloud Professional Cloud Architect (2022)",
    "MongoDB Certified Developer (2021)",
    "Certified Kubernetes Administrator (CKA) (2023)"
  ],
  
  visibility: "private",
  
  templateSettings: {
    template: "modern",
    primaryColor: "#3B82F6",  // Blue
    fontSize: "medium",
    spacing: "normal",
    font: "sans-serif"
  }
};

/**
 * Minimal Resume Example
 * Minimum required fields to create a resume
 */
export const minimalResume = {
  title: "My Resume",
  
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com"
  },
  
  // All other fields are optional
  skills: ["JavaScript", "React"]
};

/**
 * Template Color Suggestions
 */
export const templateColors = {
  blue: "#3B82F6",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  red: "#EF4444",
  orange: "#F97316",
  yellow: "#EAB308",
  green: "#10B981",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  gray: "#6B7280",
  slate: "#64748B"
};

/**
 * Current Position Example
 * Shows how to mark a position as current
 */
export const currentPositionExample = {
  company: "Current Company",
  position: "Software Engineer",
  location: "Remote",
  startDate: new Date("2024-01-01"),
  endDate: undefined,  // No end date
  current: true,       // Currently working here
  description: "Working on exciting projects...",
  achievements: []
};
