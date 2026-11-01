import fs from 'fs';
import path from 'path';
import { GameLevel, GameplayMode, ChallengeType, ChallengeDefinition, MatchingPair, ShlokaSegment, ChallengeOption } from '../src/game/types/level';
import { generateLifeLesson } from './generate-life-lessons';

interface VerseData {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translations: {
    hindi?: { text: string; author?: string; sourceId?: string };
    english?: { text: string; author?: string; sourceId?: string };
  };
  wordMeanings?: Array<{
    word: string;
    transliteration: string;
    meaningEnglish: string;
  }>;
}

interface ChapterData {
  number: number;
  nameSanskrit: string;
  nameTransliterated: string;
  nameEnglish: string;
  meaning: string;
  description: string;
  descriptionHindi: string;
  verseCount: number;
}

const CHAPTERS_PATH = path.join(process.cwd(), 'src/data/chapters.json');
const VERSES_DIR = path.join(process.cwd(), 'src/data/verses');
const OUTPUT_FILE = path.join(process.cwd(), 'src/game/content/levels-data.json');

const chapters: ChapterData[] = JSON.parse(fs.readFileSync(CHAPTERS_PATH, 'utf-8'));

// Speaker detection
function detectSpeaker(sanskrit: string, transliteration: string): { speaker: string; speakerName: string; speakerNameHindi: string } {
  const s = sanskrit.toLowerCase();
  const t = transliteration.toLowerCase();
  if (s.includes('धृतराष्ट्र उवाच') || t.includes('dhṛitarāśhtra uvācha') || t.includes('dhritarashtra uvacha')) {
    return { speaker: 'dhritarashtra', speakerName: 'King Dhritarashtra', speakerNameHindi: 'राजा धृतराष्ट्र' };
  }
  if (s.includes('सञ्जय उवाच') || t.includes('sañjaya uvācha') || t.includes('sanjaya uvacha')) {
    return { speaker: 'sanjaya', speakerName: 'Sanjaya', speakerNameHindi: 'संजय' };
  }
  if (s.includes('अर्जुन उवाच') || t.includes('arjuna uvācha') || t.includes('arjuna uvacha')) {
    return { speaker: 'arjuna', speakerName: 'Arjuna', speakerNameHindi: 'अर्जुन' };
  }
  if (s.includes('श्रीभगवानुवाच') || t.includes('śhrī-bhagavān uvācha') || t.includes('shree bhagavan uvacha')) {
    return { speaker: 'krishna', speakerName: 'Lord Krishna (Shree Bhagavan)', speakerNameHindi: 'भगवान श्री कृष्ण' };
  }
  return { speaker: 'narrator', speakerName: 'Sacred Dialogue', speakerNameHindi: 'पवित्र संवाद' };
}

// Clean Sanskrit text
function cleanSanskrit(sanskrit: string): string {
  return sanskrit.replace(/।।\d+\.\d+।।/g, '').replace(/\|\d+\.\d+\|/g, '').trim();
}

// Clean translation text
function cleanTranslation(text: string): string {
  return text.replace(/\(टिप्पणी[^\)]*\)/g, '').replace(/।।\d+\.\d+।।/g, '').trim();
}

// Select varied gameplay mode deterministically
function selectGameplayMode(ch: number, v: number, globalIdx: number): { mode: GameplayMode; challengeType: ChallengeType } {
  if (
    (ch === 1 && (v === 1 || v === 28 || v === 47)) ||
    (ch === 2 && (v === 1 || v === 7 || v === 47 || v === 54 || v === 72)) ||
    (ch === 3 && (v === 1 || v === 35)) ||
    (ch === 4 && (v === 7 || v === 8 || v === 38)) ||
    (ch === 6 && (v === 26 || v === 34 || v === 47)) ||
    (ch === 9 && (v === 22 || v === 27)) ||
    (ch === 10 && (v === 8 || v === 41)) ||
    (ch === 11 && (v === 15 || v === 32 || v === 33)) ||
    (ch === 12 && (v === 2 || v === 20)) ||
    (ch === 15 && (v === 1 || v === 15)) ||
    (ch === 18 && (v === 65 || v === 66 || v === 78))
  ) {
    return { mode: 'cinematic', challengeType: 'multiple-choice' };
  }

  if (ch === 1 && v >= 2 && v <= 25) {
    if (v % 3 === 0) return { mode: 'shloka-puzzle', challengeType: 'matching' };
    if (v % 3 === 1) return { mode: 'shloka-puzzle', challengeType: 'shloka-puzzle' };
    return { mode: 'exploration', challengeType: 'multiple-choice' };
  }

  const pattern = globalIdx % 6;
  switch (pattern) {
    case 0:
      return { mode: 'shloka-puzzle', challengeType: 'matching' };
    case 1:
      return { mode: 'mastery', challengeType: 'multiple-choice' };
    case 2:
      return { mode: 'decision', challengeType: 'decision' };
    case 3:
      return { mode: 'shloka-puzzle', challengeType: 'shloka-puzzle' };
    case 4:
      return { mode: 'reflection', challengeType: 'reflection' };
    case 5:
    default:
      return { mode: 'exploration', challengeType: 'multiple-choice' };
  }
}

// Level title English
function generateLevelTitle(verse: VerseData, chData: ChapterData): string {
  const v = verse.verse;
  const ch = verse.chapter;
  const enText = verse.translations.english?.text || '';

  if (ch === 1 && v === 1) return 'The Opening Question on Dharma\'s Field';
  if (ch === 1 && v === 2) return 'Duryodhana Surveys the Pandava Host';
  if (ch === 1 && v === 28) return 'The Trembling of Arjuna\'s Heart';
  if (ch === 1 && v === 47) return 'Casting Down the Gandiva Bow';
  if (ch === 2 && v === 7) return 'Surrender to the Guru: Shishyas Te \'ham';
  if (ch === 2 && v === 11) return 'The Wise Grieve Neither for Living nor Dead';
  if (ch === 2 && v === 20) return 'The Eternal Soul: Unborn and Undying';
  if (ch === 2 && v === 22) return 'Casting Off Worn-Out Garments: Vasamsi Jirnani';
  if (ch === 2 && v === 47) return 'Karmanye Vadhikaraste: The Secret of Action';
  if (ch === 2 && v === 56) return 'The Sthitaprajna: Steady in Wisdom';
  if (ch === 2 && v === 62) return 'The Ladder of Fall: Attachment to Ruin';
  if (ch === 2 && v === 70) return 'Ocean of Mind: Untouched by the Rivers';
  if (ch === 3 && v === 19) return 'Action Without Attachment';
  if (ch === 3 && v === 21) return 'Setting the Standard for the World: Yad Yad Acharati';
  if (ch === 3 && v === 35) return 'Better One\'s Own Duty Imperfectly Done: Shreyan Swadharmo';
  if (ch === 4 && v === 7) return 'Whenever Righteousness Declines: Yada Yada Hi Dharmasya';
  if (ch === 4 && v === 8) return 'Protection of the Virtuous: Paritranaya Sadhunam';
  if (ch === 4 && v === 38) return 'No Purifier Like Sacred Knowledge: Na Hi Jnanena Sadrisham';
  if (ch === 5 && v === 10) return 'The Lotus Leaf Untouched by Water: Padmapatram Ivambhasa';
  if (ch === 5 && v === 18) return 'The Sage Sees with Equal Vision: Vidya-Vinaya-Sampanne';
  if (ch === 6 && v === 5) return 'Elevate Yourself by Yourself: Uddhared Atmanatmanam';
  if (ch === 6 && v === 19) return 'The Lamp in a Windless Place: Yatha Dipo Nivatashtho';
  if (ch === 6 && v === 26) return 'Restraining the Wandering Mind: Yato Yato Nishcharati';
  if (ch === 6 && v === 34) return 'The Wind and the Mind: Chanchalam Hi Manah Krishna';
  if (ch === 7 && v === 7) return 'Pearls Strung on a Single Thread: Mayi Sarvam Idam Protam';
  if (ch === 7 && v === 16) return 'The Four Kinds of Seekers: Chaturvidha Bhajante Mam';
  if (ch === 8 && v === 5) return 'The Mind at the Final Hour: Anta-kale Cha Mam Eva';
  if (ch === 9 && v === 22) return 'Those Who Think of Me: Ananya Chintayanto Mam';
  if (ch === 9 && v === 26) return 'A Leaf, a Flower, a Fruit, Water: Patram Pushpam';
  if (ch === 9 && v === 27) return 'Offer Every Action as a Sacred Dedication: Yat Karoshi';
  if (ch === 10 && v === 8) return 'The Source of All Realms: Aham Sarvasya Prabhavo';
  if (ch === 10 && v === 20) return 'The Soul Seated in the Hearts of All: Aham Atma Gudakesha';
  if (ch === 11 && v === 12) return 'Splendor of a Thousand Suns: Divi Surya-Sahasrasya';
  if (ch === 11 && v === 32) return 'I Am Time, the World-Destroyer: Kalo\'smi Loka-Kshaya-Krit';
  if (ch === 11 && v === 33) return 'Be Thou Mere Instrument: Nimitta-Matram Bhava';
  if (ch === 12 && v === 13) return 'The Qualities of the Beloved Devotee: Adveshta Sarva-Bhutanam';
  if (ch === 13 && v === 1) return 'The Field and the Knower of the Field: Kshetra-Kshetrajna';
  if (ch === 14 && v === 5) return 'The Three Modes of Nature: Sattva, Rajas, Tamas';
  if (ch === 15 && v === 1) return 'The Inverted Tree of Existence: Urdhva-mulam Adhah-shakham';
  if (ch === 15 && v === 15) return 'Seated in the Memory and Heart of All: Sarvasya Chaham Hridi';
  if (ch === 16 && v === 1) return 'The Divine Qualities: Fearlessness and Purity';
  if (ch === 16 && v === 21) return 'The Three Gates to Self-Destruction: Tri-vidham Narakasyedam';
  if (ch === 17 && v === 3) return 'A Person Is Created by Their Faith: Shraddha-mayo \'yam Purusho';
  if (ch === 18 && v === 65) return 'Absorb Your Mind in Me: Man-mana Bhava Mad-bhakto';
  if (ch === 18 && v === 66) return 'Abandon All Varieties of Dharma: Sarva-Dharman Parityajya';
  if (ch === 18 && v === 78) return 'Where Krishna and Arjuna Stand: Yatra Yogeshvarah Krishno';

  const cleanSnippet = enText
    .replace(/^[^"]*"|"[^"]*$/g, '')
    .replace(/^(Sanjaya said:|Dhritarashtra said:|Arjuna said:|The Blessed Lord said:)\s*/i, '')
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')
    .replace(/[,;:.!?]+$/, '');

  if (cleanSnippet.length > 5) {
    return `${chData.nameEnglish} (${v}): ${cleanSnippet}`;
  }
  return `${chData.nameEnglish} — Verse ${v}`;
}

