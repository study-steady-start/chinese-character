import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiAvailable: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Hanja Deep-dive Etymology & Usage explanation
app.post("/api/gemini/explain-hanja", async (req, res) => {
  try {
    const { hanja, reading, meaning } = req.body;
    if (!hanja) {
      return res.status(400).json({ error: "한자를 입력해주세요." });
    }

    const ai = getAIClient();
    if (!ai) {
      // Return high quality fallback
      return res.json({
        result: {
          origin: `[${hanja}(${meaning} ${reading})]는 한국어문회 1급 배정한자입니다. 부수와 결합 원리를 파악하여 기억하면 효과적입니다.`,
          etymologyType: "형성(形聲) 또는 회의(會意)",
          mnemonicTip: `부수의 의미와 음을 나타내는 글자의 소리를 연계하여 연상 암기하세요.`,
          vocabularyUsages: [
            { word: `${hanja} 관련 고급 어휘`, reading: "독음", meaning: "1급 수준의 학술/고전/시사 한자어" },
          ],
          classicalQuote: `고전 문헌(사기, 맹자 등)에서 자주 활용되는 용례를 확인하세요.`,
        },
      });
    }

    const prompt = `당신은 한자능력검정시험 1급 및 한문학 최고 권위자 'AI 한자 훈장님'입니다.
다음 한자에 대해 한국어문회 1급 수험생을 위한 깊이 있는 해설을 JSON으로 제공해주세요:

한자: ${hanja} (${meaning} ${reading})

반드시 다음 JSON 형식만 순수하게 반환하세요:
{
  "origin": "자원(字源) 및 글자의 형성 배경 설명 (갑골문/금문/소전의 유래)",
  "etymologyType": "육서(六書: 상형, 지사, 회의, 형성, 전주, 가차 중 해당 유형과 이유)",
  "mnemonicTip": "1급 수험생이 절대로 잊어버리지 않게 돕는 기발하고 논리적인 암기 비법",
  "strokeKeyPoint": "획순 및 필기 시 헷갈리기 쉬운 핵심 획 포인트",
  "confusableHanja": "모양이 비슷해서 시험에 오답으로 출제되는 혼동 한자와 구별법",
  "vocabularyUsages": [
    {"word": "한자어1", "reading": "독음", "meaning": "뜻풀이 및 1급 출제 팁"},
    {"word": "한자어2", "reading": "독음", "meaning": "뜻풀이 및 1급 출제 팁"}
  ],
  "classicalQuote": "해당 한자가 쓰인 대표적인 고사성어, 명심보감, 논어, 한시 등의 유명 구절 1문장과 현대어 풀이"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    return res.json({ result: parsed });
  } catch (error: any) {
    console.error("Gemini explain-hanja error:", error);
    return res.status(500).json({
      error: "한자 해설을 불러오는 중 오류가 발생했습니다.",
      details: error?.message,
    });
  }
});

// Classical Text & Poetry Analysis
app.post("/api/gemini/analyze-passage", async (req, res) => {
  try {
    const { passage } = req.body;
    if (!passage) {
      return res.status(400).json({ error: "분석할 고문 또는 한시 구절을 입력해주세요." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        analysis: {
          original: passage,
          koreanReading: "한글 독음",
          translation: "현대어 번역",
          characters: [],
          grammarTips: "1급 시험 빈출 허사(虛辭) 및 어조사 쓰임새 분석",
          source: "고전문헌",
        },
      });
    }

    const prompt = `당신은 한자능력검정시험 1급 대비 한문 문장 해석 전문가입니다.
다음 한문 구절을 1급 수험생 수준에 맞게 완벽하게 분해 해설해주세요:

구절:
${passage}

반드시 다음 JSON 형식으로만 반환하세요:
{
  "original": "${passage.replace(/"/g, '\\"')}",
  "koreanReading": "전체 한글 독음",
  "translation": "자연스럽고 정확한 현대 한국어 직역 및 의역",
  "source": "출전 (예: 논어 학이편, 두보 춘망, 명심보감 등)",
  "characters": [
    {"hanja": "한자", "reading": "음", "meaning": "해당 문맥에서의 훈과 품사/문법적 기능"}
  ],
  "grammarTips": "문법 구조(주술목, 도치, 사동/피동 등) 및 핵심 허사(之, 乎, 者, 也, 矣, 焉 등) 설명",
  "examPoint": "1급 시험에서 독음/훈음/쓰기로 출제될 수 있는 핵심 포인트"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ analysis: parsed });
  } catch (error: any) {
    console.error("Gemini analyze-passage error:", error);
    return res.status(500).json({ error: "문장 분석 중 오류가 발생했습니다." });
  }
});

