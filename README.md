# Flux Lora - Product Requirements Document (PRD)

## Project Overview

You are building a web app that allows users to generate images based on a given prompt. The application will be built using the following stack:

- Next.js (v14) for the front-end and backend routing
- Shadcn/UI for design components
- Tailwind CSS for styling
- Lucid Icons for icons
- Supabase for image storage and database management
- Clerk for user authentication
- Hugging Face API for image generation
- Vercel AI SDK for fast and scalable API interactions

## Core Functionalities

### 1. User Authentication

1.1. User authentication is handled via Clerk. Users can sign up or log in using Google or email/password.  
1.2. After clicking on the "Login" or "Sign Up" button, if it's a new user, their data will be saved to Supabase, and they will be redirected to the image generation page.  
1.3. If the user is already logged in, they will directly go to the image generation page.

### 2. Image Generation

2.1. Users can enter a prompt to generate an image.  
2.2. The image generation is handled by the Hugging Face API.  
2.3. Once the image is generated, it will be displayed on the screen with an option to download the image.

### 3. Image Storage

3.1. After the image is generated, it will be stored in Supabase Storage.  
3.2. The image URL, along with metadata like the prompt and user ID, will be saved in a database table (generated_images) in Supabase.

### 4. User Interface

4.1. The user is redirected to the login/signup page when clicking "Login" or "Signup".  
4.2. On the image generation page, users will see:
- An input field to enter the prompt
- A "Generate Image" button
- A history section showing the user's generated images

4.3. Users can click on an image in the history section to view or download it.

### 5. Generated Images Page

5.1. On the home page, users can view all images generated on the website.  
5.2. The images are fetched from Supabase and displayed in a grid.  
5.3. Each image will have an option to download.  
5.4. Users can toggle between images they generated and all images.  
5.5. The "Generated by Me" page will show images associated with the logged-in user.

## File Structure

```bash
img-gen
├── .env.local
├── next.config.mjs
├── tailwind.config.ts
├── package.json
├── postcss.config.mjs
├── /app
│   ├── page.tsx               # Home page with all images
│   └── generate
│       └── page.tsx           # Image generation page
├── /components
│   ├── Auth.tsx               # Authentication component (Clerk)
│   ├── ImageGenerator.tsx     # Image generation, prompt input
│   ├── ImageGrid.tsx          # Grid display for images
│   └── Header.tsx             # Header with user profile/logout
├── /lib
│   ├── supabase.ts           # Supabase client setup
│   ├── auth.ts               # Clerk authentication helpers
│   └── huggingface.ts        # Hugging Face API integration
└── /api
    ├── generate-image.ts     # API route for generating images
    └── save-user.ts          # API route to save user data in Supabase
```

## Detailed Supabase Setup

### Supabase Table Setup

```sql
-- Create the generated_images table
CREATE TABLE public.generated_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see only their own images
CREATE POLICY "Users can view their own images" 
ON public.generated_images
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy to allow users to insert their own images
CREATE POLICY "Users can insert their own images" 
ON public.generated_images
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Supabase Client Initialization

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Authentication Setup with Clerk

### Installation

```bash
npm install @clerk/nextjs
```

### Environment Variables
Add the following variables to `.env.local`:

```makefile
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

### Clerk Integration in _app.tsx

```javascript
import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }) {
    return (
        <ClerkProvider>
            <Component {...pageProps} />
        </ClerkProvider>
    );
}

export default MyApp;
```

### Sign-In and Sign-Up Components

```javascript
import { SignIn } from '@clerk/nextjs';
function SignInPage() {
    return <SignIn />;
}
export default SignInPage;
```

```javascript
import { SignUp } from '@clerk/nextjs';
function SignUpPage() {
    return <SignUp />;
}
export default SignUpPage;
```

### Profile Page Example

```javascript
import { useUser } from '@clerk/nextjs';
function ProfilePage() {
    const { isLoaded, isSignedIn, user } = useUser();
    if (!isLoaded || !isSignedIn) {
        return null;
    }
    return <div>Hello, {user.firstName}!</div>;
}
```

## Hugging Face API Setup for Image Generation

### Image Generation Example

#### API Configuration
Replace `YOUR_API_KEY_HERE` with your Hugging Face API key.

```javascript
const generateImage = async (prompt) => {
  const response = await fetch("https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4", {
    method: "POST",
    headers: {
      Authorization: `Bearer YOUR_API_KEY_HERE`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const data = await response.json();
  if (data.error) {
    console.error(data.error);
    return null;
  }
  return data.image;
};
```

### API Routes

#### Generate Image API (/api/generate-image.ts)

```javascript
export default async function handler(req, res) {
  const { prompt } = req.body;
  const image = await generateImage(prompt); // Call to Hugging Face API
  if (!image) {
    return res.status(500).json({ error: 'Image generation failed' });
  }
  res.status(200).json({ image });
}
```

#### Save User API (/api/save-user.ts)

```javascript
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, last_sign_in: new Date() });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
}
```

