import fs from 'fs';
import path from 'path';
import { GitaLifeLesson, UnderstandingOption, UnderstandingCheck } from '../src/game/types/life-lesson';
import { GameLevel } from '../src/game/types/level';

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
const LEVELS_DATA_PATH = path.join(process.cwd(), 'src/game/content/levels-data.json');
const LIFE_LESSONS_PATH = path.join(process.cwd(), 'src/game/content/life-lessons-data.json');

const chapters: ChapterData[] = JSON.parse(fs.readFileSync(CHAPTERS_PATH, 'utf-8'));

function cleanText(text: string): string {
  return text
    .replace(/\(टिप्पणी[^\)]*\)/g, '')
    .replace(/।।\d+\.\d+।।/g, '')
    .replace(/\|\d+\.\d+\|/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSpeaker(sanskrit: string, transliteration: string): { en: string; hi: string } {
  const s = sanskrit.toLowerCase();
  const t = transliteration.toLowerCase();
  if (s.includes('धृतराष्ट्र उवाच') || t.includes('dhṛitarāśhtra uvācha') || t.includes('dhritarashtra uvacha')) {
    return { en: 'King Dhritarashtra', hi: 'राजा धृतराष्ट्र' };
  }
  if (s.includes('सञ्जय उवाच') || t.includes('sañjaya uvācha') || t.includes('sanjaya uvacha')) {
    return { en: 'Sanjaya', hi: 'संजय' };
  }
  if (s.includes('अर्जुन उवाच') || t.includes('arjuna uvācha') || t.includes('arjuna uvacha')) {
    return { en: 'Arjuna', hi: 'अर्जुन' };
  }
  if (s.includes('श्रीभगवानुवाच') || t.includes('śhrī-bhagavān uvācha') || t.includes('shree bhagavan uvacha')) {
    return { en: 'Lord Krishna (Shree Bhagavan)', hi: 'भगवान श्री कृष्ण' };
  }
  return { en: 'Sacred Dialogue', hi: 'पवित्र संवाद' };
}

// Generate rich, specific 5-section GitaLifeLesson for each verse
export function generateLifeLesson(verse: VerseData, chapter: ChapterData): GitaLifeLesson {
  const ch = verse.chapter;
  const v = verse.verse;
  const verseId = `${ch}.${v}`;
  const speaker = detectSpeaker(verse.sanskrit, verse.transliteration);
  const hindiTranslation = cleanText(verse.translations.hindi?.text || '');
  const englishTranslation = cleanText(verse.translations.english?.text || '');

  let sectionA_text = '';
  let sectionA_textHindi = '';
  let sectionA_context = '';
  let sectionA_contextHindi = '';

  let sectionB_explanation = '';
  let sectionB_explanationHindi = '';

  let sectionC_title = '';
  let sectionC_titleHindi = '';
  let sectionC_scenario = '';
  let sectionC_scenarioHindi = '';
  let sectionC_connection = '';
  let sectionC_connectionHindi = '';

  let sectionD_takeaway = '';
  let sectionD_takeawayHindi = '';

  let check_question = '';
  let check_questionHindi = '';
  let check_options: UnderstandingOption[] = [];
  let check_correctId = 'opt-1';
  let check_feedback = '';
  let check_feedbackHindi = '';

  // Contextual synthesis by chapter & verse groups
  if (ch === 1) {
    if (v === 1) {
      sectionA_text = `In this opening shloka, King Dhritarashtra asks Sanjaya what his sons (the Kauravas) and the sons of Pandu did when gathered on the sacred field of Kurukshetra, eager for battle.`;
      sectionA_textHindi = `इस आरंभिक श्लोक में राजा धृतराष्ट्र संजय से पूछते हैं कि धर्मक्षेत्र कुरुक्षेत्र में युद्ध की इच्छा से एकत्र हुए मेरे पुत्रों (कौरवों) और पाण्डु के पुत्रों ने क्या किया।`;

      sectionA_context = `Speaker: ${speaker.en}. Setting: The palace at Hastinapura, where the blind king receives a divine eyewitness report from Sanjaya of the impending Mahabharata war.`;
      sectionA_contextHindi = `वक्ता: ${speaker.hi}। स्थान: हस्तिनापुर का राजमहल, जहाँ नेत्रहीन राजा संजय से कुरुक्षेत्र के युद्ध का दिव्य दृष्टि द्वारा प्रत्यक्ष विवरण सुन रहे हैं।`;

      sectionB_explanation = `Commentators emphasize the psychological revelation in Dhritarashtra's phrasing: "māmakāḥ" (my sons) versus "pāṇḍavāḥ" (Pandu's sons). Although both are his family under his paternal protection, his possessive partiality reveals an inner division that paved the path to war on the sacred field of Dharma (Dharmakshetra).`;
      sectionB_explanationHindi = `टीकाकार धृतराष्ट्र के शब्दों "मामकाः" (मेरे पुत्र) और "पाण्डवाः" (पाण्डु के पुत्र) में निहित मनोवैज्ञानिक भेद को रेखांकित करते हैं। यद्यपि दोनों कुल के बालक उन्हीं के संरक्षण में थे, किंतु उनकी पक्षपातपूर्ण ममता ने इस पावन धर्मक्षेत्र में युद्ध की आधारशिला रखी।`;

      sectionC_title = `Fairness & Unbiased Leadership`;
      sectionC_titleHindi = `निष्पक्षता और न्यायपूर्ण नेतृत्व`;

      sectionC_scenario = `A team lead or class group leader notices tension between members of their personal circle of friends and external team members during a high-stakes project.`;
      sectionC_scenarioHindi = `किसी महत्वपूर्ण परियोजना के दौरान एक टीम लीडर अपने निजी मित्रों और अन्य सदस्यों के बीच पक्षपात और खिंचाव महसूस करता है।`;

      sectionC_connection = `Dhritarashtra's opening query illustrates how drawing lines of "mine" versus "theirs" in positions of responsibility destroys trust, divides a community, and blinds leaders to ethical fairness.`;
      sectionC_connectionHindi = `धृतराष्ट्र का प्रश्न दर्शाता है कि उत्तरदायित्व के पद पर बैठकर "मेरा" और "तेरा" का भेद करना विश्वास को नष्ट करता है, समूह को बाँटता है और न्याय दृष्टि को अंधा कर देता है।`;

      sectionD_takeaway = `Partiality and ego-driven division in leadership blind the mind to righteousness and sow the seeds of systemic conflict.`;
      sectionD_takeawayHindi = `नेतृत्व में पक्षपात और "मेरे-तेरे" का अहंकार बुद्धि को धर्म से भटकाता है और विनाशकारी संघर्ष के बीज बोता है।`;

      check_question = `What does King Dhritarashtra's phrase "my people and the sons of Pandu" (māmakāḥ pāṇḍavāśhchaiva) reveal psychologically?`;
      check_questionHindi = `राजा धृतराष्ट्र का कथन "मेरे और पाण्डु के पुत्र" (मामकाः पाण्डवाश्चैव) मनोवैज्ञानिक रूप से क्या प्रकट करता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'His deep-seated partiality and possessiveness, separating his biological sons from his brother’s sons despite his duty as king.',
          textHindi: 'उनका गहरा पक्षपात और ममता, जिसके कारण राजा का कर्तव्य भूलकर उन्होंने अपने पुत्रों को भाई के पुत्रों से अलग माना।'
        },
        {
          id: 'opt-2',
          text: 'His desire to mediate a peaceful treaty and prevent violence at all costs.',
          textHindi: 'किसी भी मूल्य पर युद्ध रोककर शांति संधि कराने की उनकी तीव्र इच्छा।'
        },
        {
          id: 'opt-3',
          text: 'His complete spiritual detachment from both armies and the outcome of the war.',
          textHindi: 'दोनों सेनाओं और युद्ध के परिणाम के प्रति उनका पूर्ण वैराग्य व समभाव।'
        },
        {
          id: 'opt-4',
          text: 'His military confidence that the Pandavas would immediately surrender upon seeing Kurukshetra.',
          textHindi: 'उनका यह विश्वास कि कुरुक्षेत्र देखते ही पाण्डव सेना बिना लड़े आत्मसमर्पण कर देगी।'
        }
      ];

      check_feedback = `Correct. Commentators point out that the King's possessive language distinguishes "mine" from "his brother's sons", exposing the partiality at the root of the war.`;
      check_feedbackHindi = `सही उत्तर। आचार्यों के अनुसार "मेरे" और "पाण्डु के पुत्रों" का यह विभाजन धृतराष्ट्र के अंतःकरण के पक्षपात को उजागर करता है, जो युद्ध का मूल कारण बना।`;
    } else if (v === 4) {
      sectionA_text = `Duryodhana points out the formidable heroes of the Pandava army: "Here are brave warriors, mighty archers, equal in battle to Bhima and Arjuna—Yuyudhana (Satyaki), Virata, and the great warrior Drupada."`;
      sectionA_textHindi = `दुर्योधन पाण्डव सेना के महारथियों की ओर संकेत करता है: "इस सेना में बड़े-बड़े धनुषों वाले तथा युद्ध में भीम और अर्जुन के समान शूरवीर युयुधान (सात्यकि), राजा विराट और महारथी द्रुपद हैं।"`;

      sectionA_context = `Speaker: Sanjaya quoting Duryodhana to Drona. Setting: Frontline of Kurukshetra, scrutinizing the Pandava array.`;
      sectionA_contextHindi = `वक्ता: संजय (दुर्योधन के वचनों को दोहराते हुए)। स्थान: कुरुक्षेत्र का रणक्षेत्र जहाँ दुर्योधन विपक्षी सेना का विश्लेषण कर रहा है।`;

      sectionB_explanation = `In enumerating the heroes on the opposing side, Duryodhana acknowledges the formidable skill of his rivals. Traditional commentators note that in strategic undertakings, recognizing opponents' genuine strengths with clear eyes—neither underestimating them out of hubris nor panicking in terror—is essential for objective assessment.`;
      sectionB_explanationHindi = `विपक्षी योद्धाओं की गिनती करते हुए दुर्योधन उनकी वास्तविक शक्ति को स्वीकार करता है। टीकाकार बताते हैं कि किसी भी बड़े कार्य या प्रतियोगिता में प्रतिद्वंद्वी की वास्तविक सामर्थ्य का निष्पक्ष मूल्यांकन करना अनिवार्य है—न अहंकार में उन्हें कम आंकना चाहिए और न ही भयभीत होना चाहिए।`;

      sectionC_title = `Objective Competitor Assessment Without Hubris`;
      sectionC_titleHindi = `बिना अहंकार के प्रतिद्वंद्वी का यथार्थवादी मूल्यांकन`;

      sectionC_scenario = `An athlete or startup team prepares for a major tournament or product launch by analyzing the proven strengths of their competitors honestly rather than dismissing them with wishful thinking.`;
      sectionC_scenarioHindi = `प्रतियोगिता या परीक्षा से पहले कोई परीक्षार्थी या खिलाड़ी अपने प्रतिद्वंद्वियों की वास्तविक ताकत का निष्पक्ष अध्ययन करता है, ताकि वह स्वयं बेहतर तैयारी कर सके।`;

      sectionC_connection = `Duryodhana’s detailed listing shows that honest assessment of opposition capability is necessary in any endeavor; true confidence is grounded in realistic preparation, not self-delusion.`;
      sectionC_connectionHindi = `विपक्षी महारथियों की यह गणना सिखाती है कि यथार्थवादी समझ ही सच्ची तैयारी की नींव है; खोखला आत्मविश्वास विफलता की ओर ले जाता है।`;

      sectionD_takeaway = `Acknowledge competitors' and challenges' true strength with objective clarity, anchoring your confidence in diligent preparation.`;
      sectionD_takeawayHindi = `चुनौतियों और प्रतिद्वंद्वियों की वास्तविक शक्ति का निष्पक्ष आंकलन करें और अपनी तैयारी को यथार्थ पर आधारित रखें।`;

      check_question = `In Gita 1.4, which great warriors of the Pandava army does Duryodhana specifically name as equals to Bhima and Arjuna?`;
      check_questionHindi = `गीता 1.4 में दुर्योधन पाण्डव सेना के किन महारथियों को भीम और अर्जुन के समान बलवान योद्धा बताता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Yuyudhana (Satyaki), Virata, and the great chariot warrior Drupada.',
          textHindi: 'युयुधान (सात्यकि), विराट और महारथी द्रुपद।'
        },
        {
          id: 'opt-2',
          text: 'Karna, Ashwatthama, and Kripacharya.',
          textHindi: 'कर्ण, अश्वत्थामा और कृपाचार्य।'
        },
        {
          id: 'opt-3',
          text: 'Jayadratha, Vikarna, and Somadatta.',
          textHindi: 'जयद्रथ, विकर्ण और सोमदत्त।'
        },
        {
          id: 'opt-4',
          text: 'Shakuni, Dushasana, and Shalya.',
          textHindi: 'शकुनि, दुःशासन और शल्य।'
        }
      ];

      check_feedback = `Correct. Shloka 1.4 explicitly specifies: "atra śūrā maheṣv-āsā bhīmārjuna-samā yudhi, yuyudhāno virāṭaś ca drupadaś ca mahā-rathaḥ".`;
      check_feedbackHindi = `सही उत्तर। श्लोक 1.4 में स्पष्ट कहा गया है: "अत्र शूरा महेष्वासा भीमार्जुनसमा युधि। युयुधानो विराटश्च द्रुपदश्च महारथः॥"`;
    } else if (v >= 2 && v <= 11) {
      sectionA_text = `Duryodhana observes the well-arrayed Pandava army led by Dhrishtadyumna, approaches his preceptor Dronacharya, and enumerates the formidable heroes on both sides.`;
      sectionA_textHindi = `दुर्योधन धृष्टद्युम्न द्वारा व्यूहरचना युक्त पाण्डव सेना को देखकर अपने आचार्य द्रोणाचार्य के पास जाता है और दोनों पक्षों के प्रमुख योद्धाओं का वर्णन करता है।`;

      sectionA_context = `Speaker: Sanjaya quoting Duryodhana. Setting: The front line of Kurukshetra as armies stand mobilized.`;
      sectionA_contextHindi = `वक्ता: संजय (दुर्योधन के वचनों को दोहराते हुए) । स्थान: कुरुक्षेत्र का रणक्षेत्र जहाँ दोनों सेनाएँ युद्ध के लिए सन्नद्ध खड़ी हैं।`;

      sectionB_explanation = `This passage is narrative exposition. Duryodhana's speech to his teacher Drona serves two psychological functions: he flatters his preceptor while subtly questioning Drona's vigilance in training Dhrishtadyumna. External arrogance and rapid cataloging of strength often disguise deep internal anxiety.`;
      sectionB_explanationHindi = `यह प्रसंग ऐतिहासिक कथा है। दुर्योधन का द्रोणाचार्य से संवाद दोहरी मानसिकता प्रकट करता है: वह आचार्य की प्रशंसा भी करता है और धृष्टद्युम्न को सिखाने पर व्यंग्य भी। बाहरी गर्व और सेना की बारंबार गिनती अक्सर आंतरिक भय और असुरक्षा को छिपाने का प्रयास होती है।`;

      sectionC_title = `Recognizing Insecurity Behind False Bravado`;
      sectionC_titleHindi = `दिखावटी अहंकार के पीछे छिपी असुरक्षा की पहचान`;

      sectionC_scenario = `A candidate entering a competitive exam or job interview begins aggressively boasting about their qualifications or obsessively scrutinizing competing applicants to calm their racing heart.`;
      sectionC_scenarioHindi = `प्रतियोगी परीक्षा या साक्षात्कार में प्रवेश करते समय कोई व्यक्ति अपनी घबराहट छिपाने के लिए अनावश्यक शेखी बघारने लगता है या प्रतिद्वंद्वियों की कमियाँ खोजने लगता है।`;

      sectionC_connection = `Duryodhana's reaction shows that obsessing over competitors and projecting outward bravado is often a symptom of unaddressed fear, which prevents calm, clear strategic thinking.`;
      sectionC_connectionHindi = `दुर्योधन का आचरण सिद्ध करता है कि प्रतिद्वंदियों पर अत्यधिक ध्यान देना और बनावटी आत्मविश्वास दिखाना मन के अनसुलझे भय का लक्षण है, जो विवेकपूर्ण निर्णय में बाधा डालता है।`;

      sectionD_takeaway = `Projecting false confidence and obsessing over external rivals distracts from cultivating genuine inner composure.`;
      sectionD_takeawayHindi = `दिखावटी आत्मविश्वास और दूसरों से तुलना मन को भटकाती है; सच्ची शक्ति अंतःकरण की स्थिरता में है।`;

      check_question = `In verses 1.2–1.11, what psychological state is reflected in Duryodhana's approach to Dronacharya?`;
      check_questionHindi = `श्लोक 1.2–1.11 में द्रोणाचार्य के पास जाकर बात करने में दुर्योधन की कौन सी मानसिक दशा प्रकट होती है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Inner insecurity and anxiety masked by assertive cataloging of warriors and flattery of his teacher.',
          textHindi: 'योद्धाओं की गिनती और आचार्य की चापलूसी के पीछे छिपा आंतरिक भय और गहरा संकोच।'
        },
        {
          id: 'opt-2',
          text: 'A profound realization of the spiritual futility of warfare.',
          textHindi: 'युद्ध की व्यर्थता का गहरा आध्यात्मिक साक्षात्कार।'
        },
        {
          id: 'opt-3',
          text: 'Unshakable devotion and selfless humility towards Dronacharya’s spiritual wisdom.',
          textHindi: 'द्रोणाचार्य के प्रति निष्काम भक्ति और पूर्ण आध्यात्मिक समर्पण।'
        },
        {
          id: 'opt-4',
          text: 'Desire to forfeit the throne and retreat to the forest as an ascetic.',
          textHindi: 'राजसिंहासन छोड़कर वन में संन्यासी बनने का वैराग्य भाव।'
        }
      ];

      check_feedback = `Correct. Duryodhana’s overt display of confidence to Drona masks his apprehension regarding the Pandava forces and their commanders.`;
      check_feedbackHindi = `सही उत्तर। द्रोणाचार्य के सम्मुख दुर्योधन का यह प्रदर्शन पाण्डव सेना के प्रति उसकी आंतरिक घबराहट और भय को ही दर्शाता है।`;
    } else if (v >= 12 && v <= 19) {
      sectionA_text = `Bhishma blows his conch with a roar like a lion to cheer Duryodhana, followed by the sounding of horns, drums, and cymbals. In response, Lord Krishna and Arjuna blow their divine conches, shaking heaven and earth.`;
      sectionA_textHindi = `दुर्योधन का उत्साह बढ़ाने के लिए पितामह भीष्म ने सिंहनाद करते हुए शंख फूँका, जिसके बाद शंखों, नगाड़ों और रणभेरी का तुमुल नाद हुआ। इसके उत्तर में भगवान श्री कृष्ण और अर्जुन ने अपने दिव्य शंख बजाए, जिसने आकाश और पृथ्वी को गुँजा दिया।`;

      sectionA_context = `Speaker: Sanjaya describing the battlefield crescendo. Setting: The sounding of the battle conches across the armies.`;
      sectionA_contextHindi = `वक्ता: संजय (युद्धभूमि के रोमांचक वातावरण का वर्णन करते हुए)। स्थान: कुरुक्षेत्र के मैदान में दोनों सेनाओं का शंखनाद।`;

      sectionB_explanation = `The blowing of conches symbolizes the decisive psychological threshold where vacillation ceases and full commitment to the struggle is made. Krishna's blowing of Panchajanya signals the spiritual authority of Dharma that will guide the chariot of righteousness.`;
      sectionB_explanationHindi = `शंखनाद उस निर्णायक क्षण का प्रतीक है जहाँ हिचकिचाहट समाप्त होती है और संघर्ष के प्रति पूर्ण संकल्प लिया जाता है। भगवान श्री कृष्ण द्वारा 'पाञ्चजन्य' शंख का वादन धर्म की उस सर्वोच्च सत्ता की घोषणा करता है जो न्याय के रथ का संचालन करेगी।`;

      sectionC_title = `The Power of Resolute Commitment`;
      sectionC_titleHindi = `दृढ़ संकल्प और तत्परता की शक्ति`;

      sectionC_scenario = `A student preparing for a national exam spends weeks agonizing in self-doubt until they finally set a firm daily schedule, commit fully to their preparation, and sit down to work.`;
      sectionC_scenarioHindi = `कठिन परीक्षा की तैयारी करने वाला विद्यार्थी हफ्तों तक असमंजस में रहता है, फिर एक दिन पक्का समय-सारणी बनाकर पूरे मन से अध्ययन में जुट जाता है।`;

      sectionC_connection = `Just as the sounding of conches cut through hesitation and signaled the beginning of the engagement, an unequivocal internal commitment is needed to overcome procrastination and doubt.`;
      sectionC_connectionHindi = `जैसे शंखनाद ने सारी दुविधाओं को चीरकर युद्ध का स्पष्ट आह्वान किया, वैसे ही किसी बड़े लक्ष्य के लिए भीतर का दृढ़ संकल्प टालमटोल और संशय को समाप्त करता है।`;

      sectionD_takeaway = `Resolute commitment cuts through paralysis, marking the vital shift from hesitation to purposeful action.`;
      sectionD_takeawayHindi = `दृढ़ निश्चय संशय और हिचकिचाहट को समाप्त कर कर्म की दिशा में सशक्त कदम बढ़ाता है।`;

      check_question = `What is the significance of the divine conches sounding in verses 1.12–1.19?`;
      check_questionHindi = `श्लोक 1.12–1.19 में दिव्य शंखों के तुमुल नाद का मुख्य संदेश क्या है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'They signal the definitive transition from passive hesitation to resolute readiness and engagement.',
          textHindi: 'दुविधा और संकोच को समाप्त कर पूर्ण तत्परता और कर्म के प्रति अटूट संकल्प का संकेत।'
        },
        {
          id: 'opt-2',
          text: 'They announce a momentary ceasefire so both sides could negotiate.',
          textHindi: 'दोनों पक्षों के बीच बातचीत के लिए अल्पकालिक युद्धविराम की घोषणा।'
        },
        {
          id: 'opt-3',
          text: 'They represent the withdrawal of the Pandavas due to moral fear.',
          textHindi: 'नैतिक भय के कारण पाण्डवों द्वारा मैदान छोड़ देने की घोषणा।'
        },
        {
          id: 'opt-4',
          text: 'They were blown accidentally by nervous soldiers on the front line.',
          textHindi: 'सैनिकों द्वारा घबराहट में गलती से शंख बजा दिया जाना।'
        }
      ];

      check_feedback = `Correct. The sounding of the conches marked the point of no return, establishing the psychological readiness of both forces.`;
      check_feedbackHindi = `सही उत्तर। शंखनाद उस स्थिति का द्योतक है जहाँ से पीछे हटने का मार्ग बंद होकर कर्तव्य-पालन की तत्परता आरंभ होती है।`;
    } else if (v >= 20 && v <= 27) {
      sectionA_text = `Arjuna, looking upon the Kaurava army ready to discharge their arrows, raises his bow and asks Krishna to position his chariot between the two armies so he may behold those gathered for war.`;
      sectionA_textHindi = `शस्त्र चलने की तैयारी देखकर अर्जुन ने धनुष उठाया और भगवान श्री कृष्ण से प्रार्थना की कि मेरे रथ को दोनों सेनाओं के बीच में खड़ा कीजिए ताकि मैं युद्ध के अभिलाषी वीरों को देख सकूँ।`;

      sectionA_context = `Speaker: Arjuna addressing Krishna. Setting: The neutral space between the two opposing forces at Kurukshetra.`;
      sectionA_contextHindi = `वक्ता: अर्जुन (श्री कृष्ण से निवेदन करते हुए)। स्थान: कुरुक्षेत्र के दोनों विरोधी सैन्य दलों के मध्य का निष्पक्ष स्थल।`;

      sectionB_explanation = `Placing the chariot in the center ("senayor ubhayor madhye") allows Arjuna to confront the reality of the situation without illusions. Seeing uncles, grandfathers, teachers, and companions brings him face to face with the human cost of his duty.`;
      sectionB_explanationHindi = `रथ को दोनों सेनाओं के बीच ("सेनयोरुभयोर्मध्ये") स्थापित करना अर्जुन को बिना किसी भ्रम के यथार्थ का सामना कराता है। ताऊ, चाचा, पितामह, गुरु और मित्रों को सामने देखकर वे अपने कर्तव्य के मानवीय मूल्य से रूबरू होते हैं।`;

      sectionC_title = `Taking an Objective View Before Big Decisions`;
      sectionC_titleHindi = `महत्वपूर्ण निर्णय से पूर्व निष्पक्ष दृष्टि अपनाना`;

      sectionC_scenario = `An executive or family mediator pauses before a contentious meeting to step back and survey all stakeholder perspectives rather than blindly taking a partisan stance.`;
      sectionC_scenarioHindi = `विवादित बैठक से पहले कोई अधिकारी या मध्यस्थ किसी का पक्ष लिए बिना दोनों पक्षों के दृष्टिकोण और परिणामों को शांति से परखता है।`;

      sectionC_connection = `Positioning oneself in the center between opposing sides provides the clarity needed to evaluate consequences objectively before taking irreversible actions.`;
      sectionC_connectionHindi = `दोनों पक्षों के मध्य खड़े होकर स्थिति का अवलोकन करना विवेकपूर्ण निर्णय और परिणामों के निष्पक्ष मूल्यांकन के लिए अनिवार्य है।`;

      sectionD_takeaway = `Clear discernment requires standing back and surveying reality honestly before acting on impulse.`;
      sectionD_takeawayHindi = `आवेग में निर्णय लेने से पहले निष्पक्ष रहकर पूरी स्थिति और परिणामों का अवलोकन करना ही विवेक है।`;

      check_question = `Why does Arjuna request Lord Krishna to place his chariot between both armies?`;
      check_questionHindi = `अर्जुन भगवान श्री कृष्ण से रथ को दोनों सेनाओं के बीच खड़ा करने की प्रार्थना क्यों करते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'To observe directly and objectively all who have gathered to fight before the battle begins.',
          textHindi: 'युद्ध आरंभ होने से पहले युद्ध की इच्छा से एकत्र हुए सभी पक्षों का प्रत्यक्ष व निष्पक्ष अवलोकन करने के लिए।'
        },
        {
          id: 'opt-2',
          text: 'To escape from the battlefield unnoticed by Duryodhana’s scouts.',
          textHindi: 'दुर्योधन के गुप्तचरों की दृष्टि से बचकर रणक्षेत्र से पलायन करने के लिए।'
        },
        {
          id: 'opt-3',
          text: 'To surrender his weapons in full view of the opposing generals.',
          textHindi: 'शत्रु सेनापतियों के सामने अपने शस्त्र डालकर आत्मसमर्पण करने के लिए।'
        },
        {
          id: 'opt-4',
          text: 'To challenge Bhishma to a private single combat.',
          textHindi: 'पितामह भीष्म को एकांत में द्वंद्वयुद्ध के लिए ललकारने के लिए।'
        }
      ];

      check_feedback = `Correct. Arjuna deliberately requested the vantage point in the middle to survey all participants and understand the true scope of the battle.`;
      check_feedbackHindi = `सही उत्तर। अर्जुन ने दोनों सेनाओं के मध्य से संपूर्ण परिदृश्य और युद्ध के वास्तविक प्रभाव को समझने के लिए यह प्रार्थना की थी।`;
    } else {
      // 1.28 - 1.47
      sectionA_text = `Overwhelmed by intense grief and compassionate attachment upon seeing his kinsmen, Arjuna's limbs tremble, his mouth dries up, his bow Gandiva slips from his hand, and he declares he will not fight.`;
      sectionA_textHindi = `स्वजनों को सम्मुख देखकर तीव्र करुणा और मोह से व्याकुल अर्जुन के अंग शिथिल हो गए, मुख सूख गया, हाथ से गाण्डीव धनुष गिर पड़ा और वे शोकग्रस्त होकर रथ में बैठ गए।`;

      sectionA_context = `Speaker: Arjuna expressing his despondency (Vishada). Setting: Slumped in his chariot on the battlefield of Kurukshetra.`;
      sectionA_contextHindi = `वक्ता: अर्जुन (विषाद और शोक व्यक्त करते हुए)। स्थान: कुरुक्षेत्र के रणक्षेत्र में अपने रथ के पिछले भाग में बैठे हुए।`;

      sectionB_explanation = `Arjuna's collapse is not physical cowardice; it is emotional and ethical overwhelm. His grief stems from attachment to family identities over spiritual duty. Traditional commentators explain that this crisis (Vishada) is essential, as it strips away superficial pride and prepares Arjuna to seek true wisdom from Krishna.`;
      sectionB_explanationHindi = `अर्जुन का यह विषाद कायरता नहीं है, अपितु मोह और कर्तव्य के बीच का तीव्र नैतिक संघर्ष है। उनका शोक कुल और संबंधियों के प्रति आसक्ति से उत्पन्न हुआ है। टीकाकार बताते हैं कि यह 'विषाद' आत्म-अहंकार को तोड़कर श्री कृष्ण से दिव्य ज्ञान प्राप्त करने की पूर्वपीठिका बनता है।`;

      sectionC_title = `Navigating Moral Crisis and Emotional Burnout`;
      sectionC_titleHindi = `नैतिक संकट और मानसिक द्वंद्व का सामना`;

      sectionC_scenario = `A doctor, student, or professional experiences sudden emotional exhaustion and moral panic when personal values clash painfully with institutional responsibilities.`;
      sectionC_scenarioHindi = `कोई चिकित्सक या अधिकारी जब व्यक्तिगत भावनाओं और अपने दायित्वों के बीच भयानक अंतर्द्वंद्व में फँसकर किंकर्तव्यविमूढ़ हो जाता है।`;

      sectionC_connection = `Arjuna’s breakdown demonstrates that experiencing overwhelming doubt is a human reality; acknowledging that our own intellect has reached its limit is the necessary first step toward seeking deeper guidance.`;
      sectionC_connectionHindi = `अर्जुन की यह स्थिति दर्शाती है कि जीवन में गहरा संशय आना स्वाभाविक है; अपनी सीमाओं को स्वीकार कर योग्य गुरु या मार्गदर्शन की शरण लेना ही समाधान का प्रथम चरण है।`;

      sectionD_takeaway = `Acknowledging our limitations and moral confusion is the necessary prerequisite for receiving higher wisdom.`;
      sectionD_takeawayHindi = `अपनी सीमाओं और मानसिक संशय को स्वीकार करना ही उच्चतर ज्ञान और विवेक प्राप्त करने की पहली सीढ़ी है।`;

      check_question = `According to the traditional commentary on Arjuna’s despondency (Vishada Yoga), why is Arjuna’s grief significant?`;
      check_questionHindi = `अर्जुन विषादयोग की परंपरा के अनुसार अर्जुन का यह शोक क्यों महत्वपूर्ण माना गया है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'It shatters his self-reliance and intellectual pride, preparing his mind to receive divine wisdom as a humble disciple.',
          textHindi: 'यह उनके अहंकार और बौद्धिक दर्प को तोड़कर उन्हें एक विनम्र शिष्य के रूप में दिव्य ज्ञान ग्रहण करने योग्य बनाता है।'
        },
        {
          id: 'opt-2',
          text: 'It proves that Arjuna was an incompetent archer who lacked military training.',
          textHindi: 'यह सिद्ध करता है कि अर्जुन सैन्य प्रशिक्षण से विहीन एक अकुशल धनुर्धर थे।'
        },
        {
          id: 'opt-3',
          text: 'It shows that righteous people should abandon all action and duty whenever emotions become uncomfortable.',
          textHindi: 'यह सिखाता है कि भावुकता आने पर सज्जन पुरुषों को अपने सभी कर्तव्य त्याग देने चाहिए।'
        },
        {
          id: 'opt-4',
          text: 'It was a deliberate theatrical performance intended to deceive the Kaurava army.',
          textHindi: 'कौरव सेना को भ्रमित करने के लिए यह अर्जुन का पूर्व-नियोजित नाटक था।'
        }
      ];

      check_feedback = `Correct. Arjuna’s crisis of conscience (Vishada) stripped away his ego and made him receptive to Krishna’s philosophical teachings.`;
      check_feedbackHindi = `सही उत्तर। अर्जुन के इस आंतरिक विषाद ने ही उन्हें शिष्यभाव में लाकर गीता के अमर उपदेश का सुपात्र बनाया।`;
    }
  } else if (ch === 2) {
    if (v >= 1 && v <= 10) {
      sectionA_text = `Krishna urges Arjuna to discard debilitating weakness of heart (klaibyam). Arjuna admits his mind is confused about duty (dharma-sammūḍha-chetāḥ) and surrenders to Krishna as a disciple, begging for guidance.`;
      sectionA_textHindi = `श्री कृष्ण अर्जुन को हृदय की इस तुच्छ दुर्बलता (क्लैब्य) को त्यागने की प्रेरणा देते हैं। अर्जुन स्वीकार करते हैं कि मेरी बुद्धि कर्तव्य के विषय में मोहित (धर्मसंमूढ़चेताः) हो गई है और वे शिष्य भाव से श्री कृष्ण की शरण ग्रहण करते हैं।`;

      sectionA_context = `Speaker: Dialogue between Krishna and Arjuna. Setting: Opening of Sankhya Yoga, the pivotal turning point from friendship to disciple-master relationship.`;
      sectionA_contextHindi = `वक्ता: श्री कृष्ण और अर्जुन का संवाद। स्थान: सांख्य योग का प्रारंभ—सखा भाव से गुरु-शिष्य संबंध में रूपांतरण का निर्णायक मोड़।`;

      sectionB_explanation = `Verse 2.7 marks the spiritual birth of the Gita: "śhiṣhyas te ’haṁ śhādhi māṁ tvāṁ prapannam" (I am your disciple; teach me, who has taken refuge in you). Self-reliant intellectualizing has failed Arjuna; only complete surrender to a wise mentor can illuminate the path of duty.`;
      sectionB_explanationHindi = `श्लोक 2.7 गीता का प्राण है: "शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्" (मैं आपका शिष्य हूँ, आपकी शरण में हूँ, मुझे शिक्षा दीजिए)। अर्जुन का तर्क समाप्त हो चुका है; अब केवल सद्गुरु के प्रति पूर्ण समर्पण ही सत्य का मार्ग दिखा सकता है।`;

      sectionC_title = `The Courage to Seek Mentorship`;
      sectionC_titleHindi = `सच्चे मार्गदर्शन और गुरु की शरण लेने का साहस`;

      sectionC_scenario = `A student struggling with severe academic anxiety or career confusion stops pretending everything is under control and approaches a trusted mentor, asking honestly for direction.`;
      sectionC_scenarioHindi = `भविष्य की चिंता में उलझा युवा सब कुछ ठीक होने का ढोंग छोड़ किसी अनुभवी मार्गदर्शक के पास जाकर ईमानदारी से दिशा-निर्देश माँगता है।`;

      sectionC_connection = `Arjuna’s turning point demonstrates that genuine strength begins with the humility to admit confusion and actively seek wise guidance.`;
      sectionC_connectionHindi = `अर्जुन का यह समर्पण सिखाता है कि अपनी दुविधा को स्वीकार करना और योग्य गुरु से सहायता माँगना कमजोरी नहीं, अपितु वास्तविक आत्मबल है।`;

      sectionD_takeaway = `True wisdom begins when we trade defensive ego for the humility of a sincere seeker.`;
      sectionD_takeawayHindi = `सच्चे ज्ञान का उदय तभी होता है जब हम अहंकारी तर्क छोड़कर एक जिज्ञासु शिष्य की तरह विनम्र बनते हैं।`;

      check_question = `In Gita 2.7, what fundamental shift takes place in Arjuna’s attitude toward Krishna?`;
      check_questionHindi = `गीता 2.7 में श्री कृष्ण के प्रति अर्जुन के दृष्टिकोण में क्या मूलभूत परिवर्तन आता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'He ceases arguing as an equal friend and surrenders completely as a disciple seeking guidance on duty.',
          textHindi: 'समान सखा के रूप में तर्क करना बंद कर वे शिष्य भाव से कर्तव्य का मार्ग जानने हेतु पूर्ण शरणागति स्वीकार करते हैं।'
        },
        {
          id: 'opt-2',
          text: 'He demands that Krishna take up arms and fight the battle on his behalf.',
          textHindi: 'वे श्री कृष्ण से मांग करते हैं कि वे स्वयं शस्त्र उठाकर उनके बदले युद्ध लड़ें।'
        },
        {
          id: 'opt-3',
          text: 'He rejects Krishna’s counsel and decides to leave the kingdom permanently.',
          textHindi: 'वे श्री कृष्ण की सलाह को नकार कर हमेशा के लिए राज्य छोड़कर संन्यास ले लेते हैं।'
        },
        {
          id: 'opt-4',
          text: 'He challenges Krishna to prove his divine authority through miracles.',
          textHindi: 'वे श्री कृष्ण से चमत्कार दिखाकर अपने ईश्वरत्व को प्रमाणित करने की चुनौती देते हैं।'
        }
      ];

      check_feedback = `Correct. In 2.7, Arjuna explicitly states "I am your disciple, teach me who has surrendered unto you," establishing the teacher-disciple relationship.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 2.7 में "शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्" कहकर अर्जुन गुरु-शिष्य की पावन परंपरा स्थापित करते हैं।`;
    } else if (v >= 11 && v <= 30) {
      sectionA_text = `Krishna reveals the eternal nature of the Self (Atman): weapons cannot cut it, fire cannot burn it, water cannot wet it, and wind cannot dry it. Just as a person casts off worn-out garments, the soul casts off worn-out bodies.`;
      sectionA_textHindi = `श्री कृष्ण अविनाशी आत्म-तत्व का रहस्य प्रकट करते हैं: आत्मा को शस्त्र काट नहीं सकते, अग्नि जला नहीं सकती, जल गला नहीं सकता और वायु सुखा नहीं सकती। जैसे मनुष्य पुराने वस्त्रों को त्यागकर नए वस्त्र धारण करता है, वैसे ही आत्मा पुराने शरीरों को छोड़कर नया शरीर धारण करती है।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: The metaphysical foundation of Sankhya philosophy in response to Arjuna's fear of death and loss.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: सांख्य दर्शन का तत्व-ज्ञान, जो अर्जुन के मृत्यु और विनाश के भय का निवारण करता है।`;

      sectionB_explanation = `Krishna distinguishes the perishable physical vehicle (Sharira) from the immortal, unchanging consciousness (Sharirin / Atman). Grief arises from confusing temporary bodily conditions with the immortal core of being. Knowing the Self as imperishable dispels the existential fear of loss.`;
      sectionB_explanationHindi = `श्री कृष्ण नश्वर शरीर और नित्य, अपरिवर्तनीय आत्मा (चेतन तत्व) का भेद स्पष्ट करते हैं। सारा शोक नश्वर देह को ही सब कुछ मान लेने के अज्ञान से होता है। आत्मा को अजन्मा और अमर जानकर मृत्यु का भय सदा के लिए समाप्त हो जाता है।`;

      sectionC_title = `Resilience Through Core Identity`;
      sectionC_titleHindi = `आंतरिक चेतना की अमरता से अटूट आत्मबल`;

      sectionC_scenario = `An individual going through a severe career setback, material loss, or health challenge remembers that their fundamental human dignity and consciousness are not defined by temporary external circumstances.`;
      sectionC_scenarioHindi = `व्यापार में हानि, असफलता या शारीरिक अस्वस्थता के दौर में व्यक्ति स्मरण रखता है कि उसकी चेतना और आत्म-सम्मान बाहरी परिस्थितियों से कहीं परे और अविनाशी हैं।`;

      sectionC_connection = `Understanding the permanence of inner consciousness helps us remain resilient through life's inevitable external changes, failures, and transitions.`;
      sectionC_connectionHindi = `आत्म-तत्व की स्थिरता का बोध जीवन के बाहरी परिवर्तनों, लाभ-हानि और उतार-चढ़ाव में हमें अडिग और शांत बनाए रखता है।`;

      sectionD_takeaway = `Your true identity is eternal consciousness, fundamentally untouched by external gains, losses, or physical changes.`;
      sectionD_takeawayHindi = `आपका वास्तविक स्वरूप नित्य, अविनाशी चेतन आत्मा है, जिस पर बाहरी लाभ-हानि या शारीरिक परिवर्तनों का कोई प्रभाव नहीं पड़ता।`;

      check_question = `What core philosophical truth does Krishna teach regarding the Self (Atman) in Gita 2.20–2.23?`;
      check_questionHindi = `गीता 2.20–2.23 में भगवान श्री कृष्ण आत्मा (आत्मन्) के विषय में कौन सा शाश्वत सत्य प्रकट करते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'The Self is eternal, indestructible, and unchangeable, never slain when the physical body dies.',
          textHindi: 'आत्मा अजन्मा, नित्य, शाश्वत और अविनाशी है, शरीर के नष्ट होने पर भी इसका कभी नाश नहीं होता।'
        },
        {
          id: 'opt-2',
          text: 'The Self is created at physical birth and permanently destroyed at physical death.',
          textHindi: 'आत्मा का जन्म शरीर के साथ होता है और देहांत के साथ इसका सर्वथा नाश हो जाता है।'
        },
        {
          id: 'opt-3',
          text: 'The Self is identical with the physical senses and emotions.',
          textHindi: 'आत्मा केवल शारीरिक इंद्रियों और क्षणिक भावनाओं का ही दूसरा नाम है।'
        },
        {
          id: 'opt-4',
          text: 'The Self is subject to disease, fire, weapons, and decay over time.',
          textHindi: 'आत्मा भी समय के साथ रोग, शस्त्र, अग्नि और क्षय के प्रभाव में आती है।'
        }
      ];

      check_feedback = `Correct. Krishna declares that the Atman is unborn, eternal, ever-existing, and indestructible.`;
      check_feedbackHindi = `सही उत्तर। श्री कृष्ण उद्घोष करते हैं कि "न जायते म्रियते वा कदाचिन्... न हन्यते हन्यमाने शरीरे"—आत्मा न कभी जन्मती है और न कभी मरती है।`;
    } else if (v >= 31 && v <= 38) {
      sectionA_text = `Krishna reminds Arjuna of his constitutional duty (Svadharma) as a warrior. To abandon a righteous struggle brings disgrace worse than death, whereas discharging duty with an even mind brings freedom from sin.`;
      sectionA_textHindi = `श्री कृष्ण अर्जुन को क्षत्रिय के स्वाभाविक स्वधर्म का स्मरण कराते हैं। धर्मयुद्ध से विमुख होना मृत्यु से भी अधिक अपकीर्ति लाने वाला है, जबकि समभाव से अपने कर्तव्य का पालन करने से कोई पाप नहीं लगता।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Pragmatic and ethical perspective of Svadharma within human society.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: मानव समाज में स्वधर्म और नैतिक कर्तव्य का व्यावहारिक व आध्यात्मिक विवेचन।`;

      sectionB_explanation = `Svadharma refers to the unique responsibilities born of one's role, talents, and societal position. Retreating out of personal fear or emotional comfort degrades character. Fulfilling one's duty without egoism elevates the mind.`;
      sectionB_explanationHindi = `स्वधर्म का अर्थ है व्यक्ति के स्वभाव, योग्यता और सामाजिक दायित्व के अनुसार उसका कर्तव्य। व्यक्तिगत भय या सुविधा के लिए कर्तव्य से भागना आत्मपतन है, जबकि निष्काम भाव से स्वधर्म का निर्वाह चित्त को शुद्ध करता है।`;

      sectionC_title = `Honoring Your Ethical Responsibilities`;
      sectionC_titleHindi = `अपने नैतिक दायित्वों और स्वधर्म का सम्मान`;

      sectionC_scenario = `A software engineer or public servant faces social criticism for reporting a safety violation, yet stays committed to their professional oath of public safety.`;
      sectionC_scenarioHindi = `कोई इंजीनियर या लोकसेवक आलोचना के भय के बावजूद जनहित और सत्य की रक्षा हेतु अपनी व्यावसायिक शपथ और कर्तव्य पर अडिग रहता है।`;

      sectionC_connection = `Doing one's duty in the face of temporary discomfort or public criticism protects personal integrity and upholds societal trust.`;
      sectionC_connectionHindi = `तात्कालिक असुविधा या निंदा के भय से विचलित न होकर अपने धर्म पर डटे रहना ही चरित्र की वास्तविक कसौटी है।`;

      sectionD_takeaway = `Fulfilling your legitimate duties with integrity protects your character, while abandoning responsibility damages the fabric of society.`;
      sectionD_takeawayHindi = `निष्ठापूर्वक स्वधर्म का पालन आत्म-सम्मान की रक्षा करता है, जबकि कर्तव्य से पलायन समाज और स्वयं दोनों का अहित करता है।`;

      check_question = `What does Krishna emphasize regarding Svadharma (one’s own duty) in Gita 2.31–2.38?`;
      check_questionHindi = `गीता 2.31–2.38 में श्री कृष्ण स्वधर्म के संबंध में किस बात पर बल देते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Fulfilling one’s ethical duty with an even mind is honorable, while retreating out of fear brings dishonor and moral harm.',
          textHindi: 'समभाव से अपने धर्म का पालन करना कल्याणकारी है, जबकि भयवश कर्तव्य से भागना अपकीर्ति और पतन का कारण है।'
        },
        {
          id: 'opt-2',
          text: 'Duty should only be performed when accompanied by guaranteed financial rewards.',
          textHindi: 'कर्तव्य केवल तभी निभाना चाहिए जब उसमें निश्चित धनलाभ की गारंटी हो।'
        },
        {
          id: 'opt-3',
          text: 'One should abandon their societal role whenever relatives disagree with their decisions.',
          textHindi: 'परिवार वालों की असहमति होते ही सामाजिक दायित्वों का त्याग कर देना चाहिए।'
        },
        {
          id: 'opt-4',
          text: 'Duty is an illusion that has no place in spiritual life.',
          textHindi: 'कर्तव्य एक भ्रम है और आध्यात्मिक जीवन में इसका कोई महत्व नहीं है।'
        }
      ];

      check_feedback = `Correct. Krishna instructs that for a warrior, there is no greater fortune than a righteous battle, and abandoning duty incurs dishonor.`;
      check_feedbackHindi = `सही उत्तर। श्री कृष्ण अर्जुन को समझाते हैं कि क्षत्रिय के लिए धर्मयुद्ध से बढ़कर कोई श्रेयस्कर मार्ग नहीं है।`;
    } else if (v >= 39 && v <= 53) {
      if (v === 47) {
        sectionA_text = `Krishna states: "You have a right only to perform your duty, but never to its fruits; let not the fruits of action be your motive, nor let your attachment be to inaction."`;
        sectionA_textHindi = `श्री कृष्ण कहते हैं: "कर्म करने में ही तुम्हारा अधिकार है, उसके फलों में कभी नहीं; इसलिए तुम कर्मफल के हेतु मत बनो और न ही तुम्हारी अकर्मण्यता (कर्म न करने) में आसक्ति हो।"`;

        sectionA_context = `Speaker: Lord Krishna. Setting: The supreme foundation of Karma Yoga (the path of selfless, focused action).`;
        sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: निष्काम कर्मयोग का परम आधारभूत सिद्धांत।`;

        sectionB_explanation = `This celebrated shloka contains four core principles: (1) You have agency over your actions, (2) You do not control the outcomes, which depend on countless cosmic variables, (3) Do not act merely for personal reward, and (4) Never retreat into lazy inaction. This is the antidote to performance anxiety.`;
        sectionB_explanationHindi = `यह प्रसिद्ध श्लोक चार स्तंभों पर आधारित है: (1) कर्म करने में तुम्हारी स्वतंत्रता है, (2) फल तुम्हारे अकेले के वश में नहीं है, वह अनेक वैश्विक कारणों पर निर्भर है, (3) फल की कामना से प्रेरित होकर कर्म मत करो, और (4) कर्म से विमुख होकर आलस्य में मत पड़ो। यह मानसिक तनाव और चिंता की अचूक औषधि है।`;

        sectionC_title = `Focusing on Preparation Over Performance Anxiety`;
        sectionC_titleHindi = `परिणाम की चिंता छोड़ वर्तमान कर्म पर पूर्ण एकाग्रता`;

        sectionC_scenario = `A student studying for a critical entrance exam feels paralyzed by constant worry about the rank list, scores, and college admissions.`;
        sectionC_scenarioHindi = `प्रतियोगी परीक्षा की तैयारी कर रहा विद्यार्थी मेरिट सूची और कॉलेज मिलने की चिंता में अपनी वर्तमान पढ़ाई पर ध्यान नहीं दे पा रहा है।`;

        sectionC_connection = `By applying 2.47, the student channels 100% of their energy into today's practice problems (action under their control) rather than dissipating energy in anxious speculation about tomorrow's test results (outside direct control).`;
        sectionC_connectionHindi = `श्लोक 2.47 को अपनाकर वह कल के अनिश्चित परीक्षा-परिणाम की चिंता छोड़कर अपनी पूरी ऊर्जा आज के प्रश्नों के अभ्यास (जो उसके नियंत्रण में है) में लगाता है।`;

        sectionD_takeaway = `Invest your full energy into the excellence of your effort, and free your mind from the paralyzing anxiety of outcomes.`;
        sectionD_takeawayHindi = `अपनी पूरी शक्ति कर्म की उत्कृष्टता में लगाइए और परिणाम की चिंता से मन को मुक्त कर दीजिए।`;

        check_question = `In the famous shloka 2.47 (Karmaṇy-evādhikāras te mā phaleṣhu kadāchana), what does Krishna teach regarding action and outcomes?`;
        check_questionHindi = `प्रसिद्ध श्लोक 2.47 ("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन") में श्री कृष्ण कर्म और फल के विषय में क्या उपदेश देते हैं?`;

        check_options = [
          {
            id: 'opt-1',
            text: 'We have jurisdiction over our actions and effort, but never over the results, so we must act without anxiety over outcomes.',
            textHindi: 'हमारा अधिकार केवल अपने कर्म और पुरुषार्थ पर है, फल पर नहीं; अतः परिणाम की चिंता छोड़कर निष्काम कर्म करना चाहिए।'
          },
          {
            id: 'opt-2',
            text: 'We should stop working entirely because results are predetermined.',
            textHindi: 'हमें कर्म करना पूरी तरह बंद कर देना चाहिए क्योंकि परिणाम पहले से तय हैं।'
          },
          {
            id: 'opt-3',
            text: 'We should only perform actions that guarantee immediate personal praise and wealth.',
            textHindi: 'केवल वही कर्म करने चाहिए जिनमें तत्काल धन और प्रशंसा की गारंटी हो।'
          },
          {
            id: 'opt-4',
            text: 'We have full control over the universe and can force outcomes through willpower alone.',
            textHindi: 'संसार पर हमारा पूरा नियंत्रण है और हम हठपूर्वक मनचाहा परिणाम पा सकते हैं।'
          }
        ];

        check_feedback = `Correct. Shloka 2.47 teaches that our right is to work diligently, but the fruits are not under our unilateral control.`;
        check_feedbackHindi = `सही उत्तर। श्लोक 2.47 सिखाता है कि कर्त्तव्य का निष्ठापूर्वक पालन ही हमारे अधिकार क्षेत्र में है, परिणाम नहीं।`;
      } else {
        sectionA_text = `Krishna instructs Arjuna to perform actions established in yoga (equanimity), abandoning attachment, and remaining even-minded in success and failure. Equanimity of mind is yoga (Samatvam yoga uchyate).`;
        sectionA_textHindi = `श्री कृष्ण अर्जुन को योग (समत्व बुद्धि) में स्थित होकर, आसक्ति का त्याग कर तथा सिद्धि और असिद्धि (सफलता-विफलता) में समभाव रखकर कर्म करने की आज्ञा देते हैं। समत्व भाव ही योग कहलाता है (समत्वं योग उच्यते)।`;

        sectionA_context = `Speaker: Lord Krishna. Setting: Explaining Buddhi Yoga (the yoga of detached intellect).`;
        sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: बुद्धि योग (समत्व बुद्धि द्वारा कर्म) का निरूपण।`;

        sectionB_explanation = `Yoga is defined here as "Samatvam" (equanimity). When the mind is freed from the frantic roller-coaster of euphoria in victory and depression in defeat, cognitive clarity is preserved. Skill in action (Yogaḥ karmasu kauśhalam) naturally follows.`;
        sectionB_explanationHindi = `यहाँ योग की परिभाषा "समत्वम्" (समता) दी गई है। जब मन सफलता में अहंकार और विफलता में निराशा से मुक्त हो जाता है, तब बुद्धि स्थिर रहती है। यही कुशलता 'कर्मसु कौशलम्' है।`;

        sectionC_title = `Maintaining Emotional Balance Under Pressure`;
        sectionC_titleHindi = `सफलता और असफलता में मानसिक संतुलन`;

        sectionC_scenario = `An entrepreneur or sports player maintains the same calm, constructive focus whether their team wins an award or faces an unexpected product failure.`;
        sectionC_scenarioHindi = `कोई खिलाड़ी या व्यवसायी पुरस्कार जीतने पर अहंकार में नहीं आता और मैच हारने पर अवसाद में नहीं डूबता, बल्कि शांत रहकर आगे की योजना बनाता है।`;

        sectionC_connection = `Equanimity allows us to learn objectively from both success and failure without being blinded by arrogance or crushed by despair.`;
        sectionC_connectionHindi = `समत्व भाव हमें सफलता और विफलता दोनों से सीख लेने की शक्ति देता है, बिना अहंकार में अंधे हुए या निराशा में टूटे।`;

        sectionD_takeaway = `True mastery is equanimity—remaining calm, clear, and steady through both triumph and adversity.`;
        sectionD_takeawayHindi = `सच्ची कुशलता समत्व में है—सुख-दुःख और जय-पराजय में शांत, स्थिर और प्रसन्न रहना।`;

        check_question = `How does Lord Krishna define Yoga in Gita 2.48 (Samatvaṁ yoga uchyate)?`;
        check_questionHindi = `गीता 2.48 में भगवान श्री कृष्ण योग की क्या परिभाषा देते हैं ("समत्वं योग उच्यते")?`;

        check_options = [
          {
            id: 'opt-1',
            text: 'Equanimity and balance of mind in both success and failure.',
            textHindi: 'सफलता और असफलता (सिद्धि-असिद्धि) दोनों में मन का समभाव और संतुलन।'
          },
          {
            id: 'opt-2',
            text: 'Physical contortion and holding the breath for long periods.',
            textHindi: 'शरीर को जटिल मुद्राओं में मोड़ना और लंबे समय तक सांस रोकना।'
          },
          {
            id: 'opt-3',
            text: 'Abandoning family life and wandering without work.',
            textHindi: 'पारिवारिक जीवन और कर्म छोड़कर एकांत में भटकना।'
          },
          {
            id: 'opt-4',
            text: 'Securing miraculous psychic powers to influence others.',
            textHindi: 'दूसरों पर प्रभाव डालने के लिए चमत्कारी सिद्धियाँ प्राप्त करना।'
          }
        ];

        check_feedback = `Correct. Gita 2.48 explicitly defines Yoga as evenness and balance of mind (Samatva).`;
        check_feedbackHindi = `सही उत्तर। गीता 2.48 में स्पष्ट कहा गया है कि सिद्धि और असिद्धि में सम रहने का नाम ही योग है।`;
      }
    } else {
      // 2.54 - 2.72
      sectionA_text = `In response to Arjuna's question about the characteristics of one of steady wisdom (Sthitaprajna), Krishna explains that such a person is free from selfish desires, unmoved by sorrow, devoid of craving for pleasure, and free from passion, fear, and anger.`;
      sectionA_textHindi = `स्थितप्रज्ञ के लक्षणों पर अर्जुन के प्रश्न के उत्तर में श्री कृष्ण समझाते हैं कि जो व्यक्ति अपनी समस्त स्वार्थपूर्ण कामनाओं को त्यागकर आत्मा में ही संतुष्ट रहता है, दुःख में उद्विग्न नहीं होता और सुख की लालसा से रहित तथा राग, भय और क्रोध से मुक्त होता है, वही स्थितप्रज्ञ (स्थिर बुद्धि वाला) है।`;

      sectionA_context = `Speaker: Lord Krishna describing the Sthitaprajna. Setting: Culmination of Chapter 2.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: सांख्य योग का चरम शिखर—स्थितप्रज्ञ के दिव्य लक्षण।`;

      sectionB_explanation = `The Sthitaprajna is the ideal of emotional and spiritual maturity. Like an ocean that remains unruffled though countless rivers continuously pour into it, the mind of the sage remains serene despite the influx of worldly stimuli. Peace (Shanti) is attained by giving up selfish craving.`;
      sectionB_explanationHindi = `स्थितप्रज्ञ भावनात्मक और आध्यात्मिक परिपक्वता का सर्वोच्च आदर्श है। जैसे चारों ओर से नदियाँ निरंतर प्रवेश करने पर भी अगाध समुद्र अपनी मर्यादा में स्थिर रहता है, वैसे ही संसार के भोगों के बीच भी स्थितप्रज्ञ पुरुष का मन अविचल रहता है। शांति वासनाओं के त्याग से मिलती है, उनके संचय से नहीं।`;

      sectionC_title = `Inner Peace Amid Modern Distraction`;
      sectionC_titleHindi = `आधुनिक कोलाहल के बीच अंतःकरण की शांति`;

      sectionC_scenario = `A modern professional flooded with constant notifications, comparison on social media, and workplace gossip learns to remain centered and unperturbed within their own values.`;
      sectionC_scenarioHindi = `सोशल मीडिया की तुलना, निरंतर संदेशों और कार्यालय की गपशप के बीच कोई व्यक्ति अपने मूल्यों में स्थिर रहकर मन की शांति बनाए रखता है।`;

      sectionC_connection = `Like the ocean absorbing incoming rivers without overflowing, a person of steady wisdom experiences life's stimuli without losing inner equilibrium.`;
      sectionC_connectionHindi = `जैसे समुद्र नदियों के जल को समेटकर भी स्थिर रहता है, वैसे ही स्थितप्रज्ञ व्यक्ति संसार की हलचलों के बीच भी अपना संतुलन नहीं खोता।`;

      sectionD_takeaway = `Lasting peace is not found by chasing endless desires, but by attaining contentment within the calm center of your own being.`;
      sectionD_takeawayHindi = `सच्ची शांति अंतहीन इच्छाओं के पीछे भागने से नहीं, अपितु अपने भीतर संतुष्ट और स्थितप्रज्ञ रहने से मिलती है।`;

      check_question = `What metaphor does Krishna use in Gita 2.70 to describe the peace of a person of steady wisdom (Sthitaprajna)?`;
      check_questionHindi = `गीता 2.70 में स्थितप्रज्ञ पुरुष की शांति को समझाने के लिए श्री कृष्ण ने किस उपमा का प्रयोग किया है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Like the ocean that remains still and undisturbed even as all rivers pour into it.',
          textHindi: 'उस समुद्र की तरह, जिसमें चारों ओर से नदियाँ समाने पर भी जो अपनी मर्यादा में स्थिर और अविचल रहता है।'
        },
        {
          id: 'opt-2',
          text: 'Like a fragile leaf blown about by every gust of wind.',
          textHindi: 'हवा के हर झोंके से इधर-उधर उड़ने वाले सूखे पत्ते की तरह।'
        },
        {
          id: 'opt-3',
          text: 'Like a raging fire that consumes everything in its path.',
          textHindi: 'उस भड़कती आग की तरह जो रास्ते की हर वस्तु को जला डालती है।'
        },
        {
          id: 'opt-4',
          text: 'Like a barren desert where nothing can grow.',
          textHindi: 'उस बंजर मरुस्थल की तरह जहाँ कुछ भी उत्पन्न नहीं हो सकता।'
        }
      ];

      check_feedback = `Correct. In 2.70, Krishna compares the steady sage to the ocean, which remains stable and serene despite receiving waters from all rivers.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 2.70 ("आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत्") में स्थितप्रज्ञ की तुलना अचल समुद्र से की गई है।`;
    }
  } else if (ch === 3) {
    if (v === 19) {
      sectionA_text = `Krishna gives a definitive command: "Therefore, constantly perform your obligatory duty without attachment; for by performing action without attachment, a person attains the Supreme."`;
      sectionA_textHindi = `श्री कृष्ण दृढ़ आज्ञा देते हैं: "इसलिए तुम निरंतर आसक्ति से रहित होकर कर्तव्य कर्म का भली-भाँति आचरण करो; क्योंकि अनासक्त होकर कर्म करने से मनुष्य परम तत्व को प्राप्त हो जाता है।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 3 (Karma Yoga), establishing unattached action as the direct path to liberation.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 3 (कर्मयोग), जहाँ अनासक्त कर्म को सीधे परम गति का साधन बताया गया है।`;

      sectionB_explanation = `Verse 3.19 is the core synthesis of Karma Yoga: "Tasmād asaktaḥ satataṁ kāryaṁ karma samācara". The word "asaktaḥ" (detached) indicates internal mental freedom from selfish craving, while "satatam" (constantly) shows that duty cannot be neglected. Renunciation is internal detachment, not physical cessation of work.`;
      sectionB_explanationHindi = `श्लोक 3.19 कर्मयोग का मूल मंत्र है: "तस्मादसक्तः सततं कार्यं कर्म समाचर"। 'अनासक्त' का अर्थ है फल की तृष्णा से मुक्ति, और 'सतत' का अर्थ है दायित्वों का निरंतर पालन। सच्चा संन्यास कर्म छोड़ने में नहीं, मन की आसक्ति छोड़ने में है।`;

      sectionC_title = `Excellence Without Craving for Recognition`;
      sectionC_titleHindi = `बिना प्रशंसा की लालसा के कर्तव्य का निष्ठापूर्वक निर्वाह`;

      sectionC_scenario = `A scientist or surgeon undertakes a prolonged, meticulous procedure focusing solely on precision and duty, without worrying about media coverage or professional praise.`;
      sectionC_scenarioHindi = `कोई चिकित्सक या वैज्ञानिक अपने शोध या कार्य में पूरी तन्मयता से लीन रहता है, बिना इस चिंता के कि उसे अखबारों में वाहवाही मिलेगी या नहीं।`;

      sectionC_connection = `By dedicating focus exclusively to the quality of the necessary task, the mind is cleansed of agitation, allowing the highest state of human excellence and inner freedom.`;
      sectionC_connectionHindi = `कर्तव्य कर्म को पूर्ण निष्ठा से करना और यश-अपयश की चिंता से परे रहना ही चित्तशुद्धि और परम शांति का मार्ग है।`;

      sectionD_takeaway = `Perform your obligatory duties with steadfast dedication and zero selfish attachment, for selfless action leads directly to the Supreme.`;
      sectionD_takeawayHindi = `आसक्ति रहित होकर निरंतर अपने कर्तव्य का आचरण करें; निःस्वार्थ कर्म ही परम कल्याणकारी है।`;

      check_question = `In Gita 3.19 (Tasmād asaktaḥ satataṁ kāryaṁ karma samācara), what does Krishna declare is the result of performing action without attachment?`;
      check_questionHindi = `गीता 3.19 ("तस्मादसक्तः सततं कार्यं कर्म समाचर...") के अनुसार अनासक्त होकर कर्म करने से क्या फल मिलता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'By performing obligatory duty without selfish attachment, a person attains the Supreme.',
          textHindi: 'आसक्ति रहित होकर कर्तव्य कर्म करने से मनुष्य परम पद (परमात्मा) को प्राप्त होता है।'
        },
        {
          id: 'opt-2',
          text: 'One immediately loses all motivation and becomes incapable of performing complex tasks.',
          textHindi: 'व्यक्ति का सारा उत्साह समाप्त हो जाता है और वह काम करने के अयोग्य हो जाता है।'
        },
        {
          id: 'opt-3',
          text: 'It guarantees that every worldly outcome will yield immense material fortune.',
          textHindi: 'यह गारंटी देता है कि हर सांसारिक कार्य में अपार धन-संपत्ति ही मिलेगी।'
        },
        {
          id: 'opt-4',
          text: 'It advises that one should abandon work and beg for livelihood.',
          textHindi: 'यह सिखाता है कि काम छोड़कर केवल भीख माँगकर गुजारा करना चाहिए।'
        }
      ];

      check_feedback = `Correct. Gita 3.19 explicitly concludes: "asakto hy ācaran karma param āpnoti pūruṣaḥ" (by performing action without attachment, man reaches the Supreme).`;
      check_feedbackHindi = `सही उत्तर। श्लोक 3.19 कहता है: "असक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः।"`;
    } else {
      sectionA_text = `Krishna explains the necessity of selfless work (Karma Yoga), demonstrating that no one can remain without action even for a moment, and that work performed as an offering (Yajna) purifies the heart and maintains the world order (Loka-sangraha).`;
      sectionA_textHindi = `श्री कृष्ण निष्काम कर्मयोग की अनिवार्यता समझाते हैं कि कोई भी प्राणी एक क्षण भी कर्म किए बिना नहीं रह सकता। यज्ञ (परहित और ईश्वरीय अर्पण) भाव से किया गया कर्म बंधन नहीं बनता, बल्कि चित्त को शुद्ध करता है और लोकसंग्रह (संसार की मर्यादा) की रक्षा करता है।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 3 (Karma Yoga), addressing Arjuna's confusion over whether renouncing action is better than performing it.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 3 (कर्मयोग)—कर्म त्याग बनाम कर्मयोग के संशय का निवारण।`;

      sectionB_explanation = `True renunciation is the renunciation of selfish motives, not the abandonment of useful activity. The wise act with energy and discipline to set a positive standard for society (3.21: "Yad yad ācharati śhreṣhṭhas..."). In the concluding verses, Krishna identifies selfish desire (Kama) and anger (Krodha) as the all-devouring enemies that must be conquered through the higher intellect.`;
      sectionB_explanationHindi = `सच्चा संन्यास कर्म छोड़ने में नहीं, बल्कि कर्मफल की आसक्ति और स्वार्थ छोड़ने में है। श्रेष्ठ जन जैसा आचरण करते हैं, समाज उसी का अनुसरण करता है (3.21: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः")। अंत में भगवान काम और क्रोध को आत्मा का महाशत्रु बताते हुए विवेक द्वारा उन पर विजय पाने का उपदेश देते हैं।`;

      sectionC_title = `Leading by Example and Conquering Impulsive Anger`;
      sectionC_titleHindi = `श्रेष्ठ आचरण द्वारा आदर्श प्रस्तुत करना और क्रोध पर विजय`;

      sectionC_scenario = `A team manager or parent knows that their team or children will mirror their actions rather than their lectures, so they maintain patience and work ethic during high-pressure crises.`;
      sectionC_scenarioHindi = `एक प्रबंधक या अभिभावक जानता है कि बच्चे या सहकर्मी उपदेशों से नहीं, बल्कि उनके प्रत्यक्ष आचरण से सीखते हैं; इसलिए वे संकट में धैर्य और सदाचार का उदाहरण प्रस्तुत करते हैं।`;

      sectionC_connection = `By acting with selfless dedication and mastering reactive irritation, we positively influence our environment and prevent self-destructive mistakes.`;
      sectionC_connectionHindi = `निःस्वार्थ भाव से कार्य करना और क्रोध पर नियंत्रण रखना हमारे आस-पास के वातावरण को प्रेरणा देता है और गलतियों से बचाता है।`;

      sectionD_takeaway = `Lead by the integrity of your actions, and conquer selfish desire and anger before they cloud your discernment.`;
      sectionD_takeawayHindi = `अपने आचरण की पवित्रता से समाज का मार्गदर्शन करें, और काम व क्रोध को अपनी बुद्धि पर हावी न होने दें।`;

      check_question = `According to Gita 3.21, why is it essential for capable leaders to act with excellence and integrity?`;
      check_questionHindi = `गीता 3.21 के अनुसार श्रेष्ठ व्यक्तियों और मार्गदर्शकों का निष्ठापूर्वक आचरण करना क्यों अनिवार्य है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Whatever actions a great person performs, ordinary people follow; the standards they set become the standard for the world.',
          textHindi: 'श्रेष्ठ पुरुष जैसा आचरण करता है, अन्य लोग भी वैसा ही करते हैं; वह जो प्रमाण प्रस्तुत करता है, समस्त संसार उसका अनुसरण करता है।'
        },
        {
          id: 'opt-2',
          text: 'To accumulate personal praise, political influence, and material wealth.',
          textHindi: 'व्यक्तिगत प्रशंसा, राजनीतिक प्रभाव और अपार धन अर्जित करने के लिए।'
        },
        {
          id: 'opt-3',
          text: 'To prove their intellectual superiority over those who do not understand philosophy.',
          textHindi: 'दर्शनशास्त्र न समझने वालों के सामने अपनी बौद्धिक श्रेष्ठता सिद्ध करने के लिए।'
        },
        {
          id: 'opt-4',
          text: 'To ensure they never have to listen to the opinions of others.',
          textHindi: 'यह सुनिश्चित करने के लिए कि उन्हें कभी दूसरों की राय न सुननी पड़े।'
        }
      ];

      check_feedback = `Correct. Gita 3.21 states that society follows the example set by respected leaders.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 3.21 कहता है: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः। स यत्प्रमाणं कुरुते लोकस्तदनुवर्तते॥"`;
    }
  } else if (ch === 4) {
    sectionA_text = `Krishna reveals the ancient lineage of this wisdom, the purpose of divine descent to protect righteousness (4.7-4.8), the secret of seeing action in inaction and inaction in action (4.18), and the purifying power of self-knowledge (4.38).`;
    sectionA_textHindi = `श्री कृष्ण इस सनातन योग परंपरा के अनादि इतिहास का वर्णन करते हैं, धर्म-संस्थापनार्थ युग-युग में प्रभु के दिव्य अवतार का रहस्य बताते हैं (4.7-4.8), कर्म में अकर्म और अकर्म में कर्म देखने का तत्व समझाते हैं (4.18), और ज्ञान की पावन अग्नि की महिमा गाते हैं (4.38)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 4 (Jnana Karma Sannyasa Yoga).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 4 (ज्ञानकर्मसंन्यासयोग)।`;

    sectionB_explanation = `Action binds when driven by the illusion of independent doership. When action is illuminated by wisdom, its binding reactions are burned away. There is no purifier in this world equal to knowledge ("Na hi jñānena sadṛiśhaṁ pavitram iha vidyate"). Doubt, on the other hand, destroys the wavering mind.`;
    sectionB_explanationHindi = `कर्म तब बांधता है जब उसमें कर्तापन का अहंकार होता है। जब कर्म ज्ञान की अग्नि में तपकर किया जाता है, तो उसके बंधन भस्म हो जाते हैं। संसार में ज्ञान के समान पवित्र करने वाला कुछ भी नहीं है ("न हि ज्ञानेन सदृशं पवित्रमिह विद्यते")। इसके विपरीत संशय आत्मा का विनाश कर देता है।`;

    sectionC_title = `Overcoming Paralysis of Doubt with Knowledge`;
    sectionC_titleHindi = `सत्य ज्ञान द्वारा संशय और अकर्मण्यता पर विजय`;

    sectionC_scenario = `A researcher or student plagued by chronic self-doubt and conflicting rumors searches out primary factual evidence and systematic study to regain confidence and clarity.`;
    sectionC_scenarioHindi = `संशय और अफवाहों से घिरा शोधकर्ता या विद्यार्थी प्राथमिक तथ्यों और प्रामाणिक ज्ञान का अध्ययन कर अपना आत्मविश्वास और स्पष्टता पुनः प्राप्त करता है।`;

    sectionC_connection = `Just as Krishna teaches that the sword of knowledge slashes through paralyzing skepticism, objective understanding dispels irrational fear and restores decisive action.`;
    sectionC_connectionHindi = `जैसे श्री कृष्ण ज्ञान रूपी तलवार से संशय को काटने का उपदेश देते हैं, वैसे ही यथार्थ ज्ञान और निष्ठा अकारण भय को मिटाकर दृढ़ निश्चय प्रदान करते हैं।`;

    sectionD_takeaway = `Nothing purifies and clarifies human life like authentic knowledge; resolve inner doubt through sincere inquiry and disciplined practice.`;
    sectionD_takeawayHindi = `संसार में तत्व-ज्ञान के समान पवित्र कुछ भी नहीं है; श्रद्धा और साधना से अपने संशयों को ज्ञान की अग्नि में भस्म करें।`;

    check_question = `In Gita 4.38, how does Lord Krishna describe the value of spiritual knowledge (Jnana)?`;
    check_questionHindi = `गीता 4.38 में भगवान श्री कृष्ण ज्ञान (ज्ञानम्) की क्या महिमा बताते हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'There is nothing in this world as truly purifying and transformative as self-knowledge.',
        textHindi: 'इस संसार में आत्म-ज्ञान के समान पवित्र और कल्याणकारी कुछ भी नहीं है।'
      },
      {
        id: 'opt-2',
        text: 'Knowledge is inferior to blind ritual and mechanical repetition.',
        textHindi: 'ज्ञान का स्थान अंधानुकरण और यांत्रिक कर्मकांड से बहुत नीचे है।'
      },
      {
        id: 'opt-3',
        text: 'Knowledge creates unbearable pride and should be avoided by seekers.',
        textHindi: 'ज्ञान केवल असहनीय अहंकार पैदा करता है इसलिए साधक को इससे बचना चाहिए।'
      },
      {
        id: 'opt-4',
        text: 'Knowledge is useful only after a person retires from active professional life.',
        textHindi: 'ज्ञान केवल संन्यास या वृद्धावस्था में ही उपयोगी होता है, कर्मशील जीवन में नहीं।'
      }
    ];

    check_feedback = `Correct. Gita 4.38 proclaims: "Na hi jñānena sadṛiśhaṁ pavitram iha vidyate" (Verily, there is no purifier in this world like knowledge).`;
    check_feedbackHindi = `सही उत्तर। श्लोक 4.38 का स्पष्ट कथन है: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।"`;
  } else if (ch === 5) {
    sectionA_text = `Krishna reconciles renunciation (Sannyasa) with action (Karma Yoga), declaring that the enlightened practitioner acts without attachment, untouched by negativity just as a lotus leaf is untouched by water.`;
    sectionA_textHindi = `श्री कृष्ण संन्यास और कर्मयोग का समन्वय करते हैं और घोषणा करते हैं कि जो पुरुष समस्त कर्मों को परमात्मा में अर्पण करके आसक्ति त्यागकर कर्म करता है, वह पाप से वैसे ही लिप्त नहीं होता जैसे कमल का पत्ता जल से नहीं भीगता।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 5 (Karma Sannyasa Yoga).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 5 (कर्मसंन्यासयोग)।`;

    sectionB_explanation = `The lotus leaf grows in muddy water, yet water drops roll right off its waxy surface without wetting it. Similarly, one who dedicates all actions to the Supreme and acts without selfish possessiveness lives in the world without being corrupted by worldliness. The wise look with equal vision upon all living beings (5.18).`;
    sectionB_explanationHindi = `कमल का पत्ता जल और कीचड़ में रहकर भी जल से अलिप्त रहता है। इसी प्रकार जो साधक सांसारिक कर्तव्यों को निष्काम भाव से निभाता है, वह संसार में रहकर भी विकारों से मुक्त रहता है। ज्ञानी पुरुष सभी प्राणियों में एक समान आत्म-तत्व देखते हैं (5.18)।`;

    sectionC_title = `Living Untouched by Toxic Environments`;
    sectionC_titleHindi = `कमलवत निर्लिप्त जीवन और समदर्शिता`;

    sectionC_scenario = `An employee works in an intensely competitive or gossipy workplace but performs their duties with integrity, kindness, and detachment, refusing to participate in office politics.`;
    sectionC_scenarioHindi = `कटुता और राजनीति से भरे कार्यालय में भी कोई कर्मचारी अपने मूल्यों, सेवा-भाव और कर्तव्य पर स्थिर रहकर नकारात्मकता से सर्वथा अछूता रहता है।`;

    sectionC_connection = `Like the lotus leaf in water, maintaining an inner anchor of values enables a person to participate in challenging environments without being stained by surrounding negativity.`;
    sectionC_connectionHindi = `जैसे कमल-पत्र जल में रहकर भी नहीं भीगता, वैसे ही अंतःकरण में आध्यात्मिक निष्ठा साधक को दूषित वातावरण में भी शुद्ध बनाए रखती है।`;

    sectionD_takeaway = `Live in the world with engagement, but remain internally untouched by surrounding negativity, like a lotus leaf in water.`;
    sectionD_takeawayHindi = `संसार में पूरी निष्ठा से कर्म करें, किंतु आसक्ति त्यागकर कमल के पत्ते के समान विकारों से निर्लिप्त रहें।`;

    check_question = `What is the significance of the lotus leaf metaphor in Gita 5.10?`;
    check_questionHindi = `गीता 5.10 में पद्मपत्र (कमल के पत्ते) के दृष्टांत का क्या रहस्य है?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'It illustrates how a person acting without selfish attachment remains unstained by surrounding negativity, just as water does not cling to a lotus leaf.',
        textHindi: 'यह दर्शाता है कि आसक्ति रहित होकर कर्म करने वाला व्यक्ति पाप या बुराई से लिप्त नहीं होता, जैसे कमल के पत्ते पर जल नहीं ठहरता।'
      },
      {
        id: 'opt-2',
        text: 'It suggests that spiritual seekers must live exclusively near ponds and lakes.',
        textHindi: 'इसका अर्थ है कि साधकों को केवल सरोवरों और झीलों के पास ही निवास करना चाहिए।'
      },
      {
        id: 'opt-3',
        text: 'It warns that action in the world is completely useless and should be avoided.',
        textHindi: 'यह चेतावनी देता है कि संसार में कर्म करना सर्वथा निरर्थक है।'
      },
      {
        id: 'opt-4',
        text: 'It teaches that only delicate people can understand spiritual truth.',
        textHindi: 'यह सिखाता है कि केवल कोमल स्वभाव वाले लोग ही अध्यात्म समझ सकते हैं।'
      }
    ];

    check_feedback = `Correct. Gita 5.10 teaches that one who performs duties without attachment is untouched by sin, like a lotus leaf by water.`;
    check_feedbackHindi = `सही उत्तर। श्लोक 5.10 कहता है: "लिप्यते न स पापेन पद्मपत्रमिवाम्भसा।"`;
  } else if (ch === 6) {
    if (v === 26) {
      sectionA_text = `Krishna offers the golden key to mental mastery: "From wherever the restless and unsteady mind wanders away, one should restrain it and bring it back under the control of the Self alone."`;
      sectionA_textHindi = `श्री कृष्ण मन के नियमन का अचूक सूत्र देते हैं: "यह चंचल और अस्थिर मन जिन-जिन विषयों में भटके, वहाँ-वहाँ से इसे रोककर बार-बार आत्मा के ही वश में लाना चाहिए।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 6 (Dhyana Yoga / Atmasamyama Yoga), training the wandering intellect.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 6 (ध्यानयोग / आत्मसंयमयोग)—भटकते मन का धैर्यपूर्वक नियमन।`;

      sectionB_explanation = `Verse 6.26 ("Yato yato niścarati manas cañcalam asthiram") directly addresses the universal human struggle with focus. Krishna does not criticize the mind for drifting; rather, he teaches a non-judgmental, patient method of continuous redirection. Each time attention wanders to past regrets or future anxiety, gently bring it back to the present center.`;
      sectionB_explanationHindi = `श्लोक 6.26 मन के भटकाव पर विजय पाने का मनोवैज्ञानिक सिद्धांत है। भगवान मन के भटकने पर क्रोधित होने को नहीं कहते, बल्कि धैर्यपूर्वक बिना खीझे उसे पुनः केंद्र में लाने का निर्देश देते हैं। जब-जब ध्यान हटे, तब-तब उसे शांत भाव से कर्तव्य पर लौटाएँ।`;

      sectionC_title = `Overcoming Distraction Through Patient Redirection`;
      sectionC_titleHindi = `धैर्यपूर्वक एकाग्रता की पुनर्प्राप्ति`;

      sectionC_scenario = `A student studying for an exam or a professional writing code notices their attention repeatedly drifting to social media notifications, but calmly puts the phone away and redirects their focus back to work without getting upset.`;
      sectionC_scenarioHindi = `पढ़ाई या काम करते समय ध्यान बार-बार फोन या खयालों में भटकता है, किंतु व्यक्ति निराश होने के बजाय हर बार शांति से मन को वर्तमान कार्य पर लौटाता है।`;

      sectionC_connection = `Verse 6.26 is the core of modern attention training: focus is not an absence of wandering, but the learned skill of non-reactive, repeated return to the object of attention.`;
      sectionC_connectionHindi = `श्लोक 6.26 सिखाता है कि ध्यान भटकना स्वाभाविक है, किंतु हर बार बिना चिढ़े मन को पुनः एकाग्र करना ही वास्तविक मानसिक अनुशासन है।`;

      sectionD_takeaway = `Whenever your restless mind wanders into distraction, patiently and persistently redirect it back to your center without self-criticism.`;
      sectionD_takeawayHindi = `जहाँ-जहाँ चंचल मन भटके, वहाँ-वहाँ से रोककर धैर्यपूर्वक उसे पुनः अपने लक्ष्य और अंतःकरण में एकाग्र करें।`;

      check_question = `In Gita 6.26 (Yato yato niścarati manas cañcalam asthiram), what method does Krishna prescribe for managing a wandering mind?`;
      check_questionHindi = `गीता 6.26 ("यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्...") में चंचल मन को वश में करने का क्या उपाय बताया गया है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'From wherever the restless mind wanders, repeatedly restrain it and gently bring it back under the control of the Self.',
          textHindi: 'चंचल मन जहाँ-जहाँ भटके, वहाँ-वहाँ से रोककर उसे बार-बार आत्मा के ही नियंत्रण में लाना चाहिए।'
        },
        {
          id: 'opt-2',
          text: 'Give in completely to every impulse so the mind exhausts its desires.',
          textHindi: 'मन की हर इच्छा को तुरंत पूरा कर देना चाहिए ताकि वह थक कर शांत हो जाए।'
        },
        {
          id: 'opt-3',
          text: 'Punish the physical body with harsh starvation whenever thoughts wander.',
          textHindi: 'विचार भटकने पर शरीर को कठोर उपवास द्वारा दंडित करना चाहिए।'
        },
        {
          id: 'opt-4',
          text: 'Accept that focus is impossible and abandon all meditation practice.',
          textHindi: 'यह मान लेना चाहिए कि एकाग्रता असंभव है और अभ्यास छोड़ देना चाहिए।'
        }
      ];

      check_feedback = `Correct. Shloka 6.26 commands: "tatas tato niyamyaitad ātmany eva vaśaṁ nayet" (from whatever cause the wandering mind strays, restrain it and bring it under the control of the Self).`;
      check_feedbackHindi = `सही उत्तर। श्लोक 6.26 कहता है: "ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्।"`;
    } else {
      sectionA_text = `Krishna outlines the practice of meditation (Dhyana Yoga): lifting oneself by one's own mind (6.5), practicing moderation in food, sleep, and activity (6.16-6.17), and taming the restless mind through consistent practice (Abhyasa) and non-attachment (Vairagya) (6.35).`;
      sectionA_textHindi = `श्री कृष्ण ध्यानयोग की विधि बताते हैं: अपने द्वारा अपना उद्धार करना (6.5), आहार, विहार, निद्रा और कर्म में संयम रखना (6.16-6.17), तथा निरंतर अभ्यास और वैराग्य द्वारा चंचल मन को वश में करना (6.35)।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 6 (Dhyana Yoga / The Yoga of Meditation).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 6 (आत्मसंयमयोग / ध्यानयोग)।`;

      sectionB_explanation = `Verse 6.5 teaches that the mind can be one's greatest friend or worst enemy. When undisciplined, the mind sabotages happiness; when disciplined, it becomes an ally in self-realization. Krishna reassures Arjuna that although the mind is restless like the wind, it can be tamed through gradual, persistent practice (Abhyasa) and detachment from distractions (Vairagya).`;
      sectionB_explanationHindi = `श्लोक 6.5 सिखाता है कि मन ही मनुष्य का परम मित्र है और मन ही परम शत्रु। असंयमित मन पतन कराता है, जबकि संयमित मन आत्म-कल्याण का साधन बनता है। वायु के समान चंचल मन को भी निरंतर अभ्यास और वैराग्य द्वारा वश में किया जा सकता है।`;

      sectionC_title = `Mindful Focus and Inner Equilibrium`;
      sectionC_titleHindi = `मन की एकाग्रता और आंतरिक संतुलन`;

      sectionC_scenario = `A student sitting down to study finds their mind continually wandering to phone notifications or anxious daydreams, but patiently brings attention back to the textbook again and again.`;
      sectionC_scenarioHindi = `पढ़ाई करते समय विद्यार्थी का मन बार-बार फोन या खयालों में भटकता है, किंतु वह बिना खीझे धैर्यपूर्वक मन को पुनः अध्ययन पर एकाग्र करता है।`;

      sectionC_connection = `Krishna’s advice in 6.5 and 6.35 emphasizes personal agency: train the mind through steady, daily habits of focus and healthy moderation.`;
      sectionC_connectionHindi = `श्लोक 6.5 और 6.35 सिखाते हैं कि नियमित अभ्यास और आत्म-संयम से मन को अपना सबसे बड़ा सहायक बनाया जा सकता है।`;

      sectionD_takeaway = `Train your mind to be your trusted ally through steady daily practice and disciplined moderation.`;
      sectionD_takeawayHindi = `नियमित अभ्यास और संयम द्वारा अपने मन को अपना सच्चा मित्र बनाएँ, पतन कराने वाला शत्रु नहीं।`;

      check_question = `In Gita 6.5, how does Krishna describe the relationship between the human individual and their own mind?`;
      check_questionHindi = `गीता 6.5 में श्री कृष्ण मनुष्य और उसके मन के संबंध को किस प्रकार स्पष्ट करते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'One must elevate oneself by one’s own mind; the mind is the friend of the self-controlled, but the enemy of the undisciplined.',
          textHindi: 'मनुष्य को अपने मन द्वारा अपना उद्धार करना चाहिए; जिसका मन वश में है उसका मन मित्र है, और असंयमी का मन उसका शत्रु है।'
        },
        {
          id: 'opt-2',
          text: 'The mind is inherently evil and can never be befriended or tamed.',
          textHindi: 'मन स्वभाव से ही दुष्ट है और इसे कभी मित्र नहीं बनाया जा सकता।'
        },
        {
          id: 'opt-3',
          text: 'External circumstances alone dictate mental state, leaving the individual powerless.',
          textHindi: 'केवल बाहरी परिस्थितियाँ ही मन को चलाती हैं और मनुष्य सर्वथा असहाय है।'
        },
        {
          id: 'opt-4',
          text: 'The mind requires no discipline because natural instincts are always right.',
          textHindi: 'मन को किसी संयम की आवश्यकता नहीं है क्योंकि प्राकृतिक इच्छाएँ सदैव सही होती हैं।'
        }
      ];

      check_feedback = `Correct. Gita 6.5 teaches: "Let a man lift himself by his own Self; for the Self alone is the friend of the self, and the Self alone is the enemy of the self."`;
      check_feedbackHindi = `सही उत्तर। श्लोक 6.5: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥"`;
    }
  } else if (ch === 7) {
    // Jnana Vijnana Yoga
    sectionA_text = `Krishna unveils the dual nature of reality: His lower nature (Apara Prakriti: earth, water, fire, air, space, mind, intellect, ego) and His higher conscious nature (Para Prakriti), teaching that all beings are strung upon the Divine like pearls on a thread (7.7).`;
    sectionA_textHindi = `श्री कृष्ण अपनी परा और अपरा प्रकृति का रहस्य प्रकट करते हैं: आठ प्रकार की जड़ प्रकृति (भूमि, जल, अग्नि, वायु, आकाश, मन, बुद्धि, अहंकार) और जीवन दायिनी चेतन परा प्रकृति। वे बताते हैं कि समस्त संसार मुझमें सूत्र में मणियों की तरह पिरोया हुआ है (7.7)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 7 (Jnana Vijnana Yoga / Knowledge and Discernment).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 7 (ज्ञानविज्ञानयोग)—परमात्मा की परा-अपरा प्रकृति और चार प्रकार के भक्त।`;

    sectionB_explanation = `Chapter 7 transitions from self-discipline to universal spiritual vision. In 7.16, Krishna identifies four kinds of virtuous seekers who turn to the Divine: the distressed (Arta), the seeker of knowledge (Jijnasu), the seeker of wealth or security (Artharthi), and the wise person of steady insight (Jnani). Divine Maya is difficult to overcome, but those who surrender to the Supreme cross beyond it (7.14).`;
    sectionB_explanationHindi = `अध्याय 7 व्यक्तिगत साधना से आगे बढ़कर ब्रह्मांडीय चेतना का दर्शन कराता है। श्लोक 7.16 में चार प्रकार के भक्तों का वर्णन है: आर्त (दुःखी), जिज्ञासु (ज्ञान की चाह रखने वाला), अर्थार्थी (सांसारिक लाभ चाहने वाला), और ज्ञानी (तत्व को जानने वाला)। भगवान की त्रिगुणमयी माया दुस्तर है, किंतु जो प्रभु की शरण में आते हैं वे इसे सहज ही पार कर जाते हैं (7.14)।`;

    sectionC_title = `Recognizing the Divine Thread in Diverse Realities`;
    sectionC_titleHindi = `विविधता में एकता का दर्शन`;

    sectionC_scenario = `An educator or community leader looks at diverse people from varied backgrounds and perceives the common human consciousness connecting them, rather than focusing on surface divisions.`;
    sectionC_scenarioHindi = `विभिन्न पृष्ठभूमि और विचारों के लोगों के बीच काम करते समय कोई व्यक्ति बाहरी मतभेदों के बजाय सबके भीतर एक ही चेतना के सूत्र को पहचानता है।`;

    sectionC_connection = `Like pearls on a thread (7.7), understanding the unifying consciousness behind the diversity of nature brings peace, tolerance, and respect into daily relationships.`;
    sectionC_connectionHindi = `सूत में मणियों के दृष्टांत के समान संसार की विविधता के पीछे एक ही सत्ता का बोध जीवन में सहिष्णुता, शांति और आत्मीयता लाता है।`;

    sectionD_takeaway = `See the unifying conscious reality sustaining all diverse creation, and anchor your life in authentic spiritual surrender.`;
    sectionD_takeawayHindi = `संसार की विविधता के मूल में स्थित एक ही चेतना को पहचानें और निष्काम भाव से प्रभु की शरण ग्रहण करें।`;

    check_question = `In Gita Chapter 7 (verse 7.16), what four classes of virtuous seekers does Krishna state worship Him?`;
    check_questionHindi = `गीता अध्याय 7 (श्लोक 7.16) के अनुसार कौन से चार प्रकार के पुण्यात्मा भक्त भगवान का भजन करते हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'The distressed (Arta), the seeker of knowledge (Jijnasu), the seeker of wealth (Artharthi), and the person of wisdom (Jnani).',
        textHindi: 'आर्त (संकटग्रस्त), जिज्ञासु (ज्ञान-पिपासु), अर्थार्थी (भोग या संपत्ति चाहने वाला), और ज्ञानी (तत्व-दर्शी)।'
      },
      {
        id: 'opt-2',
        text: 'The arrogant, the deceitful, the violent, and the vengeful.',
        textHindi: 'अहंकारी, कपटी, हिंसक और प्रतिशोधी।'
      },
      {
        id: 'opt-3',
        text: 'Only those who possess immense political power and royal birth.',
        textHindi: 'केवल वे जिनके पास विशाल राजनीतिक सत्ता और राजसी कुल हो।'
      },
      {
        id: 'opt-4',
        text: 'Those who perform actions purely for gambling and speculative risk.',
        textHindi: 'जो केवल जुए और सट्टेबाजी के लाभ के लिए पूजा करते हैं।'
      }
    ];

    check_feedback = `Correct. Gita 7.16 specifies: "catur-vidhā bhajante māṁ janāḥ sukṛtino 'rjuna, ārto jijñāsur arthārthī jñānī ca bharatarṣabha".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 7.16: "चतुर्विधा भजन्ते मां जनाः सुकृतिनोऽर्जुन। आर्तो जिज्ञासुरर्थार्थी ज्ञानी च भरतर्षभ॥"`;
  } else if (ch === 8) {
    // Akshara Brahma Yoga
    sectionA_text = `Krishna explains the attainment of the Imperishable Absolute (Akshara Brahma), revealing that whatever state of being one remembers at the final hour of leaving the body, that alone one attains (8.6), and urges continuous remembrance with a dedicated mind (8.14).`;
    sectionA_textHindi = `श्री कृष्ण अविनाशी परब्रह्म (अक्षर ब्रह्म) की प्राप्ति का रहस्य बताते हैं कि मनुष्य अंतकाल में जिस-जिस भाव का स्मरण करते हुए शरीर छोड़ता है, वह उसी को प्राप्त होता है (8.6); अतः निरंतर अनन्य चित्त से प्रभु का स्मरण करते हुए कर्तव्य कर्म करना चाहिए (8.14)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 8 (Akshara Brahma Yoga / The Yoga of the Imperishable Brahman).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 8 (अक्षरब्रह्मयोग)—प्रयाण काल की चेतना और नित्य स्मरण।`;

    sectionB_explanation = `What arises in the mind at death is not an accidental event; it is the natural culmination of lifelong habits and values ("yaṁ yaṁ vāpi smaran bhāvaṁ tyajaty ante kalevaram"). Therefore, Krishna advises constant, daily remembrance (Nitya-smarana) paired with active duty ("tasmāt sarveṣhu kāleṣhu mām anusmara yudhya cha"), so that the final consciousness naturally abides in truth.`;
    sectionB_explanationHindi = `मृत्यु के समय अंतःकरण में वही विचार और संस्कार उभरते हैं जो जीवन भर संचित किए गए हों। इसलिए भगवान निरंतर स्मरण के साथ कर्तव्य कर्म करने की प्रेरणा देते हैं: "तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च"। नित्य साधना ही अंतिम क्षण को सार्थक बनाती है।`;

    sectionC_title = `Cultivating Lifelong Habits for Critical Moments`;
    sectionC_titleHindi = `संकट के समय के लिए आजीवन संस्कारों का निर्माण`;

    sectionC_scenario = `An emergency responder or pilot trains daily under strict protocols so that when a high-stress crisis suddenly occurs, their calm, disciplined response happens automatically.`;
    sectionC_scenarioHindi = `पायलट या डॉक्टर शांत समय में निरंतर कठोर अभ्यास करता है, ताकि आपातकाल के भयानक तनाव में भी उसका विवेक स्वतः सही निर्णय ले सके।`;

    sectionC_connection = `Our reaction in critical life transitions reflects the deepest habits we have practiced daily; steady spiritual mindfulness trains the mind to remain serene in life’s most difficult trials.`;
    sectionC_connectionHindi = `कठिन या अंतिम पलों में हमारा व्यवहार वही होता है जो हमारे गहरे संस्कार होते हैं; दैनिक सात्त्विक अभ्यास संकट में मन को अडिग रखता है।`;

    sectionD_takeaway = `Cultivate noble, mindful values steadily each day, for what you practice consistently becomes your sanctuary in life’s final testing moments.`;
    sectionD_takeawayHindi = `दैनिक जीवन में निरंतर सात्त्विक संस्कारों को पोषित करें; जीवन भर का अभ्यास ही संकट और अंतकाल का सच्चा सहारा बनता है।`;

    check_question = `According to Gita 8.5–8.6, what determines the soul's state and destination at the time of leaving the body?`;
    check_questionHindi = `गीता 8.5–8.6 के अनुसार शरीर छोड़ते समय जीवात्मा की गति और स्थिति का निर्धारण किस आधार पर होता है?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'The prevailing state of mind and values cultivated through lifelong habitual thoughts and remembrance.',
        textHindi: 'जीवन भर के अभ्यास और संस्कारों द्वारा निर्मित अंतःकरण का मुख्य भाव और चिंतन।'
      },
      {
        id: 'opt-2',
        text: 'Purely random chance unrelated to any previous actions or thoughts.',
        textHindi: 'केवल एक आकस्मिक संयोग जिसका पिछले कर्मों और विचारों से कोई संबंध नहीं होता।'
      },
      {
        id: 'opt-3',
        text: 'The amount of gold and physical property left behind in a will.',
        textHindi: 'पीछे छोड़ी गई धन-दौलत और वसीयत की मात्रा।'
      },
      {
        id: 'opt-4',
        text: 'The geographic altitude of the city where physical death occurred.',
        textHindi: 'उस नगर की भौगोलिक ऊँचाई जहाँ शरीर का त्याग हुआ।'
      }
    ];

    check_feedback = `Correct. Gita 8.6 states: "yaṁ yaṁ vāpi smaran bhāvaṁ tyajaty ante kalevaram, taṁ tam evaiti kaunteya sadā tad-bhāva-bhāvitaḥ".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 8.6 कहता है: "यं यं वापि स्मरन्भावं त्यजत्यन्ते कलेवरम्। तं तमेवैति कौन्तेय सदा तद्भावभावितः॥"`;
  } else if (ch === 9) {
    // Raja Vidya Raja Guhya Yoga
    sectionA_text = `Krishna reveals the sovereign science and supreme secret: He pervades the entire universe in unmanifest form, promises to personally bear the welfare of those who meditate on Him with undivided devotion (9.22), and lovingly accepts even a simple leaf, flower, fruit, or water offered with devotion (9.26).`;
    sectionA_textHindi = `श्री कृष्ण राजविद्या और राजगुह्य तत्व प्रकट करते हैं: अव्यक्त रूप से वे संपूर्ण जगत में व्याप्त हैं, अनन्य भाव से ध्यान करने वाले भक्तों का योगक्षेम (रक्षा और कल्याण) वे स्वयं वहन करते हैं (9.22), और प्रेमपूर्वक अर्पित पत्र, पुष्प, फल या जल को भी सादर स्वीकार करते हैं (9.26)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 9 (Raja Vidya Raja Guhya Yoga / The Yoga of Sovereign Science and Sovereign Secret).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 9 (राजविद्याराजगुह्ययोग)—अनन्य शरणागति और निष्काम भक्ति का परम आश्वासन।`;

    sectionB_explanation = `This chapter is celebrated for divine accessibility and grace. Verse 9.22 ("Ananyāśh chintayanto māṁ...") assures seekers that total reliance on the Divine brings complete spiritual protection. Verse 9.27 ("Yat karoṣhi yad aśhnāsi...") transforms everyday existence into sacred offering: every meal, work task, and charitable deed becomes an act of devotion when offered selflessly.`;
    sectionB_explanationHindi = `यह अध्याय ईश्वरीय कृपा का प्रत्यक्ष द्वार है। श्लोक 9.22 में "तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्" कहकर भगवान भक्त की पूर्ण सुरक्षा का वचन देते हैं। श्लोक 9.27 सिखाता है कि जो कुछ तुम करते हो, खाते हो, हवन करते हो या दान देते हो, वह सब प्रभु को अर्पण कर दो—यह दैनिक जीवन को ही योग बना देता है।`;

    sectionC_title = `Transforming Daily Routine into Sacred Service`;
    sectionC_titleHindi = `दैनिक कर्मों को सेवा और समर्पण में रूपांतरित करना`;

    sectionC_scenario = `A nurse, teacher, or cook prepares and serves meals or lessons not merely as a monotonous job, but with genuine love, dedicating their effort to the wellbeing of others.`;
    sectionC_scenarioHindi = `कोई व्यक्ति अपने सामान्य घरेलू या व्यावसायिक कार्यों को मजबूरी में नहीं, बल्कि प्राणिमात्र की सेवा और ईश्वर का कार्य समझकर प्रेमपूर्वक करता है।`;

    sectionC_connection = `Gita 9.26–27 teaches that the value of an action lies in the purity of the heart behind it, not lavish outer displays; dedicating daily duties to the Supreme ennobles everyday life.`;
    sectionC_connectionHindi = `श्लोक 9.26-27 सिखाते हैं कि क्रिया का मूल्य बाह्य तड़क-भड़क में नहीं, बल्कि अंतःकरण के प्रेम में है; प्रत्येक कर्म को ईश्वरीय अर्पण बनाना ही जीवन की सार्थकता है।`;

    sectionD_takeaway = `Dedicate all your daily thoughts, meals, work, and kindness to the Supreme, finding divine sanctuary in sincere love and selfless duty.`;
    sectionD_takeawayHindi = `अपने प्रत्येक कर्म, आहार और सेवा को निष्काम भाव से प्रभु को समर्पित करें; प्रेम और निष्ठा ही सच्ची भक्ति है।`;

    check_question = `In Gita 9.26 ("Patraṁ puṣhpaṁ phalaṁ toyam"), what is the essential quality that makes an offering acceptable to the Supreme?`;
    check_questionHindi = `गीता 9.26 ("पत्रं पुष्पं फलं तोयं...") के अनुसार भगवान को समर्पित भेंट में कौन सा तत्व अनिवार्य माना गया है?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'The sincere love, purity of heart, and devotion with which even the simplest item is offered.',
        textHindi: 'अंतःकरण का सच्चा प्रेम, निष्काम भाव और भक्ति, जिससे साधारण पत्र या पुष्प भी प्रभु स्वीकार करते हैं।'
      },
      {
        id: 'opt-2',
        text: 'The monetary cost and luxury value of the gift purchased in the marketplace.',
        textHindi: 'बाजार से खरीदी गई वस्तु की आर्थिक कीमत और भव्यता।'
      },
      {
        id: 'opt-3',
        text: 'The public applause of an audience watching the ceremony.',
        textHindi: 'अनुष्ठान को देख रहे जनसमूह की तालियाँ और वाहवाही।'
      },
      {
        id: 'opt-4',
        text: 'That the offering must be made exclusively in a private royal temple.',
        textHindi: 'कि भेंट केवल किसी शाही राजमहल के मंदिर में ही दी जानी चाहिए।'
      }
    ];

    check_feedback = `Correct. Krishna declares: "yo me bhaktyā prayacchati, tad ahaṁ bhakty-upahṛtam aśnāmi prayatātmanaḥ" (whoever offers Me with devotion, that offering of love from a pure soul I accept).`;
    check_feedbackHindi = `सही उत्तर। श्लोक 9.26 स्पष्ट करता है कि अनन्य भक्ति से अर्पित पत्र, पुष्प, फल या जल को भगवान प्रेमपूर्वक ग्रहण करते हैं।`;
  } else if (ch === 10) {
    // Vibhuti Yoga
    sectionA_text = `Krishna reveals His divine splendors (Vibhuti) sustaining all cosmic manifestation, declaring that He is the beginning, middle, and end of all beings, the brilliance in lights, the silence of secrets, and that whatever is glorious, beautiful, or mighty springs from a spark of His splendor (10.41).`;
    sectionA_textHindi = `श्री कृष्ण अपनी दिव्य विभूतियों का दर्शन कराते हैं: वे सब प्राणियों के आदि, मध्य और अंत हैं, ज्योतियों में सूर्य हैं, गुप्त भावों में मौन हैं, और संसार में जो कुछ भी ऐश्वर्ययुक्त, कांतियुक्त या शक्तिमान है, वह सब उनके तेज के अंश से उत्पन्न हुआ है (10.41)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 10 (Vibhuti Yoga / The Yoga of Divine Splendors).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 10 (विभूतियोग)—समस्त सृष्टि में ईश्वरीय ऐश्वर्य और उत्कृष्टता का दर्शन।`;

    sectionB_explanation = `Chapter 10 contains the famous "Chatushloki Gita" (10.8–10.11), where Krishna identifies Himself as the source of all existence ("Ahaṁ sarvasya prabhavo..."). Vibhuti Yoga teaches seekers to see divinity not in an abstract void, but vividly alive in every pinnacle of natural beauty, human wisdom, courageous heroism, and artistic genius.`;
    sectionB_explanationHindi = `अध्याय 10 में प्रसिद्ध "चतुःश्लोकी गीता" (10.8–11) समाहित है, जहाँ भगवान स्वयं को समस्त जगत का मूल कारण बताते हैं। विभूतियोग का रहस्य यह है कि संसार में जहाँ भी कोई श्रेष्ठता, सौंदर्य, प्रखर प्रतिभा या वीरता दिखे, उसे परमात्मा के दिव्य तेज की अभिव्यक्ति के रूप में देखा जाए।`;

    sectionC_title = `Recognizing Excellence as a Divine Gift`;
    sectionC_titleHindi = `उत्कृष्टता और प्रतिभा में ईश्वरीय तेज का दर्शन`;

    sectionC_scenario = `An artist, scientist, or musician marvels at an extraordinary masterpiece of nature or human achievement, feeling humble awe rather than jealous rivalry or proud arrogance.`;
    sectionC_scenarioHindi = `प्रकृति के अद्भुत सौंदर्य या किसी विद्वान की असाधारण प्रतिभा को देखकर व्यक्ति ईर्ष्या करने के बजाय विनम्रता से उस परमात्मा के तेज का अनुभव करता है।`;

    sectionC_connection = `Understanding 10.41 frees us from envy: when we see genius or goodness in others, we recognize it as an expression of universal divine brilliance, inspiring gratitude and reverence.`;
    sectionC_connectionHindi = `श्लोक 10.41 हमें ईर्ष्या से मुक्त करता है: दूसरों के सद्गुणों या सफलताओं में परमात्मा की कृपा देखकर मन में आदर और प्रेरणा का भाव जागता है।`;

    sectionD_takeaway = `Look upon every manifestation of beauty, truth, courage, and excellence as a radiant reflection of divine splendor.`;
    sectionD_takeawayHindi = `संसार में जहाँ भी सत्य, सौंदर्य, तेज और भलाई दिखे, उसे परमात्मा की दिव्य विभूति मानकर नमन करें।`;

    check_question = `In Gita 10.41 (Yad yad vibhūtimat sattvaṁ...), what does Krishna reveal regarding any entity endowed with glory, beauty, or power?`;
    check_questionHindi = `गीता 10.41 ("यद्यद्विभूतिमत्सत्त्वं...") में श्री कृष्ण किसी भी तेजस्वी, ऐश्वर्ययुक्त या बलवान प्राणी के विषय में क्या प्रकट करते हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'It is a manifestation born of a mere fraction of the Divine’s supreme splendor.',
        textHindi: 'वह परमात्मा के ही दिव्य तेज के एक अंश की अभिव्यक्ति है।'
      },
      {
        id: 'opt-2',
        text: 'It was created entirely by human ego independent of any natural or cosmic laws.',
        textHindi: 'वह ईश्वरीय नियमों से परे केवल मनुष्य के स्वतंत्र अहंकार से उत्पन्न हुआ है।'
      },
      {
        id: 'opt-3',
        text: 'It is inherently evil and should be shunned by all spiritual seekers.',
        textHindi: 'वह स्वभाव से ही दुष्ट है और साधकों को उससे घृणा करनी चाहिए।'
      },
      {
        id: 'opt-4',
        text: 'It signifies that the universe is governed solely by blind material accident.',
        textHindi: 'वह यह सिद्ध करता है कि संसार केवल अंधी भौतिक दुर्घटनाओं से संचालित है।'
      }
    ];

    check_feedback = `Correct. Gita 10.41 proclaims: "yad yad vibhūtimat sattvaṁ śrīmad ūrjitam eva vā, tat tad evāvagaccha tvaṁ mama tejo-'ṁśa-sambhavam".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 10.41: "यद्यद्विभूतिमत्सत्त्वं श्रीमदूर्जितमेव वा। तत्तदेवावगच्छ त्वं मम तेजोऽंशसम्भवम्॥"`;
  } else if (ch === 11) {
    if (v === 32) {
      sectionA_text = `In response to Arjuna's terrified inquiry, the Lord reveals His cosmic sovereignty: "I am Time, the destroyer of the worlds, engaged here in annihilating these hosts. Even without your participation, none of the warriors marshaled in the opposing ranks shall survive."`;
      sectionA_textHindi = `अर्जुन के विस्मय और भय से भरे प्रश्न पर भगवान अपनी विश्व-संहारिणी सत्ता प्रकट करते हैं: "मैं लोकों का नाश करने वाला बढ़ा हुआ महाकाल हूँ, जो इस समय इन सेनाओं का संहार करने में प्रवृत्त हुआ हूँ। तुम्हारे लड़े बिना भी विरोधी सेनाओं में खड़े ये समस्त योद्धा जीवित नहीं बचेंगे।"`;

      sectionA_context = `Speaker: Lord Krishna in His Cosmic Form (Vishwarupa). Setting: Kurukshetra, answering Arjuna’s inquiry "Who are You?" (Akhyahi me ko bhavan).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण (विश्वरूप में)। स्थान: कुरुक्षेत्र का मैदान—अर्जुन के प्रश्न "आप कौन हैं?" के उत्तर में काल रूप का प्रकटीकरण।`;

      sectionB_explanation = `Verse 11.32 ("Kālo 'smi loka-kṣaya-kṛt pravṛddho") is one of the most awe-inspiring declarations in world literature. Krishna reveals that cosmic destiny moves through relentless Time (Kala). Historical events unfold under divine purpose; human agency is called not to an arrogant sense of doership, but to become a conscious, righteous instrument (11.33: "Nimitta-mātraṁ bhava savya-sācin").`;
      sectionB_explanationHindi = `श्लोक 11.32 विश्व साहित्य का अत्यंत प्रभावशाली उद्घोष है: "कालोऽस्मि लोकक्षयकृत्प्रवृद्धो"। श्री कृष्ण बताते हैं कि काल की गति अनिवार्य है। अगले ही श्लोक (11.33) में वे अर्जुन को आज्ञा देते हैं: "निमित्तमात्रं भव सव्यसाचिन्"—अहंकार छोड़कर धर्म के इस महान कार्य में केवल निमित्त (माध्यम) बन जाओ।`;

      sectionC_title = `Becoming a Conscious Instrument of Purpose`;
      sectionC_titleHindi = `ईश्वरीय कार्य में निष्काम निमित्त बनना`;

      sectionC_scenario = `A doctor or disaster relief worker facing an overwhelming crisis realizes that while they cannot single-handedly control global mortality, they are called to step forward and serve faithfully as an instrument of healing.`;
      sectionC_scenarioHindi = `महामारी या संकट के समय कोई चिकित्सक यह समझता है कि संपूर्ण विश्व का कालचक्र उसके हाथ में नहीं है, किंतु अपने दायित्व को निष्ठा से निभाकर वह सेवा का पावन माध्यम बन सकता है।`;

      sectionC_connection = `Understanding 11.32–33 dissolves the paralyzing burden of thinking the entire outcome rests solely on our fragile shoulders; we act decisively with courage, knowing we are instruments of a higher purpose.`;
      sectionC_connectionHindi = `श्लोक 11.32-33 कर्तापन के भयानक बोझ से मुक्त करते हैं: परिणाम काल और ईश्वर के हाथ में है, हमारा कर्तव्य केवल सत्य और न्याय के पक्ष में समर्पित भाव से कर्म करना है।`;

      sectionD_takeaway = `Recognize the sovereign movement of Time and destiny, and dedicate yourself with courage to act as a pure, selfless instrument of righteousness.`;
      sectionD_takeawayHindi = `काल के अटल विधान को समझकर अहंकार का त्याग करें और धर्म व सत्य के मार्ग पर निष्काम निमित्त बनकर कर्म करें।`;

      check_question = `In Gita 11.32 ("Kālo 'smi loka-kṣaya-kṛt pravṛddho"), how does Krishna describe Himself to Arjuna, and what is the consequence?`;
      check_questionHindi = `गीता 11.32 में भगवान श्री कृष्ण अर्जुन के समक्ष स्वयं का क्या परिचय देते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'He reveals Himself as all-destroying Time, declaring that the warriors are already marked by destiny and urging Arjuna to be His instrument.',
          textHindi: 'वे स्वयं को लोकों का संहार करने वाला महाकाल बताते हैं और स्पष्ट करते हैं कि ये योद्धा काल द्वारा पहले ही मारे जा चुके हैं, अतः अर्जुन निमित्त मात्र बने।'
        },
        {
          id: 'opt-2',
          text: 'He states He is a mortal soldier who will fight in the frontline alongside Arjuna.',
          textHindi: 'वे कहते हैं कि वे केवल एक सामान्य सैनिक हैं जो अर्जुन के साथ अग्रिम पंक्ति में लड़ेंगे।'
        },
        {
          id: 'opt-3',
          text: 'He announces that all physical conflict in the universe has been permanently cancelled.',
          textHindi: 'वे घोषणा करते हैं कि संसार से सारे युद्ध और संघर्ष सदा के लिए समाप्त कर दिए गए हैं।'
        },
        {
          id: 'opt-4',
          text: 'He instructs Arjuna to immediately crown Duryodhana king of Hastinapura.',
          textHindi: 'वे अर्जुन को आदेश देते हैं कि तत्काल दुर्योधन को हस्तिनापुर का राजा बना दिया जाए।'
        }
      ];

      check_feedback = `Correct. Shloka 11.32 declares: "kālo 'smi loka-kṣaya-kṛt pravṛddho lokān samāhartum iha pravṛttaḥ" (I am Time, the destroyer of worlds, arrived here to annihilate).`;
      check_feedbackHindi = `सही उत्तर। श्लोक 11.32 का स्पष्ट कथन है: "कालोऽस्मि लोकक्षयकृत्प्रवृद्धो लोकान्समाहर्तुमिह प्रवृत्तः।"`;
    } else {
      sectionA_text = `Upon Arjuna's prayer, Krishna reveals His awesome, all-encompassing Cosmic Form (Vishwarupa)—with countless faces, eyes, and splendors brighter than a thousand suns, containing the entire cosmos moving within Him.`;
      sectionA_textHindi = `अर्जुन की प्रार्थना पर भगवान श्री कृष्ण अपना अलौकिक विश्वरूप प्रकट करते हैं—सहस्रों मुखों, नेत्रों और सहस्र सूर्यों से भी अधिक तेजस्वी स्वरूप, जिसमें संपूर्ण ब्रह्मांड एक ही स्थान पर गतिशील दिखाई देता है।`;

      sectionA_context = `Speaker: Sanjaya and Arjuna describing the Vishwarupa. Setting: Chapter 11 (Vishwarupa Darshana Yoga / The Vision of the Cosmic Form).`;
      sectionA_contextHindi = `वक्ता: संजय और अर्जुन (विश्वरूप का वर्णन करते हुए)। स्थान: अध्याय 11 (विश्वरूपदर्शनयोग)—ब्रह्मांडीय ऐश्वर्य का प्रत्यक्ष साक्षात्कार।`;

      sectionB_explanation = `The Vishwarupa tears away all limited, anthropomorphic conceptions of the Divine. Arjuna witnesses both the tender creation and the terrifying destruction of worlds simultaneously. Overwhelmed by awe, his hair stands on end and his hands fold in reverence. This cosmic vision shifts human consciousness from petty personal egoism to humble reverence before the infinite majesty of existence.`;
      sectionB_explanationHindi = `विश्वरूप दर्शन ईश्वर के विषय में मनुष्य की संकुचित धारणाओं को तोड़ता है। अर्जुन एक साथ सृष्टि और संहार के विराट चक्र को देखते हैं। भय और विस्मय से भरकर वे हाथ जोड़कर स्तुति करते हैं। यह दर्शन क्षुद्र अहंकार को मिटाकर अनंत सत्ता के सम्मुख पूर्ण समर्पण की प्रेरणा देता है।`;

      sectionC_title = `Cultivating Humility Before the Vastness of Existence`;
      sectionC_titleHindi = `अनंत सृष्टि के सम्मुख अहंकार की विदाई और विनम्रता`;

      sectionC_scenario = `An astronomer or hiker gazes into the deep starry night sky, experiencing a profound sense of wonder and humility that puts all personal petty grievances into perspective.`;
      sectionC_scenarioHindi = `तारों भरे विशाल आकाश को देखकर खगोलशास्त्री या साधारण व्यक्ति अपने क्षुद्र स्वार्थों और चिंताओं की तुच्छता को अनुभव कर गहरी शांति पाता है।`;

      sectionC_connection = `Just as the Cosmic Form revealed to Arjuna that the universe is infinitely larger than his individual perspective, contemplation of the vast cosmos cures arrogance and inspires humble reverence.`;
      sectionC_connectionHindi = `जैसे विश्वरूप ने अर्जुन को ब्रह्मांड की विराटता का बोध कराया, वैसे ही प्रकृति के असीम विस्तार का चिंतन मनुष्य के घमंड को समाप्त कर नम्र बनाता है।`;

      sectionD_takeaway = `Bow your limited ego before the infinite majesty of the universe, anchoring your actions in awe, reverence, and cosmic responsibility.`;
      sectionD_takeawayHindi = `संसार की विराट सत्ता के सम्मुख अपने अहंकार को समर्पित करें और जीवन में विनम्रता तथा पवित्रता धारण करें।`;

      check_question = `What psychological transformation does the revelation of the Cosmic Form (Vishwarupa) produce in Arjuna?`;
      check_questionHindi = `विश्वरूप दर्शन से अर्जुन के अंतःकरण में कौन सा गहरा परिवर्तन आता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Overwhelming awe, humility, and the dissolution of petty personal egoism before the infinite grandeur of the Divine.',
          textHindi: 'परमात्मा के असीम ऐश्वर्य के सम्मुख अगाध विस्मय, नतमस्तक विनम्रता और व्यक्तिगत अहंकार का विसर्जन।'
        },
        {
          id: 'opt-2',
          text: 'Arrogant pride that he has conquered the universe with his military skills.',
          textHindi: 'यह घमंड कि उसने अपनी सैन्य शक्ति से पूरे ब्रह्मांड को जीत लिया है।'
        },
        {
          id: 'opt-3',
          text: 'Boredom and indifference to the spiritual nature of reality.',
          textHindi: 'आध्यात्मिक सत्य के प्रति उदासीनता और ऊब।'
        },
        {
          id: 'opt-4',
          text: 'Anger that the universe contains challenges and transformations.',
          textHindi: 'इस बात पर क्रोध कि संसार में परिवर्तन और चुनौतियाँ क्यों हैं।'
        }
      ];

      check_feedback = `Correct. Arjuna’s vision of the Cosmic Form shattered his remaining intellectual pride, bringing him into profound awe and heartfelt reverence.`;
      check_feedbackHindi = `सही उत्तर। विश्वरूप के प्रत्यक्ष दर्शन ने अर्जुन के मन के संशय और दर्प को मिटाकर उन्हें असीम श्रद्धा और विस्मय से भर दिया।`;
    }
  } else if (ch === 12) {
    if (v === 13) {
      sectionA_text = `Krishna defines the virtues of the devotee dearest to Him: "One who harbors no malice toward any living being, who is friendly and compassionate, free from possessiveness and egoism, even-minded in joy and sorrow, and patient and forgiving."`;
      sectionA_textHindi = `श्री कृष्ण अपने परम प्रिय भक्त के पावन लक्षण बताते हैं: "जो किसी भी प्राणी से द्वेष नहीं करता, सबके प्रति मित्रभाव और करुणा रखता है, ममता और अहंकार से रहित है, सुख और दुःख में सम रहता है, और क्षमाशील है।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 12 (Bhakti Yoga), establishing moral and psychological virtues as the true signature of devotion.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 12 (भक्तियोग)—सद्गुणों से युक्त आदर्श भक्त के लक्षण।`;

      sectionB_explanation = `Verse 12.13 ("Adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca") establishes that genuine devotion (Bhakti) is verified by ethical conduct toward all living creatures, not by mere outer ritualism. "Adveṣṭā" means complete absence of ill-will; "maitraḥ" is active goodwill; "karuṇaḥ" is empathy for the suffering of others; "nirmamaḥ" is freedom from possessiveness; and "nirahaṅkāraḥ" is freedom from vanity.`;
      sectionB_explanationHindi = `श्लोक 12.13 स्पष्ट करता है कि सच्ची भक्ति बाहरी दिखावे में नहीं, बल्कि आचरण की पवित्रता में है। 'अद्वेष्टा' का अर्थ है किसी से वैर न रखना; 'मैत्र' सबके प्रति मैत्री; 'करुण' दीनों पर दया; 'निर्मम' ममता-रहित; और 'निरहंकार' घमंड से शून्य होना। यही लक्षण भक्त को प्रभु का प्रिय बनाते हैं।`;

      sectionC_title = `Living Active Compassion and Good Faith`;
      sectionC_titleHindi = `सहानुभूति, क्षमा और अहंकार-शून्यता का आचरण`;

      sectionC_scenario = `A community leader or workplace mentor treats every team member with empathy, forgives honest mistakes, shares credit generously, and refuses to harbor petty grudges against critics.`;
      sectionC_scenarioHindi = `कोई अधिकारी या शिक्षक दूसरों की भूलों को क्षमा करता है, सफलता का श्रेय सबको देता है और आलोचना करने वालों से भी द्वेष रखे बिना सद्भाव से मिलता है।`;

      sectionC_connection = `By replacing malice with friendliness and arrogance with compassion, we embody the qualities of Gita 12.13 in our daily family, educational, and professional relationships.`;
      sectionC_connectionHindi = `द्वेष को त्यागकर मित्रता और ममता को त्यागकर समता अपनाना ही गीता 12.13 का व्यावहारिक जीवन में सच्चा अनुष्ठान है।`;

      sectionD_takeaway = `True devotion blossoms as universal friendliness, active compassion, freedom from egoism, and steady forgiveness.`;
      sectionD_takeawayHindi = `सच्ची भक्ति बाह्य आडंबरों में नहीं, बल्कि प्राणिमात्र के प्रति करुणा, निरहंकारिता, समभाव और क्षमा में प्रकट होती है।`;

      check_question = `In Gita 12.13 ("Adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca"), what core virtues make a seeker dear to Krishna?`;
      check_questionHindi = `गीता 12.13 ("अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च...") में सच्चे भक्त के किन लक्षणों को रेखांकित किया गया है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Freedom from malice toward all beings, friendliness, compassion, freedom from possessiveness and ego, and equanimity in pleasure and pain.',
          textHindi: 'समस्त प्राणियों के प्रति द्वेष का अभाव, मित्रता, करुणा, ममता और अहंकार से मुक्ति, तथा सुख-दुःख में समभाव।'
        },
        {
          id: 'opt-2',
          text: 'The ability to debate theology aggressively and defeat opponents in public.',
          textHindi: 'कठोर शास्त्रार्थ करके वाद-विवाद में दूसरों को पराजित करने का सामर्थ्य।'
        },
        {
          id: 'opt-3',
          text: 'Displaying massive wealth and spending on lavish social festivities.',
          textHindi: 'विपुल धन का प्रदर्शन और केवल भव्य उत्सवों का आयोजन।'
        },
        {
          id: 'opt-4',
          text: 'Isolating oneself permanently from all social interaction and responsibility.',
          textHindi: 'समाज और सभी जिम्मेदारियों से हमेशा के लिए मुँह मोड़ लेना।'
        }
      ];

      check_feedback = `Correct. Gita 12.13 highlights: "adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca, nirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī".`;
      check_feedbackHindi = `सही उत्तर। श्लोक 12.13 में स्पष्ट कहा गया है: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥"`;
    } else {
      sectionA_text = `Krishna answers Arjuna's inquiry regarding which path is superior—worship of the personal Divine or meditation on the unmanifest Absolute—and outlines the graduated steps of Bhakti Yoga: from absorption of mind, to the practice of yoga, to dedicated selfless work, and finally renunciation of the fruits of action (12.11-12).`;
      sectionA_textHindi = `श्री कृष्ण सगुण और निर्गुण उपासना के प्रश्न का समाधान करते हैं और भक्तियोग के क्रमिक सोपान बताते हैं: मन को मुझमें लगाना, अभ्यास द्वारा चित्त को एकाग्र करना, भगवदर्थ कर्म करना, और अंततः कर्मफल का त्याग करना (12.11-12)।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 12 (Bhakti Yoga / The Yoga of Devotion).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 12 (भक्तियोग)—सगुण-निर्गुण उपासना और भक्ति के व्यावहारिक सोपान।`;

      sectionB_explanation = `Krishna notes that meditation on the formless unmanifest is difficult for embodied souls. He provides practical, graduated alternatives: if one cannot steadily fix the mind, practice concentration (Abhyasa-yoga); if that is too hard, perform duty for the sake of the Divine; if even that is difficult, take refuge in surrendering the fruits of all actions (Sarva-karma-phala-tyaga), which immediately yields peace (12.12).`;
      sectionB_explanationHindi = `भगवान स्पष्ट करते हैं कि देहधारियों के लिए अव्यक्त का ध्यान अत्यंत क्लेशदायक है। इसलिए वे व्यावहारिक मार्ग देते हैं: यदि मन स्थिर न हो तो अभ्यास करो; अभ्यास कठिन लगे तो प्रभु के लिए कर्म करो; यदि वह भी न बने तो सब कर्मों के फल की आसक्ति त्याग दो। कर्मफल-त्याग से तत्काल परम शांति प्राप्त होती है (12.12)।`;

      sectionC_title = `Meeting Yourself Where You Are on the Path`;
      sectionC_titleHindi = `अपनी वर्तमान क्षमता के अनुसार क्रमिक प्रगति`;

      sectionC_scenario = `A student struggling to establish a daily study habit starts with small manageable goals, gradually building up consistency rather than getting discouraged by an impossible standard.`;
      sectionC_scenarioHindi = `विद्यार्थी या साधक अपनी वास्तविक स्थिति को पहचानकर धीरे-धीरे अनुशासन बढ़ाता है, किसी असंभव लक्ष्य के दबाव में निराश नहीं होता।`;

      sectionC_connection = `Krishna’s graduated path in 12.8–12 shows immense psychological wisdom: start where you are capable, applying renunciation of anxiety over outcomes to immediately find mental calm.`;
      sectionC_connectionHindi = `गीता 12.8-12 का उपदेश सिखाता है कि आध्यात्मिक विकास क्रमिक है; जहाँ तक संभव हो प्रयास करें और फल की चिंता छोड़कर चित्त को शांत रखें।`;

      sectionD_takeaway = `Progress steadily through graduated spiritual practices, knowing that letting go of obsessive anxiety over outcomes brings immediate inner peace.`;
      sectionD_takeawayHindi = `धैर्यपूर्वक क्रमिक अभ्यास द्वारा आगे बढ़ें; कर्मफल की आसक्ति का त्याग तत्काल आंतरिक शांति प्रदान करता है।`;

      check_question = `In Gita 12.12, what practice is praised for immediately bringing deep inner peace (Shanti)?`;
      check_questionHindi = `गीता 12.12 में तत्काल शांति प्रदान करने वाला कौन सा साधन बताया गया है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Renunciation of attachment to the fruits of action (Tyaga).',
          textHindi: 'समस्त कर्मफलों की आसक्ति का त्याग (त्याग)।'
        },
        {
          id: 'opt-2',
          text: 'Accumulating theoretical books without ever practicing.',
          textHindi: 'बिना अभ्यास किए केवल सैद्धांतिक पुस्तकों का ढेर लगाना।'
        },
        {
          id: 'opt-3',
          text: 'Criticizing others who follow different philosophical paths.',
          textHindi: 'अन्य मार्गों पर चलने वालों की कटु आलोचना करना।'
        },
        {
          id: 'opt-4',
          text: 'Constantly changing spiritual traditions every week.',
          textHindi: 'हर सप्ताह अपनी मान्यताओं और पद्धतियों को बदलते रहना।'
        }
      ];

      check_feedback = `Correct. Shloka 12.12 proclaims: "śreyo hi jñānam abhyāsāj jñānād dhyānaṁ viśiṣyate, dhyānāt karma-phala-tyāgas tyāgāc chāntir anantaram".`;
      check_feedbackHindi = `सही उत्तर। श्लोक 12.12: "ध्यानात्कर्मफलत्यागस्त्यागाच्छान्तिरनन्तरम्।"`;
    }
  } else if (ch === 13) {
    // Kshetra Kshetrajna Vibhaga Yoga
    sectionA_text = `Krishna distinguishes the Field (Kshetra: the physical body, senses, mind, ego, and material emotions) from the Knower of the Field (Kshetrajna: the witnessing consciousness), and enumerates the twenty virtues of true knowledge (13.7-11), including humility, non-violence, purity, and steadfastness.`;
    sectionA_textHindi = `श्री कृष्ण क्षेत्र (शरीर, इंद्रियाँ, मन, बुद्धि, अहंकार और विकार) तथा क्षेत्रज्ञ (नित्य साक्षी चेतन आत्मा) का विवेक समझाते हैं, और ज्ञान के बीस दिव्य सद्गुणों (13.7-11) का निरूपण करते हैं—जैसे अमानित्व, अदम्भित्व, अहिंसा, क्षमा और शुचिता।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 13 (Kshetra Kshetrajna Vibhaga Yoga / The Yoga of the Field and its Knower).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 13 (क्षेत्रक्षेत्रज्ञविभागयोग)—शरीर और साक्षी आत्मा का तत्व-ज्ञान।`;

    sectionB_explanation = `This chapter forms the cornerstone of Vedanta philosophy. The body-mind apparatus is the objective "field" of observation, subject to birth, decay, and mood swings. The Atman is the unchanging conscious witness ("Kshetrajna"). In verses 13.7–11, Krishna defines "knowledge" not as intellectual information, but as transformative character: freedom from vanity (Amanitvam), sincerity (Adambhitvam), and non-violence (Ahimsa).`;
    sectionB_explanationHindi = `अध्याय 13 वेदांत का आधार है। शरीर और मन परिवर्तनशील 'क्षेत्र' हैं जो प्रकृति के अधीन हैं; आत्मा वह अपरिवर्तनीय 'क्षेत्रज्ञ' है जो सबका ज्ञाता और साक्षी है। श्लोक 13.7-11 में ज्ञान की परिभाषा पुस्तकीय जानकारी नहीं, बल्कि अंतःकरण के सद्गुण हैं: मान-बड़ाई की चाह न होना (अमानित्व), पाखंड से रहित होना (अदम्भित्व), और अहिंसा।`;

    sectionC_title = `Observing Your Emotions Without Being Defined by Them`;
    sectionC_titleHindi = `मनोभावों का साक्षी भाव से अवलोकन`;

    sectionC_scenario = `A professional feeling sudden irritation or sadness during a meeting pauses, recognizes the emotion as a temporary wave passing through their psychological field, and responds calmly without acting out rashly.`;
    sectionC_scenarioHindi = `क्रोध या चिंता आने पर व्यक्ति यह स्मरण करता है कि यह भाव मन में उठी लहर (क्षेत्र) है, मेरी चेतना (क्षेत्रज्ञ) इससे परे और शांत है; इसलिए वह आवेग में निर्णय नहीं लेता।`;

    sectionC_connection = `By distinguishing between the "field" (thoughts, emotions, body) and the "knower" (conscious awareness), we avoid being swept away by reactive impulses, gaining emotional mastery and wisdom.`;
    sectionC_connectionHindi = `शरीर और मन को 'क्षेत्र' तथा स्वयं को 'साक्षी क्षेत्रज्ञ' जानने से हम क्षणिक उत्तेजनाओं से मुक्त होकर आत्म-नियंत्रण और विवेक में स्थित रहते हैं।`;

    sectionD_takeaway = `You are the conscious, witnessing observer of your body and mind, fundamentally distinct from temporary mental states and physical sensations.`;
    sectionD_takeawayHindi = `आप अपने शरीर और मन के साक्षी चेतन आत्मा (क्षेत्रज्ञ) हैं; क्षणिक विकारों और भावनाओं से स्वयं को अप्रभावित रखें।`;

    check_question = `In Gita Chapter 13, how does Krishna define the difference between the Field (Kshetra) and the Knower of the Field (Kshetrajna)?`;
    check_questionHindi = `गीता अध्याय 13 के अनुसार श्री कृष्ण क्षेत्र और क्षेत्रज्ञ का क्या भेद स्पष्ट करते हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'The Kshetra is the changing body, mind, and psycho-physical apparatus, while the Kshetrajna is the unchanging, conscious witnessing observer within.',
        textHindi: 'क्षेत्र यह परिवर्तनशील शरीर, मन और विकार हैं, जबकि क्षेत्रज्ञ इन सबका नित्य और अचल साक्षी चेतन आत्मा है।'
      },
      {
        id: 'opt-2',
        text: 'The Kshetra and Kshetrajna are completely identical physical muscles.',
        textHindi: 'क्षेत्र और क्षेत्रज्ञ दोनों शरीर की मांसपेशियों के ही दो अलग नाम हैं।'
      },
      {
        id: 'opt-3',
        text: 'The Kshetra is immortal and the Kshetrajna is destroyed at physical birth.',
        textHindi: 'क्षेत्र अमर होता है और क्षेत्रज्ञ का जन्म के समय ही नाश हो जाता है।'
      },
      {
        id: 'opt-4',
        text: 'Only professional agricultural farmers can understand Kshetra and Kshetrajna.',
        textHindi: 'केवल खेती करने वाले किसान ही क्षेत्र और क्षेत्रज्ञ को समझ सकते हैं।'
      }
    ];

    check_feedback = `Correct. Gita 13.1–2 establishes: "idaṁ śarīraṁ kaunteya kṣetram ity abhidhīyate, etad yo vetti taṁ prāhuḥ kṣetrajña iti tad-vidaḥ".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 13.1: "इदं शरीरं कौन्तेय क्षेत्रमित्यभिधीयते। एतद्यो वेत्ति तं प्राहुः क्षेत्रज्ञ इति तद्विदः॥"`;
  } else if (ch === 14) {
    if (v === 5) {
      sectionA_text = `Krishna reveals the three fundamental modes of material nature: "Sattva, Rajas, and Tamas—these three Gunas born of material nature (Prakriti) bind the imperishable soul to the body, O mighty-armed Arjuna."`;
      sectionA_textHindi = `श्री कृष्ण प्रकृति के तीनों गुणों का रहस्य प्रकट करते हैं: "हे महाबाहो अर्जुन! सत्त्व, रज और तम—प्रकृति से उत्पन्न ये तीनों गुण अविनाशी जीवात्मा को शरीर में बांधते हैं।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 14 (Gunatraya Vibhaga Yoga / The Yoga of the Three Modes of Nature).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 14 (गुणत्रयविभागयोग)—तीनों गुणों के बंधन का उद्घाटन।`;

      sectionB_explanation = `Verse 14.5 ("Sattvaṁ rajas tama iti guṇāḥ prakṛti-sambhavāḥ") introduces the psychological foundation of Vedic science. Every thought, mood, and action in human life is a mixture of these three primary forces: Sattva (clarity, harmony, illumination, peace), Rajas (passion, restless ambition, craving, agitation), and Tamas (inertia, sloth, confusion, ignorance). Liberation involves transcending all three.`;
      sectionB_explanationHindi = `श्लोक 14.5 मानव मनोविज्ञान का शाश्वत सूत्र है। अंतःकरण की प्रत्येक वृत्ति तीन गुणों के मिश्रण से चलती है: सत्त्व (प्रकाश, ज्ञान, शांति), रजस् (राग, तृष्णा, अशांत सक्रियता), और तमस् (आलस्य, प्रमाद, अज्ञान)। साधना का चरम लक्ष्य इन तीनों गुणों से परे होकर 'गुणातीत' बनना है।`;

      sectionC_title = `Diagnosing Your Mental States Through the Three Gunas`;
      sectionC_titleHindi = `तीनों गुणों की कसौटी पर अपनी मानसिक वृत्तियों की पहचान`;

      sectionC_scenario = `An individual waking up feels heavy, unmotivated, and wanting to procrastinate in bed (Tamas). Rather than despairing, they get up and take a brisk walk to activate physical energy (Rajas), followed by quiet reading to restore calm clarity (Sattva).`;
      sectionC_scenarioHindi = `सुबह उठते ही आलस्य और काम टालने की वृत्ति (तमस्) देखकर व्यक्ति व्यायाम और सक्रियता (रजस्) से गति लाता है, फिर शांत अध्ययन और ध्यान द्वारा चित्त को सात्त्विक बनाता है।`;

      sectionC_connection = `Understanding the three Gunas provides a practical diagnostic toolkit: when Tamas clouds the mind, apply active energy; when Rajas agitates the nerves, apply contemplation to return to Sattvic balance.`;
      sectionC_connectionHindi = `तीनों गुणों की समझ मन को साधने का व्यावहारिक साधन है: तमस् को रजस् के पुरुषार्थ से जीतें और रजस् की व्यग्रता को सत्त्वगुण के विवेक से शांत करें।`;

      sectionD_takeaway = `Observe the play of Sattva, Rajas, and Tamas in your daily moods, and consciously elevate your mind toward clarity, peace, and transcendence.`;
      sectionD_takeawayHindi = `अपने विचारों में तीनों गुणों के प्रभाव को पहचानें और अपने आचरण को सत्त्व तथा गुणातीत शांति की ओर ले जाएँ।`;

      check_question = `In Gita 14.5, what are the three modes (Gunas) born of Prakriti that bind the embodied soul?`;
      check_questionHindi = `गीता 14.5 के अनुसार प्रकृति से उत्पन्न कौन से तीन गुण जीवात्मा को देह में बांधते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Sattva (purity and light), Rajas (passion and craving), and Tamas (darkness and inertia).',
          textHindi: 'सत्त्व (निर्मलता और प्रकाश), रजस् (राग और तृष्णा), और तमस् (अज्ञान और प्रमाद)।'
        },
        {
          id: 'opt-2',
          text: 'Gold, silver, and copper.',
          textHindi: 'सोना, चाँदी और ताँबा।'
        },
        {
          id: 'opt-3',
          text: 'Waking, dreaming, and deep sleep only as physical organs.',
          textHindi: 'केवल शारीरिक अंगों के रूप में जाग्रत, स्वप्न और सुषुप्ति।'
        },
        {
          id: 'opt-4',
          text: 'Past, present, and future historical calendars.',
          textHindi: 'भूत, वर्तमान और भविष्य के पंचांग।'
        }
      ];

      check_feedback = `Correct. Shloka 14.5 explicitly states: "sattvaṁ rajas tama iti guṇāḥ prakṛti-sambhavāḥ, nibadhnanti mahā-bāho dehe dehinam avyayam".`;
      check_feedbackHindi = `सही उत्तर। श्लोक 14.5: "सत्त्वं रजस्तम इति गुणाः प्रकृतिसम्भवाः। निबध्नन्ति महाबाहो देहे देहिनमव्ययम्॥"`;
    } else {
      sectionA_text = `Krishna analyzes how the three modes operate: Sattva binds through attachment to happiness and knowledge; Rajas through passion, craving, and feverish action; and Tamas through negligence, indolence, and sleep. He describes the state of the Gunatita (one who has transcended the modes, 14.22-25).`;
      sectionA_textHindi = `श्री कृष्ण समझाते हैं कि तीनों गुण कैसे बांधते हैं: सत्त्व सुख और ज्ञान की आसक्ति से, रजस् तृष्णा और सकाम कर्म से, और तमस् प्रमाद, आलस्य तथा निद्रा से। अंत में वे तीनों गुणों से अतीत (गुणातीत) पुरुष के दिव्य लक्षणों (14.22-25) का वर्णन करते हैं।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 14 (Gunatraya Vibhaga Yoga).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 14 (गुणत्रयविभागयोग)—गुणों का कार्य और गुणातीत की स्थिति।`;

      sectionB_explanation = `Spiritual evolution proceeds from Tamas to Rajas, from Rajas to Sattva, and ultimately transcending all three Gunas to dwell in the pure witness consciousness. A Gunatita person does not hate the presence of clarity, passion, or delusion, nor does he crave them when they cease; he remains poised as an unperturbed witness ("Udāsīna-vad āsīno").`;
      sectionB_explanationHindi = `आध्यात्मिक विकास तमस् से रजस्, रजस् से सत्त्व और अंत में तीनों गुणों के अतिक्रमण की यात्रा है। गुणातीत पुरुष न प्रकाश के आने पर प्रसन्न होता है और न हटने पर दुःखी; वह साक्षी भाव से उदासीन रहकर सुख-दुःख, निंदा-स्तुति और मान-अपमान में सदा सम रहता है ("उदासीनवदासीनो")।`;

      sectionC_title = `Transcending Mood Swings into Steady Composure`;
      sectionC_titleHindi = `भावनात्मक उतार-चढ़ाव से परे स्थितप्रज्ञ शांति`;

      sectionC_scenario = `A person experiences a flurry of praises one day and harsh criticism the next, but observes both experiences without becoming inflated with pride or crushed by despair.`;
      sectionC_scenarioHindi = `सफलता में वाहवाही मिलने पर अहंकार न करना और विफलता में निंदा होने पर न टूटना, बल्कि दोनों में समान रहकर अपने कर्तव्य पर डटे रहना।`;

      sectionC_connection = `Practicing the Gunatita attitude frees us from being puppets of our internal mood swings and external circumstances, anchoring life in permanent inner peace.`;
      sectionC_connectionHindi = `गुणातीत दृष्टि जीवन को परिस्थितियों की कठपुतली बनने से बचाती है और अंतःकरण में अविचल शांति प्रदान करती है।`;

      sectionD_takeaway = `Cultivate Sattvic clarity in your habits, and ultimately rest in the unchanging witness consciousness that transcends all three modes.`;
      sectionD_takeawayHindi = `सत्त्वगुण को अपनी दिनचर्या में बढ़ाएँ और अंततः तीनों गुणों के साक्षी बनकर अखंड शांति में स्थित हों।`;

      check_question = `According to Gita 14.22–14.25, how does a person who has transcended the three Gunas (Gunatita) react to life's circumstances?`;
      check_questionHindi = `गीता 14.22–14.25 के अनुसार तीनों गुणों से परे (गुणातीत) पुरुष जीवन की परिस्थितियों में कैसा व्यवहार करता है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'He remains poised as an unperturbed witness, balanced in pleasure and pain, equal to praise and blame, neither hating the arrival of the Gunas nor craving them.',
          textHindi: 'वह साक्षी की भाँति स्थित रहता है, सुख-दुःख में सम, मान-अपमान और निंदा-स्तुति में अविचल, तथा गुणों की हलचलों से अप्रभावित रहता है।'
        },
        {
          id: 'opt-2',
          text: 'He aggressively retaliates against anyone who causes him discomfort.',
          textHindi: 'वह कष्ट देने वाले हर व्यक्ति पर तत्काल हिंसक आक्रमण करता है।'
        },
        {
          id: 'opt-3',
          text: 'He becomes physically unconscious and unable to speak.',
          textHindi: 'वह शारीरिक रूप से मूर्छित होकर बोलने में असमर्थ हो जाता है।'
        },
        {
          id: 'opt-4',
          text: 'He spends all his time complaining about how difficult life is.',
          textHindi: 'वह दिन-रात जीवन की कठिनाइयों का रोना रोता रहता है।'
        }
      ];

      check_feedback = `Correct. Chapter 14 details that the Gunatita remains seated like a neutral witness ("udāsīna-vad āsīno guṇair yo na vicālyate").`;
      check_feedbackHindi = `सही उत्तर। श्लोक 14.23: "उदासीनवदासीनो गुणैर्यो न विचाल्यते।"`;
    }
  } else if (ch === 15) {
    // Purushottama Yoga
    sectionA_text = `Krishna describes the cosmic tree of material existence (Ashvattha)—with roots above in the unmanifest and branches below—and instructs that its deep attachments must be severed with the strong weapon of detachment (Asanga-shastra, 15.3), revealing the Supreme Divine Person (Purushottama, 15.18).`;
    sectionA_textHindi = `श्री कृष्ण संसार रूपी अश्वत्थ वृक्ष का रूपक समझाते हैं—जिसकी जड़ें ऊपर परमात्मा में हैं और शाखाएँ नीचे संसार में फैली हैं। वे वैराग्य रूपी दृढ़ शस्त्र से इसकी आसक्तियों को काटने का उपदेश देते हैं (15.3), और क्षर तथा अक्षर से परे परम पुरुषोत्तम तत्व को प्रकट करते हैं (15.18)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 15 (Purushottama Yoga / The Yoga of the Supreme Divine Personality).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 15 (पुरुषोत्तमयोग)—अश्वत्थ वृक्ष का रहस्य और पुरुषोत्तम तत्व।`;

    sectionB_explanation = `The inverted Ashvattha tree symbolizes the complex web of sensory desires and karmic entanglements. It cannot be untangled by intellectual hairsplitting; it must be cut down with the axe of dispassion ("Asaṅga-śastreṇa dṛḍhena chittvā"). In 15.15, Krishna declares that He resides in the hearts of all beings, from whom come memory, knowledge, and their absence. He is Purushottama, supreme beyond both perishable matter (Kshara) and imperishable soul (Akshara).`;
    sectionB_explanationHindi = `उलटा अश्वत्थ वृक्ष संसार की जटिल वासनाओं और कर्म-बंधनों का प्रतीक है। इसे केवल तर्कों से नहीं सुलझाया जा सकता, बल्कि वैराग्य की दृढ़ कुल्हाड़ी ("असङ्गशस्त्रेण दृढेन छित्त्वा") से ही काटा जा सकता है। श्लोक 15.15 में वे कहते हैं कि मैं ही सबके हृदय में स्थित हूँ और मुझसे ही स्मृति, ज्ञान और अपोहन (भूलना) होते हैं। वे नश्वर प्रकृति और अविनाशी आत्मा दोनों से परे पुरुषोत्तम हैं।`;

    sectionC_title = `Cutting Attachment with the Tool of Non-Attachment`;
    sectionC_titleHindi = `आसक्ति के बंधनों को वैराग्य से काटना`;

    sectionC_scenario = `A person overwhelmed by compulsive habits, toxic relationships, or material consumerism makes a decisive, clean break by eliminating unnecessary clutter and refocusing on what truly matters.`;
    sectionC_scenarioHindi = `भौतिक वस्तुओं के संचय या व्यसनों में उलझा व्यक्ति एक दृढ़ संकल्प लेकर अनावश्यक प्रलोभनों का त्याग करता है और सादा व सार्थक जीवन चुनता है।`;

    sectionC_connection = `Just as Krishna advises cutting the deep roots of the cosmic tree with the axe of detachment, resolving life’s complex entanglements requires the decisive courage to let go of toxic attachments.`;
    sectionC_connectionHindi = `जैसे अश्वत्थ वृक्ष को वैराग्य रूपी शस्त्र से काटने का निर्देश है, वैसे ही जीवन के व्यर्थ प्रपंचों से मुक्ति दृढ़ त्याग और सादगी से ही संभव है।`;

    sectionD_takeaway = `Sever the entangling roots of selfish craving with the firm weapon of non-attachment, seeking refuge in the supreme consciousness residing in your heart.`;
    sectionD_takeawayHindi = `दृढ़ वैराग्य द्वारा आसक्तियों के बंधनों को काटें और अपने हृदय में विराजमान परम पुरुषोत्तम की शरण लें।`;

    check_question = `In Gita 15.1–15.3, with what instrument does Krishna instruct the seeker to cut down the deep-rooted tree of worldly entanglements (Ashvattha)?`;
    check_questionHindi = `गीता 15.1–15.3 में संसार रूपी सुदृढ़ अश्वत्थ वृक्ष को किस शस्त्र से काटने की आज्ञा दी गई है?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'With the formidable weapon of firm detachment and dispassion (Asanga-shastra).',
        textHindi: 'दृढ़ वैराग्य और अनासक्ति रूपी अस्त्र (असङ्ग-शस्त्र) द्वारा।'
      },
      {
        id: 'opt-2',
        text: 'With sharp physical iron axes in a forest.',
        textHindi: 'जंगल में जाकर लोहे की कुल्हाड़ियों द्वारा।'
      },
      {
        id: 'opt-3',
        text: 'By endlessly feeding desires so the tree becomes overloaded.',
        textHindi: 'इच्छाओं को और अधिक बढ़ाकर ताकि वृक्ष स्वयं टूट जाए।'
      },
      {
        id: 'opt-4',
        text: 'With magical spells purchased from vendors.',
        textHindi: 'बाजार से खरीदे गए जादू-टोने के मंत्रों द्वारा।'
      }
    ];

    check_feedback = `Correct. Gita 15.3 commands: "asaṅga-śastreṇa dṛḍhena chittvā tataḥ padaṁ tat parimārgitavyam".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 15.3: "असङ्गशस्त्रेण दृढेन छित्त्वा। ततः पदं तत्परिमार्गितव्यं..."`;
  } else if (ch === 16) {
    // Daivasura Sampad Vibhaga Yoga
    sectionA_text = `Krishna contrasts the twenty-six divine qualities (Daivi Sampad)—such as fearlessness, purity of heart, non-violence, truth, and forgiveness—with demonic vices (Asuri Sampad) like hypocrisy, arrogance, pride, and wrath, identifying lust, anger, and greed as the three gates of self-destruction (16.21).`;
    sectionA_textHindi = `श्री कृष्ण छब्बीस दैवी गुणों (अभय, अंतःकरण की शुद्धि, अहिंसा, सत्य, अक्रोध, क्षमा) तथा आसुरी दुर्गुणों (दंभ, दर्प, अभिमान, क्रोध, कठोरता) का भेद स्पष्ट करते हैं, और काम, क्रोध तथा लोभ को नरक के तीन विनाशकारी द्वार बताते हैं (16.21)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 16 (Daivasura Sampad Vibhaga Yoga / The Yoga of Division between Divine and Demonic Natures).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 16 (दैवासुरसम्पद्विभागयोग)—सद्गुणों और दुर्गुणों का मनोवैज्ञानिक विश्लेषण।`;

    sectionB_explanation = `This chapter is a masterclass in moral psychology. The first quality of the divine nature is "Abhayam" (fearlessness), because without courage, truth and compassion cannot be sustained. In verse 16.21, Krishna warns: "Tri-vidhaṁ narakasyedaṁ dvāraṁ nāśanam ātmanaḥ, kāmaḥ krodhas tathā lobhas"—Lust/Craving, Anger, and Greed are the three gates that degrade human consciousness and destroy character.`;
    sectionB_explanationHindi = `यह अध्याय नैतिक चरित्र का दर्पण है। दैवी संपदा का प्रथम लक्षण 'अभय' (निडरता) है, क्योंकि भयभीत व्यक्ति सत्य पर नहीं टिक सकता। श्लोक 16.21 में चेतावनी है कि काम (अंधी वासना), क्रोध और लोभ—ये तीनों आत्मा का पतन कराने वाले नरक के तीन द्वार हैं, जिनका सर्वथा त्याग करना चाहिए।`;

    sectionC_title = `Guarding Character Against the Three Destructive Impulses`;
    sectionC_titleHindi = `काम, क्रोध और लोभ के पतनकारी जाल से आत्मरक्षा`;

    sectionC_scenario = `A businessperson or student is tempted by greed to take an unethical shortcut or reacts with explosive anger when criticized, but pauses and rejects the impulse to preserve their character and peace of mind.`;
    sectionC_scenarioHindi = `धन के लोभ में गलत मार्ग अपनाने या अपमान होने पर भयंकर क्रोध करने के अवसर पर व्यक्ति अपने विवेक को जाग्रत कर इन तीनों से बचता है।`;

    sectionC_connection = `By recognizing lust, anger, and greed as the root triggers of personal downfall, we can erect mindful boundaries before impulsive emotions hijack our decisions.`;
    sectionC_connectionHindi = `काम, क्रोध और लोभ को आत्म-विनाश का मूल कारण मानकर इन पर समय रहते नियंत्रण करना ही उज्ज्वल भविष्य की नींव है।`;

    sectionD_takeaway = `Cultivate fearlessness and truth while resolutely closing the three gates of self-destruction: craving, anger, and greed.`;
    sectionD_takeawayHindi = `अभय और सत्य का आश्रय लें, तथा काम, क्रोध और लोभ—इन तीनों विनाशकारी द्वारों का त्याग करें।`;

    check_question = `In Gita 16.21, what three vices does Krishna identify as the three gates to self-destruction (Naraka)?`;
    check_questionHindi = `गीता 16.21 में भगवान श्री कृष्ण किन तीन दुर्गुणों को आत्मा का नाश करने वाले नरक के तीन द्वार बताते हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'Lust/Craving (Kama), Anger (Krodha), and Greed (Lobha).',
        textHindi: 'काम (वासना), क्रोध और लोभ।'
      },
      {
        id: 'opt-2',
        text: 'Hunger, thirst, and physical tiredness.',
        textHindi: 'भूख, प्यास और शारीरिक थकान।'
      },
      {
        id: 'opt-3',
        text: 'Reading, writing, and practicing arithmetic.',
        textHindi: 'पढ़ना, लिखना और गणित सीखना।'
      },
      {
        id: 'opt-4',
        text: 'Waking up early, exercising, and drinking water.',
        textHindi: 'सुबह जल्दी उठना, कसरत करना और जल पीना।'
      }
    ];

    check_feedback = `Correct. Shloka 16.21 warns: "tri-vidhaṁ narakasyedaṁ dvāraṁ nāśanam ātmanaḥ, kāmaḥ krodhas tathā lobhas tasmād etat trayaṁ tyajet".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 16.21: "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः। कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥"`;
  } else if (ch === 17) {
    // Shraddhatraya Vibhaga Yoga
    sectionA_text = `Krishna analyzes the threefold division of faith, food, sacrifice, austerity, and charity according to the three Gunas (Sattvic, Rajasic, Tamasic), declaring that a person's character matches their faith (17.3), and defines the austerity of speech as words that cause no agitation, are truthful, pleasant, and beneficial (17.15).`;
    sectionA_textHindi = `श्री कृष्ण श्रद्धा, आहार, यज्ञ, तप और दान का तीनों गुणों (सात्त्विक, राजसिक, तामसिक) के अनुसार विश्लेषण करते हैं; वे उद्घोष करते हैं कि मनुष्य अपनी श्रद्धा के अनुरूप ही होता है (17.3), और वाणी का तप बताते हैं कि जो उद्वेग न करने वाली, सत्य, प्रिय और हितकारी हो (17.15)।`;

    sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 17 (Shraddhatraya Vibhaga Yoga / The Yoga of the Threefold Division of Faith).`;
    sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 17 (श्रद्धात्रयविभागयोग)—श्रद्धा, आहार और वाणी का सात्त्विक अनुशासन।`;

    sectionB_explanation = `Verse 17.3 states a profound psychological truth: "Śraddhā-mayo 'yaṁ puruṣo yo yac-chraddhaḥ sa eva saḥ" (A person is fashioned by their faith; as their faith is, so indeed are they). In verse 17.15, Krishna provides the timeless fourfold standard for communication (Vakya Tapas): speech must be (1) Anudvega-karam (non-agitating), (2) Satyam (truthful), (3) Priyam (pleasant), and (4) Hitam (beneficial).`;
    sectionB_explanationHindi = `श्लोक 17.3 मानव स्वभाव का गहन सत्य कहता है: "श्रद्धामयोऽयं पुरुषो यो यच्छ्रद्धः स एव सः"—मनुष्य जैसा विश्वास और मूल्य रखता है, वैसा ही उसका जीवन बनता है। श्लोक 17.15 में वाणी के तप के चार स्तंभ बताए गए हैं: (1) अनुद्वेगकर (दुःख न पहुँचाने वाली), (2) सत्य, (3) प्रिय और (4) हितकारी वाणी।`;

    sectionC_title = `Mindful and Beneficial Communication`;
    sectionC_titleHindi = `सत्य, प्रिय और हितकारी वाणी का अभ्यास`;

    sectionC_scenario = `A manager giving constructive feedback to a struggling employee chooses words that are completely honest, yet framed constructively and kindly without humiliating the person.`;
    sectionC_scenarioHindi = `किसी को समझाते समय कटु व्यंग्य करने के बजाय प्रेम, सत्य और उसके भले की दृष्टि से बात करना, जिससे सामने वाले को ठेस न पहुँचे।`;

    sectionC_connection = `Applying Gita 17.15 transforms communication: speak what is true, but ensure it is spoken with goodwill, without causing needless anxiety, and for the genuine upliftment of others.`;
    sectionC_connectionHindi = `वाणी के इस तप को अपनाकर हमारे शब्द कलह उत्पन्न करने के बजाय दूसरों का मार्गदर्शन और समाधान करते हैं।`;

    sectionD_takeaway = `Cultivate pure Sattvic faith and master the austerity of speech: let your words be non-agitating, truthful, pleasant, and beneficial.`;
    sectionD_takeawayHindi = `सात्त्विक श्रद्धा को अपनाएँ और वाणी के तप को धारण करें: आपकी वाणी सत्य, प्रिय, हितकारी और शांतिप्रद हो।`;

    check_question = `In Gita 17.15, what four criteria define the austerity of speech (Vāṅmaya Tapas)?`;
    check_questionHindi = `गीता 17.15 में वाणी के तप (वाङ्मय तप) के कौन से चार मुख्य लक्षण बताए गए हैं?`;

    check_options = [
      {
        id: 'opt-1',
        text: 'Words that cause no agitation, are truthful, pleasant, beneficial, and practiced along with self-study.',
        textHindi: 'उद्वेग न करने वाले, सत्य, प्रिय, हितकारी वचन तथा स्वाध्याय का अभ्यास।'
      },
      {
        id: 'opt-2',
        text: 'Loud, sarcastic, and humiliating insults designed to win arguments.',
        textHindi: 'बहस जीतने के लिए जोर-जोर से चिल्लाना और कटु व्यंग्य करना।'
      },
      {
        id: 'opt-3',
        text: 'Speaking complete untruths whenever convenient for temporary gain.',
        textHindi: 'अपनी सुविधा के अनुसार हर समय असत्य बोलना।'
      },
      {
        id: 'opt-4',
        text: 'Remaining completely silent for an entire lifetime without speaking to family.',
        textHindi: 'जीवन भर किसी से भी कोई बात न करना।'
      }
    ];

    check_feedback = `Correct. Shloka 17.15 states: "anudvega-karaṁ vākyaṁ satyaṁ priya-hitaṁ ca yat, svādhyāyābhyasanaṁ caiva vāṅ-mayaṁ tapa ucyate".`;
    check_feedbackHindi = `सही उत्तर। श्लोक 17.15: "अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत्। स्वाध्यायाभ्यसनं चैव वाङ्गमयं तप उच्यते॥"`;
  } else {
    // Chapter 18 (Moksha Sannyasa Yoga)
    if (v === 78) {
      sectionA_text = `In the final shloka of the Bhagavad Gita, Sanjaya declares: "Wherever there is Sri Krishna, the Lord of Yoga, and wherever there is Arjuna, the dedicated wielder of the bow, there will surely be fortune, victory, prosperity, and unwavering morality."`;
      sectionA_textHindi = `श्रीमद्भगवद्गीता के 700वें व अंतिम श्लोक में संजय घोषणा करते हैं: "जहाँ योगेश्वर भगवान श्री कृष्ण हैं और जहाँ गाण्डीवधारी धनुर्धर अर्जुन हैं, वहीं श्री (ऐश्वर्य), विजय, विभूति और अचल नीति है।"`;

      sectionA_context = `Speaker: Sanjaya concluding the sacred dialogue to King Dhritarashtra. Setting: Hastinapura palace, completing the entire Bhagavad Gita.`;
      sectionA_contextHindi = `वक्ता: संजय (राजा धृतराष्ट्र से गीता के उपसंहार का कथन करते हुए)। स्थान: हस्तिनापुर का राजमहल—गीता का पावन समापन।`;

      sectionB_explanation = `This benediction synthesizes the entire teaching of the Gita. "Yatra Yogeśhvaraḥ Kṛiṣhṇaḥ" represents divine grace, supreme wisdom, and vision. "Yatra Pārtho Dhanur-dharaḥ" represents disciplined human effort, commitment, and skill in action. When divine wisdom and energetic, righteous human effort unite, success, prosperity, and justice are inevitable.`;
      sectionB_explanationHindi = `यह श्लोक समस्त गीता का महा-निष्कर्ष है। "योगेश्वर कृष्ण" ईश्वरीय कृपा, सर्वोच्च विवेक और तत्व-ज्ञान के प्रतीक हैं; "धनुर्धर पार्थ" समर्पित पुरुषार्थ और कर्तव्य-परायणता के प्रतीक हैं। जहाँ ईश्वरीय ज्ञान और कर्मठ मानवीय प्रयास का मिलन होता है, वहाँ विजय और धर्म सुनिश्चित हैं।`;

      sectionC_title = `Uniting Vision with Disciplined Execution`;
      sectionC_titleHindi = `दिव्य दृष्टि और कर्मठ पुरुषार्थ का समन्वय`;

      sectionC_scenario = `An organization, startup, or individual pairs deep ethical principles and strategic vision with relentless, disciplined day-to-day execution.`;
      sectionC_scenarioHindi = `कोई संस्था या व्यक्ति उच्च नैतिक सिद्धांतों और स्पष्ट दूरदृष्टि को दैनिक अनुशासन और कठोर परिश्रम के साथ जोड़कर सफलता प्राप्त करता है।`;

      sectionC_connection = `Sanjaya’s concluding insight reveals that spiritual wisdom is not passive escapism; the highest triumph occurs when profound ethical insight (Krishna) guides energetic, courageous action (Arjuna).`;
      sectionC_connectionHindi = `संजय का यह वचन सिद्ध करता है कि अध्यात्म पलायन नहीं है; परम विजय तब मिलती है जब सात्विक विवेक (कृष्ण) के मार्गदर्शन में साहसी पुरुषार्थ (अर्जुन) कर्म करता है।`;

      sectionD_takeaway = `Victory, prosperity, and moral righteousness are guaranteed when divine wisdom guides courageous, disciplined human effort.`;
      sectionD_takeawayHindi = `जहाँ ईश्वरीय विवेक और समर्पित मानवीय पुरुषार्थ एक साथ होते हैं, वहाँ विजय, समृद्धि और धर्म निश्चित हैं।`;

      check_question = `In the closing verse of the Gita (18.78), what two essential elements must come together for victory and prosperity to flourish?`;
      check_questionHindi = `गीता के अंतिम श्लोक (18.78) के अनुसार विजय और कल्याण के लिए किन दो तत्वों का मिलन अनिवार्य है?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Divine wisdom and vision (symbolized by Krishna) united with disciplined, courageous human effort (symbolized by Arjuna).',
          textHindi: 'ईश्वरीय ज्ञान और मार्गदर्शन (श्री कृष्ण) तथा समर्पित व साहसी मानवीय पुरुषार्थ (अर्जुन) का मिलन।'
        },
        {
          id: 'opt-2',
          text: 'Vast numerical armies and overwhelming destructive weapons.',
          textHindi: 'विशाल सैन्य संख्या और विनाशकारी अस्त्र-शस्त्रों का बाहुल्य।'
        },
        {
          id: 'opt-3',
          text: 'Complete abandonment of all worldly responsibilities in favor of total isolation.',
          textHindi: 'सभी सांसारिक कर्तव्यों को छोड़कर पूर्णतः एकांत में बैठ जाना।'
        },
        {
          id: 'opt-4',
          text: 'Blind reliance on fate without taking any personal action.',
          textHindi: 'बिना कोई कर्म किए केवल भाग्य के भरोसे बैठे रहना।'
        }
      ];

      check_feedback = `Correct. Shloka 18.78 proclaims that victory and righteousness are assured where Krishna (the Lord of Yoga) and Arjuna (the dedicated archer) stand together.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 18.78: "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥"`;
    } else if (v === 66) {
      sectionA_text = `Krishna offers the supreme secret: "Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve."`;
      sectionA_textHindi = `श्री कृष्ण चरम रहस्य प्रकट करते हैं: "सम्पूर्ण धर्मों के आश्रय को त्यागकर केवल मेरी शरण में आ जाओ; मैं तुम्हें समस्त पापों से मुक्त कर दूँगा, शोक मत करो।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: The summit of Chapter 18 (Moksha Sannyasa Yoga), the ultimate culmination of the Gita's guidance.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 18 (मोक्षसंन्यासयोग) का सर्वोच्च शिखर—चरम श्लोक।`;

      sectionB_explanation = `After thoroughly teaching Jnana (knowledge), Karma (action), and Dhyana (meditation), Krishna gives the final refuge: complete surrender (Sharanagati) of the limited ego to the Supreme. Surrendering all relative anxieties and egoistic calculations into divine care releases the soul from fear and grief.`;
      sectionB_explanationHindi = `ज्ञान, कर्म और ध्यान की विस्तृत शिक्षा के उपरांत भगवान अंतिम आश्रय देते हैं: शरणागति। अपने क्षुद्र अहंकार और चिंताओं को प्रभु के चरणों में समर्पित कर देना ही समस्त भय और संताप से मुक्ति का द्वार है।`;

      sectionC_title = `Letting Go of the Burden of the Ego`;
      sectionC_titleHindi = `अहंकार का बोझ छोड़कर पूर्ण शरणागति`;

      sectionC_scenario = `After doing everything humanly possible to prepare for a major life event or care for a loved one, a person surrenders the paralyzing anxiety over the unknown to a higher divine power, finding profound relief.`;
      sectionC_scenarioHindi = `अपनी पूरी शक्ति और ईमानदारी से प्रयास करने के बाद, व्यक्ति भविष्य की अनिश्चितताओं का भय ईश्वर को सौंपकर असीम शांति अनुभव करता है।`;

      sectionC_connection = `Surrender is not weakness or giving up; it is the ultimate psychological release from carrying the universe on our own shoulders, resting in faith after discharging honest effort.`;
      sectionC_connectionHindi = `शरणागति अकर्मण्यता नहीं है; संपूर्ण निष्ठा से अपना कर्तव्य करने के उपरांत अहंकार का बोझ छोड़ प्रभु पर अटूट विश्वास रखना ही सच्ची शांति है।`;

      sectionD_takeaway = `When you have done your honest best, release anxiety and surrender your limited ego into the hands of the Supreme.`;
      sectionD_takeawayHindi = `अपना सर्वश्रेष्ठ कर्तव्य करने के उपरांत चिंता का त्याग करें और प्रभु की पावन शरण में निश्चिंत हो जाएँ।`;

      check_question = `In Gita 18.66 (Sarva-dharmān parityajya), what does Lord Krishna ask Arjuna to do?`;
      check_questionHindi = `गीता 18.66 ("सर्वधर्मान्परित्यज्य...") में भगवान श्री कृष्ण अर्जुन से क्या करने को कहते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'Surrender all relative anxieties and self-effort unto Him alone, promising complete freedom from grief and negative reactions.',
          textHindi: 'समस्त चिंताओं और अहंकार को त्यागकर अनन्य भाव से केवल मेरी शरण में आओ; मैं तुम्हें सब पापों से मुक्त कर दूँगा।'
        },
        {
          id: 'opt-2',
          text: 'Create a new sectarian religion and force others to convert.',
          textHindi: 'एक नया संप्रदाय बनाकर दूसरों को बलपूर्वक उसमें शामिल करना।'
        },
        {
          id: 'opt-3',
          text: 'Abandon his family immediately and retreat to a mountain cave.',
          textHindi: 'तत्काल परिवार छोड़कर किसी पर्वत की गुफा में भाग जाना।'
        },
        {
          id: 'opt-4',
          text: 'Fight violently for personal vengeance and worldly power.',
          textHindi: 'केवल व्यक्तिगत प्रतिशोध और सांसारिक सत्ता के लिए हिंसा करना।'
        }
      ];

      check_feedback = `Correct. Gita 18.66 is the Charama Shloka of surrender, where Krishna promises liberation from all grief to the soul who takes complete refuge in Him.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 18.66 ("सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज...") गीता का परम आश्वासन और शरणागति का महामंत्र है।`;
    } else if (v === 37) {
      sectionA_text = `Krishna explains the nature of Sattvic happiness: "That happiness which in the beginning tastes like poison, but in the end transforms into sweet nectar—arising from the clear self-realization of the intellect—is declared to be Sattvic."`;
      sectionA_textHindi = `श्री कृष्ण सात्त्विक सुख का लक्षण बताते हैं: "जो सुख आरंभ में विष के समान कठिन और कड़वा लगता है, परंतु परिणाम में अमृत के तुल्य होता है—आत्मबुद्धि की निर्मलता से उत्पन्न होने वाला वह सुख सात्त्विक कहा गया है।"`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 18 (Moksha Sannyasa Yoga), classifying knowledge, action, and happiness according to the three Gunas.`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 18 (मोक्षसंन्यासयोग)—त्रिगुणों के आधार पर सुख का विश्लेषण।`;

      sectionB_explanation = `Verse 18.37 ("Yat tad agre viṣam iva pariṇāme 'mṛtopamam") is a profound diagnostic on short-term vs long-term fulfillment. Rajasic pleasure is sweet at first (instant gratification, indulgence) but bitter in the end (burnout, addiction, regret). Sattvic happiness demands early discipline, focus, and friction, but yields enduring peace, health, and enlightenment.`;
      sectionB_explanationHindi = `श्लोक 18.37 तात्कालिक सुख और स्थायी आनंद का भेद समझाता है। राजसिक सुख शुरू में मीठा परंतु अंत में विष बन जाता है; जबकि सात्त्विक सुख के लिए आरंभ में संयम, अध्ययन और परिश्रम (विषवत) करना पड़ता है, जो अंत में अमृतोपम शांति और आत्म-संतुष्टि प्रदान करता है।`;

      sectionC_title = `Cultivating Delayed Gratification and Long-Term Fulfillment`;
      sectionC_titleHindi = `तात्कालिक प्रलोभनों के स्थान पर सात्त्विक आनंद की साधना`;

      sectionC_scenario = `A student or athlete chooses the temporary discomfort of disciplined study or training over the fleeting gratification of mindless social media scrolling.`;
      sectionC_scenarioHindi = `विद्यार्थी या खिलाड़ी क्षणिक मौज-मस्ती के प्रलोभन को छोड़कर कठोर अभ्यास के सात्त्विक अनुशासन को चुनता है, जो भविष्य में सच्चा सुख देता है।`;

      sectionC_connection = `Understanding Sattvic happiness empowers us to embrace healthy discipline and delayed gratification in building a deeply meaningful life.`;
      sectionC_connectionHindi = `सात्त्विक सुख (आरंभ में विषवत, अंत में अमृत) का बोध हमें तात्कालिक सुखों के मोह से बचाकर दीर्घकालिक शांति और सफलता की ओर अग्रसर करता है।`;

      sectionD_takeaway = `True happiness demands initial discipline and ethical clarity, rewarding the persistent seeker with lasting peace and freedom.`;
      sectionD_takeawayHindi = `सच्चा सुख आरंभिक संयम और सात्त्विक साधना से मिलता है, जो अंत में स्थायी शांति और अमृततुल्य आनंद प्रदान करता है।`;

      check_question = `In Gita 18.37, how does Krishna describe Sattvic happiness?`;
      check_questionHindi = `गीता 18.37 में भगवान श्री कृष्ण सात्त्विक सुख का क्या लक्षण बताते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'It tastes like poison in the beginning (requiring discipline and effort) but transforms into sweet nectar in the end.',
          textHindi: 'जो आरंभ में विष के समान कठिन लगता है, परंतु परिणाम में अमृत के तुल्य होता है।'
        },
        {
          id: 'opt-2',
          text: 'It is instantly pleasurable like nectar at first, but later turns to bitter poison.',
          textHindi: 'जो शुरू में अमृत जैसा मीठा लगता है, परंतु बाद में विष बन जाता है।'
        },
        {
          id: 'opt-3',
          text: 'It arises exclusively from intoxicating substances and sleeping all day.',
          textHindi: 'जो केवल नशीले पदार्थों और दिन भर सोने से उत्पन्न होता है।'
        },
        {
          id: 'opt-4',
          text: 'It is impossible for any human being to ever experience in this life.',
          textHindi: 'जिसे इस जीवन में कोई भी मनुष्य कभी अनुभव नहीं कर सकता।'
        }
      ];

      check_feedback = `Correct. Gita 18.37 explains that Sattvic joy arises from the purity of one’s own intellect, tasting like poison initially but like nectar in the end.`;
      check_feedbackHindi = `सही उत्तर। श्लोक 18.37: "यत्तदग्रे विषमिव परिणामेऽमृतोपमम्। तत्सुखं सात्त्विकं प्रोक्तमात्मबुद्धिप्रसादजम्॥"`;
    } else {
      sectionA_text = `Krishna synthesizes the entire Gita: clarifying the difference between renunciation of ego (Tyaga) and renunciation of action (Sannyasa), detailing the five factors of action (18.14), the threefold nature of knowledge, intellect, and fortitude, and urging dedication of all work to the Divine.`;
      sectionA_textHindi = `श्री कृष्ण समस्त गीता का समन्वय करते हैं: संन्यास (कर्म त्याग) और त्याग (फल की आसक्ति का त्याग) का विवेक, कर्म के पाँच कारण (18.14), ज्ञान, बुद्धि और धृति का त्रिविध स्वरूप, तथा अपने स्वाभाविक कर्तव्य को प्रभु-अर्पण करने का उपदेश।`;

      sectionA_context = `Speaker: Lord Krishna. Setting: Chapter 18 (Moksha Sannyasa Yoga / The Yoga of Liberation through Renunciation).`;
      sectionA_contextHindi = `वक्ता: भगवान श्री कृष्ण। स्थान: अध्याय 18 (मोक्षसंन्यासयोग)—कर्मफल-त्याग और मोक्ष का महा-समन्वय।`;

      sectionB_explanation = `Krishna defines true Tyaga: duties of sacrifice, charity, and austerity should never be abandoned because they purify the heart; only attachment and craving for results must be renounced (18.5-6). In 18.14, He reveals the five factors of any action: the physical body, the doer, the various senses, the multiple efforts, and the cosmic factor (Daiva). Understanding this frees the soul from the arrogance of doership.`;
      sectionB_explanationHindi = `भगवान सच्चे त्याग का स्वरूप समझाते हैं: यज्ञ, दान और तप रूपी कर्तव्य कभी नहीं त्यागने चाहिए क्योंकि वे अंतःकरण को शुद्ध करते हैं; केवल आसक्ति और फल की कामना का त्याग करना चाहिए। श्लोक 18.14 में कर्म के पाँच कारण बताए गए हैं: अधिष्ठान (शरीर), कर्ता, विभिन्न करण (इंद्रियाँ), विविध चेष्टाएँ और दैव (संस्कार व ईश्वरीय विधान)। इसे जानने से कर्तापन का अहंकार नष्ट होता है।`;

      sectionC_title = `Overcoming the Pride of Sole Authorship`;
      sectionC_titleHindi = `कर्तापन के अहंकार से मुक्ति और सहयोगात्मक विनम्रता`;

      sectionC_scenario = `A project manager celebrating a massive company milestone remembers that the success was produced by team effort, tools, timing, and favorable circumstances, not their solitary genius.`;
      sectionC_scenarioHindi = `किसी बड़ी सफलता के मिलने पर टीम लीडर सारा श्रेय स्वयं लेने के बजाय पूरी टीम, साधनों और अनुकूल परिस्थितियों का आदर करता है।`;

      sectionC_connection = `Understanding the five factors of action (18.14) dismantles arrogant egoism; we realize that multiple variables cooperate in every success, keeping us humble in victory and resilient in defeat.`;
      sectionC_connectionHindi = `कर्म के पाँच कारणों की समझ हमें घमंड से बचाती है और सफलता में विनम्र तथा विफलता में धैर्यवान बनाए रखती है।`;

      sectionD_takeaway = `Discharge your legitimate duties with dedication, renouncing selfish attachment and the illusion of sole personal authorship.`;
      sectionD_takeawayHindi = `अपने स्वाभाविक कर्तव्यों का निष्ठा से पालन करें, फल की आसक्ति त्यागें और कर्तापन के अहंकार से मुक्त रहें।`;

      check_question = `In Gita 18.14, what five factors does Krishna identify as participating in the accomplishment of all actions?`;
      check_questionHindi = `गीता 18.14 के अनुसार किसी भी कर्म की सिद्धि में कौन से पाँच कारण उत्तरदायी होते हैं?`;

      check_options = [
        {
          id: 'opt-1',
          text: 'The seat of action (body), the agent (doer), the various instruments (senses), the multiple distinct efforts, and the cosmic factor (Daiva).',
          textHindi: 'अधिष्ठान (शरीर), कर्ता, विभिन्न करण (इंद्रियाँ), अनेक प्रकार की चेष्टाएँ और दैव (ईश्वरीय विधान/संस्कार)।'
        },
        {
          id: 'opt-2',
          text: 'Vast physical weapons, money, luck, enemies, and fame.',
          textHindi: 'विशाल अस्त्र-शस्त्र, धन, भाग्य, शत्रु और प्रसिद्धि।'
        },
        {
          id: 'opt-3',
          text: 'Anger, hatred, jealousy, pride, and greed alone.',
          textHindi: 'केवल क्रोध, घृणा, ईर्ष्या, अभिमान और लोभ।'
        },
        {
          id: 'opt-4',
          text: 'There is only one factor: complete random accident without any causes.',
          textHindi: 'केवल एक ही कारण है: बिना किसी नियम के आकस्मिक दुर्घटना।'
        }
      ];

      check_feedback = `Correct. Shloka 18.14 lists: "adhiṣṭhānaṁ tathā kartā karaṇaṁ ca pṛthag-vidham, vividhāś ca pṛthak ceṣṭā daivaṁ caivātra pañcamam".`;
      check_feedbackHindi = `सही उत्तर। श्लोक 18.14: "अधिष्ठानं तथा कर्ता करणं च पृथग्विधम्। विविधाश्च पृथक्चेष्टा दैवं चैवात्र पञ्चमम्॥"`;
    }
  }

  // Refinement: enrich with original translation text if not already included
  if (hindiTranslation && !sectionA_text.includes(hindiTranslation.slice(0, 30))) {
    sectionA_text += `\n\nमूल अनुवाद: ${hindiTranslation}`;
  }
  if (hindiTranslation && !sectionA_textHindi.includes(hindiTranslation.slice(0, 30))) {
    sectionA_textHindi += `\n\nश्लोक अनुवाद: ${hindiTranslation}`;
  }

  return {
    verseId,
    gitaExplanation: {
      text: sectionA_text,
      textHindi: sectionA_textHindi,
      context: sectionA_context,
      contextHindi: sectionA_contextHindi
    },
    deeperUnderstanding: {
      explanation: sectionB_explanation,
      explanationHindi: sectionB_explanationHindi,
      sourceReferences: [
        'Gita Press (Sadhaka Sanjivani by Swami Ramsukhdas)',
        'Swami Sivananda Commentary (The Divine Life Society)',
        'IIT Kanpur Gita Supersite Traditional Interpretations'
      ]
    },
    realLifeApplication: {
      title: sectionC_title,
      titleHindi: sectionC_titleHindi,
      scenario: sectionC_scenario,
      scenarioHindi: sectionC_scenarioHindi,
      connection: sectionC_connection,
      connectionHindi: sectionC_connectionHindi,
      isInterpretive: true
    },
    keyTakeaway: sectionD_takeaway,
    keyTakeawayHindi: sectionD_takeawayHindi,
    understandingCheck: {
      question: check_question,
      questionHindi: check_questionHindi,
      options: check_options,
      correctAnswerId: check_correctId,
      feedback: check_feedback,
      feedbackHindi: check_feedbackHindi
    },
    reviewStatus: 'draft'
  };
}

