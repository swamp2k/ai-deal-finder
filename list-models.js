async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log("Available Gemini models:", data.models.map(m => m.name).join(", "));
    } else {
      console.log("Error listing models:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
test();
