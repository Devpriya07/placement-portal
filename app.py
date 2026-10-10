"""
Placement Portal — Main Application
All database operations use raw SQL queries via db.session.execute(text(...))
"""
import os
import json
from types import SimpleNamespace
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import text
from datetime import datetime
from models import db, User
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'warning'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.context_processor
def inject_now():
    return {'now': datetime.now}

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ══════════════════════════════════════════════════════════════
#  HELPERS — Convert raw SQL rows to objects for templates
# ══════════════════════════════════════════════════════════════

def parse_dt(val):
    """Parse datetime values from SQLite (stored as strings)."""
    if val is None or isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val))
    except (ValueError, TypeError):
        return val

def to_obj(row):
    """Convert a single DB row to a SimpleNamespace (dot-notation access)."""
    if row is None:
        return None
    d = dict(row._mapping)
    for key in ('created_at', 'applied_at', 'deadline'):
        if key in d:
            d[key] = parse_dt(d[key])
    return SimpleNamespace(**d)

def to_list(result):
    """Convert all rows from a query result to a list of SimpleNamespace objects."""
    return [to_obj(row) for row in result]

def _make_user(row):
    """After verifying credentials with raw SQL, load the User via ORM for Flask-Login."""
    if not row:
        return None
    return db.session.get(User, row.id)


