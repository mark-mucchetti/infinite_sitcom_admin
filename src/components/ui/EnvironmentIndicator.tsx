import { useEffect, useState } from 'react';
import { getEnvironmentFromAPI, getEnvironmentDisplay, EnvironmentMode } from '../../utils/environment';

export function EnvironmentIndicator() {
  const [environment, setEnvironment] = useState<EnvironmentMode>('test');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check environment on mount and periodically
    const checkEnvironment = async () => {
      const mode = await getEnvironmentFromAPI();
      setEnvironment(mode);
      setLoading(false);
    };

    checkEnvironment();
    
    // Recheck every 30 seconds to stay in sync
    const interval = setInterval(checkEnvironment, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  const display = getEnvironmentDisplay(environment);

  return (
    <div className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${display.bgColor} ${display.color} ${display.borderColor} border`}>
      <span className="mr-2">{display.icon}</span>
      <span>{display.text} MODE</span>
    </div>
  );
}