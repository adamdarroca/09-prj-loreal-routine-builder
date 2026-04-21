async function sendToChatBot() {
  console.log("NEW api.js loaded");
  const response = await fetch(APP_CONFIG.workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: getMessages(),
    }),
  });

  if(!response.ok){
    throw new Error(`Worker failed with status ${response.status}`);
  }
  const data = await response.json();
  console.log("Response: ", data);
  const botReply = 
  data?.choices[0]?.message?.content?.trim() ||
  data?.reply ||
  data?.error?.message ||
  data?.error ||
   "Sorry, I couldn't get a response from the server.";
  return botReply;
}

async function sendSelectedProducts(selectedProducts) {
  const routineResponse = await fetch(APP_CONFIG.workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({messages}),
  });
  if(!routineResponse.ok){
    throw new Error(`Worker failed with status ${routineResponse.status}`);
  }
  const routineData = await routineResponse.json();
  console.log("Routine Response: ", routineData);
  const routineReply = 
  routineData?.choices[0]?.message?.content?.trim() ||
  routineData?.reply ||
  routineData?.error?.message ||
  routineData?.error ||
   "Sorry, I couldn't get a response from the server.";
  return routineReply;
}