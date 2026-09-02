import { ConfusingHanjaPair, PolyphoneItem, SimplifiedHanjaPair, SynAntPair, RadicalSpecialItem } from '../types';

export const CONFUSING_PAIRS: ConfusingHanjaPair[] = [
  {
    id: 'conf_1',
    title: '己(몸 기) vs 已(이미 이) vs 巳(여섯째지지 사)',
    characters: [
      {
        hanja: '己',
        reading: '기',
        meaning: '몸 / 자기',
        radical: '己',
        strokeCount: 3,
        differenceTip: '위쪽이 완전히 열려 있음 (克己, 自己)',
        sampleWord: '克己復禮 (극기복례)',
      },
      {
        hanja: '已',
        reading: '이',
        meaning: '이미 / 그칠',
        radical: '己',
        strokeCount: 3,
        differenceTip: '위쪽이 반쯤 닫혀 있음 (이미 이)',
        sampleWord: '而已 (이이 - ~일 뿐이다)',
      },
      {
        hanja: '巳',
        reading: '사',
        meaning: '여섯째 지지 (뱀)',
        radical: '己',
        strokeCount: 3,
        differenceTip: '위쪽이 완전히 닫혀 있음 (뱀 사)',
        sampleWord: '辛巳 (신사년), 巳時 (사시: 오전 9~11시)',
      },
    ],
    distinctionRule: '열린 기(己), 반 닫힌 이(已), 꽉 막힌 사(巳)! 1급 필기 및 독음 필수 암기 구별법입니다.',
  },
  {
    id: 'conf_2',
    title: '戊(다섯째천간 무) vs 戌(열한째지지 술) vs 戍(지킬 수) vs 戎(오랑캐 융)',
    characters: [
      {
        hanja: '戊',
        reading: '무',
        meaning: '다섯째 천간',
        radical: '戈',
        strokeCount: 5,
        differenceTip: '안에 점이나 획이 없음',
        sampleWord: '戊申 (무신년)',
      },
      {
        hanja: '戌',
        reading: '술',
        meaning: '열한째 지지 (개)',
        radical: '戈',
        strokeCount: 6,
        differenceTip: '가운데 가로 획(一)이 있음',
        sampleWord: '丙戌 (병술년), 戌時 (술시)',
      },
      {
        hanja: '戍',
        reading: '수',
        meaning: '수자리 / 변방지킬',
        radical: '戈',
        strokeCount: 6,
        differenceTip: '가운데 점(丶)이 찍혀 있음',
        sampleWord: '戍邊 (수변), 戍卒 (수졸)',
      },
      {
        hanja: '戎',
        reading: '융',
        meaning: '오랑캐 / 병기',
        radical: '戈',
        strokeCount: 6,
        differenceTip: '열 십(十) 자 모양과 창 과(戈) 결합',
        sampleWord: '戎裝 (융장), 兵戎 (병융)',
      },
    ],
    distinctionRule: '비어있으면 무(戊), 가로 그으면 술(戌), 점 찍으면 수(戍), 십자 칼이면 융(戎)!',
  },
  {
    id: 'conf_3',
    title: '辨(분별할 변) vs 辯(말잘할 변) vs 瓣(꽃잎 판) vs 辮(땋을 변) vs 辦(힘쓸 판)',
    characters: [
      {
        hanja: '辨',
        reading: '변',
        meaning: '분별할 / 가릴',
        radical: '辛',
        strokeCount: 16,
        differenceTip: '가운데에 칼 도(刀/刂) 부수 (사물을 베어 분별함)',
        sampleWord: '辨別 (변별), 辨證 (변증)',
      },
      {
        hanja: '辯',
        reading: '변',
        meaning: '말잘할 / 변론할',
        radical: '辛',
        strokeCount: 21,
        differenceTip: '가운데에 말씀 언(言) 부수 (말솜씨)',
        sampleWord: '辯護 (변호), 雄辯 (웅변), 辯駁 (변박)',
      },
      {
        hanja: '瓣',
        reading: '판',
        meaning: '꽃잎 / 판막',
        radical: '辛',
        strokeCount: 19,
        differenceTip: '가운데에 오이 과(瓜) 부수 (과육/꽃잎)',
        sampleWord: '花瓣 (화판 - 꽃잎), 心臟瓣膜 (심장판막)',
      },
      {
        hanja: '辦',
        reading: '판',
        meaning: '힘쓸 / 일처리할',
        radical: '辛',
        strokeCount: 16,
        differenceTip: '가운데에 힘 력(力) 부수 (힘써 처리함)',
        sampleWord: '辦公 (판공 - 공무를 처리함)',
      },
    ],
    distinctionRule: '가운데 칼(刂)=분별할 변, 말씀(言)=말잘할 변, 오이(瓜)=꽃잎 판, 힘(力)=힘쓸 판!',
  },
  {
    id: 'conf_4',
    title: '栗(밤 률) vs 粟(조 속)',
    characters: [
      {
        hanja: '栗',
        reading: '률/율',
        meaning: '밤 / 두려워할',
        radical: '木',
        strokeCount: 10,
        differenceTip: '아래에 나무 목(木) (밤나무 열매)',
        sampleWord: '戰慄 (전율 - 두려워 떪), 栗木 (율목)',
      },
      {
        hanja: '粟',
        reading: '속',
        meaning: '조(좁쌀) / 곡식',
        radical: '米',
        strokeCount: 12,
        differenceTip: '아래에 쌀 미(米) (곡식 알갱이)',
        sampleWord: '滄海一粟 (창해일속), 脫粟 (탈속)',
      },
    ],
    distinctionRule: '아래가 나무(木)면 밤 률, 쌀(米)이면 조 속!',
  },
];

