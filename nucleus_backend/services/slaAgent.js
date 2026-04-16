import pool from '../config/dbConfig.js';
import notificationService from './notificationService.js';

const CHECK_INTERVAL_MS = 60 * 1000;
const SLA_THRESHOLD_MINUTES = 5;

export const startSlaAgent = () => {
    console.log("Starting Agentic SLA Escalation Agent...");

    setInterval(async () => {
        try {
            // ✅ Fix: added 'a' alias, also notify student
            const query = `
                SELECT a.*, u.username AS student_name
                FROM applications a
                JOIN users u ON a.student_id = u.id
                WHERE a.status = 'pending'
                AND a.priority != 'critical'
                AND a.created_at < NOW() - INTERVAL '${SLA_THRESHOLD_MINUTES} minutes'
            `;
            const result = await pool.query(query);

            for (const app of result.rows) {
                let isCriticalByAI = true;

                if (isCriticalByAI) {
                    await pool.query(
                        'UPDATE applications SET priority = $1 WHERE application_id = $2',
                        ['critical', app.application_id]
                    );
                    console.log(`[SLA Agent] Escalated Application ${app.application_id} to CRITICAL.`);

                    const appLabel = (app.type || "Application")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                    // Notify incharge
                    if (app.incharge_id) {
                        await notificationService.sendNotification(
                            app.incharge_id,
                            `SLA Alert: ${app.student_name}'s ${appLabel} (#${app.application_id}) breached SLA. Auto-escalated to CRITICAL.`,
                            'critical'
                        );
                    }

                    // ✅ Also notify the student
                    if (app.student_id) {
                        await notificationService.sendNotification(
                            app.student_id,
                            `Your ${appLabel} application (#${app.application_id}) has been escalated to CRITICAL due to SLA breach.`,
                            'critical'
                        );
                    }
                }
            }
        } catch (error) {
            console.error("[SLA Agent] Error:", error);
        }
    }, CHECK_INTERVAL_MS);
};