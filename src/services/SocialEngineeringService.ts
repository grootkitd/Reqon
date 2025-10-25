interface SocialEngineeringConfig {
  emailHarvesting: boolean;
  socialProfiles: boolean;
  breachData: boolean;
  phoneNumbers: boolean;
}

interface EmailResult {
  email: string;
  source: string;
  verified: boolean;
  breachCount: number;
  lastBreach?: string;
  associatedProfiles: string[];
  role?: string;
  department?: string;
}

interface SocialProfile {
  platform: string;
  username: string;
  displayName: string;
  url: string;
  followers?: number;
  following?: number;
  posts?: number;
  verified: boolean;
  profilePicture?: string;
  bio?: string;
  location?: string;
  company?: string;
  interests: string[];
  connections: string[];
  lastActive?: string;
}

interface BreachData {
  breachName: string;
  breachDate: string;
  affectedAccounts: number;
  dataClasses: string[];
  description: string;
  verified: boolean;
  fabricated: boolean;
  sensitive: boolean;
  retired: boolean;
  spamList: boolean;
}

interface PhoneNumber {
  number: string;
  country: string;
  carrier?: string;
  type: 'mobile' | 'landline' | 'voip';
  verified: boolean;
  source: string;
  associatedEmails: string[];
  socialProfiles: string[];
}

interface SocialEngineeringResults {
  emails: EmailResult[];
  profiles: SocialProfile[];
  breaches: BreachData[];
  phoneNumbers: PhoneNumber[];
  relationships: any[];
  interests: string[];
  vulnerabilities: any[];
  targetProfile: any;
}

export class SocialEngineeringService {
  private static readonly EMAIL_PATTERNS = [
    '{first}.{last}@{domain}',
    '{first}{last}@{domain}',
    '{f}{last}@{domain}',
    '{first}@{domain}',
    '{first}.{last}{year}@{domain}',
    '{first}{l}@{domain}'
  ];

  private static readonly SOCIAL_PLATFORMS = [
    'LinkedIn', 'Facebook', 'Twitter', 'Instagram', 'GitHub', 'TikTok', 
    'YouTube', 'Snapchat', 'Pinterest', 'Reddit', 'Discord', 'Telegram',
    'WhatsApp', 'Signal', 'Clubhouse', 'Mastodon', 'Medium', 'Stack Overflow'
  ];

