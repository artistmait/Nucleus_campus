/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Atom, Menu, X, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { buildApiUrl } from "../../config/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    setRoleId(user.role_id);
    const userId = user.id;

   const fetchHistory = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/notifications/${userId}`));
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
          notificationsRef.current = data.notifications;
          setUnreadCount(data.notifications.filter((n) => !n.read).length);
        }
      } catch (e) {
        console.error("Failed to fetch notification history", e);
      }
    };
    fetchHistory();

    const eventSource = new EventSource(
      buildApiUrl(`/api/notifications/stream/${userId}`),
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "connected") return;

      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (data.type === "critical") {
        toast.error(data.message, { autoClose: false, position: "top-center" });
      } else {
        toast.info(data.message, { position: "top-center" });
      }
    };

    return () => eventSource.close();
  }, []);

   const markAsRead = async () => {
    const unreadIds = notificationsRef.current
      .filter((n) => !n.read)
      .map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await fetch(buildApiUrl("/api/notifications/read"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const handleHomeClick = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user1 = JSON.parse(userStr);
    if (user1.role_id === 1 || user1.role_id === 4)
      navigate("/student/myapplications");
    else if (user1.role_id === 2) navigate("/incharge/dashboard");
    else if (user1.role_id === 3) navigate("/higher-authority/dashboard");
    else navigate("/");
  };

  const getBadgeStyle = () => {
    if (roleId === 3) return "bg-red-600";       // HA — red, sees all critical
    if (roleId === 2) return "bg-orange-500";    // Incharge — orange
    return "bg-red-600";                          // Student — red
  };

   const NotificationItem = ({ notif, idx }) => {
    const isCritical = notif.type === "critical";
    const time = new Date(notif.created_at).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
    return (
      <div
        key={notif.id || idx}
        className={`px-4 py-3 border-b border-gray-50 flex gap-3 items-start transition-colors
          ${notif.read ? "bg-white" : "bg-indigo-50"}
          ${isCritical ? "border-l-4 border-l-red-500" : "border-l-4 border-l-indigo-300"}`}
      >
        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0
          ${isCritical ? "bg-red-500" : "bg-indigo-400"}
          ${notif.read ? "opacity-30" : ""}`}
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-sm leading-snug
            ${notif.read ? "text-gray-500 font-normal" : "text-gray-900 font-medium"}`}>
            {notif.message}
          </span>
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>
      </div>
    );
  };


 return (
    <nav className="bg-indigo-900 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 cursor-pointer flex flex-row gap-2 py-2" onClick={handleHomeClick}>
            <Atom className="size-7" />
            <span className="text-2xl font-extrabold tracking-wide">NUCLEUS</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex space-x-6 items-center">
            <button onClick={handleHomeClick} className="hover:text-indigo-300 transition-colors font-semibold">
              Home
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAsRead();
                }}
                className="text-white hover:text-indigo-300 transition-colors relative mt-1"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full ${getBadgeStyle()}`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-gray-800 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-indigo-900">Notifications</h3>
                    {/* ✅ Role label */}
                    <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">
                      {roleId === 1 || roleId === 4 ? "Student" : roleId === 2 ? "Incharge" : "Authority"}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 text-sm font-medium">
                        No alerts right now
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <NotificationItem key={notif.id || idx} notif={notif} idx={idx} />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 pl-2">
              <button onClick={handleLogout} className="text-white hover:text-indigo-300 transition-colors font-medium border border-indigo-400 px-4 py-1.5 rounded-lg hover:bg-indigo-800">
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAsRead(); }}
              className="text-white relative mt-1"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full ${getBadgeStyle()}`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile notifications overlay */}
      {showNotifications && (
        <div className="md:hidden absolute w-full bg-white text-gray-800 max-h-96 overflow-y-auto shadow-2xl border-b border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-indigo-900">Notifications</h3>
            <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">
              {roleId === 1 || roleId === 4 ? "Student" : roleId === 2 ? "Incharge" : "Authority"}
            </span>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No alerts right now</div>
          ) : (
            notifications.map((notif, idx) => (
              <NotificationItem key={notif.id || idx} notif={notif} idx={idx} />
            ))
          )}
        </div>
      )}

      {isOpen && (
        <div className="md:hidden bg-indigo-800 px-4 pb-4 space-y-2">
          <button onClick={handleHomeClick} className="block hover:text-indigo-300 py-2">Home</button>
          <button onClick={handleLogout} className="block hover:text-indigo-300 py-2">Sign Out</button>
        </div>
      )}
    </nav>
  );
}

