import React, { useState } from 'react';
import { useAuth, ADMIN_ACCOUNT } from '../../context/AuthContext.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function AdminUsers({ onShowToast }) {
  const { users, currentUser, updateUserRole, deleteUser, addUser, switchAccount } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmState, setConfirmState] = useState(null);

  // Modal for adding a user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    fandomInterest: 'anime',
  });

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      !searchTerm.trim() ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleToggleRole = (user) => {
    if (user.email === ADMIN_ACCOUNT.email) {
      if (onShowToast) onShowToast('Không thể thay đổi quyền của Quản trị viên tối cao.', 'error');
      return;
    }
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    updateUserRole(user.id, nextRole);
    if (onShowToast) {
      onShowToast(`Đã chuyển quyền của ${user.name} thành "${nextRole.toUpperCase()}".`, 'info');
    }
  };

  const handleDelete = (user) => {
    if (user.email === ADMIN_ACCOUNT.email) {
      if (onShowToast) onShowToast('Không thể xóa Quản trị viên tối cao.', 'error');
      return;
    }
    setConfirmState({
      title: 'Xóa tài khoản?',
      message: `Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email}) không? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa tài khoản',
      variant: 'danger',
      onConfirm: () => {
        const res = deleteUser(user.id);
        if (res.success) {
          if (onShowToast) onShowToast(`Đã xóa tài khoản "${user.name}".`, 'success');
        } else if (onShowToast) {
          onShowToast(res.message, 'error');
        }
        setConfirmState(null);
      },
    });
  };

  const handleSwitchTo = (user) => {
    switchAccount(user.email);
    if (onShowToast) {
      onShowToast(`Đã chuyển phiên làm việc sang "${user.name}".`, 'info');
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      if (onShowToast) onShowToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }
    const res = addUser(newUser);
    if (res.success) {
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', fandomInterest: 'anime' });
      if (onShowToast) onShowToast(`Đã tạo tài khoản "${newUser.name}" thành công!`, 'success');
    } else if (onShowToast) {
      onShowToast(res.message, 'error');
    }
  };

  return (
    <div className="admin-users-module">
      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-people" style={{ color: '#2ecc71' }}></i>
            Quản lý Người Dùng & Phân Quyền
          </h3>
          <p className="text-secondary small mb-0">
            Hiển thị <strong className="text-white">{filteredUsers.length}</strong> / {users.length} tài khoản thành viên trong hệ thống FandomVerse.
          </p>
        </div>
        <button type="button" className="fv-admin-btn-primary" onClick={() => setIsModalOpen(true)}>
          <i className="bi bi-person-plus-fill"></i> Thêm tài khoản mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="fv-admin-card mb-4 p-3">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 translate-middle-y text-secondary ms-3"></i>
              <input
                type="text"
                className="fv-admin-input ps-5"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="fv-admin-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">🛡️ Quản trị viên (Admin)</option>
              <option value="user">👤 Người dùng thường (User)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="fv-admin-table-container">
        <div className="table-responsive">
          <table className="fv-admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Avatar</th>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Sở thích Fandom</th>
                <th>Ngày tạo</th>
                <th className="text-end" style={{ width: '220px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isCurrent = currentUser?.email === user.email;
                const isChief = user.email === ADMIN_ACCOUNT.email;
                return (
                  <tr key={user.id} style={{ background: isCurrent ? 'rgba(0, 245, 212, 0.04)' : undefined }}>
                    <td>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, #00f5d4 0%, #00b4d8 100%)'
                            : 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                          color: '#060911',
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-white d-flex align-items-center gap-2">
                        {user.name}
                        {isCurrent && (
                          <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.65rem' }}>
                            Đang đăng nhập
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-secondary small">
                      <code>{user.email}</code>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'bg-info-subtle text-info border border-info'
                            : 'bg-secondary-subtle text-light border border-secondary'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`fv-badge-cat fv-cat-${user.fandomInterest || 'anime'}`}>
                        {user.fandomInterest || 'Anime'}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      {user.createdAt ? user.createdAt.split('T')[0] : 'N/A'}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        {!isCurrent && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleSwitchTo(user)}
                            title="Đăng nhập tài khoản này"
                          >
                            <i className="bi bi-box-arrow-in-right"></i>
                          </button>
                        )}
                        {!isChief && (
                          <button
                            type="button"
                            className={`btn btn-sm ${user.role === 'admin' ? 'btn-outline-warning' : 'btn-outline-info'}`}
                            onClick={() => handleToggleRole(user)}
                            title={`Chuyển thành ${user.role === 'admin' ? 'User' : 'Admin'}`}
                          >
                            <i className={`bi ${user.role === 'admin' ? 'bi-person-down' : 'bi-shield-check'}`}></i>
                          </button>
                        )}
                        {!isChief && (
                          <button
                            type="button"
                            className="fv-admin-btn-danger"
                            onClick={() => handleDelete(user)}
                            title="Xóa tài khoản"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fv-admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-header">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="bi bi-person-plus text-success"></i> Thêm tài khoản mới
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="fv-admin-modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Họ và tên *</label>
                      <input
                        type="text"
                        className="fv-admin-input"
                        placeholder="VD: Nguyễn Văn A..."
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Email đăng nhập *</label>
                      <input
                        type="email"
                        className="fv-admin-input"
                        placeholder="user@fandomverse.io"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Mật khẩu *</label>
                      <input
                        type="password"
                        className="fv-admin-input"
                        placeholder="Tối thiểu 6 ký tự..."
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Vai trò</label>
                      <select
                        className="fv-admin-select"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      >
                        <option value="user">👤 Người dùng thường (User)</option>
                        <option value="admin">🛡️ Quản trị viên (Admin)</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="fv-admin-form-group">
                      <label className="fv-admin-label">Fandom yêu thích</label>
                      <select
                        className="fv-admin-select"
                        value={newUser.fandomInterest}
                        onChange={(e) => setNewUser({ ...newUser, fandomInterest: e.target.value })}
                      >
                        <option value="anime">Anime</option>
                        <option value="gaming">Gaming</option>
                        <option value="movies">Movies</option>
                        <option value="tvshows">TV Shows</option>
                        <option value="kpop">K-Pop</option>
                        <option value="comics">Comics</option>
                        <option value="manga">Manga</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fv-admin-modal-footer">
                <button
                  type="button"
                  className="fv-admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="fv-admin-btn-primary">
                  <i className="bi bi-check-lg"></i> Tạo tài khoản
                </button>
              </div>
            </form>
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
