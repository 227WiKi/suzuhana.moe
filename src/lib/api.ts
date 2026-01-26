import fs from 'fs';
import path from 'path';
import { getMemberBySlug, getAllMembers } from './members';

const DATA_DIR = path.join(process.cwd(), 'data');


export interface Media {
  type: 'photo' | 'video';
  url: string;
  thumbnail_url: string;
}

export interface Tweet {
  id: string;
  date: string;
  text: string;
  media: Media[];
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


function getPlatformDir(slug: string, platform: string) {
  return path.join(DATA_DIR, slug, platform);
}


export async function getUserData(slug: string, platform: 'twitter' | 'instagram' = 'twitter') {
  const member = getMemberBySlug(slug);
  if (!member) return null;

  const dir = getPlatformDir(slug, platform);
  const filePath = path.join(dir, 'user.json');

  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const platformUser = JSON.parse(fileContents);

      return {
        slug: member.slug,
        name: member.name, 
        nickname: platformUser.name || member.name, 
        platform: platform,
        avatar: platformUser.avatar || platformUser.profile_image_url_https || member.avatar,
        banner: platformUser.banner || platformUser.profile_banner_url || null,
        bio: platformUser.bio || platformUser.description || member.bio || "",
        screen_name: platformUser.screen_name || member.accounts.twitter,
        stats: {
          tweets: platformUser.stats?.tweets || 0,
          following: platformUser.stats?.following || 0,
          followers: platformUser.stats?.followers || 0,
        },
        raw: platformUser
      };
    } 

    return {
      slug: member.slug,
      name: member.name,
      nickname: member.name,
      platform: platform,
      avatar: member.avatar,
      banner: null,
      bio: member.bio || "",
      screen_name: member.accounts.twitter,
      raw: {}
    };

  } catch (error) {
    console.error(`❌ Error loading user data:`, error);
    return null;
  }
}

export async function getTweets(slug: string, page = 1, limit = 20) {
  const dir = getPlatformDir(slug, 'twitter');
  const tweetsPath = path.join(dir, 'tweets.json');
  const mediaMapPath = path.join(dir, 'media_map.json'); 

  try {
    if (!fs.existsSync(tweetsPath)) {
      return { tweets: [], total: 0, hasMore: false };
    }

    const tweetsRaw = fs.readFileSync(tweetsPath, 'utf-8');
    const allTweets = JSON.parse(tweetsRaw);

    let mediaMap: Record<string, any> = {};
    if (fs.existsSync(mediaMapPath)) {
      try {
        const mediaMapRaw = fs.readFileSync(mediaMapPath, 'utf-8');
        mediaMap = JSON.parse(mediaMapRaw);
      } catch (e) {
        console.error("Error parsing media_map.json", e);
      }
    }

    const processedTweets = allTweets.map((t: any) => {
      let mediaList: Media[] = [];

      if (Array.isArray(t.media) && t.media.length > 0 && typeof t.media[0] === 'string') {
        mediaList = t.media.map((id: string) => {
          const m = mediaMap[id];
          if (!m) return null;
          return {
            type: m.type === 'video' ? 'video' : 'photo',
            url: m.url,
            thumbnail_url: m.thumbnail_url || m.url 
          };
        }).filter(Boolean);
      } 
      else if (t.extended_entities?.media) {
        mediaList = t.extended_entities.media.map((m: any) => ({
          type: m.type,
          url: m.video_info?.variants?.[0]?.url || m.media_url_https,
          thumbnail_url: m.media_url_https
        }));
      }

      return {
        ...t,
        media: mediaList 
      };
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const tweets = processedTweets.slice(start, end);

    return {
      tweets,
      total: processedTweets.length,
      hasMore: end < processedTweets.length
    };

  } catch (error) {
    console.error(`Error loading tweets for ${slug}:`, error);
    return { tweets: [], total: 0, hasMore: false };
  }
}


export async function getMedia(slug: string) {

  const { tweets } = await getTweets(slug, 1, 999999); 
  
  let mediaList: Media[] = [];
  
  tweets.forEach((t: Tweet) => {
     if (t.media && t.media.length > 0) {
       mediaList.push(...t.media);
     }
  });

  return mediaList;
}

export interface ProfileData {
  name: string;
  color: string;
  status: string;
  character: string;
  birthday: string;
  birthplace: string;
  blood_type: string;
  height: string;
  message: string;
  assets: {
    formula: string;
    signature: string;
  };
}


export async function getProfile(slug: string): Promise<ProfileData | null> {
  const profilePath = path.join(process.cwd(), 'data', slug, 'profile.json');

  try {
    if (fs.existsSync(profilePath)) {
      const fileContents = fs.readFileSync(profilePath, 'utf-8');
      return JSON.parse(fileContents);
    }
  } catch (error) {
    console.error(`Error loading profile for ${slug}:`, error);
  }
  return null;
}

export async function getUsers() {
  const members = getAllMembers();

  const results = members.map((member) => {
    const dir = getPlatformDir(member.slug, 'twitter');
    const userPath = path.join(dir, 'user.json');
    
    let twitterData: any = {};
    if (fs.existsSync(userPath)) {
      try {
        twitterData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
      } catch (e) { /* ignore */ }
    }

    return {
      slug: member.slug,
      name: member.name,
      screen_name: member.accounts.twitter,
      avatar: twitterData.avatar || twitterData.profile_image_url_https || member.avatar,
      bio: member.bio || twitterData.bio || twitterData.description || ""
    };
  });

  return results;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  type?: 'milestone' | 'release' | 'graduation' | 'default';
}

export async function getTimeline(slug: string): Promise<TimelineEvent[]> {
  try {
    
    const filePath = path.join(process.cwd(), 'data', slug, 'timeline.json');
    // 👇 关键修改：使用 fs.promises.readFile
    // 这样既可以使用 await，又不影响其他函数使用 fs.existsSync
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    
    return JSON.parse(fileContents);
  } catch (error) {
    // 简单的错误处理
    return [];
  }
}