import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, X, Edit2, ChevronDown, AlertCircle, Check, Loader } from 'lucide-react';

const AdminDashboard = () => {
  // Supabase 設定
  const SUPABASE_URL = 'https://xwzotyjutiwwgvfldre.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3em90dmp1dGl4d3BndmZsZHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDIyMTAsImV4cCI6MjA4ODExODIxMH0.tShaPJdJbm3wPfT7u6v4x_dzGnmYbIZMWmS9koZonk';

  // State管理
  const [sections, setSections] = useState([
    {
      id: 1,
      title: 'ヒーロー',
      type: 'hero',
      visible: true,
      content: {
        headline: 'Smart Asset - 不動産修繕マッチングプラットフォーム',
        subheadline: '修繕工事を迅速に、透明に。',
        ctaText: 'プロフェッショナルを探す',
        imageUrl: '/placeholder-hero.jpg'
      }
    },
    {
      id: 2,
      title: '特徴',
      type: 'features',
      visible: true,
      content: {
        heading: 'Smart Asset の特徴',
        features: [
          { id: 'f1', title: 'スピード', description: '最短24時間でマッチング' },
          { id: 'f2', title: '透明性', description: 'すべての見積もりが可視化' },
          { id: 'f3', title: '信頼', description: '認定プロフェッショナルのみ' }
        ]
      }
    },
    {
      id: 3,
      title: 'CTA',
      type: 'cta',
      visible: true,
      content: {
        heading: 'さあ、始めましょう。',
        description: '無料で登録、今すぐプロを見つけます。',
        buttonText: '登録する'
      }
    }
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('ただいまメンテナンス中です。\nしばらくお待ちください。');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // マウント時にデータ取得
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Supabaseからデータ取得
  const loadDataFromSupabase = async () => {
    try {
      setLoading(true);

      // ページデータ取得
      const pagesResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/pages?select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (pagesResponse.ok) {
        const pages = await pagesResponse.json();
        if (pages.length > 0) {
          setSections(pages[0].sections || sections);
        }
      }

      // メンテナンスモード設定取得
      const settingsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?select=*&key=eq.maintenance`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        if (settings.length > 0) {
          setMaintenanceMode(settings[0].value === true);
          if (settings[0].message) {
            setMaintenanceMessage(settings[0].message);
          }
        }
      }
    } catch (error) {
      console.error('Supabaseからのデータ取得に失敗:', error);
      alert('データ読み込みエラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // セクションデータを保存
  const saveToSupabase = async () => {
    try {
      setLoading(true);
      setSaveStatus('saving');

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pages`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sections: sections,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Supabaseへの保存に失敗:', error);
      alert('保存エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // メンテナンスモード切り替え
  const toggleMaintenanceMode = async () => {
    try {
      setMaintenanceLoading(true);
      const newMode = !maintenanceMode;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?key=eq.maintenance`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: newMode,
            message: maintenanceMessage,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        setMaintenanceMode(newMode);
        alert(newMode ? 'メンテナンスモードに切り替えました' : 'メンテナンスモードを解除しました');
      } else {
        throw new Error('切り替えに失敗しました');
      }
    } catch (error) {
      console.error('メンテナンスモード切り替えエラー:', error);
      alert('エラー: ' + error.message);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // 編集開始
  const handleEdit = (section) => {
    setEditingId(section.id);
    setEditData(JSON.parse(JSON.stringify(section.content)));
  };

  // 保存
  const handleSave = (sectionId) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content: editData } : s
    ));
    setEditingId(null);
    saveToSupabase();
  };

  // 削除
  const handleDelete = (sectionId) => {
    if (window.confirm('このセクションを削除しますか？')) {
      const newSections = sections.filter(s => s.id !== sectionId);
      setSections(newSections);
      saveToSupabase();
    }
  };

  // 表示/非表示切り替え
  const toggleVisibility = (sectionId) => {
    const newSections = sections.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    setSections(newSections);
    saveToSupabase();
  };

  // 入力値変更
  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(editData));
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditData(newData);
  };

  // セクション追加
  const addNewSection = () => {
    const newId = Math.max(...sections.map(s => s.id), 0) + 1;
    const newSections = [...sections, {
      id: newId,
      title: '新しいセクション',
      type: 'custom',
      visible: true,
      content: { heading: '', description: '' }
    }];
    setSections(newSections);
    saveToSupabase();
  };

  // プレビュー描画
  const renderPreview = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-8 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">{section.content.headline}</h1>
            <p className="text-lg text-slate-300 mb-6">{section.content.subheadline}</p>
            <button className="bg-white text-slate-900 px-6 py-2 rounded font-semibold hover:bg-slate-100 transition">
              {section.content.ctaText}
            </button>
          </div>
        );
      case 'features':
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-12">{section.content.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.content.features?.map(f => (
                <div key={f.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition">
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="bg-slate-100 py-16 px-8 text-center rounded-lg">
            <h2 className="text-3xl font-bold mb-4">{section.content.heading}</h2>
            <p className="text-slate-600 mb-8">{section.content.description}</p>
            <button className="bg-slate-900 text-white px-8 py-3 rounded font-semibold hover:bg-slate-800 transition">
              {section.content.buttonText}
            </button>
          </div>
        );
      default:
        return <div className="p-6 bg-slate-50 rounded-lg">{section.content.heading}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Smart Asset Admin</h1>
            <p className="text-sm text-slate-500">ホームページ管理ダッシュボード</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* メンテナンスモード切り替えボタン */}
            <button
              onClick={toggleMaintenanceMode}
              disabled={maintenanceLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                maintenanceMode
                  ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={maintenanceMode ? 'メンテナンスモード: ON' : 'メンテナンスモード: OFF'}
            >
              {maintenanceLoading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <AlertCircle size={18} />
              )}
              <span className="text-sm">
                {maintenanceMode ? 'メンテナンス中' : 'サイト稼働中'}
              </span>
            </button>

            {/* 保存ボタン */}
            <button
              onClick={saveToSupabase}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              保存
            </button>

            {/* プレビュー/エディタ切り替え */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded border transition ${
                previewMode
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {previewMode ? <Eye size={18} /> : <EyeOff size={18} />}
              {previewMode ? 'プレビュー' : 'エディタ'}
            </button>

            {/* セクション追加 */}
            <button
              onClick={addNewSection}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition font-medium"
            >
              <Plus size={18} />
              追加
            </button>
          </div>
        </div>

        {/* ステータスバー */}
        {saveStatus && (
          <div className={`border-t ${
            saveStatus === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2">
              {saveStatus === 'success' ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">保存しました</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-700 font-medium">保存に失敗しました</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && sections.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader size={32} className="animate-spin mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500">データを読み込み中...</p>
            </div>
          </div>
        ) : previewMode ? (
          // プレビューモード
          <div className="space-y-12">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">ページプレビュー</h2>
            </div>
            {sections.filter(s => s.visible).map(section => (
              <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
                {renderPreview(section)}
              </div>
            ))}
          </div>
        ) : (
          // エディタモード
          <div className="space-y-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">セクション管理</h2>
                <p className="text-sm text-slate-500">{sections.length} セクション</p>
              </div>
            </div>

            {sections.map(section => (
              <div
                key={section.id}
                className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition bg-white"
              >
                {/* セクションヘッダー */}
                <div
                  className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition"
                  onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition ${expandedId === section.id ? 'rotate-180' : ''}`}
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900">{section.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">タイプ: {section.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(section.id);
                      }}
                      className="p-2 hover:bg-slate-200 rounded transition text-slate-600"
                      title={section.visible ? '非表示にする' : '表示にする'}
                    >
                      {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(section);
                      }}
                      className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                      title="編集"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(section.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded transition text-red-600"
                      title="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* 展開コンテンツ */}
                {expandedId === section.id && (
                  <>
                    <div className="p-6 bg-white border-b border-slate-200">
                      <div className="mb-6 pb-6 border-b border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-4">プレビュー</h4>
                        {renderPreview(section)}
                      </div>

                      {editingId === section.id ? (
                        // 編集フォーム
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-500 uppercase">編集</h4>

                          {section.type === 'hero' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  メインタイトル
                                </label>
                                <input
                                  type="text"
                                  value={editData.headline || ''}
                                  onChange={(e) => handleInputChange('headline', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  サブタイトル
                                </label>
                                <input
                                  type="text"
                                  value={editData.subheadline || ''}
                                  onChange={(e) => handleInputChange('subheadline', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  CTAボタンテキスト
                                </label>
                                <input
                                  type="text"
                                  value={editData.ctaText || ''}
                                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  画像URL
                                </label>
                                <input
                                  type="text"
                                  value={editData.imageUrl || ''}
                                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          )}

                          {section.type === 'features' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  セクションタイトル
                                </label>
                                <input
                                  type="text"
                                  value={editData.heading || ''}
                                  onChange={(e) => handleInputChange('heading', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  特徴
                                </label>
                                {editData.features?.map((feature, idx) => (
                                  <div key={feature.id} className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                                    <input
                                      type="text"
                                      value={feature.title}
                                      onChange={(e) => {
                                        const newFeatures = [...editData.features];
                                        newFeatures[idx].title = e.target.value;
                                        handleInputChange('features', newFeatures);
                                      }}
                                      placeholder="タイトル"
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                      type="text"
                                      value={feature.description}
                                      onChange={(e) => {
                                        const newFeatures = [...editData.features];
                                        newFeatures[idx].description = e.target.value;
                                        handleInputChange('features', newFeatures);
                                      }}
                                      placeholder="説明"
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {section.type === 'cta' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  タイトル
                                </label>
                                <input
                                  type="text"
                                  value={editData.heading || ''}
                                  onChange={(e) => handleInputChange('heading', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  説明
                                </label>
                                <textarea
                                  value={editData.description || ''}
                                  onChange={(e) => handleInputChange('description', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows="2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  ボタンテキスト
                                </label>
                                <input
                                  type="text"
                                  value={editData.buttonText || ''}
                                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4 border-t border-slate-200">
                            <button
                              onClick={() => handleSave(section.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                            >
                              <Save size={16} />
                              保存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition"
                            >
                              <X size={16} />
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">
                          <p>ステータス: {section.visible ? <span className="text-green-600 font-medium">表示中</span> : <span className="text-slate-500 font-medium">非表示</span>}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
