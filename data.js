// SwarSmriti - Expanded Song Catalog with YouTube Integration
// Using YouTube video IDs for legal music playback

const DATA = {
  moods: [
    { id: 'nostalgic', label: 'Nostalgic', emoji: '📻' },
    { id: 'sad', label: 'Melancholic', emoji: '🌧️' },
    { id: 'romantic', label: 'Romantic', emoji: '💕' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡' },
    { id: 'hopeful', label: 'Hopeful', emoji: '🌅' },
    { id: 'devotional', label: 'Devotional', emoji: '🙏' },
    { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' }
  ],

  artists: [
    {
      id: 'a_jagjit',
      name: 'Jagjit Singh',
      era: '1941–2011',
      genres: ['Ghazal', 'Devotional'],
      region: 'Punjab',
      bio: 'The Ghazal King of India, known for his soulful voice and profound lyrics that touch the heart.',
      image: '🎤'
    },
    {
      id: 'a_lata',
      name: 'Lata Mangeshkar',
      era: '1929–2022',
      genres: ['Film', 'Classical', 'Devotional'],
      region: 'Maharashtra',
      bio: 'The Nightingale of India with a career spanning over seven decades and thousands of songs.',
      image: '🌹'
    },
    {
      id: 'a_kishore',
      name: 'Kishore Kumar',
      era: '1929–1987',
      genres: ['Film', 'Playback', 'Comedy'],
      region: 'Bengal',
      bio: 'The versatile genius - singer, actor, lyricist, composer, producer, director, and screenwriter.',
      image: '🎭'
    },
    {
      id: 'a_rahman',
      name: 'A.R. Rahman',
      era: '1967–',
      genres: ['Film', 'Fusion', 'World Music'],
      region: 'Tamil Nadu',
      bio: 'The Mozart of Madras, Oscar and Grammy winner who revolutionized Indian film music.',
      image: '🏆'
    },
    {
      id: 'a_ms',
      name: 'M. S. Subbulakshmi',
      era: '1916–2004',
      genres: ['Carnatic', 'Classical', 'Devotional'],
      region: 'Tamil Nadu',
      bio: 'The Queen of Carnatic music, first musician to receive Bharat Ratna.',
      image: '🪷'
    },
    {
      id: 'a_rafi',
      name: 'Mohammad Rafi',
      era: '1924–1980',
      genres: ['Film', 'Playback', 'Ghazal'],
      region: 'Punjab',
      bio: 'One of the greatest and most influential playback singers in Indian cinema history.',
      image: '⭐'
    },
    {
      id: 'a_mukesh',
      name: 'Mukesh',
      era: '1923–1976',
      genres: ['Film', 'Romantic', 'Sad'],
      region: 'Delhi',
      bio: 'The voice of Raj Kapoor, known for his melancholic and deeply emotional renditions.',
      image: '💫'
    },
    {
      id: 'a_rd',
      name: 'R.D. Burman',
      era: '1939–1994',
      genres: ['Composer', 'Film', 'Experimental'],
      region: 'West Bengal',
      bio: 'Pancham Da - the innovative composer who introduced rock, jazz, and electronic elements to Bollywood.',
      image: '🎹'
    },
    {
      id: 'a_hari',
      name: 'Hariharan',
      era: '1955–',
      genres: ['Ghazal', 'Fusion', 'Playback'],
      region: 'Kerala',
      bio: 'Contemporary ghazal maestro and playback singer with a unique, soulful voice.',
      image: '🎵'
    },
    {
      id: 'a_nusrat',
      name: 'Nusrat Fateh Ali Khan',
      era: '1948–1997',
      genres: ['Qawwali', 'Sufi', 'Spiritual'],
      region: 'Pakistan',
      bio: 'Shahenshah-e-Qawwali - The Emperor of Qawwali who brought Sufi music to the world stage.',
      image: '🌙'
    },
    {
      id: 'a_asha',
      name: 'Asha Bhosle',
      era: '1933–',
      genres: ['Film', 'Pop', 'Classical'],
      region: 'Maharashtra',
      bio: 'Versatile singer with the most recorded artist in music history title by Guinness.',
      image: '🎀'
    },
    {
      id: 'a_mehdi',
      name: 'Mehdi Hassan',
      era: '1927–2012',
      genres: ['Ghazal', 'Classical'],
      region: 'Pakistan',
      bio: 'The King of Ghazal, whose voice could make stones weep.',
      image: '👑'
    }
  ],

  songs: [
    // Jagjit Singh Songs
    {
      id: 's1',
      title: 'Hothon Se Chhu Lo Tum',
      artist: 'a_jagjit',
      year: 1981,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'IVBbNwjRmMQ',
      album: 'Prem Geet'
    },
    {
      id: 's2',
      title: 'Chithi Na Koi Sandesh',
      artist: 'a_jagjit',
      year: 1987,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 60,
      youtubeId: 'vmBNmz77J70',
      album: 'Jagjit Singh Live'
    },
    {
      id: 's3',
      title: 'Woh Kagaz Ki Kashti',
      artist: 'a_jagjit',
      year: 1987,
      moods: ['nostalgic', 'sad', 'peaceful'],
      tempo: 'slow',
      bpm: 64,
      youtubeId: 'Tpk89FYFZ_I',
      album: 'Jagjit Singh Live'
    },
    {
      id: 's4',
      title: 'Tum Itna Jo Muskura Rahe Ho',
      artist: 'a_jagjit',
      year: 1982,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 66,
      youtubeId: 'lHixXFMsQqM',
      album: 'Arth'
    },
    {
      id: 's5',
      title: 'Hazaron Khwahishen Aisi',
      artist: 'a_jagjit',
      year: 1990,
      moods: ['sad', 'peaceful'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: 'L0LzqoJQlmk',
      album: 'Mirza Ghalib'
    },

    // Lata Mangeshkar Songs
    {
      id: 's6',
      title: 'Lag Ja Gale',
      artist: 'a_lata',
      year: 1964,
      moods: ['romantic', 'sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 66,
      youtubeId: 'TFr6G5zveS8',
      album: 'Woh Kaun Thi'
    },
    {
      id: 's7',
      title: 'Ajeeb Dastan Hai Yeh',
      artist: 'a_lata',
      year: 1960,
      moods: ['romantic', 'nostalgic', 'sad'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'a3vsxV8_ZvA',
      album: 'Dil Apna Aur Preet Parai'
    },
    {
      id: 's8',
      title: 'Ek Pyar Ka Nagma Hai',
      artist: 'a_lata',
      year: 1972,
      moods: ['romantic', 'hopeful', 'peaceful'],
      tempo: 'slow',
      bpm: 70,
      youtubeId: 'JR8ROJ2p9dE',
      album: 'Shor'
    },
    {
      id: 's9',
      title: 'Tujhe Dekha To Ye Jaana Sanam',
      artist: 'a_lata',
      year: 1995,
      moods: ['romantic', 'hopeful'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'c1_vvPiXsXY',
      album: 'DDLJ'
    },

    // Kishore Kumar Songs
    {
      id: 's10',
      title: 'Mere Sapno Ki Rani',
      artist: 'a_kishore',
      year: 1969,
      moods: ['romantic', 'energetic', 'hopeful'],
      tempo: 'medium',
      bpm: 95,
      youtubeId: 'PBrJN0-RKZU',
      album: 'Aradhana'
    },
    {
      id: 's11',
      title: 'Roop Tera Mastana',
      artist: 'a_kishore',
      year: 1969,
      moods: ['romantic'],
      tempo: 'slow',
      bpm: 72,
      youtubeId: 'XC4aPb7JV0k',
      album: 'Aradhana'
    },
    {
      id: 's12',
      title: 'Pal Pal Dil Ke Paas',
      artist: 'a_kishore',
      year: 1973,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'zY8s_qeeF5E',
      album: 'Blackmail'
    },
    {
      id: 's13',
      title: 'Yeh Shaam Mastani',
      artist: 'a_kishore',
      year: 1975,
      moods: ['romantic', 'peaceful'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'G-LQspjC3Ug',
      album: 'Kati Patang'
    },

    // R.D. Burman Songs
    {
      id: 's14',
      title: 'Dum Maro Dum',
      artist: 'a_rd',
      year: 1971,
      moods: ['energetic'],
      tempo: 'fast',
      bpm: 120,
      youtubeId: 'VXZANGe8vxU',
      album: 'Hare Rama Hare Krishna'
    },
    {
      id: 's15',
      title: 'Chura Liya Hai Tumne',
      artist: 'a_rd',
      year: 1973,
      moods: ['romantic', 'nostalgic'],
      tempo: 'medium',
      bpm: 88,
      youtubeId: 'L_G4DrVyiac',
      album: 'Yaadon Ki Baaraat'
    },

    // Mohammad Rafi Songs
    {
      id: 's16',
      title: 'Likhe Jo Khat Tujhe',
      artist: 'a_rafi',
      year: 1965,
      moods: ['romantic', 'nostalgic'],
      tempo: 'medium',
      bpm: 90,
      youtubeId: 'M2fy_y3Z6hY',
      album: 'Kanyadaan'
    },
    {
      id: 's17',
      title: 'Chahoonga Main Tujhe',
      artist: 'a_rafi',
      year: 1969,
      moods: ['romantic', 'hopeful'],
      tempo: 'slow',
      bpm: 70,
      youtubeId: 'U1ypOWxJvSs',
      album: 'Dosti'
    },
    {
      id: 's18',
      title: 'Taarif Karun Kya Uski',
      artist: 'a_rafi',
      year: 1965,
      moods: ['romantic', 'peaceful'],
      tempo: 'medium',
      bpm: 82,
      youtubeId: 'j9RjNKqfaAo',
      album: 'Kashmir Ki Kali'
    },

    // Mukesh Songs
    {
      id: 's19',
      title: 'Kabhi Kabhi Mere Dil Mein',
      artist: 'a_mukesh',
      year: 1976,
      moods: ['romantic', 'nostalgic', 'peaceful'],
      tempo: 'slow',
      bpm: 60,
      youtubeId: 'rI5xzv9aKWs',
      album: 'Kabhi Kabhie'
    },
    {
      id: 's20',
      title: 'Jeena Yahan Marna Yahan',
      artist: 'a_mukesh',
      year: 1970,
      moods: ['hopeful', 'nostalgic'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'cF0UrxgjV9U',
      album: 'Mera Naam Joker'
    },

    // Nusrat Fateh Ali Khan Songs
    {
      id: 's21',
      title: 'Afreen Afreen',
      artist: 'a_nusrat',
      year: 1996,
      moods: ['romantic', 'devotional', 'peaceful'],
      tempo: 'medium',
      bpm: 78,
      youtubeId: 'qc9SelNqdTc',
      album: 'Sangam'
    },
    {
      id: 's22',
      title: 'Tumhe Dillagi Bhool Jani Padegi',
      artist: 'a_nusrat',
      year: 1990,
      moods: ['romantic', 'sad'],
      tempo: 'medium',
      bpm: 80,
      youtubeId: 'TYRDgd3Tb44',
      album: 'Live Concert'
    },
    {
      id: 's23',
      title: 'Dam Mast Qalandar',
      artist: 'a_nusrat',
      year: 1988,
      moods: ['energetic', 'devotional'],
      tempo: 'fast',
      bpm: 130,
      youtubeId: 'FxPdv8URIYY',
      album: 'Qawwali Collection'
    },

    // A.R. Rahman Songs
    {
      id: 's24',
      title: 'Kun Faya Kun',
      artist: 'a_rahman',
      year: 2011,
      moods: ['devotional', 'peaceful', 'hopeful'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'T94PHkuydcw',
      album: 'Rockstar'
    },
    {
      id: 's25',
      title: 'Jai Ho',
      artist: 'a_rahman',
      year: 2008,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 135,
      youtubeId: 'xwwAVRyNmgQ',
      album: 'Slumdog Millionaire'
    },

    // M.S. Subbulakshmi Songs
    {
      id: 's26',
      title: 'Suprabhatam',
      artist: 'a_ms',
      year: 1963,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 55,
      youtubeId: 'fWEJk32dA9g',
      album: 'Devotional Songs'
    }
  ]
};
