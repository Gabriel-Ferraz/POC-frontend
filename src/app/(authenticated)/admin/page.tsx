'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { UserPlus, FileText, DollarSign, RefreshCw, Database, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';

export default function AdminPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'usuarios' | 'empenhos' | 'solicitacoes' | 'fornecedores'>('usuarios');

	// Verificar permissão
	useEffect(() => {
		if (!loading && (!user || user.perfil !== 'gestor_suporte')) {
			router.push('/');
		}
	}, [user, loading, router]);

	// Mostrar loading enquanto verifica
	if (loading) {
		return <Loading text="Verificando permissões..." />;
	}

	// Bloquear acesso se não for gestor_suporte
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
						<h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Acesso Negado</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-4">
							Você não tem permissão para acessar o Painel Administrativo.
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
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

	return (
		<div className="space-y-6">
			<PageHeader
				title="Painel Administrativo"
				description="Gerenciar dados do sistema - Usuários, Empenhos, Solicitações e Fornecedores"
			/>

			{/* Tabs */}
			<Card>
				<div className="flex border-b">
					<button
						onClick={() => setActiveTab('usuarios')}
						className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
							activeTab === 'usuarios'
								? 'border-b-2 border-blue-600 text-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}>
						<UserPlus className="w-4 h-4" />
						Usuários
					</button>
					<button
						onClick={() => setActiveTab('fornecedores')}
						className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
							activeTab === 'fornecedores'
								? 'border-b-2 border-blue-600 text-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}>
						<Database className="w-4 h-4" />
						Fornecedores
					</button>
					<button
						onClick={() => setActiveTab('empenhos')}
						className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
							activeTab === 'empenhos'
								? 'border-b-2 border-blue-600 text-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}>
						<FileText className="w-4 h-4" />
						Empenhos
					</button>
					<button
						onClick={() => setActiveTab('solicitacoes')}
						className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
							activeTab === 'solicitacoes'
								? 'border-b-2 border-blue-600 text-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}>
						<DollarSign className="w-4 h-4" />
						Solicitações
					</button>
				</div>

				<div className="p-6">
					{activeTab === 'usuarios' && <UsuariosTab />}
					{activeTab === 'fornecedores' && <FornecedoresTab />}
					{activeTab === 'empenhos' && <EmpenhosTab />}
					{activeTab === 'solicitacoes' && <SolicitacoesTab />}
				</div>
			</Card>
		</div>
	);
}

// ========================
// TAB: USUÁRIOS
// ========================
function UsuariosTab() {
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
			const token = localStorage.getItem('auth_token');
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

			const response = await fetch(`${apiUrl}/admin/usuarios`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao criar usuário');
			}

			toast.success('Usuário criado com sucesso!');
			setFormData({
				name: '',
				email: '',
				cpf: '',
				password: '',
				perfil: '',
				fornecedor_id: '',
			});
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
					<Select
						value={formData.perfil}
						onValueChange={(value) => setFormData({ ...formData, perfil: value })}>
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
						<Label htmlFor="fornecedor_id">ID do Fornecedor *</Label>
						<Input
							id="fornecedor_id"
							type="number"
							value={formData.fornecedor_id}
							onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
							placeholder="Ex: 1"
							required
						/>
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

// ========================
// TAB: FORNECEDORES
// ========================
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
			const token = localStorage.getItem('auth_token');
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

			const response = await fetch(`${apiUrl}/admin/fornecedores`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao criar fornecedor');
			}

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
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Dados do Fornecedor</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="nome">Nome da Empresa *</Label>
						<Input
							id="nome"
							value={formData.nome}
							onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
							required
						/>
					</div>

					<div>
						<Label htmlFor="cnpj">CNPJ *</Label>
						<Input
							id="cnpj"
							value={formData.cnpj}
							onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
							placeholder="00.000.000/0000-00"
							required
						/>
					</div>
				</div>
			</div>

			<div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
				<h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Responsável Técnico (Usuário)</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="rt_nome">Nome Completo *</Label>
						<Input
							id="rt_nome"
							value={formData.responsavel_tecnico_nome}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_nome: e.target.value })}
							required
						/>
					</div>

					<div>
						<Label htmlFor="rt_email">E-mail *</Label>
						<Input
							id="rt_email"
							type="email"
							value={formData.responsavel_tecnico_email}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_email: e.target.value })}
							required
						/>
					</div>

					<div>
						<Label htmlFor="rt_cpf">CPF *</Label>
						<Input
							id="rt_cpf"
							value={formData.responsavel_tecnico_cpf}
							onChange={(e) => setFormData({ ...formData, responsavel_tecnico_cpf: e.target.value })}
							placeholder="000.000.000-00"
							required
						/>
					</div>

					<div>
						<Label htmlFor="rt_password">Senha *</Label>
						<Input
							id="rt_password"
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

