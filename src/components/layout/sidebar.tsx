import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-dvh py-4 px-2 sm:py-8 sm:px-4 overflow-y-auto">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Matchball</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="mt-6 flex flex-col gap-1">
          Sidebar Navigation

          <Button>Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </nav>
      </CardContent>
      </Card>
    </aside>
  );
}
