import AuthenticatedLayout from '@/layout/AuthenticatedLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { ADMIN } from '@/app/features/admin/permissions';

export default function UsuariosPage() {
	return (
		<AuthenticatedLayout>
			<ProtectedPage permission={ADMIN.usersTab}>
				<div className="space-y-4">
					<h1 className="text-2xl font-bold">Usuarios</h1>
					<p className="text-muted-foreground">TODO: Implementar CRUD de usuarios.</p>
				</div>
			</ProtectedPage>
		</AuthenticatedLayout>
	);
}
