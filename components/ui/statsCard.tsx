export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-seller-border rounded-lg p-4">
      <p className="text-sm text-seller-muted">{title}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
    </div>
  );
}
