import { useEffect, useState } from 'react';
import { authService } from '../services/authentication';
import { deleteUserById, getUserById, getUsers, updateUserById } from '../services/admin';
import { capitalize, formatDate } from './utils/formatters';
import { useTheme } from './products/useTheme';

const ROLES = ['customer', 'admin'];

export default function UsersPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [users, setUsers] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    isActive: true,
  });

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [usersResponse, meResponse] = await Promise.all([
        getUsers(),
        authService.getCurrentUser(),
      ]);

      setUsers(usersResponse?.data?.users ?? usersResponse?.users ?? []);

      const me = meResponse?.data?.user ?? meResponse?.user ?? meResponse?.data ?? null;
      setCurrentAdminId(me?.id ?? null);
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openEdit(id) {
    setErr('');
    try {
      const response = await getUserById(id);
      const user = response?.data?.user ?? response?.user ?? null;
      if (!user) {
        setErr('User not found');
        return;
      }

      setEditingUserId(user.id);
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        role: user.role ?? 'customer',
        isActive: Boolean(user.isActive),
      });
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to load user details');
    }
  }

  function closeEdit() {
    setEditingUserId(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'customer',
      isActive: true,
    });
  }

  async function onSaveUser(e) {
    e.preventDefault();
    if (!editingUserId) return;

    setSaving(true);
    setErr('');

    try {
      await updateUserById(editingUserId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        isActive: Boolean(form.isActive),
      });

      closeEdit();
      await load();
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteUser(id) {
    setErr('');

    if (currentAdminId && Number(id) === Number(currentAdminId)) {
      setErr('You cannot delete your own admin account.');
      setConfirmDeleteId(null);
      return;
    }

    try {
      await deleteUserById(id);
      setConfirmDeleteId(null);
      await load();
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || 'Failed to delete user');
      setConfirmDeleteId(null);
    }
  }

  const inputCls = `w-full rounded-lg border px-3 py-2 outline-none transition ${
    dark
      ? 'border-slate-700 bg-slate-900 text-white focus:border-slate-500'
      : 'border-slate-300 bg-white text-slate-900 focus:border-slate-400'
  }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Users
          </h1>
          <p className={dark ? 'text-slate-400' : 'text-slate-600'}>
            Manage customer and admin accounts.
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      )}

      <div className={`overflow-hidden rounded-xl ring-1 ${dark ? 'ring-slate-800' : 'ring-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-225 w-full text-left text-sm">
          <thead className={dark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'}>
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${dark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {loading ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`} colSpan={6}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={dark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User avatar'}
                          className={`h-10 w-10 rounded-full object-cover ring-1 ${dark ? 'ring-slate-700' : 'ring-slate-200'}`}
                        />
                      ) : (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                          {initials(user.firstName, user.lastName)}
                        </div>
                      )}

                      <div>
                        <p className="font-medium">{fullName(user.firstName, user.lastName)}</p>
                        <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p>{user.email || '-'}</p>
                    <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.phone || 'No phone'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-sky-500/15 text-sky-500'
                        : dark
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-100 text-slate-500'
                    }`}>
                      {capitalize(user.role || 'customer')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-red-500/15 text-red-500'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(user.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                      >
                        Edit
                      </button>

                      {confirmDeleteId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/30"
                          disabled={Number(user.id) === Number(currentAdminId)}
                          title={Number(user.id) === Number(currentAdminId) ? 'You cannot delete your own account' : 'Delete user'}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {!loading ? (
        <div className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </div>
      ) : null}

      {editingUserId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-lg rounded-xl border p-5 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Edit User
            </h2>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Update account details and permissions.
            </p>

            <form onSubmit={onSaveUser} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={`mb-1 block text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                    className={inputCls}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {capitalize(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4"
                />
                <span className={dark ? 'text-slate-300' : 'text-slate-700'}>Active account</span>
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEdit}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    dark
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fullName(firstName, lastName) {
  const name = `${firstName || ''} ${lastName || ''}`.trim();
  return name || 'Unnamed user';
}

function initials(firstName, lastName) {
  const a = String(firstName || '').trim().charAt(0);
  const b = String(lastName || '').trim().charAt(0);
  return `${a}${b}`.toUpperCase() || 'U';
}
