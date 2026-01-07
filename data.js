// Seed data for SwarSmriti (with placeholders for local audio & thumbnail)
const DATA = {
  moods:[
    {id:'nostalgic',label:'Nostalgic',emoji:'📻'},
    {id:'sad',label:'Sad',emoji:'😢'},
    {id:'romantic',label:'Romantic',emoji:'❤️'},
    {id:'energetic',label:'Energetic',emoji:'⚡'},
    {id:'hopeful',label:'Hopeful',emoji:'🌅'}
  ],
  artists:[
    {id:'a_jagjit',name:'Jagjit Singh',era:'1941–2011',genres:['Ghazal'],region:'Punjab',bio:'Legendary ghazal singer known for soul-stirring voice.'},
    {id:'a_lata',name:'Lata Mangeshkar',era:'1929–2022',genres:['Film','Classical'],region:'Maharashtra',bio:'The melody queen of India.'},
    {id:'a_kishore',name:'Kishore Kumar',era:'1929–1987',genres:['Film','Playback'],region:'Bengal',bio:'Versatile playback singer and actor.'},
    {id:'a_rahman',name:'A.R. Rahman',era:'1967–',genres:['Film','Fusion'],region:'Tamil Nadu',bio:'Oscar-winning composer and musician.'},
    {id:'a_ms',name:'M. S. Subbulakshmi',era:'1916–2004',genres:['Classical','Devotional'],region:'Tamil Nadu',bio:'A voice of devotion and classical purity.'},
    {id:'a_rafi',name:'Mohammad Rafi',era:'1924–1980',genres:['Film'],region:'Punjab',bio:'One of the greatest playback singers.'},
    {id:'a_mukesh',name:'Mukesh',era:'1923–1976',genres:['Film','Romantic'],region:'Delhi',bio:'Known for melancholic and romantic songs.'},
    {id:'a_rd',name:'R.D. Burman',era:'1939–1994',genres:['Composer','Film'],region:'West Bengal',bio:'Innovative composer and arranger.'},
    {id:'a_hari',name:'Hariharan',era:'1955–',genres:['Ghazal','Fusion'],region:'Kerala',bio:'Ghazal maestro and playback singer.'},
    {id:'a_nusrat',name:'Nusrat Fateh Ali Khan',era:'1948–1997',genres:['Qawwali','Spiritual'],region:'Pakistan',bio:'Universal voice of Qawwali.'}
  ],
  songs:[
    // NOTE: put real files in /assets/ and change these names accordingly
    {id:'s1',title:'Hothon Se Chhu Lo Tum (Jagjit Singh)',artist:'a_jagjit',year:1980,moods:['romantic','nostalgic'],tempo:'slow',bpm:68,preview:'assets/jagjit_hothon_preview.mp3',audio:'assets/jagjit_hothon_full.mp3',thumbnail:'/mnt/data/c54456ca-36f0-4657-ae87-d34d4e985135.png'},
    {id:'s2',title:'Chithi Na Koi Sandesh (Jagjit Singh)',artist:'a_jagjit',year:1990,moods:['sad','nostalgic'],tempo:'slow',bpm:60,preview:'assets/jagjit_chithi_preview.mp3',audio:'assets/jagjit_chithi_full.mp3',thumbnail:'/mnt/data/c54456ca-36f0-4657-ae87-d34d4e985135.png'},
    {id:'s3',title:'Woh Kagaz Ki Kashti (Jagjit Singh)',artist:'a_jagjit',year:1975,moods:['nostalgic','sad'],tempo:'slow',bpm:64,preview:'assets/jagjit_kashti_preview.mp3',audio:'assets/jagjit_kashti_full.mp3',thumbnail:'/mnt/data/c54456ca-36f0-4657-ae87-d34d4e985135.png'},
    {id:'s4',title:'Lag Ja Gale (Lata Mangeshkar)',artist:'a_lata',year:1964,moods:['romantic','sad','nostalgic'],tempo:'slow',bpm:66,preview:'assets/lagja_preview.mp3',audio:'assets/lagja_full.mp3',thumbnail:'/mnt/data/c54456ca-36f0-4657-ae87-d34d4e985135.png'},
    {id:'s5',title:'Dum Maro Dum (R.D. Burman)',artist:'a_rd',year:1971,moods:['energetic'],tempo:'fast',bpm:120,preview:'assets/dum_preview.mp3',audio:'assets/dum_full.mp3',thumbnail:'/mnt/data/c54456ca-36f0-4657-ae87-d34d4e985135.png'}
    // add more songs as needed
  ]
};
