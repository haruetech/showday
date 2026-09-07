export type Show = {
  id: string; title: string; artist: string; venue: string; date: string; time: string;
  genre: string; tags: string[]; tone: string; poster?: string;
};

export const shows: Show[] = [
  { id:'s1', title:'The Night We Remember', artist:'LEE MOON SAE', venue:'세종문화회관', date:'SEP 12', time:'19:30', genre:'콘서트', tags:['50+ 추천','부부 추천','서울'], tone:'warm' },
  { id:'s2', title:'CITY LIGHTS LIVE', artist:'JAZZ COLLECTIVE', venue:'블루스퀘어', date:'SEP 14', time:'18:00', genre:'재즈', tags:['주말','데이트','집에서 34분'], tone:'blue' },
  { id:'s3', title:'NEXT WAVE', artist:'K-POP SPECIAL', venue:'서울아레나', date:'2027 OPEN', time:'TBA', genre:'K-POP', tags:['ARENA NOW','관심 공연장'], tone:'violet' },
  { id:'s4', title:'LIFE TALK 50+', artist:'SPECIAL SPEAKERS', venue:'도봉문화공간', date:'SEP 20', time:'15:00', genre:'강연', tags:['50+','부모님과','도봉'], tone:'green' }
];

export const venues = ['서울아레나','KSPO DOME','고척스카이돔','인스파이어 아레나','세종문화회관','예술의전당'];
