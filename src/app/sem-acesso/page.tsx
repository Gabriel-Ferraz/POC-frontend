import AuthenticatedLayout from '@/layout/AuthenticatedLayout';

import SemAcessoClient from './SemAcessoClient';

export default function SemAcessoPage() {
	return (
		<AuthenticatedLayout>
			<SemAcessoClient />
		</AuthenticatedLayout>
	);
}
