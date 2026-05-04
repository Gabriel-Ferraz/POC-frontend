'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { FormaPagamento } from '@/types/enums';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { FileText, Minimize2, CheckCircle2 } from 'lucide-react';

const TIPOS_DOCUMENTO = ['Nota Fiscal', 'Nota Fiscal Eletrônica', 'Recibo', 'Fatura', 'Cupom Fiscal', 'Outro'];

interface FormData {
	valor: string;
	tipoDocumento: string;
	numeroDocumento: string;
	serieDocumento: string;
	dataEmissaoDocumento: string;
	observacaoDocumento: string;
	formaPagamento: string;
	banco: string;
	agencia: string;
	agenciaDigito: string;
	conta: string;
	contaDigito: string;
	operacao: string;
	cidadeBanco: string;
	observacaoPagamento: string;
}

export default function NovaSolicitacaoPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const empenhoId = parseInt(params.id as string);

	const [valor, setValor] = useState('');
	const [tipoDocumento, setTipoDocumento] = useState('');
	const [numeroDocumento, setNumeroDocumento] = useState('');
	const [serieDocumento, setSerieDocumento] = useState('');
	const [dataEmissaoDocumento, setDataEmissaoDocumento] = useState('');
	const [observacaoDocumento, setObservacaoDocumento] = useState('');
	const [formaPagamento, setFormaPagamento] = useState('');
	const [banco, setBanco] = useState('');
	const [agencia, setAgencia] = useState('');
	const [agenciaDigito, setAgenciaDigito] = useState('');
	const [conta, setConta] = useState('');
	const [contaDigito, setContaDigito] = useState('');
	const [operacao, setOperacao] = useState('');
	const [cidadeBanco, setCidadeBanco] = useState('');
	const [observacaoPagamento, setObservacaoPagamento] = useState('');

	const { minimizar, isMinimizado, dadosRestaurados, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: `Nova Solicitação - Empenho ${empenhoId}`,
		icone: <FileText className="w-4 h-4" />,
		onRestore: (dados) => {
			setValor(dados.valor);
			setTipoDocumento(dados.tipoDocumento);
			setNumeroDocumento(dados.numeroDocumento);
			setSerieDocumento(dados.serieDocumento);
			setDataEmissaoDocumento(dados.dataEmissaoDocumento);
			setObservacaoDocumento(dados.observacaoDocumento);
			setFormaPagamento(dados.formaPagamento);
			setBanco(dados.banco);
			setAgencia(dados.agencia);
			setAgenciaDigito(dados.agenciaDigito);
			setConta(dados.conta);
			setContaDigito(dados.contaDigito);
			setOperacao(dados.operacao);
			setCidadeBanco(dados.cidadeBanco);
			setObservacaoPagamento(dados.observacaoPagamento);
			toast.success('Formulário restaurado com sucesso!');
		},
	});

	const { mutate: criarSolicitacao, isPending } = useMutation({
		mutationFn: () =>
			solicitacoesApi.criarSolicitacao(empenhoId, {
				valor: parseFloat(valor),
				tipo_documento: tipoDocumento,
				numero_documento: numeroDocumento,
				serie: serieDocumento || undefined,
				data_emissao_documento: dataEmissaoDocumento,
				observacao_documento: observacaoDocumento || undefined,
				forma_pagamento: formaPagamento,
				banco: banco || undefined,
				agencia: agencia || undefined,
				digito_agencia: agenciaDigito || undefined,
				conta: conta || undefined,
				digito_conta: contaDigito || undefined,
				operacao: operacao || undefined,
				cidade_banco: cidadeBanco || undefined,
				observacao_pagamento: observacaoPagamento || undefined,
			}),
		onSuccess: () => {
			toast.success('Solicitação criada com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['solicitacoes', empenhoId] });
			router.push(`/portal-fornecedor/empenhos/${empenhoId}/solicitacoes`);
		},
		onError: (error: any) => {
			console.error('Erro ao criar solicitação:', error);
			toast.error(error?.payload?.message || error?.message || 'Erro ao criar solicitação');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!valor || !tipoDocumento || !numeroDocumento || !dataEmissaoDocumento || !formaPagamento) {
			toast.error('Preencha todos os campos obrigatórios');
			return;
		}

		criarSolicitacao();
	};

	const handleMinimizar = () => {
		const formData: FormData = {
			valor,
			tipoDocumento,
			numeroDocumento,
			serieDocumento,
			dataEmissaoDocumento,
			observacaoDocumento,
			formaPagamento,
			banco,
			agencia,
			agenciaDigito,
			conta,
			contaDigito,
			operacao,
			cidadeBanco,
			observacaoPagamento,
		};
		minimizar(formData);
	};

	// Se está minimizado, mostra tela em branco
	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Formulário Minimizado</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title="Nova Solicitação de Pagamento"
					description={`Criar solicitação para o empenho ${empenhoId}`}
				/>
				<Button
					variant="outline"
					onClick={handleMinimizar}
					disabled={isPending}
					className="flex items-center gap-2">
					<Minimize2 className="w-4 h-4" />
					Minimizar
				</Button>
			</div>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						<CheckCircle2 className="w-4 h-4 inline mr-1" /> Formulário restaurado com os dados salvos
						anteriormente
					</p>
				</div>
			)}

			<form className="space-y-6" onSubmit={handleSubmit}>
				{/* BLOCO 1: Valor */}
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Valor da Solicitação</h3>
						<div className="max-w-md">
							<Label htmlFor="valor">Valor *</Label>
							<Input
								id="valor"
								type="number"
								step="0.01"
								min="0"
								placeholder="0,00"
								value={valor}
								onChange={(e) => setValor(e.target.value)}
								disabled={isPending}
								required
							/>
						</div>
					</div>
				</Card>

				{/* BLOCO 2: Informações do Documento Fiscal */}
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Informações do Documento Fiscal Recebido</h3>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="tipo_documento">Tipo de Documento *</Label>
								<SelectNative
									id="tipo_documento"
									value={tipoDocumento}
									onChange={(e) => setTipoDocumento(e.target.value)}
									disabled={isPending}
									required>
									<option value="">Selecione...</option>
									{TIPOS_DOCUMENTO.map((tipo) => (
										<option key={tipo} value={tipo}>
											{tipo}
										</option>
									))}
								</SelectNative>
							</div>

							<div>
								<Label htmlFor="numero_documento">Número do Documento *</Label>
								<Input
									id="numero_documento"
									placeholder="Ex: 12345"
									value={numeroDocumento}
									onChange={(e) => setNumeroDocumento(e.target.value)}
									disabled={isPending}
									required
								/>
							</div>

							<div>
								<Label htmlFor="serie_documento">Série do Documento</Label>
								<Input
									id="serie_documento"
									placeholder="Ex: A"
									value={serieDocumento}
									onChange={(e) => setSerieDocumento(e.target.value)}
									disabled={isPending}
								/>
							</div>

							<div>
								<Label htmlFor="data_emissao_documento">Data de Emissão *</Label>
								<Input
									id="data_emissao_documento"
									type="date"
									value={dataEmissaoDocumento}
									onChange={(e) => setDataEmissaoDocumento(e.target.value)}
									disabled={isPending}
									required
								/>
							</div>

							<div className="col-span-2">
								<Label htmlFor="observacao_documento">Observação (Opcional)</Label>
								<Textarea
									id="observacao_documento"
									placeholder="Informações adicionais sobre o documento fiscal..."
									value={observacaoDocumento}
									onChange={(e) => setObservacaoDocumento(e.target.value)}
									disabled={isPending}
									rows={3}
								/>
							</div>
						</div>
					</div>
				</Card>

				{/* BLOCO 3: Informações de Pagamento */}
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Informações de Pagamento</h3>

						<div className="space-y-4">
							<div>
								<Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
								<SelectNative
									id="forma_pagamento"
									value={formaPagamento}
									onChange={(e) => setFormaPagamento(e.target.value)}
									disabled={isPending}
									required>
									<option value="">Selecione...</option>
									<option value={FormaPagamento.CONTA_BANCARIA}>Conta Bancária</option>
									<option value={FormaPagamento.DOCUMENTO}>Documento/Fatura</option>
								</SelectNative>
							</div>

							{formaPagamento === FormaPagamento.CONTA_BANCARIA && (
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="col-span-2">
										<Label htmlFor="banco">Banco</Label>
										<Input
											id="banco"
											placeholder="Ex: Banco do Brasil"
											value={banco}
											onChange={(e) => setBanco(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div>
										<Label htmlFor="agencia">Agência</Label>
										<Input
											id="agencia"
											placeholder="0000"
											value={agencia}
											onChange={(e) => setAgencia(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div>
										<Label htmlFor="agencia_digito">Dígito da Agência</Label>
										<Input
											id="agencia_digito"
											placeholder="0"
											maxLength={1}
											value={agenciaDigito}
											onChange={(e) => setAgenciaDigito(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div>
										<Label htmlFor="conta">Conta</Label>
										<Input
											id="conta"
											placeholder="00000"
											value={conta}
											onChange={(e) => setConta(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div>
										<Label htmlFor="conta_digito">Dígito da Conta</Label>
										<Input
											id="conta_digito"
											placeholder="0"
											maxLength={2}
											value={contaDigito}
											onChange={(e) => setContaDigito(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div>
										<Label htmlFor="operacao">Operação da Conta</Label>
										<Input
											id="operacao"
											placeholder="Ex: 013"
											maxLength={10}
											value={operacao}
											onChange={(e) => setOperacao(e.target.value)}
											disabled={isPending}
										/>
									</div>

									<div className="col-span-2">
										<Label htmlFor="cidade_banco">Cidade do Banco</Label>
										<Input
											id="cidade_banco"
											placeholder="Ex: São José dos Pinhais"
											value={cidadeBanco}
											onChange={(e) => setCidadeBanco(e.target.value)}
											disabled={isPending}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</Card>

				{/* BLOCO 4: Observação do Pagamento */}
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Observações do Pagamento</h3>
						<div>
							<Label htmlFor="observacao_pagamento">Observação (Opcional)</Label>
							<Textarea
								id="observacao_pagamento"
								placeholder="Informações adicionais sobre o pagamento..."
								value={observacaoPagamento}
								onChange={(e) => setObservacaoPagamento(e.target.value)}
								disabled={isPending}
								rows={3}
							/>
						</div>
					</div>
				</Card>

				{/* Botões de Ação */}
				<div className="flex gap-3 justify-end">
					<Button variant="outline" onClick={() => router.back()} type="button" disabled={isPending}>
						Cancelar
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Salvando...' : 'Salvar e Continuar'}
					</Button>
				</div>
			</form>
		</div>
	);
}
