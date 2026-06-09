import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/shared/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import PilledButton from '../../components/shared/PilledButton'
import AnimatedCard from '../../components/ui/AnimatedCard'
import AnimatedButton from '../../components/ui/AnimatedButton'
import { apiFetch } from '../../services/api'
import type { UserResponseDTO } from '../../types/entities'

// Known roles — kept in sync with backend Role seeder
const ROLES = [
    { id: 1, name: 'CLIENTE' },
    { id: 2, name: 'ADMIN' },
]

function getRoleId(roleName: string): number {
    return ROLES.find((r) => r.name === roleName)?.id ?? 1
}

type UserRow = {
    id: number
    name: string
    email: string
    cpf: string
    role: string
    active: boolean
}

type UserStatusBadgeProps = {
    readonly active: boolean
}

function UserStatusBadge({ active }: UserStatusBadgeProps) {
    const cls = active
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
        : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${cls}`}>
            {active ? 'Ativo' : 'Inativo'}
        </span>
    )
}

type RoleBadgeProps = {
    readonly role: string
}

function RoleBadge({ role }: RoleBadgeProps) {
    const isAdmin = role === 'ADMIN'
    const cls = isAdmin
        ? 'border-windu-purple/40 bg-windu-purple/10 text-windu-purple'
        : 'border-jedi-blue/40 bg-jedi-blue/10 text-jedi-blue'
    return (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${cls}`}>
            {role}
        </span>
    )
}

type EditUserButtonProps = {
    readonly user: UserRow
    readonly onEdit: (user: UserRow) => void
}

function EditUserButton({ user, onEdit }: EditUserButtonProps) {
    return (
        <PilledButton variant="primary" className="px-3 py-2 text-xs" onClick={() => onEdit(user)}>
            Editar
        </PilledButton>
    )
}

const renderStatusCell: DataTableColumn<UserRow>['accessor'] = (user) => <UserStatusBadge active={user.active} />
const renderRoleCell: DataTableColumn<UserRow>['accessor'] = (user) => <RoleBadge role={user.role} />

function createUserColumns(onEdit: (user: UserRow) => void): DataTableColumn<UserRow>[] {
    return [
        { header: 'Nome', accessor: 'name' },
        { header: 'E-mail', accessor: 'email' },
        { header: 'CPF', accessor: 'cpf' },
        { header: 'Perfil', accessor: renderRoleCell },
        { header: 'Status', accessor: renderStatusCell },
        {
            header: 'Ações',
            accessor: (user) => <EditUserButton user={user} onEdit={onEdit} />,
        },
    ]
}

function mapUserToRow(user: UserResponseDTO): UserRow {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
        active: user.active,
    }
}

