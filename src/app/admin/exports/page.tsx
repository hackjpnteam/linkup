'use client';

import { useState } from 'react';

export default function AdminExportsPage() {
  const [exportType, setExportType] = useState<'users' | 'studylogs' | 'assignments'>('users');
  const [format, setFormat] = useState<'json' | 'csv'>('csv');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append('type', exportType);
    params.append('format', format);
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);

    try {
      const res = await fetch(`/api/admin/exports?${params}`);

      if (format === 'csv') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-export.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('エクスポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">データ出力</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20 max-w-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              エクスポート対象
            </label>
            <div className="flex gap-3">
              {[
                { value: 'users', label: 'ユーザー' },
                { value: 'studylogs', label: '学習記録' },
                { value: 'assignments', label: '課題' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportType(option.value as typeof exportType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exportType === option.value
                      ? 'bg-primary text-white'
                      : 'bg-cream text-gray-600 hover:bg-cream-dark'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フォーマット
            </label>
            <div className="flex gap-3">
              {[
                { value: 'csv', label: 'CSV' },
                { value: 'json', label: 'JSON' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value as typeof format)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === option.value
                      ? 'bg-primary text-white'
                      : 'bg-cream text-gray-600 hover:bg-cream-dark'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {exportType === 'studylogs' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間（オプション）
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">開始日</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">終了日</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium"
          >
            {loading ? 'エクスポート中...' : 'エクスポート'}
          </button>
        </div>
      </div>
    </div>
  );
}
