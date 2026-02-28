# **App Name**: SkillForge

## Core Features:

- User Authentication & Authorization: Secure sign-up, login (email/password, Google OAuth), email verification, and role-based access control (Student, Admin) using Firebase Auth and Custom Claims. Includes middleware for route protection.
- Project Management (CRUD): Students can create, view, edit, and delete their projects, set project visibility (Public, Private, Team Only), and include structured descriptions and files.
- Secure File Upload & Storage Tracking: Allows secure upload of project files up to 500MB via Firebase Storage, including MIME type and size validation. Tracks user storage consumption against their quota.
- AI Project Idea Assistant: An AI-powered tool to assist users in elaborating and structuring their project descriptions with intelligent suggestions and content enhancements.
- Storage Plan Display & Tracking: Display user's current subscription plan, their total storage limit, and a visual progress bar indicating storage used vs. total available storage.
- Secure Share Link Generation: Allows students to generate and manage unique, crypto-random share keys for projects, enabling temporary, secure external viewing of their work. Features revocation and regeneration.
- Admin User & Project Management: A basic dashboard for administrators to view, ban, and unban users, and delete any project within the system. User roles are managed via Firebase Custom Claims.

## Style Guidelines:

- Primary interactive color: A professional and vibrant blue (#2563EB). Used for buttons, primary actions, and key UI elements to ensure a clean SaaS feel. Chosen for its direct and professional appeal, contrasting well with light backgrounds.
- Background color: A very light, subtle blue-grey (#F2F4F7) to provide a soft and clean canvas, derived from the primary blue's hue with heavy desaturation, ensuring legibility and professionalism in a light theme.
- Accent color: A brighter cyan-blue (#7CDBFF), analogous to the primary color but with a shifted hue and increased lightness to create visual hierarchy and draw attention to important information or secondary actions. This color evokes clarity and modernity.
- Headline and body font: 'Inter', a modern sans-serif. Its objective and neutral aesthetic aligns with the professional SaaS startup feel, providing excellent readability across all devices.
- Utilize professional, line-art or subtle-fill icons that align with a modern SaaS aesthetic, ensuring clarity and intuitive navigation within the dashboard and project views.
- Implement a sidebar-based dashboard layout with a complementary top navigation bar and a profile dropdown. Project displays will feature a card-based layout, fully responsive across all screen sizes. Prioritize clean spacing for a contemporary feel.
- Incorporate subtle and smooth transitions for UI elements such as button hovers, modal presentations, and content loading. Animations should enhance user experience without being distracting, maintaining a professional and polished feel.