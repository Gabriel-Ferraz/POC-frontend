'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';

export default function AlteracaoDetalhePage() {
	const params = useParams();
	const router = useRouter();
	const alteracaoId = params.id as string;

	useEffect(() => {
		// Redireciona para a página de dotações
		router.replace(`/orcamentario/alteracoes/${alteracaoId}/dotacoes`);
	}, [alteracaoId, router]);

	return <Loading text="Redirecionando..." />;
}
