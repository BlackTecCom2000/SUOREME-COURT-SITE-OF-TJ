import React, { useState, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { AdminModal } from '../../components/ui/AdminModal';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';

interface UserRecord {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'administrator' | 'editor' | 'publisher' | 'court_manager' | 'viewer';
  disabled: number;
  last_login?: string;
  created_at: string;
}

export const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as UserRecord['role'],
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('cms-token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async () => {
    if (!formData.email || !formData.name) return;
    try {
      const token = sessionStorage.getItem('cms-token');
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const roleLabelMap: Record<UserRecord['role'], string> = {
    super_admin: 'Главный Администратор',
    administrator: 'Администратор системы',
    editor: 'Редактор контента',
    publisher: 'Издатель',
    court_manager: 'Куратор судебной сети',
    viewer: 'Наблюдатель',
  };

  const columns: AdminTableColumn<UserRecord>[] = [
    {
      header: 'Сотрудник / Пользователь',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-serif font-bold text-sm flex items-center justify-center shadow-md shrink-0">
            {row.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-bold text-sm text-white">{row.name}</span>
            <span className="font-mono text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Роль и права',
      width: '200px',
      accessor: (row) => (
        <div className="flex flex-col text-left">
          <AdminBadge variant="role" label={roleLabelMap[row.role] || row.role} />
          <span className="font-mono text-[10px] text-slate-500 mt-1 uppercase">
            {row.role}
          </span>
        </div>
      ),
    },
    {
      header: 'Последний вход',
      width: '160px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {row.last_login ? new Date(row.last_login).toLocaleString() : 'Не зафиксирован'}
        </span>
      ),
    },
    {
      header: 'Статус',
      width: '120px',
      accessor: (row) => (
        <AdminBadge
          variant={row.disabled ? 'inactive' : 'active'}
          label={row.disabled ? 'ОТКЛЮЧЕН' : 'АКТИВЕН'}
        />
      ),
    },
    {
      header: 'Действия',
      width: '90px',
      className: 'text-right',
      accessor: (row) => (
        <button
          onClick={() => {
            setEditingUser(row);
            setFormData({
              name: row.name,
              email: row.email,
              password: '',
              role: row.role,
            });
            setIsModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
          title="Редактировать"
        >
          <Edit size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Пользователи и роли</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Разграничение прав доступа сотрудников аппарата Верховного суда
          </p>
        </div>
        <AdminButton
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'editor' });
            setIsModalOpen(true);
          }}
        >
          Добавить пользователя
        </AdminButton>
      </div>

      {/* Main Table */}
      <AdminTable
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Пользователей не найдено"
      />

      {/* User Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Редактирование профиля' : 'Создание пользователя'}
        subtitle="Настройка прав доступа сотрудника"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Отмена
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSaveUser}>
              Сохранить пользователя
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <AdminInput
            label="ФИО Сотрудника"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Раҳимов Алишер Саидович"
          />

          <AdminInput
            label="Служебный Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="a.rahimov@sud.tj"
          />

          <AdminInput
            label={editingUser ? 'Новый пароль (оставьте пустым, если не меняется)' : 'Пароль доступа'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••••••"
          />

          <AdminSelect
            label="Роль в системе"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: 'super_admin', label: 'Super Admin (Полный доступ)' },
              { value: 'administrator', label: 'Administrator (Управление разделами)' },
              { value: 'editor', label: 'Editor (Редактирование новостей и страниц)' },
              { value: 'publisher', label: 'Publisher (Публикация судебных актов)' },
              { value: 'court_manager', label: 'Court Manager (Куратор судебной сети)' },
              { value: 'viewer', label: 'Viewer (Только чтение)' },
            ]}
          />
        </div>
      </AdminModal>
    </div>
  );
};
export default UsersManager;
