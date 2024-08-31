import axios, { AxiosError } from "axios";

const RECALL_API_BASE_URL = process.env.RECALL_API_BASE_URL || "https://api.recall.ai";
const RECALL_API_KEY = process.env.RECALL_API_KEY;

if (!RECALL_API_KEY) {
  console.error("RECALL_API_KEY is not set in the environment variables");
}

const recallAxios = axios.create({
  baseURL: RECALL_API_BASE_URL,
  headers: {
    Authorization: `Token ${RECALL_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export type BotStatus = {
  status: string;
  processingStatus: string;
  videoUrl: string | null;
  audioUrl: string | null;
  transcriptUrl: string | null;
  aiSummary: string | null;
  aiNotes: string | null;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export async function testApiConnection() {
  try {
    const response = await recallAxios.get("/api/v1");
    console.log("API connection test response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error testing API connection:", error);
    throw error;
  }
}

export async function joinMeeting(meetingUrl: string, userId: string) {
  try {
    console.log(`Attempting to join meeting. URL: ${meetingUrl}, User ID: ${userId}`);
    const response = await recallAxios.post("/api/v1/bot", {
      meeting_url: meetingUrl,
      bot_name: `Note Taker for ${userId}`,
    });
    console.log("Join meeting response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in joinMeeting:", error);
    throw error;
  }
}

export async function getMeetingTranscript(botId: string) {
  try {
    const response = await recallAxios.get(`/api/v1/bot/${botId}/transcript`);
    return response.data;
  } catch (error) {
    console.error("Error in getMeetingTranscript:", error);
    throw error;
  }
}

export async function getMeetingRecording(botId: string) {
  try {
    const response = await recallAxios.get(`/api/v1/bot/${botId}/recording`);
    return response.data;
  } catch (error) {
    console.error("Error in getMeetingRecording:", error);
    throw error;
  }
}

export async function generateSummary(transcript: string): Promise<{ summary: string }> {
  try {
    // TODO: Implement actual summary generation logic
    // This could involve calling an AI service or using a language model
    const summary = `Summary of transcript: ${transcript.slice(0, 500)}...`;
    return { summary };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export async function generateNotes(transcript: string): Promise<{ notes: string }> {
  try {
    // TODO: Implement actual notes generation logic
    // This could involve calling an AI service or using a language model
    const notes = `Key points from transcript:\n1. ${transcript.slice(0, 200)}...\n2. ${transcript.slice(200, 400)}...`;
    return { notes };
  } catch (error) {
    console.error("Error generating notes:", error);
    throw error;
  }
}

export async function checkMeetingStatus(botId: string): Promise<BotStatus> {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Checking meeting status for botId: ${botId} (Attempt ${retries + 1})`);
      const response = await recallAxios.get(`/api/v1/bot/${botId}`);
      console.log("Full bot status:", JSON.stringify(response.data, null, 2));

      let status = 'ONGOING';
      let processingStatus = 'PENDING';
      if (response.data.status_changes && response.data.status_changes.length > 0) {
        const lastStatus = response.data.status_changes[response.data.status_changes.length - 1];
        if (lastStatus.code === 'call_ended') {
          status = 'ENDED';
          processingStatus = 'PROCESSING';
        } else if (lastStatus.code === 'done') {
          status = 'ENDED';
          processingStatus = 'COMPLETED';
        }
      }

      const result: BotStatus = {
        status,
        processingStatus,
        videoUrl: response.data.video_url,
        audioUrl: response.data.audio_url,
        transcriptUrl: response.data.transcript_url,
        aiSummary: null,
        aiNotes: null,
      };

      // If the meeting has ended and processing is complete, generate summary and notes
      if (status === 'ENDED' && processingStatus === 'COMPLETED' && response.data.transcript_url) {
        const transcript = await getMeetingTranscript(botId);
        const summary = await generateSummary(transcript);
        const notes = await generateNotes(transcript);
        result.aiSummary = summary.summary;
        result.aiNotes = notes.notes;
      }

      console.log("Processed meeting status:", result);
      return result;
    } catch (error) {
      console.error(`Error checking meeting status (Attempt ${retries + 1}):`, error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
        }
      }
      throw error;
    }
  }
  throw new Error(`Failed to check meeting status after ${MAX_RETRIES} attempts`);
}