export function generateAllLifeLessons(): Record<string, GitaLifeLesson> {
  const lessons: Record<string, GitaLifeLesson> = {};
  let totalCount = 0;

  for (const chData of chapters) {
    const chNum = chData.number;
    const paddedCh = String(chNum).padStart(2, '0');
    const verseFilePath = path.join(VERSES_DIR, `chapter-${paddedCh}.json`);

    if (!fs.existsSync(verseFilePath)) continue;
    const verses: VerseData[] = JSON.parse(fs.readFileSync(verseFilePath, 'utf-8'));

    for (const verse of verses) {
      const lesson = generateLifeLesson(verse, chData);
      lessons[lesson.verseId] = lesson;
      totalCount++;
    }
  }

  console.log(`Successfully generated ${totalCount} structured GitaLifeLesson records with full Hindi & English content.`);
  return lessons;
}

// Generate and save
console.log('Generating structured 700-level GitaLifeLesson educational dataset...');
const allLessons = generateAllLifeLessons();

// Save to life-lessons-data.json
fs.writeFileSync(LIFE_LESSONS_PATH, JSON.stringify(allLessons, null, 2), 'utf-8');
console.log(`Saved 700 life lessons to ${LIFE_LESSONS_PATH}`);

// Also embed into levels-data.json
if (fs.existsSync(LEVELS_DATA_PATH)) {
  const levels: GameLevel[] = JSON.parse(fs.readFileSync(LEVELS_DATA_PATH, 'utf-8'));
  for (const lvl of levels) {
    if (allLessons[lvl.id]) {
      lvl.lifeLesson = allLessons[lvl.id];
    }
  }
  fs.writeFileSync(LEVELS_DATA_PATH, JSON.stringify(levels, null, 2), 'utf-8');
  console.log(`Updated all ${levels.length} levels in ${LEVELS_DATA_PATH} with lifeLesson field.`);
}
