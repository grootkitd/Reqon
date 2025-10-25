import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Network, Globe, Users, Server, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReconResultsProps {
  results: any;
}

export const ReconResults = ({ results }: ReconResultsProps) => {
  return (
    <div className="space-y-4">
      {/* OSINT Results */}
      {results.osint && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              OSINT Intelligence
            </CardTitle>
            <CardDescription>
              Open Source Intelligence findings from {results.osint?.length || 0} sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.osint?.slice(0, 10).map((profile: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-background/30 border border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{profile.name}</h4>
                        <Badge variant="outline">{profile.platform}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{profile.title} at {profile.company}</p>
                      {profile.email && (
                        <p className="text-xs text-primary">{profile.email}</p>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                    {profile.verified && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Results */}
      {results.network && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Subdomains ({results.network?.subdomains?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {results.network?.subdomains?.slice(0, 8).map((sub: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-background/30 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{sub.subdomain}</p>
                        <p className="text-xs text-muted-foreground">{sub.ip}</p>
                        <div className="flex gap-2">
                          {sub.services?.slice(0, 3).map((service: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.ssl && <Shield className="h-4 w-4 text-green-400" />}
                        <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
                          {sub.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Open Ports ({results.network?.openPorts?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {results.network?.openPorts?.slice(0, 6).map((port: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-background/30 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Port {port.port}/{port.protocol}</p>
                        <p className="text-xs text-muted-foreground">{port.service} {port.version}</p>
                        {port.banner && (
                          <p className="text-xs text-accent">{port.banner}</p>
                        )}
                      </div>
                      <Badge variant={port.state === 'open' ? 'destructive' : 'secondary'}>
                        {port.state}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Web App Results */}
      {results.webApp && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Technologies ({results.webApp?.technologies?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {results.webApp?.technologies?.slice(0, 8).map((tech: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-background/30 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{tech.name} {tech.version}</p>
                        <p className="text-xs text-muted-foreground">{tech.category}</p>
                      </div>
                      <Badge variant="outline">{tech.confidence}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Vulnerabilities ({results.webApp?.vulnerabilities?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.webApp?.vulnerabilities?.slice(0, 5).map((vuln: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{vuln.title}</h4>
                        <Badge variant={vuln.severity === 'Critical' ? 'destructive' : vuln.severity === 'High' ? 'destructive' : 'secondary'}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{vuln.description}</p>
                      {vuln.cvss && (
                        <p className="text-xs text-red-400">CVSS: {vuln.cvss}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Engineering Results */}
      {results.socialEngineering && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Email Addresses ({results.socialEngineering?.emails?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.socialEngineering?.emails?.slice(0, 8).map((email: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-background/30 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{email.email}</p>
                        <p className="text-xs text-muted-foreground">{email.role} - {email.department}</p>
                        <p className="text-xs text-accent">Found on: {email.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.verified && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {email.breachCount > 0 && (
                          <Badge variant="destructive">{email.breachCount} breaches</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Data Breaches ({results.socialEngineering?.breaches?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.socialEngineering?.breaches?.slice(0, 5).map((breach: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{breach.breachName}</h4>
                        <Badge variant={breach.sensitive ? 'destructive' : 'secondary'}>
                          {breach.sensitive ? 'Sensitive' : 'Standard'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {breach.affectedAccounts.toLocaleString()} accounts affected on {new Date(breach.breachDate).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {breach.dataClasses?.slice(0, 4).map((dataClass: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{dataClass}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Infrastructure Results */}
      {results.infrastructure && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Infrastructure Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.infrastructure?.cloudProvider && (
                <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                  <h4 className="font-medium text-sm mb-2">Cloud Provider</h4>
                  <p className="text-primary font-medium">{results.infrastructure.cloudProvider.provider}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.infrastructure.cloudProvider.services?.map((service: string, index: number) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {results.infrastructure?.cdn && (
                <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                  <h4 className="font-medium text-sm mb-2">CDN Provider</h4>
                  <p className="text-accent font-medium">{results.infrastructure.cdn.provider}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.infrastructure.cdn.endpoints?.slice(0, 3).map((endpoint: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">{endpoint}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {results.infrastructure?.geolocation && (
                <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                  <h4 className="font-medium text-sm mb-2">Geographic Location</h4>
                  <p className="text-muted-foreground text-sm">
                    {results.infrastructure.geolocation.city}, {results.infrastructure.geolocation.country}
                  </p>
                  <p className="text-xs text-accent">
                    {results.infrastructure.geolocation.latitude}, {results.infrastructure.geolocation.longitude}
                  </p>
                </div>
              )}

              {results.infrastructure?.asn && (
                <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                  <h4 className="font-medium text-sm mb-2">Network Information</h4>
                  <p className="text-muted-foreground text-sm">ASN: {results.infrastructure.asn}</p>
                  <p className="text-xs text-accent">Organization: {results.infrastructure.organization}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};