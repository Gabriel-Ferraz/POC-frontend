'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import { UserPlus, FileText, DollarSign, RefreshCw, Database } from 'lucide-react';

export default function AdminPage() {
	const [activeTab, setActiveTab] = useState<'usuarios' | 'empenhos' | 'solicitacoes' | 'fornecedores'>('usuarios');

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
			setSolicitacaoId('');
			setNovoStatus('');
			setMotivo('');
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
					<RefreshCw className="w-4 h-4" />
					Atualizar Status de Solicitação
				</h3>
				<p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
					Use este formulário para avançar manualmente o status de uma solicitação de pagamento.
				</p>

				<form onSubmit={handleAtualizarStatus} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="solicitacao_id">ID da Solicitação *</Label>
							<Input
								id="solicitacao_id"
								type="number"
								value={solicitacaoId}
								onChange={(e) => setSolicitacaoId(e.target.value)}
								placeholder="Ex: 1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="novo_status">Novo Status *</Label>
							<Select value={novoStatus} onValueChange={setNovoStatus}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione o status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="rascunho">Rascunho</SelectItem>
									<SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
									<SelectItem value="em_analise">Em Análise</SelectItem>
									<SelectItem value="aprovado">Aprovado</SelectItem>
									<SelectItem value="em_pagamento">Em Pagamento</SelectItem>
									<SelectItem value="pago">Pago</SelectItem>
									<SelectItem value="cancelado">Cancelado</SelectItem>
									<SelectItem value="recusado">Recusado</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div>
						<Label htmlFor="motivo">Motivo/Observação (Opcional)</Label>
						<Textarea
							id="motivo"
							value={motivo}
							onChange={(e) => setMotivo(e.target.value)}
							placeholder="Descreva o motivo da mudança de status..."
							rows={3}
						/>
					</div>

					<Button type="submit" className="w-full">
						<RefreshCw className="w-4 h-4 mr-2" />
						Atualizar Status
					</Button>
				</form>
			</div>

			<div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
				<h4 className="font-semibold mb-2">Fluxo de Status Padrão:</h4>
				<ol className="text-sm space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
					<li>
						<strong>Rascunho</strong> → Solicitação criada
					</li>
					<li>
						<strong>Aguardando Aprovação</strong> → Anexos enviados
					</li>
					<li>
						<strong>Em Análise</strong> → Gestor está analisando
					</li>
					<li>
						<strong>Aprovado</strong> → Todos anexos aprovados
					</li>
					<li>
						<strong>Em Pagamento</strong> → Em processo de pagamento
					</li>
					<li>
						<strong>Pago</strong> → Pagamento concluído
					</li>
				</ol>
			</div>
		</div>
	);
}
