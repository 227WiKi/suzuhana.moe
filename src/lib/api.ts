import { getMemberBySlug, getAllMembers } from './members';

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

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  type?: 'milestone' | 'release' | 'graduation' | 'default';
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

export interface InstagramPost {
  id: string;
  date: string;
  text: string;
  images: string[];
}

export async function getUserData(slug: string, platform: 'twitter' | 'instagram' = 'twitter') {
  const member = getMemberBySlug(slug);
  if (!member) return null;

  try {
    let platformUser: any = {};
    try {
      // @ts-ignore
      const userModule = await import(`../../data/${slug}/${platform}/user.json`);
      platformUser = userModule.default || userModule;
    } catch (e) {
      console.warn(`[API] User data not found for ${slug} on ${platform}`);
    }

    let realPostCount = 0;
    
    if (platformUser.stats) {
      realPostCount = platformUser.stats.tweets || 
                      platformUser.stats.posts || 
                      platformUser.stats.statuses_count || 0;
    }

    try {
      if (platform === 'twitter') {
        // @ts-ignore
        const tweetsModule = await import(`../../data/${slug}/twitter/tweets.json`);
        const tweetsData = tweetsModule.default || tweetsModule;
        if (Array.isArray(tweetsData)) {
          realPostCount = tweetsData.length;
        } else if (tweetsData && Array.isArray(tweetsData.tweets)) {
          realPostCount = tweetsData.tweets.length;
        }
      } else if (platform === 'instagram') {
        // @ts-ignore
        const postsModule = await import(`../../data/${slug}/instagram/posts.json`);
        const postsData = postsModule.default || postsModule;

        if (Array.isArray(postsData)) {
          realPostCount = postsData.length;
        } else if (postsData && Array.isArray(postsData.posts)) {
          realPostCount = postsData.posts.length;
        }
      }
    } catch (e) {
    }

    return {
      slug: member.slug,
      name: member.name, 
      nickname: platformUser.name || member.name, 
      platform: platform,
      avatar: platformUser.avatar || platformUser.profile_image_url_https || platformUser.profile_pic_url || member.avatar,
      banner: platformUser.banner || platformUser.profile_banner_url || null,
      bio: platformUser.bio || platformUser.description || member.bio || "",
      screen_name: platformUser.screen_name || member.accounts[platform] || member.accounts.twitter,
      stats: {
        tweets: realPostCount,
        posts: realPostCount,
        following: platformUser.stats?.following || 0,
        followers: platformUser.stats?.followers || 0,
      },
      raw: platformUser
    };

  } catch (error) {
    console.error(`Error loading user data for ${slug}:`, error);
    return null;
  }
}

export async function getTweets(slug: string): Promise<Tweet[]> {
  try {
    // @ts-ignore
    const tweetsModule = await import(`../../data/${slug}/twitter/tweets.json`);
    const allTweets = tweetsModule.default || tweetsModule;
    
    const tweetsArray = Array.isArray(allTweets) ? allTweets : (allTweets.tweets || []);

    let mediaMap: Record<string, any> = {};
    try {
      // @ts-ignore
      const mapModule = await import(`../../data/${slug}/twitter/media_map.json`);
      mediaMap = mapModule.default || mapModule;
    } catch (e) {
    }

    const processedTweets = tweetsArray.map((t: any) => {
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

    return processedTweets;

  } catch (error) {
    console.warn(`No tweets found for ${slug}`);
    return [];
  }
}

export async function getMedia(slug: string) {
  const tweets = await getTweets(slug); 
  let mediaList: Media[] = [];
  tweets.forEach((t: Tweet) => {
     if (t.media && t.media.length > 0) {
       mediaList.push(...t.media);
     }
  });
  return mediaList;
}

export async function getProfile(slug: string): Promise<ProfileData | null> {
  try {
    // @ts-ignore
    const profileModule = await import(`../../data/${slug}/profile.json`);
    return profileModule.default || profileModule;
  } catch (error) {
    return null;
  }
}

export async function getUsers() {
  const members = getAllMembers();

  const results = await Promise.all(members.map(async (member) => {
    let twitterData: any = {};
    try {
      // @ts-ignore
      const userModule = await import(`../../data/${member.slug}/twitter/user.json`);
      twitterData = userModule.default || userModule;
    } catch (e) { }

    return {
      slug: member.slug,
      name: member.name,
      screen_name: member.accounts.twitter,
      avatar: twitterData.avatar || twitterData.profile_image_url_https || member.avatar,
      bio: member.bio || twitterData.bio || twitterData.description || ""
    };
  }));

  return results;
}

export async function getTimeline(slug: string): Promise<TimelineEvent[]> {
  try {
    // @ts-ignore
    const timelineModule = await import(`../../data/${slug}/timeline.json`);
    return timelineModule.default || timelineModule;
  } catch (error) {
    return [];
  }
}

export async function getTweetDateRange(slug: string): Promise<{ start: string, end: string } | null> {
  try {
    // @ts-ignore
    const tweetsModule = await import(`../../data/${slug}/twitter/tweets.json`);
    const tweets = tweetsModule.default || tweetsModule;
    const tweetsArray = Array.isArray(tweets) ? tweets : (tweets.tweets || []);

    if (tweetsArray.length > 0) {
      let min = tweetsArray[0].date;
      let max = tweetsArray[0].date;

      for (const tweet of tweetsArray) {
        if (!tweet.date) continue;
        if (tweet.date < min) min = tweet.date;
        if (tweet.date > max) max = tweet.date;
      }

      return { 
        start: min.substring(0, 10), 
        end: max.substring(0, 10) 
      };
    }
  } catch (error) {
    return null;
  }
  return null;
}

export async function getInstagramPosts(slug: string): Promise<InstagramPost[]> {
  try {
    // @ts-ignore
    const postsModule = await import(`../../data/${slug}/instagram/posts.json`);
    const postsData = postsModule.default || postsModule;

    let posts: InstagramPost[] = [];

    if (Array.isArray(postsData)) {
      posts = postsData;
    } else if (postsData.posts && Array.isArray(postsData.posts)) {
      posts = postsData.posts;
    }
    return posts.sort((a, b) => b.id.localeCompare(a.id));

  } catch (error) {
    console.warn(`Instagram posts not found for ${slug}`);
    return [];
  }
}