// Level title Hindi
function generateLevelTitleHindi(verse: VerseData, chData: ChapterData): string {
  const v = verse.verse;
  const ch = verse.chapter;

  if (ch === 1 && v === 1) return 'धर्मक्षेत्र पर धृतराष्ट्र का प्रथम प्रश्न';
  if (ch === 1 && v === 2) return 'पाण्डव सेना का अवलोकन करते दुर्योधन';
  if (ch === 1 && v === 28) return 'अर्जुन का विषाद और गाण्डीव का कांपना';
  if (ch === 1 && v === 47) return 'गाण्डीव धनुष का त्याग और अर्जुन का बैठना';
  if (ch === 2 && v === 7) return 'श्री कृष्ण के प्रति शिष्य भाव से शरणागति: शिष्यस्तेऽहं';
  if (ch === 2 && v === 11) return 'ज्ञानी न जीवितों का शोक करते हैं न मृतकों का';
  if (ch === 2 && v === 20) return 'अविनाशी नित्य आत्मा: न जायते म्रियते वा';
  if (ch === 2 && v === 22) return 'जीर्ण वस्त्रों का त्याग: वासांसि जीर्णानि';
  if (ch === 2 && v === 47) return 'कर्मण्येवाधिकारस्ते: निष्काम कर्म का परम रहस्य';
  if (ch === 2 && v === 56) return 'स्थितप्रज्ञ: स्थिर बुद्धि वाले मुनि के लक्षण';
  if (ch === 2 && v === 62) return 'ध्यायतो विषयान्पुंसः: पतन की सीढ़ी';
  if (ch === 2 && v === 70) return 'समुद्रवत अचल मन: आपूर्यमाणमचलप्रतिष्ठम्';
  if (ch === 3 && v === 19) return 'अनासक्त होकर निरंतर कर्तव्य कर्म का आचरण';
  if (ch === 3 && v === 21) return 'यद्यदाचरति श्रेष्ठः: श्रेष्ठ पुरुषों का अनुकरणीय आचरण';
  if (ch === 3 && v === 35) return 'श्रेयान्स्वधर्मो विगुणः: स्वधर्म का पालन ही श्रेयस्कर';
  if (ch === 4 && v === 7) return 'यदा यदा हि धर्मस्य: धर्म-संस्थापनार्थ दिव्य अवतरण';
  if (ch === 4 && v === 8) return 'परित्राणाय साधूनाम्: सज्जनों की रक्षा और दुष्टों का संहार';
  if (ch === 4 && v === 38) return 'न हि ज्ञानेन सदृशम्: ज्ञान के समान पवित्र कुछ नहीं';
  if (ch === 5 && v === 10) return 'पद्मपत्रमिवाम्भसा: जल में कमल के समान निर्लिप्त जीवन';
  if (ch === 5 && v === 18) return 'विद्याविनयसम्पन्ने: समदर्शी ज्ञानी की समदृष्टि';
  if (ch === 6 && v === 5) return 'उद्धरेदात्मनात्मानम्: अपने द्वारा अपना उद्धार करना';
  if (ch === 6 && v === 19) return 'यथा दीपो निवातस्थः: वायु-रहित स्थान में दीपक की लौ';
  if (ch === 6 && v === 26) return 'यतो यतो निश्चरति: चंचल मन का नियमन और एकाग्रता';
  if (ch === 6 && v === 34) return 'चञ्चलं हि मनः कृष्ण: वायु के समान चंचल मन का संयम';
  if (ch === 7 && v === 7) return 'मयि सर्वमिदं प्रोतम्: सूत में मणियों के समान प्रभु में सब पिरोया है';
  if (ch === 7 && v === 16) return 'चतुर्विधा भजन्ते माम्: चार प्रकार के पुण्यात्मा भक्त';
  if (ch === 8 && v === 5) return 'अन्तकाले च मामेव: प्राण-प्रयाण काल में प्रभु का स्मरण';
  if (ch === 9 && v === 22) return 'अनन्याश्चिन्तयन्तो माम्: अनन्य भक्तों का योगक्षेम वहन';
  if (ch === 9 && v === 26) return 'पत्रं पुष्पं फलं तोयम्: प्रेम और भक्ति से अर्पित पत्र-पुष्प';
  if (ch === 9 && v === 27) return 'यत्करोषि यदश्नासि: प्रत्येक कर्म को प्रभु का अर्पण';
  if (ch === 10 && v === 8) return 'अहं सर्वस्य प्रभवः: समस्त जगत के परम उद्भव';
  if (ch === 10 && v === 20) return 'अहमात्मा गुड़ाकेश: सब प्राणियों के हृदय में स्थित आत्मा';
  if (ch === 11 && v === 12) return 'दिवि सूर्यसहस्रस्य: सहस्र सूर्यों का अलौकिक तेज';
  if (ch === 11 && v === 32) return 'कालोऽस्मि लोकक्षयकृत्प्रवृद्धो: जगत का संहार करने वाला काल';
  if (ch === 11 && v === 33) return 'निमित्तमात्रं भव सव्यसाचिन्: ईश्वर के कार्य में निमित्त मात्र बनना';
  if (ch === 12 && v === 13) return 'अद्वेष्टा सर्वभूतानाम्: परम प्रिय भक्त के दिव्य लक्षण';
  if (ch === 13 && v === 1) return 'क्षेत्र-क्षेत्रज्ञ विभाग: शरीर और साक्षी आत्मा का भेद';
  if (ch === 14 && v === 5) return 'सत्त्वं रजस्तम इति: प्रकृति से उत्पन्न तीनों गुण';
  if (ch === 15 && v === 1) return 'ऊर्ध्वमूलमधःशाखम्: संसार रूपी अश्वत्थ वृक्ष का रहस्य';
  if (ch === 15 && v === 15) return 'सर्वस्य चाहं हृदि सन्निविष्टो: सबके हृदय में स्थित ज्ञान और स्मृति';
  if (ch === 16 && v === 1) return 'अभयं सत्त्वसंशुद्धिः: अभय और दैवी संपद् के लक्षण';
  if (ch === 16 && v === 21) return 'त्रिविधं नरकस्येदं द्वारम्: काम, क्रोध और लोभ—नरक के तीन द्वार';
  if (ch === 17 && v === 3) return 'श्रद्धामयोऽयं पुरुषः: मनुष्य अपनी श्रद्धा का ही स्वरूप है';
  if (ch === 18 && v === 65) return 'मन्मना भव मद्भक्तो: मन को प्रभु में लीन कर समर्पित होना';
  if (ch === 18 && v === 66) return 'सर्वधर्मान्परित्यज्य: संपूर्ण शरणागति और अभय दान';
  if (ch === 18 && v === 78) return 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः: अखंड विजय और परम सिद्धि';

  return `${chData.nameSanskrit} — श्लोक ${v}`;
}

// Learning objective English
function generateLearningObjective(verse: VerseData, chData: ChapterData): string {
  const v = verse.verse;
  const ch = verse.chapter;

  if (ch === 1 && v === 1) {
    return 'Analyze how Dhritarashtra\'s opening query distinguishes "my people" from "Pandu\'s sons", setting the psychological stage of division.';
  }
  if (ch === 2 && v === 47) {
    return 'Master the core doctrine of Nishkama Karma: duty without attachment to the results or claiming authorship.';
  }
  if (ch === 18 && v === 78) {
    return 'Understand Sanjaya\'s culminating proclamation that wherever divine wisdom (Krishna) unites with dedicated human action (Arjuna), victory and righteousness are assured.';
  }

  return `Comprehend the philosophical significance of Chapter ${ch}, Verse ${v} within the path of ${chData.nameEnglish}.`;
}

// Learning objective Hindi
function generateLearningObjectiveHindi(verse: VerseData, chData: ChapterData): string {
  const v = verse.verse;
  const ch = verse.chapter;

  if (ch === 1 && v === 1) {
    return 'धृतराष्ट्र के प्रथम प्रश्न में "मेरे और पाण्डु के पुत्र" के विभाजनकारी दृष्टिकोण और युद्ध के मनोवैज्ञानिक आधार को समझें।';
  }
  if (ch === 2 && v === 47) {
    return 'निष्काम कर्मयोग के परम सिद्धांत को आत्मसात करें: फल की आसक्ति और कर्तापन के अहंकार से रहित होकर केवल कर्तव्य का पालन करना।';
  }
  if (ch === 18 && v === 78) {
    return 'संजय के अंतिम उद्घोष को समझें कि जहाँ ईश्वरीय ज्ञान (श्री कृष्ण) और समर्पित पुरुषार्थ (अर्जुन) का मिलन होता है, वहीं विजय और धर्म निश्चित हैं।';
  }

  return `${chData.nameSanskrit} के श्लोक ${v} के दार्शनिक और आध्यात्मिक अर्थ को समझकर जीवन में धारण करें।`;
}