// Interactive AI Master Q&A
app.post("/api/gemini/ask-master", async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: "질문 내용을 입력해주세요." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        reply: `한자능력검정시험 1급은 3,500자의 배정한자와 고난도 사자성어, 동자이음자, 약자, 한문 고전을 두루 섭렵해야 하는 최고 등급 시험입니다. 질문하신 내용: "${question}"에 대해 부수 분류와 자원(字源)을 중심으로 체계적으로 공부하시기를 권장합니다.`,
      });
    }

    const systemInstruction = `당신은 한자능력검정시험 1급(한국어문회) 합격을 전문 지도하는 박학다식하고 인자한 '한자 훈장님'입니다.
- 1급 배정한자 3,500자, 고사성어, 고문 독해, 약자/속자, 동자이음자, 장단음, 부수 구별에 대해 매우 명쾌하고 정확하게 가르칩니다.
- 1급 수험생들이 자주 헷갈리는 함정(예: 賈의 고/가 독음 구별, 龜의 귀/균/구 음훈 구별, 己/已/巳 구별, ⺡ vs ⺘ 부수 변형 등)을 예리하게 짚어줍니다.
- 말투는 정중하고 신뢰감 있는 사제간의 대화 톤(예: "~하옵니다", "~입니다", "학우여, 이 글자는~")을 자연스럽게 섞어 품격 있게 답변해주세요.`;

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        contents.push(`${msg.sender === "user" ? "수험생" : "훈장님"}: ${msg.text}`);
      }
    }
    contents.push(`수험생 질문: ${question}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents.join("\n\n"),
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({ reply: response.text || "답변을 생성하지 못했습니다." });
  } catch (error: any) {
    console.error("Gemini ask-master error:", error);
    return res.status(500).json({ error: "훈장님과의 대화 중 오류가 발생했습니다." });
  }
});

// Custom AI Mock Question Generator
app.post("/api/gemini/generate-questions", async (req, res) => {
  try {
    const { category, count = 5, difficulty = "1급" } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.json({ questions: [] });
    }

    const prompt = `한국어문회 한자능력검정시험 1급 난이도의 실전 기출 스타일 문제 ${count}문항을 생성해주세요.
분야: ${category || "종합 (독음, 훈음, 사자성어, 한자쓰기, 약자, 부수)"}
난이도: ${difficulty}

반드시 다음 JSON 형식으로만 반환하세요:
{
  "questions": [
    {
      "id": "q1",
      "type": "reading" | "meaning" | "idiom" | "writing" | "simplified" | "radical",
      "typeLabel": "독음" | "훈음" | "사자성어" | "한자쓰기" | "약자" | "부수",
      "question": "문제 질문 문장 (예: 다음 문장에서 밑줄 친 한자어의 올바른 독음을 고르시오.)",
      "context": "문제 보기 문맥 또는 밑줄 제시문 (예: 그의 주장은 齟齬를 빚었다.)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctIndex": 0,
      "explanation": "상세하고 명쾌한 1급 수준 정답 해설 및 오답 선택지 분석"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || '{"questions": []}');
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini generate-questions error:", error);
    return res.status(500).json({ error: "문제 생성 중 오류가 발생했습니다." });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hanja Level 1 Master Server running on port ${PORT}`);
  });
}

startServer();
