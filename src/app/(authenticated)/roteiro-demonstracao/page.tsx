'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import {
	Monitor,
	Server,
	FileText,
	Paperclip,
	XCircle,
	CheckCircle,
	Info,
	HeadphonesIcon,
	Plus,
	Search,
	Bell,
	Download,
} from 'lucide-react';

interface Passo {
	titulo: string;
	descricao?: string;
	acoes: string[];
	destaque?: string;
}

interface Secao {
	id: number;
	titulo: string;
	icone: React.ReactNode;
	cor: string;
	passos: Passo[];
}

const secoes: Secao[] = [
	{
		id: 1,
		titulo: 'Ambiente de Demonstração',
		icone: <Server className="w-5 h-5" />,
		cor: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
		passos: [
			{
				titulo: 'Infraestrutura em execução',
				acoes: [
					'Confirmar que os containers Docker estão ativos (app, db, redis)',
					'Verificar acesso ao sistema pelo navegador (Chrome ou Firefox)',
					'Confirmar que o banco está populado com dados de demonstração',
				],
				destaque:
					'Toda a aplicação roda em containers Linux — nenhuma instalação adicional necessária na estação de trabalho.',
			},
			{
				titulo: 'Credenciais de demonstração',
				acoes: [
					'Responsável Técnico (Fornecedor): CPF 123.456.789-00 / senha123',
					'Gestor de Contrato: CPF 987.654.321-00 / senha123',
					'Gestor de Suporte: CPF 555.666.777-88 / senha123',
					'Operador PMSJP: CPF 111.222.333-44 / senha123',
				],
			},
		],
	},
	{
		id: 2,
		titulo: 'Ambiente Tecnológico de Desenvolvimento',
		icone: <Monitor className="w-5 h-5" />,
		cor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
		passos: [
			{
				titulo: 'Apresentar a stack técnica',
				acoes: [
					'Navegar até "Demonstração Técnica" no menu lateral',
					'Apresentar os cards de Stack (PHP 8.2, Laravel 12, PostgreSQL 15, Redis 7, Nginx, Docker)',
					'Apresentar o frontend: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4',
					'Apresentar a conformidade com os requisitos do edital (card "Conformidade com o Ambiente")',
				],
			},
			{
				titulo: 'Demonstrar funcionalidades transversais',
				acoes: [
					'Alternar entre tema claro e escuro pelo botão no cabeçalho',
					'Mostrar que a interface é responsiva (redimensionar janela)',
					'Demonstrar o controle de perfil: logar com diferentes usuários e mostrar menus distintos',
				],
			},
		],
	},
	{
		id: 3,
		titulo: 'Módulo de Solicitação de Pagamentos',
		icone: <FileText className="w-5 h-5" />,
		cor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		passos: [
			{
				titulo: 'Nova Solicitação de Pagamento de Empenho',
				descricao: 'Logar como Responsável Técnico (CPF 123.456.789-00)',
				acoes: [
					'Acessar "Portal do Fornecedor" → "Empenhos"',
					'Selecionar um empenho com saldo disponível',
					'Clicar em "Solicitações" e depois em "Nova Solicitação"',
					'Preencher: valor, tipo e número do documento fiscal, data de emissão',
					'Preencher dados de pagamento (conta bancária ou documento)',
					'Submeter a solicitação e confirmar o toast de sucesso',
					'Verificar que o saldo do empenho foi atualizado',
				],
				destaque: 'O sistema bloqueia o saldo do empenho imediatamente ao criar a solicitação.',
			},
			{
				titulo: 'Envio de Anexos',
				icone: <Paperclip className="w-4 h-4" />,
				acoes: [
					'Na listagem de solicitações, clicar em "Anexos" na solicitação criada',
					'Visualizar os 5 tipos de anexo exigidos (Documento Fiscal, Certidões, FGTS, etc.)',
					'Fazer upload de um arquivo PDF para o campo "Documento Fiscal"',
					'Fazer upload dos demais anexos disponíveis',
					'Fechar o modal e verificar o status atualizado na listagem',
				],
			},
			{
				titulo: 'Cancelamento de Solicitação de Pagamento',
				descricao: 'Demonstrar o fluxo de cancelamento em status Pendente',
				acoes: [
					'Na listagem, clicar em "Cancelar" em uma solicitação com status Pendente',
					'Preencher o motivo do cancelamento (mínimo 10 caracteres)',
					'Confirmar e verificar que o status mudou para Cancelada',
					'Verificar que o saldo do empenho foi restaurado',
				],
				destaque:
					'O cancelamento também é permitido quando o status é "Anexos Recusados" e o Documento Fiscal foi recusado.',
			},
		],
	},
	{
		id: 4,
		titulo: 'Aprovação de Anexos (Gestor)',
		icone: <CheckCircle className="w-5 h-5" />,
		cor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
		passos: [
			{
				titulo: 'Revisão pelo Gestor de Contrato',
				descricao: 'Logar como Gestor de Contrato (CPF 987.654.321-00)',
				acoes: [
					'Acessar "Painel do Gestor" → "Solicitações Pendentes"',
					'Selecionar a solicitação criada anteriormente',
					'Navegar para a aba "Anexos"',
					'Aprovar um anexo: clicar em "Aprovar" e confirmar',
					'Recusar um anexo: clicar em "Recusar", informar o motivo e confirmar',
					'Verificar que o status da solicitação muda para "Anexos Recusados" após uma recusa',
				],
			},
		],
	},
	{
		id: 5,
		titulo: 'Consulta de Informações da Solicitação',
		icone: <Info className="w-5 h-5" />,
		cor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
		passos: [
			{
				titulo: 'Visualizar detalhes completos',
				descricao: 'Pode ser acessado por qualquer perfil com acesso à solicitação',
				acoes: [
					'Na listagem de solicitações, clicar em "Informações"',
					'Apresentar os dados do documento fiscal e forma de pagamento',
					'Mostrar a aba "Anexos" com status individual de cada documento',
					'Mostrar a aba "Trâmites" com o histórico completo de movimentações',
					'Demonstrar o status visual (badge colorido por estado)',
				],
				destaque: 'O trâmite registra automaticamente cada transição de status com data, hora e responsável.',
			},
		],
	},
	{
		id: 6,
		titulo: 'Módulo de Suporte ao Usuário',
		icone: <HeadphonesIcon className="w-5 h-5" />,
		cor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
		passos: [
			{
				titulo: 'Novo Chamado',
				descricao: 'Logar como Responsável Técnico',
				acoes: [
					'Acessar "Suporte" no menu lateral',
					'Clicar em "Novo Chamado"',
					'Verificar que o campo "De" está preenchido automaticamente com o usuário logado',
					'Preencher o módulo (ex: "Portal do Fornecedor") e o assunto detalhado',
					'Opcionalmente anexar um arquivo',
					'Submeter e confirmar o protocolo gerado',
				],
			},
			{
				titulo: 'Consultar e Acompanhar Chamado',
				acoes: [
					'Voltar à listagem de chamados',
					'Localizar o chamado pelo protocolo ou usar os filtros de pesquisa',
					'Mostrar os filtros disponíveis: período, status, usuário solicitante, responsável pelo atendimento',
					'Clicar no ícone de log para ver o histórico de mensagens',
					'Logar como Gestor de Suporte e responder ao chamado',
					'Verificar que o botão de ação muda de cor (azul → laranja) ao receber resposta do gestor',
				],
				destaque:
					'A cor do botão indica quem fez a última interação: azul = aguardando gestor, laranja = gestor respondeu.',
			},
		],
	},
	{
		id: 7,
		titulo: 'Atalho de Suporte em Todas as Páginas',
		icone: <Bell className="w-5 h-5" />,
		cor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
		passos: [
			{
				titulo: 'Demonstrar o ícone de atalho global',
				acoes: [
					'Navegar para qualquer página do sistema (ex: Empenhos, Orçamentário, etc.)',
					'Apontar o botão "Suporte" no canto superior direito do cabeçalho',
					'Clicar no botão para abrir diretamente a tela de novo chamado',
					'Mostrar que o atalho está presente em todas as telas autenticadas',
				],
				destaque:
					'O ícone de suporte está fixo no cabeçalho global — acessível de qualquer módulo sem precisar navegar pelo menu.',
			},
		],
	},
	{
		id: 8,
		titulo: 'Módulo de Exportador — Prestação de Contas',
		icone: <Download className="w-5 h-5" />,
		cor: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
		passos: [
			{
				titulo: 'Configurar e exportar layouts SIM-AM',
				descricao: 'Logar como Operador Orçamentário ou Gestor de Contrato',
				acoes: [
					'Acessar "Prestação de Contas" no menu lateral',
					'Verificar os layouts disponíveis (PlanoContabil, MovimentoContabilMensal, etc.)',
					'Reordenar layouts arrastando para demonstrar a flexibilidade',
					'Selecionar competência (mês/ano) e clicar em "Exportar"',
					'Aguardar o processamento e verificar o arquivo gerado na lista de exportações',
					'Fazer download do arquivo ZIP e demonstrar o conteúdo',
				],
				destaque: 'Os layouts seguem o padrão SIM-AM exigido pela administração municipal.',
			},
		],
	},
];