// Build Multiple Choice
function createSpecificMultipleChoice(
  verse: VerseData,
  chData: ChapterData,
  levelId: string
): ChallengeDefinition {
  const ch = verse.chapter;
  const v = verse.verse;
  const enText = cleanTranslation(verse.translations.english?.text || '');
  const hiText = cleanTranslation(verse.translations.hindi?.text || '');
  const { speakerName, speakerNameHindi } = detectSpeaker(verse.sanskrit, verse.transliteration);

  if (ch === 1 && v === 1) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Shloka 1.1, what reveals King Dhritarashtra\'s inner bias and partiality before the battle begins?',
      promptHindi: 'श्लोक 1.1 में युद्ध आरंभ होने से पूर्व राजा धृतराष्ट्र का आंतरिक पक्षपात और संशय किस कथन से प्रकट होता है?',
      instruction: 'Select the statement that correctly explains the psychological implication of Dhritarashtra\'s opening words.',
      instructionHindi: 'उस विकल्प को चुनें जो धृतराष्ट्र के आरंभिक शब्दों के मनोवैज्ञानिक प्रभाव को सही रूप में समझाता है।',
      options: [
        {
          id: 'opt-1',
          text: 'His distinction between "my people" (māmakāḥ) and "the sons of Pandu" (pāṇḍavāḥ), separating his biological children from Pandu\'s sons despite being sovereign over both.',
          textHindi: 'उनके द्वारा "मेरे पुत्र" (मामकाः) और "पाण्डु के पुत्र" (पाण्डवाः) का भेद करना, जिससे राजा का कर्तव्य भूलकर उनका व्यक्तिगत मोह उजागर होता है।',
          isCorrect: true,
          explanation: 'Dhritarashtra\'s possessive framing "mamakah" exposes the root of moral decline: egoistic attachment blinding equitable duty.'
        },
        {
          id: 'opt-2',
          text: 'His request for Sanjaya to describe the weather conditions and astronomical planetary alignments over Kurukshetra.',
          textHindi: 'संजय से कुरुक्षेत्र के मौसम और ग्रहों की स्थिति का विवरण माँगना।',
          isCorrect: false,
          explanation: 'Dhritarashtra asks about the human combatants and their actions, not meteorology.'
        },
        {
          id: 'opt-3',
          text: 'It was purely a geographical query inquiring whether Kurukshetra was suitable for chariot combat.',
          textHindi: 'यह केवल एक भौगोलिक प्रश्न था कि क्या कुरुक्षेत्र रथ युद्ध के लिए उपयुक्त है।',
          isCorrect: false,
          explanation: 'Kurukshetra is deliberately designated as "Dharmakshetra", indicating a moral crisis, not mere terrain analysis.'
        },
        {
          id: 'opt-4',
          text: 'It expresses Dhritarashtra\'s joyful expectation that both armies would immediately negotiate a peaceful treaty without fighting.',
          textHindi: 'यह धृतराष्ट्र की इस आशा को दिखाता है कि दोनों सेनाएँ बिना लड़े शांति संधि कर लेंगी।',
          isCorrect: false,
          explanation: 'The phrase "yuyutsavah" explicitly states they had gathered eager for battle.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Dhritarashtra\'s query sets the foundational stage of the Gita: personal attachment (mamata) blinding moral duty (dharma).',
      explanationHindi: 'धृतराष्ट्र का प्रश्न गीता की आधारशिला रखता है: व्यक्तिगत ममता और मोह किस प्रकार कर्तव्य और धर्म को अंधा कर देते हैं।',
      practicalApplication: 'Notice where possessiveness ("mine" vs "theirs") clouds fair judgment in your own decisions.',
      practicalApplicationHindi: 'अपने दैनिक जीवन में भी परखें कि कहीं "मेरे-तेरे" का पक्षपात आपके निष्पक्ष निर्णय में बाधा तो नहीं बन रहा।'
    };
  }

  if (ch === 2 && v === 47) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'What fourfold principle of action is revealed in the seminal shloka "Karmanye Vadhikaraste Ma Phaleshu Kadachana"?',
      promptHindi: 'प्रसिद्ध श्लोक "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" में कर्म का कौन सा चतुर्विध सिद्धांत प्रकट किया गया है?',
      instruction: 'Select the statement that captures the complete, authentic discipline of Nishkama Karma.',
      instructionHindi: 'उस कथन को चुनें जो निष्काम कर्म के वास्तविक और प्रामाणिक अनुशासन को स्पष्ट करता है।',
      options: [
        {
          id: 'opt-1',
          text: 'You have a right only to perform duty, never to claim its fruits; let not results be your motive, nor be attached to inaction.',
          textHindi: 'कर्म करने में ही तुम्हारा अधिकार है, फल पर कभी नहीं; फल की कामना से कर्म मत करो और न ही अकर्मण्यता (आलस्य) में आसक्ति हो।',
          isCorrect: true,
          explanation: 'This shloka establishes Karma Yoga: full responsibility for action without psychological bondage to or claiming ownership of outcomes.'
        },
        {
          id: 'opt-2',
          text: 'You should only undertake work if the exact monetary and social reward is guaranteed in advance by your employers.',
          textHindi: 'कार्य केवल तभी करना चाहिए जब उसका पूरा आर्थिक और सामाजिक लाभ पहले से लिखित रूप में निश्चित हो।',
          isCorrect: false,
          explanation: 'The verse explicitly warns "ma phaleshu kadachana", prohibiting reward-dependent action.'
        },
        {
          id: 'opt-3',
          text: 'Because fruits cannot be controlled, one should abandon all work and withdraw into passive contemplation.',
          textHindi: 'चूँकि फल पर नियंत्रण नहीं है, इसलिए सभी कर्मों को त्यागकर हाथ पर हाथ रखकर बैठ जाना चाहिए।',
          isCorrect: false,
          explanation: 'The fourth quarter explicitly commands "ma te sango \'stv akarmani" (let not your attachment be to inaction).'
        },
        {
          id: 'opt-4',
          text: 'Action and results are identical, so every good intention automatically produces instant worldly success.',
          textHindi: 'कर्म और फल एक ही हैं, इसलिए हर अच्छे विचार से तुरंत सांसारिक सफलता मिलनी तय है।',
          isCorrect: false,
          explanation: 'Results depend on multiple cosmic factors beyond the individual; the Gita teaches equanimity whether outcomes succeed or fail.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Nishkama Karma frees the mind from future anxiety, centering total dedication and excellence in the present moment.',
      explanationHindi: 'निष्काम कर्म मन को भविष्य की चिंता से मुक्त कर वर्तमान क्षण में समर्पण और उत्कृष्टता के साथ कर्म करने की शक्ति देता है।',
      practicalApplication: 'Focus 100% of your energy on the craftsmanship of your duty today, letting go of obsessive calculation about results.',
      practicalApplicationHindi: 'आज के अपने कर्तव्य पर पूरी ऊर्जा एकाग्र करें और कल के परिणाम की चिंता से मुक्त रहें।'
    };
  }

  if (ch === 1 && v === 2) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Shloka 1.2, what action does Duryodhana take upon seeing the Pandava army marshaled for war?',
      promptHindi: 'श्लोक 1.2 में पाण्डव सेना की व्यूहरचना देखकर दुर्योधन क्या कदम उठाता है?',
      instruction: 'Select the statement that accurately describes Duryodhana\'s immediate reaction and approach to his preceptor Drona.',
      instructionHindi: 'उस विकल्प को चुनें जो द्रोणाचार्य के पास जाकर दुर्योधन की तात्कालिक प्रतिक्रिया का सही वर्णन करता है।',
      options: [
        {
          id: 'opt-1',
          text: 'He approaches his teacher Dronacharya to point out the well-arrayed Pandava host, masking inner apprehension with assertive speech.',
          textHindi: 'वह व्यूहरचना युक्त पाण्डव सेना को देखकर अपने आचार्य द्रोणाचार्य के पास जाता है और अपनी घबराहट को छुपाते हुए संवाद करता है।',
          isCorrect: true,
          explanation: 'Duryodhana\'s approach to Drona reflects his psychological need for reassurance in the face of the formidable Pandava array.'
        },
        {
          id: 'opt-2',
          text: 'He immediately drops his weapons and offers to surrender all territory to Yudhishthira.',
          textHindi: 'वह तत्काल अपने शस्त्र डालकर युधिष्ठिर को संपूर्ण राज्य सौंपने का प्रस्ताव देता है।',
          isCorrect: false,
          explanation: 'Duryodhana was determined to fight and aimed to bolster his army\'s confidence.'
        },
        {
          id: 'opt-3',
          text: 'He leaves the battlefield entirely and retreats to the city of Hastinapura.',
          textHindi: 'वह युद्धभूमि छोड़कर हस्तिनापुर लौट जाता है।',
          isCorrect: false,
          explanation: 'Duryodhana stood on the front lines to inspect the battle deployment.'
        },
        {
          id: 'opt-4',
          text: 'He orders an immediate general retreat of the entire Kaurava army.',
          textHindi: 'वह संपूर्ण कौरव सेना को तत्काल पीछे हटने का आदेश देता है।',
          isCorrect: false,
          explanation: 'The verse marks the active commencement of battlefield enumeration, not retreat.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Verse 1.2 captures Duryodhana\'s calculated move to address his preceptor Drona as both armies stand ready for engagement.',
      explanationHindi: 'श्लोक 1.2 दोनों सेनाओं के सम्मुख खड़े होकर द्रोणाचार्य के पास जाने के दुर्योधन के आचरण का अंकन करता है।',
      practicalApplication: 'Notice how external assertiveness often attempts to mask internal hesitation and insecurity.',
      practicalApplicationHindi: 'पहचानें कि कैसे बाहरी शेखी अक्सर आंतरिक घबराहट और भय को छिपाने का प्रयास होती है।'
    };
  }

  if (ch === 1 && v === 4) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Shloka 1.4, which formidable Pandava warriors does Duryodhana enumerate as equals in battle to Bhima and Arjuna?',
      promptHindi: 'श्लोक 1.4 में दुर्योधन पाण्डव सेना के किन महारथियों को भीम और अर्जुन के समान पराक्रमी बताता है?',
      instruction: 'Select the trio of great heroes explicitly named in verse 1.4.',
      instructionHindi: 'श्लोक 1.4 में स्पष्ट रूप से नामित तीन महारथियों के समूह को चुनें।',
      options: [
        {
          id: 'opt-1',
          text: 'Yuyudhana (Satyaki), Virata, and the great warrior Drupada.',
          textHindi: 'युयुधान (सात्यकि), राजा विराट और महारथी द्रुपद।',
          isCorrect: true,
          explanation: 'Verse 1.4 explicitly names: "atra śūrā maheṣv-āsā bhīmārjuna-samā yudhi, yuyudhāno virāṭaś ca drupadaś ca mahā-rathaḥ".'
        },
        {
          id: 'opt-2',
          text: 'Karna, Shalya, and Jayadratha.',
          textHindi: 'कर्ण, शल्य और जयद्रथ।',
          isCorrect: false,
          explanation: 'These were prominent warriors of the Kaurava army, not the Pandava heroes listed in 1.4.'
        },
        {
          id: 'opt-3',
          text: 'Ashwatthama, Vikarna, and Kripacharya.',
          textHindi: 'अश्वत्थामा, विकर्ण और कृपाचार्य।',
          isCorrect: false,
          explanation: 'These fighters belonged to Duryodhana\'s own forces, listed later in verse 1.8.'
        },
        {
          id: 'opt-4',
          text: 'Shakuni, Somadatta, and Susharma.',
          textHindi: 'शकुनि, सोमदत्त और सुशर्मा।',
          isCorrect: false,
          explanation: 'These warriors fought on the Kaurava side.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Duryodhana begins his assessment of the opposition by acknowledging Satyaki, Virata, and Drupada as equal in martial prowess to Bhima and Arjuna.',
      explanationHindi: 'दुर्योधन विपक्षी सेना की शक्ति का यथार्थवादी आंकलन करते हुए सात्यकि, विराट और द्रुपद की गणना करता है।',
      practicalApplication: 'Evaluate competitors and challenges with objective clarity rather than wishful thinking.',
      practicalApplicationHindi: 'चुनौतियों और प्रतिद्वंद्वियों का निष्पक्ष आंकलन करें ताकि तैयारी वास्तविक धरातल पर हो।'
    };
  }

  if (ch === 3 && v === 19) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 3.19 ("Tasmād asaktaḥ satataṁ kāryaṁ karma samācara"), what is the declared fruit of selfless action?',
      promptHindi: 'गीता 3.19 ("तस्मादसक्तः सततं कार्यं कर्म समाचर...") में अनासक्त होकर कर्म करने का क्या अंतिम परिणाम बताया गया है?',
      instruction: 'Identify the spiritual culmination promised to one who performs duties without personal attachment.',
      instructionHindi: 'उस परम फल को पहचानें जो निष्काम भाव से निरंतर कर्तव्य करने वाले साधक को मिलता है।',
      options: [
        {
          id: 'opt-1',
          text: 'By performing obligatory duty without selfish attachment, a person attains the Supreme.',
          textHindi: 'आसक्ति रहित होकर निरंतर कर्तव्य कर्म करने से मनुष्य परम तत्व (परमात्मा) को प्राप्त हो जाता है।',
          isCorrect: true,
          explanation: 'Verse 3.19 concludes: "asakto hy ācaran karma param āpnoti pūruṣaḥ" (acting without attachment, one reaches the Supreme).'
        },
        {
          id: 'opt-2',
          text: 'One immediately loses all interest in societal harmony and retreats to a solitary cave.',
          textHindi: 'व्यक्ति समाज से पूरी तरह विमुख होकर एकांत गुफा में पलायन कर जाता है।',
          isCorrect: false,
          explanation: 'Karma Yoga demands active participation in societal welfare (Loka-sangraha), not escapism.'
        },
        {
          id: 'opt-3',
          text: 'It guarantees that every worldly ambition will produce endless material riches.',
          textHindi: 'यह गारंटी देता है कि हर सांसारिक इच्छा से अपार धन-दौलत ही मिलेगी।',
          isCorrect: false,
          explanation: 'The verse teaches freedom from material cravings, not guaranteed material wealth.'
        },
        {
          id: 'opt-4',
          text: 'It leads to paralysis of intellect and inability to execute complex responsibilities.',
          textHindi: 'यह बुद्धि को निष्क्रिय बनाकर जिम्मेदारियों से भागने पर विवश करता है।',
          isCorrect: false,
          explanation: 'Karma Yoga sharpens skill and mastery in action ("Yogaḥ karmasu kauśhalam").'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 3.19 establishes that unattached performance of legitimate duty is a direct, sufficient path to spiritual liberation.',
      explanationHindi: 'गीता 3.19 सिद्ध करती है कि अनासक्त भाव से कर्तव्य का पालन सीधे परम पद की प्राप्ति कराता है।',
      practicalApplication: 'Dedicate full excellence to your craft today, letting go of obsessive anxiety over recognition and rewards.',
      practicalApplicationHindi: 'अपने काम में उत्कृष्टता लाएँ और परिणाम की चिंता से मुक्त रहकर वर्तमान कर्म पर ध्यान दें।'
    };
  }

  if (ch === 6 && v === 5) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 6.5 ("Uddhared ātmanātmānaṁ"), what foundational truth about the human mind is revealed?',
      promptHindi: 'गीता 6.5 ("उद्धरेदात्मनात्मानम्...") में मनुष्य और उसके मन के संबंध में कौन सा आधारभूत सत्य प्रकट किया गया है?',
      instruction: 'Select the statement that captures the dual nature of the disciplined versus undisciplined mind.',
      instructionHindi: 'उस कथन को चुनें जो संयमित और असंयमित मन के दोहरे प्रभाव को स्पष्ट करता है।',
      options: [
        {
          id: 'opt-1',
          text: 'One must elevate oneself by one\'s own mind; the mind is the friend of the self-controlled, but the enemy of the undisciplined.',
          textHindi: 'मनुष्य को अपने मन द्वारा अपना उद्धार करना चाहिए; जिसका मन वश में है उसका मन मित्र है, और असंयमी का मन उसका सबसे बड़ा शत्रु है।',
          isCorrect: true,
          explanation: 'Verse 6.5 teaches personal agency: "ātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ".'
        },
        {
          id: 'opt-2',
          text: 'The human mind is completely powerless and destiny alone determines every thought and action.',
          textHindi: 'मनुष्य का मन सर्वथा असहाय है और केवल भाग्य ही सब कुछ नियंत्रित करता है।',
          isCorrect: false,
          explanation: 'The verse specifically commands self-elevation ("uddhared atmanatmanam"), proving human agency.'
        },
        {
          id: 'opt-3',
          text: 'The mind should be surrendered to external sensory impulses without any regulation.',
          textHindi: 'मन को बिना किसी संयम के समस्त भौतिक इच्छाओं में खुला छोड़ देना चाहिए।',
          isCorrect: false,
          explanation: 'The verse warns that an undisciplined mind acts as an internal enemy.'
        },
        {
          id: 'opt-4',
          text: 'Spiritual growth requires eliminating all conscious thought entirely from birth.',
          textHindi: 'आध्यात्मिक प्रगति के लिए जन्म से ही समस्त विचारों को समाप्त करना अनिवार्य है।',
          isCorrect: false,
          explanation: 'Yoga trains and refines the mind; it does not destroy healthy cognitive function.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 6.5 centers personal responsibility: when disciplined, the mind is our greatest ally; left wild, it becomes our worst saboteur.',
      explanationHindi: 'गीता 6.5 आत्म-उत्तरदायित्व सिखाती है: संयमित मन परम मित्र है, जबकि अनियंत्रित मन पतन का कारण बनता है।',
      practicalApplication: 'Train your daily habits to make your mind a supportive ally rather than a source of self-doubt.',
      practicalApplicationHindi: 'दैनिक आदतों को अनुशासित कर अपने मन को अपना सच्चा मित्र बनाएँ।'
    };
  }

  if (ch === 6 && v === 26) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 6.26 ("Yato yato niścarati manas cañcalam asthiram"), what discipline does Krishna prescribe for wandering thoughts?',
      promptHindi: 'गीता 6.26 ("यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्...") में भटकते मन को वश में करने का क्या उपाय बताया गया है?',
      instruction: 'Identify the practical method for regaining mental focus when distraction arises.',
      instructionHindi: 'ध्यान भटकने पर मन को पुनः एकाग्र करने की व्यावहारिक विधि को पहचानें।',
      options: [
        {
          id: 'opt-1',
          text: 'From wherever the restless and unsteady mind wanders away, repeatedly restrain it and bring it back under the control of the Self.',
          textHindi: 'चंचल और अस्थिर मन जहाँ-जहाँ भटके, वहाँ-वहाँ से रोककर बार-बार धैर्यपूर्वक उसे आत्मा के ही नियंत्रण में लाना चाहिए।',
          isCorrect: true,
          explanation: 'Verse 6.26 explicitly commands: "tatas tato niyamyaitad ātmany eva vaśaṁ nayet".'
        },
        {
          id: 'opt-2',
          text: 'Immediately abandon the meditation seat and conclude that focus is genetically impossible.',
          textHindi: 'तुरंत अभ्यास छोड़कर यह मान लेना चाहिए कि एकाग्रता पाना असंभव है।',
          isCorrect: false,
          explanation: 'Krishna teaches patient, repetitive redirection, not surrender to distraction.'
        },
        {
          id: 'opt-3',
          text: 'Suppress the mind through aggressive self-hatred and harsh punishment.',
          textHindi: 'क्रोध और आत्म-निंदा द्वारा मन का दमन करना।',
          isCorrect: false,
          explanation: 'Gentle, persistent mindfulness without frustration is the authentic method.'
        },
        {
          id: 'opt-4',
          text: 'Allow the mind to pursue every wandering thought to its ultimate conclusion.',
          textHindi: 'मन को हर भटकते विचार के पीछे दौड़ने की पूरी छूट दे देना।',
          isCorrect: false,
          explanation: 'Unchecked indulgence increases restlessness rather than calming it.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 6.26 offers the quintessential definition of meditation training: non-reactive, repeated redirection back to the center.',
      explanationHindi: 'गीता 6.26 एकाग्रता का मूल मंत्र है: बिना चिढ़े, बार-बार मन को भटकाव से लौटाकर केंद्र में स्थापित करना।',
      practicalApplication: 'When your attention drifts during study or work, gently guide it back to the task without frustration.',
      practicalApplicationHindi: 'काम करते समय ध्यान हटे तो बिना खीझे शांति से मन को पुनः काम पर लौटाएँ।'
    };
  }

  if (ch === 11 && v === 32) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 11.32 ("Kālo \'smi loka-kṣaya-kṛt pravṛddho"), how does Lord Krishna reveal His cosmic identity to Arjuna?',
      promptHindi: 'गीता 11.32 ("कालोऽस्मि लोकक्षयकृत्प्रवृद्धो...") में भगवान श्री कृष्ण अर्जुन के समक्ष अपना कौन सा विराट स्वरूप प्रकट करते हैं?',
      instruction: 'Select the statement that captures Krishna\'s revelation of cosmic Time and the destiny of the gathered armies.',
      instructionHindi: 'उस कथन को चुनें जो काल रूपी ईश्वरीय सत्ता और सेनाओं के भाग्य के प्रकटीकरण को सही रूप में समझाता है।',
      options: [
        {
          id: 'opt-1',
          text: 'He reveals Himself as all-devouring Time, the destroyer of worlds, declaring the combatants already marked by destiny and urging Arjuna to be His instrument.',
          textHindi: 'वे स्वयं को लोकों का संहार करने वाला महाकाल बताते हैं और स्पष्ट करते हैं कि योद्धा काल द्वारा पहले ही मारे जा चुके हैं, अतः अर्जुन केवल निमित्त मात्र बने।',
          isCorrect: true,
          explanation: 'Verse 11.32 proclaims: "kālo \'smi loka-kṣaya-kṛt pravṛddho lokān samāhartum iha pravṛttaḥ". In 11.33, Krishna adds: "nimitta-mātraṁ bhava savya-sācin".'
        },
        {
          id: 'opt-2',
          text: 'He reveals Himself as an ordinary battlefield king requesting physical protection from Arjuna.',
          textHindi: 'वे स्वयं को एक साधारण राजा बताते हैं जिसे अर्जुन से सुरक्षा की आवश्यकता है।',
          isCorrect: false,
          explanation: 'Krishna reveals His sovereign, terrifying cosmic majesty that commands universal destiny.'
        },
        {
          id: 'opt-3',
          text: 'He declares that history has ended and that all human effort is completely prohibited.',
          textHindi: 'वे घोषणा करते हैं कि इतिहास समाप्त हो गया है और कोई भी मानवीय कर्म करना वर्जित है।',
          isCorrect: false,
          explanation: 'Krishna immediately commands Arjuna to arise and fight with honor (11.33: "Tasmāt tvam uttiṣṭha yaśo labhasva").'
        },
        {
          id: 'opt-4',
          text: 'He instructs both armies to form a joint committee to debate theology indefinitely.',
          textHindi: 'वे दोनों सेनाओं को शस्त्र डालकर अनंत काल तक केवल शास्त्रार्थ करने का आदेश देते हैं।',
          isCorrect: false,
          explanation: 'The moment called for decisive righteous duty, not endless equivocation.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 11.32 establishes the sovereign authority of cosmic Time: human effort finds its highest dignity not in arrogant egoism, but in acting as a conscious instrument of righteousness.',
      explanationHindi: 'गीता 11.32 काल के अटल विधान को दर्शाती है: सच्चा पुरुषार्थ अहंकार में नहीं, बल्कि धर्म के कार्य में निमित्त बनने में है।',
      practicalApplication: 'Recognize the broader cosmic currents beyond your control, and courageously discharge your role as an instrument of integrity.',
      practicalApplicationHindi: 'परिस्थितियों के विराट प्रवाह को समझें और अपने कर्तव्य को पूर्ण निष्ठा से निभाकर सत्य के माध्यम बनें।'
    };
  }

  if (ch === 12 && v === 13) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 12.13 ("Adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca"), what virtues distinguish the devotee dearest to the Divine?',
      promptHindi: 'गीता 12.13 ("अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च...") में सच्चे भक्त के किन लक्षणों को रेखांकित किया गया है?',
      instruction: 'Select the character virtues declared by Krishna as the authentic markers of devotion.',
      instructionHindi: 'उन आचरणगत सद्गुणों को पहचानें जिन्हें श्री कृष्ण भक्ति की सच्ची पहचान बताते हैं।',
      options: [
        {
          id: 'opt-1',
          text: 'Freedom from malice toward all beings, friendliness, compassion, freedom from possessiveness and ego, and equanimity in pleasure and pain.',
          textHindi: 'प्राणिमात्र के प्रति द्वेष का अभाव, मित्रता, करुणा, ममता और अहंकार से मुक्ति, तथा सुख-दुःख में समभाव।',
          isCorrect: true,
          explanation: 'Verse 12.13 explicitly lists: "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca, nirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī".'
        },
        {
          id: 'opt-2',
          text: 'The ability to perform complex physical asceticism while harboring hatred for neighbors.',
          textHindi: 'कठोर शारीरिक तपस्या करना किंतु पड़ोसियों से कटु द्वेष रखना।',
          isCorrect: false,
          explanation: 'Krishna explicitly demands freedom from ill-will toward all creatures ("adveṣṭā sarva-bhūtānāṁ").'
        },
        {
          id: 'opt-3',
          text: 'Spending vast wealth on public spectacles to prove social superiority.',
          textHindi: 'सामाजिक श्रेष्ठता सिद्ध करने के लिए केवल धन का प्रदर्शन करना।',
          isCorrect: false,
          explanation: 'True Bhakti requires freedom from egoism ("nirahaṅkāraḥ"), not vain display.'
        },
        {
          id: 'opt-4',
          text: 'Exclusively associating with people of identical social rank while ignoring those in need.',
          textHindi: 'केवल अपने स्तर के लोगों से मिलना और जरूरतमंदों की उपेक्षा करना।',
          isCorrect: false,
          explanation: 'Devotion is characterized by universal compassion ("karuṇaḥ") for all living beings.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 12.13 establishes that authentic devotion is expressed through moral character: friendliness, empathy, humility, and peaceful forgiveness.',
      explanationHindi: 'गीता 12.13 स्पष्ट करती है कि सच्ची भक्ति आचरण में है: सबके प्रति मैत्री, करुणा, निरहंकारिता और क्षमा।',
      practicalApplication: 'Express your spiritual values through genuine kindness and empathy toward every person you encounter.',
      practicalApplicationHindi: 'अपने दैनिक जीवन में सबके प्रति सद्भाव, करुणा और आदर का व्यवहार करें।'
    };
  }

  if (ch === 14 && v === 5) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 14.5 ("Sattvaṁ rajas tama iti guṇāḥ prakṛti-sambhavāḥ"), what are the three modes that bind the soul to the physical body?',
      promptHindi: 'गीता 14.5 के अनुसार प्रकृति से उत्पन्न कौन से तीन गुण जीवात्मा को देह में बांधते हैं?',
      instruction: 'Identify the threefold psychological forces of material nature detailed in verse 14.5.',
      instructionHindi: 'श्लोक 14.5 में वर्णित प्रकृति के तीन मूलभूत गुणों को पहचानें।',
      options: [
        {
          id: 'opt-1',
          text: 'Sattva (purity and light), Rajas (passion and craving), and Tamas (inertia and delusion).',
          textHindi: 'सत्त्व (निर्मलता और प्रकाश), रजस् (राग और तृष्णा), तथा तमस् (अज्ञान, प्रमाद और आलस्य)।',
          isCorrect: true,
          explanation: 'Verse 14.5 explicitly establishes: "sattvaṁ rajas tama iti guṇāḥ prakṛti-sambhavāḥ, nibadhnanti mahā-bāho dehe dehinam avyayam".'
        },
        {
          id: 'opt-2',
          text: 'Earth, water, and fire as physical chemical elements.',
          textHindi: 'भौतिक रासायनिक तत्वों के रूप में पृथ्वी, जल और अग्नि।',
          isCorrect: false,
          explanation: 'The three Gunas are subtle psychological and cosmic modes, not coarse physical elements.'
        },
        {
          id: 'opt-3',
          text: 'Past, present, and future time measurements.',
          textHindi: 'भूत, वर्तमान और भविष्य के कालखंड।',
          isCorrect: false,
          explanation: 'The verse explicitly specifies Sattva, Rajas, and Tamas.'
        },
        {
          id: 'opt-4',
          text: 'Sight, hearing, and speech as sensory faculties.',
          textHindi: 'इंद्रिय शक्तियों के रूप में दृष्टि, श्रवण और वाणी।',
          isCorrect: false,
          explanation: 'The Gunas govern the quality of all perception and action, but are distinct from sensory organs.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 14.5 reveals the foundational tripartite psychology of the Gita: human experience is shaped by the interplay of Sattva, Rajas, and Tamas.',
      explanationHindi: 'गीता 14.5 मानवीय अंतःकरण के तीन आधार स्तंभों को स्पष्ट करती है: सत्त्व, रजस् और तमस् का निरंतर प्रभाव।',
      practicalApplication: 'Recognize whether lethargy (Tamas) or frantic agitation (Rajas) is driving your thoughts, and elevate your mind toward calm clarity (Sattva).',
      practicalApplicationHindi: 'पहचानें कि क्या आपका मन आलस्य (तमस्) या हड़बड़ी (रजस्) में है, और उसे सात्त्विक शांति की ओर ले जाएँ।'
    };
  }

  if (ch === 18 && v === 66) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'In Gita 18.66 ("Sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja"), what supreme assurance does Krishna grant to Arjuna?',
      promptHindi: 'गीता 18.66 ("सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज...") में भगवान श्री कृष्ण अर्जुन को क्या परम आश्वासन देते हैं?',
      instruction: 'Identify the ultimate refuge and promise of liberation articulated in this culminating verse.',
      instructionHindi: 'इस परम श्लोक में घोषित शरणागति और शोक-मुक्ति के पावन वचन को पहचानें।',
      options: [
        {
          id: 'opt-1',
          text: 'To abandon all relative anxieties and egoistic calculations, surrendering unto Him alone, promising complete liberation from all sinful reactions and grief.',
          textHindi: 'समस्त धर्मों और चिंताओं के आश्रय को त्यागकर केवल मेरी शरण में आ जाओ; मैं तुम्हें समस्त पापों से मुक्त कर दूँगा, शोक मत करो।',
          isCorrect: true,
          explanation: 'Verse 18.66 is celebrated as the "Charama Shloka" of unconditional refuge: "ahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ".'
        },
        {
          id: 'opt-2',
          text: 'To abandon his family immediately and wander without purpose.',
          textHindi: 'तुरंत परिवार को छोड़कर बिना किसी लक्ष्य के भटकना।',
          isCorrect: false,
          explanation: 'Surrender in the Gita is an internal consecration of the ego, not physical abandonment of duty.'
        },
        {
          id: 'opt-3',
          text: 'To invent a new sectarian dogma and enforce it with political coercion.',
          textHindi: 'एक नया संप्रदाय बनाकर बलपूर्वक दूसरों पर थोपना।',
          isCorrect: false,
          explanation: 'The verse calls for universal surrender of the ego to the Supreme, beyond all sectarian dogmas.'
        },
        {
          id: 'opt-4',
          text: 'To cease all thinking and wait passively for fate without taking ethical action.',
          textHindi: 'बिना कोई कर्म किए केवल भाग्य के भरोसे बैठे रहना।',
          isCorrect: false,
          explanation: 'After this verse, Arjuna takes up his bow with clear resolve to fulfill his righteous duty.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'Gita 18.66 is the pinnacle of the Bhagavad Gita, where Krishna promises total liberation and peace to the soul that takes unreserved refuge in the Divine.',
      explanationHindi: 'गीता 18.66 उपदेश का सर्वोच्च शिखर है जहाँ प्रभु के प्रति पूर्ण शरणागति समस्त भय और संताप से मुक्ति दिलाती है।',
      practicalApplication: 'When you have performed your sincere best, release paralyzing worry and trust your life into divine care.',
      practicalApplicationHindi: 'अपना सर्वश्रेष्ठ प्रयास करने के बाद भविष्य की चिंता छोड़ें और ईश्वर के संरक्षण में निश्चिंत रहें।'
    };
  }

  if (ch === 18 && v === 78) {
    return {
      id: `chal-${levelId}`,
      verseId: levelId,
      type: 'multiple-choice',
      prompt: 'What does Sanjaya declare as the supreme conclusion of the entire Bhagavad Gita in its 700th verse?',
      promptHindi: 'श्रीमद्भगवद्गीता के 700वें श्लोक में संजय गीता के परम निष्कर्ष के रूप में क्या उद्घोष करते हैं?',
      instruction: 'Identify the union that Sanjaya certifies as the guarantor of victory, prosperity, and unwavering righteousness.',
      instructionHindi: 'उस दिव्य मिलन को पहचानें जिसे संजय विजय, ऐश्वर्य और अचल नीति की शाश्वत गारंटी घोषित करते हैं।',
      options: [
        {
          id: 'opt-1',
          text: 'Wherever divine wisdom (Krishna, Master of Yoga) unites with committed human action (Arjuna, wielder of the bow), enduring prosperity, victory, and dharma are certain.',
          textHindi: 'जहाँ ईश्वरीय विवेक (योगेश्वर श्री कृष्ण) और समर्पित मानवीय पुरुषार्थ (धनुर्धर अर्जुन) एक साथ हैं, वहीं विजय, विभूति और धर्म निश्चित हैं।',
          isCorrect: true,
          explanation: 'Sanjaya synthesizes the entire scripture: spiritual consciousness (Yogeshvara) partnered with diligent, skilled worldly duty (Dhanurdhara) ensures righteous victory.'
        },
        {
          id: 'opt-2',
          text: 'Military strength and sheer numerical superiority alone decide the historical fate of human struggles.',
          textHindi: 'केवल सैन्य बल और बड़ी संख्या ही मानवीय संघर्षों के भाग्य का अंतिम फैसला करती है।',
          isCorrect: false,
          explanation: 'The Kaurava army was larger, yet Sanjaya declares victory rests where Krishna and Arjuna stand.'
        },
        {
          id: 'opt-3',
          text: 'The outcome of the Kurukshetra war remains an unsolved mystery without moral or philosophical resolution.',
          textHindi: 'कुरुक्षेत्र के युद्ध का परिणाम एक अनसुलझा रहस्य है जिसका कोई नैतिक निष्कर्ष नहीं निकला।',
          isCorrect: false,
          explanation: 'Sanjaya states "dhruva nitir matir mama", expressing firm moral conviction.'
        },
        {
          id: 'opt-4',
          text: 'One should renounce all tools, weapons, and responsibilities, awaiting divine intervention without personal effort.',
          textHindi: 'मनुष्य को सभी जिम्मेदारियों और शस्त्रों को त्यागकर बिना प्रयास किए केवल चमत्कार की प्रतीक्षा करनी चाहिए।',
          isCorrect: false,
          explanation: 'Arjuna is celebrated as "Dhanurdhara", emphasizing active human dedication.'
        }
      ],
      correctAnswer: 'opt-1',
      explanation: 'The 700th verse synthesizes grace and effort: neither passive fatalism nor arrogant self-reliance, but human action consecrated to divine wisdom.',
      explanationHindi: '700वाँ श्लोक ईश्वरीय कृपा और मानवीय पुरुषार्थ का दिव्य समन्वय है: न अंध भाग्यवादिता और न अहंकारी आत्मनिर्भरता, बल्कि ज्ञान से युक्त निष्काम कर्म।',
      practicalApplication: 'Pair your highest ethical vision with your most diligent practical effort in every life arena.',
      practicalApplicationHindi: 'अपने जीवन के प्रत्येक क्षेत्र में उच्च सात्त्विक दृष्टिकोण और अथक पुरुषार्थ का सुंदर समन्वय करें।'
    };
  }

  // General Verse Multiple Choice
  const cleanedVerseEn = enText.replace(/^(Sanjaya said:|Dhritarashtra said:|Arjuna said:|The Blessed Lord said:)\s*/i, '').trim();
  const cleanedVerseHi = hiText.replace(/^(संजय बोले:|धृतराष्ट्र बोले:|अर्जुन बोले:|श्रीभगवान बोले:)\s*/i, '').trim();

  const questionEn = `${speakerName} declares in Verse ${levelId}: "${cleanedVerseEn.slice(0, 100)}...". What key truth does this teaching establish?`;
  const questionHi = `${speakerNameHindi} श्लोक ${levelId} में कहते हैं: "${cleanedVerseHi.slice(0, 90)}..."। यह उपदेश किस मुख्य तत्व-सत्य को स्थापित करता है?`;

  const correctOptTextEn = `It reveals that: ${cleanedVerseEn.length > 140 ? cleanedVerseEn.slice(0, 137) + '...' : cleanedVerseEn}`;
  const correctOptTextHi = `यह स्पष्ट करता है कि: ${cleanedVerseHi.length > 130 ? cleanedVerseHi.slice(0, 127) + '...' : cleanedVerseHi}`;

  let distractor1En = '';
  let distractor1Hi = '';
  let distractor2En = '';
  let distractor2Hi = '';
  let distractor3En = '';
  let distractor3Hi = '';

  if (ch === 1) {
    distractor1En = 'It asserts that Duryodhana was eager to surrender all claims and grant the Pandavas their rightful inheritance.';
    distractor1Hi = 'यह दावा करता है कि दुर्योधन अपना सारा राज्य त्यागकर पाण्डवों को देने के लिए तैयार था।';
    distractor2En = 'It suggests that Arjuna felt completely confident and eager to slaughter his teachers and family elders without hesitation.';
    distractor2Hi = 'यह दर्शाता है कि अर्जुन अपने गुरुजनों और संबंधियों का वध करने के लिए अत्यंत उतावले थे।';
    distractor3En = 'It indicates that both armies agreed that righteousness and justice were entirely irrelevant to the conflict.';
    distractor3Hi = 'यह संकेत देता है कि दोनों सेनाओं ने मान लिया था कि इस युद्ध में धर्म और न्याय का कोई स्थान नहीं है।';
  } else if (ch === 2 || ch === 13) {
    distractor1En = 'It claims that the individual physical body is immortal and will never perish or change through time.';
    distractor1Hi = 'यह दावा करता है कि भौतिक शरीर अमर है और समय के साथ कभी नष्ट नहीं होगा।';
    distractor2En = 'It suggests that the soul is created at birth and completely annihilated at physical death.';
    distractor2Hi = 'यह सिखाता है कि आत्मा का जन्म देह के साथ होता है और देहांत के साथ इसका पूर्ण विनाश हो जाता है।';
    distractor3En = 'It argues that mental equanimity is impossible, so one should surrender entirely to emotional grief.';
    distractor3Hi = 'यह तर्क देता है कि मन का समत्व असंभव है इसलिए मनुष्य को पूरी तरह शोक में डूब जाना चाहिए।';
  } else if (ch === 3 || ch === 4 || ch === 5) {
    distractor1En = 'It argues that physical inaction and neglecting daily obligations is the highest form of spiritual realization.';
    distractor1Hi = 'यह तर्क देता है कि अपने कर्तव्यों से मुँह मोड़कर हाथ पर हाथ धरकर बैठना ही सर्वोच्च साधना है।';
    distractor2En = 'It teaches that one should only perform work when motivated by intense personal vanity and desire for acclaim.';
    distractor2Hi = 'यह सिखाता है कि कर्म केवल तभी करना चाहिए जब उसमें अपार यश और अहंकार की पूर्ति हो।';
    distractor3En = 'It implies that sacred knowledge can be bought with money without self-discipline or humble inquiry.';
    distractor3Hi = 'यह संकेत देता है कि आत्म-ज्ञान को बिना किसी अनुशासन के धन देकर खरीदा जा सकता है।';
  } else if (ch === 6 || ch === 12) {
    distractor1En = 'It claims that meditation requires extreme physical self-torture and total suppression of breathing.';
    distractor1Hi = 'यह दावा करता है कि ध्यान के लिए शरीर को भयानक यातनाएँ देना आवश्यक है।';
    distractor2En = 'It asserts that a true practitioner feels intense hatred toward anyone who holds different beliefs.';
    distractor2Hi = 'यह कहता है कि सच्चे साधक को अन्य मत मानने वालों से घृणा करनी चाहिए।';
    distractor3En = 'It suggests that the wandering mind cannot be restrained through practice (abhyasa) and dispassion (vairagya).';
    distractor3Hi = 'यह सिखाता है कि चंचल मन को अभ्यास और वैराग्य द्वारा वश में नहीं किया जा सकता।';
  } else if (ch >= 7 && ch <= 11) {
    distractor1En = 'It presents the divine as a distant, indifferent entity unconnected to the cosmic order or human consciousness.';
    distractor1Hi = 'यह ईश्वर को एक दूरस्थ और उदासीन सत्ता के रूप में प्रस्तुत करता है जिसका सृष्टि से कोई संबंध नहीं।';
    distractor2En = 'It claims that material nature operates completely independent of any underlying spiritual reality.';
    distractor2Hi = 'यह दावा करता है कि प्रकृति बिना किसी चेतन सत्ता के स्वयं ही संचालित हो रही है।';
    distractor3En = 'It states that offerings made with pure love and devotion are rejected unless accompanied by massive lavish wealth.';
    distractor3Hi = 'यह कहता है कि बिना अपार धन और वैभव के शुद्ध प्रेम से अर्पित वस्तु स्वीकार नहीं होती।';
  } else if (ch === 14 || ch === 17) {
    distractor1En = 'It claims that Tamas (ignorance and lethargy) is superior to Sattva (clarity and harmony) for inner growth.';
    distractor1Hi = 'यह दावा करता है कि आत्म-विकास के लिए तमोगुण सत्त्वगुण से श्रेष्ठ है।';
    distractor2En = 'It asserts that food and lifestyle habits have zero effect on the clarity of human intellect and thought.';
    distractor2Hi = 'यह कहता है कि आहार और दिनचर्या का मानव बुद्धि और विचारों की शुद्धि पर कोई प्रभाव नहीं पड़ता।';
    distractor3En = 'It implies that faith is identical in all individuals regardless of their internal character and qualities.';
    distractor3Hi = 'यह संकेत देता है कि स्वभाव और गुणों के भेद के बिना सभी की श्रद्धा एक जैसी होती है।';
  } else {
    distractor1En = 'It claims that true renunciation means abandoning obligatory duties out of fear of physical discomfort.';
    distractor1Hi = 'यह दावा करता है कि शारीरिक कष्ट के भय से कर्तव्य त्याग देना ही सच्चा संन्यास है।';
    distractor2En = 'It argues that pride, wrath, and arrogance are the supreme qualities that lead to spiritual liberation.';
    distractor2Hi = 'यह तर्क देता है कि दंभ, क्रोध और अहंकार मुक्ति दिलाने वाले श्रेष्ठ गुण हैं।';
    distractor3En = 'It asserts that human destiny is entirely predetermined, rendering moral discrimination useless.';
    distractor3Hi = 'यह दावा करता है कि सब कुछ पूर्व-निश्चित है इसलिए नैतिक विवेक सर्वथा व्यर्थ है।';
  }

  return {
    id: `chal-${levelId}`,
    verseId: levelId,
    type: 'multiple-choice',
    prompt: questionEn,
    promptHindi: questionHi,
    instruction: 'Select the option that most faithfully interprets this shloka according to traditional commentary.',
    instructionHindi: 'उस विकल्प को चुनें जो प्रामाणिक व्याख्या के अनुसार इस श्लोक के वास्तविक मर्म को व्यक्त करता है।',
    options: [
      {
        id: 'opt-1',
        text: correctOptTextEn,
        textHindi: correctOptTextHi,
        isCorrect: true,
        explanation: `Accurate comprehension of Chapter ${ch}, Verse ${v}: ${hiText.slice(0, 100)}...`,
        explanationHindi: `अध्याय ${ch}, श्लोक ${v} की यथार्थ समझ: ${hiText.slice(0, 100)}...`
      },
      {
        id: 'opt-2',
        text: distractor1En,
        textHindi: distractor1Hi,
        isCorrect: false,
        explanation: 'This contradicts the central teaching of this chapter and misrepresents the text.',
        explanationHindi: 'यह कथन इस अध्याय के मूल उपदेश के सर्वथा विपरीत है।'
      },
      {
        id: 'opt-3',
        text: distractor2En,
        textHindi: distractor2Hi,
        isCorrect: false,
        explanation: 'This is an erroneous interpretation contrary to Sri Krishna\'s dialogue with Arjuna.',
        explanationHindi: 'यह व्याख्या गीता के संवाद और दार्शनिक संदर्भ से मेल नहीं खाती।'
      },
      {
        id: 'opt-4',
        text: distractor3En,
        textHindi: distractor3Hi,
        isCorrect: false,
        explanation: 'This reflects a common misconception rejected by traditional commentaries.',
        explanationHindi: 'यह एक भ्रामक धारणा है जिसे प्रामाणिक भाष्यकारों ने नकारा है।'
      }
    ],
    correctAnswer: 'opt-1',
    explanation: `Shloka ${levelId} teaches: "${cleanedVerseEn}". In Chapter ${ch} (${chData.nameEnglish}), this deepens the seeker's understanding of self-mastery and spiritual wisdom.`,
    explanationHindi: `श्लोक ${levelId} सिखाता है: "${cleanedVerseHi}"। अध्याय ${ch} (${chData.nameSanskrit}) में यह आत्म-संयम और तत्व-ज्ञान को सुदृढ़ करता है।`,
    practicalApplication: 'Reflect on how this verse clarifies your discernment (Buddhi) when evaluating personal choices today.',
    practicalApplicationHindi: 'विचार करें कि आज के निर्णयों में यह श्लोक आपकी विवेक-बुद्धि को किस प्रकार संतुलित और स्थिर करता है।'
  };
}

