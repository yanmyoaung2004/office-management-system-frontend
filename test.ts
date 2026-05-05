const callAPI = async () => {
  const res = await fetch("https://lightning.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer e98e9ed2-7d96-4089-8c84-4a5df4f4088a",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "lightning-ai/kimi-k2.5",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: "Hello, world" }],
        },
      ],
    }),
  });
  const data = await res.json();
  console.log(data.choices[0].message.content);
};

callAPI();
