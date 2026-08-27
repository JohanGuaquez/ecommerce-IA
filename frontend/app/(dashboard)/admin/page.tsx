import { Card, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-muted-foreground">
          Bienvenido al panel administrativo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm text-muted-foreground">Ventas</h2>

            <p className="text-3xl font-bold mt-2">$0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm text-muted-foreground">Productos</h2>

            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm text-muted-foreground">Pedidos</h2>

            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
