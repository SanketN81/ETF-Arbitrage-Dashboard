import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';

interface AddAssetDialogProps {
  onAssetAdded?: () => void;
}

const ASSET_TYPES = [
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Index', label: 'Index' },
  { value: 'Debt', label: 'Debt' },
  { value: 'Commodity', label: 'Commodity' },
  { value: 'International', label: 'International' },
  { value: 'Other', label: 'Other' },
];

export function AddAssetDialog({ onAssetAdded }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Other');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!symbol.trim() || !name.trim()) {
        throw new Error('Please enter both symbol and name');
      }

      await apiService.addETF(symbol.trim(), name.trim(), assetType);
      setOpen(false);
      setSymbol('');
      setName('');
      setAssetType('Other');
      onAssetAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolChange = (value: string) => {
    const upperValue = value.toUpperCase().trim();
    setSymbol(upperValue);
    // Auto-generate name if empty
    if (!name && upperValue) {
      setName(upperValue + ' ETF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New ETF/Asset</DialogTitle>
          <DialogDescription>
            Enter the symbol and name to track a new ETF from NSE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">
              Symbol <span className="text-red-500">*</span>
            </Label>
            <Input
              id="symbol"
              placeholder="e.g., GOLDBEES"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              NSE symbol (will be converted to uppercase)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Nippon India ETF Gold Bees"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetType">Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Asset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAssetDialog;
