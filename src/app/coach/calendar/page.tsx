'use client';

import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { name: string; email: string };
  changeRequest?: {
    status: string;
    newStartTime: string;
    newEndTime: string;
    reason: string;
  };
}

interface Student {
  _id: string;
  name: string;
}

export default function CoachCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    studentId: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    Promise.all([
      fetch(`/api/coach/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
      fetch('/api/coach/students'),
    ])
      .then(async ([eventsRes, studentsRes]) => {
        const eventsData = await eventsRes.json();
        const studentsData = await studentsRes.json();
        setEvents(eventsData.events || []);
        setStudents(studentsData.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    await fetch('/api/coach/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    setShowCreateModal(false);
    window.location.reload();
  };

  const handleAction = async (eventId: string, action: string) => {
    await fetch(`/api/coach/calendar/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => new Date(e.startTime) >= new Date() && e.status !== 'cancelled');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          セッション作成
        </button>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600">{event.student?.name}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(event.startTime)}</p>
                  {event.changeRequest && event.changeRequest.status === 'pending' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        変更リクエスト: {formatDateTime(event.changeRequest.newStartTime)}
                      </p>
                      <p className="text-sm text-yellow-700">理由: {event.changeRequest.reason}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAction(event.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          拒否
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(event.id, 'complete')}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                  >
                    完了
                  </button>
                  <button
                    onClick={() => handleAction(event.id, 'cancel')}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-primary/20 text-center">
          <p className="text-gray-500">予定されたセッションはありません</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新規セッション</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">受講生</label>
                <select
                  value={createForm.studentId}
                  onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">選択してください</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日時</label>
                <input
                  type="datetime-local"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日時</label>
                <input
                  type="datetime-local"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
