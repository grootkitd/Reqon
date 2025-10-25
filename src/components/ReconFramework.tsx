import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { 
  Shield, 
  Search, 
  Globe, 
  Server, 
  Network, 
  Bug, 
  Eye, 
  Users, 
  FileText, 
  Download,
  Zap,
  Terminal,
  Lock,
  Wifi,
  Database,
  Cloud,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Scan,
  Activity
} from 'lucide-react';
import { OSINTService } from '@/services/OSINTService';
import { NetworkReconService } from '@/services/NetworkReconService';
import { WebAppReconService } from '@/services/WebAppReconService';
import { SocialEngineeringService } from '@/services/SocialEngineeringService';
import { InfrastructureService } from '@/services/InfrastructureService';
import { ReportingService } from '@/services/ReportingService';
import { ReconResults } from '@/components/ReconResults';

interface ReconTarget {
  domain: string;
  company: string;
  ips?: string[];
  subdomains?: string[];
  emails?: string[];
  socialProfiles?: any[];
}

interface ReconResultsType {
  osint: any[];
  network: any;
  webApp: any;
  socialEngineering: any;
  infrastructure: any;
  vulnerabilities: any[];
  timeline: any[];
}

export const ReconFramework = () => {
  const [target, setTarget] = useState<ReconTarget>({
    domain: '',
    company: '',
    ips: [],
    subdomains: [],
    emails: [],
    socialProfiles: []
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ReconResultsType>({
    osint: [],
    network: [],
    webApp: [],
    socialEngineering: [],
    infrastructure: [],
    vulnerabilities: [],
    timeline: []
  });
  
  const [scanConfig, setScanConfig] = useState({
    osint: true,
    network: true,
    webApp: true,
    socialEngineering: true,
    infrastructure: true,
    deepScan: false,
    stealth: false,
    aggressive: false
  });

  const { toast } = useToast();

  const modules = [
    { 
      id: 'osint', 
      name: 'OSINT Collection', 
      icon: Eye, 
      description: 'Gather intelligence from public sources',
      service: OSINTService
    },
    { 
      id: 'network', 
      name: 'Network Enumeration', 
      icon: Network, 
      description: 'Discover network infrastructure and services',
      service: NetworkReconService
    },
    { 
      id: 'webApp', 
      name: 'Web Application Analysis', 
      icon: Globe, 
      description: 'Analyze web applications and technologies',
      service: WebAppReconService
    },
    { 
      id: 'socialEngineering', 
      name: 'Social Engineering Intel', 
      icon: Users, 
      description: 'Collect data for social engineering attacks',
      service: SocialEngineeringService
    },
    { 
      id: 'infrastructure', 
      name: 'Infrastructure Profiling', 
      icon: Server, 
      description: 'Map cloud and hosting infrastructure',
      service: InfrastructureService
    }
  ];

  const startFullRecon = async () => {
    if (!target.domain || !target.company) {
      toast({
        title: "Missing Target Information",
        description: "Please provide both domain and company name",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setResults({
      osint: [],
      network: [],
      webApp: [],
      socialEngineering: [],
      infrastructure: [],
      vulnerabilities: [],
      timeline: []
    });

    const startTime = Date.now();
    const totalModules = Object.values(scanConfig).filter(Boolean).length;
    let completedModules = 0;

    try {
      // Add timeline entry
      const timelineEntry = (module: string, status: string, data?: any) => {
        setResults(prev => ({
          ...prev,
          timeline: [...prev.timeline, {
            timestamp: new Date().toISOString(),
            module,
            status,
            data,
            elapsed: Date.now() - startTime
          }]
        }));
      };

      timelineEntry('Framework', 'STARTED', { target });

      // OSINT Module
      if (scanConfig.osint) {
        setActiveModule('OSINT Collection');
        timelineEntry('OSINT', 'RUNNING', null);
        
        try {
          const osintResults = await OSINTService.performReconnaissance({
            company: target.company,
            domain: target.domain,
            searchType: scanConfig.deepScan ? 'deep' : 'basic',
            sources: ['linkedin', 'google', 'github', 'twitter'],
            format: 'json'
          });
          
          setResults(prev => ({ ...prev, osint: osintResults.data || [] }));
          timelineEntry('OSINT', 'COMPLETED', { found: osintResults.data?.length || 0 });
        } catch (error) {
          timelineEntry('OSINT', 'FAILED', { error: error.message });
        }
        
        completedModules++;
        setProgress((completedModules / totalModules) * 100);
      }

      // Network Enumeration Module
      if (scanConfig.network) {
        setActiveModule('Network Enumeration');
        timelineEntry('Network', 'RUNNING', null);
        
        try {
          const networkResults = await NetworkReconService.performNetworkRecon(target.domain, {
            subdomainEnum: true,
            portScan: true,
            serviceDetection: true,
            dnsEnum: true,
            aggressive: scanConfig.aggressive
          });
          
          setResults(prev => ({ ...prev, network: networkResults }));
          timelineEntry('Network', 'COMPLETED', { 
            subdomains: networkResults.subdomains?.length || 0,
            openPorts: networkResults.openPorts?.length || 0
          });
        } catch (error) {
          timelineEntry('Network', 'FAILED', { error: error.message });
        }
        
        completedModules++;
        setProgress((completedModules / totalModules) * 100);
      }

      // Web Application Analysis
      if (scanConfig.webApp) {
        setActiveModule('Web Application Analysis');
        timelineEntry('WebApp', 'RUNNING', null);
        
        try {
          const webAppResults = await WebAppReconService.analyzeWebApp(target.domain, {
            techStack: true,
            dirBruteforce: true,
            sslAnalysis: true,
            headersAnalysis: true,
            vulnScan: scanConfig.aggressive
          });
          
          setResults(prev => ({ ...prev, webApp: webAppResults }));
          timelineEntry('WebApp', 'COMPLETED', { 
            technologies: webAppResults.technologies?.length || 0,
            directories: webAppResults.directories?.length || 0
          });
        } catch (error) {
          timelineEntry('WebApp', 'FAILED', { error: error.message });
        }
        
        completedModules++;
        setProgress((completedModules / totalModules) * 100);
      }

      // Social Engineering Intelligence
      if (scanConfig.socialEngineering) {
        setActiveModule('Social Engineering Intel');
        timelineEntry('SocialEng', 'RUNNING', null);
        
        try {
          const socialResults = await SocialEngineeringService.gatherIntelligence(target, {
            emailHarvesting: true,
            socialProfiles: true,
            breachData: true,
            phoneNumbers: true
          });
          
          setResults(prev => ({ ...prev, socialEngineering: socialResults }));
          timelineEntry('SocialEng', 'COMPLETED', { 
            emails: socialResults.emails?.length || 0,
            profiles: socialResults.profiles?.length || 0
          });
        } catch (error) {
          timelineEntry('SocialEng', 'FAILED', { error: error.message });
        }
        
        completedModules++;
        setProgress((completedModules / totalModules) * 100);
      }

      // Infrastructure Profiling
      if (scanConfig.infrastructure) {
        setActiveModule('Infrastructure Profiling');
        timelineEntry('Infrastructure', 'RUNNING', null);
        
        try {
          const infraResults = await InfrastructureService.profileInfrastructure(target.domain, {
            cloudProvider: true,
            cdnDetection: true,
            geolocation: true,
            asnInfo: true,
            certificateAnalysis: true
          });
          
          setResults(prev => ({ ...prev, infrastructure: infraResults }));
          timelineEntry('Infrastructure', 'COMPLETED', { 
            cloudProvider: infraResults.cloudProvider,
            asn: infraResults.asn
          });
        } catch (error) {
          timelineEntry('Infrastructure', 'FAILED', { error: error.message });
        }
        
        completedModules++;
        setProgress((completedModules / totalModules) * 100);
      }

      setActiveModule('');
      setProgress(100);
      timelineEntry('Framework', 'COMPLETED', { 
        totalTime: Date.now() - startTime,
        modulesRun: completedModules
      });

      toast({
        title: "🎯 Reconnaissance Complete",
        description: `Full assessment completed in ${Math.round((Date.now() - startTime) / 1000)}s`
      });

    } catch (error) {
      console.error('Reconnaissance failed:', error);
      toast({
        title: "Reconnaissance Failed",
        description: "An error occurred during the assessment",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setActiveModule('');
    }
  };

  const exportReport = async () => {
    try {
      const report = await ReportingService.generateComprehensiveReport(target, results, {
        format: 'html',
        includeTimeline: true,
        includeRiskAssessment: true,
        includeRecommendations: true
      });

      const blob = new Blob([report], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recon_report_${target.domain}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Comprehensive reconnaissance report exported"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate report",
        variant: "destructive"
      });
    }
  };

  const getTotalResults = () => {
    return Object.values(results).reduce<number>((total: number, moduleResults: unknown): number => {
      if (Array.isArray(moduleResults)) {
        return total + moduleResults.length;
      }
      if (moduleResults && typeof moduleResults === 'object') {
        return total + Object.values(moduleResults as Record<string, unknown>).reduce<number>((subtotal: number, subResults: unknown): number => {
          return subtotal + (Array.isArray(subResults) ? subResults.length : 0);
        }, 0);
      }
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              RECON FRAMEWORK
            </h1>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Complete penetration testing reconnaissance platform with advanced OSINT, network enumeration, 
            web application analysis, social engineering intelligence, and infrastructure profiling
          </p>
          
          {/* Legal Disclaimer */}
          <Card className="max-w-5xl mx-auto border-red-500/30 bg-red-500/5 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-200 text-left">
                  <strong className="text-red-400">CRITICAL WARNING:</strong> This advanced reconnaissance framework is for 
                  authorized penetration testing only. Unauthorized use against systems you don't own may violate laws and regulations. 
                  Always obtain explicit written permission before testing. Use responsibly and ethically.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Target Configuration */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm shadow-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Configuration
            </CardTitle>
            <CardDescription>
              Configure your reconnaissance target and scan parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Domain</label>
                <Input
                  placeholder="e.g., example.com"
                  value={target.domain}
                  onChange={(e) => setTarget(prev => ({ ...prev, domain: e.target.value }))}
                  className="bg-background/50 border-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="e.g., Example Corporation"
                  value={target.company}
                  onChange={(e) => setTarget(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-background/50 border-primary/30"
                />
              </div>
            </div>

            {/* Module Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Reconnaissance Modules</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <Card 
                      key={module.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        scanConfig[module.id] 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setScanConfig(prev => ({ 
                        ...prev, 
                        [module.id]: !prev[module.id] 
                      }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${
                            scanConfig[module.id] ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{module.name}</h4>
                            <p className="text-xs text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Scan Options */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Scan Options</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanConfig.deepScan}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, deepScan: e.target.checked }))}
                    className="rounded border-primary/30"
                  />
                  <span className="text-sm">Deep Scan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanConfig.stealth}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, stealth: e.target.checked }))}
                    className="rounded border-primary/30"
                  />
                  <span className="text-sm">Stealth Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanConfig.aggressive}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, aggressive: e.target.checked }))}
                    className="rounded border-primary/30"
                  />
                  <span className="text-sm text-orange-400">Aggressive Scan ⚠️</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={startFullRecon}
                disabled={isScanning || !target.domain || !target.company}
                variant="cyber"
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    {activeModule ? `Running: ${activeModule}` : 'Initializing...'}
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    Start Full Reconnaissance
                  </>
                )}
              </Button>
              
              <Button 
                onClick={exportReport}
                disabled={getTotalResults() === 0}
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        {isScanning && (
          <Card className="border-accent/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reconnaissance Progress</span>
                  <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {activeModule && (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Activity className="h-4 w-4 animate-spin" />
                    Currently running: {activeModule}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Dashboard */}
        {getTotalResults() > 0 && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="osint">OSINT</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="webapp">Web App</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="infra">Infrastructure</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary">{results.osint.length}</div>
                    <p className="text-xs text-muted-foreground">OSINT Profiles</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-accent">{results.network?.subdomains?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Network Assets</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary">{results.webApp?.technologies?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Web Technologies</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-accent">{results.socialEngineering?.emails?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Social Profiles</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary">{results.infrastructure?.cloudProvider ? 1 : 0}</div>
                    <p className="text-xs text-muted-foreground">Infrastructure</p>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-400">{results.vulnerabilities.length}</div>
                    <p className="text-xs text-muted-foreground">Vulnerabilities</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Reconnaissance Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-background/30">
                        <div className="flex-shrink-0">
                          {entry.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {entry.status === 'FAILED' && <XCircle className="h-5 w-5 text-red-400" />}
                          {entry.status === 'RUNNING' && <Activity className="h-5 w-5 text-blue-400 animate-spin" />}
                          {entry.status === 'STARTED' && <Target className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{entry.module}</span>
                            <Badge variant={entry.status === 'COMPLETED' ? 'default' : entry.status === 'FAILED' ? 'destructive' : 'secondary'}>
                              {entry.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(entry.timestamp).toLocaleTimeString()} 
                            {entry.elapsed && ` • ${Math.round(entry.elapsed / 1000)}s`}
                          </div>
                          {entry.data && (
                            <div className="text-xs text-muted-foreground mt-2">
                              {JSON.stringify(entry.data, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="osint">
              <ReconResults results={{ osint: results.osint }} />
            </TabsContent>
            
            <TabsContent value="network">
              <ReconResults results={{ network: results.network }} />
            </TabsContent>
            
            <TabsContent value="webapp">
              <ReconResults results={{ webApp: results.webApp }} />
            </TabsContent>
            
            <TabsContent value="social">
              <ReconResults results={{ socialEngineering: results.socialEngineering }} />
            </TabsContent>
            
            <TabsContent value="infra">
              <ReconResults results={{ infrastructure: results.infrastructure }} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