// Build Decision Simulation
function createSpecificDecisionSimulation(
  verse: VerseData,
  chData: ChapterData,
  levelId: string
): ChallengeDefinition {
  const ch = verse.chapter;
  let settingEn = 'Workplace & Stress Management';
  let settingHi = 'कार्यक्षेत्र और तनाव प्रबंधन';

  let dilemmaEn = `Applying Shloka ${levelId} on inner steadiness: An unexpected crisis has disrupted months of careful planning, threatening your team's timeline.`;
  let dilemmaHi = `श्लोक ${levelId} के समत्व भाव का अनुप्रयोग: एक अप्रत्याशित संकट ने महीनों की योजना को अस्त-व्यस्त कर दिया है और समय-सीमा पर संकट आ गया है।`;

  let sattvicChoiceEn = 'Maintain composure, accept the changed facts without panic, and focus calmly on the next immediate constructive step.';
  let sattvicChoiceHi = 'धैर्य बनाए रखें, घबराए बिना बदली हुई स्थिति को स्वीकार करें और अगले सकारात्मक कदम पर शांतिपूर्वक ध्यान दें।';
  let sattvicConsequenceEn = 'Intellect (Buddhi) remains undisturbed; your steady leadership reassures colleagues and resolves problems efficiently.';
  let sattvicConsequenceHi = 'बुद्धि स्थिर रहती है; आपका शांत नेतृत्व साथियों का मनोबल बढ़ाता है और समस्या का समाधान निकालता है।';

  let rajasicChoiceEn = 'React with intense irritation, loudly blame colleagues for the setback, and demand frantic overnight scrambling to save face.';
  let rajasicChoiceHi = 'तीव्र क्रोध में आकर सहकर्मियों पर दोषारोपण करें और अपनी साख बचाने के लिए अंधी हड़बड़ी मचाएँ।';
  let rajasicConsequenceEn = 'Agitation clouds judgment; friction increases among team members and mistakes compound.';
  let rajasicConsequenceHi = 'अशांति बुद्धि को भ्रष्ट कर देती है; आपसी तनाव बढ़ता है और गलतियाँ कई गुना बढ़ जाती हैं।';

  let tamasicChoiceEn = 'Pretend the crisis does not exist, avoid answering messages, and retreat into cynical disengagement.';
  let tamasicChoiceHi = 'समस्या को नजरअंदाज कर दें, संदेशों का उत्तर न दें और जिम्मेदारी से मुँह मोड़ लें।';
  let tamasicConsequenceEn = 'Neglect causes the problem to escalate into irreversible failure, damaging trust.';
  let tamasicConsequenceHi = 'लापरवाही समस्या को लाइलाज बना देती है और समाज व कार्यक्षेत्र में साख नष्ट हो जाती है।';

  return {
    id: `chal-${levelId}`,
    verseId: levelId,
    type: 'decision',
    prompt: `Practical Decision Simulation for Shloka ${levelId}`,
    promptHindi: `श्लोक ${levelId} का व्यावहारिक निर्णय अभ्यास`,
    instruction: `${settingEn}: ${dilemmaEn}`,
    instructionHindi: `${settingHi}: ${dilemmaHi}`,
    options: [
      {
        id: 'opt-a',
        text: sattvicChoiceEn,
        textHindi: sattvicChoiceHi,
        isCorrect: true,
        consequence: sattvicConsequenceEn,
        consequenceHindi: sattvicConsequenceHi,
        explanation: `Directly embodies the wisdom of Verse ${levelId}: Acting with equanimity, integrity, and non-attachment.`,
        explanationHindi: `श्लोक ${levelId} के मर्म को साकार करता है: समत्व बुद्धि, निष्ठा और अनासक्ति से कर्तव्य निभाना।`
      },
      {
        id: 'opt-b',
        text: rajasicChoiceEn,
        textHindi: rajasicChoiceHi,
        isCorrect: false,
        consequence: rajasicConsequenceEn,
        consequenceHindi: rajasicConsequenceHi,
        explanation: 'Reflects Rajasic reactivity: Driven by ego, passion, craving for praise, or anger.',
        explanationHindi: 'राजसिक प्रवृत्ति का परिचायक: अहंकार, तृष्णा, क्रोध और अशांति से प्रेरित आचरण।'
      },
      {
        id: 'opt-c',
        text: tamasicChoiceEn,
        textHindi: tamasicChoiceHi,
        isCorrect: false,
        consequence: tamasicConsequenceEn,
        consequenceHindi: tamasicConsequenceHi,
        explanation: 'Reflects Tamasic delusion: Characterized by avoidance, neglect, lethargy, or passive malice.',
        explanationHindi: 'तामसिक प्रमाद का परिचायक: आलस्य, टालमटोल, भय और कर्तव्य से पलायन।'
      }
    ],
    correctAnswer: 'opt-a',
    explanation: `In Shloka ${levelId}, the Gita instructs us that the quality of our consciousness determines the outcome of action. Choosing duty over impulse aligns our daily life with spiritual clarity.`,
    explanationHindi: `श्लोक ${levelId} में गीता सिखाती है कि हमारी चेतना की शुद्धि ही कर्म के परिणाम को निर्धारित करती है। आवेग पर कर्तव्य की विजय ही सच्ची साधना है।`,
    practicalApplication: 'When facing similar tensions today, pause and choose the response that preserves inner peace over egoic victory.',
    practicalApplicationHindi: 'जब भी जीवन में ऐसा तनाव आए, एक क्षण रुकें और अहंकार की जीत के स्थान पर अंतःकरण की शांति और धर्म को चुनें।'
  };
}

