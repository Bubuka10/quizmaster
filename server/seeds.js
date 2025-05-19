import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import Question from './models/Question.js';
import Option from './models/Option.js';
import { MONGO_URI } from './config.js';

mongoose.connect(MONGO_URI)
  .then(() => {
    seedQuizzes();
  })
  .catch((err) => {
    console.error('Hiba történt az adatbázis csatlakozásakor:', err);
  });

const quizzesData = [
  {
    title: 'Történelem',
    questionCount: 10,
    questions: [
      { questionText: 'Melyik nemzet írta alá az elsőként a második világháborút lezáró békeszerződést??', options: [{ optionText: 'Németország', isCorrect: true }, { optionText: 'Japán', isCorrect: false }, { optionText: 'Olaszország', isCorrect: false }, { optionText: 'Franciaország', isCorrect: false }] },
      { questionText: 'Melyik évben érte el Kolumbusz Kristóf az Újvilág partjait?', options: [{ optionText: '1492 ', isCorrect: true }, { optionText: '1500', isCorrect: false }, { optionText: '1488', isCorrect: false }, { optionText: '1512', isCorrect: false }] },
      { questionText: 'Ki volt az első római császár?', options: [{ optionText: 'Augustus', isCorrect: true }, { optionText: 'Julius Caesar', isCorrect: false }, { optionText: 'Nero', isCorrect: false }, { optionText: 'Tiberius', isCorrect: false }] },
      { questionText: 'Melyik csata zárta le Napóleon uralmát?', options: [{ optionText: 'Waterloo', isCorrect: true }, { optionText: 'Austerlitz', isCorrect: false }, { optionText: 'Borogyinó', isCorrect: false }, { optionText: 'Trafalgár', isCorrect: false }] },
      { questionText: 'Melyik dinasztia uralkodott Angliában a 15-16. században?', options: [{ optionText: 'Tudor', isCorrect: true }, { optionText: 'Stuart', isCorrect: false }, { optionText: 'Plantagenet', isCorrect: false }, { optionText: 'Lancaster', isCorrect: false }] },
      { questionText: 'Ki írta a "Leviatán" című művet?', options: [{ optionText: 'Thomas Hobbes', isCorrect: true }, { optionText: 'John Locke', isCorrect: false }, { optionText: 'Rousseau', isCorrect: false }, { optionText: 'Voltaire', isCorrect: false }] },
      { questionText: 'Mikor volt a berlini fal leomlása?', options: [{ optionText: '1989', isCorrect: true }, { optionText: '1991', isCorrect: false }, { optionText: '1961', isCorrect: false }, { optionText: '1975', isCorrect: false }] },
      { questionText: 'Melyik konferencián osztották fel a világot a Szovjetunió és az USA között a második világháború után?', options: [{ optionText: 'Jaltai konferencia', isCorrect: true }, { optionText: 'Párizsi konferencia', isCorrect: false }, { optionText: 'Potsdami konferencia', isCorrect: false }, { optionText: 'Teheráni konferencia', isCorrect: false }] },
      { questionText: 'Melyik híres egyiptomi fáraó sírját találták meg 1922-ben?', options: [{ optionText: 'Tutanhamon', isCorrect: true }, { optionText: 'Ramszesz II', isCorrect: false }, { optionText: 'Kheopsz', isCorrect: false }, { optionText: 'Ehnaton', isCorrect: false }] },
      { questionText: 'Melyik esemény vezette be a francia forradalmat?', options: [{ optionText: 'Bastille ostroma', isCorrect: true }, { optionText: 'Nantes-i ediktum', isCorrect: false }, { optionText: 'Vérfürdő Párizsban', isCorrect: false }, { optionText: 'Királyi palota támadása', isCorrect: false }] },
      { questionText: 'Ki volt a "Nagy Sándor"?', options: [{ optionText: 'Makedón király', isCorrect: true }, { optionText: 'Római hadvezér', isCorrect: false }, { optionText: 'Egyiptomi fáraó', isCorrect: false }, { optionText: 'Görög filozófus', isCorrect: false }] },
      { questionText: 'Melyik évben kezdődött az első világháború?', options: [{ optionText: '1914', isCorrect: true }, { optionText: '1918', isCorrect: false }, { optionText: '1917', isCorrect: false }, { optionText: '1920', isCorrect: false }] },
      { questionText: 'Melyik városban történt az 1917-es forradalom?', options: [{ optionText: 'Petrográd', isCorrect: true }, { optionText: 'Moszkva', isCorrect: false }, { optionText: 'Kijev', isCorrect: false }, { optionText: 'Leningrád', isCorrect: false }] },
      { questionText: 'Ki volt az első ember az űrben?', options: [{ optionText: 'Jurij Gagarin', isCorrect: true }, { optionText: 'Neil Armstrong', isCorrect: false }, { optionText: 'Buzz Aldrin', isCorrect: false }, { optionText: 'Michael Collins', isCorrect: false }] },
      { questionText: 'Melyik évben írták alá a Magna Cartát?', options: [{ optionText: '1215', isCorrect: true }, { optionText: '1066', isCorrect: false }, { optionText: '1492', isCorrect: false }, { optionText: '1689', isCorrect: false }] },
      { questionText: 'Melyik római császár tette kereszténységgé a birodalom hivatalos vallását?', options: [{ optionText: 'Konstantin', isCorrect: true }, { optionText: 'Nero', isCorrect: false }, { optionText: 'Caligula', isCorrect: false }, { optionText: 'Augustus', isCorrect: false }] },
      { questionText: 'Melyik birodalom bukása zárta le az ókort?', options: [{ optionText: 'Nyugat-római Birodalom', isCorrect: true }, { optionText: 'Kelet-római Birodalom', isCorrect: false }, { optionText: 'Perzsa Birodalom', isCorrect: false }, { optionText: 'Egyiptomi Birodalom', isCorrect: false }] },
      { questionText: 'Melyik esemény indította el az első világháborút?', options: [{ optionText: 'Ferenc Ferdinánd meggyilkolása', isCorrect: true }, { optionText: 'A Lusitania elsüllyesztése', isCorrect: false }, { optionText: 'Az angol hadüzenet Németországnak', isCorrect: false }, { optionText: 'A Schlieffen-terv végrehajtása', isCorrect: false }] },
      { questionText: 'Melyik ország támadta meg Pearl Harbort?', options: [{ optionText: 'Japán', isCorrect: true }, { optionText: 'Németország', isCorrect: false }, { optionText: 'Olaszország', isCorrect: false }, { optionText: 'Kína', isCorrect: false }] },
      { questionText: 'Mikor ért véget a hidegháború?', options: [{ optionText: '1991', isCorrect: true }, { optionText: '1985', isCorrect: false }, { optionText: '1989', isCorrect: false }, { optionText: '2000', isCorrect: false }] },
    ]
  },
  {
    title: 'Földrajz',
    questionCount: 5,
    questions: [
      { questionText: 'Melyik a világ legnagyobb óceánja?', options: [{ optionText: 'Csendes-óceán', isCorrect: true }, { optionText: 'Atlanti-óceán', isCorrect: false }, { optionText: 'India-óceán', isCorrect: false }, { optionText: 'Jeges-tenger', isCorrect: false }] },
      { questionText: 'Melyik a legmagasabb hegycsúcs a világon?', options: [{ optionText: 'Mount Everest', isCorrect: true }, { optionText: 'K2', isCorrect: false }, { optionText: 'Mont Blanc', isCorrect: false }, { optionText: 'Denali', isCorrect: false }] },
      { questionText: 'Melyik országban található a Gízai Nagy Piramis?', options: [{ optionText: 'Egyiptom', isCorrect: true }, { optionText: 'Mexikó', isCorrect: false }, { optionText: 'Peru', isCorrect: false }, { optionText: 'Kína', isCorrect: false }] },
      { questionText: 'Melyik folyó a leghosszabb a világon?', options: [{ optionText: 'Amazonas', isCorrect: true }, { optionText: 'Nílus', isCorrect: false }, { optionText: 'Jangce', isCorrect: false }, { optionText: 'Mississippi', isCorrect: false }] },
      { questionText: 'Melyik a legnagyobb sivatag a Földön?', options: [{ optionText: 'Szoros-sivatag', isCorrect: true }, { optionText: 'Sahara', isCorrect: false }, { optionText: 'Atacama', isCorrect: false }, { optionText: 'Gobi', isCorrect: false }] },
      { questionText: 'Melyik ország fővárosa Peking?', options: [{ optionText: 'Kína', isCorrect: true }, { optionText: 'Japán', isCorrect: false }, { optionText: 'Dél-Korea', isCorrect: false }, { optionText: 'India', isCorrect: false }] },
      { questionText: 'Melyik ország a világ legnagyobb területű?', options: [{ optionText: 'Oroszország', isCorrect: true }, { optionText: 'Kanada', isCorrect: false }, { optionText: 'USA', isCorrect: false }, { optionText: 'Kína', isCorrect: false }] },
      { questionText: 'Melyik kontinensen található a Himalája?', options: [{ optionText: 'Ázsia', isCorrect: true }, { optionText: 'Afrika', isCorrect: false }, { optionText: 'Dél-Amerika', isCorrect: false }, { optionText: 'Európa', isCorrect: false }] },
      { questionText: 'Melyik a világ leghosszabb hegylánca?', options: [{ optionText: 'Andok', isCorrect: true }, { optionText: 'Alpok', isCorrect: false }, { optionText: 'Himalája', isCorrect: false }, { optionText: 'Kordillerák', isCorrect: false }] },
      { questionText: 'Melyik ország található legnagyobb részt a Skandináv-félszigeten?', options: [{ optionText: 'Svédország', isCorrect: true }, { optionText: 'Norvégia', isCorrect: false }, { optionText: 'Finnország', isCorrect: false }, { optionText: 'Dánia', isCorrect: false }] },
      { questionText: 'Melyik ország része Grönland?', options: [{ optionText: 'Dánia', isCorrect: true }, { optionText: 'Norvégia', isCorrect: false }, { optionText: 'Kanada', isCorrect: false }, { optionText: 'Izland', isCorrect: false }] },
      { questionText: 'Melyik városban található a Colosseum?', options: [{ optionText: 'Róma', isCorrect: true }, { optionText: 'Athén', isCorrect: false }, { optionText: 'Párizs', isCorrect: false }, { optionText: 'London', isCorrect: false }] },
      { questionText: 'Melyik országban van a Taj Mahal?', options: [{ optionText: 'India', isCorrect: true }, { optionText: 'Pakisztán', isCorrect: false }, { optionText: 'Banglades', isCorrect: false }, { optionText: 'Nepál', isCorrect: false }] },
      { questionText: 'Melyik országban található a Machu Picchu?', options: [{ optionText: 'Peru', isCorrect: true }, { optionText: 'Chile', isCorrect: false }, { optionText: 'Mexikó', isCorrect: false }, { optionText: 'Argentína', isCorrect: false }] },
      { questionText: 'Melyik ország fővárosa Canberra?', options: [{ optionText: 'Ausztrália', isCorrect: true }, { optionText: 'Új-Zéland', isCorrect: false }, { optionText: 'Dél-Afrika', isCorrect: false }, { optionText: 'Indonézia', isCorrect: false }] },
      { questionText: 'Melyik országban található a Nagy-korallzátony?', options: [{ optionText: 'Ausztrália', isCorrect: true }, { optionText: 'Fülöp-szigetek', isCorrect: false }, { optionText: 'Bahama-szigetek', isCorrect: false }, { optionText: 'Mexikó', isCorrect: false }] },
      { questionText: 'Melyik európai országot nevezik a "sajtok országának"?', options: [{ optionText: 'Hollandia', isCorrect: true }, { optionText: 'Franciaország', isCorrect: false }, { optionText: 'Svájc', isCorrect: false }, { optionText: 'Olaszország', isCorrect: false }] },
      { questionText: 'Melyik a Föld legmélyebb pontja?', options: [{ optionText: 'Mariana-árok', isCorrect: true }, { optionText: 'Bermuda-háromszög', isCorrect: false }, { optionText: 'Puerto Rico-árok', isCorrect: false }, { optionText: 'Java-árok', isCorrect: false }] },
      { questionText: 'Melyik a világ legnagyobb szigete?', options: [{ optionText: 'Grönland', isCorrect: true }, { optionText: 'Madagaszkár', isCorrect: false }, { optionText: 'Új-Guinea', isCorrect: false }, { optionText: 'Borneó', isCorrect: false }] },
      { questionText: 'Melyik országban található a Stonehenge?', options: [{ optionText: 'Egyesült Királyság', isCorrect: true }, { optionText: 'Írország', isCorrect: false }, { optionText: 'Franciaország', isCorrect: false }, { optionText: 'Spanyolország', isCorrect: false }] },
    ]
  },
  {
    title: 'Sport',
    questionCount: 10,
    questions: [
      { questionText: 'Melyik évben nyerte Magyarország az első olimpiai aranyérmét?', options: [{ optionText: '1896', isCorrect: true }, { optionText: '1924', isCorrect: false }, { optionText: '1908', isCorrect: false }, { optionText: '1932', isCorrect: false }] },
      { questionText: 'Melyik ország rendezte az első FIFA Világbajnokságot?', options: [{ optionText: 'Uruguay', isCorrect: true }, { optionText: 'Brazília', isCorrect: false }, { optionText: 'Olaszország', isCorrect: false }, { optionText: 'Argentína', isCorrect: false }] },
      { questionText: 'Ki nyerte a legtöbb Tour de France címet az összesített történelemben?', options: [{ optionText: 'Eddy Merckx', isCorrect: true }, { optionText: 'Lance Armstrong', isCorrect: false }, { optionText: 'Bernard Hinault', isCorrect: false }, { optionText: 'Chris Froome', isCorrect: false }] },
      { questionText: 'Melyik csapat nyerte a legtöbb NBA bajnoki címet?', options: [{ optionText: 'Boston Celtics', isCorrect: true }, { optionText: 'Los Angeles Lakers', isCorrect: false }, { optionText: 'Chicago Bulls', isCorrect: false }, { optionText: 'Golden State Warriors', isCorrect: false }] },
      { questionText: 'Hány játékos van egy rögbicsapat kezdőcsapatában?', options: [{ optionText: '15', isCorrect: true }, { optionText: '13', isCorrect: false }, { optionText: '11', isCorrect: false }, { optionText: '7', isCorrect: false }] },
      { questionText: 'Melyik teniszező nyerte a legtöbb Grand Slam címet a férfiak között?', options: [{ optionText: 'Novak Djokovic', isCorrect: true }, { optionText: 'Roger Federer', isCorrect: false }, { optionText: 'Rafael Nadal', isCorrect: false }, { optionText: 'Pete Sampras', isCorrect: false }] },
      { questionText: 'Hány aranyérmet nyert Michael Phelps a 2008-as pekingi olimpián?', options: [{ optionText: '8', isCorrect: true }, { optionText: '7', isCorrect: false }, { optionText: '6', isCorrect: false }, { optionText: '5', isCorrect: false }] },
      { questionText: 'Ki tartja az 100 méteres síkfutás világcsúcsát?', options: [{ optionText: 'Usain Bolt', isCorrect: true }, { optionText: 'Tyson Gay', isCorrect: false }, { optionText: 'Yohan Blake', isCorrect: false }, { optionText: 'Asafa Powell', isCorrect: false }] },
      { questionText: 'Melyik focicsapat nyerte az első Bajnokok Ligája címet?', options: [{ optionText: 'Real Madrid', isCorrect: true }, { optionText: 'AC Milan', isCorrect: false }, { optionText: 'Ajax', isCorrect: false }, { optionText: 'Manchester United', isCorrect: false }] },
      { questionText: 'Melyik sportban érhető el a "perfect game"?', options: [{ optionText: 'Bowling', isCorrect: true }, { optionText: 'Baseball', isCorrect: false }, { optionText: 'Golf', isCorrect: false }, { optionText: 'Krikett', isCorrect: false }] },
      { questionText: 'Melyik ország szerzett a legtöbb aranyérmet egyetlen olimpián?', options: [{ optionText: 'USA', isCorrect: true }, { optionText: 'Kína', isCorrect: false }, { optionText: 'Szovjetunió', isCorrect: false }, { optionText: 'Németország', isCorrect: false }] },
      { questionText: 'Hány pontot ér egy touchdown az amerikai fociban?', options: [{ optionText: '6', isCorrect: true }, { optionText: '7', isCorrect: false }, { optionText: '3', isCorrect: false }, { optionText: '2', isCorrect: false }] },
      { questionText: 'Melyik ország nyerte az első krikett-világbajnokságot?', options: [{ optionText: 'Nyugat-Indiák', isCorrect: true }, { optionText: 'Ausztrália', isCorrect: false }, { optionText: 'Anglia', isCorrect: false }, { optionText: 'India', isCorrect: false }] },
      { questionText: 'Hány gyűrű van az olimpiai emblémán?', options: [{ optionText: '5', isCorrect: true }, { optionText: '6', isCorrect: false }, { optionText: '7', isCorrect: false }, { optionText: '4', isCorrect: false }] },
      { questionText: 'Ki a Forma-1 legtöbb világbajnoki címével rendelkező pilótája?', options: [{ optionText: 'Lewis Hamilton', isCorrect: true }, { optionText: 'Michael Schumacher', isCorrect: false }, { optionText: 'Sebastian Vettel', isCorrect: false }, { optionText: 'Ayrton Senna', isCorrect: false }] },
      { questionText: 'Hány percig tart egy kosárlabda negyed az NBA-ben?', options: [{ optionText: '12 perc', isCorrect: true }, { optionText: '10 perc', isCorrect: false }, { optionText: '15 perc', isCorrect: false }, { optionText: '8 perc', isCorrect: false }] },
      { questionText: 'Melyik országot képviselte Pelé, a híres futballista?', options: [{ optionText: 'Brazília', isCorrect: true }, { optionText: 'Argentína', isCorrect: false }, { optionText: 'Portugália', isCorrect: false }, { optionText: 'Spanyolország', isCorrect: false }] },
      { questionText: 'Melyik város rendezte az első modern olimpiai játékokat?', options: [{ optionText: 'Athén', isCorrect: true }, { optionText: 'Párizs', isCorrect: false }, { optionText: 'London', isCorrect: false }, { optionText: 'Berlin', isCorrect: false }] },
      { questionText: 'Melyik sportágat nevezik "a királyok játékának"?', options: [{ optionText: 'Sakk', isCorrect: true }, { optionText: 'Polo', isCorrect: false }, { optionText: 'Tenisz', isCorrect: false }, { optionText: 'Golf', isCorrect: false }] },
      { questionText: 'Ki a valaha legtöbb gólt szerzett játékos a futball történetében?', options: [{ optionText: 'Cristiano Ronaldo', isCorrect: true }, { optionText: 'Pelé', isCorrect: false }, { optionText: 'Lionel Messi', isCorrect: false }, { optionText: 'Gerd Müller', isCorrect: false }] },
    ],
  }  
];

