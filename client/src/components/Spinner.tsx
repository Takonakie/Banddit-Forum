export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-card rounded-lg p-8 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-reddit-orange"></div>
        <span className="text-lg font-medium text-foreground">Loading...</span>
      </div>
    </div>
  );
}