// Build Reflection
function createSpecificReflection(
  verse: VerseData,
  chData: ChapterData,
  levelId: string
): ChallengeDefinition {
  const ch = verse.chapter;
  const enText = cleanTranslation(verse.translations.english?.text || '');
  const hiText = cleanTranslation(verse.translations.hindi?.text || '');
  const cleanedEn = enText.replace(/^(Sanjaya said:|Dhritarashtra said:|Arjuna said:|The Blessed Lord said:)\s*/i, '').trim();
  const cleanedHi = hiText.replace(/^(संजय बोले:|धृतराष्ट्र बोले:|अर्जुन बोले:|श्रीभगवान बोले:)\s*/i, '').trim();

  const promptEn = `Contemplate the wisdom in Shloka ${levelId}: "${cleanedEn.slice(0, 95)}...". Which contemplative perspective deepens your peace today?`;
  const promptHi = `श्लोक ${levelId} के तत्व-ज्ञान का मनन करें: "${cleanedHi.slice(0, 85)}..."। आज कौन सा विचार आपके अंतःकरण को शांत करता है?`;

  const witnessEn = 'I observe thoughts and feelings come and go like clouds, while the inner witnessing consciousness remains still and serene.';
  const witnessHi = 'मैं विचारों और भावनाओं को आकाश में बादलों की तरह आते-जाते देखता हूँ, जबकि मेरी भीतरी साक्षी चेतना सदा शांत और निर्मल रहती है।';

  const equanimityEn = 'I accept that joy and sorrow, gain and loss are natural waves of life; by not clinging to either, I preserve my equilibrium.';
  const equanimityHi = 'मैं स्वीकार करता हूँ कि सुख-दुःख और लाभ-हानि जीवन की स्वाभाविक तरंगें हैं; इनमें उलझे बिना मैं अपना मानसिक संतुलन बनाए रखता हूँ।';

  const dedicationEn = 'I dedicate my actions and responsibilities to the divine good, feeling gratitude for the opportunity to serve.';
  const dedicationHi = 'मैं अपने कर्मों और दायित्वों को निष्काम भाव से प्रभु-अर्पण करता हूँ और सेवा के अवसर के लिए कृतज्ञ रहता हूँ।';

  return {
    id: `chal-${levelId}`,
    verseId: levelId,
    type: 'reflection',
    prompt: `Contemplative Inquiry: Shloka ${levelId}`,
    promptHindi: `आत्म-अवलोकन एवं मनन: श्लोक ${levelId}`,
    instruction: promptEn,
    instructionHindi: promptHi,
    reflectionPrompt: `Pause for three conscious breaths. Read the perspectives below and choose the one that most deepens your contemplation today:`,
    reflectionPromptHindi: `तीन गहरी श्वास लें। नीचे दिए गए दृष्टिकोणों को पढ़कर उस विचार को चुनें जो आज आपके मनन को सबसे अधिक शांति देता है:`,
    options: [
      {
        id: 'opt-reflect-1',
        text: witnessEn,
        textHindi: witnessHi,
        isCorrect: true,
        explanation: 'Cultivating the witness consciousness (Sakshi Bhava) dissolves mental agitation and reveals inner stillness.',
        explanationHindi: 'साक्षी भाव का अभ्यास मानसिक अशांति को शांत कर अंतःकरण में अविचल स्थिरता प्रकट करता है।'
      },
      {
        id: 'opt-reflect-2',
        text: equanimityEn,
        textHindi: equanimityHi,
        isCorrect: true,
        explanation: 'Practicing equanimity (Samatva) amidst life\'s inevitable dualities is declared by Krishna to be the true essence of Yoga.',
        explanationHindi: 'द्वंद्वों में समत्व भाव रखना ही भगवान श्री कृष्ण के अनुसार योग का वास्तविक स्वरूप है।'
      },
      {
        id: 'opt-reflect-3',
        text: dedicationEn,
        textHindi: dedicationHi,
        isCorrect: true,
        explanation: 'Selfless dedication transforms ordinary secular tasks into consecrated spiritual wisdom (Yajna).',
        explanationHindi: 'निष्काम समर्पण सांसारिक कर्मों को भी पवित्र यज्ञ और साधना में रूपांतरित कर देता है।'
      }
    ],
    correctAnswer: 'opt-reflect-1',
    explanation: `Shloka ${levelId} guides the seeker from surface confusion to contemplative stillness. Internalizing scripture through reflection (Manana) turns concepts into lived wisdom.`,
    explanationHindi: `श्लोक ${levelId} साधक को भ्रम से आत्म-शांति की ओर ले जाता है। शास्त्रों का मनन सैद्धांतिक ज्ञान को प्रत्यक्ष अनुभव में बदल देता है।`,
    practicalApplication: 'Carry this contemplative pause with you into your interactions throughout the day.',
    practicalApplicationHindi: 'दिन भर के कार्यों में इस शांत साक्षी भाव को अपने साथ बनाए रखें।'
  };
}

