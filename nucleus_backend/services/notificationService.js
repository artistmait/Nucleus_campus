import prisma from '../config/prismaClient.js';

class NotificationService {
    constructor() {
        this.clients = new Map(); 
    }

    addClient(req, res, userId) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const clientId = Date.now();
        
        if (!this.clients.has(userId)) {
            this.clients.set(userId, []);
        }
        this.clients.get(userId).push({ id: clientId, res });

        console.log(`User ${userId} connected to SSE. Client ID: ${clientId}`);

        // Initial connection message to establish stream
        res.write(`data: ${JSON.stringify({ type: 'connected', message: "Connected to Notifications stream" })}\n\n`);

        req.on('close', () => {
            console.log(`User ${userId} SSE connection closed. Client ID: ${clientId}`);
            let userClients = this.clients.get(userId);
            if (userClients) {
                userClients = userClients.filter(client => client.id !== clientId);
                if (userClients.length === 0) {
                    this.clients.delete(userId);
                } else {
                    this.clients.set(userId, userClients);
                }
            }
        });
    }

    async sendNotification(userId, message, type = 'info') {
        try {
            // 1. Save to DB
            const notification = await prisma.notification.create({
                data: {
                    user_id: userId,
                    message,
                    type,
                },
            });

            // 2. Broadcast via SSE if online
            if (this.clients.has(userId)) {
                 const userClients = this.clients.get(userId);
                 userClients.forEach(client => {
                     client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
                 });
            }
            return notification;
        } catch (error) {
             console.error("Error sending notification:", error);
             throw error;
        }
    }
    
    async getNotifications(userId) {
         try {
             // fetch last 50
             const notifications = await prisma.notification.findMany({
                 where: { user_id: userId },
                 orderBy: { created_at: 'desc' },
                 take: 50,
             });
             return notifications;
         } catch(e) {
             throw e;
         }
    }
}

const notificationService = new NotificationService();
export default notificationService;
