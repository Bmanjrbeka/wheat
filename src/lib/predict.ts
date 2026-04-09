import { Client } from "@gradio/client"; 
 
export async function getWheatPrediction(imageFile: File) { 
  try { 
    const client = await Client.connect("Bekaamm/wheat-disease-classification"); 
    /* Convert file to blob to ensure compatibility */ 
    const imageBlob = new Blob([imageFile], { type: imageFile.type }); 
    const result = await client.predict("/predict", { 
      img: imageBlob, 
    }); 
    return result.data; 
  } catch (error) { 
    console.error("Gradio Error:", error); 
    throw error; 
  } 
} 