// Build Matching Challenge
function createSpecificMatchingChallenge(
  verse: VerseData,
  chData: ChapterData,
  levelId: string
): ChallengeDefinition {
  const ch = verse.chapter;
  const words = verse.wordMeanings || [];

  let pairs: MatchingPair[] = [];
  const validWords = (words || []).filter(w => Boolean(w.word) && Boolean(w.meaningEnglish));
  if (validWords.length >= 3) {
    pairs = validWords.slice(0, 4).map((w, idx) => ({
      id: `pair-${idx + 1}`,
      sanskritWord: w.word,
      transliteration: w.transliteration,
      meaning: w.meaningEnglish,
      meaningHindi: w.transliteration || w.word
    }));
  } else {
    pairs = [
      { id: 'pair-1', sanskritWord: 'धर्म (Dharma)', meaning: 'Righteous duty / Moral order', meaningHindi: 'सदाचार / नैतिक कर्तव्य' },
      { id: 'pair-2', sanskritWord: 'कर्म (Karma)', meaning: 'Action and cause-effect', meaningHindi: 'कर्म और उसका उत्तरदायित्व' },
      { id: 'pair-3', sanskritWord: 'योग (Yoga)', meaning: 'Union / Equanimity of mind', meaningHindi: 'समत्व बुद्धि / परमात्मा से योग' },
      { id: 'pair-4', sanskritWord: 'ज्ञान (Jnana)', meaning: 'Spiritual knowledge / Realization', meaningHindi: 'तत्व-ज्ञान / आत्म-साक्षात्कार' }
    ];
  }

  return {
    id: `chal-${levelId}`,
    verseId: levelId,
    type: 'matching',
    prompt: `Connect each sacred Sanskrit term from Shloka ${levelId} with its authentic meaning.`,
    promptHindi: `श्लोक ${levelId} के संस्कृत पदों को उनके यथार्थ अर्थ से सुमेलित कीजिए।`,
    instruction: 'Match each Sanskrit word on the left with its verified English definition on the right.',
    instructionHindi: 'बाईं ओर के संस्कृत शब्दों का दाईं ओर दिए गए उनके प्रामाणिक अर्थ से मिलान करें।',
    matchingPairs: pairs,
    explanation: `In Shloka ${levelId}, these terms carry precise philosophical weight within Chapter ${ch} (${chData.nameEnglish}). Understanding the exact Sanskrit vocabulary unlocks the depth of the teaching.`,
    explanationHindi: `श्लोक ${levelId} में प्रयुक्त ये पद अध्याय ${ch} (${chData.nameSanskrit}) के दार्शनिक आधार हैं। इन मूल शब्दों का यथार्थ बोध गीता के मर्म को खोलता है।`,
    practicalApplication: 'Reflect on how understanding these root terms clarifies ancient wisdom in your daily thinking.',
    practicalApplicationHindi: 'विचार करें कि इन मूल पदों की स्पष्टता आपके दैनिक चिंतन को किस प्रकार आलोकित करती है।'
  };
}