export const POLYPHONE_DATA: PolyphoneItem[] = [
  {
    id: 'poly_1',
    hanja: '賈',
    readings: [
      {
        reading: '고',
        meaning: '장사 / 팔 / 값',
        sampleWords: [
          { word: '商賈', reading: '상고', meaning: '상인과 장사치' },
          { word: '賈人', reading: '고인', meaning: '장사꾼' },
          { word: '賈勇', reading: '고용', meaning: '용기를 떨쳐 팔다' },
        ],
      },
      {
        reading: '가',
        meaning: '성씨',
        sampleWords: [
          { word: '賈氏', reading: '가씨', meaning: '가씨 성' },
          { word: '賈誼', reading: '가의', meaning: '한나라의 정치가' },
        ],
      },
    ],
    examTip: '商賈(상고)는 절대로 "상가"로 읽으면 안 됩니다! 1급 시험 빈출 독음 1위!',
  },
  {
    id: 'poly_2',
    hanja: '龜',
    readings: [
      {
        reading: '귀',
        meaning: '거북',
        sampleWords: [
          { word: '龜鑑', reading: '귀감', meaning: '본보기가 될 만한 본' },
          { word: '靈龜', reading: '영귀', meaning: '신령스러운 거북' },
        ],
      },
      {
        reading: '균',
        meaning: '터질 / 갈라질',
        sampleWords: [
          { word: '龜裂', reading: '균열', meaning: '가뭄이나 쇠약으로 갈라져 터짐' },
        ],
      },
      {
        reading: '구',
        meaning: '나라이름 / 땅이름',
        sampleWords: [
          { word: '龜尾', reading: '구미', meaning: '경상북도 구미시 지명' },
          { word: '龜茲', reading: '구자', meaning: '서역의 옛 고대 국가' },
        ],
      },
    ],
    examTip: '龜裂(균열)과 龜尾(구미), 龜鑑(귀감)의 3가지 소리를 정확히 구분해야 합니다.',
  },
  {
    id: 'poly_3',
    hanja: '說',
    readings: [
      {
        reading: '설',
        meaning: '말씀 / 설명할',
        sampleWords: [
          { word: '說明', reading: '설명', meaning: '뜻을 알기 쉽게 밝혀 말함' },
          { word: '小說', reading: '소설', meaning: '허구의 문학 형식' },
        ],
      },
      {
        reading: '세',
        meaning: '달랠 / 유세할',
        sampleWords: [
          { word: '遊說', reading: '유세', meaning: '자기 주의나 정견을 설득함' },
          { word: '說客', reading: '세객', meaning: '설득하는 유세가' },
        ],
      },
      {
        reading: '열',
        meaning: '기뻐할 (悅과 동자)',
        sampleWords: [
          { word: '不亦說乎', reading: '불역열호', meaning: '또한 기쁘지 아니한가' },
        ],
      },
    ],
    examTip: '遊說(유세)와 說客(세객)은 1급 고득점을 가르는 핵심 독음입니다.',
  },
  {
    id: 'poly_4',
    hanja: '咽',
    readings: [
      {
        reading: '인',
        meaning: '목구멍',
        sampleWords: [
          { word: '咽喉', reading: '인후', meaning: '목구멍, 군사적 요충지' },
        ],
      },
      {
        reading: '열',
        meaning: '목멜',
        sampleWords: [
          { word: '嗚咽', reading: '오열', meaning: '목이 메어 소리 내어 슬피 욺' },
        ],
      },
      {
        reading: '연',
        meaning: '삼킬 (嚥과 통용)',
        sampleWords: [
          { word: '咽下', reading: '연하', meaning: '음식물을 삼킴' },
        ],
      },
    ],
    examTip: '咽喉(인후)와 嗚咽(오열)의 독음 차이를 묻는 문제가 단골 출제됩니다.',
  },
];

