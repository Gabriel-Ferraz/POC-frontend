'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { FormaPagamento } from '@/types/enums';
import { toast } from 'sonner';

const TIPOS_DOCUMENTO = ['Nota Fiscal', 'Nota Fiscal Eletrônica', 'Recibo', 'Fatura', 'Cupom Fiscal', 'Outro'];

export default function NovaSolicitacaoPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const empenhoId = parseInt(params.id as string);

	const [tipoDocumento, setTipoDocumento] = useState('');
	const [numeroDocumento, setNumeroDocumento] = useState('');
	const [serieDocumento, setSerieDocumento] = useState('');
	const [dataEmissaoDocumento, setDataEmissaoDocumento] = useState('');
	const [valor, setValor] = useState('');
	const [formaPagamento, setFormaPagamento] = useState('');
	const [banco, setBanco] = useState('');
	const [agencia, setAgencia] = useState('');
	const [agenciaDigito, setAgenciaDigito] = useState('');
	const [conta, setConta] = useState('');
	const [contaDigito, setContaDigito] = useState('');
	const [cidadeBanco, setCidadeBanco] = useState('');

	const { mutate: criarSolicitacao, isPending } = useMutation({
		mutationFn: () =>
			solicitacoesApi.criarSolicitacao(empenhoId, {
				valor: parseFloat(valor),
				tipo_documento: tipoDocumento,
				numero_documento: numeroDocumento,
				serie: serieDocumento || undefined,
				data_emissao_documento: dataEmissaoDocumento,
				forma_pagamento: formaPagamento,
				banco: banco || undefined,
				agencia: agencia || undefined,
				digito_agencia: agenciaDigito || undefined,
				conta: conta || undefined,
				digito_conta: contaDigito || undefined,
				cidade_banco: cidadeBanco || undefined,
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

		if (!tipoDocumento || !numeroDocumento || !dataEmissaoDocumento || !valor || !formaPagamento) {
			toast.error('Preencha todos os campos obrigatórios');
			return;
		}

		criarSolicitacao();
	};

	return (
		<div>
			<PageHeader
				title="Nova Solicitação de Pagamento"
				description={`Criar solicitação para o empenho ${empenhoId}`}
			/>

			<Card>
				<div className="p-6">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Dados do Documento Fiscal</h3>

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

								<div>
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
						</div>

						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Forma de Pagamento</h3>

							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
									<SelectNative
										id="forma_pagamento"
										value={formaPagamento}
										onChange={(e) => setFormaPagamento(e.target.value)}
										disabled={isPending}
										required>
										<option value="">Selecione...</option>
										<option value={FormaPagamento.CONTA_BANCARIA}>Conta Bancária</option>
										<option value={FormaPagamento.DOCUMENTO}>Documento (Cheque/Boleto)</option>
									</SelectNative>
								</div>

								{formaPagamento === FormaPagamento.CONTA_BANCARIA && (
									<>
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
									</>
								)}
							</div>
						</div>

						<div className="flex gap-3 justify-end pt-4 border-t">
							<Button variant="outline" onClick={() => router.back()} type="button" disabled={isPending}>
								Cancelar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Salvando...' : 'Salvar e Continuar'}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}
