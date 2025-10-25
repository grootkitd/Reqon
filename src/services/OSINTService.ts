interface SearchParams {
  company: string;
  domain: string;
  searchType: 'basic' | 'deep' | 'stealth';
  sources: string[];
  format: 'json' | 'csv' | 'txt' | 'xml';
}

interface PersonProfile {
  name: string;
  title: string;
  company: string;
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  location?: string;
  department?: string;
  seniority?: string;
  source: string;
  confidence: number;
  lastUpdated: string;
}

interface ReconResults {
  data: PersonProfile[];
  total: number;
  processed: number;
  metadata: {
    searchParams: SearchParams;
    timestamp: string;
    duration: number;
    sources: string[];
  };
}

export class OSINTService {
  private static readonly BATCH_SIZE = 25; // Increased concurrent batch size
  private static readonly BASE_DELAY = 50; // Reduced delay for speed
  private static readonly MAX_RETRIES = 1; // Minimal retries for maximum speed
  private static readonly MAX_CONCURRENT = 30; // Doubled concurrent requests
  private static cache = new Map<string, PersonProfile[]>(); // Enhanced caching
  private static readonly CACHE_TTL = 300000; // 5 minute cache TTL

  static async performReconnaissance(params: SearchParams, onProgress?: (progress: { processed: number; total: number; found: number }) => void): Promise<ReconResults> {
    const startTime = Date.now();
    const results: PersonProfile[] = [];
    let processed = 0;

    try {
      // Generate optimized search queries
      const searchQueries = this.generateSearchQueries(params);
      const total = searchQueries.length;
      
      console.log(`🚀 Starting RECON FRAMEWORK: ${total} queries generated`);

      // Process queries in optimized batches with concurrent execution
      const batches = this.createBatches(searchQueries, this.BATCH_SIZE);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Process batch concurrently with minimal delays
        const batchPromises = batch.map(async (query, queryIndex) => {
          try {
            // Minimal staggered delays for rate limit compliance
            const staggerDelay = (queryIndex % 5) * 20; // 0ms, 20ms, 40ms, 60ms, 80ms stagger
            if (staggerDelay > 0) await this.sleep(staggerDelay);
            
            const profiles = await this.searchWithAdaptiveRetry(query, params);
            processed++;
            
            // Real-time progress updates
            onProgress?.({ processed, total, found: results.length + profiles.length });
            
            return profiles;
          } catch (error) {
            processed++;
            onProgress?.({ processed, total, found: results.length });
            return [];
          }
        });

        // Execute batch concurrently
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.flat());
        
        // Minimal inter-batch delay for maximum speed
        if (batchIndex < batches.length - 1) {
          const adaptiveDelay = this.BASE_DELAY * (0.8 + Math.random() * 0.4); // 40-60ms
          await this.sleep(adaptiveDelay);
        }
      }

      console.log(`⚡ Raw results collected: ${results.length} profiles`);

      // Optimized deduplication with enhanced filtering
      const uniqueResults = this.deduplicateResults(results);
      console.log(`🎯 After deduplication: ${uniqueResults.length} unique profiles`);
      
      // Fast enhancement without additional delays
      const enhancedResults = this.enhanceProfiles(uniqueResults, params);

      const finalResults = {
        data: enhancedResults,
        total,
        processed,
        metadata: {
          searchParams: params,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          sources: params.sources,
          queriesGenerated: total,
          batchesProcessed: batches.length,
          cacheHits: this.getCacheStats().hits
        }
      };

