import React, { useState } from 'react';
import {
  X,
  Database,
  Globe,
  Calendar,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { FullScheduleData } from '../types';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  scheduleData: FullScheduleData;
  onClose: () => void;
  onImportData: (data: FullScheduleData) => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  scheduleData,
  onClose,
  onImportData,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deploy' | 'database' | 'backup'>('deploy');

  if (!isOpen) return null;

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(scheduleData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TKB_LanVy_KimAnh_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.cells && parsed.weeks) {
          onImportData(parsed);
          alert('Đã nhập thành công dữ liệu Thời khóa biểu! ✨');
        } else {
          alert('File JSON không đúng định dạng Thời khóa biểu.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col text-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-gray-800">
                Hướng Dẫn Lưu Dữ Liệu &amp; Đưa Web Online 24/7
              </h3>
              <p className="text-xs text-gray-500">
                Giải đáp chi tiết cách lưu trữ, đưa web lên link online &amp; quản lý nhiều tuần
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 pt-2 bg-gray-50/50 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'deploy'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Đưa web lên Link Online</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'database'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Cách lưu trữ cơ sở dữ liệu</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>3. Sao lưu &amp; Phục hồi JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 leading-relaxed grow">
          {/* TAB 1: HOW TO DEPLOY ONLINE */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                <div className="font-bold text-purple-900 text-sm flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Làm sao để đưa web này lên link mở được trên điện thoại &amp; máy tính?
                </div>
                <p className="text-gray-600">
                  Bạn có 2 cách rất đơn giản và hoàn toàn miễn phí để có link web công khai cho cả bạn và bạn bè mở bất kỳ đâu:
                </p>
              </div>

              {/* Method 1: AI Studio Deploy */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Cách 1: Triển khai ngay trên AI Studio (Nhanh nhất - 1 click)</span>
                </div>
                <p className="text-gray-600">
                  Nhấn vào menu <strong>Deploy</strong> hoặc <strong>Share</strong> ở góc trên bên phải màn hình AI Studio. Hệ thống sẽ tự động đóng gói cả giao diện và backend server, cấp cho bạn 1 đường link dạng:
                </p>
                <div className="bg-gray-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between">
                  <span>https://tkb-lanvy-kimanh.run.app</span>
                  <span className="text-gray-500 text-[10px]">Chạy 24/7 trực tiếp</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Bất cứ khi nào bạn hoặc Vy/Ánh chỉnh sửa một tiết học hay bấm Đồng bộ, máy chủ sẽ lưu lại ngay lập tức và link đó luôn hiển thị lịch mới nhất!
                </p>
              </div>

              {/* Method 2: Render or Vercel */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Cách 2: Đưa lên GitHub &amp; Render.com (Miễn phí vĩnh viễn)</span>
                </div>
                <p className="text-gray-600">
                  Khi bạn tải toàn bộ mã nguồn này về máy:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-1">
                  <li>Tạo một repository trên <strong>GitHub</strong> và đẩy toàn bộ thư mục code lên.</li>
                  <li>Vào trang <strong>Render.com</strong> hoặc <strong>Railway.app</strong> (miễn phí), chọn <em>"New Web Service"</em> và liên kết tới repo GitHub vừa tạo.</li>
                  <li>Cài đặt lệnh chạy:
                    <div className="bg-gray-100 text-gray-800 p-2 rounded-lg font-mono my-1">
                      Build Command: <strong>npm run build</strong><br />
                      Start Command: <strong>npm start</strong>
                    </div>
                  </li>
                  <li>Nhấn Deploy. Render sẽ cấp 1 link web HTTPS để chia sẻ cho nhau!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: HOW DATABASE & SUPABASE WORKS */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã tích hợp cơ sở dữ liệu Supabase Cloud Realtime ✨
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Mọi thao tác chỉnh sửa tiết học, đồng bộ ô/ngày/tuần đều tự động lưu lên Cloud Supabase và đẩy thời gian thực sang thiết bị của Lan Vy và Kim Ánh!
                </p>
              </div>

              {/* SQL Setup Box */}
              <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>Bước tạo bảng trên Supabase (Chỉ làm 1 lần duy nhất)</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCode(
                        `create table if not exists public.schedule_store (\n  id text primary key,\n  data jsonb not null,\n  updated_at timestamp with time zone default timezone('utc'::text, now()) not null\n);\n\nalter table public.schedule_store enable row level security;\n\ncreate policy "Allow public access" on public.schedule_store for all using (true) with check (true);\n\nalter publication supabase_realtime add table public.schedule_store;`,
                        'sql'
                      )
                    }
                    className="text-[11px] font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSection === 'sql' ? 'Đã sao chép!' : 'Chép mã SQL'}</span>
                  </button>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Vào <strong>Supabase Dashboard</strong> &gt; chọn dự án của bạn &gt; vào mục <strong>SQL Editor</strong> &gt; Dán đoạn mã này vào và nhấn <strong>Run</strong>:
                </p>
                <pre className="bg-gray-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
{`create table if not exists public.schedule_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.schedule_store enable row level security;
create policy "Allow public access" on public.schedule_store for all using (true) with check (true);
alter publication supabase_realtime add table public.schedule_store;`}
                </pre>
              </div>

              {/* Vercel Environment Variables Box */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs space-y-2">
                <div className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-rose-500" />
                  <span>Cài đặt Biến Môi Trường (Environment Variables) khi đưa lên Vercel</span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Trong trang cấu hình dự án trên Vercel (mục <strong>Settings &gt; Environment Variables</strong>), hãy thêm 2 biến sau:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-[11px] space-y-1 text-gray-700">
                  <div><strong>VITE_SUPABASE_URL</strong> = https://zuqukykninqoskfetlaq.supabase.co</div>
                  <div><strong>VITE_SUPABASE_ANON_KEY</strong> = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5 mb-1">
                  <Download className="w-4 h-4 text-amber-600" />
                  Sao lưu &amp; Khôi phục dữ liệu thời khóa biểu
                </div>
                <p className="text-gray-600">
                  Bạn có thể tải file sao lưu JSON về máy tính bất cứ lúc nào để lưu trữ cá nhân hoặc gửi cho bạn bè nhập vào máy của họ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-4 border border-rose-200 rounded-2xl bg-rose-50/40 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                      <Download className="w-4 h-4 text-rose-600" />
                      Xuất File Sao Lưu (.JSON)
                    </h4>
                    <p className="text-gray-600 text-[11px] mb-3">
                      Tải xuống toàn bộ lịch của Lan Vy, Kim Ánh, danh sách các tuần và ghi chú ôn tập.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải file TKB về máy</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 border border-purple-200 rounded-2xl bg-purple-50/40 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                      <Upload className="w-4 h-4 text-purple-600" />
                      Nhập File Đã Lưu
                    </h4>
                    <p className="text-gray-600 text-[11px] mb-3">
                      Chọn file JSON từ máy để khôi phục hoặc nạp dữ liệu TKB mới.
                    </p>
                  </div>
                  <label className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>Chọn file JSON để khôi phục</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            🌸 Thiết kế dành riêng cho Lan Vy &amp; Kim Ánh
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 font-bold rounded-xl text-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
