import prisma from '../config/prismaClient.js';
import notificationService from './notificationService.js';

const CHECK_INTERVAL_MS = 60 * 1000;
const SLA_THRESHOLD_MINUTES = 5;

export const startSlaAgent = () => {
    console.log("Starting Agentic SLA Escalation Agent...");

    setInterval(async () => {
        try {
            const thresholdDate = new Date(Date.now() - SLA_THRESHOLD_MINUTES * 60 * 1000);

            const breachedApps = await prisma.application.findMany({
                where: {
                    status: 'pending',
                    priority: { not: 'critical' },
                    created_at: { lt: thresholdDate },
                },
                include: {
                    student: {
                        select: { username: true },
                    },
                },
            });

            for (const app of breachedApps) {
                let isCriticalByAI = true;

                if (isCriticalByAI) {
                    await prisma.application.update({
                        where: { id: app.id },
                        data: { priority: 'critical' },
                    });
                    console.log(`[SLA Agent] Escalated Application ${app.application_id} to CRITICAL.`);

                    const appLabel = (app.type || "Application")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                    // Notify incharge
                    if (app.incharge_id) {
                        await notificationService.sendNotification(
                            app.incharge_id,
                            `SLA Alert: ${app.student?.username}'s ${appLabel} (#${app.application_id}) breached SLA. Auto-escalated to CRITICAL.`,
                            'critical'
                        );
                    }

                    // Also notify the student
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