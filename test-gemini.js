const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    console.log("Fetching models...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("Hello");
    console.log("Success:", res.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
