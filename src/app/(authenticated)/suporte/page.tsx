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
import { HelpCircle, X, Lock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ChamadoActions } from '@/components/suporte/chamado-actions';

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
	const [responsaveis, setResponsaveis] = useState<Usuario[]>([]);
	const [responsavelSelecionado, setResponsavelSelecionado] = useState<Usuario | null>(null);
	const [buscaResponsavel, setBuscaResponsavel] = useState<string>('');
	const [mostrarSugestoesResponsavel, setMostrarSugestoesResponsavel] = useState<boolean>(false);
	const [filtrosAbertos, setFiltrosAbertos] = useState(true);

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

	// Buscar responsáveis com debounce (autocomplete) — disponível para todos
	useEffect(() => {
		const timer = setTimeout(async () => {
			try {
				const response = await suporteApi.getResponsaveis(buscaResponsavel);
				setResponsaveis(response.usuarios);
			} catch (error) {
				console.error('Erro ao buscar responsáveis:', error);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [buscaResponsavel]);

	// Fechar sugestões ao clicar fora
	useEffect(() => {
		const handleClickFora = () => {
			setMostrarSugestoes(false);
			setMostrarSugestoesResponsavel(false);
		};
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
		setResponsavelSelecionado(null);
		setBuscaResponsavel('');
	};

	const handleBuscaResponsavelChange = (valor: string) => {
		setBuscaResponsavel(valor);
		setMostrarSugestoesResponsavel(true);
		if (!valor) {
			setResponsavelSelecionado(null);
			const { responsavel_id, ...restoFiltros } = filtros;
			setFiltros(restoFiltros);
		}
	};

	const handleSelecionarResponsavel = (usuario: Usuario) => {
		setResponsavelSelecionado(usuario);
		setBuscaResponsavel(usuario.name);
		setMostrarSugestoesResponsavel(false);
		setFiltros({ ...filtros, responsavel_id: usuario.id });
	};

	const handleLimparResponsavel = () => {
		setResponsavelSelecionado(null);
		setBuscaResponsavel('');
		const { responsavel_id, ...restoFiltros } = filtros;
		setFiltros(restoFiltros);
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
				<button
					type="button"
					className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
					onClick={() => setFiltrosAbertos((prev) => !prev)}>
					<h3 className="text-lg font-semibold">Filtros de Pesquisa</h3>
					{filtrosAbertos ? (
						<ChevronUp className="w-4 h-4 text-muted-foreground" />
					) : (
						<ChevronDown className="w-4 h-4 text-muted-foreground" />
					)}
				</button>
				{filtrosAbertos && (
					<div className="px-6 pb-6">
						<div className="space-y-4">
							{/* Linha 1: Protocolo · Módulo · Assunto */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,2.5fr)] gap-4">
								<div>
									<Label htmlFor="filtro-protocolo">Protocolo</Label>
									<Input
										id="filtro-protocolo"
										placeholder="Ex: #3"
										value={filtros.protocolo || ''}
										onChange={(e) => setFiltros({ ...filtros, protocolo: e.target.value })}
									/>
								</div>

								<div>
									<Label htmlFor="filtro-modulo">Módulo</Label>
									<Input
										id="filtro-modulo"
										placeholder="Ex: Portal do Fornecedor"
										value={filtros.modulo || ''}
										onChange={(e) => setFiltros({ ...filtros, modulo: e.target.value })}
									/>
								</div>

								<div className="sm:col-span-2 lg:col-span-1">
									<Label htmlFor="filtro-assunto">Assunto</Label>
									<Input
										id="filtro-assunto"
										placeholder="Buscar por assunto..."
										value={filtros.assunto || ''}
										onChange={(e) => setFiltros({ ...filtros, assunto: e.target.value })}
									/>
								</div>
							</div>

							{/* Linha 2: Período de Cadastro (linha inteira) */}
							<div>
								<Label>Período de Cadastro</Label>
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1.5">
									<Input
										id="filtro-data-inicio"
										type="date"
										value={filtros.data_cadastro_inicio || ''}
										onChange={(e) =>
											setFiltros({ ...filtros, data_cadastro_inicio: e.target.value })
										}
										className="sm:max-w-[220px]"
									/>
									<span className="text-sm text-muted-foreground shrink-0 hidden sm:block">até</span>
									<Input
										id="filtro-data-fim"
										type="date"
										value={filtros.data_cadastro_fim || ''}
										onChange={(e) => setFiltros({ ...filtros, data_cadastro_fim: e.target.value })}
										className="sm:max-w-[220px]"
									/>
								</div>
							</div>

							{/* Linha 3: Período de Resposta (linha inteira) */}
							<div>
								<Label>Período de Resposta</Label>
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1.5">
									<Input
										id="filtro-resposta-inicio"
										type="date"
										value={filtros.data_resposta_inicio || ''}
										onChange={(e) =>
											setFiltros({ ...filtros, data_resposta_inicio: e.target.value })
										}
										className="sm:max-w-[220px]"
									/>
									<span className="text-sm text-muted-foreground shrink-0 hidden sm:block">até</span>
									<Input
										id="filtro-resposta-fim"
										type="date"
										value={filtros.data_resposta_fim || ''}
										onChange={(e) => setFiltros({ ...filtros, data_resposta_fim: e.target.value })}
										className="sm:max-w-[220px]"
									/>
								</div>
							</div>

							{/* Linha 4: Status (linha inteira) */}
							<div>
								<Label>Status</Label>
								<div className="flex flex-wrap items-center gap-6 mt-2.5">
									<div className="flex items-center gap-2">
										<Checkbox
											id="status-aberto"
											checked={statusSelecionados.includes('aberto')}
											onCheckedChange={(checked) =>
												handleStatusChange('aberto', checked as boolean)
											}
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

							{/* Linha 5: Usuário solicitante + Responsável pelo atendimento */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Usuário solicitante */}
								<div>
									<Label htmlFor="filtro-usuario">Usuário solicitante</Label>

									{!isGestorSuporte && usuarioAtual && (
										<div>
											<div className="relative mt-1.5">
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
											<p className="text-xs text-muted-foreground mt-1">
												Você só pode ver seus próprios chamados
											</p>
										</div>
									)}

									{isGestorSuporte && (
										<div className="relative mt-1.5" onClick={(e) => e.stopPropagation()}>
											<div className="relative">
												<Input
													id="filtro-usuario"
													type="text"
													value={buscaUsuario}
													onChange={(e) => handleBuscaUsuarioChange(e.target.value)}
													onFocus={() => setMostrarSugestoes(true)}
													placeholder="Buscar por nome..."
													className="pr-10"
												/>
												<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
													<Search className="w-4 h-4" />
												</div>
											</div>
											{mostrarSugestoes && usuarios.length > 0 && (
												<div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
													{usuarios.map((usuario) => (
														<div
															key={usuario.id}
															onClick={() => handleSelecionarUsuario(usuario)}
															className="px-4 py-2 hover:bg-accent cursor-pointer">
															<div className="font-medium text-sm">{usuario.name}</div>
															<div className="text-xs text-muted-foreground">
																{usuario.perfil_label}
															</div>
														</div>
													))}
												</div>
											)}
											{usuarioSelecionado ? (
												<button
													type="button"
													onClick={handleLimparUsuario}
													className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1">
													<X className="w-3 h-3" />
													Limpar filtro
												</button>
											) : (
												<p className="text-xs text-muted-foreground mt-1">
													Digite para buscar ou deixe em branco para ver todos
												</p>
											)}
										</div>
									)}
								</div>

								{/* Responsável pelo atendimento */}
								<div>
									<Label htmlFor="filtro-responsavel">Responsável pelo atendimento</Label>
									<div className="relative mt-1.5" onClick={(e) => e.stopPropagation()}>
										<div className="relative">
											<Input
												id="filtro-responsavel"
												type="text"
												value={buscaResponsavel}
												onChange={(e) => handleBuscaResponsavelChange(e.target.value)}
												onFocus={() => setMostrarSugestoesResponsavel(true)}
												placeholder="Buscar por nome..."
												className="pr-10"
											/>
											<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												<Search className="w-4 h-4" />
											</div>
										</div>
										{mostrarSugestoesResponsavel && responsaveis.length > 0 && (
											<div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
												{responsaveis.map((resp) => (
													<div
														key={resp.id}
														onClick={() => handleSelecionarResponsavel(resp)}
														className="px-4 py-2 hover:bg-accent cursor-pointer">
														<div className="font-medium text-sm">{resp.name}</div>
														<div className="text-xs text-muted-foreground">
															{resp.perfil_label}
														</div>
													</div>
												))}
											</div>
										)}
										{responsavelSelecionado ? (
											<button
												type="button"
												onClick={handleLimparResponsavel}
												className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1">
												<X className="w-3 h-3" />
												Limpar filtro
											</button>
										) : (
											<p className="text-xs text-muted-foreground mt-1">
												Digite para buscar ou deixe em branco para ver todos
											</p>
										)}
									</div>
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
					</div>
				)}
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
								{isGestorSuporte && <TableHead>Solicitante</TableHead>}
								{isGestorSuporte && <TableHead>Responsável</TableHead>}
								<TableHead>Data Abertura</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{chamadosList.map((chamado) => (
								<TableRow key={chamado.id}>
									<TableCell className="font-medium whitespace-nowrap">{chamado.protocolo}</TableCell>
									<TableCell>{chamado.modulo}</TableCell>
									<TableCell>{chamado.assunto}</TableCell>
									{isGestorSuporte && (
										<TableCell className="whitespace-nowrap">
											{typeof chamado.usuario === 'string'
												? chamado.usuario
												: (chamado.usuario?.name ?? '—')}
										</TableCell>
									)}
									{isGestorSuporte && (
										<TableCell className="whitespace-nowrap text-muted-foreground">
											{chamado.responsavel ?? '—'}
										</TableCell>
									)}
									<TableCell className="whitespace-nowrap">{chamado.data_abertura}</TableCell>
									<TableCell>
										<StatusBadge status={chamado.status} />
									</TableCell>
									<TableCell className="text-right">
										<ChamadoActions
											chamadoId={chamado.id}
											status={chamado.status}
											ultimaMensagemPor={chamado.ultima_mensagem_por}
											onVerLog={(id) => router.push(`/suporte/chamados/${id}`)}
											onVerInformacoes={(id) => router.push(`/suporte/chamados/${id}/info`)}
										/>
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
