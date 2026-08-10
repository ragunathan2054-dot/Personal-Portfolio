**Portfolio + Admin Dashboard**

A full-stack personal portfolio website with a private, password-protected admin panel for managing all content — no code changes needed to update text, skills, projects, or certificates.


**What This Project Is**

Most portfolio sites are static — updating them means editing HTML directly. This project separates the public-facing site from a private control panel, so content can be updated anytime through a real login-protected dashboard, backed by a database.

**Two frontends, one backend, one database:**

**Part	Purpose**

Public site	What visitors see — hero, about, skills, projects, certificates, contact
Admin dashboard	Private login area to edit every section of the public site
Backend API	One Express server, serving both — with a hard code boundary between public (read-only) and private (authenticated) routes
Database	MongoDB — stores all site content and admin account data
Tech Stack
Layer	Technology
Frontend build	Vite
Frontend	HTML, CSS, JavaScript
Animation	GSAP (scroll-triggered reveals)
Backend	Node.js, Express
Database	MongoDB (Mongoose)
Image hosting	Cloudinary
Auth	JWT (httpOnly cookies), bcrypt password hashing
2FA	Google Authenticator (TOTP)
Hosting	Netlify (both frontends), Render (backend)
Key Features
Public site
Single-page scrolling design — hero, about, skills, projects, certificates, contact
Skill cards that flip on click to show details
Live global search across skills, projects, and certificates
Working contact form that saves messages to the database
Dark/light theme toggle
Fully responsive
Admin dashboard
Secure login with account lockout after repeated failed attempts
Optional two-factor authentication (Google Authenticator)
Edit every section of the public site — text, skills, projects, certificates, contact info
Upload a profile photo directly (stored via Cloudinary)
Change login email and password from within the dashboard
Read and manage messages submitted through the public contact form
Every save/delete/update action confirmed with a toast notification
Security Measures

**Built with security as the primary requirement, not an afterthought:**

Protection	How it's implemented
Password storage	bcrypt hashing, never stored in plain text
Session handling	JWT stored in httpOnly cookies — invisible to JavaScript, blocks XSS token theft
CSRF protection	Double-submit cookie pattern on every state-changing request
Brute-force defense	Rate limiting + account lockout after 5 failed logins
Input validation	Every request validated and sanitized before touching the database
NoSQL injection	Blocked via input sanitization middleware
Secure headers	Helmet.js (CSP, X-Frame-Options, etc.)
File uploads	Memory-only processing, type/size restricted, no files ever written to server disk
Two-factor auth	TOTP-based, Google Authenticator compatible
Environment secrets	All credentials kept in .env, excluded from version control

**Architecture**
Backend (one server, two isolated code paths)
├── public/    → read-only routes, no authentication required
└── private/   → every route requires a valid login session

Frontend (two separate deployments)
├── Public site    → fetches content, no login
└── Admin dashboard → authenticated, full content control

The public and private backend code are kept in physically separate folders that never import from each other — the public API has no code path capable of writing data, by design, not just by convention.

**Project Structure**
portfolio-app/
├── Backend/
│   ├── config/          # Database + Cloudinary setup
│   ├── shared/           # Models, shared middleware, utilities
│   ├── public/           # Public, read-only routes
│   └── private/          # Authenticated admin routes
│
├── Front-public/
│   └── src/
│       ├── sections/     # Hero, About, Skills, Projects, Certificates, Contact
│       └── style.css
│
└── Frontend-admin/
    └── src/
        ├── panels/       # One editor panel per public site section
        └── style.css

**Running Locally**
bash
# Backend
cd Backend
npm install
npm run dev

# Public site
cd Front-public
npm install
npm run dev

# Admin dashboard
cd Frontend-admin
npm install
npm run dev

Each folder needs its own .env file (see .env.example in each folder for the required variables — real values are never committed to this repo).

**What I Learned Building This**
Designing a clean separation between public and admin systems sharing one backend
Implementing authentication properly: hashed passwords, httpOnly cookies, CSRF tokens, and TOTP-based 2FA — not just "a login form"
Handling file uploads securely without ever touching the server's own disk
Structuring a MongoDB schema to support a fully content-managed static-feeling site
Debugging real production issues: environment variable load order, cross-origin cookie behavior, and MongoDB's partial-update semantics
Author

Your Name Portfolio: add your live link here Contact: add your email here