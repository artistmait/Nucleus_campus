import express from 'express';
import {
    getNotifications,
    markAsRead,
    streamNotifications
} from '../controllers/notificationController.js';

const notificationRouter = express.Router();

// SSE stream
notificationRouter.get('/stream/:user_id', streamNotifications);

// ✅ Static route MUST be before dynamic /:user_id
notificationRouter.put('/read', markAsRead);

// History fetch
notificationRouter.get('/:user_id', getNotifications);

export default notificationRouter;