export interface Member {
  slug: string;      
  name: string;     
  avatar: string;   
  

  accounts: {
    twitter: string; 
    instagram?: string;
  };


  bio?: string; 
}

export const MEMBERS: Member[] = [
  {
    slug: 'moe', 
    
    name: '涼花萌',
    
    avatar: 'https://nananiji.zzzhxxx.top/assets/photo/avatar/moe.jpg!avatar', 
    
    accounts: {
      twitter: 'moepiyo_227', 
      instagram: 'moepiyo227' 
    },
    
    bio: 'みなさんにお会いできるのを楽しみに頑張ります！\n鳥と桃が大好きです！' 
  }
];

export function getMemberBySlug(slug: string): Member | undefined {
  return MEMBERS.find(m => m.slug === slug);
}

export function getAllMembers(): Member[] {
  return MEMBERS;
}

