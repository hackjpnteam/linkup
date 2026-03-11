'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  coach: {
    name: string;
    email: string;
  };
  changeRequest?: {
    status: string;
    newStartTime: string;
    newEndTime: string;
    reason: string;
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeForm, setChangeForm] = useState({
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    fetch(`/api/student/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRequestChange = async () => {
    if (!selectedEvent) return;

    await fetch('/api/student/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: selectedEvent.id,
        ...changeForm,
      }),
    });

    setShowChangeModal(false);
    setSelectedEvent(null);
    window.location.reload();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusLabel = {
    scheduled: '予定',
    completed: '完了',
    cancelled: 'キャンセル',
    change_requested: '変更リクエスト中',
  };

  const statusColor = {
    scheduled: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
    change_requested: 'bg-yellow-500/20 text-yellow-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          読み込み中...
        </div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.startTime) >= new Date() && e.status !== 'cancelled');
  const pastEvents = events.filter(e => new Date(e.startTime) < new Date() || e.status === 'cancelled');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">カレンダー</h1>
        <p className="text-gray-500">コーチングセッションのスケジュール</p>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">予定のセッション</h2>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <span className={`px-2.5 py-1 text-xs rounded-full ${
                        statusColor[event.status as keyof typeof statusColor]
                      }`}>
                        {statusLabel[event.status as keyof typeof statusLabel]}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{formatDateTime(event.startTime)}</p>
                    <p className="text-sm text-gray-500">コーチ: {event.coach?.name}</p>
                  </div>
                  {event.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowChangeModal(true);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      変更リクエスト
                    </button>
                  )}
                </div>
                {event.changeRequest && event.changeRequest.status === 'pending' && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      変更リクエスト中: {formatDateTime(event.changeRequest.newStartTime)}
                    </p>
                    <p className="text-sm text-yellow-500/70">理由: {event.changeRequest.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">予定されたセッションはありません</p>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">過去のセッション</h2>
          <div className="space-y-2">
            {pastEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="bg-white/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-700">{event.title}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(event.startTime)}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs rounded-full self-start sm:self-auto ${
                  statusColor[event.status as keyof typeof statusColor]
                }`}>
                  {statusLabel[event.status as keyof typeof statusLabel]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      {showChangeModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">日程変更リクエスト</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  新しい開始日時
                </label>
                <input
                  type="datetime-local"
                  value={changeForm.newStartTime}
                  onChange={(e) => setChangeForm({ ...changeForm, newStartTime: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  新しい終了日時
                </label>
                <input
                  type="datetime-local"
                  value={changeForm.newEndTime}
                  onChange={(e) => setChangeForm({ ...changeForm, newEndTime: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  理由
                </label>
                <textarea
                  value={changeForm.reason}
                  onChange={(e) => setChangeForm({ ...changeForm, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={3}
                  placeholder="変更の理由を入力..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChangeModal(false)}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRequestChange}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                リクエスト送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
