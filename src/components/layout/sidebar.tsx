import { Button, Card } from '@heroui/react';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-dvh py-4 px-2 sm:py-8 sm:px-4 overflow-y-auto">
      <Card className="h-full">
        <Card.Header>
          <Card.Title>Matchball</Card.Title>
        </Card.Header>
        <Card.Content>
          <Button>Button</Button>
        </Card.Content>
      </Card>
    </aside>
  );
}