export const SIMPLIFIED_PAIRS: SimplifiedHanjaPair[] = [
  {
    id: 'simp_1',
    traditional: '體',
    simplified: '体',
    reading: '체',
    meaning: '몸 체',
    ruleExplanation: '뼈 골(骨)과 풍성할 풍(豊) 복잡한 23획 정자를 사람 인(亻)과 근본 본(本)으로 축약',
    sampleWord: '身體 (신체) -> 身体',
  },
  {
    id: 'simp_2',
    traditional: '廣',
    simplified: '広',
    reading: '광',
    meaning: '넓을 광',
    ruleExplanation: '집 엄(广) 안의 누를 황(黃) 복잡한 부수를 사(厶)로 단순화',
    sampleWord: '廣告 (광고) -> 広告',
  },
  {
    id: 'simp_3',
    traditional: '禮',
    simplified: '礼',
    reading: '례',
    meaning: '예도 례',
    ruleExplanation: '제사 보일 시(示=礻)에 굽을 자(乚)를 결합',
    sampleWord: '禮節 (예절) -> 礼節',
  },
  {
    id: 'simp_4',
    traditional: '號',
    simplified: '号',
    reading: '호',
    meaning: '이름/부를 호',
    ruleExplanation: '호랑이 호(虎) 밑에 입 구(口)에서 위를 일(一)로 간략화',
    sampleWord: '信號 (신호) -> 信号',
  },
  {
    id: 'simp_5',
    traditional: '氣',
    simplified: '気',
    reading: '기',
    meaning: '기운 기',
    ruleExplanation: '기운 기(气) 안의 쌀 미(米)를 가위표(乂)로 축약',
    sampleWord: '天氣 (천기/날씨) -> 天気',
  },
  {
    id: 'simp_6',
    traditional: '萬',
    simplified: '万',
    reading: '만',
    meaning: '일만 만',
    ruleExplanation: '전갈 형상의 복잡한 萬(13획)을 만자 만(万: 3획)으로 통용',
    sampleWord: '萬歲 (만세) -> 万歳',
  },
  {
    id: 'simp_7',
    traditional: '聲',
    simplified: '声',
    reading: '성',
    meaning: '소리 성',
    ruleExplanation: '경쇠 경(磬의 상단)과 귀 이(耳)에서 선비 사(士)로 간결화',
    sampleWord: '音聲 (음성) -> 音声',
  },
  {
    id: 'simp_8',
    traditional: '臺',
    simplified: '台',
    reading: '대',
    meaning: '대 대',
    ruleExplanation: '높은 누각 모양 14획 정자를 태(台: 5획)로 차용',
    sampleWord: '舞臺 (무대) -> 舞台',
  },
];

