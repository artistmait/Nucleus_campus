import axios from "axios";
import pool from "../config/dbConfig.js";

export const feedback_predict = async (req, res) => {
  const client = await pool.connect();
  try {
    const { feedbackText, user_id } = req.body;

    if (!feedbackText) {
      return res.status(400).json({
        success: false,
        message: "Feedback text is required",
      });
    }

    // Send to Flask for prediction
    const flaskResponse = await axios.post("http://localhost:5001/predict", {
      text: feedbackText,
    });

    const sentiment = flaskResponse.data.prediction;
    // console.log("sentiment ->" ,typeof(sentiment))

    const SENTIMENT = {
      GOOD: 1,
      NEUTRAL: 0,
      BAD: -1,
    };

    const SENTIMENT_LABEL = {
      [SENTIMENT.GOOD]: "good",
      [SENTIMENT.NEUTRAL]: "neutral",
      [SENTIMENT.BAD]: "bad",
    };

    const sentimentInt = Number(sentiment);

    if (![1, 0, -1].includes(sentimentInt)) {
      throw new Error("Invalid sentiment value");
    }

    const sentimentText = SENTIMENT_LABEL[sentimentInt];

    //db insert
    const feedback_insert = await client.query(
      `INSERT INTO feedback (user_id, feedback, sentiment, sentiment_text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, 
      feedbackText, 
      sentimentInt, 
      sentimentText]
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
