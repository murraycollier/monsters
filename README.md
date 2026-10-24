# Monster Hunters 🦾

A modern web application where users can review and rate different Monster Energy drink variants. The site features user authentication, a searchable drink catalogue, detailed reviews with photos, and a leaderboard of top-rated drinks.

## Stack

- **Frontend**: Hugo + Vanilla JavaScript
- **Hosting**: GitHub Pages
- **Backend**: Firebase (Authentication, Firestore, Cloud Storage)

## Features

- ✅ User sign-up and sign-in (email/password + Google OAuth)
- ✅ Drink catalogue with ability to add new variants
- ✅ Rate drinks on multiple metrics (Drinkability, Time to Empty, Energy Boost, Taste, Value)
- ✅ Photo uploads with reviews
- ✅ Global leaderboard ranked by average score
- ✅ User profiles with review history
- ✅ Monster Energy branded dark theme with neon green accents

## Local Development

### Prerequisites
- [Hugo Extended](https://gohugo.io/installation/) (v0.145.0+)
- A Firebase project (see setup below)

### Setup

1. Clone this repo:
```bash
git clone https://github.com/murraycollier/monsters.git
cd monsters
```

2. Start Hugo dev server:
```bash
hugo server
```

Visit http://localhost:1313 and you should see the home page.

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" and name it `monsterhunters`
3. Disable Google Analytics (optional)
4. Click "Create project" and wait for it to initialize

### 2. Add a Web App

1. In the Firebase console, go to **Project Settings** (⚙️ icon, top left)
2. Click the **Web** icon to add a web app
3. Register the app (name doesn't matter, e.g., "Monster Hunters Web")
4. Copy the entire **Firebase Config** object:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

5. Open `static/js` folder and create a placeholder file or edit the firebase-init.html to add your config. Replace the placeholder values in `layouts/partials/firebase-init.html`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 3. Enable Authentication

1. In Firebase console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider:
   - Click Google
   - Toggle the switch to ON
   - Add your email as a test account
   - Save

### 4. Set Up Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Choose **Production mode** and a region (e.g., `us-east1`)
3. Click **Create**
4. Go to the **Rules** tab and paste:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public reads for approved drinks
    match /drinks/{document=**} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.resource.data.review_count > resource.data.review_count);
    }

    // Reviews: authenticated users can create/read
    match /reviews/{document=**} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.user_id == request.auth.uid;
    }

    // User profiles: authenticated users manage their own
    match /users/{uid} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 5. Set Up Cloud Storage

1. Go to **Storage** → **Get Started**
2. Start in **Production mode**
3. Choose the same region as Firestore
4. Go to the **Rules** tab and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reviews/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. (Optional) Seed the Drink Catalogue

To pre-populate the database with 25 popular Monster variants:

1. Install the Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Download your service account key:
   - Firebase Console → Project Settings → **Service Accounts**
   - Click **Generate New Private Key**
   - Save as `firebase-service-account.json` in the project root

3. Run the seed script:
   ```bash
   node seed-drinks.js
   ```

4. **Delete `firebase-service-account.json` after seeding** — never commit credentials!

## Deployment

### GitHub Pages

The site auto-deploys on every push to `main`:

1. Push your changes:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. GitHub Actions automatically:
   - Builds the Hugo site
   - Uploads the `./public` folder as a Pages artifact
   - Deploys to your GitHub Pages URL

3. Your site appears at `https://yourusername.github.io/monsters/` or your custom domain if configured.

### Custom Domain (monsterhunters.club)

1. In your domain registrar (e.g., GoDaddy, Namecheap), set DNS records to point to GitHub Pages:
   - Type A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Type AAAA: `2606:50c0:8000::153`, etc.

2. In GitHub repo settings → **Pages**, set "Custom domain" to `monsterhunters.club`

3. GitHub auto-creates the CNAME file (already included in `static/CNAME`)

## Project Structure

```
monsters/
├── content/                 # Hugo content files
│   ├── _index.md          # Home page
│   ├── leaderboard/_index.md
│   ├── submit/_index.md
│   ├── drink/_index.md
│   └── profile/_index.md
├── layouts/               # Hugo templates
│   ├── _default/          # Default layouts
│   └── partials/          # Reusable components
├── static/
│   ├── css/monster.css    # Monster Energy themed styles
│   ├── js/                # Firebase modules
│   │   ├── auth.js        # Authentication
│   │   ├── reviews.js     # Review submission
│   │   ├── leaderboard.js # Leaderboard rendering
│   │   ├── drink.js       # Drink detail page
│   │   ├── profile.js     # User profiles
│   │   └── upload.js      # Image uploads
│   └── images/
├── hugo.toml              # Hugo config
├── .gitignore
├── .github/workflows/hugo.yaml  # GitHub Actions deployment
└── README.md              # This file
```

## Firestore Data Schema

### drinks/{drinkId}
```javascript
{
  name: string,                  // "Monster Energy Original"
  variant: string,               // "Original"
  image_url: string,             // URL to drink image
  submitted_by: string,          // User UID or "admin"
  approved: boolean,             // true = visible, false = pending
  review_count: number,
  avg_drinkability: number,
  avg_time_to_empty: number,
  avg_energy_boost: number,
  avg_taste: number,
  avg_value: number,
  avg_overall: number            // Average of all 5 metrics
}
```

### reviews/{reviewId}
```javascript
{
  drink_id: string,
  drink_name: string,
  user_id: string,               // Firebase Auth UID
  user_display_name: string,
  drinkability: number,          // 1–5
  time_to_empty: number,         // 1–5
  energy_boost: number,          // 1–5
  taste: number,                 // 1–5
  value: number,                 // 1–5
  overall: number,               // Auto-computed average
  notes: string,
  image_url: string | null,      // Cloud Storage URL
  created_at: Timestamp
}
```

### users/{userId}
```javascript
{
  display_name: string,
  avatar_url: string,
  review_count: number,
  joined_at: Timestamp
}
```

## Design System

The site uses a dark, Monster Energy-inspired theme:

- **Background**: `#0a0a0a` (very dark)
- **Surface**: `#141414` (dark)
- **Card**: `#1c1c1c` (slightly lighter)
- **Primary Color**: `#00c72c` (Monster signature green)
- **Typography**: Oswald (headings), Inter (body)

All elements have a subtle neon glow effect on hover.

## Troubleshooting

### "Firebase not defined" error
- Make sure Firebase config is filled in correctly in `layouts/partials/firebase-init.html`
- Check browser console for more details

### Reviews not saving
- Check Firestore rules in Firebase console
- Verify user is authenticated (look for "Sign Out" button in nav)

### Images not uploading
- Check Cloud Storage rules allow authenticated uploads
- Check browser console for upload errors

### Leaderboard is empty
- Run `node seed-drinks.js` to add initial drinks
- Or add a drink manually via the "Submit Review" form

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit PRs for improvements

## License

MIT