      console.log(`✅ RECON FRAMEWORK Complete: ${enhancedResults.length} profiles in ${finalResults.metadata.duration}ms`);
      return finalResults;

    } catch (error) {
      console.error('🚨 Reconnaissance failed:', error);
      throw new Error('Reconnaissance operation failed');
    }
  }

  private static createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private static getCacheStats() {
    return { hits: this.cache.size, entries: this.cache.size };
  }

  private static generateSearchQueries(params: SearchParams): string[] {
    const { company, domain, searchType } = params;
    const queries: string[] = [];

    // Basic company employee searches
    const baseQueries = [
      `"${company}" employees`, `"${company}" staff`, `"${company}" personnel`,
      `site:linkedin.com "${company}"`, `site:linkedin.com/in "${company}"`,
      `"@${domain}" email`, `"@${domain}" contact`, `"${domain}" email`,
      `"${company}" team members`, `"${company}" team`, `"${company}" department`,
      `"works at ${company}"`, `"employee at ${company}"`, `"hired by ${company}"`,
      `"${company}" staff directory`, `"${company}" employee directory`
    ];

    // Department-specific searches
    const departments = ['engineering', 'sales', 'marketing', 'hr', 'finance', 'operations', 'product', 'design', 'data', 'security', 'legal', 'support'];
    departments.forEach(dept => {
      baseQueries.push(
        `"${company}" ${dept} team`,
        `"${company}" ${dept} department`,
        `"${dept} at ${company}"`,
        `site:linkedin.com "${company}" ${dept}`
      );
    });

    // Job title searches
    const titles = ['engineer', 'developer', 'manager', 'director', 'vp', 'ceo', 'cto', 'analyst', 'specialist', 'coordinator', 'lead', 'senior', 'principal', 'architect'];
    titles.forEach(title => {
      baseQueries.push(
        `"${title} at ${company}"`,
        `"${company}" ${title}`,
        `site:linkedin.com "${title}" "${company}"`
      );
    });

    if (searchType === 'deep' || searchType === 'stealth') {
      // Social media and professional platforms
      baseQueries.push(
        `site:github.com "${company}"`, `site:github.com "${domain}"`,
        `site:twitter.com "${company}"`, `site:twitter.com "@${company}"`,
        `site:facebook.com "${company}"`, `site:instagram.com "${company}"`,
        `site:medium.com "${company}"`, `site:dev.to "${company}"`,
        `site:stackoverflow.com "${company}"`, `site:reddit.com "${company}"`,
        `site:angel.co "${company}"`, `site:glassdoor.com "${company}"`,
        `site:indeed.com "${company}"`, `site:crunchbase.com "${company}"`,
        `"${domain}" contact`, `"${domain}" about`, `"${domain}" team`,
        `"${company}" org chart`, `"${company}" organizational chart`,
        `"${company}" employee list`, `"${company}" staff list`,
        `"${company}" leadership team`, `"${company}" management team`,
        `"${company}" directory`, `"${company}" phone book`
      );

      // Conference and event searches
      const events = ['conference', 'meetup', 'webinar', 'summit', 'workshop', 'hackathon'];
      events.forEach(event => {
        baseQueries.push(
          `"${company}" ${event} speaker`,
          `"${company}" ${event} attendee`,
          `"${company}" ${event} presenter`
        );
      });
    }

    if (searchType === 'stealth') {
      // Advanced OSINT queries
      baseQueries.push(
        `intext:"${company}" filetype:pdf`, `intext:"${company}" filetype:doc`,
        `intext:"${company}" filetype:ppt`, `intext:"${company}" filetype:xls`,
        `intitle:"${company}" "employee"`, `intitle:"${company}" "staff"`,
        `intitle:"${company}" "team"`, `intitle:"${company}" "directory"`,
        `"${company}" AND ("engineer" OR "developer" OR "manager")`,
        `"${company}" AND ("director" OR "vp" OR "ceo" OR "cto")`,
        `"${domain}" AND ("contact" OR "about" OR "team")`,
        `"${company}" conference speakers`, `"${company}" webinar speakers`,
        `"${company}" press release team`, `"${company}" media contact`,
        `"${company}" patent inventors`, `"${company}" research team`,
        `"${company}" alumni`, `"${company}" former employees`,
        `cache:${domain}`, `"${company}" site:archive.org`,
        `"${company}" hiring`, `"${company}" careers`,
        `"${company}" internship`, `"${company}" job openings`
      );

      // Location-based searches
      const locations = ['san francisco', 'new york', 'seattle', 'austin', 'boston', 'chicago', 'los angeles', 'london', 'berlin', 'tokyo', 'singapore'];
      locations.forEach(location => {
        baseQueries.push(
          `"${company}" "${location}" employee`,
          `"${company}" office "${location}"`
        );
      });

      // Technology stack searches
      const technologies = ['react', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql'];
      technologies.forEach(tech => {
        baseQueries.push(
          `"${company}" ${tech} developer`,
          `site:github.com "${company}" ${tech}`
        );
      });
    }

    // Add AI-powered query variations for maximum coverage
    const aiQueries = this.generateAIEnhancedQueries(company, domain, searchType);
    baseQueries.push(...aiQueries);

    // Shuffle queries for better distribution and rate limit evasion
    return this.shuffleArray([...new Set(baseQueries)]); // Remove duplicates and shuffle
  }

  private static async searchWithAdaptiveRetry(query: string, params: SearchParams): Promise<PersonProfile[]> {
    // Enhanced cache check with TTL
    const cacheKey = `${query}-${params.searchType}-${Date.now() - (Date.now() % this.CACHE_TTL)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Single attempt for maximum speed (no retries unless critical)
    try {
      const results = await this.performSearch(query, params);
      
      // Cache successful results with TTL-based key
      this.cache.set(cacheKey, results);
      
      // Efficient cache management
      if (this.cache.size > 2000) {
        const keysToDelete = Array.from(this.cache.keys()).slice(0, 500);
        keysToDelete.forEach(key => this.cache.delete(key));
      }
      
      return results;
    } catch (error) {
      // No retries for maximum speed
      return [];
    }
  }

  private static async performSearch(query: string, params: SearchParams): Promise<PersonProfile[]> {
    // Ultra-fast simulation with minimal response times
    const responseTime = Math.random() * 150 + 25; // 25-175ms for maximum speed
    await this.sleep(responseTime);
    
    // Enhanced result generation with better algorithms
    const baseMultiplier = params.searchType === 'basic' ? 15 : params.searchType === 'deep' ? 25 : 40;
    const queryComplexityBonus = query.includes('site:') ? 12 : query.includes('"') ? 8 : 5;
    const maxResults = baseMultiplier + queryComplexityBonus;
    
    const resultCount = Math.floor(Math.random() * maxResults) + 10; // Minimum 10 results
    
    // Bulk profile generation for performance
    return Array.from({ length: resultCount }, (_, i) => 
      this.generateOptimizedMockProfile(params, query, i)
    );
  }

  private static generateOptimizedMockProfile(params: SearchParams, query: string, index: number): PersonProfile {
    const departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Data Science', 'Security', 'Legal', 'Support', 'Research', 'Business Development'];
    const titles = [
      'Software Engineer', 'Senior Software Engineer', 'Principal Engineer', 'Staff Engineer',
      'Product Manager', 'Senior Product Manager', 'Director of Product', 'VP Product',
      'Marketing Manager', 'Growth Manager', 'Content Manager', 'Brand Manager',
      'Sales Representative', 'Account Executive', 'Sales Director', 'VP Sales',
      'HR Manager', 'Recruiter', 'People Operations', 'Chief People Officer',
      'Financial Analyst', 'Controller', 'CFO', 'Accounting Manager',
      'Operations Manager', 'COO', 'Business Operations', 'Program Manager',
      'UX Designer', 'UI Designer', 'Product Designer', 'Design Director',
      'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Research Scientist',
      'Security Engineer', 'InfoSec Analyst', 'CISO', 'Compliance Manager',
      'Legal Counsel', 'General Counsel', 'Paralegal', 'Contract Manager',
      'Customer Success Manager', 'Support Engineer', 'Technical Writer', 'QA Engineer',
      'DevOps Engineer', 'Site Reliability Engineer', 'Infrastructure Engineer', 'Platform Engineer',
      'CEO', 'CTO', 'Founder', 'Co-founder', 'VP Engineering', 'Director of Engineering'
    ];
    
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
      'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Miami, FL',
      'Portland, OR', 'Nashville, TN', 'Raleigh, NC', 'Phoenix, AZ', 'Las Vegas, NV',
      'London, UK', 'Berlin, Germany', 'Paris, France', 'Amsterdam, Netherlands',
      'Toronto, Canada', 'Vancouver, Canada', 'Sydney, Australia', 'Tokyo, Japan',
      'Singapore', 'Tel Aviv, Israel', 'Stockholm, Sweden', 'Copenhagen, Denmark',
      'Remote', 'Hybrid', 'Distributed'
    ];
    
    const sources = ['LinkedIn', 'GitHub', 'Twitter', 'Google', 'Company Website', 'Crunchbase', 'AngelList', 'Medium', 'Stack Overflow', 'Conference Speaker List', 'Patent Database', 'Press Release'];
    
    const seniorities = ['Junior', 'Mid-level', 'Senior', 'Staff', 'Principal', 'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level'];
    
    const name = this.generateRandomName();
    const department = departments[Math.floor(Math.random() * departments.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const seniority = seniorities[Math.floor(Math.random() * seniorities.length)];
    
    // Generate social profiles based on probability
    const hasEmail = Math.random() > 0.1; // 90% chance
    const hasLinkedIn = Math.random() > 0.2; // 80% chance
    const hasGitHub = Math.random() > 0.6; // 40% chance (higher for engineers)
    const hasTwitter = Math.random() > 0.7; // 30% chance
    
    const profile: PersonProfile = {
      name,
      title,
      company: params.company,
      email: hasEmail ? this.generateEmailFromName(name, params.domain) : undefined,
      linkedin: hasLinkedIn ? `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      github: hasGitHub ? `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      twitter: hasTwitter ? `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
      location,
      department,
      seniority,
      source,
      confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      lastUpdated: new Date().toISOString()
    };
    
    return profile;
  }

  private static deduplicateResults(results: PersonProfile[]): PersonProfile[] {
    const seen = new Set<string>();
    return results.filter(profile => {
      const key = `${profile.name.toLowerCase()}-${profile.email?.toLowerCase() || profile.linkedin || ''}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private static enhanceProfiles(profiles: PersonProfile[], params: SearchParams): PersonProfile[] {
    // Synchronous enhancement for speed - no async needed for mock data
    return profiles.map(profile => {
      // Enhanced confidence scoring based on data completeness
      let confidenceBoost = 0;
      if (profile.email) confidenceBoost += 0.15;
      if (profile.linkedin) confidenceBoost += 0.1;
      if (profile.github) confidenceBoost += 0.08;
      if (profile.location) confidenceBoost += 0.05;
      
      return {
        ...profile,
        confidence: Math.min(profile.confidence + confidenceBoost, 1.0),
        email: profile.email || this.generateEmailFromName(profile.name, params.domain),
        // Add relevance score for better sorting
        relevanceScore: this.calculateRelevanceScore(profile, params)
      };
    }).sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
  }

  private static calculateRelevanceScore(profile: PersonProfile, params: SearchParams): number {
    let score = profile.confidence * 100;
    
    // Boost score for senior positions
    if (profile.title.toLowerCase().includes('senior') || 
        profile.title.toLowerCase().includes('lead') || 
        profile.title.toLowerCase().includes('director')) score += 20;
        
    // Boost for technical roles in deep/stealth searches
    if (params.searchType !== 'basic' && 
        (profile.title.toLowerCase().includes('engineer') || 
         profile.title.toLowerCase().includes('developer'))) score += 15;
         
    return score;
  }

  static exportResults(results: PersonProfile[], format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'csv':
        if (results.length === 0) return 'No data to export';
        
        const headers = Object.keys(results[0]).join(',');
        const rows = results.map(profile => 
          Object.values(profile).map(value => 
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          ).join(',')
        );
        return [headers, ...rows].join('\n');
      
      case 'txt':
        return results.map(profile => {
          return [
            `Name: ${profile.name}`,
            `Title: ${profile.title}`,
            `Company: ${profile.company}`,
            `Email: ${profile.email || 'N/A'}`,
            `LinkedIn: ${profile.linkedin || 'N/A'}`,
            `GitHub: ${profile.github || 'N/A'}`,
            `Location: ${profile.location || 'N/A'}`,
            `Department: ${profile.department || 'N/A'}`,
            `Source: ${profile.source}`,
            `Confidence: ${(profile.confidence * 100).toFixed(1)}%`,
            '---'
          ].join('\n');
        }).join('\n\n');
      
      case 'xml':
        const xmlResults = results.map(profile => {
          const entries = Object.entries(profile)
            .map(([key, value]) => `    <${key}>${this.escapeXml(String(value || ''))}</${key}>`)
            .join('\n');
          return `  <profile>\n${entries}\n  </profile>`;
        }).join('\n');
        
        return `<?xml version="1.0" encoding="UTF-8"?>\n<profiles>\n${xmlResults}\n</profiles>`;
      
      default:
        return JSON.stringify(results, null, 2);
    }
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  private static generateRandomName(): string {
    const firstNames = [
      'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Blake', 'Cameron',
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley',
      'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel', 'Lisa', 'Matthew', 'Michelle', 'Anthony', 'Kimberly',
      'Mark', 'Amy', 'Donald', 'Angela', 'Steven', 'Helen', 'Paul', 'Anna', 'Andrew', 'Brenda',
      'Kevin', 'Emma', 'Brian', 'Olivia', 'George', 'Sophia', 'Edward', 'Cynthia', 'Ronald', 'Marie',
      'Timothy', 'Janet', 'Jason', 'Catherine', 'Jeffrey', 'Frances', 'Ryan', 'Christine', 'Jacob', 'Samantha',
      'Gary', 'Deborah', 'Nicholas', 'Rachel', 'Eric', 'Carolyn', 'Jonathan', 'Virginia', 'Stephen', 'Maria',
      'Larry', 'Heather', 'Justin', 'Diane', 'Scott', 'Julie', 'Brandon', 'Joyce', 'Benjamin', 'Victoria',
      'Samuel', 'Kelly', 'Gregory', 'Christina', 'Alexander', 'Joan', 'Patrick', 'Evelyn', 'Frank', 'Lauren',
      'Raymond', 'Judith', 'Jack', 'Megan', 'Dennis', 'Cheryl', 'Jerry', 'Andrea', 'Tyler', 'Hannah'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez',
      'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young',
      'Allen', 'Sanchez', 'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill',
      'Ramirez', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker',
      'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook', 'Rogers',
      'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward',
      'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes',
      'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell',
      'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  private static generateRandomEmail(domain: string): string {
    const firstNames = ['alex', 'jordan', 'taylor', 'casey', 'morgan', 'riley', 'avery', 'quinn', 'blake', 'cameron'];
    const lastNames = ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName}.${lastName}@${domain}`;
  }

  private static generateEmailFromName(name: string, domain: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const parts = cleanName.split(' ');
    
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[parts.length - 1]}@${domain}`;
    }
    
    return `${cleanName.replace(/\s+/g, '.')}@${domain}`;
  }

  private static generateAIEnhancedQueries(company: string, domain: string, searchType: string): string[] {
    const aiQueries: string[] = [];
    
    // Industry-specific queries
    const industries = ['tech', 'software', 'saas', 'fintech', 'healthcare', 'ecommerce', 'consulting'];
    industries.forEach(industry => {
      aiQueries.push(
        `"${company}" ${industry} team`,
        `${industry} professionals at "${company}"`,
        `"${company}" ${industry} expertise`
      );
    });

    // Skill-based queries for technical talent
    const skills = ['react', 'python', 'aws', 'kubernetes', 'ai', 'machine learning', 'devops', 'blockchain'];
    skills.forEach(skill => {
      aiQueries.push(
        `"${company}" ${skill} expert`,
        `"${domain}" ${skill} developer`,
        `site:linkedin.com "${company}" ${skill}`
      );
    });

    // Event and publication queries
    aiQueries.push(
      `"${company}" tech blog author`,
      `"${company}" conference speaker 2024`,
      `"${company}" patent inventor`,
      `"${company}" research paper author`,
      `"${company}" open source contributor`,
      `"${company}" stackoverflow user`,
      `"${company}" medium writer`,
      `"${company}" youtube channel`
    );

    return aiQueries;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}