import notificationService from '../services/notificationService.js';
import prisma from '../config/prismaClient.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.params.user_id, 10);
        const notes = await notificationService.getNotifications(userId);
        res.status(200).json({ success: true, notifications: notes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { ids } = req.body;
        if (ids && ids.length > 0) {
            await prisma.notification.updateMany({
                where: { id: { in: ids } },
                data: { read: true },
            });
        }
        res.status(200).json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export const streamNotifications = (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    notificationService.addClient(req, res, userId);
};