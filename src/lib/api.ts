import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Tweet {
  id: string;
  date: string;
  text: string;
  media: string[];
  stats: {
    replies: number;
    retweets: number;
    likes: number;
  };
  is_rt: boolean;
  rt_info?: {
    name: string;
    screen_name: string;
    avatar: string;
    text: string;
    type?: string;
  };
}

export interface Media {
  url: string;
  type: 'image' | 'video';
}

export interface User {
  name: string;
  screen_name: string;
  avatar: string;
  banner: string;
  bio: string;
}

export async function getUsers() {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn(`Data directory not found: ${DATA_DIR}`);
    return [];
  }
  
  const folders = fs.readdirSync(DATA_DIR);
  const users = folders
    .map((folder) => {
      const profilePath = path.join(DATA_DIR, folder, 'user.json');
      if (fs.existsSync(profilePath)) {
        try {
          const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
          return profile;
        } catch (e) {
          console.error(`Error parsing profile for ${folder}`, e);
          return null;
        }
      }
      return null;
    })
    .filter(Boolean);

  return users;
}

export async function getUserData(username: string) {
  if (!username) {
    console.error("❌ getUserData called with undefined or empty username");
    return null;
  }

  if (!DATA_DIR) {
    console.error("❌ DATA_DIR is not defined");
    return null;
  }

  try {
    const userPath = path.join(DATA_DIR, username);

    if (!fs.existsSync(userPath)) {
      console.error(`❌ User directory not found: ${userPath}`);
      return null;
    }

    const profilePath = path.join(userPath, 'user.json');      
    const tweetsPath = path.join(userPath, 'tweets.json');     
    const mediaPath = path.join(userPath, 'media_map.json');   

    if (!fs.existsSync(profilePath) || !fs.existsSync(tweetsPath)) {
      console.error(`❌ Missing core files (user.json or tweets.json) in ${userPath}`);
      return null;
    }

    const user = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const tweets = JSON.parse(fs.readFileSync(tweetsPath, 'utf-8'));
    
    let mediaMap = {};
    if (fs.existsSync(mediaPath)) {
      mediaMap = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
    }

    return { user, tweets, mediaMap };
  } catch (error) {
    console.error(`Error loading data for ${username}:`, error);
    return null;
  }
}