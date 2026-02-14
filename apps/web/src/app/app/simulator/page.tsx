import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthSimulatorClient } from './GrowthSimulatorClient';

export default function SimulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Growth Strategy Simulator</h1>
        <p className="mt-1 text-muted-foreground">
          Simulate posting frequency — predicted engagement curve and authority growth.
        </p>
      </div>

      <GrowthSimulatorClient />
    </div>
  );
}
