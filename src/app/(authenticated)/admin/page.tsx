'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import {
	UserPlus,
	FileText,
	DollarSign,
	RefreshCw,
	Database,
	ShieldAlert,
	Minimize2,
	Shield,
	List,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { formatCurrency } from '@/lib/formatters';

type TabId = 'usuarios' | 'empenhos' | 'solicitacoes' | 'fornecedores' | 'listar';

interface Fornecedor {
	id: number;
	nome: string;
	cnpj: string;
	responsavel_tecnico?: { id: number; name: string; email: string } | null;
}

async function apiFetch(path: string, opts?: RequestInit) {
	const token = localStorage.getItem('auth_token');
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
	const res = await fetch(`${apiUrl}${path}`, {
		...opts,
		headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts?.headers ?? {}) },
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || `Erro ${res.status}`);
	}
	return res.json();
}

export default function AdminPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabId>('usuarios');

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<{ activeTab: TabId }>({
		titulo: 'Painel Administrativo',
		icone: <Shield className="w-4 h-4" />,
		onRestore: (dados) => {
			setActiveTab(dados.activeTab);
			toast.success('Painel administrativo restaurado!');
		},
	});

	useEffect(() => {
		if (!loading && (!user || user.perfil !== 'gestor_suporte')) router.push('/');
	}, [user, loading, router]);

	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Painel Minimizado</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

	if (loading) return <Loading text="Verificando permissões..." />;

	if (!user || user.perfil !== 'gestor_suporte') {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Card className="max-w-md w-full">
					<div className="p-8 text-center">
						<div className="flex justify-center mb-4">
							<div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
								<ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
							</div>
						</div>
						<h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Apenas usuários com perfil <strong>Gestor de Suporte</strong> podem acessar esta área.
						</p>
						<Button onClick={() => router.push('/')} variant="outline">
							Voltar para o Início
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
		{ id: 'usuarios', label: 'Usuários', icon: <UserPlus className="w-4 h-4" /> },
		{ id: 'fornecedores', label: 'Fornecedores', icon: <Database className="w-4 h-4" /> },
		{ id: 'empenhos', label: 'Empenhos', icon: <FileText className="w-4 h-4" /> },
		{ id: 'solicitacoes', label: 'Solicitações', icon: <DollarSign className="w-4 h-4" /> },
		{ id: 'listar', label: 'Consultar Dados', icon: <List className="w-4 h-4" /> },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader title="Painel Administrativo" description="Preparar massa de dados para demonstração" />
				<Button variant="outline" onClick={() => minimizar({ activeTab })} className="flex items-center gap-2">
					<Minimize2 className="w-4 h-4" />
					Minimizar
				</Button>
			</div>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						✓ Painel administrativo restaurado com os dados salvos
					</p>
				</div>
			)}

			<Card>
				<div className="flex flex-wrap border-b">
					{TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-colors ${
								activeTab === tab.id
									? 'border-b-2 border-blue-600 text-blue-600'
									: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
							}`}>
							{tab.icon}
							{tab.label}
						</button>
					))}
				</div>

				<div className="p-6">
					{activeTab === 'usuarios' && <UsuariosTab />}
					{activeTab === 'fornecedores' && <FornecedoresTab />}
					{activeTab === 'empenhos' && <EmpenhosTab />}
					{activeTab === 'solicitacoes' && <SolicitacoesTab />}
					{activeTab === 'listar' && <ListarDadosTab />}
				</div>
			</Card>
		</div>
	);
}

// ── Hook para carregar fornecedores ──────────────────────────────────────────

function useFornecedores() {
	const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const data = await apiFetch('/admin/fornecedores');
			setFornecedores(data.fornecedores ?? []);
		} catch {
			// silently fail — not critical
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	return { fornecedores, loading, reload: load };
}

// ── TAB: USUÁRIOS ────────────────────────────────────────────────────────────

function UsuariosTab() {
	const { fornecedores } = useFornecedores();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		cpf: '',
		password: '',
		perfil: '',
		fornecedor_id: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch('/admin/usuarios', { method: 'POST', body: JSON.stringify(formData) });
			toast.success('Usuário criado com sucesso!');
			setFormData({ name: '', email: '', cpf: '', password: '', perfil: '', fornecedor_id: '' });
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor="name">Nome Completo *</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						required
					/>
				</div>
				<div>
					<Label htmlFor="email">E-mail *</Label>
					<Input
						id="email"
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						required
					/>
				</div>
				<div>
					<Label htmlFor="cpf">CPF *</Label>
					<Input
						id="cpf"
						value={formData.cpf}
						onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
						placeholder="000.000.000-00"
						required
					/>
				</div>
				<div>
					<Label htmlFor="password">Senha *</Label>
					<Input
						id="password"
						type="password"
						value={formData.password}
						onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						required
					/>
				</div>
				<div>
					<Label htmlFor="perfil">Perfil *</Label>
					<Select value={formData.perfil} onValueChange={(v) => setFormData({ ...formData, perfil: v })}>
						<SelectTrigger>
							<SelectValue placeholder="Selecione o perfil" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="responsavel_tecnico">Responsável Técnico (Fornecedor)</SelectItem>
							<SelectItem value="gestor_contrato">Gestor de Contrato</SelectItem>
							<SelectItem value="gestor_suporte">Gestor de Suporte</SelectItem>
							<SelectItem value="operador_pmsjp">Operador PMSJP</SelectItem>
							<SelectItem value="operador_orcamentario">Operador Orçamentário</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{formData.perfil === 'responsavel_tecnico' && (
					<div>
						<Label htmlFor="fornecedor_id">Fornecedor *</Label>
						<Select
							value={formData.fornecedor_id}
							onValueChange={(v) => setFormData({ ...formData, fornecedor_id: v })}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o fornecedor" />
							</SelectTrigger>
							<SelectContent>
								{fornecedores.map((f) => (
									<SelectItem key={f.id} value={String(f.id)}>
										{f.nome} — {f.cnpj}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>
			<Button type="submit" className="w-full">
				<UserPlus className="w-4 h-4 mr-2" />
				Criar Usuário
			</Button>
		</form>
	);
}

// ── TAB: FORNECEDORES ────────────────────────────────────────────────────────

function FornecedoresTab() {
	const [formData, setFormData] = useState({
		nome: '',
		cnpj: '',
		responsavel_tecnico_nome: '',
		responsavel_tecnico_email: '',
		responsavel_tecnico_cpf: '',
		responsavel_tecnico_password: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch('/admin/fornecedores', { method: 'POST', body: JSON.stringify(formData) });
			toast.success('Fornecedor e Responsável Técnico criados com sucesso!');
			setFormData({
				nome: '',
				cnpj: '',
				responsavel_tecnico_nome: '',
				responsavel_tecnico_email: '',
				responsavel_tecnico_cpf: '',
				responsavel_tecnico_password: '',
			});
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Dados do Fornecedor</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label>Nome da Empresa *</Label>
						<Input
							value={formData.nome}
							onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
							required
						/>
					</div>
					<div>
						<Label>CNPJ *</Label>
						<Input
							value={formData.cnpj}
							onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
							placeholder="00.000.000/0000-00"
							required
						/>
					</div>
				</div>
			</div>

			<div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
				<h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Responsável Técnico (Usuário)</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label>Nome Completo *</Label>
						<Input
							value={formData.responsavel_tecnico_nome}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_nome: e.target.value })}
							required
						/>
					</div>
					<div>
						<Label>E-mail *</Label>
						<Input
							type="email"
							value={formData.responsavel_tecnico_email}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_email: e.target.value })}
							required
						/>
					</div>
					<div>
						<Label>CPF *</Label>
						<Input
							value={formData.responsavel_tecnico_cpf}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_cpf: e.target.value })}
							placeholder="000.000.000-00"
							required
						/>
					</div>
					<div>
						<Label>Senha *</Label>
						<Input
							type="password"
							value={formData.responsavel_tecnico_password}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_password: e.target.value })}
							required
						/>
					</div>
				</div>
			</div>

			<Button type="submit" className="w-full">
				<Database className="w-4 h-4 mr-2" />
				Criar Fornecedor + Responsável Técnico
			</Button>
		</form>
	);
}

// ── TAB: EMPENHOS ────────────────────────────────────────────────────────────

function EmpenhosTab() {
	const { fornecedores, loading: loadingFornecedores } = useFornecedores();
	const [formData, setFormData] = useState({
		numero: '',
		fornecedor_id: '',
		valor: '',
		saldo: '',
		data_emissao: '',
		status: 'disponivel',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch('/admin/empenhos', { method: 'POST', body: JSON.stringify(formData) });
			toast.success('Empenho criado com sucesso! Um contrato foi criado/vinculado automaticamente.');
			setFormData({
				numero: '',
				fornecedor_id: '',
				valor: '',
				saldo: '',
				data_emissao: '',
				status: 'disponivel',
			});
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const handleValorChange = (v: string) => {
		setFormData({ ...formData, valor: v, saldo: v });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
				Um contrato será criado ou reaproveitado automaticamente para o fornecedor selecionado.
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label>Número do Empenho *</Label>
					<Input
						value={formData.numero}
						onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
						placeholder="Ex: 2026/0001"
						required
					/>
				</div>

				<div>
					<Label>Fornecedor *</Label>
					<Select
						value={formData.fornecedor_id}
						onValueChange={(v) => setFormData({ ...formData, fornecedor_id: v })}
						disabled={loadingFornecedores}>
						<SelectTrigger>
							<SelectValue
								placeholder={loadingFornecedores ? 'Carregando...' : 'Selecione o fornecedor'}
							/>
						</SelectTrigger>
						<SelectContent>
							{fornecedores.map((f) => (
								<SelectItem key={f.id} value={String(f.id)}>
									{f.nome} — {f.cnpj}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>Valor Total *</Label>
					<Input
						type="number"
						step="0.01"
						value={formData.valor}
						onChange={(e) => handleValorChange(e.target.value)}
						placeholder="Ex: 50000.00"
						required
					/>
				</div>

				<div>
					<Label>Saldo Disponível *</Label>
					<Input
						type="number"
						step="0.01"
						value={formData.saldo}
						onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
						placeholder="Ex: 50000.00"
						required
					/>
				</div>

				<div>
					<Label>Data de Emissão *</Label>
					<Input
						type="date"
						value={formData.data_emissao}
						onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
						required
					/>
				</div>

				<div>
					<Label>Status *</Label>
					<Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="disponivel">Disponível</SelectItem>
							<SelectItem value="sem_saldo">Sem Saldo</SelectItem>
							<SelectItem value="bloqueado">Bloqueado</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button type="submit" className="w-full">
				<FileText className="w-4 h-4 mr-2" />
				Criar Empenho
			</Button>
		</form>
	);
}

// ── TAB: SOLICITAÇÕES ────────────────────────────────────────────────────────

function SolicitacoesTab() {
	const [solicitacaoId, setSolicitacaoId] = useState('');
	const [novoStatus, setNovoStatus] = useState('');
	const [motivo, setMotivo] = useState('');
	const [statusAtual, setStatusAtual] = useState('');
	const [loadingSolicitacao, setLoadingSolicitacao] = useState(false);
	const [solicitacaoInfo, setSolicitacaoInfo] = useState<any>(null);

	const handleCarregar = async () => {
		if (!solicitacaoId) {
			toast.error('Digite o ID da solicitação');
			return;
		}
		setLoadingSolicitacao(true);
		try {
			const data = await apiFetch(`/solicitacoes/${solicitacaoId}`);
			const sol = data.solicitacao || data;
			setSolicitacaoInfo(sol);
			setStatusAtual(sol.status);
			toast.success('Solicitação carregada!');
		} catch (error: any) {
			toast.error(error.message || 'Solicitação não encontrada');
			setSolicitacaoInfo(null);
			setStatusAtual('');
		} finally {
			setLoadingSolicitacao(false);
		}
	};

	const handleAtualizarStatus = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await apiFetch(`/admin/solicitacoes/${solicitacaoId}/status`, {
				method: 'POST',
				body: JSON.stringify({ status: novoStatus, motivo: motivo || undefined }),
			});
			toast.success('Status atualizado com sucesso!');
			setStatusAtual(novoStatus);
			setNovoStatus('');
			setMotivo('');
			handleCarregar();
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">1. Buscar Solicitação</h3>
				<div className="flex gap-2">
					<Input
						type="number"
						value={solicitacaoId}
						onChange={(e) => setSolicitacaoId(e.target.value)}
						placeholder="ID da solicitação"
						className="flex-1"
					/>
					<Button type="button" onClick={handleCarregar} disabled={loadingSolicitacao}>
						{loadingSolicitacao ? 'Carregando...' : 'Buscar'}
					</Button>
				</div>

				{solicitacaoInfo && (
					<div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border text-sm grid grid-cols-2 gap-3">
						<div>
							<p className="text-muted-foreground text-xs">Número</p>
							<p className="font-semibold">{solicitacaoInfo.numero}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Valor</p>
							<p className="font-semibold">{formatCurrency(Number(solicitacaoInfo.valor))}</p>
						</div>
						<div className="col-span-2">
							<p className="text-muted-foreground text-xs">Status Atual</p>
							<p className="font-semibold text-blue-600 dark:text-blue-400">{statusAtual}</p>
						</div>
					</div>
				)}
			</div>

			<div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
					<RefreshCw className="w-4 h-4" />
					2. Atualizar Status
				</h3>

				<form onSubmit={handleAtualizarStatus} className="space-y-4">
					<div>
						<Label>Novo Status *</Label>
						<Select value={novoStatus} onValueChange={setNovoStatus} disabled={!solicitacaoInfo}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pendente">📝 Pendente</SelectItem>
								<SelectItem value="aguardando_aprovacao">⏳ Aguardando Aprovação dos Anexos</SelectItem>
								<SelectItem value="anexos_recusados">❌ Anexos Recusados</SelectItem>
								<SelectItem value="aguardando_gestor">👔 Aguardando Autorização do Gestor</SelectItem>
								<SelectItem value="em_liquidacao">💰 Em Liquidação</SelectItem>
								<SelectItem value="secretario">📜 Secretário(a)</SelectItem>
								<SelectItem value="iss">🏛️ ISS</SelectItem>
								<SelectItem value="em_ordem_pagamento">📄 Em Ordem de Pagamento</SelectItem>
								<SelectItem value="autorizacao">✅ Autorização</SelectItem>
								<SelectItem value="bordero">📊 Borderô</SelectItem>
								<SelectItem value="pagamento_remessa">📤 Pagamento em Remessa</SelectItem>
								<SelectItem value="pagamento_realizado">✔️ Pagamento Realizado</SelectItem>
								<SelectItem value="cancelada">❌ Cancelada</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Motivo/Observação (Opcional)</Label>
						<Textarea
							value={motivo}
							onChange={(e) => setMotivo(e.target.value)}
							placeholder="Descreva o motivo da mudança de status..."
							rows={3}
							disabled={!solicitacaoInfo}
						/>
					</div>

					<Button type="submit" className="w-full" disabled={!solicitacaoInfo || !novoStatus}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Atualizar Status
					</Button>
				</form>
			</div>
		</div>
	);
}

// ── TAB: CONSULTAR DADOS ─────────────────────────────────────────────────────

function ListarDadosTab() {
	const { fornecedores, loading, reload } = useFornecedores();
	const [empenhos, setEmpenhos] = useState<any[]>([]);
	const [loadingEmpenhos, setLoadingEmpenhos] = useState(false);
	const [view, setView] = useState<'fornecedores' | 'empenhos'>('fornecedores');

	const loadEmpenhos = async () => {
		setLoadingEmpenhos(true);
		try {
			const data = await apiFetch('/fornecedor/empenhos');
			setEmpenhos(data.empenhos ?? []);
		} catch (error: any) {
			toast.error(error.message || 'Erro ao carregar empenhos');
		} finally {
			setLoadingEmpenhos(false);
		}
	};

	useEffect(() => {
		if (view === 'empenhos') loadEmpenhos();
	}, [view]);

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Button
					size="sm"
					variant={view === 'fornecedores' ? 'default' : 'outline'}
					onClick={() => setView('fornecedores')}>
					Fornecedores
				</Button>
				<Button
					size="sm"
					variant={view === 'empenhos' ? 'default' : 'outline'}
					onClick={() => setView('empenhos')}>
					Empenhos (Portal Fornecedor)
				</Button>
			</div>

			{view === 'fornecedores' && (
				<div>
					<div className="flex justify-between items-center mb-3">
						<p className="text-sm text-muted-foreground">
							{fornecedores.length} fornecedor(es) cadastrado(s)
						</p>
						<Button size="sm" variant="outline" onClick={reload} disabled={loading}>
							<RefreshCw className="w-3.5 h-3.5 mr-1" />
							Atualizar
						</Button>
					</div>
					{loading ? (
						<p className="text-sm text-muted-foreground">Carregando...</p>
					) : fornecedores.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Nome</TableHead>
										<TableHead>CNPJ</TableHead>
										<TableHead>Responsável Técnico</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{fornecedores.map((f) => (
										<TableRow key={f.id}>
											<TableCell className="font-mono text-xs">{f.id}</TableCell>
											<TableCell className="font-medium">{f.nome}</TableCell>
											<TableCell className="text-sm text-muted-foreground">{f.cnpj}</TableCell>
											<TableCell className="text-sm">
												{f.responsavel_tecnico ? (
													<div>
														<p>{f.responsavel_tecnico.name}</p>
														<p className="text-xs text-muted-foreground">
															{f.responsavel_tecnico.email}
														</p>
													</div>
												) : (
													<Badge variant="outline" className="text-xs">
														Sem RT
													</Badge>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			)}

			{view === 'empenhos' && (
				<div>
					<div className="flex justify-between items-center mb-3">
						<p className="text-sm text-muted-foreground">{empenhos.length} empenho(s)</p>
						<Button size="sm" variant="outline" onClick={loadEmpenhos} disabled={loadingEmpenhos}>
							<RefreshCw className="w-3.5 h-3.5 mr-1" />
							Atualizar
						</Button>
					</div>
					{loadingEmpenhos ? (
						<p className="text-sm text-muted-foreground">Carregando...</p>
					) : empenhos.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nenhum empenho encontrado para o usuário atual.</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Número</TableHead>
										<TableHead>Saldo</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{empenhos.map((e: any) => (
										<TableRow key={e.id}>
											<TableCell className="font-mono text-xs">{e.id}</TableCell>
											<TableCell className="font-medium">{e.numero}</TableCell>
											<TableCell>{formatCurrency(Number(e.saldo ?? 0))}</TableCell>
											<TableCell>
												<Badge variant="outline" className="text-xs">
													{e.status}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