# ══════════════════════════════════════════════════════════════
#  FLASK-LOGIN: Load user from session
# ══════════════════════════════════════════════════════════════

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID — Flask-Login requires a proper User model instance."""
    return db.session.get(User, int(user_id))


# ══════════════════════════════════════════════════════════════
#  RBAC DECORATORS
# ══════════════════════════════════════════════════════════════

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if current_user.role != 'admin':
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def company_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if current_user.role != 'company':
            flash('Access denied. Company account required.', 'danger')
            return redirect(url_for('login'))
        row = db.session.execute(
            text("SELECT approval_status, is_blacklisted FROM company WHERE user_id = :uid"),
            {"uid": current_user.id}
        ).fetchone()
        if not row or row.approval_status != 'approved':
            flash('Your company account is pending approval or has been rejected.', 'warning')
            return redirect(url_for('company_pending'))
        if row.is_blacklisted:
            flash('Your company account has been blacklisted. Contact admin.', 'danger')
            return redirect(url_for('logout'))
        return f(*args, **kwargs)
    return decorated

def student_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if current_user.role != 'student':
            flash('Access denied. Student account required.', 'danger')
            return redirect(url_for('login'))
        row = db.session.execute(
            text("SELECT is_blacklisted FROM student WHERE user_id = :uid"),
            {"uid": current_user.id}
        ).fetchone()
        if row and row.is_blacklisted:
            flash('Your account has been blacklisted. Contact admin.', 'danger')
            return redirect(url_for('logout'))
        return f(*args, **kwargs)
    return decorated


# ══════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        row = db.session.execute(
            text("SELECT id, username, email, password, role, is_active_user, created_at "
                 "FROM user WHERE username = :u"),
            {"u": username}
        ).fetchone()

        if row and check_password_hash(row.password, password):
            if not row.is_active_user:
                flash('Account is inactive.', 'danger')
                return redirect(url_for('login'))
            user = _make_user(row)
            login_user(user)
            if user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif user.role == 'company':
                return redirect(url_for('company_dashboard'))
            elif user.role == 'student':
                return redirect(url_for('student_dashboard'))
        flash('Invalid username or password.', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')
        company_name = request.form.get('company_name')

        # Check if username already exists
        exists = db.session.execute(
            text("SELECT id FROM user WHERE username = :u"), {"u": username}
        ).fetchone()
        if exists:
            flash('Username already exists.', 'danger')
            return redirect(url_for('register'))

        # Check if email already exists
        exists = db.session.execute(
            text("SELECT id FROM user WHERE email = :e"), {"e": email}
        ).fetchone()
        if exists:
            flash('Email already exists.', 'danger')
            return redirect(url_for('register'))

        # INSERT new user
        db.session.execute(
            text("INSERT INTO user (username, email, password, role, is_active_user, created_at) "
                 "VALUES (:u, :e, :p, :r, 1, :now)"),
            {"u": username, "e": email, "p": generate_password_hash(password),
             "r": role, "now": datetime.utcnow()}
        )
        db.session.commit()

        # Get the new user's ID
        user_id = db.session.execute(
            text("SELECT id FROM user WHERE username = :u"), {"u": username}
        ).scalar()

        # Create role-specific profile
        if role == 'student':
            db.session.execute(
                text("INSERT INTO student (user_id, full_name, is_blacklisted) VALUES (:uid, :name, 0)"),
                {"uid": user_id, "name": username}
            )
        elif role == 'company':
            db.session.execute(
                text("INSERT INTO company (user_id, company_name, approval_status, is_blacklisted) "
                     "VALUES (:uid, :name, 'pending', 0)"),
                {"uid": user_id, "name": company_name or username}
            )
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('login'))

@app.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin_dashboard'))
        elif current_user.role == 'company':
            return redirect(url_for('company_dashboard'))
        elif current_user.role == 'student':
            return redirect(url_for('student_dashboard'))
    return redirect(url_for('login'))


# ══════════════════════════════════════════════════════════════
#  ADMIN ROUTES
# ══════════════════════════════════════════════════════════════

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    # Aggregate stats using SQL COUNT
    total_students   = db.session.execute(text("SELECT COUNT(*) FROM student")).scalar()
    total_companies  = db.session.execute(text("SELECT COUNT(*) FROM company")).scalar()
    total_drives     = db.session.execute(text("SELECT COUNT(*) FROM placement_drive")).scalar()
    total_applications = db.session.execute(text("SELECT COUNT(*) FROM application")).scalar()
    total_placed     = db.session.execute(text("SELECT COUNT(*) FROM application WHERE status = 'Placed'")).scalar()

    # Department-wise placement data using GROUP BY
    dept_rows = db.session.execute(text(
        "SELECT s.department, COUNT(*) as cnt "
        "FROM application a "
        "JOIN student s ON a.student_id = s.id "
        "WHERE a.status = 'Placed' AND s.department IS NOT NULL "
        "GROUP BY s.department"
    )).fetchall()
    dept_labels = json.dumps([r.department for r in dept_rows])
    dept_values = json.dumps([r.cnt for r in dept_rows])

    # Application status distribution using GROUP BY
    status_rows = db.session.execute(text(
        "SELECT status, COUNT(*) as cnt FROM application GROUP BY status"
    )).fetchall()
    status_labels = json.dumps([r.status for r in status_rows])
    status_values = json.dumps([r.cnt for r in status_rows])

    return render_template('admin/dashboard.html',
                           total_students=total_students,
                           total_companies=total_companies,
                           total_drives=total_drives,
                           total_applications=total_applications,
                           total_placed=total_placed,
                           dept_labels=dept_labels,
                           dept_values=dept_values,
                           status_labels=status_labels,
                           status_values=status_values)

@app.route('/admin/companies')
@admin_required
def admin_companies():
    search = request.args.get('search', '')

    if search:
        rows = db.session.execute(text(
            "SELECT c.id, c.company_name, c.industry, c.hr_contact, c.website, "
            "       c.approval_status, c.is_blacklisted, u.email "
            "FROM company c JOIN user u ON c.user_id = u.id "
            "WHERE c.company_name LIKE :s"),
            {"s": f"%{search}%"}
        ).fetchall()
    else:
        rows = db.session.execute(text(
            "SELECT c.id, c.company_name, c.industry, c.hr_contact, c.website, "
            "       c.approval_status, c.is_blacklisted, u.email "
            "FROM company c JOIN user u ON c.user_id = u.id"
        )).fetchall()

    # Build nested objects so template can use company.user.email
    companies = []
    for r in rows:
        companies.append(SimpleNamespace(
            id=r.id, company_name=r.company_name, industry=r.industry,
            hr_contact=r.hr_contact, website=r.website,
            approval_status=r.approval_status, is_blacklisted=r.is_blacklisted,
            user=SimpleNamespace(email=r.email)
        ))
    return render_template('admin/companies.html', companies=companies, search=search)

@app.route('/admin/companies/<int:id>/approve', methods=['POST'])
@admin_required
def admin_approve_company(id):
    db.session.execute(
        text("UPDATE company SET approval_status = 'approved' WHERE id = :id"), {"id": id}
    )
    db.session.commit()
    flash('Company approved.', 'success')
    return redirect(url_for('admin_companies'))

@app.route('/admin/companies/<int:id>/reject', methods=['POST'])
@admin_required
def admin_reject_company(id):
    db.session.execute(
        text("UPDATE company SET approval_status = 'rejected' WHERE id = :id"), {"id": id}
    )
    db.session.commit()
    flash('Company rejected.', 'success')
    return redirect(url_for('admin_companies'))

@app.route('/admin/companies/<int:id>/blacklist', methods=['POST'])
@admin_required
def admin_blacklist_company(id):
    # Toggle blacklist status using SQL CASE
    db.session.execute(text(
        "UPDATE company SET is_blacklisted = CASE WHEN is_blacklisted = 1 THEN 0 ELSE 1 END "
        "WHERE id = :id"), {"id": id}
    )
    db.session.commit()
    row = db.session.execute(text("SELECT is_blacklisted FROM company WHERE id = :id"), {"id": id}).fetchone()
    status = 'blacklisted' if row.is_blacklisted else 'whitelisted'
    flash(f'Company {status}.', 'success')
    return redirect(url_for('admin_companies'))

@app.route('/admin/students')
@admin_required
def admin_students():
    search = request.args.get('search', '')

    if search:
        rows = db.session.execute(text(
            "SELECT s.id, s.full_name, s.phone, s.department, s.cgpa, s.is_blacklisted, "
            "       u.username, u.email "
            "FROM student s JOIN user u ON s.user_id = u.id "
            "WHERE s.full_name LIKE :s OR s.department LIKE :s"),
            {"s": f"%{search}%"}
        ).fetchall()
    else:
        rows = db.session.execute(text(
            "SELECT s.id, s.full_name, s.phone, s.department, s.cgpa, s.is_blacklisted, "
            "       u.username, u.email "
            "FROM student s JOIN user u ON s.user_id = u.id"
        )).fetchall()

    students = []
    for r in rows:
        students.append(SimpleNamespace(
            id=r.id, full_name=r.full_name, phone=r.phone,
            department=r.department, cgpa=r.cgpa, is_blacklisted=r.is_blacklisted,
            user=SimpleNamespace(username=r.username, email=r.email)
        ))
    return render_template('admin/students.html', students=students, search=search)

@app.route('/admin/students/<int:id>/blacklist', methods=['POST'])
@admin_required
def admin_blacklist_student(id):
    db.session.execute(text(
        "UPDATE student SET is_blacklisted = CASE WHEN is_blacklisted = 1 THEN 0 ELSE 1 END "
        "WHERE id = :id"), {"id": id}
    )
    db.session.commit()
    row = db.session.execute(text("SELECT is_blacklisted FROM student WHERE id = :id"), {"id": id}).fetchone()
    status = 'blacklisted' if row.is_blacklisted else 'whitelisted'
    flash(f'Student {status}.', 'success')
    return redirect(url_for('admin_students'))

@app.route('/admin/applications')
@admin_required
def admin_applications():
    status_filter = request.args.get('status', '')

    sql = ("SELECT a.id, a.applied_at, a.status, "
           "       s.full_name AS student_name, "
           "       d.job_title, c.company_name "
           "FROM application a "
           "JOIN student s ON a.student_id = s.id "
           "JOIN placement_drive d ON a.drive_id = d.id "
           "JOIN company c ON d.company_id = c.id")
    params = {}
    if status_filter:
        sql += " WHERE a.status = :st"
        params["st"] = status_filter

    rows = db.session.execute(text(sql), params).fetchall()

    applications = []
    for r in rows:
        applications.append(SimpleNamespace(
            id=r.id, applied_at=parse_dt(r.applied_at), status=r.status,
            student=SimpleNamespace(full_name=r.student_name),
            drive=SimpleNamespace(job_title=r.job_title,
                                  company=SimpleNamespace(company_name=r.company_name))
        ))
    return render_template('admin/applications.html', applications=applications, status_filter=status_filter)

@app.route('/admin/drives')
@admin_required
def admin_drives():
    rows = db.session.execute(text(
        "SELECT d.id, d.job_title, d.salary_range, d.deadline, d.status, d.created_at, "
        "       c.company_name, "
        "       (SELECT COUNT(*) FROM application WHERE drive_id = d.id) AS app_count "
        "FROM placement_drive d "
        "JOIN company c ON d.company_id = c.id"
    )).fetchall()

    drives = []
    for r in rows:
        drives.append(SimpleNamespace(
            id=r.id, job_title=r.job_title, salary_range=r.salary_range,
            deadline=parse_dt(r.deadline), status=r.status,
            created_at=parse_dt(r.created_at), app_count=r.app_count,
            company=SimpleNamespace(company_name=r.company_name)
        ))
    return render_template('admin/drives.html', drives=drives)


# ══════════════════════════════════════════════════════════════
#  COMPANY ROUTES
# ══════════════════════════════════════════════════════════════

@app.route('/company/profile', methods=['GET', 'POST'])
@company_required
def company_profile():
    if request.method == 'POST':
        db.session.execute(text(
            "UPDATE company SET company_name = :cn, industry = :ind, hr_contact = :hr, website = :web "
            "WHERE user_id = :uid"),
            {"cn": request.form.get('company_name'), "ind": request.form.get('industry'),
             "hr": request.form.get('hr_contact'), "web": request.form.get('website'),
             "uid": current_user.id}
        )
        db.session.commit()
        flash('Company profile updated.', 'success')
        return redirect(url_for('company_profile'))

    company = to_obj(db.session.execute(text(
        "SELECT * FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())
    return render_template('company/profile.html', company=company)

@app.route('/company/pending')
@login_required
def company_pending():
    company = to_obj(db.session.execute(text(
        "SELECT * FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())
    return render_template('company/pending.html', company=company)

@app.route('/company/dashboard')
@company_required
def company_dashboard():
    company = to_obj(db.session.execute(text(
        "SELECT * FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    total_drives = db.session.execute(text(
        "SELECT COUNT(*) FROM placement_drive WHERE company_id = :cid"), {"cid": company.id}
    ).scalar()

    active_drives = db.session.execute(text(
        "SELECT COUNT(*) FROM placement_drive WHERE company_id = :cid AND status = 'open'"),
        {"cid": company.id}
    ).scalar()

    total_applicants = db.session.execute(text(
        "SELECT COUNT(*) FROM application a "
        "JOIN placement_drive d ON a.drive_id = d.id "
        "WHERE d.company_id = :cid"),
        {"cid": company.id}
    ).scalar()

    return render_template('company/dashboard.html', company=company,
                           total_drives=total_drives, active_drives=active_drives,
                           total_applicants=total_applicants)

@app.route('/company/drives')
@company_required
def company_drives():
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    rows = db.session.execute(text(
        "SELECT d.*, "
        "       (SELECT COUNT(*) FROM application WHERE drive_id = d.id) AS app_count "
        "FROM placement_drive d WHERE d.company_id = :cid"),
        {"cid": company.id}
    ).fetchall()

    drives = []
    for r in rows:
        d = to_obj(r)
        d.app_count = r.app_count
        drives.append(d)
    return render_template('company/drives.html', drives=drives)

@app.route('/company/drives/create', methods=['GET', 'POST'])
@company_required
def company_create_drive():
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    if request.method == 'POST':
        deadline = None
        deadline_str = request.form.get('deadline')
        if deadline_str:
            try:
                deadline = datetime.strptime(deadline_str, '%Y-%m-%dT%H:%M')
            except ValueError:
                pass

        db.session.execute(text(
            "INSERT INTO placement_drive "
            "(company_id, job_title, job_description, eligibility_criteria, "
            " required_skills, experience_required, salary_range, deadline, status, created_at) "
            "VALUES (:cid, :jt, :jd, :ec, :rs, :er, :sr, :dl, 'open', :now)"),
            {"cid": company.id, "jt": request.form.get('job_title'),
             "jd": request.form.get('job_description'),
             "ec": request.form.get('eligibility_criteria'),
             "rs": request.form.get('required_skills'),
             "er": request.form.get('experience_required'),
             "sr": request.form.get('salary_range'),
             "dl": deadline, "now": datetime.utcnow()}
        )
        db.session.commit()
        flash('Drive created successfully.', 'success')
        return redirect(url_for('company_drives'))
    return render_template('company/drive_form.html', drive=None)

@app.route('/company/drives/<int:id>/edit', methods=['GET', 'POST'])
@company_required
def company_edit_drive(id):
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    drive = to_obj(db.session.execute(text(
        "SELECT * FROM placement_drive WHERE id = :id AND company_id = :cid AND status = 'open'"),
        {"id": id, "cid": company.id}
    ).fetchone())
    if not drive:
        flash('Drive not found.', 'danger')
        return redirect(url_for('company_drives'))

    if request.method == 'POST':
        deadline = None
        deadline_str = request.form.get('deadline')
        if deadline_str:
            try:
                deadline = datetime.strptime(deadline_str, '%Y-%m-%dT%H:%M')
            except ValueError:
                pass

        db.session.execute(text(
            "UPDATE placement_drive SET job_title = :jt, job_description = :jd, "
            "eligibility_criteria = :ec, required_skills = :rs, experience_required = :er, "
            "salary_range = :sr, deadline = :dl "
            "WHERE id = :id AND company_id = :cid"),
            {"jt": request.form.get('job_title'), "jd": request.form.get('job_description'),
             "ec": request.form.get('eligibility_criteria'),
             "rs": request.form.get('required_skills'),
             "er": request.form.get('experience_required'),
             "sr": request.form.get('salary_range'),
             "dl": deadline, "id": id, "cid": company.id}
        )
        db.session.commit()
        flash('Drive updated successfully.', 'success')
        return redirect(url_for('company_drives'))
    return render_template('company/drive_form.html', drive=drive)

@app.route('/company/drives/<int:id>/close', methods=['POST'])
@company_required
def company_close_drive(id):
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())
    db.session.execute(text(
        "UPDATE placement_drive SET status = 'closed' WHERE id = :id AND company_id = :cid"),
        {"id": id, "cid": company.id}
    )
    db.session.commit()
    flash('Drive closed.', 'success')
    return redirect(url_for('company_drives'))

@app.route('/company/drives/<int:id>/delete', methods=['POST'])
@company_required
def company_delete_drive(id):
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())
    # Delete applications first (foreign key), then the drive
    db.session.execute(text(
        "DELETE FROM application WHERE drive_id = :did"), {"did": id}
    )
    db.session.execute(text(
        "DELETE FROM placement_drive WHERE id = :id AND company_id = :cid"),
        {"id": id, "cid": company.id}
    )
    db.session.commit()
    flash('Drive deleted.', 'success')
    return redirect(url_for('company_drives'))

@app.route('/company/drives/<int:id>/applicants')
@company_required
def company_view_applicants(id):
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    drive = to_obj(db.session.execute(text(
        "SELECT * FROM placement_drive WHERE id = :id AND company_id = :cid"),
        {"id": id, "cid": company.id}
    ).fetchone())
    if not drive:
        flash('Drive not found.', 'danger')
        return redirect(url_for('company_drives'))

    rows = db.session.execute(text(
        "SELECT a.id AS app_id, a.applied_at, a.status, "
        "       s.id AS student_id, s.full_name, s.department, s.cgpa "
        "FROM application a "
        "JOIN student s ON a.student_id = s.id "
        "WHERE a.drive_id = :did"),
        {"did": id}
    ).fetchall()

    applications = []
    for r in rows:
        applications.append(SimpleNamespace(
            id=r.app_id, applied_at=parse_dt(r.applied_at), status=r.status,
            student=SimpleNamespace(id=r.student_id, full_name=r.full_name,
                                    department=r.department, cgpa=r.cgpa)
        ))
    return render_template('company/applicants.html', drive=drive, applications=applications)

@app.route('/company/applications/<int:id>/status', methods=['POST'])
@company_required
def company_update_app_status(id):
    company = to_obj(db.session.execute(text(
        "SELECT id FROM company WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    # Verify the application belongs to this company's drive
    app_row = db.session.execute(text(
        "SELECT a.id, a.drive_id FROM application a "
        "JOIN placement_drive d ON a.drive_id = d.id "
        "WHERE a.id = :aid AND d.company_id = :cid"),
        {"aid": id, "cid": company.id}
    ).fetchone()

    if not app_row:
        flash('Application not found.', 'danger')
        return redirect(url_for('company_drives'))

    new_status = request.form.get('new_status')
    if new_status:
        db.session.execute(text(
            "UPDATE application SET status = :st WHERE id = :aid"),
            {"st": new_status, "aid": id}
        )
        db.session.commit()
        flash('Status updated.', 'success')
    return redirect(url_for('company_view_applicants', id=app_row.drive_id))

@app.route('/company/student/<int:id>')
@company_required
def company_view_student(id):
    row = db.session.execute(text(
        "SELECT s.id, s.full_name, s.phone, s.department, s.cgpa, s.skills, s.resume_filename, "
        "       u.username, u.email "
        "FROM student s JOIN user u ON s.user_id = u.id "
        "WHERE s.id = :id"),
        {"id": id}
    ).fetchone()

    if not row:
        flash('Student not found.', 'danger')
        return redirect(url_for('company_drives'))

    student = SimpleNamespace(
        id=row.id, full_name=row.full_name, phone=row.phone,
        department=row.department, cgpa=row.cgpa, skills=row.skills,
        resume_filename=row.resume_filename,
        user=SimpleNamespace(username=row.username, email=row.email)
    )
    return render_template('company/student_profile.html', student=student)


# ══════════════════════════════════════════════════════════════
#  STUDENT ROUTES
# ══════════════════════════════════════════════════════════════

@app.route('/student/dashboard')
@student_required
def student_dashboard():
    student = to_obj(db.session.execute(text(
        "SELECT * FROM student WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    total_applications = db.session.execute(text(
        "SELECT COUNT(*) FROM application WHERE student_id = :sid"), {"sid": student.id}
    ).scalar()

    pending_apps = db.session.execute(text(
        "SELECT COUNT(*) FROM application WHERE student_id = :sid AND status = 'Applied'"),
        {"sid": student.id}
    ).scalar()

    placed = db.session.execute(text(
        "SELECT COUNT(*) FROM application WHERE student_id = :sid AND status = 'Placed'"),
        {"sid": student.id}
    ).scalar() > 0

    # Recent 5 applications with drive and company info (using JOIN)
    rows = db.session.execute(text(
        "SELECT a.id, a.applied_at, a.status, "
        "       d.job_title, c.company_name "
        "FROM application a "
        "JOIN placement_drive d ON a.drive_id = d.id "
        "JOIN company c ON d.company_id = c.id "
        "WHERE a.student_id = :sid "
        "ORDER BY a.applied_at DESC LIMIT 5"),
        {"sid": student.id}
    ).fetchall()

    recent_applications = []
    for r in rows:
        recent_applications.append(SimpleNamespace(
            id=r.id, applied_at=parse_dt(r.applied_at), status=r.status,
            drive=SimpleNamespace(job_title=r.job_title,
                                  company=SimpleNamespace(company_name=r.company_name))
        ))

    return render_template('student/dashboard.html', student=student,
                           total_applications=total_applications, pending_apps=pending_apps,
                           placed=placed, recent_applications=recent_applications)

@app.route('/student/profile', methods=['GET', 'POST'])
@student_required
def student_profile():
    student = to_obj(db.session.execute(text(
        "SELECT * FROM student WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    if request.method == 'POST':
        cgpa_val = None
        try:
            cgpa_val = float(request.form.get('cgpa', 0))
        except ValueError:
            pass

        db.session.execute(text(
            "UPDATE student SET full_name = :fn, phone = :ph, department = :dept, "
            "cgpa = :cgpa, skills = :sk WHERE user_id = :uid"),
            {"fn": request.form.get('full_name'), "ph": request.form.get('phone'),
             "dept": request.form.get('department'), "cgpa": cgpa_val,
             "sk": request.form.get('skills'), "uid": current_user.id}
        )

        # Handle resume PDF upload
        file = request.files.get('resume')
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            db.session.execute(text(
                "UPDATE student SET resume_filename = :rf WHERE user_id = :uid"),
                {"rf": filename, "uid": current_user.id}
            )

        db.session.commit()
        flash('Profile updated.', 'success')
        return redirect(url_for('student_profile'))
    return render_template('student/profile.html', student=student)

@app.route('/student/drives')
@student_required
def student_drives():
    search = request.args.get('search', '')
    now = datetime.utcnow()

    sql = ("SELECT d.id, d.job_title, d.salary_range, d.experience_required, "
           "       d.deadline, d.required_skills, c.company_name "
           "FROM placement_drive d "
           "JOIN company c ON d.company_id = c.id "
           "WHERE d.status = 'open' "
           "  AND (d.deadline >= :now OR d.deadline IS NULL) "
           "  AND c.approval_status = 'approved' "
           "  AND c.is_blacklisted = 0")
    params = {"now": now}

    if search:
        sql += " AND (d.job_title LIKE :s OR d.required_skills LIKE :s)"
        params["s"] = f"%{search}%"

    rows = db.session.execute(text(sql), params).fetchall()

    drives = []
    for r in rows:
        drives.append(SimpleNamespace(
            id=r.id, job_title=r.job_title, salary_range=r.salary_range,
            experience_required=r.experience_required,
            deadline=parse_dt(r.deadline), required_skills=r.required_skills,
            company=SimpleNamespace(company_name=r.company_name)
        ))
    return render_template('student/drives.html', drives=drives, search=search)

@app.route('/student/drives/<int:id>')
@student_required
def student_drive_detail(id):
    student = to_obj(db.session.execute(text(
        "SELECT id FROM student WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    row = db.session.execute(text(
        "SELECT d.*, c.company_name, c.industry, c.website "
        "FROM placement_drive d "
        "JOIN company c ON d.company_id = c.id "
        "WHERE d.id = :id"),
        {"id": id}
    ).fetchone()

    if not row:
        flash('Drive not found.', 'danger')
        return redirect(url_for('student_drives'))

    drive = SimpleNamespace(
        id=row.id, job_title=row.job_title, job_description=row.job_description,
        eligibility_criteria=row.eligibility_criteria, required_skills=row.required_skills,
        experience_required=row.experience_required, salary_range=row.salary_range,
        deadline=parse_dt(row.deadline), status=row.status,
        company=SimpleNamespace(company_name=row.company_name, industry=row.industry,
                                website=row.website)
    )

    app_row = db.session.execute(text(
        "SELECT id, status FROM application WHERE student_id = :sid AND drive_id = :did"),
        {"sid": student.id, "did": id}
    ).fetchone()

    already_applied = app_row is not None
    application = to_obj(app_row)

    return render_template('student/drive_detail.html', drive=drive,
                           already_applied=already_applied, application=application)

@app.route('/student/drives/<int:id>/apply', methods=['POST'])
@student_required
def student_apply_drive(id):
    student = to_obj(db.session.execute(text(
        "SELECT id, full_name, department, cgpa FROM student WHERE user_id = :uid"),
        {"uid": current_user.id}
    ).fetchone())

    drive = to_obj(db.session.execute(text(
        "SELECT id, status, deadline FROM placement_drive WHERE id = :id"), {"id": id}
    ).fetchone())

    if not drive or drive.status != 'open' or (drive.deadline and drive.deadline < datetime.utcnow()):
        flash('Drive is no longer open.', 'danger')
        return redirect(url_for('student_drive_detail', id=id))

    if not student.full_name or not student.department or student.cgpa is None:
        flash('Please complete your profile before applying.', 'warning')
        return redirect(url_for('student_profile'))

    # Check for duplicate application
    existing = db.session.execute(text(
        "SELECT id FROM application WHERE student_id = :sid AND drive_id = :did"),
        {"sid": student.id, "did": id}
    ).fetchone()
    if existing:
        flash('Already applied.', 'warning')
        return redirect(url_for('student_drive_detail', id=id))

    # INSERT new application
    db.session.execute(text(
        "INSERT INTO application (student_id, drive_id, status, applied_at) "
        "VALUES (:sid, :did, 'Applied', :now)"),
        {"sid": student.id, "did": id, "now": datetime.utcnow()}
    )
    db.session.commit()
    flash('Applied successfully.', 'success')
    return redirect(url_for('student_drive_detail', id=id))

@app.route('/student/applications')
@student_required
def student_applications():
    student = to_obj(db.session.execute(text(
        "SELECT id FROM student WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    rows = db.session.execute(text(
        "SELECT a.id, a.applied_at, a.status, "
        "       d.job_title, d.salary_range, c.company_name "
        "FROM application a "
        "JOIN placement_drive d ON a.drive_id = d.id "
        "JOIN company c ON d.company_id = c.id "
        "WHERE a.student_id = :sid"),
        {"sid": student.id}
    ).fetchall()

    applications = []
    for r in rows:
        applications.append(SimpleNamespace(
            id=r.id, applied_at=parse_dt(r.applied_at), status=r.status,
            drive=SimpleNamespace(job_title=r.job_title, salary_range=r.salary_range,
                                  company=SimpleNamespace(company_name=r.company_name))
        ))
    return render_template('student/applications.html', applications=applications)

@app.route('/student/applications/<int:id>/withdraw', methods=['POST'])
@student_required
def student_withdraw_app(id):
    student = to_obj(db.session.execute(text(
        "SELECT id FROM student WHERE user_id = :uid"), {"uid": current_user.id}
    ).fetchone())

    # Only allow withdrawal of "Applied" status applications
    app_row = db.session.execute(text(
        "SELECT id FROM application WHERE id = :aid AND student_id = :sid AND status = 'Applied'"),
        {"aid": id, "sid": student.id}
    ).fetchone()

    if not app_row:
        flash('Application not found or cannot be withdrawn.', 'danger')
        return redirect(url_for('student_applications'))

    db.session.execute(text("DELETE FROM application WHERE id = :aid"), {"aid": id})
    db.session.commit()
    flash('Application withdrawn.', 'success')
    return redirect(url_for('student_applications'))


# ══════════════════════════════════════════════════════════════
#  FILE UPLOAD ROUTE
# ══════════════════════════════════════════════════════════════

@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ══════════════════════════════════════════════════════════════
#  DATABASE INIT & ADMIN SETUP
# ══════════════════════════════════════════════════════════════

def create_admin():
    """Auto-create admin account using raw SQL if none exists."""
    row = db.session.execute(text("SELECT id FROM user WHERE role = 'admin'")).fetchone()
    if not row:
        db.session.execute(text(
            "INSERT INTO user (username, email, password, role, is_active_user, created_at) "
            "VALUES ('admin', 'admin@portal.com', :pw, 'admin', 1, :now)"),
            {"pw": generate_password_hash('admin123'), "now": datetime.utcnow()}
        )
        db.session.commit()
        print('Admin account created: admin / admin123')

with app.app_context():
    db.create_all()
    create_admin()

if __name__ == '__main__':
    app.run(debug=True)
