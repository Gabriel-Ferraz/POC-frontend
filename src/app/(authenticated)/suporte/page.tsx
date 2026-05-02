'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { suporteApi, type FiltrosChamados, type Usuario } from '@/app/features/suporte/api/suporte-api';
import { useAuth } from '@/providers/AuthProvider';
import { HelpCircle, X, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SuportePage() {
	const router = useRouter();
	const { user } = useAuth();
	const [filtros, setFiltros] = useState<FiltrosChamados>({});
	const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);
	const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
	const [buscaUsuario, setBuscaUsuario] = useState<string>('');
	const [mostrarSugestoes, setMostrarSugestoes] = useState<boolean>(false);

	// Definir se é gestor ANTES de usar nos useEffects
	const isGestorSuporte = user?.perfil === 'gestor_suporte' || user?.perfil === 'gestor_contrato';

	console.log('👤 Perfil do usuário:', user?.perfil);
	console.log('🔓 Pode ver todos os chamados:', isGestorSuporte);

	// Carregar lista de usuários iniciais
	useEffect(() => {
		const carregarUsuarios = async () => {
			try {
				console.log('🔄 Carregando usuários...');
				const response = await suporteApi.getUsuarios();
				console.log('📦 Response usuarios:', response);

				if (response.usuario_atual) {
					console.log('👤 Usuário comum:', response.usuario_atual);
					setUsuarioAtual(response.usuario_atual);
				} else if (response.usuarios) {
					console.log('👥 Lista de usuários (gestor):', response.usuarios);
					setUsuarios(response.usuarios);
				}
			} catch (error) {
				console.error('❌ Erro ao carregar usuários:', error);
			}
		};

		carregarUsuarios();
	}, []);

	// Buscar usuários com debounce (autocomplete)
	useEffect(() => {
		if (!isGestorSuporte) return;

		const timer = setTimeout(async () => {
			try {
				const response = await suporteApi.getUsuarios(buscaUsuario);
				if (response.usuarios) {
					setUsuarios(response.usuarios);
				}
			} catch (error) {
				console.error('Erro ao buscar usuários:', error);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [buscaUsuario, isGestorSuporte]);

	// Fechar sugestões ao clicar fora
	useEffect(() => {
		const handleClickFora = () => setMostrarSugestoes(false);
		document.addEventListener('click', handleClickFora);
		return () => document.removeEventListener('click', handleClickFora);
	}, []);

	// Atualizar filtros quando status mudar
	useEffect(() => {
		if (statusSelecionados.length > 0) {
			setFiltros({ ...filtros, status: statusSelecionados.join(',') });
		} else {
			const { status, ...restoFiltros } = filtros;
			setFiltros(restoFiltros);
		}
	}, [statusSelecionados]);

	// Query para buscar chamados com filtros
	const {
		data: chamados,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['chamados', filtros],
		queryFn: () => suporteApi.getChamados(filtros),
	});

	const handleStatusChange = (status: string, checked: boolean) => {
		if (checked) {
			setStatusSelecionados([...statusSelecionados, status]);
		} else {
			setStatusSelecionados(statusSelecionados.filter((s) => s !== status));
		}
	};

	const limparFiltros = () => {
		setFiltros({});
		setStatusSelecionados([]);
		setUsuarioSelecionado(null);
		setBuscaUsuario('');
	};

	const handleBuscaUsuarioChange = (valor: string) => {
		setBuscaUsuario(valor);
		setMostrarSugestoes(true);

		// Limpar seleção se apagar o campo
		if (!valor) {
			setUsuarioSelecionado(null);
			const { usuario_id, ...restoFiltros } = filtros;
			setFiltros(restoFiltros);
		}
	};

	const handleSelecionarUsuario = (usuario: Usuario) => {
		setUsuarioSelecionado(usuario);
		setBuscaUsuario(usuario.name);
		setMostrarSugestoes(false);
		setFiltros({ ...filtros, usuario_id: usuario.id });
	};

	const handleLimparUsuario = () => {
		setUsuarioSelecionado(null);
		setBuscaUsuario('');
		const { usuario_id, ...restoFiltros } = filtros;
		setFiltros(restoFiltros);
	};

	const temFiltrosAtivos =
		Object.values(filtros).some((v) => v !== undefined && v !== '') || statusSelecionados.length > 0;

	if (isLoading) {
		return <Loading text="Carregando chamados..." />;
	}

	if (error) {
		console.error('Erro ao carregar chamados:', error);
		return (
			<div>
				<PageHeader
					title="Meus Chamados"
					description="Lista de chamados de suporte"
					action={<Button onClick={() => router.push('/suporte/novo')}>Novo Chamado</Button>}
				/>
				<Card>
					<div className="p-8 text-center text-red-500">
						<p>Erro ao carregar chamados</p>
						<p className="text-sm mt-2">{(error as any)?.message || 'Tente novamente'}</p>
					</div>
				</Card>
			</div>
		);
	}

	const chamadosList = Array.isArray(chamados) ? chamados : [];

	return (
		<div>
			<PageHeader
				title="Meus Chamados"
				description="Lista de chamados de suporte"
				action={<Button onClick={() => router.push('/suporte/novo')}>Novo Chamado</Button>}
			/>

			{/* Filtros */}
			<Card className="mb-4">
				<div className="p-6">
					<h3 className="text-lg font-semibold mb-4">Filtros de Pesquisa</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{/* Protocolo */}
						<div>
							<Label htmlFor="filtro-protocolo">Protocolo</Label>
							<Input
								id="filtro-protocolo"
								placeholder="Ex: #3"
								value={filtros.protocolo || ''}
								onChange={(e) => setFiltros({ ...filtros, protocolo: e.target.value })}
							/>
						</div>

						{/* Módulo */}
						<div>
							<Label htmlFor="filtro-modulo">Módulo</Label>
							<Input
								id="filtro-modulo"
								placeholder="Ex: Portal do Fornecedor"
								value={filtros.modulo || ''}
								onChange={(e) => setFiltros({ ...filtros, modulo: e.target.value })}
							/>
						</div>

						{/* Assunto */}
						<div>
							<Label htmlFor="filtro-assunto">Assunto</Label>
							<Input
								id="filtro-assunto"
								placeholder="Buscar por assunto..."
								value={filtros.assunto || ''}
								onChange={(e) => setFiltros({ ...filtros, assunto: e.target.value })}
							/>
						</div>

						{/* Status */}
						<div>
							<Label>Status</Label>
							<div className="space-y-2 mt-2">
								<div className="flex items-center gap-2">
									<Checkbox
										id="status-aberto"
										checked={statusSelecionados.includes('aberto')}
										onCheckedChange={(checked) => handleStatusChange('aberto', checked as boolean)}
									/>
									<label htmlFor="status-aberto" className="text-sm cursor-pointer">
										Aberto
									</label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="status-em-atendimento"
										checked={statusSelecionados.includes('em_atendimento')}
										onCheckedChange={(checked) =>
											handleStatusChange('em_atendimento', checked as boolean)
										}
									/>
									<label htmlFor="status-em-atendimento" className="text-sm cursor-pointer">
										Em Atendimento
									</label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="status-concluido"
										checked={statusSelecionados.includes('concluido')}
										onCheckedChange={(checked) =>
											handleStatusChange('concluido', checked as boolean)
										}
									/>
									<label htmlFor="status-concluido" className="text-sm cursor-pointer">
										Concluído
									</label>
								</div>
							</div>
						</div>

						{/* Data Cadastro Início */}
						<div>
							<Label htmlFor="filtro-data-inicio">Data Cadastro Início</Label>
							<Input
								id="filtro-data-inicio"
								type="date"
								value={filtros.data_cadastro_inicio || ''}
								onChange={(e) => setFiltros({ ...filtros, data_cadastro_inicio: e.target.value })}
							/>
						</div>

						{/* Data Cadastro Fim */}
						<div>
							<Label htmlFor="filtro-data-fim">Data Cadastro Fim</Label>
							<Input
								id="filtro-data-fim"
								type="date"
								value={filtros.data_cadastro_fim || ''}
								onChange={(e) => setFiltros({ ...filtros, data_cadastro_fim: e.target.value })}
							/>
						</div>

						{/* Data Resposta Início */}
						<div>
							<Label htmlFor="filtro-resposta-inicio">Data Resposta Início</Label>
							<Input
								id="filtro-resposta-inicio"
								type="date"
								value={filtros.data_resposta_inicio || ''}
								onChange={(e) => setFiltros({ ...filtros, data_resposta_inicio: e.target.value })}
							/>
						</div>

						{/* Data Resposta Fim */}
						<div>
							<Label htmlFor="filtro-resposta-fim">Data Resposta Fim</Label>
							<Input
								id="filtro-resposta-fim"
								type="date"
								value={filtros.data_resposta_fim || ''}
								onChange={(e) => setFiltros({ ...filtros, data_resposta_fim: e.target.value })}
							/>
						</div>

						{/* Usuário */}
						<div>
							<Label htmlFor="filtro-usuario">Usuário</Label>

							{/* Usuário Comum: Campo travado */}
							{!isGestorSuporte && usuarioAtual && (
								<div>
									<div className="relative">
										<Input
											id="filtro-usuario"
											value={usuarioAtual.name}
											disabled
											className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed pr-10"
											title="Você só pode visualizar seus próprios chamados"
										/>
										<div className="absolute right-3 top-1/2 -translate-y-1/2">
											<Lock className="w-4 h-4 text-gray-400" />
										</div>
									</div>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Você só pode ver seus próprios chamados
									</p>
								</div>
							)}

							{/* Gestor: Autocomplete */}
							{isGestorSuporte && (
								<div className="relative" onClick={(e) => e.stopPropagation()}>
									<div className="relative">
										<Input
											id="filtro-usuario"
											type="text"
											value={buscaUsuario}
											onChange={(e) => handleBuscaUsuarioChange(e.target.value)}
											onFocus={() => setMostrarSugestoes(true)}
											placeholder="Buscar por nome do usuário..."
											className="pr-10"
										/>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
											🔍
										</div>
									</div>

									{/* Lista de sugestões */}
									{mostrarSugestoes && usuarios.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
											{usuarios.map((usuario) => (
												<div
													key={usuario.id}
													onClick={() => handleSelecionarUsuario(usuario)}
													className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
													<div className="font-medium text-gray-900 dark:text-gray-100">
														{usuario.name}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">
														{usuario.perfil_label}
													</div>
												</div>
											))}
										</div>
									)}

									{/* Botão para limpar seleção */}
									{usuarioSelecionado && (
										<button
											type="button"
											onClick={handleLimparUsuario}
											className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
											<X className="w-3 h-3 inline mr-1" />
											Limpar filtro (ver todos os usuários)
										</button>
									)}

									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Digite para buscar ou deixe em branco para ver todos
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between mt-4">
						{temFiltrosAtivos && (
							<p className="text-sm text-muted-foreground">
								{chamadosList.length} chamado(s) encontrado(s)
							</p>
						)}
						<div className="ml-auto">
							{temFiltrosAtivos && (
								<Button variant="outline" size="sm" onClick={limparFiltros}>
									<X className="w-4 h-4 mr-2" />
									Limpar Filtros
								</Button>
							)}
						</div>
					</div>
				</div>
			</Card>

			{chamadosList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<HelpCircle className="w-12 h-12" />}
						title="Nenhum chamado encontrado"
						description={
							temFiltrosAtivos
								? 'Nenhum chamado corresponde aos filtros aplicados'
								: 'Você ainda não abriu nenhum chamado de suporte'
						}
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Protocolo</TableHead>
								<TableHead>Módulo</TableHead>
								<TableHead>Assunto</TableHead>
								{isGestorSuporte && <TableHead>Usuário</TableHead>}
								<TableHead>Data Abertura</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{chamadosList.map((chamado) => (
								<TableRow key={chamado.id}>
									<TableCell className="font-medium">{chamado.protocolo}</TableCell>
									<TableCell>{chamado.modulo}</TableCell>
									<TableCell>{chamado.assunto}</TableCell>
									{isGestorSuporte && <TableCell>{chamado.usuario}</TableCell>}
									<TableCell>{chamado.data_abertura}</TableCell>
									<TableCell>
										<StatusBadge status={chamado.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											onClick={() => router.push(`/suporte/chamados/${chamado.id}`)}>
											Ver Detalhes
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}
