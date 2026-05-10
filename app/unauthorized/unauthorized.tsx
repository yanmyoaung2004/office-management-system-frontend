export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg">
          You don&apos;t have permission to access this page.
        </p>
        <p className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline">
            Return to Login
          </a>
        </p>
      </div>
    </div>
  );
}
