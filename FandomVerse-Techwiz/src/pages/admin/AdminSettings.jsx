import React, { useState } from 'react';
import { dataService } from '../../services/dataService.js';
import { useAuth, ADMIN_ACCOUNT, DEMO_ACCOUNT } from '../../context/AuthContext.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function AdminSettings({ onShowToast }) {
  const { currentUser, switchAccount } = useAuth();
  const [stats, setStats] = useState(() => dataService.getStats());
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);

  const handleExportBackup = () => {
    try {
      const backup = dataService.exportBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fandomverse_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (onShowToast) onShowToast('Đã tải xuống tệp sao lưu hệ thống JSON!', 'success');
    } catch (e) {
      if (onShowToast) onShowToast('Lỗi xuất sao lưu: ' + e.message, 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        setImportJsonText(text);
      } catch (err) {
        if (onShowToast) onShowToast('Không thể đọc tệp: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      if (!importJsonText.trim()) {
        if (onShowToast) onShowToast('Vui lòng dán hoặc chọn tệp JSON sao lưu.', 'error');
        return;
      }
      const parsed = JSON.parse(importJsonText);
      dataService.importBackup(parsed);
      setStats(dataService.getStats());
      setIsImportModalOpen(false);
      setImportJsonText('');
      if (onShowToast) onShowToast('Phục hồi dữ liệu từ bản sao lưu thành công!', 'success');
    } catch (err) {
      if (onShowToast) onShowToast('Lỗi phục hồi dữ liệu: ' + err.message, 'error');
    }
  };

  const handleResetToDefaults = () => {
    setConfirmState({
      title: 'Khôi phục dữ liệu gốc?',
      message: 'CẢNH BÁO: Thao tác này sẽ đặt lại tất cả dữ liệu (Bài viết, Trailers, Sự kiện, Merch, Nhân vật) về dữ liệu mẫu mặc định ban đầu (13 mục / phân loại, tổng 455 mục). Mọi thay đổi hiện tại sẽ bị mất và không thể hoàn tác.',
      confirmLabel: 'Khôi phục gốc',
      variant: 'warning',
      onConfirm: () => {
        dataService.resetAllToDefaults();
        setStats(dataService.getStats());
        if (onShowToast) {
          onShowToast('Đã khôi phục toàn bộ hệ thống về dữ liệu mẫu gốc tiêu chuẩn!', 'success');
        }
        setConfirmState(null);
      },
    });
  };

  const handleSwitchAdmin = () => {
    switchAccount(ADMIN_ACCOUNT.email);
    if (onShowToast) onShowToast('Đã chuyển sang tài khoản Quản trị viên tối cao!', 'info');
  };

  const handleSwitchDemo = () => {
    switchAccount(DEMO_ACCOUNT.email);
    if (onShowToast) onShowToast('Đã chuyển sang tài khoản người dùng Demo!', 'info');
  };

  return (
    <div className="admin-settings-module">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-gear-fill" style={{ color: '#00f5d4' }}></i>
          Cài Đặt Hệ Thống & Sao Lưu Dữ Liệu
        </h3>
        <p className="text-secondary small mb-0">
          Quản lý trạng thái lưu trữ LocalStorage, sao lưu JSON và khôi phục dữ liệu FandomVerse.
        </p>
      </div>

      <div className="row g-4">
        {/* System Summary Card */}
        <div className="col-12 col-lg-6">
          <div className="fv-admin-card h-100">
            <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <i className="bi bi-hdd-stack text-info"></i> Tình trạng cơ sở dữ liệu
            </h5>
            <div className="table-responsive">
              <table className="table table-dark table-borderless small mb-0">
                <tbody>
                  <tr>
                    <td className="text-secondary">Bài viết & Media:</td>
                    <td className="fw-bold text-end text-white">{stats.totalContents} mục</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Trailers bom tấn:</td>
                    <td className="fw-bold text-end text-white">{stats.totalTrailers} mục</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Sự kiện Fandom:</td>
                    <td className="fw-bold text-end text-white">{stats.totalEvents} mục</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Vật phẩm Merchandise:</td>
                    <td className="fw-bold text-end text-white">{stats.totalMerchandise} mục</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Nhân vật biểu tượng:</td>
                    <td className="fw-bold text-end text-white">{stats.totalCharacters} mục</td>
                  </tr>
                  <tr className="border-top border-secondary">
                    <td className="fw-bold text-info">Tổng số mục dữ liệu:</td>
                    <td className="fw-bold text-end text-info fs-6">{stats.grandTotal} mục</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="small text-secondary mb-1">Phiên đăng nhập hiện tại:</div>
              <div className="fw-bold text-white">{currentUser?.name} ({currentUser?.email})</div>
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={handleSwitchAdmin}
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Account
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleSwitchDemo}
                >
                  <i className="bi bi-person me-1"></i> Demo User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Backup & Restore Card */}
        <div className="col-12 col-lg-6">
          <div className="fv-admin-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-cloud-arrow-down-fill text-success"></i> Sao lưu & Phục hồi
              </h5>
              <p className="text-secondary small mb-4">
                Xuất toàn bộ cơ sở dữ liệu FandomVerse ra tệp tin JSON an toàn trên máy tính của bạn, hoặc phục hồi từ một tệp sao lưu đã lưu trước đó.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div className="fw-bold text-white small">Xuất bản sao lưu (Export JSON)</div>
                    <div className="text-secondary small">Tải về toàn bộ 5 bảng dữ liệu dạng JSON.</div>
                  </div>
                  <button type="button" className="fv-admin-btn-primary" onClick={handleExportBackup}>
                    <i className="bi bi-download"></i> Tải về
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div className="fw-bold text-white small">Nhập bản sao lưu (Import JSON)</div>
                    <div className="text-secondary small">Phục hồi lại dữ liệu từ tệp tin JSON.</div>
                  </div>
                  <button type="button" className="fv-admin-btn-secondary" onClick={() => setIsImportModalOpen(true)}>
                    <i className="bi bi-upload"></i> Nhập tệp
                  </button>
                </div>
              </div>
            </div>

            {/* Factory Reset Area */}
            <div className="mt-4 pt-3 border-top border-secondary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-danger small">Khôi phục dữ liệu gốc (Factory Reset)</div>
                  <div className="text-secondary small">Xóa các thay đổi và đặt lại 455 dữ liệu mẫu tiêu chuẩn.</div>
                </div>
                <button type="button" className="fv-admin-btn-danger" onClick={handleResetToDefaults}>
                  <i className="bi bi-arrow-counterclockwise"></i> Khôi phục gốc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsImportModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-upload text-info"></i> Nhập dữ liệu sao lưu
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsImportModalOpen(false)}
              ></button>
            </div>
            <div className="fv-admin-modal-body">
              <div className="mb-3">
                <label className="fv-admin-label">Chọn tệp tin JSON trên máy tính</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  onChange={handleFileSelect}
                />
              </div>
              <div className="mb-2">
                <label className="fv-admin-label">Hoặc dán nội dung JSON vào khung dưới đây</label>
                <textarea
                  className="fv-admin-textarea font-monospace"
                  rows="8"
                  style={{ fontSize: '0.8rem' }}
                  placeholder='{"version": "2.0.0", "data": { ... }}'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="fv-admin-modal-footer">
              <button
                type="button"
                className="fv-admin-btn-secondary"
                onClick={() => setIsImportModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button type="button" className="fv-admin-btn-primary" onClick={handleApplyImport}>
                <i className="bi bi-check-lg"></i> Áp dụng phục hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmModal
        show={!!confirmState}
        {...confirmState}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
