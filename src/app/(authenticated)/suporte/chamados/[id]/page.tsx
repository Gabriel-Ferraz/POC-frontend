'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { useQuery } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';

export default function ChamadoDetalhePage() {
	const params = useParams();
	const chamadoId = parseInt(params.id as string);

	const { data, isLoading } = useQuery({
		queryKey: ['chamado', chamadoId],
		queryFn: () => suporteApi.getChamado(chamadoId),
	});

	if (isLoading) {
		return <Loading text="Carregando chamado..." />;
	}

	if (!data || !data.chamado) {
		return (
			<div>
				<PageHeader title="Chamado não encontrado" description="O chamado solicitado não existe" />
			</div>
		);
	}

	const chamado = data.chamado;
	const timeline = data.timeline || [];

	return (
		<div className="space-y-6">
			<PageHeader title={`Chamado #${chamado.id}`} description={chamado.assunto} />

			<Card>
				<div className="p-6 space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500">Módulo</p>
							<p className="font-medium">{chamado.modulo}</p>
						</div>

						<StatusBadge status={chamado.status} />
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<p className="text-sm text-gray-500">Data de Abertura</p>
							<p className="font-medium">{chamado.data_cadastro}</p>
						</div>

						{chamado.data_resposta && (
							<div>
								<p className="text-sm text-gray-500">Data de Resposta</p>
								<p className="font-medium">{chamado.data_resposta}</p>
							</div>
						)}

						{chamado.data_conclusao && (
							<div>
								<p className="text-sm text-gray-500">Data de Conclusão</p>
								<p className="font-medium">{chamado.data_conclusao}</p>
							</div>
						)}
					</div>

					<div>
						<p className="text-sm text-gray-500">Usuário</p>
						<p className="font-medium">{chamado.usuario}</p>
					</div>
				</div>
			</Card>

			{timeline.length > 0 && (
				<Card>
					<div className="p-6">
						<h3 className="font-semibold mb-4">Timeline do Chamado</h3>
						<div className="space-y-4">
							{timeline.map((item: any, index: number) => (
								<div
									key={index}
									className={`border-l-4 pl-4 ${
										item.tipo === 'abertura'
											? 'border-blue-500'
											: item.tipo === 'resposta'
												? 'border-green-500'
												: 'border-gray-300'
									}`}>
									<div className="flex items-center gap-2 mb-1">
										<span
											className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
												item.tipo === 'abertura'
													? 'bg-blue-100 text-blue-800'
													: item.tipo === 'resposta'
														? 'bg-green-100 text-green-800'
														: 'bg-gray-100 text-gray-800'
											}`}>
											{item.tipo}
										</span>
										<span className="text-sm text-gray-500">{item.data}</span>
									</div>
									<p className="text-sm font-medium text-gray-700 mb-1">{item.usuario}</p>
									<p className="text-sm text-gray-600">{item.mensagem}</p>

									{item.anexos && item.anexos.length > 0 && (
										<div className="mt-2">
											<p className="text-xs text-gray-500 mb-1">Anexos:</p>
											<div className="flex gap-2">
												{item.anexos.map((anexo: any, i: number) => (
													<a
														key={i}
														href={anexo.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:underline">
														📎 {anexo.nome}
													</a>
												))}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
