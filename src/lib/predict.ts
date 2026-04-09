import { Client } from "@gradio/client"; 
 
export async function getWheatPrediction(imageFile: File) { 
  try { 
    const client = await Client.connect("Bekaamm/wheat-disease-classification"); 
    const result = await client.predict("/predict", { img: imageFile }); 
    return result.data; 
  } catch (error) { 
    console.error("AI Connection Error:", error); 
    throw error; 
  } 
} 
