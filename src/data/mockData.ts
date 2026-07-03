export interface Episode {
  episodeNumber: number;
  title: string;
  servers: {
    [key: string]: string;
  };
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  genres: string[];
  rating: number;
  bannerImage: string;
  posterImage: string;
  episodes: Episode[];
}

export const mockAnimeData: Anime[] = [
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    description: "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason, the story follows Eren Yeager, who vows to exterminate the Titans after they bring about the destruction of his hometown and the death of his mother.",
    genres: ["Action", "Drama", "Fantasy"],
    rating: 9.0,
    bannerImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80",
    posterImage: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
    episodes: [
      { episodeNumber: 1, title: "To You, in 2000 Years", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 2, title: "That Day: The Fall of Shiganshina", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 3, title: "A Dim Light in the Darkness", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 4, title: "The Night of the Closing Ceremony", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 5, title: "First Battle", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    ],
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    genres: ["Action", "Adventure", "Supernatural"],
    rating: 8.9,
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80",
    posterImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
    episodes: [
      { episodeNumber: 1, title: "Cruelty", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 2, title: "Trainer Sakonji Urokodaki", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 3, title: "Sabito and Makomo", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 4, title: "Final Selection", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 5, title: "My Own Steel", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    ],
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    description: "Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, the King of Curses.",
    genres: ["Action", "Supernatural", "Thriller"],
    rating: 8.8,
    bannerImage: "https://images.unsplash.com/photo-1614726365723-49cfae92782f?w=1920&q=80",
    posterImage: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
    episodes: [
      { episodeNumber: 1, title: "Ryomen Sukuna", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 2, title: "Dreams of Death", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 3, title: "Girl of Steel", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 4, title: "Dear Sister", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 5, title: "Curse Womb Must Die", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    ],
  },
  {
    id: "one-piece",
    title: "One Piece",
    description: "Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the King of All Pirates. With a course charted for the treacherous waters of the Grand Line and beyond, this is one captain who'll never drop anchor until he's claimed the greatest treasure on Earth.",
    genres: ["Action", "Adventure", "Comedy"],
    rating: 8.7,
    bannerImage: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&q=80",
    posterImage: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&q=80",
    episodes: [
      { episodeNumber: 1, title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 2, title: "Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 3, title: "Morgan versus Luffy! Who's the Mysterious Pretty Girl?", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 4, title: "Luffy's Past! Enter Red-Haired Shanks!", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
      { episodeNumber: 5, title: "Fear, Mysterious Power! Pirate Clown Captain Buggy!", servers: { "Server 1 (Gogo)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 2 (Vidstreaming)": "https://www.youtube.com/embed/dQw4w9WgXcQ", "Server 3 (Backup)": "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
    ],
  },
];

export const getAnimeById = (id: string): Anime | undefined => {
  return mockAnimeData.find((anime) => anime.id === id);
};

export const getEpisodeByNumber = (animeId: string, episodeNumber: number): Episode | undefined => {
  const anime = getAnimeById(animeId);
  return anime?.episodes.find((ep) => ep.episodeNumber === episodeNumber);
};
