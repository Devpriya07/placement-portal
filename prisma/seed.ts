import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing existing data...");
  await prisma.application.deleteMany();
  await prisma.placementDrive.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 12);

  // ═══════════════════════════════════════════════════
  //  1. ADMIN
  // ═══════════════════════════════════════════════════
  console.log("👤 Creating Admin...");
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@placement.com",
      password: hash("admin123"),
      role: "ADMIN",
      isActive: true,
    },
  });

  // ═══════════════════════════════════════════════════
  //  2. COMPANIES (10 companies — 8 approved, 2 pending)
  // ═══════════════════════════════════════════════════
  console.log("🏢 Creating Companies...");

  const companiesData = [
    { username: "techcorp",      email: "hr@techcorp.com",           password: "company123", companyName: "TechCorp Global",       industry: "Software & Cloud Services",  hrContact: "Jane Doe (+91 9876543210)",         website: "https://techcorp.example.com",      approvalStatus: "APPROVED" },
    { username: "infosys_hr",    email: "careers@infosys.com",       password: "infosys123", companyName: "Infosys Ltd",           industry: "IT Consulting",              hrContact: "Ravi Kumar (+91 9812345670)",       website: "https://infosys.com",               approvalStatus: "APPROVED" },
    { username: "wipro_hr",      email: "recruit@wipro.com",         password: "wipro123",   companyName: "Wipro Technologies",    industry: "IT Services",                hrContact: "Meena Gupta (+91 9898765432)",      website: "https://wipro.com",                 approvalStatus: "APPROVED" },
    { username: "google_india",  email: "jobs@google.example.com",   password: "google123",  companyName: "Google India",          industry: "Technology & AI",             hrContact: "Sunita Verma (+91 9001234567)",     website: "https://careers.google.com",        approvalStatus: "APPROVED" },
    { username: "amazon_hr",     email: "campus@amazon.example.com", password: "amazon123",  companyName: "Amazon Development",    industry: "E-Commerce & Cloud (AWS)",    hrContact: "Priya Singh (+91 9112233445)",      website: "https://amazon.jobs",               approvalStatus: "APPROVED" },
    { username: "tcs_recruit",   email: "hr@tcs.example.com",        password: "tcs12345",   companyName: "Tata Consultancy Services", industry: "IT Consulting & Services", hrContact: "Anand Sharma (+91 9223344556)",    website: "https://tcs.com",                   approvalStatus: "APPROVED" },
    { username: "flipkart_hr",   email: "talent@flipkart.example.com", password: "flipkart1", companyName: "Flipkart Internet",   industry: "E-Commerce",                 hrContact: "Karan Malhotra (+91 9334455667)",   website: "https://flipkart.com",              approvalStatus: "APPROVED" },
    { username: "microsoft_in",  email: "campus@microsoft.example.com", password: "msft1234", companyName: "Microsoft India",     industry: "Software & Cloud",            hrContact: "Neha Reddy (+91 9445566778)",       website: "https://microsoft.com/careers",     approvalStatus: "APPROVED" },
    { username: "innovatelabs",  email: "contact@innovatelabs.io",   password: "startup123", companyName: "Innovate Labs",         industry: "AI & Data Science",           hrContact: "Alex Smith (+91 9123456780)",       website: "https://innovatelabs.example.com",  approvalStatus: "PENDING" },
    { username: "greentech_hr",  email: "info@greentech.example.com", password: "green1234", companyName: "GreenTech Solutions",   industry: "Renewable Energy & IoT",      hrContact: "Fatima Khan (+91 9556677889)",      website: "https://greentech.example.com",     approvalStatus: "PENDING" },
  ];

  const companyRecords: any[] = [];
  for (const c of companiesData) {
    const user = await prisma.user.create({
      data: {
        username: c.username,
        email: c.email,
        password: hash(c.password),
        role: "COMPANY",
        isActive: true,
        company: {
          create: {
            companyName: c.companyName,
            industry: c.industry,
            hrContact: c.hrContact,
            website: c.website,
            approvalStatus: c.approvalStatus,
            isBlacklisted: false,
          },
        },
      },
      include: { company: true },
    });
    companyRecords.push(user.company);
  }

  // ═══════════════════════════════════════════════════
  //  3. STUDENTS (20 students across 6 departments)
  // ═══════════════════════════════════════════════════
  console.log("🎓 Creating Students...");

  const studentsData = [
    { username: "rahul_sharma",    email: "rahul.sharma@students.edu",     password: "student123",  fullName: "Rahul Sharma",       phone: "+91 9988776655", department: "CSE", cgpa: 8.85, skills: "React, TypeScript, Next.js, Node.js, PostgreSQL" },
    { username: "priya_patel",     email: "priya.patel@students.edu",      password: "student123",  fullName: "Priya Patel",        phone: "+91 9876543210", department: "CSE", cgpa: 9.12, skills: "Python, Django, Machine Learning, TensorFlow, SQL" },
    { username: "amit_kumar",      email: "amit.kumar@students.edu",       password: "student123",  fullName: "Amit Kumar",         phone: "+91 9765432109", department: "ECE", cgpa: 7.65, skills: "Embedded C, VHDL, ARM, MATLAB, IoT" },
    { username: "sneha_gupta",     email: "sneha.gupta@students.edu",      password: "student123",  fullName: "Sneha Gupta",        phone: "+91 9654321098", department: "IT",  cgpa: 8.40, skills: "Java, Spring Boot, Microservices, Docker, Kubernetes" },
    { username: "rohan_verma",     email: "rohan.verma@students.edu",      password: "student123",  fullName: "Rohan Verma",        phone: "+91 9543210987", department: "CSE", cgpa: 7.95, skills: "C++, Data Structures, Algorithms, Competitive Programming" },
    { username: "ananya_reddy",    email: "ananya.reddy@students.edu",     password: "student123",  fullName: "Ananya Reddy",       phone: "+91 9432109876", department: "CSE", cgpa: 9.35, skills: "React, Vue.js, GraphQL, Node.js, MongoDB" },
    { username: "vikram_singh",    email: "vikram.singh@students.edu",     password: "student123",  fullName: "Vikram Singh",       phone: "+91 9321098765", department: "ME",  cgpa: 7.20, skills: "AutoCAD, SolidWorks, ANSYS, 3D Printing, Manufacturing" },
    { username: "kavitha_nair",    email: "kavitha.nair@students.edu",     password: "student123",  fullName: "Kavitha Nair",       phone: "+91 9210987654", department: "EE",  cgpa: 8.10, skills: "Power Electronics, SCADA, PLC Programming, Renewable Energy" },
    { username: "deepak_joshi",    email: "deepak.joshi@students.edu",     password: "student123",  fullName: "Deepak Joshi",       phone: "+91 9109876543", department: "CSE", cgpa: 8.55, skills: "Python, FastAPI, AWS, Docker, CI/CD, Linux" },
    { username: "meera_das",       email: "meera.das@students.edu",        password: "student123",  fullName: "Meera Das",          phone: "+91 9008765432", department: "IT",  cgpa: 8.70, skills: "Angular, TypeScript, .NET, Azure, SQL Server" },
    { username: "arjun_menon",     email: "arjun.menon@students.edu",      password: "student123",  fullName: "Arjun Menon",        phone: "+91 8987654321", department: "CSE", cgpa: 9.00, skills: "Rust, Go, Distributed Systems, gRPC, Kafka" },
    { username: "riya_banerjee",   email: "riya.banerjee@students.edu",    password: "student123",  fullName: "Riya Banerjee",      phone: "+91 8876543210", department: "ECE", cgpa: 7.80, skills: "Signal Processing, Python, MATLAB, OpenCV, Deep Learning" },
    { username: "karthik_iyer",    email: "karthik.iyer@students.edu",     password: "student123",  fullName: "Karthik Iyer",       phone: "+91 8765432109", department: "CE",  cgpa: 7.45, skills: "AutoCAD, STAAD Pro, Revit, Project Management, BIM" },
    { username: "pooja_agarwal",   email: "pooja.agarwal@students.edu",    password: "student123",  fullName: "Pooja Agarwal",      phone: "+91 8654321098", department: "CSE", cgpa: 8.90, skills: "Java, Kotlin, Android, Flutter, Firebase" },
    { username: "nikhil_rao",      email: "nikhil.rao@students.edu",       password: "student123",  fullName: "Nikhil Rao",         phone: "+91 8543210987", department: "IT",  cgpa: 8.25, skills: "PHP, Laravel, MySQL, Redis, REST APIs" },
    { username: "swati_mishra",    email: "swati.mishra@students.edu",     password: "student123",  fullName: "Swati Mishra",       phone: "+91 8432109876", department: "CSE", cgpa: 9.50, skills: "NLP, PyTorch, Transformers, Computer Vision, Research" },
    { username: "aakash_saxena",   email: "aakash.saxena@students.edu",    password: "student123",  fullName: "Aakash Saxena",      phone: "+91 8321098765", department: "ECE", cgpa: 7.35, skills: "PCB Design, Altium, Raspberry Pi, Arduino, C" },
    { username: "divya_chopra",    email: "divya.chopra@students.edu",     password: "student123",  fullName: "Divya Chopra",       phone: "+91 8210987654", department: "EE",  cgpa: 8.05, skills: "Power Systems, MATLAB, Simulink, Smart Grid, Python" },
    { username: "saurabh_yadav",   email: "saurabh.yadav@students.edu",   password: "student123",  fullName: "Saurabh Yadav",      phone: "+91 8109876543", department: "ME",  cgpa: 7.60, skills: "CATIA, Thermal Engineering, CFD, Six Sigma, Lean" },
    { username: "nidhi_saxena",    email: "nidhi.saxena@students.edu",     password: "student123",  fullName: "Nidhi Saxena",       phone: "+91 8008765432", department: "CSE", cgpa: 8.30, skills: "React Native, Swift, iOS Development, UI/UX, Figma" },
  ];

  const studentRecords: any[] = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        username: s.username,
        email: s.email,
        password: hash(s.password),
        role: "STUDENT",
        isActive: true,
        student: {
          create: {
            fullName: s.fullName,
            phone: s.phone,
            department: s.department,
            cgpa: s.cgpa,
            skills: s.skills,
            isBlacklisted: false,
          },
        },
      },
      include: { student: true },
    });
    studentRecords.push(user.student);
  }

  // ═══════════════════════════════════════════════════
  //  4. PLACEMENT DRIVES (15+ drives across companies)
  // ═══════════════════════════════════════════════════
  console.log("💼 Creating Placement Drives...");

  const now = new Date();
  const daysFromNow = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt; };
  const daysAgo = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt; };

  const drivesData = [
    // TechCorp Global (index 0)
    { companyIdx: 0, jobTitle: "Software Development Engineer (SDE-1)", jobDescription: "Design and build scalable web applications and REST APIs using modern TypeScript frameworks. Work with cross-functional teams to deliver product features.", eligibilityCriteria: "B.Tech CSE/IT/ECE with CGPA >= 7.5, no active backlogs", requiredSkills: "React, Next.js, TypeScript, REST APIs, SQL", experienceRequired: "0-1 Years (Freshers Welcome)", salaryRange: "12 LPA - 16 LPA", deadline: daysFromNow(30), status: "OPEN", createdAt: daysAgo(5) },
    { companyIdx: 0, jobTitle: "Cloud & DevOps Intern", jobDescription: "Assist in CI/CD pipeline automation, Docker containerization, and cloud infrastructure provisioning on AWS/GCP.", eligibilityCriteria: "B.Tech any branch with CGPA >= 7.0", requiredSkills: "Linux, Docker, Git, AWS/GCP fundamentals", experienceRequired: "0 Years (Final year students)", salaryRange: "6 LPA - 8 LPA", deadline: daysFromNow(45), status: "OPEN", createdAt: daysAgo(3) },

    // Infosys (index 1)
    { companyIdx: 1, jobTitle: "Systems Engineer", jobDescription: "Join our Systems Engineering team to develop enterprise-scale applications using Java and Spring Boot. Training provided through Infosys Mysore campus.", eligibilityCriteria: "B.Tech/B.E. all branches with CGPA >= 6.5", requiredSkills: "Java, OOP, SQL, Problem Solving", experienceRequired: "0 Years (Freshers)", salaryRange: "3.6 LPA - 4.5 LPA", deadline: daysFromNow(20), status: "OPEN", createdAt: daysAgo(10) },
    { companyIdx: 1, jobTitle: "Digital Specialist Engineer", jobDescription: "Work on cutting-edge projects in AI/ML, Cloud, or Full-Stack. Higher compensation and specialized training track.", eligibilityCriteria: "B.Tech CSE/IT with CGPA >= 8.0", requiredSkills: "Python, Machine Learning, Cloud, Full-Stack", experienceRequired: "0 Years", salaryRange: "6.5 LPA - 8 LPA", deadline: daysFromNow(25), status: "OPEN", createdAt: daysAgo(8) },

    // Wipro (index 2)
    { companyIdx: 2, jobTitle: "Project Engineer", jobDescription: "Software development and testing across multiple technology stacks. On-the-job training with mentorship from senior engineers.", eligibilityCriteria: "B.Tech all branches, CGPA >= 6.0, no backlogs", requiredSkills: "Programming fundamentals, SQL, Aptitude", experienceRequired: "0 Years", salaryRange: "3.5 LPA - 4.5 LPA", deadline: daysFromNow(15), status: "OPEN", createdAt: daysAgo(12) },

    // Google India (index 3)
    { companyIdx: 3, jobTitle: "Software Engineer L3 (New Grad)", jobDescription: "Design, develop, test, deploy, maintain and improve software across Google's products. Solve complex distributed systems problems at scale.", eligibilityCriteria: "B.Tech/M.Tech CSE/IT, CGPA >= 8.5", requiredSkills: "C++, Python, Data Structures, Algorithms, System Design", experienceRequired: "0-1 Years", salaryRange: "30 LPA - 45 LPA (CTC)", deadline: daysFromNow(10), status: "OPEN", createdAt: daysAgo(15) },

    // Amazon (index 4)
    { companyIdx: 4, jobTitle: "SDE-1 (Campus Hire)", jobDescription: "Build high-performance, fault-tolerant, distributed systems for Amazon's e-commerce and AWS platforms.", eligibilityCriteria: "B.Tech CSE/IT/ECE, CGPA >= 7.5", requiredSkills: "Java/C++, Data Structures, Algorithms, OOP, System Design", experienceRequired: "0 Years", salaryRange: "25 LPA - 35 LPA (CTC)", deadline: daysFromNow(12), status: "OPEN", createdAt: daysAgo(7) },
    { companyIdx: 4, jobTitle: "Data Engineer Intern", jobDescription: "Work with large-scale data pipelines, data warehousing, and analytics using AWS services like Redshift, Glue, and EMR.", eligibilityCriteria: "B.Tech CSE/IT, CGPA >= 7.0", requiredSkills: "Python, SQL, ETL, AWS basics, Spark", experienceRequired: "0 Years", salaryRange: "60K/month stipend", deadline: daysFromNow(35), status: "OPEN", createdAt: daysAgo(2) },

    // TCS (index 5)
    { companyIdx: 5, jobTitle: "TCS Ninja (Associate Engineer)", jobDescription: "Entry-level role across various domains including development, testing, support, and infrastructure management.", eligibilityCriteria: "B.Tech/B.E. all branches, 60% aggregate, no backlogs", requiredSkills: "Aptitude, Basic Programming, Communication", experienceRequired: "0 Years", salaryRange: "3.36 LPA", deadline: daysFromNow(18), status: "OPEN", createdAt: daysAgo(14) },
    { companyIdx: 5, jobTitle: "TCS Digital (IT Analyst)", jobDescription: "Premium hiring for top students. Work on emerging technologies including AI, Blockchain, IoT, and Cloud Computing.", eligibilityCriteria: "B.Tech CSE/IT/ECE, CGPA >= 8.0", requiredSkills: "Advanced Programming, Data Structures, Problem Solving", experienceRequired: "0 Years", salaryRange: "7 LPA - 9 LPA", deadline: daysFromNow(18), status: "OPEN", createdAt: daysAgo(14) },

    // Flipkart (index 6)
    { companyIdx: 6, jobTitle: "SDE-1 (Backend)", jobDescription: "Build and scale backend services powering India's largest e-commerce platform. Work with microservices, event-driven architecture.", eligibilityCriteria: "B.Tech CSE/IT, CGPA >= 8.0", requiredSkills: "Java/Go, Microservices, Distributed Systems, MySQL", experienceRequired: "0 Years", salaryRange: "20 LPA - 28 LPA", deadline: daysFromNow(22), status: "OPEN", createdAt: daysAgo(6) },

    // Microsoft (index 7)
    { companyIdx: 7, jobTitle: "Software Engineer (Full-Time)", jobDescription: "Develop features and services for Microsoft's products including Azure, Office 365, and Windows. Work in agile teams with world-class engineers.", eligibilityCriteria: "B.Tech/M.Tech CSE/IT, CGPA >= 8.0", requiredSkills: "C#/C++/Java, DSA, System Design, Problem Solving", experienceRequired: "0 Years", salaryRange: "28 LPA - 42 LPA (CTC)", deadline: daysFromNow(14), status: "OPEN", createdAt: daysAgo(9) },
    { companyIdx: 7, jobTitle: "Product Manager Intern", jobDescription: "Drive product strategy and roadmap for a Microsoft product. Work closely with engineering and design teams.", eligibilityCriteria: "B.Tech any branch + MBA or equivalent, CGPA >= 7.5", requiredSkills: "Product Thinking, Analytics, Communication, SQL", experienceRequired: "0 Years", salaryRange: "80K/month stipend", deadline: daysFromNow(40), status: "OPEN", createdAt: daysAgo(1) },

    // Closed drive (TechCorp)
    { companyIdx: 0, jobTitle: "Frontend Intern (React)", jobDescription: "6-month internship building UI components and landing pages using React and Tailwind CSS.", eligibilityCriteria: "B.Tech CSE/IT, CGPA >= 7.0", requiredSkills: "React, CSS, HTML, JavaScript", experienceRequired: "0 Years", salaryRange: "25K/month stipend", deadline: daysAgo(5), status: "CLOSED", createdAt: daysAgo(60) },
  ];

  const driveRecords: any[] = [];
  for (const d of drivesData) {
    const drive = await prisma.placementDrive.create({
      data: {
        companyId: companyRecords[d.companyIdx]!.id,
        jobTitle: d.jobTitle,
        jobDescription: d.jobDescription,
        eligibilityCriteria: d.eligibilityCriteria,
        requiredSkills: d.requiredSkills,
        experienceRequired: d.experienceRequired,
        salaryRange: d.salaryRange,
        deadline: d.deadline,
        status: d.status,
        createdAt: d.createdAt,
      },
    });
    driveRecords.push(drive);
  }

  // ═══════════════════════════════════════════════════
  //  5. APPLICATIONS (40+ applications with varied statuses)
  // ═══════════════════════════════════════════════════
  console.log("📋 Creating Applications...");

  // [studentIdx, driveIdx, status]
  const applicationsData: [number, number, string][] = [
    // TechCorp SDE-1 (drive 0) — popular drive
    [0, 0, "SHORTLISTED"],  // Rahul → TechCorp SDE-1
    [1, 0, "INTERVIEW"],    // Priya → TechCorp SDE-1
    [4, 0, "APPLIED"],      // Rohan → TechCorp SDE-1
    [5, 0, "SELECTED"],     // Ananya → TechCorp SDE-1
    [8, 0, "APPLIED"],      // Deepak → TechCorp SDE-1
    [10, 0, "SHORTLISTED"], // Arjun → TechCorp SDE-1
    [13, 0, "APPLIED"],     // Pooja → TechCorp SDE-1

    // TechCorp Cloud Intern (drive 1)
    [8, 1, "SHORTLISTED"],  // Deepak → TechCorp Cloud
    [3, 1, "APPLIED"],      // Sneha → TechCorp Cloud

    // Infosys Systems Engineer (drive 2) — mass hiring
    [4, 2, "PLACED"],       // Rohan → Infosys SE
    [6, 2, "APPLIED"],      // Vikram → Infosys SE
    [12, 2, "APPLIED"],     // Karthik → Infosys SE
    [14, 2, "SHORTLISTED"], // Nikhil → Infosys SE
    [16, 2, "APPLIED"],     // Aakash → Infosys SE
    [18, 2, "APPLIED"],     // Saurabh → Infosys SE

    // Infosys Digital Specialist (drive 3)
    [1, 3, "PLACED"],       // Priya → Infosys DSE
    [9, 3, "INTERVIEW"],    // Meera → Infosys DSE
    [0, 3, "APPLIED"],      // Rahul → Infosys DSE

    // Wipro Project Engineer (drive 4)
    [6, 4, "PLACED"],       // Vikram → Wipro PE
    [7, 4, "APPLIED"],      // Kavitha → Wipro PE
    [17, 4, "APPLIED"],     // Divya → Wipro PE
    [18, 4, "SHORTLISTED"], // Saurabh → Wipro PE

    // Google SWE L3 (drive 5) — highly competitive
    [5, 5, "INTERVIEW"],    // Ananya → Google
    [10, 5, "SELECTED"],    // Arjun → Google
    [15, 5, "INTERVIEW"],   // Swati → Google
    [0, 5, "APPLIED"],      // Rahul → Google

    // Amazon SDE-1 (drive 6)
    [0, 6, "SHORTLISTED"],  // Rahul → Amazon SDE-1
    [5, 6, "APPLIED"],      // Ananya → Amazon SDE-1
    [8, 6, "INTERVIEW"],    // Deepak → Amazon SDE-1
    [10, 6, "SHORTLISTED"], // Arjun → Amazon SDE-1
    [13, 6, "APPLIED"],     // Pooja → Amazon SDE-1

    // Amazon Data Engineer Intern (drive 7)
    [1, 7, "APPLIED"],      // Priya → Amazon DE Intern
    [11, 7, "APPLIED"],     // Riya → Amazon DE Intern
    [15, 7, "SHORTLISTED"], // Swati → Amazon DE Intern

    // TCS Ninja (drive 8) — mass hiring
    [2, 8, "PLACED"],       // Amit → TCS Ninja
    [7, 8, "PLACED"],       // Kavitha → TCS Ninja
    [12, 8, "APPLIED"],     // Karthik → TCS Ninja
    [16, 8, "SHORTLISTED"], // Aakash → TCS Ninja
    [17, 8, "APPLIED"],     // Divya → TCS Ninja

    // TCS Digital (drive 9)
    [3, 9, "SELECTED"],     // Sneha → TCS Digital
    [9, 9, "SHORTLISTED"],  // Meera → TCS Digital
    [14, 9, "APPLIED"],     // Nikhil → TCS Digital

    // Flipkart SDE-1 (drive 10)
    [10, 10, "INTERVIEW"],  // Arjun → Flipkart
    [8, 10, "APPLIED"],     // Deepak → Flipkart
    [19, 10, "APPLIED"],    // Nidhi → Flipkart

    // Microsoft SWE (drive 11)
    [15, 11, "PLACED"],     // Swati → Microsoft
    [5, 11, "SHORTLISTED"], // Ananya → Microsoft
    [10, 11, "APPLIED"],    // Arjun → Microsoft
    [0, 11, "APPLIED"],     // Rahul → Microsoft

    // Microsoft PM Intern (drive 12)
    [19, 12, "APPLIED"],    // Nidhi → Microsoft PM Intern
    [9, 12, "APPLIED"],     // Meera → Microsoft PM Intern

    // Closed drive — TechCorp Frontend Intern (drive 13)
    [19, 13, "PLACED"],     // Nidhi → TechCorp Frontend Intern (completed)
    [13, 13, "APPLIED"],    // Pooja → TechCorp Frontend Intern (not selected)
  ];

  for (const [sIdx, dIdx, status] of applicationsData) {
    await prisma.application.create({
      data: {
        studentId: studentRecords[sIdx]!.id,
        driveId: driveRecords[dIdx]!.id,
        status: status,
        appliedAt: new Date(
          now.getTime() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)
        ),
      },
    });
  }

  // ═══════════════════════════════════════════════════
  //  Summary
  // ═══════════════════════════════════════════════════
  const counts = {
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    companies: await prisma.company.count(),
    drives: await prisma.placementDrive.count(),
    applications: await prisma.application.count(),
  };

  console.log("\n✅ Seeding complete!");
  console.log("═══════════════════════════════════════");
  console.log(`  Users:        ${counts.users}`);
  console.log(`  Students:     ${counts.students}`);
  console.log(`  Companies:    ${counts.companies}`);
  console.log(`  Drives:       ${counts.drives}`);
  console.log(`  Applications: ${counts.applications}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
