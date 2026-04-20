import axios from "axios";
import prisma from "../config/prismaClient.js";

const DEFAULT_FLASK_URL = "http://localhost:5001";
const flaskBaseUrl = process.env.FLASK_API_URL || DEFAULT_FLASK_URL;
const normalizedFlaskBaseUrl = flaskBaseUrl.replace(/\/+$/, "");

export const feedback_predict = async (req, res) => {
  try {
    const { feedbackText, user_id, q1, q2, q3, text } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const normalize = (value) =>
      typeof value === "string" ? value.trim() : "";

    const normalizedFeedback = normalize(feedbackText);
    const normalizedQ1 = normalize(q1);
    const normalizedQ2 = normalize(q2);
    const normalizedQ3 = normalize(q3);
    const normalizedOther = normalize(text);
    const combined = normalizedFeedback
      ? normalizedFeedback
      : [
          normalizedQ1 ? `Q1: ${normalizedQ1}` : "",
          normalizedQ2 ? `Q2: ${normalizedQ2}` : "",
          normalizedQ3 ? `Q3: ${normalizedQ3}` : "",
          normalizedOther ? `Other: ${normalizedOther}` : "",
        ]
          .filter(Boolean)
          .join(" | ");

    if (!combined) {
      return res.status(400).json({
        success: false,
        message: "Feedback content is required",
      });
    }

    // Send to Flask for prediction
    const flaskResponse = await axios.post(`${normalizedFlaskBaseUrl}/predict`, {
      text: combined,
      q1: normalizedQ1,
      q2: normalizedQ2,
      q3: normalizedQ3,
    });

    const rawSentiment = flaskResponse.data.prediction;

    const SENTIMENT = {
      POSITIVE: 1,
      NEUTRAL: 0,
      NEGATIVE: -1,
    };

    const SENTIMENT_LABEL = {
      [SENTIMENT.POSITIVE]: "positive",
      [SENTIMENT.NEUTRAL]: "neutral",
      [SENTIMENT.NEGATIVE]: "negative",
    };

    const sentimentValue =
      typeof rawSentiment === "number"
        ? rawSentiment
        : String(rawSentiment ?? "").trim().toLowerCase();

    const sentimentMap = {
      positive: SENTIMENT.POSITIVE,
      neutral: SENTIMENT.NEUTRAL,
      negative: SENTIMENT.NEGATIVE,
      "1": SENTIMENT.POSITIVE,
      "0": SENTIMENT.NEUTRAL,
      "-1": SENTIMENT.NEGATIVE,
    };

    const sentimentInt =
      typeof sentimentValue === "number"
        ? sentimentValue
        : sentimentMap[sentimentValue];

    if (![1, 0, -1].includes(sentimentInt)) {
      throw new Error("Invalid sentiment value");
    }

    const sentimentText = SENTIMENT_LABEL[sentimentInt];

    // DB insert using Prisma
    const feedbackRecord = await prisma.feedback.create({
      data: {
        user_id,
        feedback: combined,
        q1: normalizedQ1,
        q2: normalizedQ2,
        q3: normalizedQ3,
        other_text: normalizedOther,
        sentiment: sentimentInt,
        sentiment_text: sentimentText,
      },
    });

    // Send response back to frontend
    return res.status(200).json({
      success: true,
      feedback: feedbackRecord,
      message: "Feedback processed successfully",
    });
  } catch (err) {
    console.error("Feedback prediction error:", err);
    return res.status(500).json({
      success: false,
      message: "Feedback prediction failed",
    });
  }
};

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const sentimentDistribution = await prisma.feedback.groupBy({
      by: ['sentiment_text'],
      _count: { id: true },
    });

    // Format to match original shape: { sentiment_text, count }
    const formattedSentiment = sentimentDistribution.map((row) => ({
      sentiment_text: row.sentiment_text,
      count: row._count.id,
    }));

    // Feedback trend by date — use raw query for DATE() aggregate
    const feedbackTrend = await prisma.$queryRaw`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS total
      FROM feedback
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    res.json({
      sentimentDistribution: formattedSentiment,
      feedbackTrend,
    });
  } catch (err) {
    console.error("Feedback analytics error:", err);
    res.status(500).json({ message: "Failed to fetch feedback analytics" });
  }
};