export default function RoteiroDemonstracaoPage() {
	return (
		<div>
			<PageHeader title="Roteiro de Demonstração" description="Guia passo a passo para apresentação do sistema" />

			<div className="grid gap-5">
				{secoes.map((secao) => (
					<Card key={secao.id} className={`border-l-4 ${secao.cor}`}>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<span className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold shrink-0">
									{secao.id}
								</span>
								<span className="flex items-center gap-2">
									{secao.icone}
									{secao.titulo}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-5">
								{secao.passos.map((passo, i) => (
									<div key={i} className={i > 0 ? 'pt-4 border-t border-border' : ''}>
										<div className="flex items-start gap-2 mb-2">
											<Badge variant="outline" className="text-xs shrink-0 mt-0.5">
												{secao.passos.length > 1 ? `${i + 1}/${secao.passos.length}` : 'Passo'}
											</Badge>
											<div>
												<p className="text-sm font-semibold">{passo.titulo}</p>
												{passo.descricao && (
													<p className="text-xs text-muted-foreground mt-0.5">
														{passo.descricao}
													</p>
												)}
											</div>
										</div>
										<ol className="ml-2 space-y-1.5">
											{passo.acoes.map((acao, j) => (
												<li
													key={j}
													className="flex items-start gap-2 text-sm text-muted-foreground">
													<span className="text-foreground font-mono text-xs shrink-0 mt-0.5 w-5">
														{j + 1}.
													</span>
													<span>{acao}</span>
												</li>
											))}
										</ol>
										{passo.destaque && (
											<div className="mt-3 px-3 py-2 bg-muted rounded-md border border-border">
												<p className="text-xs text-muted-foreground">
													<span className="font-semibold text-foreground">Destaque: </span>
													{passo.destaque}
												</p>
											</div>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
