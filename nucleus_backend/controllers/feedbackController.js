import axios from "axios";
import pool from "../config/dbConfig.js";

export const feedback_predict = async (req, res) => {
  const client = await pool.connect();
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
    const flaskResponse = await axios.post("http://localhost:5001/predict", {
      text: combined,
      q1: normalizedQ1,
      q2: normalizedQ2,
      q3: normalizedQ3,
    });

    const rawSentiment = flaskResponse.data.prediction;
    // console.log("sentiment ->" ,typeof(rawSentiment))

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

    //db insert
    const feedback_insert = await client.query(
      `INSERT INTO feedback (user_id, feedback, q1, q2, q3, other_text, sentiment, sentiment_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_id,
        combined,
        normalizedQ1,
        normalizedQ2,
        normalizedQ3,
        normalizedOther,
        sentimentInt,
        sentimentText,
      ]
    );

    // Send response back to frontend
    return res.status(200).json({
      success: true,
      feedback : feedback_insert.rows[0],
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
    const sentimentDistribution = await pool.query(`
      SELECT sentiment_text, COUNT(*) AS count
      FROM feedback
      GROUP BY sentiment_text
    `);

    const feedbackTrend = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS total
      FROM feedback
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      sentimentDistribution: sentimentDistribution.rows,
      feedbackTrend: feedbackTrend.rows,
    });
  } catch (err) {
    console.error("Feedback analytics error:", err);
    res.status(500).json({ message: "Failed to fetch feedback analytics" });
  }
};
