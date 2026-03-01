# SkillForge

This is a professional portfolio and marketplace platform built with Next.js, Firebase, and Genkit.

## Deployment on Netlify

If you are seeing a "Git ref refs/heads/main does not exist" error during deployment:

1. **Check your Branch Name**: Your repository might be using `master` instead of `main`.
2. **Update Netlify Settings**:
   - Go to your Site on Netlify.
   - Navigate to **Site settings** > **Build & deploy** > **Continuous Deployment**.
   - Under **Build settings**, click **Edit settings**.
   - Change the **Branch to deploy** to match your repository's default branch (e.g., `master`).
3. **Trigger Deploy**: Save the settings and trigger a new deployment.

## Features

- **Large File Support**: Upload assets up to 500MB.
- **Marketplace**: List projects for sale with an automatic 10% platform commission.
- **Secure Sharing**: Generate 20-character keys for private project access.
- **Admin Console**: Manage users, approve storage upgrades, and track platform commissions.
- **Team Hub**: Collaborate in private team spaces.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & ShadCN UI
- **Backend**: Firebase (Firestore, Auth, Storage, Realtime Database)
- **AI**: Genkit with Google Gemini
