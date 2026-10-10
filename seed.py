"""
Seed script — Populates the database using raw SQL INSERT statements.
Run: python seed.py
"""
import os, sys
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(__file__))
from app import app, db

def seed():
    with app.app_context():
        # Skip if data already exists
        count = db.session.execute(text("SELECT COUNT(*) FROM student")).scalar()
        if count > 0:
            print("Database already has data. Delete placement_portal.db and re-run to reseed.")
            return

        print("Seeding database with raw SQL INSERTs...\n")
        now = datetime.utcnow()

        # ── INSERT Students ──
        students = [
            ("rahul_sharma",  "rahul@student.com",   "Rahul Sharma",   "9876543210", "CS",   8.5,  "Python, Java, SQL, Machine Learning"),
            ("priya_verma",   "priya@student.com",   "Priya Verma",    "9876543211", "CS",   9.1,  "React, Node.js, MongoDB, TypeScript"),
            ("amit_patel",    "amit@student.com",    "Amit Patel",     "9876543212", "IT",   7.8,  "Java, Spring Boot, MySQL, Docker"),
            ("sneha_reddy",   "sneha@student.com",   "Sneha Reddy",    "9876543213", "ECE",  8.2,  "Embedded C, VHDL, IoT, Arduino"),
            ("vikram_singh",  "vikram@student.com",  "Vikram Singh",   "9876543214", "MECH", 7.5,  "AutoCAD, SolidWorks, MATLAB"),
            ("ananya_gupta",  "ananya@student.com",  "Ananya Gupta",   "9876543215", "CS",   9.4,  "Python, Django, AWS, Kubernetes"),
            ("rohan_kumar",   "rohan@student.com",   "Rohan Kumar",    "9876543216", "IT",   8.0,  "Angular, .NET, Azure, SQL Server"),
            ("deepika_nair",  "deepika@student.com", "Deepika Nair",   "9876543217", "EEE",  8.7,  "Power Systems, PLC, SCADA"),
            ("arjun_menon",   "arjun@student.com",   "Arjun Menon",    "9876543218", "CS",   7.2,  "C++, Data Structures, Algorithms"),
            ("kavya_iyer",    "kavya@student.com",   "Kavya Iyer",     "9876543219", "IT",   8.9,  "Flutter, Dart, Firebase, REST APIs"),
        ]

        pw_student = generate_password_hash("student123")
        for username, email, full_name, phone, dept, cgpa, skills in students:
            db.session.execute(text(
                "INSERT INTO user (username, email, password, role, is_active_user, created_at) "
                "VALUES (:u, :e, :p, 'student', 1, :now)"
            ), {"u": username, "e": email, "p": pw_student, "now": now})
            db.session.commit()

            user_id = db.session.execute(
                text("SELECT id FROM user WHERE username = :u"), {"u": username}
            ).scalar()

            db.session.execute(text(
                "INSERT INTO student (user_id, full_name, phone, department, cgpa, skills, is_blacklisted) "
                "VALUES (:uid, :fn, :ph, :dept, :cgpa, :sk, 0)"
            ), {"uid": user_id, "fn": full_name, "ph": phone, "dept": dept, "cgpa": cgpa, "sk": skills})
            db.session.commit()

        print(f"  INSERT INTO student — {len(students)} rows  (password: student123)")

        # ── INSERT Companies ──
        companies = [
            ("tcs_hr",      "hr@tcs.com",      "TCS",                "IT Services", "Rajesh Kumar",  "https://www.tcs.com",       "approved"),
            ("infosys_hr",  "hr@infosys.com",  "Infosys",            "IT Services", "Meena Rao",     "https://www.infosys.com",   "approved"),
            ("google_hr",   "hr@google.com",   "Google India",       "Technology",  "Sarah Chen",    "https://careers.google.com","approved"),
            ("wipro_hr",    "hr@wipro.com",    "Wipro",              "IT Services", "Anil Mehta",    "https://www.wipro.com",     "approved"),
            ("startupx_hr", "hr@startupx.com", "StartupX Solutions", "Fintech",     "Kiran Das",     "https://www.startupx.io",   "pending"),
        ]

        pw_company = generate_password_hash("company123")
        for username, email, name, industry, hr, website, status in companies:
            db.session.execute(text(
                "INSERT INTO user (username, email, password, role, is_active_user, created_at) "
                "VALUES (:u, :e, :p, 'company', 1, :now)"
            ), {"u": username, "e": email, "p": pw_company, "now": now})
            db.session.commit()

            user_id = db.session.execute(
                text("SELECT id FROM user WHERE username = :u"), {"u": username}
            ).scalar()

            db.session.execute(text(
                "INSERT INTO company (user_id, company_name, industry, hr_contact, website, approval_status, is_blacklisted) "
                "VALUES (:uid, :cn, :ind, :hr, :web, :st, 0)"
            ), {"uid": user_id, "cn": name, "ind": industry, "hr": hr, "web": website, "st": status})
            db.session.commit()

        print(f"  INSERT INTO company — {len(companies)} rows  (password: company123)")

        # ── Get IDs for FK references ──
        student_ids = [r.id for r in db.session.execute(text(
            "SELECT id FROM student ORDER BY id"
        )).fetchall()]

        company_ids = [r.id for r in db.session.execute(text(
            "SELECT id FROM company ORDER BY id"
        )).fetchall()]

        # ── INSERT Placement Drives ──
        drives = [
            (company_ids[0], "Software Developer",       "Develop enterprise Java applications.",                "B.Tech CS/IT, CGPA >= 7.0", "Java, Spring Boot, SQL",                   "0-1 years", "3.5 - 5.0 LPA", 30,  "open"),
            (company_ids[0], "Data Analyst",             "Analyze large datasets for business insights.",        "B.Tech any, CGPA >= 7.5",   "Python, SQL, Tableau, Excel",              "0 years",   "4.0 - 5.5 LPA", 20,  "open"),
            (company_ids[1], "Systems Engineer",         "Join Infosys training program for global projects.",   "B.Tech CS/IT/ECE, CGPA >= 6.5", "Java, Python, SQL",                    "Fresher",   "3.6 LPA",        25,  "open"),
            (company_ids[2], "SDE Intern",               "Work on Google-scale distributed systems.",            "B.Tech CS, CGPA >= 8.5",   "Python, C++, Data Structures, Algorithms", "0 years",   "12.0 - 18.0 LPA",15,  "open"),
            (company_ids[2], "Cloud Engineer",           "Design cloud infrastructure on GCP.",                  "B.Tech CS/IT, CGPA >= 8.0","GCP, Kubernetes, Docker, Terraform",       "0-1 years", "14.0 - 20.0 LPA",10,  "open"),
            (company_ids[3], "Full Stack Developer",     "Build web apps for digital transformation clients.",   "B.Tech CS/IT, CGPA >= 7.0","React, Node.js, MongoDB",                 "Fresher",   "3.8 - 5.0 LPA", 18,  "open"),
            (company_ids[0], "DevOps Engineer (Closed)", "CI/CD pipelines and cloud infrastructure.",            "B.Tech CS/IT, CGPA >= 7.5","AWS, Jenkins, Docker, Linux",              "0-1 years", "5.0 - 7.0 LPA", -10, "closed"),
        ]

        for cid, title, desc, criteria, skills, exp, salary, dl_days, status in drives:
            db.session.execute(text(
                "INSERT INTO placement_drive "
                "(company_id, job_title, job_description, eligibility_criteria, required_skills, "
                " experience_required, salary_range, deadline, status, created_at) "
                "VALUES (:cid, :jt, :jd, :ec, :rs, :er, :sr, :dl, :st, :ca)"
            ), {"cid": cid, "jt": title, "jd": desc, "ec": criteria, "rs": skills,
                "er": exp, "sr": salary,
                "dl": now + timedelta(days=dl_days),
                "st": status,
                "ca": now - timedelta(days=max(0, 30 - dl_days))})
        db.session.commit()

        print(f"  INSERT INTO placement_drive — {len(drives)} rows")

        # ── Get drive IDs ──
        drive_ids = [r.id for r in db.session.execute(text(
            "SELECT id FROM placement_drive ORDER BY id"
        )).fetchall()]

        # ── INSERT Applications ──
        applications = [
            # (student_index, drive_index, status, days_ago)
            (0, 0, "Shortlisted", 5),
            (2, 0, "Interview",   5),
            (6, 0, "Applied",     3),
            (5, 1, "Selected",    4),
            (0, 1, "Applied",     2),
            (2, 2, "Applied",     6),
            (8, 2, "Applied",     4),
            (3, 2, "Shortlisted", 6),
            (5, 3, "Interview",   3),
            (1, 3, "Shortlisted", 3),
            (1, 5, "Applied",     2),
            (9, 5, "Applied",     1),
            (0, 6, "Placed",      15),
            (5, 6, "Placed",      15),
            (2, 6, "Selected",    15),
        ]

        for s_idx, d_idx, status, days_ago in applications:
            db.session.execute(text(
                "INSERT INTO application (student_id, drive_id, status, applied_at) "
                "VALUES (:sid, :did, :st, :at)"
            ), {"sid": student_ids[s_idx], "did": drive_ids[d_idx],
                "st": status, "at": now - timedelta(days=days_ago)})
        db.session.commit()

        print(f"  INSERT INTO application — {len(applications)} rows")

        print("\nDone! Database seeded successfully!\n")
        print("Login credentials:")
        print("  Admin:     admin / admin123")
        print("  Students:  rahul_sharma / student123  (and 9 others)")
        print("  Companies: tcs_hr / company123  (and 4 others)")
        print("  Pending:   startupx_hr / company123  (awaiting approval)")

if __name__ == "__main__":
    seed()