export const SYN_ANT_PAIRS: SynAntPair[] = [
  {
    id: 'syn_1',
    type: 'synonym',
    char1: { hanja: '顰', reading: '빈', meaning: '찡그릴' },
    char2: { hanja: '蹙', reading: '축', meaning: '찌푸릴' },
    relationName: '유의자 (찡그림)',
    examTip: '顰蹙(빈축)은 유의자 두 개가 결합하여 된 합성어입니다.',
  },
  {
    id: 'syn_2',
    type: 'synonym',
    char1: { hanja: '齟', reading: '저', meaning: '어긋날' },
    char2: { hanja: '齬', reading: '어', meaning: '어긋날' },
    relationName: '유의자 (어긋남)',
    examTip: '齟齬(저어)는 뜻이 같은 두 한자가 짝을 이룬 단어입니다.',
  },
  {
    id: 'ant_1',
    type: 'antonym',
    char1: { hanja: '黜', reading: '출', meaning: '내칠' },
    char2: { hanja: '陟', reading: '척', meaning: '오를' },
    relationName: '상대자/반의자 (벼슬 강등 vs 승진)',
    examTip: '黜陟(출척)은 관직에서 내치거나 올려주는 상반된 동작의 결합어입니다.',
  },
  {
    id: 'ant_2',
    type: 'antonym',
    char1: { hanja: '盈', reading: '영', meaning: '찰' },
    char2: { hanja: '虧', reading: '휴', meaning: '이지러질' },
    relationName: '상대자/반의자 (가득 참 vs 이지러짐)',
    examTip: '月盈則虧(월영즉휴: 달도 차면 기운다)에서 영(盈)과 휴(虧)는 핵심 대립자입니다.',
  },
  {
    id: 'ant_3',
    type: 'antonym',
    char1: { hanja: '泰', reading: '태', meaning: '통할 / 편안할' },
    char2: { hanja: '否', reading: '비', meaning: '막힐 / 흉할' },
    relationName: '상대자/반의자 (주역 괘의 태평 vs 곤궁)',
    examTip: '否泰(비태) 또는 泰否는 길흉화복과 성쇠를 뜻하며, 否는 막힐 비로 읽습니다.',
  },
];

export const RADICAL_SPECIALS: RadicalSpecialItem[] = [
  {
    id: 'rad_1',
    radical: '水',
    variant: '⺡',
    name: '삼수변 (세 점 물수)',
    meaning: '물이나 액체, 흐름과 관련된 뜻',
    exampleHanjas: [
      { hanja: '江', reading: '강', meaning: '강 강' },
      { hanja: '海', reading: '해', meaning: '바다 해' },
      { hanja: '滄', reading: '창', meaning: '큰바다 창' },
    ],
  },
  {
    id: 'rad_2',
    radical: '手',
    variant: '⺘',
    name: '재방변 (손 수 변형)',
    meaning: '손동작이나 잡고 휘두르는 행위',
    exampleHanjas: [
      { hanja: '搔', reading: '소', meaning: '긁을 소' },
      { hanja: '挑', reading: '도', meaning: '돋울/도전할 도' },
      { hanja: '擴', reading: '확', meaning: '넓힐 확' },
    ],
  },
  {
    id: 'rad_3',
    radical: '心',
    variant: '忄 / ⺗',
    name: '심방변 / 밑마음심',
    meaning: '마음, 감정, 사색 상태',
    exampleHanjas: [
      { hanja: '憂', reading: '우', meaning: '근심 우' },
      { hanja: '憤', reading: '분', meaning: '결낼 분' },
      { hanja: '恭', reading: '공', meaning: '공손할 공' },
    ],
  },
  {
    id: 'rad_4',
    radical: '艸',
    variant: '⺾',
    name: '초두머리',
    meaning: '풀, 초목, 꽃, 식물',
    exampleHanjas: [
      { hanja: '薔', reading: '장', meaning: '장미 장' },
      { hanja: '薇', reading: '미', meaning: '장미/고사리 미' },
      { hanja: '苟', reading: '구', meaning: '진실로 구' },
    ],
  },
];
