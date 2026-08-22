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
                console.log(
                    `[SLA Agent] Application ${app.application_id} breached SLA. Skipping auto-escalation (HOD-only CRITICAL escalation).`
                );
            }
        } catch (error) {
            console.error("[SLA Agent] Error:", error);
        }
    }, CHECK_INTERVAL_MS);
};