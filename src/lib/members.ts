export interface Member {
  slug: string;      
  name: string;     
  avatar: string;   
  

  accounts: {
    twitter?: string;
    instagram?: string;
    blog: string;
  };


  bio?: string; 
}

export const MEMBERS: Member[] = [
  {
    slug: 'kanae',

    name: '白沢かなえ',

    avatar: 'https://nananiji.zzzhxxx.top/assets/photo/avatar/kanae.jpg!avatar',

    accounts: {
      instagram: '__shiro227',
      blog: 'https://blog.227wiki.eu.org/categories/%E6%88%90%E5%91%98%E5%8D%9A%E5%AE%A2/%E7%99%BD%E6%B2%A2%E3%81%8B%E3%81%AA%E3%81%88/',
    },

    bio: '土踏まずがないことが密かな悩みです。よろしくお願いします！'
  }, {
    slug: 'moe', 
    
    name: '涼花萌',
    
    avatar: 'https://nananiji.zzzhxxx.top/assets/photo/avatar/moe.jpg!avatar', 
    
    accounts: {
      twitter: 'moepiyo_227', 
      instagram: 'moepiyo227',
      blog: 'https://blog.227wiki.eu.org/categories/%E6%88%90%E5%91%98%E5%8D%9A%E5%AE%A2/%E6%B6%BC%E8%8A%B1%E8%90%8C/',
    },
    
    bio: 'みなさんにお会いできるのを楽しみに頑張ります！\n鳥と桃が大好きです！' 
  },
  {
    name: "雨夜音",
    slug: "oto",
    avatar: "https://nananiji.zzzhxxx.top/assets/photo/avatar/oto.jpg!avatar",
    accounts: {
      twitter: 'oto_amaya227', 
      blog: 'https://blog.227wiki.eu.org/categories/%E6%88%90%E5%91%98%E5%8D%9A%E5%AE%A2/%E9%9B%A8%E5%A4%9C%E9%9F%B3/',
    },
     bio: "分からない事ばかりの未熟者ですが全力で頑張ります。よろしくお願い致します。"
  },
];

export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find(m => m.slug === slug);
}

export function getAllMembers(): Member[] {
  return MEMBERS;
}