// ========================
// TAB: EMPENHOS
// ========================
function EmpenhosTab() {
	const [formData, setFormData] = useState({
		numero: '',
		fornecedor_id: '',
		valor: '',
		saldo: '',
		data_emissao: '',
		status: 'ativo',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('auth_token');
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

			const response = await fetch(`${apiUrl}/admin/empenhos`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao criar empenho');
			}

			toast.success('Empenho criado com sucesso!');
			setFormData({
				numero: '',
				fornecedor_id: '',
				valor: '',
				saldo: '',
				data_emissao: '',
				status: 'ativo',
			});
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor="numero">Número do Empenho *</Label>
					<Input
						id="numero"
						value={formData.numero}
						onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
						placeholder="Ex: 2026/0001"
						required
					/>
				</div>

				<div>
					<Label htmlFor="fornecedor_id">ID do Fornecedor *</Label>
					<Input
						id="fornecedor_id"
						type="number"
						value={formData.fornecedor_id}
						onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
						placeholder="Ex: 1"
						required
					/>
				</div>

				<div>
					<Label htmlFor="valor">Valor Total *</Label>
					<Input
						id="valor"
						type="number"
						step="0.01"
						value={formData.valor}
						onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
						placeholder="Ex: 50000.00"
						required
					/>
				</div>

				<div>
					<Label htmlFor="saldo">Saldo Disponível *</Label>
					<Input
						id="saldo"
						type="number"
						step="0.01"
						value={formData.saldo}
						onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
						placeholder="Ex: 50000.00"
						required
					/>
				</div>

				<div>
					<Label htmlFor="data_emissao">Data de Emissão *</Label>
					<Input
						id="data_emissao"
						type="date"
						value={formData.data_emissao}
						onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
						required
					/>
				</div>

				<div>
					<Label htmlFor="status">Status *</Label>
					<Select
						value={formData.status}
						onValueChange={(value) => setFormData({ ...formData, status: value })}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ativo">Ativo</SelectItem>
							<SelectItem value="bloqueado">Bloqueado</SelectItem>
							<SelectItem value="encerrado">Encerrado</SelectItem>
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

// ========================
// TAB: SOLICITAÇÕES
// ========================
function SolicitacoesTab() {
	const [solicitacaoId, setSolicitacaoId] = useState('');
	const [novoStatus, setNovoStatus] = useState('');
	const [motivo, setMotivo] = useState('');
	const [statusAtual, setStatusAtual] = useState('');
	const [loadingSolicitacao, setLoadingSolicitacao] = useState(false);
	const [solicitacaoInfo, setSolicitacaoInfo] = useState<any>(null);

	const handleCarregarSolicitacao = async () => {
		if (!solicitacaoId) {
			toast.error('Digite o ID da solicitação');
			return;
		}

		setLoadingSolicitacao(true);
		try {
			const token = localStorage.getItem('auth_token');
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

			const response = await fetch(`${apiUrl}/solicitacoes/${solicitacaoId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Solicitação não encontrada');
			}

			const data = await response.json();
			const solicitacao = data.solicitacao || data;

			setSolicitacaoInfo(solicitacao);
			setStatusAtual(solicitacao.status);
			toast.success('Solicitação carregada!');
		} catch (error: any) {
			toast.error(error.message || 'Erro ao carregar solicitação');
			setSolicitacaoInfo(null);
			setStatusAtual('');
		} finally {
			setLoadingSolicitacao(false);
		}
	};

	const handleAtualizarStatus = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('auth_token');
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

			const response = await fetch(`${apiUrl}/admin/solicitacoes/${solicitacaoId}/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					status: novoStatus,
					motivo: motivo || undefined,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Erro ao atualizar status');
			}

			toast.success('Status da solicitação atualizado com sucesso!');
			setStatusAtual(novoStatus);
			setNovoStatus('');
			setMotivo('');

			// Recarregar dados
			handleCarregarSolicitacao();
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="space-y-6">
			{/* Buscar Solicitação */}
			<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Buscar Solicitação</h3>
				<p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
					Digite o ID da solicitação para carregar suas informações
				</p>

				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="number"
							value={solicitacaoId}
							onChange={(e) => setSolicitacaoId(e.target.value)}
							placeholder="Ex: 1"
						/>
					</div>
					<Button type="button" onClick={handleCarregarSolicitacao} disabled={loadingSolicitacao}>
						{loadingSolicitacao ? 'Carregando...' : 'Buscar'}
					</Button>
				</div>

				{/* Info da Solicitação Carregada */}
				{solicitacaoInfo && (
					<div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-500 dark:text-gray-400">Número:</p>
								<p className="font-semibold">{solicitacaoInfo.numero}</p>
							</div>
							<div>
								<p className="text-gray-500 dark:text-gray-400">Valor:</p>
								<p className="font-semibold">
									R${' '}
									{Number(solicitacaoInfo.valor).toLocaleString('pt-BR', {
										minimumFractionDigits: 2,
									})}
								</p>
							</div>
							<div className="col-span-2">
								<p className="text-gray-500 dark:text-gray-400">Status Atual:</p>
								<p className="font-semibold text-lg text-blue-600 dark:text-blue-400">{statusAtual}</p>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Atualizar Status */}
			<div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
					<RefreshCw className="w-4 h-4" />
					2. Atualizar Status
				</h3>
				<p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
					{statusAtual ? `Mover de "${statusAtual}" para outro status` : 'Busque uma solicitação primeiro'}
				</p>

				<form onSubmit={handleAtualizarStatus} className="space-y-4">
					<div>
						<Label htmlFor="novo_status">Novo Status *</Label>
						<Select value={novoStatus} onValueChange={setNovoStatus} disabled={!solicitacaoInfo}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="rascunho">📝 Rascunho</SelectItem>
								<SelectItem value="aguardando_aprovacao">⏳ Aguardando Aprovação</SelectItem>
								<SelectItem value="anexos">📎 Anexos</SelectItem>
								<SelectItem value="fiscal">📋 Fiscal</SelectItem>
								<SelectItem value="gestor">👔 Gestor</SelectItem>
								<SelectItem value="liquidacao">💰 Liquidação</SelectItem>
								<SelectItem value="secretario">📜 Secretário(a)</SelectItem>
								<SelectItem value="iss">🏛️ ISS</SelectItem>
								<SelectItem value="ordem_pagamento">📄 Ordem de Pagamento</SelectItem>
								<SelectItem value="autorizacao">✅ Autorização</SelectItem>
								<SelectItem value="bordero">📊 Borderô</SelectItem>
								<SelectItem value="remessa">📤 Remessa</SelectItem>
								<SelectItem value="pagamento">💵 Pagamento</SelectItem>
								<SelectItem value="pagamento_realizado">✔️ Pagamento Realizado</SelectItem>
								<SelectItem value="cancelado">❌ Cancelado</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="motivo">Motivo/Observação (Opcional)</Label>
						<Textarea
							id="motivo"
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

			{/* Fluxo de Status */}
			<div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
				<h4 className="font-semibold mb-3">📋 Fluxo Completo de Status:</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
					<div className="flex items-center gap-2">
						<span className="text-xl">📝</span>
						<span>
							<strong>Rascunho</strong> → Solicitação criada
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">⏳</span>
						<span>
							<strong>Aguardando Aprovação</strong> → Anexos enviados
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📎</span>
						<span>
							<strong>Anexos</strong> → Análise de documentos
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📋</span>
						<span>
							<strong>Fiscal</strong> → Análise fiscal
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">👔</span>
						<span>
							<strong>Gestor</strong> → Aprovação do gestor
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">💰</span>
						<span>
							<strong>Liquidação</strong> → Processo de liquidação
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📜</span>
						<span>
							<strong>Secretário(a)</strong> → Aprovação secretaria
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">🏛️</span>
						<span>
							<strong>ISS</strong> → Verificação de impostos
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📄</span>
						<span>
							<strong>Ordem de Pagamento</strong> → OP gerada
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">✅</span>
						<span>
							<strong>Autorização</strong> → Pagamento autorizado
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📊</span>
						<span>
							<strong>Borderô</strong> → Borderô criado
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">📤</span>
						<span>
							<strong>Remessa</strong> → Enviado para pagamento
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">💵</span>
						<span>
							<strong>Pagamento</strong> → Em processo de pagamento
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xl">✔️</span>
						<span>
							<strong>Pagamento Realizado</strong> → Concluído
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
