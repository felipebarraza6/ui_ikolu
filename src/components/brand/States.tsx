import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 py-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-navy dark:bg-white/10 dark:text-limebrand">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-black">{title}</p>
          {description ? <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  title = "No pudimos cargar esta vista",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-bold text-destructive">{title}</p>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