const seedQuizzes = async () => {
  try {
    for (const quizData of quizzesData) {
      const existingQuiz = await Quiz.findOne({ title: quizData.title });
      
      if (existingQuiz) {
        console.log(`A(z) "${quizData.title}" kvíz már létezik az adatbázisban.`);
        continue;
      }

      const questionIds = [];

      for (const questionData of quizData.questions) {
        const optionIds = [];

        for (const optionData of questionData.options) {
          const newOption = new Option(optionData);
          const savedOption = await newOption.save();
          optionIds.push(savedOption._id);
        }

        const newQuestion = new Question({
          questionText: questionData.questionText,
          options: optionIds,
        });

        const savedQuestion = await newQuestion.save();
        questionIds.push(savedQuestion._id);
      }

      if (questionIds.length < 2 * quizData.questionCount) {
        console.log(`A "${quizData.title}" kvízhez nincs elég kérdés. Szükséges kérdések száma: ${2 * quizData.questionCount}.`);
        continue;
      }

      const newQuiz = new Quiz({
        title: quizData.title,
        questionCount: quizData.questionCount,
        questions: questionIds,
      });

      await newQuiz.save();
      console.log(`A(z) "${quizData.title}" kvíz sikeresen beszúrva!`);
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Hiba történt a kvízek beszúrásakor:', err);
    mongoose.connection.close();
  }
};
