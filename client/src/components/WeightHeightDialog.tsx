import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Scale, Ruler, Shield } from 'lucide-react';
import { validateMeasurements } from '@/lib/sizeRecommendation';

interface WeightHeightDialogProps {
  open: boolean;
  onSave: (weight: number, height: number) => Promise<void>;
  initialWeight?: number;
  initialHeight?: number;
}

const WeightHeightDialog = ({ open, onSave, initialWeight, initialHeight }: WeightHeightDialogProps) => {
  const [weight, setWeight] = useState(initialWeight?.toString() || '');
  const [height, setHeight] = useState(initialHeight?.toString() || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      setError('Please enter valid numbers for weight and height');
      return;
    }

    const validation = validateMeasurements(weightNum, heightNum);
    if (!validation.valid) {
      setError(validation.error || 'Invalid measurements');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onSave(weightNum, heightNum);
    } catch (err: any) {
      setError(err.message || 'Failed to save measurements');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            Your Measurements
          </DialogTitle>
          <DialogDescription>
            Help us recommend the perfect size for you. This information will be saved to your profile for future recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min={30}
              max={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="e.g., 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min={100}
              max={250}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Your measurements are securely stored and only used to provide personalized size recommendations. 
              You can update them anytime from your profile.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading || !weight || !height}
          variant="gold"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WeightHeightDialog;
