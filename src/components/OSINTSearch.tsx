import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Shield, Users, Building, Eye, AlertTriangle } from 'lucide-react';
import { OSINTService } from '@/services/OSINTService';
import { ReconResults } from './ReconResults';

interface SearchParams {
  company: string;
  domain: string;
  searchType: 'basic' | 'deep' | 'stealth';
  sources: string[];
  format: 'json' | 'csv' | 'txt' | 'xml';
}

export const OSINTSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    company: '',
    domain: '',
    searchType: 'basic',
    sources: ['linkedin', 'google', 'github'],
    format: 'json'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState({
    total: 0,
    processed: 0,
    found: 0,
    duration: 0,
    speed: 0
  });
  const [realTimeProgress, setRealTimeProgress] = useState(0);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchParams.company || !searchParams.domain) {
      toast({
        title: "Missing Information",
        description: "Please provide both company name and domain",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSearchStats({ total: 0, processed: 0, found: 0, duration: 0, speed: 0 });
    setRealTimeProgress(0);
    
    const startTime = Date.now();
    
    try {
      const searchResults = await OSINTService.performReconnaissance(
        searchParams,
        (progress) => {
          // Real-time progress updates
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const speed = progress.processed > 0 ? Math.round((progress.processed / elapsed) * 1000) : 0; // queries/second
          
          setSearchStats({
            total: progress.total,
            processed: progress.processed,
            found: progress.found,
            duration: elapsed,
            speed
          });
          setRealTimeProgress((progress.processed / progress.total) * 100);
        }
      );
      
      setResults(searchResults.data || []);
      const finalDuration = Date.now() - startTime;
      setSearchStats({
        total: searchResults.total || 0,
        processed: searchResults.processed || 0,
        found: searchResults.data?.length || 0,
        duration: finalDuration,
        speed: Math.round(((searchResults.processed || 0) / finalDuration) * 1000)
      });

      toast({
        title: "🚀 RECON FRAMEWORK Complete",
        description: `Found ${searchResults.data?.length || 0} unique profiles in ${Math.round(finalDuration / 1000)}s`
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "An error occurred during reconnaissance",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    try {
      const exportData = OSINTService.exportResults(results, searchParams.format);
      const blob = new Blob([exportData], { 
        type: searchParams.format === 'json' ? 'application/json' : 'text/plain' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recon_${searchParams.company}_${Date.now()}.${searchParams.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Results exported as ${searchParams.format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export results",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              RECON FRAMEWORK
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced OSINT reconnaissance platform for authorized penetration testing and security research
          </p>
          
          {/* Legal Disclaimer */}
          <Card className="max-w-4xl mx-auto border-accent/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground text-left">
                  <strong className="text-accent">LEGAL NOTICE:</strong> This tool is intended for authorized security testing only. 
                  Users must have explicit permission to test target systems. Unauthorized use may violate privacy laws and terms of service. 
                  Use responsibly and ethically.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Configuration */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm shadow-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Configuration
            </CardTitle>
            <CardDescription>
              Configure your reconnaissance parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Company</label>
                <Input
                  placeholder="e.g., Acme Corporation"
                  value={searchParams.company}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-background/50 border-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <Input
                  placeholder="e.g., acme.com"
                  value={searchParams.domain}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, domain: e.target.value }))}
                  className="bg-background/50 border-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Type</label>
                <Select 
                  value={searchParams.searchType} 
                  onValueChange={(value: any) => setSearchParams(prev => ({ ...prev, searchType: value }))}
                >
                  <SelectTrigger className="bg-background/50 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Scan</SelectItem>
                    <SelectItem value="deep">Deep Analysis</SelectItem>
                    <SelectItem value="stealth">Stealth Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select 
                  value={searchParams.format} 
                  onValueChange={(value: any) => setSearchParams(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="bg-background/50 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sources</label>
                <div className="flex flex-wrap gap-2">
                  {['linkedin', 'google', 'github', 'twitter'].map((source) => (
                    <Badge
                      key={source}
                      variant={searchParams.sources.includes(source) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        setSearchParams(prev => ({
                          ...prev,
                          sources: prev.sources.includes(source)
                            ? prev.sources.filter(s => s !== source)
                            : [...prev.sources, source]
                        }));
                      }}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchParams.company || !searchParams.domain}
                variant="cyber"
                className="flex-1"
              >
                {isSearching ? (
                  <>
                    <Eye className="h-4 w-4 animate-pulse" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Start Reconnaissance
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleExport} 
                disabled={results.length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Search Stats with Real-time Progress */}
        {(searchStats.total > 0 || isSearching) && (
          <div className="space-y-4">
            {/* Progress Bar */}
            {isSearching && (
              <Card className="border-accent/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scanning Progress</span>
                      <span>{realTimeProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${realTimeProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{searchStats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Queries</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-accent">{searchStats.processed}</div>
                  <p className="text-xs text-muted-foreground">Processed</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">{searchStats.found}</div>
                  <p className="text-xs text-muted-foreground">Results Found</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {Math.round(searchStats.duration / 1000)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </CardContent>
              </Card>
              <Card className="border-accent/30 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-accent">{searchStats.speed}</div>
                  <p className="text-xs text-muted-foreground">Queries/sec</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <ReconResults results={results} />
        )}
      </div>
    </div>
  );
};