// Build Shloka Puzzle
function createSpecificShlokaPuzzle(
  verse: VerseData,
  chData: ChapterData,
  levelId: string
): ChallengeDefinition {
  const ch = verse.chapter;
  const cleanSkt = cleanSanskrit(verse.sanskrit);
  const rawLines = cleanSkt.split('\n').filter(l => l.trim().length > 0);
  let segments: ShlokaSegment[] = [];

  if (rawLines.length >= 2) {
    segments = rawLines.slice(0, 4).map((line, idx) => ({
      id: `seg-${idx + 1}`,
      sanskrit: line.trim(),
      order: idx + 1
    }));
  } else {
    const parts = cleanSkt.split('।').filter(p => p.trim().length > 0);
    segments = parts.slice(0, 3).map((part, idx) => ({
      id: `seg-${idx + 1}`,
      sanskrit: part.trim() + (idx < parts.length - 1 ? ' ।' : ' ।।'),
      order: idx + 1
    }));
  }

  if (segments.length < 2) {
    segments = [
      { id: 'seg-1', sanskrit: cleanSkt.substring(0, Math.floor(cleanSkt.length / 2)).trim(), order: 1 },
      { id: 'seg-2', sanskrit: cleanSkt.substring(Math.floor(cleanSkt.length / 2)).trim(), order: 2 }
    ];
  }

  return {
    id: `chal-${levelId}`,
    verseId: levelId,
    type: 'shloka-puzzle',
    prompt: `Reconstruct the sacred recitation for Shloka ${levelId} in its authentic poetic sequence.`,
    promptHindi: `श्लोक ${levelId} के चरणों को उनके प्रामाणिक छंदबद्ध क्रम में व्यवस्थित कीजिए।`,
    instruction: 'Arrange the poetic segments in their correct order to restore the complete Sanskrit verse.',
    instructionHindi: 'पदों को सही क्रम में लगाकर पूर्ण संस्कृत श्लोक का निर्माण करें।',
    shlokaSegments: segments,
    correctAnswer: segments.map(s => s.id),
    explanation: `Reciting the shloka in proper metrical structure (Anushtup meter) preserves both the phonetic resonance and the clarity of meaning revealed in Chapter ${ch}.`,
    explanationHindi: `अनुष्टुप् छंद की उचित लय में श्लोक का पाठ करना ध्वनि-तरंगों की शुद्धि और अर्थ की स्पष्टता दोनों की रक्षा करता है।`,
    practicalApplication: 'Chanting or mentally ordering the verse reinforces focus, retention, and calm contemplation.',
    practicalApplicationHindi: 'श्लोक के पदों का क्रमिक उच्चारण मानसिक एकाग्रता और स्मृति को सुदृढ़ करता है।'
  };
}