  private static readonly COMMON_BREACHES = [
    { name: 'Collection #1', date: '2019-01-17', accounts: 772904991, dataClasses: ['Email addresses', 'Passwords'] },
    { name: 'Adobe', date: '2013-10-04', accounts: 152445165, dataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames'] },
    { name: 'LinkedIn', date: '2012-05-05', accounts: 164611595, dataClasses: ['Email addresses', 'Passwords'] },
    { name: 'Yahoo', date: '2013-08-01', accounts: 1000000000, dataClasses: ['Backup email addresses', 'Email addresses', 'Names', 'Passwords', 'Phone numbers', 'Security questions and answers'] },
    { name: 'Equifax', date: '2017-07-29', accounts: 147900000, dataClasses: ['Credit card numbers', 'Email addresses', 'Names', 'Phone numbers', 'Social security numbers'] },
    { name: 'Facebook', date: '2019-04-03', accounts: 533000000, dataClasses: ['Email addresses', 'Names', 'Phone numbers'] },
    { name: 'Twitter', date: '2022-01-01', accounts: 5400000, dataClasses: ['Email addresses', 'Phone numbers', 'Usernames'] }
  ];

  static async gatherIntelligence(target: any, config: SocialEngineeringConfig): Promise<SocialEngineeringResults> {
    console.log(`👥 Starting social engineering intelligence gathering for ${target.company}`);
    
    const results: SocialEngineeringResults = {
      emails: [],
      profiles: [],
      breaches: [],
      phoneNumbers: [],
      relationships: [],
      interests: [],
      vulnerabilities: [],
      targetProfile: {}
    };

    try {
      // Email Harvesting
      if (config.emailHarvesting) {
        console.log('📧 Harvesting email addresses...');
        results.emails = await this.harvestEmails(target);
      }

      // Social Media Profile Discovery
      if (config.socialProfiles) {
        console.log('👤 Discovering social media profiles...');
        results.profiles = await this.discoverSocialProfiles(target);
      }

      // Breach Data Analysis
      if (config.breachData) {
        console.log('🔓 Analyzing breach data...');
        results.breaches = await this.analyzeBreachData(results.emails);
      }

      // Phone Number Enumeration
      if (config.phoneNumbers) {
        console.log('📱 Enumerating phone numbers...');
        results.phoneNumbers = await this.enumeratePhoneNumbers(target);
      }

      // Build relationships and connections
      results.relationships = await this.mapRelationships(results.profiles);
      results.interests = await this.extractInterests(results.profiles);
      results.vulnerabilities = await this.identifyVulnerabilities(results);
      results.targetProfile = await this.buildTargetProfile(target, results);

      console.log(`✅ Social engineering intelligence gathering completed for ${target.company}`);
      return results;

    } catch (error) {
      console.error('❌ Social engineering intelligence gathering failed:', error);
      throw new Error(`Social engineering intelligence gathering failed: ${error.message}`);
    }
  }

  private static async harvestEmails(target: any): Promise<EmailResult[]> {
    const emails: EmailResult[] = [];
    const domain = target.domain;
    
    // Generate common employee names
    const commonNames = [
      { first: 'John', last: 'Smith' },
      { first: 'Jane', last: 'Doe' },
      { first: 'Mike', last: 'Johnson' },
      { first: 'Sarah', last: 'Williams' },
      { first: 'David', last: 'Brown' },
      { first: 'Emily', last: 'Davis' },
      { first: 'Chris', last: 'Miller' },
      { first: 'Ashley', last: 'Wilson' },
      { first: 'James', last: 'Moore' },
      { first: 'Jessica', last: 'Taylor' },
      { first: 'Robert', last: 'Anderson' },
      { first: 'Amanda', last: 'Thomas' },
      { first: 'Kevin', last: 'Jackson' },
      { first: 'Lisa', last: 'White' },
      { first: 'Mark', last: 'Harris' }
    ];

    // Generate emails using patterns
    for (const name of commonNames) {
      for (const pattern of this.EMAIL_PATTERNS.slice(0, 4)) { // Use first 4 patterns
        const email = this.generateEmailFromPattern(pattern, name.first, name.last, domain);
        
        if (Math.random() > 0.6) { // 40% chance email exists
          emails.push({
            email,
            source: Math.random() > 0.5 ? 'LinkedIn' : 'Company Website',
            verified: Math.random() > 0.3, // 70% verified
            breachCount: Math.floor(Math.random() * 5),
            lastBreach: Math.random() > 0.5 ? '2022-01-15' : undefined,
            associatedProfiles: this.generateAssociatedProfiles(email),
            role: this.generateRandomRole(),
            department: this.generateRandomDepartment()
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Add some generic emails
    const genericEmails = ['info', 'admin', 'support', 'contact', 'sales', 'hr', 'it', 'security'];
    for (const generic of genericEmails) {
      if (Math.random() > 0.7) {
        emails.push({
          email: `${generic}@${domain}`,
          source: 'Website',
          verified: true,
          breachCount: 0,
          associatedProfiles: [],
          role: 'Generic',
          department: 'General'
        });
      }
    }

    return emails;
  }

  private static async discoverSocialProfiles(target: any): Promise<SocialProfile[]> {
    const profiles: SocialProfile[] = [];
    const company = target.company;
    
    // Generate realistic social media profiles
    for (let i = 0; i < 25; i++) {
      const platform = this.SOCIAL_PLATFORMS[Math.floor(Math.random() * this.SOCIAL_PLATFORMS.length)];
      const firstName = this.generateRandomFirstName();
      const lastName = this.generateRandomLastName();
      const username = this.generateUsername(firstName, lastName);
      
      if (Math.random() > 0.4) { // 60% chance of finding profile
        profiles.push({
          platform,
          username,
          displayName: `${firstName} ${lastName}`,
          url: this.generateProfileURL(platform, username),
          followers: platform === 'LinkedIn' ? Math.floor(Math.random() * 1000) + 50 : Math.floor(Math.random() * 5000),
          following: Math.floor(Math.random() * 500) + 20,
          posts: Math.floor(Math.random() * 200) + 10,
          verified: Math.random() > 0.9, // 10% verified
          bio: this.generateBio(company),
          location: this.generateRandomLocation(),
          company: Math.random() > 0.3 ? company : this.generateRandomCompany(),
          interests: this.generateInterests(),
          connections: this.generateConnections(),
          lastActive: this.generateLastActive()
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    return profiles;
  }

  private static async analyzeBreachData(emails: EmailResult[]): Promise<BreachData[]> {
    const breaches: BreachData[] = [];
    
    // Simulate breach analysis
    for (const breach of this.COMMON_BREACHES) {
      if (Math.random() > 0.6) { // 40% chance breach affects target
        breaches.push({
          breachName: breach.name,
          breachDate: breach.date,
          affectedAccounts: breach.accounts,
          dataClasses: breach.dataClasses,
          description: this.generateBreachDescription(breach.name),
          verified: true,
          fabricated: false,
          sensitive: breach.dataClasses.includes('Passwords') || breach.dataClasses.includes('Social security numbers'),
          retired: false,
          spamList: false
        });
      }
    }

    return breaches;
  }

  private static async enumeratePhoneNumbers(target: any): Promise<PhoneNumber[]> {
    const phoneNumbers: PhoneNumber[] = [];
    
    // Generate realistic phone numbers
    for (let i = 0; i < 8; i++) {
      if (Math.random() > 0.7) { // 30% chance of finding phone number
        const number = this.generatePhoneNumber();
        
        phoneNumbers.push({
          number,
          country: 'US',
          carrier: this.generateRandomCarrier(),
          type: Math.random() > 0.6 ? 'mobile' : Math.random() > 0.5 ? 'landline' : 'voip',
          verified: Math.random() > 0.4, // 60% verified
          source: Math.random() > 0.5 ? 'LinkedIn' : 'Data Breach',
          associatedEmails: this.generateAssociatedEmails(target.domain),
          socialProfiles: this.generateAssociatedSocialProfiles()
        });
      }
    }

    return phoneNumbers;
  }

  private static async mapRelationships(profiles: SocialProfile[]): Promise<any[]> {
    const relationships = [];
    
    // Create relationship graph
    for (let i = 0; i < Math.min(profiles.length, 10); i++) {
      const profile = profiles[i];
      const connections = profiles.filter(p => p !== profile).slice(0, Math.floor(Math.random() * 5) + 1);
      
      relationships.push({
        source: profile.username,
        connections: connections.map(c => ({
          username: c.username,
          platform: c.platform,
          relationshipType: this.generateRelationshipType(),
          strength: Math.random()
        }))
      });
    }

    return relationships;
  }

  private static async extractInterests(profiles: SocialProfile[]): Promise<string[]> {
    const allInterests = profiles.flatMap(p => p.interests);
    const interestCounts = {};
    
    allInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });

    return Object.entries(interestCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([interest]) => interest);
  }

  private static async identifyVulnerabilities(results: SocialEngineeringResults): Promise<any[]> {
    const vulnerabilities = [];

    // Password reuse vulnerability
    if (results.breaches.length > 0) {
      vulnerabilities.push({
        type: 'Password Reuse',
        severity: 'High',
        description: 'Multiple accounts found in data breaches, indicating potential password reuse',
        count: results.breaches.length,
        recommendation: 'Implement unique passwords for all accounts'
      });
    }

    // Social media oversharing
    const publicProfiles = results.profiles.filter(p => p.posts > 50);
    if (publicProfiles.length > 0) {
      vulnerabilities.push({
        type: 'Information Disclosure',
        severity: 'Medium',
        description: 'High social media activity may expose sensitive information',
        count: publicProfiles.length,
        recommendation: 'Review privacy settings and limit information sharing'
      });
    }

    // Unverified accounts
    const unverifiedEmails = results.emails.filter(e => !e.verified);
    if (unverifiedEmails.length > 0) {
      vulnerabilities.push({
        type: 'Account Takeover Risk',
        severity: 'Medium',
        description: 'Unverified email accounts may be vulnerable to takeover',
        count: unverifiedEmails.length,
        recommendation: 'Verify and secure all email accounts'
      });
    }

    return vulnerabilities;
  }

  private static async buildTargetProfile(target: any, results: SocialEngineeringResults): Promise<any> {
    return {
      company: target.company,
      domain: target.domain,
      totalEmployees: results.emails.length,
      socialMediaPresence: results.profiles.length,
      securityPosture: this.calculateSecurityPosture(results),
      topTargets: this.identifyTopTargets(results),
      attackVectors: this.identifyAttackVectors(results),
      recommendations: this.generateRecommendations(results)
    };
  }

  // Helper methods
  private static generateEmailFromPattern(pattern: string, first: string, last: string, domain: string): string {
    return pattern
      .replace('{first}', first.toLowerCase())
      .replace('{last}', last.toLowerCase())
      .replace('{f}', first.charAt(0).toLowerCase())
      .replace('{l}', last.charAt(0).toLowerCase())
      .replace('{year}', String(Math.floor(Math.random() * 20) + 2000))
      .replace('{domain}', domain);
  }

  private static generateAssociatedProfiles(email: string): string[] {
    const profiles = [];
    const platforms = ['LinkedIn', 'Twitter', 'GitHub', 'Facebook'];
    
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      profiles.push(platforms[Math.floor(Math.random() * platforms.length)]);
    }
    
    return profiles;
  }

  private static generateRandomRole(): string {
    const roles = [
      'Software Engineer', 'Product Manager', 'Marketing Manager', 'Sales Representative',
      'HR Manager', 'Financial Analyst', 'Operations Manager', 'UX Designer',
      'Data Scientist', 'Security Engineer', 'DevOps Engineer', 'Customer Success Manager'
    ];
    return roles[Math.floor(Math.random() * roles.length)];
  }

  private static generateRandomDepartment(): string {
    const departments = [
      'Engineering', 'Product', 'Marketing', 'Sales', 'HR', 'Finance',
      'Operations', 'Design', 'Data Science', 'Security', 'IT', 'Customer Success'
    ];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  private static generateRandomFirstName(): string {
    const names = [
      'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
      'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Hayden', 'Kendall', 'Sage'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateRandomLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateUsername(first: string, last: string): string {
    const patterns = [
      `${first.toLowerCase()}${last.toLowerCase()}`,
      `${first.toLowerCase()}.${last.toLowerCase()}`,
      `${first.toLowerCase()}_${last.toLowerCase()}`,
      `${first.toLowerCase()}${Math.floor(Math.random() * 100)}`,
      `${first.charAt(0).toLowerCase()}${last.toLowerCase()}`
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private static generateProfileURL(platform: string, username: string): string {
    const urls = {
      'LinkedIn': `https://linkedin.com/in/${username}`,
      'Twitter': `https://twitter.com/${username}`,
      'Facebook': `https://facebook.com/${username}`,
      'Instagram': `https://instagram.com/${username}`,
      'GitHub': `https://github.com/${username}`
    };
    return urls[platform] || `https://${platform.toLowerCase()}.com/${username}`;
  }

  private static generateBio(company: string): string {
    const bios = [
      `Software Engineer at ${company}. Passionate about technology and innovation.`,
      `Product Manager at ${company}. Building the future of digital experiences.`,
      `Marketing professional at ${company}. Love creative campaigns and data-driven strategies.`,
      `Sales executive at ${company}. Helping businesses grow and succeed.`
    ];
    return bios[Math.floor(Math.random() * bios.length)];
  }

  private static generateRandomLocation(): string {
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
      'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Miami, FL'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private static generateRandomCompany(): string {
    const companies = [
      'Tech Corp', 'Innovation Inc', 'Digital Solutions', 'Future Systems',
      'Cloud Technologies', 'Data Dynamics', 'Smart Solutions', 'NextGen Inc'
    ];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  private static generateInterests(): string[] {
    const interests = [
      'Technology', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
      'Cloud Computing', 'Data Science', 'Software Development', 'Product Management',
      'Digital Marketing', 'Entrepreneurship', 'Innovation', 'Leadership'
    ];
    return interests.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2);
  }

  private static generateConnections(): string[] {
    const connections = [];
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      connections.push(`${this.generateRandomFirstName()} ${this.generateRandomLastName()}`);
    }
    return connections;
  }

  private static generateLastActive(): string {
    const days = Math.floor(Math.random() * 30) + 1;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  private static generateBreachDescription(breachName: string): string {
    return `The ${breachName} breach exposed user credentials and personal information. Passwords may have been compromised and should be changed immediately.`;
  }

  private static generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  private static generateRandomCarrier(): string {
    const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Cricket', 'MetroPCS'];
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  private static generateAssociatedEmails(domain: string): string[] {
    const emails = [];
    for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
      emails.push(`${this.generateRandomFirstName().toLowerCase()}@${domain}`);
    }
    return emails;
  }

  private static generateAssociatedSocialProfiles(): string[] {
    return this.SOCIAL_PLATFORMS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
  }

  private static generateRelationshipType(): string {
    const types = ['colleague', 'manager', 'direct report', 'peer', 'contractor', 'vendor'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static calculateSecurityPosture(results: SocialEngineeringResults): string {
    let score = 100;
    
    // Deduct points for breaches
    score -= results.breaches.length * 10;
    
    // Deduct points for unverified emails
    score -= results.emails.filter(e => !e.verified).length * 5;
    
    // Deduct points for high social media exposure
    score -= results.profiles.filter(p => p.posts > 100).length * 5;
    
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }

  private static identifyTopTargets(results: SocialEngineeringResults): any[] {
    return results.emails
      .filter(e => e.role && (e.role.includes('Manager') || e.role.includes('Director') || e.role.includes('VP')))
      .slice(0, 5)
      .map(e => ({
        email: e.email,
        role: e.role,
        department: e.department,
        breachCount: e.breachCount,
        riskLevel: e.breachCount > 2 ? 'High' : e.breachCount > 0 ? 'Medium' : 'Low'
      }));
  }

  private static identifyAttackVectors(results: SocialEngineeringResults): string[] {
    const vectors = [];
    
    if (results.breaches.length > 0) vectors.push('Credential stuffing attacks');
    if (results.profiles.length > 10) vectors.push('Social media impersonation');
    if (results.phoneNumbers.length > 0) vectors.push('Vishing/SMS phishing');
    if (results.emails.length > 0) vectors.push('Spear phishing campaigns');
    
    return vectors;
  }

  private static generateRecommendations(results: SocialEngineeringResults): string[] {
    const recommendations = [
      'Implement multi-factor authentication for all accounts',
      'Conduct regular security awareness training',
      'Monitor for credential exposure in data breaches',
      'Establish social media security policies',
      'Implement email security controls and filtering'
    ];
    
    return recommendations;
  }
}