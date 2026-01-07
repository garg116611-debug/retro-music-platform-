// SwarSmriti - Comprehensive Song Catalog with YouTube Integration
// Expanded to include 3-5 songs per artist for a richer experience

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
    // ========== JAGJIT SINGH (8 songs) ==========
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
    {
      id: 's6',
      title: 'Jhuki Jhuki Si Nazar',
      artist: 'a_jagjit',
      year: 1982,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'Vl_0F-jqjGI',
      album: 'Arth'
    },
    {
      id: 's7',
      title: 'Tumko Dekha To Ye Khayal Aaya',
      artist: 'a_jagjit',
      year: 1987,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'i5mE1xlsKPk',
      album: 'Saath Saath'
    },
    {
      id: 's8',
      title: 'Koi Fariyaad',
      artist: 'a_jagjit',
      year: 2000,
      moods: ['sad', 'romantic'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: 'PAIggXoLfXs',
      album: 'Tum Bin'
    },

    // ========== LATA MANGESHKAR (8 songs) ==========
    {
      id: 's9',
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
      id: 's10',
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
      id: 's11',
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
      id: 's12',
      title: 'Tujhe Dekha To Ye Jaana Sanam',
      artist: 'a_lata',
      year: 1995,
      moods: ['romantic', 'hopeful'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'c1_vvPPTa8A',
      album: 'DDLJ'
    },
    {
      id: 's13',
      title: 'Bahon Mein Chale Aao',
      artist: 'a_lata',
      year: 1975,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'nAdorxsoRcc',
      album: 'Anamika'
    },
    {
      id: 's14',
      title: 'Tere Bina Zindagi Se',
      artist: 'a_lata',
      year: 1981,
      moods: ['romantic', 'sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 64,
      youtubeId: 'pL3dEZ67hPc',
      album: 'Aandhi'
    },
    {
      id: 's15',
      title: 'Dil To Pagal Hai',
      artist: 'a_lata',
      year: 1997,
      moods: ['romantic', 'energetic'],
      tempo: 'medium',
      bpm: 92,
      youtubeId: 'zCeVP8WW-A0',
      album: 'Dil To Pagal Hai'
    },
    {
      id: 's16',
      title: 'Pyar Kiya To Darna Kya',
      artist: 'a_lata',
      year: 1960,
      moods: ['romantic', 'energetic'],
      tempo: 'medium',
      bpm: 88,
      youtubeId: 'lRXlQPKBKBo',
      album: 'Mughal-e-Azam'
    },

    // ========== KISHORE KUMAR (8 songs) ==========
    {
      id: 's17',
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
      id: 's18',
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
      id: 's19',
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
      id: 's20',
      title: 'Yeh Shaam Mastani',
      artist: 'a_kishore',
      year: 1975,
      moods: ['romantic', 'peaceful'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'G-LQspjC3Ug',
      album: 'Kati Patang'
    },
    {
      id: 's21',
      title: 'Khaike Paan Banaras Wala',
      artist: 'a_kishore',
      year: 1978,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 130,
      youtubeId: 'IDMo1HU1cNo',
      album: 'Don'
    },
    {
      id: 's22',
      title: 'Zindagi Ek Safar Hai Suhana',
      artist: 'a_kishore',
      year: 1971,
      moods: ['hopeful', 'energetic'],
      tempo: 'medium',
      bpm: 95,
      youtubeId: 'RKmREBWahtc',
      album: 'Andaz'
    },
    {
      id: 's23',
      title: 'O Mere Dil Ke Chain',
      artist: 'a_kishore',
      year: 1972,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 70,
      youtubeId: 'lR-MvkOLNTs',
      album: 'Mere Jeevan Saathi'
    },
    {
      id: 's24',
      title: 'Ek Ladki Bheegi Bhaagi Si',
      artist: 'a_kishore',
      year: 1958,
      moods: ['romantic', 'energetic'],
      tempo: 'medium',
      bpm: 100,
      youtubeId: 'Q8OTMHU4AAw',
      album: 'Chalti Ka Naam Gaadi'
    },

    // ========== MOHAMMAD RAFI (8 songs) ==========
    {
      id: 's25',
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
      id: 's26',
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
      id: 's27',
      title: 'Taarif Karun Kya Uski',
      artist: 'a_rafi',
      year: 1965,
      moods: ['romantic', 'peaceful'],
      tempo: 'medium',
      bpm: 82,
      youtubeId: 'j9RjNKqfaAo',
      album: 'Kashmir Ki Kali'
    },
    {
      id: 's28',
      title: 'Chaudhvin Ka Chand Ho',
      artist: 'a_rafi',
      year: 1960,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'E2zGWerh3PY',
      album: 'Chaudhvin Ka Chand'
    },
    {
      id: 's29',
      title: 'Baharo Phool Barsao',
      artist: 'a_rafi',
      year: 1966,
      moods: ['romantic', 'hopeful'],
      tempo: 'medium',
      bpm: 88,
      youtubeId: '6jK9bgQ7N70',
      album: 'Suraj'
    },
    {
      id: 's30',
      title: 'Kya Hua Tera Wada',
      artist: 'a_rafi',
      year: 1977,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'fmRBbI8CRRA',
      album: 'Hum Kisise Kum Naheen'
    },
    {
      id: 's31',
      title: 'Ye Duniya Ye Mehfil',
      artist: 'a_rafi',
      year: 1968,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'EbR3TwYGcX0',
      album: 'Heer Ranjha'
    },
    {
      id: 's32',
      title: 'Main Jat Yamla Pagla Deewana',
      artist: 'a_rafi',
      year: 1975,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 125,
      youtubeId: 'vKjMfAzNlpA',
      album: 'Pratigya'
    },

    // ========== MUKESH (6 songs) ==========
    {
      id: 's33',
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
      id: 's34',
      title: 'Jeena Yahan Marna Yahan',
      artist: 'a_mukesh',
      year: 1970,
      moods: ['hopeful', 'nostalgic'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'cF0UrxgjV9U',
      album: 'Mera Naam Joker'
    },
    {
      id: 's35',
      title: 'Kal Ho Na Ho',
      artist: 'a_mukesh',
      year: 1970,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'RehsyHjG3lM',
      album: 'Mera Naam Joker'
    },
    {
      id: 's36',
      title: 'Suhana Safar Aur Ye Mausam',
      artist: 'a_mukesh',
      year: 1965,
      moods: ['romantic', 'hopeful'],
      tempo: 'medium',
      bpm: 80,
      youtubeId: 'ZONgmXLYP0A',
      album: 'Madhumati'
    },
    {
      id: 's37',
      title: 'Dost Dost Na Raha',
      artist: 'a_mukesh',
      year: 1964,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: 'B7lKg3FphEU',
      album: 'Sangam'
    },
    {
      id: 's38',
      title: 'Main Pal Do Pal Ka Shayar Hoon',
      artist: 'a_mukesh',
      year: 1976,
      moods: ['peaceful', 'nostalgic'],
      tempo: 'slow',
      bpm: 60,
      youtubeId: 'Z0HqjFpoN6U',
      album: 'Kabhi Kabhie'
    },

    // ========== R.D. BURMAN (6 songs) ==========
    {
      id: 's39',
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
      id: 's40',
      title: 'Chura Liya Hai Tumne',
      artist: 'a_rd',
      year: 1973,
      moods: ['romantic', 'nostalgic'],
      tempo: 'medium',
      bpm: 88,
      youtubeId: 'L_G4DrVyiac',
      album: 'Yaadon Ki Baaraat'
    },
    {
      id: 's41',
      title: 'Tere Bina Zindagi Se',
      artist: 'a_rd',
      year: 1975,
      moods: ['romantic', 'sad'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: '0-QMpbhh9t0',
      album: 'Aandhi'
    },
    {
      id: 's42',
      title: 'Mehbooba Mehbooba',
      artist: 'a_rd',
      year: 1975,
      moods: ['energetic', 'romantic'],
      tempo: 'fast',
      bpm: 128,
      youtubeId: 'ulHB2mRMqvI',
      album: 'Sholay'
    },
    {
      id: 's43',
      title: 'Piya Tu Ab To Aaja',
      artist: 'a_rd',
      year: 1971,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 70,
      youtubeId: 'NhCWZdSRqbo',
      album: 'Caravan'
    },
    {
      id: 's44',
      title: 'Yeh Ladka Hai Allah',
      artist: 'a_rd',
      year: 1998,
      moods: ['romantic', 'energetic'],
      tempo: 'fast',
      bpm: 115,
      youtubeId: 'YGJwqWvmM6w',
      album: 'Kabhi Khushi Kabhie Gham'
    },

    // ========== NUSRAT FATEH ALI KHAN (6 songs) ==========
    {
      id: 's45',
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
      id: 's46',
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
      id: 's47',
      title: 'Dam Mast Qalandar',
      artist: 'a_nusrat',
      year: 1988,
      moods: ['energetic', 'devotional'],
      tempo: 'fast',
      bpm: 130,
      youtubeId: 'FxPdv8URIYY',
      album: 'Qawwali Collection'
    },
    {
      id: 's48',
      title: 'Sanu Ek Pal Chain Na Aave',
      artist: 'a_nusrat',
      year: 1990,
      moods: ['romantic', 'sad'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'Jt3xwWpFbOw',
      album: 'Live Concert'
    },
    {
      id: 's49',
      title: 'Wohi Khuda Hai',
      artist: 'a_nusrat',
      year: 1992,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'G0P-FZBo9Ok',
      album: 'Supreme Collection'
    },
    {
      id: 's50',
      title: 'Tu Meri Test',
      artist: 'a_nusrat',
      year: 1995,
      moods: ['romantic', 'devotional'],
      tempo: 'medium',
      bpm: 82,
      youtubeId: 'kLCLFsxNqDQ',
      album: 'Sangam'
    },

    // ========== A.R. RAHMAN (6 songs) ==========
    {
      id: 's51',
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
      id: 's52',
      title: 'Jai Ho',
      artist: 'a_rahman',
      year: 2008,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 135,
      youtubeId: 'xwwAVRyNmgQ',
      album: 'Slumdog Millionaire'
    },
    {
      id: 's53',
      title: 'Dil Se Re',
      artist: 'a_rahman',
      year: 1998,
      moods: ['romantic', 'energetic'],
      tempo: 'fast',
      bpm: 120,
      youtubeId: 'pEHwNcALYv4',
      album: 'Dil Se'
    },
    {
      id: 's54',
      title: 'Maa Tujhe Salaam',
      artist: 'a_rahman',
      year: 1997,
      moods: ['devotional', 'hopeful', 'peaceful'],
      tempo: 'medium',
      bpm: 85,
      youtubeId: 'jDn2bn7_YSM',
      album: 'Vande Mataram'
    },
    {
      id: 's55',
      title: 'Chaiyya Chaiyya',
      artist: 'a_rahman',
      year: 1998,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 130,
      youtubeId: 'YOYN9qNXmAw',
      album: 'Dil Se'
    },
    {
      id: 's56',
      title: 'Tere Bina',
      artist: 'a_rahman',
      year: 2007,
      moods: ['romantic', 'sad'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'kEwTOB0RVN8',
      album: 'Guru'
    },

    // ========== ASHA BHOSLE (6 songs) ==========
    {
      id: 's57',
      title: 'Parde Mein Rehne Do',
      artist: 'a_asha',
      year: 1958,
      moods: ['romantic', 'nostalgic'],
      tempo: 'medium',
      bpm: 90,
      youtubeId: 'kN41_VpIKSs',
      album: 'Shikar'
    },
    {
      id: 's58',
      title: 'In Ankhon Ki Masti',
      artist: 'a_asha',
      year: 1981,
      moods: ['romantic', 'peaceful'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'TBzj4Rfj_98',
      album: 'Umrao Jaan'
    },
    {
      id: 's59',
      title: 'Dil Cheez Kya Hai',
      artist: 'a_asha',
      year: 1981,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'HWgnU9xQi8g',
      album: 'Umrao Jaan'
    },
    {
      id: 's60',
      title: 'O Mere Sona Re',
      artist: 'a_asha',
      year: 1966,
      moods: ['romantic', 'energetic'],
      tempo: 'medium',
      bpm: 95,
      youtubeId: 'W_V8rPxgjQo',
      album: 'Teesri Manzil'
    },
    {
      id: 's61',
      title: 'Dum Maro Dum (Female)',
      artist: 'a_asha',
      year: 1971,
      moods: ['energetic'],
      tempo: 'fast',
      bpm: 120,
      youtubeId: 'VXZANGe8vxU',
      album: 'Hare Rama Hare Krishna'
    },
    {
      id: 's62',
      title: 'Chura Ke Dil Mera',
      artist: 'a_asha',
      year: 1994,
      moods: ['romantic', 'energetic'],
      tempo: 'fast',
      bpm: 125,
      youtubeId: 'rCKNJvx9G_s',
      album: 'Main Khiladi Tu Anari'
    },

    // ========== HARIHARAN (5 songs) ==========
    {
      id: 's63',
      title: 'Kaash Aisa Koi Manzar Hota',
      artist: 'a_hari',
      year: 1990,
      moods: ['romantic', 'nostalgic'],
      tempo: 'slow',
      bpm: 65,
      youtubeId: 'GJfTksxKm9g',
      album: 'Ghazal Collection'
    },
    {
      id: 's64',
      title: 'Tu Hi Re',
      artist: 'a_hari',
      year: 1995,
      moods: ['romantic', 'sad'],
      tempo: 'slow',
      bpm: 68,
      youtubeId: 'YxGRl8zlYTs',
      album: 'Bombay'
    },
    {
      id: 's65',
      title: 'Jhoom Barabar Jhoom',
      artist: 'a_hari',
      year: 2007,
      moods: ['energetic', 'hopeful'],
      tempo: 'fast',
      bpm: 135,
      youtubeId: 'F8m3LbLVLso',
      album: 'Jhoom Barabar Jhoom'
    },
    {
      id: 's66',
      title: 'Teri Yaad',
      artist: 'a_hari',
      year: 1998,
      moods: ['romantic', 'sad'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'n7k0E_6ByqU',
      album: 'Kaash'
    },
    {
      id: 's67',
      title: 'Chappa Chappa Charkha Chale',
      artist: 'a_hari',
      year: 1995,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 60,
      youtubeId: 'A_zd_EJFm4g',
      album: 'Sufi Collection'
    },

    // ========== MEHDI HASSAN (5 songs) ==========
    {
      id: 's68',
      title: 'Ranjish Hi Sahi',
      artist: 'a_mehdi',
      year: 1980,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: '0FWuZtNqXPw',
      album: 'Ghazal Collection'
    },
    {
      id: 's69',
      title: 'Gulon Mein Rang Bhare',
      artist: 'a_mehdi',
      year: 1974,
      moods: ['romantic', 'peaceful'],
      tempo: 'slow',
      bpm: 62,
      youtubeId: 'cOFF8GjHlGA',
      album: 'Live Concert'
    },
    {
      id: 's70',
      title: 'Zindagi Mein To Sabhi',
      artist: 'a_mehdi',
      year: 1982,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 60,
      youtubeId: '5BDq4bP7Xn0',
      album: 'Ghazal Collection'
    },
    {
      id: 's71',
      title: 'Patta Patta Boota Boota',
      artist: 'a_mehdi',
      year: 1978,
      moods: ['sad', 'peaceful'],
      tempo: 'slow',
      bpm: 55,
      youtubeId: 'TNwHiI7ZkPg',
      album: 'Classics'
    },
    {
      id: 's72',
      title: 'Ye Dunya Ye Mehfil',
      artist: 'a_mehdi',
      year: 1985,
      moods: ['sad', 'nostalgic'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: '9AvWhArLg2Y',
      album: 'Live Concert'
    },

    // ========== M.S. SUBBULAKSHMI (5 songs) ==========
    {
      id: 's73',
      title: 'Suprabhatam',
      artist: 'a_ms',
      year: 1963,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 55,
      youtubeId: 'fWEJk32dA9g',
      album: 'Devotional Songs'
    },
    {
      id: 's74',
      title: 'Bhaja Govindam',
      artist: 'a_ms',
      year: 1970,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 52,
      youtubeId: '4GhbCWwg0yI',
      album: 'Classical Collection'
    },
    {
      id: 's75',
      title: 'Kurai Ondrum Illai',
      artist: 'a_ms',
      year: 1965,
      moods: ['devotional', 'hopeful'],
      tempo: 'slow',
      bpm: 58,
      youtubeId: 'YyJvE7H_n4w',
      album: 'Tamil Devotional'
    },
    {
      id: 's76',
      title: 'Vishnu Sahasranamam',
      artist: 'a_ms',
      year: 1968,
      moods: ['devotional', 'peaceful'],
      tempo: 'slow',
      bpm: 50,
      youtubeId: 'RhPupsQbPGw',
      album: 'Sacred Chants'
    },
    {
      id: 's77',
      title: 'Hanuman Chalisa',
      artist: 'a_ms',
      year: 1975,
      moods: ['devotional', 'energetic'],
      tempo: 'medium',
      bpm: 80,
      youtubeId: 'bVb2W3a5tRk',
      album: 'Devotional Classics'
    }
  ]
};