// Create Challenge Dispatcher
function createChallenge(
  verse: VerseData,
  chData: ChapterData,
  challengeType: ChallengeType,
  levelId: string
): ChallengeDefinition {
  if (challengeType === 'matching') {
    return createSpecificMatchingChallenge(verse, chData, levelId);
  }
  if (challengeType === 'shloka-puzzle') {
    return createSpecificShlokaPuzzle(verse, chData, levelId);
  }
  if (challengeType === 'decision') {
    return createSpecificDecisionSimulation(verse, chData, levelId);
  }
  if (challengeType === 'reflection') {
    return createSpecificReflection(verse, chData, levelId);
  }
  return createSpecificMultipleChoice(verse, chData, levelId);
}

// Generate the 700 levels
function generateAllLevels(): GameLevel[] {
  const levels: GameLevel[] = [];
  let globalIndex = 0;

  for (const chData of chapters) {
    const chNum = chData.number;
    const paddedCh = String(chNum).padStart(2, '0');
    const verseFilePath = path.join(VERSES_DIR, `chapter-${paddedCh}.json`);

    if (!fs.existsSync(verseFilePath)) {
      console.error(`Missing verse file for chapter ${chNum}: ${verseFilePath}`);
      continue;
    }

    const verses: VerseData[] = JSON.parse(fs.readFileSync(verseFilePath, 'utf-8'));

    for (const verse of verses) {
      globalIndex++;
      const vNum = verse.verse;
      const levelId = `${chNum}.${vNum}`;
      const { speakerName, speakerNameHindi } = detectSpeaker(verse.sanskrit, verse.transliteration);
      const { mode, challengeType } = selectGameplayMode(chNum, vNum, globalIndex);
      const title = generateLevelTitle(verse, chData);
      const titleHindi = generateLevelTitleHindi(verse, chData);
      const objective = generateLearningObjective(verse, chData);
      const objectiveHindi = generateLearningObjectiveHindi(verse, chData);
      const challenge = createChallenge(verse, chData, challengeType, levelId);

      const narrativeContext = `Dialogue in Chapter ${chNum} (${chData.nameEnglish} — ${chData.meaning}). Speaker: ${speakerName}. Historical-philosophical setting on Kurukshetra.`;
      const narrativeContextHindi = `अध्याय ${chNum} (${chData.nameSanskrit} — ${chData.descriptionHindi || chData.meaning}) का संवाद। वक्ता: ${speakerNameHindi}। कुरुक्षेत्र का पावन रणक्षेत्र।`;

      const explanation = cleanTranslation(verse.translations.english?.text || '');
      const explanationHindi = cleanTranslation(verse.translations.hindi?.text || '');

      const level: GameLevel = {
        id: levelId,
        globalIndex,
        chapter: chNum,
        verse: vNum,
        title,
        titleHindi,
        gameplayMode: mode,
        learningObjective: objective,
        learningObjectiveHindi: objectiveHindi,
        narrativeContext,
        narrativeContextHindi,
        explanation,
        explanationHindi,
        interpretationSourceIds: ['gita-press-sadhaka-sanjivani', 'sivananda-divine-life', 'iitk-supersite'],
        challengeId: challenge.id,
        challenge,
        requiredObjectives: [objective],
        minimumMasteryScore: 80,
        xpReward: 20,
        reviewStatus: 'draft'
      };

      levels.push(level);
    }
  }

  return levels;
}

console.log('Generating complete 700-level game dataset with bilingual English & Hindi support...');
const levels = generateAllLevels();

console.log(`Generated ${levels.length} levels. Saving to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(levels, null, 2), 'utf-8');
console.log('Successfully saved levels-data.json with 700 fully localized bilingual levels!');
