import AuthenticatedLayout from '@/layout/AuthenticatedLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { ADMIN } from '@/app/features/admin/permissions';

export default function PerfisPage() {
	return (
		<AuthenticatedLayout>
			<ProtectedPage permission={ADMIN.rolesTab}>
				<div className="space-y-4">
					<h1 className="text-2xl font-bold">Perfis</h1>
					<p className="text-muted-foreground">TODO: Implementar CRUD de perfis.</p>
				</div>
			</ProtectedPage>
		</AuthenticatedLayout>
	);
}
