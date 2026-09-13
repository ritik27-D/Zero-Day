const researcherPortraits: Record<string, string> = {
  "dr-aisha-rahman": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=240&q=85",
  "niran-shrestha": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85",
  "maya-gurung": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=85",
  "leela-karki": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=85",
  "dr-bikash-adhikari": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=85",
  "anjali-tamang": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85",
  "prabin-joshi": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=85",
  "sunita-sharma": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=85",
  "rohan-thapa": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=85",
  "deepa-bhattarai": "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=240&q=85",
};

export function getResearcherPortrait(slug: string) {
  return researcherPortraits[slug] ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=85";
}