function UsersManagement() {
    const [users, setUsers] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    // Edit fields
    const [editName, setEditName] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editCpf, setEditCpf] = useState('')
    const [editPassword, setEditPassword] = useState('')
    const [editRoleId, setEditRoleId] = useState(1)
    const [editActive, setEditActive] = useState(true)

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiFetch('/users')
            if (!response.ok) throw new Error('Erro ao carregar utilizadores')
            const data: UserResponseDTO[] = await response.json()
            setUsers(data.map(mapUserToRow))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar utilizadores')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleSyncSwapi = async () => {
        try {
            setIsSyncing(true)
            setError(null)
            const response = await apiFetch('/users/import', { method: 'POST' })
            if (!response.ok) throw new Error('Erro ao sincronizar utilizadores com SWAPI')
            await loadUsers()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao sincronizar utilizadores com SWAPI')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleOpenModal = (user: UserRow) => {
        setSelectedUser(user)
        setEditName(user.name)
        setEditEmail(user.email)
        setEditCpf(user.cpf)
        setEditPassword('')
        setEditRoleId(getRoleId(user.role))
        setEditActive(user.active)
        setIsModalOpen(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const userColumns = useMemo(() => createUserColumns(handleOpenModal), [])

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedUser(null)
        setEditPassword('')
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedUser) return

        try {
            setIsSaving(true)

            const putResponse = await apiFetch(`/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    email: editEmail,
                    cpf: editCpf,
                    password: editPassword,
                    roleId: editRoleId,
                }),
            })
            if (!putResponse.ok) {
                throw new Error((await putResponse.text()) || 'Erro ao atualizar utilizador')
            }

            if (selectedUser.active !== editActive) {
                const patchResponse = await apiFetch(`/users/${selectedUser.id}/active`, {
                    method: 'PATCH',
                })
                if (!patchResponse.ok) {
                    throw new Error((await patchResponse.text()) || 'Erro ao atualizar status')
                }
            }

            await loadUsers()
            handleCloseModal()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar utilizador')
        } finally {
            setIsSaving(false)
        }
    }

    const modalTitle = selectedUser ? `Editar Utilizador — ${selectedUser.name}` : 'Editar Utilizador'

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <PageHeader
                overline="Administração"
                title="Gestão de Utilizadores"
                description="Gestão de contas, perfis e acessos dos utilizadores da plataforma."
                actions={
                    <div className="flex gap-2">
                        <AnimatedButton
                            variant="ghost-white"
                            className="px-4 py-2 text-sm"
                            onClick={handleSyncSwapi}
                            disabled={isSyncing}
                        >
                            {isSyncing ? 'A sincronizar...' : 'Sincronizar SWAPI'}
                        </AnimatedButton>
                        <PilledButton variant="primary" className="px-4 py-2 text-sm" onClick={loadUsers}>
                            Atualizar
                        </PilledButton>
                    </div>
                }
            />

            {loading && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-gray-400">Carregando utilizadores...</p>
                </AnimatedCard>
            )}

            {!loading && error && (
                <AnimatedCard className="p-8 text-center">
                    <p className="text-red-400">{error}</p>
                </AnimatedCard>
            )}

            {!loading && !error && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <DataTable columns={userColumns} data={users} rowKey="id" />
                </motion.div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle}>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-2xl border border-panel-border bg-surface-light/30 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-text-secondary">Dados do Utilizador</p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="form-control sm:col-span-2">
                                <label htmlFor="editUserName" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Nome</span>
                                </label>
                                <input
                                    id="editUserName"
                                    type="text"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>

                            <div className="form-control sm:col-span-2">
                                <label htmlFor="editUserEmail" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">E-mail</span>
                                </label>
                                <input
                                    id="editUserEmail"
                                    type="email"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editUserCpf" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">CPF</span>
                                </label>
                                <input
                                    id="editUserCpf"
                                    type="text"
                                    required
                                    maxLength={11}
                                    minLength={11}
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editCpf}
                                    onChange={(e) => setEditCpf(e.target.value)}
                                    placeholder="Somente números"
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="editUserPassword" className="label">
                                    <span className="label-text text-xs uppercase tracking-[0.25em] text-gray-400">Nova Senha</span>
                                </label>
                                <input
                                    id="editUserPassword"
                                    type="password"
                                    required
                                    className="input input-bordered w-full bg-surface-light/30 text-gray-100 placeholder:text-gray-500"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Obrigatória para salvar"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label htmlFor="editUserRole" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Perfil</span>
                            </label>
                            <select
                                id="editUserRole"
                                className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                                value={editRoleId}
                                onChange={(e) => setEditRoleId(Number(e.target.value))}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label htmlFor="editUserActive" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-text-secondary">Status</span>
                            </label>
                            <select
                                id="editUserActive"
                                className="select select-bordered w-full bg-surface-light/30 text-gray-100"
                                value={editActive ? 'true' : 'false'}
                                onChange={(e) => setEditActive(e.target.value === 'true')}
                            >
                                <option value="true">ATIVO</option>
                                <option value="false">INATIVO</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-full border border-panel-border px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>
                        <PilledButton variant="primary" type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Guardar Alterações'}
                        </PilledButton>
                    </div>
                </form>
            </Modal>
        </motion.section>
    )
}

export default UsersManagement
