//   const API_BASE_URL = 'https://little-sun-0c07.civic-engagement-api.workers.dev';
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, MapPin, TrendingUp, AlertCircle, ExternalLink, Loader, Shield, Lock, X } from 'lucide-react';

// Static fallback issues (used if /api/issues isn't configured yet)
const FALLBACK_ISSUES = [
  {
    id: 'featured-1',
    title: 'Abolish ICE',
    category: 'Immigration',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nI am writing to urge you to support comprehensive immigration reform and reconsider the role of Immigration and Customs Enforcement (ICE). The current immigration system is broken and causes immense suffering to families and communities.\n\nI ask that you:\n- Support humane immigration policies\n- Protect DACA recipients and Dreamers\n- End family separations and detention of children\n- Reform or abolish ICE in favor of a more humane approach\n\nOur nation was built by immigrants, and we must treat all people with dignity and compassion.\n\nThank you for your attention to this critical issue.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  },
  {
    id: 'featured-2',
    title: 'Protect Voting Rights',
    category: 'Voting Rights',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nVoting is the foundation of our democracy, yet millions of Americans face barriers to exercising this fundamental right. I urge you to support legislation that protects and expands voting rights.\n\nSpecifically, I ask you to:\n- Oppose voter suppression laws\n- Support automatic voter registration\n- Expand early voting and vote-by-mail options\n- Restore the Voting Rights Act\n- End partisan gerrymandering\n\nEvery eligible citizen should have equal access to the ballot box.\n\nThank you for your service.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  },
  {
    id: 'featured-3',
    title: 'Medicare for All',
    category: 'Healthcare',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nHealthcare is a human right. I am writing to urge you to support Medicare for All legislation that would guarantee healthcare coverage for every American.\n\nOur current system leaves millions uninsured or underinsured while medical debt bankrupts families. We need:\n- Universal healthcare coverage\n- Lower prescription drug costs\n- No medical bankruptcies\n- Comprehensive coverage including mental health and dental\n\nEvery other major nation provides healthcare to its citizens. America can and must do the same.\n\nThank you for considering this vital issue.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  },
  {
    id: 'featured-4',
    title: 'Civil Rights Protection for All',
    category: 'Civil Rights',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nI am writing to urge you to stand firmly for civil rights and equality for all Americans, especially minorities and disadvantaged communities who continue to face discrimination and systemic barriers.\n\nI ask that you support:\n- Stronger anti-discrimination laws\n- Equal protection under the law for LGBTQ+ individuals\n- Criminal justice reform and police accountability\n- Economic opportunity and fair housing\n- Protection of reproductive rights\n\nWe cannot claim to be a just society while any group faces discrimination.\n\nThank you for your commitment to equality.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  },
  {
    id: 'featured-5',
    title: 'Invest in Public Education',
    category: 'Education',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nPublic education is the foundation of opportunity and democracy. I urge you to support increased federal investment in our schools and oppose privatization efforts.\n\nOur students need:\n- Increased federal funding for public schools\n- Higher teacher salaries and better working conditions\n- Universal pre-K and affordable childcare\n- Debt-free college and trade school\n- Opposition to school voucher programs that drain public resources\n\nEvery child deserves a quality education regardless of their ZIP code.\n\nThank you for your attention.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  },
  {
    id: 'featured-6',
    title: 'Tax the Ultra-Wealthy',
    category: 'Economic Justice',
    featured: true,
    sourceType: 'app',
    sourceName: 'App curated',
    template: 'Dear [Representative Name],\n\nEconomic inequality in America has reached crisis levels. I urge you to support progressive taxation that ensures the ultra-wealthy pay their fair share.\n\nI ask you to support:\n- Wealth taxes on billionaires\n- Higher marginal tax rates on the highest earners\n- Closing tax loopholes for corporations and the wealthy\n- Stronger IRS enforcement against tax evasion\n- Investment of tax revenue in public services and infrastructure\n\nNo one needs billions while families struggle to afford basic necessities. Tax justice is economic justice.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]\n[Your City, State]'
  }
];


const CivicContactApp = () => {
  // All state variables
  const [step, setStep] = useState('lookup');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [billQuery, setBillQuery] = useState('');
  const [, setActionType] = useState(null);
  const [, setEmailMethod] = useState(null);
  const [userName] = useState('');
  const [error, setError] = useState('');
  const [federalBills, setFederalBills] = useState([]);
  const [stateBills, setStateBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [userState, setUserState] = useState('');
  const [issues, setIssues] = useState([]);
  const [, setIssuesLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Bills search
  const [billSearchScope, setBillSearchScope] = useState('federal'); // 'federal' | 'state'
  const [billSearchResults, setBillSearchResults] = useState([]);
  const [billSearchLoading, setBillSearchLoading] = useState(false);
  const [billSearchLimit, setBillSearchLimit] = useState(10);

  // Tiny admin
  const [adminToken, setAdminToken] = useState('');
  const [adminIssuesDraft, setAdminIssuesDraft] = useState([]);
  const [adminSaving, setAdminSaving] = useState(false);

  // API Base URL
  const API_BASE_URL = 'https://little-sun-0c07.civic-engagement-api.workers.dev';


  // Load curated issues (so you can update monthly + later ingest campaigns)
  useEffect(() => {
    // simple admin route: /#admin
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.toLowerCase().includes('admin')) {
        setStep('admin');
      }

      const saved = window.sessionStorage.getItem('adminToken');
      if (saved) setAdminToken(saved);
    }

    const load = async () => {
      setIssuesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/issues`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.issues)) {
            setIssues(data.issues);
            setAdminIssuesDraft(data.issues);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to load issues from API, using fallback.', e);
      } finally {
        setIssuesLoading(false);
      }

      // API returned nothing or failed – issues stays empty; Featured Issues
      // are always rendered directly from FALLBACK_ISSUES.
      setAdminIssuesDraft([]);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRepresentatives = async () => {
    setLoading(true);
    setError('');
    
    try {
      let searchQuery = '';
      
      if (address && zipCode) {
        searchQuery = `${address}, ${zipCode}`;
      } else if (address) {
        searchQuery = address;
      } else if (zipCode) {
        searchQuery = zipCode;
      } else {
        setError('Please enter either a ZIP code or full address.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/representatives?address=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch representatives');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch representatives');
      }
      
      const allReps = [
        ...(result.data.federal || []),
        ...(result.data.state || [])
      ];
      
      if (allReps.length === 0) {
        setError('No representatives found for this address. Please try a different ZIP code or full address.');
        return;
      }
      
      if (result.data.location?.state) {
        setUserState(result.data.location.state);
      }
      
      setRepresentatives(allReps);
      setStep('selectRep');
    } catch (err) {
      console.error('Error fetching representatives:', err);
      setError(err.message || 'Failed to fetch representatives. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipLookup = () => {
    if (zipCode.length > 0 || address.length > 0) {
      fetchRepresentatives();
    }
  };

  const handleRepSelect = (rep) => {
    setSelectedRep(rep);
    if (userState) {
      fetchBills();
    }
    setStep('selectIssue');
  };

  const fetchBills = async () => {
    setBillsLoading(true);
    
    try {
      const [federalResponse, stateResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bills/federal?limit=5`),
        userState ? fetch(`${API_BASE_URL}/api/bills/state?state=${userState}&limit=5`) : Promise.resolve(null)
      ]);

      if (federalResponse.ok) {
        const federalData = await federalResponse.json();
        setFederalBills(federalData.bills || []);
      }

      if (stateResponse && stateResponse.ok) {
        const stateData = await stateResponse.json();
        setStateBills(stateData.bills || []);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setBillsLoading(false);
    }
  };

  const runBillSearch = async () => {
    const q = (billQuery || '').trim();
    if (!q) {
      setBillSearchResults([]);
      return;
    }

    setBillSearchLoading(true);
    try {
      if (billSearchScope === 'state' && !userState) {
        setError('State bill search requires a state. Enter a full address or ZIP first.');
        return;
      }

      const endpoint = billSearchScope === 'state'
        ? `${API_BASE_URL}/api/bills/state/search?state=${encodeURIComponent(userState)}&q=${encodeURIComponent(q)}&limit=${billSearchLimit}`
        : `${API_BASE_URL}/api/bills/federal/search?q=${encodeURIComponent(q)}&limit=${billSearchLimit}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Bill search failed');
      }
      setBillSearchResults(data.bills || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Bill search failed');
    } finally {
      setBillSearchLoading(false);
    }
  };

  const beginOver = () => {
    setStep('lookup');
    setRepresentatives([]);
    setSelectedRep(null);
    setSelectedIssue(null);
    setCustomMessage('');
    setSearchQuery('');
    setBillQuery('');
    setActionType(null);
    setEmailMethod(null);
    setBillSearchResults([]);
    setFederalBills([]);
    setStateBills([]);
    setError('');
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    let message = issue.template;
    
    if (message) {
      message = message
        .replace('[Representative Name]', selectedRep.name)
        .replace('[Your Name]', userName || '[Your Name]')
        .replace('[Your City, State]', address || '[Your City, State]');
    } else {
      message = `Dear ${selectedRep.name},

I am writing regarding ${issue.number}: ${issue.title}

[Add your personal message here about why this bill matters to you]

Latest Action: ${issue.latestAction || 'Pending'}

I urge you to support legislation that addresses this important issue.

Thank you for your consideration.

Sincerely,
${userName || '[Your Name]'}
${address || '[Your City, State]'}`;
    }
    
    setCustomMessage(message);
    setStep('customize');
  };

  const handleChooseEmailMethod = (method) => {
    setEmailMethod(method);
    if (method === 'own') {
      handleOwnEmail();
    } else {
      setStep('enterEmail');
    }
  };

  const handleOwnEmail = () => {
    if (!selectedRep.email) {
      if (selectedRep.contactForm) {
        window.open(selectedRep.contactForm, '_blank');
        setActionType('email');
        setStep('success');
      } else {
        setError('This representative does not have a public email address. Please use the contact form link on their profile page.');
      }
      return;
    }
    
    const subject = `Constituent Message: ${selectedIssue.title}`;
    const body = encodeURIComponent(customMessage);
    const mailtoLink = `mailto:${selectedRep.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    window.location.href = mailtoLink;
    setActionType('email');
    setStep('success');
  };


  const handleGetCallInfo = () => {
    setActionType('call');
    setStep('success');
  };

  const filterByQuery = (list, q) => {
    if (!q) return list;
    return list.filter(issue =>
      (issue.title || '').toLowerCase().includes(q) ||
      (issue.category || '').toLowerCase().includes(q) ||
      (issue.billNumber && issue.billNumber.toLowerCase().includes(q)) ||
      (issue.number && issue.number.toLowerCase().includes(q))
    );
  };

  // Featured Issues – always from the static FALLBACK_ISSUES list
  const filteredFeatured = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return filterByQuery(FALLBACK_ISSUES, q);
  }, [searchQuery]);

  // Trending Issues – from /api/issues
  const filteredTrending = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return filterByQuery(issues, q);
  }, [issues, searchQuery]);

  // Builds a mailto link using the currently edited message
  const buildMailtoLink = () => {
    const email = selectedRep?.email;
    if (!email) return null;

    const subject =
      selectedIssue?.number
        ? `${selectedIssue.number}: ${selectedIssue.title || "Constituent message"}`
        : (selectedIssue?.title || "Constituent message");

    const body = customMessage || "";

    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openContactForm = () => {
    const url = selectedRep?.contactForm;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openEmailDirectly = () => {
    const mailto = buildMailtoLink();
    if (!mailto) return;
    window.location.href = mailto;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
        <div className="text-center mb-10 sm:mb-12 pt-6 sm:pt-8">
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight">
            Pressure
          </h1>
          <p className="text-gray-600 text-lg font-semibold tracking-wide">Contact. Copy. Call. Repeat.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {step === 'lookup' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="w-12 h-12 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Find Your Representatives</h2>
            
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Street Address (e.g., 123 Main St, Raleigh, NC)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleZipLookup()}
                className="w-full px-6 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
              />
              
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="ZIP Code (e.g., 27603)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  onKeyPress={(e) => e.key === 'Enter' && handleZipLookup()}
                  className="flex-1 px-6 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
                  maxLength={5}
                />
                <button
                  onClick={handleZipLookup}
                  disabled={(zipCode.length === 0 && address.length === 0) || loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Find Reps'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">💡 Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Quick lookup:</strong> Enter just your 5-digit ZIP code</li>
                <li><strong>Most accurate:</strong> Enter your full street address</li>
                <li><strong>Combine both:</strong> Partial address + ZIP works too!</li>
                <li>Example: "123 Main St" + "27603" or "1600 Pennsylvania Ave NW, Washington, DC 20500"</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'selectRep' && (
          <div className="space-y-4">
            <button onClick={() => setStep('lookup')} className="text-purple-600 hover:text-purple-800 font-semibold mb-4">
              ← Back
            </button>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Representatives</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Federal Representatives (Congress.gov)</h3>
              {representatives.filter(r => r.source === 'Congress.gov').length > 0 ? (
                representatives.filter(r => r.source === 'Congress.gov').map(rep => (
                <div
                  key={rep.id}
                  onClick={() => handleRepSelect(rep)}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-transparent hover:border-purple-300 mb-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{rep.name}</h3>
                      <p className="text-gray-600">{rep.type} {rep.district && `- ${rep.district}`}</p>
                      <p className="text-sm text-gray-500">{rep.office}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        rep.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 
                        rep.party === 'Republican' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rep.party}
                      </span>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {rep.email && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4" />
                          <span>{rep.email}</span>
                        </div>
                      )}
                      {rep.phone && (
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4" />
                          <span>{rep.phone}</span>
                        </div>
                      )}
                      {rep.contactForm && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <a 
                            href={rep.contactForm} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact Form
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-600">
                No federal representatives found for this location.
              </div>
            )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">State Representatives (OpenStates)</h3>
              {representatives.filter(r => r.source === 'OpenStates').length > 0 ? (
                representatives.filter(r => r.source === 'OpenStates').map(rep => (
                <div
                  key={rep.id}
                  onClick={() => handleRepSelect(rep)}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-transparent hover:border-purple-300 mb-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{rep.name}</h3>
                      <p className="text-gray-600">{rep.type} - {rep.district}</p>
                      <p className="text-sm text-gray-500">{rep.office}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        rep.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 
                        rep.party === 'Republican' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rep.party}
                      </span>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {rep.email && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4" />
                          <span>{rep.email}</span>
                        </div>
                      )}
                      {rep.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{rep.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-600">
                No state representatives found for this location.
              </div>
            )}
            </div>
          </div>
        )}

        {step === 'selectIssue' && (
          <div>
            <button onClick={() => setStep('selectRep')} className="text-purple-600 hover:text-purple-800 font-semibold mb-4">
              ← Back
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by issue, category, or bill number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Featured Issues (static, always shown) */}
            {filteredFeatured.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Featured Issues</h2>
                </div>
                <div className="space-y-3">
                  {filteredFeatured.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => handleIssueSelect(issue)}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-purple-200 hover:border-purple-400"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Curated Action Template</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
                          {issue.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Issues (from /api/issues) */}
            {filteredTrending.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Trending Issues</h2>
                </div>
                <div className="space-y-3">
                  {filteredTrending.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => handleIssueSelect(issue)}
                      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-transparent hover:border-purple-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              {issue.category || 'Issue'}
                            </span>
                            {issue.sourceName && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {issue.sourceName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{issue.title}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bill Search */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800">Find a bill</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBillSearchScope('federal')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border ${billSearchScope === 'federal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      Federal
                    </button>
                    <button
                      onClick={() => setBillSearchScope('state')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border ${billSearchScope === 'state' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
                      disabled={!userState}
                      title={!userState ? 'Enter a ZIP/address first' : ''}
                    >
                      State {userState ? `(${userState})` : ''}
                    </button>
                  </div>

                  <div className="flex-1" />

                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    Limit
                    <select
                      value={billSearchLimit}
                      onChange={(e) => setBillSearchLimit(parseInt(e.target.value, 10))}
                      className="border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </label>
                </div>

                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Keyword (e.g., housing, climate, abortion, HB 2)"
                    value={billQuery}
                    onChange={(e) => setBillQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && runBillSearch()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={runBillSearch}
                    disabled={billSearchLoading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {billSearchLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </div>

                {billSearchResults.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {billSearchResults.map(bill => (
                      <div
                        key={bill.id}
                        onClick={() => handleIssueSelect(bill)}
                        className="rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-purple-300 hover:shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                            {bill.number}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {bill.source}
                          </span>
                        </div>
                        <div className="font-semibold text-gray-800 line-clamp-2">{bill.title}</div>
                        {bill.latestAction && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">Latest: {bill.latestAction}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!billSearchLoading && billQuery.trim().length > 0 && billSearchResults.length === 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    No matches yet. Try shorter keywords (e.g., “housing” instead of a full sentence).
                  </div>
                )}
              </div>
            </div>

            {/* Recent Federal Bills */}
            {federalBills.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Recent Federal Legislation</h2>
                </div>
                <div className="space-y-3">
                  {federalBills.map(bill => (
                    <div
                      key={bill.id}
                      onClick={() => handleIssueSelect(bill)}
                      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-transparent hover:border-blue-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {bill.number}
                            </span>
                            {bill.policyArea && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {bill.policyArea}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{bill.title}</h3>
                        </div>
                      </div>
                      {bill.latestAction && (
                        <p className="text-sm text-gray-600 mt-2">
                          Latest: {bill.latestAction} ({bill.latestActionDate})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent State Bills */}
            {stateBills.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Recent {userState} Legislation</h2>
                </div>
                <div className="space-y-3">
                  {stateBills.map(bill => (
                    <div
                      key={bill.id}
                      onClick={() => handleIssueSelect(bill)}
                      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:scale-102 transition-all duration-200 border-2 border-transparent hover:border-green-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              {bill.number}
                            </span>
                            {bill.subjects && bill.subjects.length > 0 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {bill.subjects[0]}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{bill.title}</h3>
                        </div>
                      </div>
                      {bill.latestAction && (
                        <p className="text-sm text-gray-600 mt-2">
                          Latest: {bill.latestAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {billsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Loading recent legislation...</span>
              </div>
            )}
          </div>
        )}

        {step === 'customize' && selectedRep && selectedIssue && (
          <div className="space-y-4">
            <button onClick={() => setStep('selectIssue')} className="text-purple-600 hover:text-purple-800 font-semibold">
              ← Back
            </button>

            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Customize your message</h2>
                  <p className="text-gray-600 mt-1">
                    Sending to <span className="font-semibold">{selectedRep.name}</span>
                  </p>
                </div>
                <button
                  onClick={beginOver}
                  className="text-gray-500 hover:text-gray-800 text-sm font-semibold"
                >
                  Start over
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 mb-4">
                <div className="font-semibold">Topic</div>
                <div className="mt-1">
                  {selectedIssue.number ? (
                    <span>{selectedIssue.number}: {selectedIssue.title}</span>
                  ) : (
                    <span>{selectedIssue.title}</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {selectedIssue.sourceType === 'org' ? 'Campaign template' : 'App template'}{selectedIssue.sourceName ? ` • ${selectedIssue.sourceName}` : ''}
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Message</label>
                <button
                  onClick={() => navigator.clipboard?.writeText(customMessage)}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                >
                  Copy message
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500 text-sm sm:text-base"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => { setActionType('email'); setStep('chooseEmail'); }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email / Contact Form
                </button>
                <button
                  onClick={handleGetCallInfo}
                  className="w-full px-4 py-3 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Get call script
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                We don’t track which issues you click or who you contact. <button className="underline" onClick={() => setPrivacyOpen(true)}>Privacy</button>
              </div>
            </div>
          </div>
        )}

        {step === 'chooseEmail' && (
          <div className="space-y-4">
            <button onClick={() => setStep('customize')} className="text-purple-600 hover:text-purple-800 font-semibold">
              ← Back
            </button>
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">How do you want to send?</h2>
              <p className="text-gray-600 mb-6">Fastest: open your email client or the official contact form.</p>

              <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Contact form */}
                {selectedRep?.contactForm ? (
                  <button
                    onClick={openContactForm}
                    className="w-full px-4 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Contact form
                  </button>
                ) : (
                  <div className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-400 flex items-center justify-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    No contact form
                  </div>
                )}

                {/* Email directly */}
                {selectedRep?.email ? (
                  <button
                    onClick={openEmailDirectly}
                    className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Email directly
                  </button>
                ) : (
                  <div className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-400 flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    No public email
                  </div>
                )}

                {/* Call */}
                {selectedRep?.phone ? (
                  <a
                    href={`tel:${String(selectedRep.phone).replace(/\s+/g, '')}`}
                    className="w-full px-4 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call
                  </a>
                ) : (
                  <div className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-400 flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    No phone listed
                  </div>
                )}
              </div>

              <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-700">Your message</div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(customMessage)}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    Copy message
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto">
                  {customMessage}
                </div>
              </div>

              <button
                onClick={() => handleChooseEmailMethod('service')}
                className="w-full px-4 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Send from this site (coming soon)
              </button>
            </div>

              <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                When “send from this site” is enabled, we’ll require a simple captcha to reduce spam.
              </div>
            </div>
          </div>
        )}

        {step === 'enterEmail' && (
          <div className="space-y-4">
            <button onClick={() => setStep('chooseEmail')} className="text-purple-600 hover:text-purple-800 font-semibold">
              ← Back
            </button>
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Send from this site</h2>
              <p className="text-gray-600 mb-6">Not fully enabled yet. This is where we’ll collect your email, run captcha, and send.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Contact form button (if present) */}
                    {selectedRep.contactForm ? (
                      <button
                        onClick={openContactForm}
                        className="px-6 py-4 rounded-2xl font-semibold bg-gray-900 text-white hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Contact form
                      </button>
                    ) : (
                      <div className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-400 font-semibold flex items-center justify-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        No contact form
                      </div>
                    )}

                    {/* Email directly button (mailto) */}
                    {selectedRep.email ? (
                      <button
                        onClick={openEmailDirectly}
                        className="px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        Email directly
                      </button>
                    ) : (
                      <div className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-400 font-semibold flex items-center justify-center gap-2">
                        <Mail className="w-5 h-5" />
                        No public email
                      </div>
                    )}

                    {/* Call button */}
                    {selectedRep.phone ? (
                      <a
                        href={`tel:${String(selectedRep.phone).replace(/\s+/g, '')}`}
                        className="px-6 py-4 rounded-2xl font-semibold border-2 border-gray-200 hover:border-purple-300 text-gray-700 hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Phone className="w-5 h-5" />
                        Call
                      </a>
                    ) : (
                      <div className="px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-400 font-semibold flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        No phone listed
                      </div>
                    )}
                  </div>
                ) : (
                <div className="mt-5">
                  <button
                    onClick={handleOwnEmail}
                    className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Open email / contact form again
                  </button>
                  <div className="mt-3 text-sm text-gray-600">
                    If a contact form opened, paste your message from below.
                  </div>
                </div>
              )

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">Your message</div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(customMessage)}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-2 p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 whitespace-pre-line">
                  {customMessage}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={beginOver}
                  className="w-full px-4 py-3 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow"
                >
                  Do another
                </button>
                <button
                  onClick={() => setStep('lookup')}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-2xl font-semibold hover:shadow"
                >
                  Back to start
                </button>
              </div>

              <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Want this to grow? Share the link. (Mobile-first is the point.)</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
              <div className="text-5xl sm:text-6xl mb-6">&#x1F4A5;</div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Pressure applied.</h2>
              <p className="text-xl text-gray-700 font-semibold mb-1">Message ready.</p>
              <p className="text-lg text-gray-500">Next rep. Same energy.</p>

              <button
                onClick={() => {
                  setSelectedRep(null);
                  setSelectedIssue(null);
                  setCustomMessage('');
                  setActionType(null);
                  setEmailMethod(null);
                  setError('');
                  setStep(representatives.length > 0 ? 'selectRep' : 'lookup');
                }}
                className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Pressure someone else
              </button>

              <button
                onClick={beginOver}
                className="mt-3 w-full px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow transition"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {step === 'admin' && (
          <div className="space-y-4">
            <button onClick={() => setStep('lookup')} className="text-purple-600 hover:text-purple-800 font-semibold">
              ← Back to app
            </button>
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin: Curated issues</h2>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Protected by token
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700">Admin token</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="password"
                    value={adminToken}
                    onChange={(e) => {
                      setAdminToken(e.target.value);
                      if (typeof window !== 'undefined') window.sessionStorage.setItem('adminToken', e.target.value);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-500"
                    placeholder="Bearer token"
                  />
                  <button
                    onClick={async () => {
                      setAdminSaving(true);
                      setError('');
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/issues`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminToken}`
                          },
                          body: JSON.stringify({ issues: adminIssuesDraft })
                        });
                        const data = await res.json();
                        if (!res.ok || !data?.success) throw new Error(data?.error || 'Save failed');
                        setIssues(adminIssuesDraft);
                      } catch (e) {
                        setError(e.message || 'Save failed');
                      } finally {
                        setAdminSaving(false);
                      }
                    }}
                    disabled={!adminToken || adminSaving}
                    className="px-4 py-3 bg-gray-900 text-white rounded-2xl font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {adminSaving ? <Loader className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {adminIssuesDraft.map((issue, idx) => (
                  <div key={issue.id || idx} className="border border-gray-200 rounded-2xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={issue.title || ''}
                        onChange={(e) => {
                          const next = [...adminIssuesDraft];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setAdminIssuesDraft(next);
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={issue.category || ''}
                        onChange={(e) => {
                          const next = [...adminIssuesDraft];
                          next[idx] = { ...next[idx], category: e.target.value };
                          setAdminIssuesDraft(next);
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Category"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <select
                        value={issue.sourceType || 'app'}
                        onChange={(e) => {
                          const next = [...adminIssuesDraft];
                          next[idx] = { ...next[idx], sourceType: e.target.value };
                          setAdminIssuesDraft(next);
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="app">App</option>
                        <option value="org">Org</option>
                      </select>
                      <input
                        type="text"
                        value={issue.sourceName || ''}
                        onChange={(e) => {
                          const next = [...adminIssuesDraft];
                          next[idx] = { ...next[idx], sourceName: e.target.value };
                          setAdminIssuesDraft(next);
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Source name (optional)"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!issue.featured}
                          onChange={(e) => {
                            const next = [...adminIssuesDraft];
                            next[idx] = { ...next[idx], featured: e.target.checked };
                            setAdminIssuesDraft(next);
                          }}
                        />
                        Featured
                      </label>
                    </div>
                    <textarea
                      value={issue.template || ''}
                      onChange={(e) => {
                        const next = [...adminIssuesDraft];
                        next[idx] = { ...next[idx], template: e.target.value };
                        setAdminIssuesDraft(next);
                      }}
                      className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg"
                      rows={6}
                      placeholder="Template (use [Representative Name], [Your Name], [Your City, State] placeholders)"
                    />
                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={() => {
                          const next = [...adminIssuesDraft];
                          next.splice(idx, 1);
                          setAdminIssuesDraft(next);
                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                      <div className="text-xs text-gray-500">id: {issue.id || '(none)'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setAdminIssuesDraft([
                    {
                      id: `app-${Date.now()}`,
                      title: '',
                      category: '',
                      featured: true,
                      sourceType: 'app',
                      sourceName: 'App curated',
                      template: 'Dear [Representative Name],\n\n...\n\nSincerely,\n[Your Name]\n[Your City, State]'
                    },
                    ...adminIssuesDraft
                  ]);
                }}
                className="mt-6 w-full px-4 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold hover:shadow"
              >
                + Add issue
              </button>

              <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                For real security, put /#admin behind Cloudflare Access (recommended), and use KV for storage.
              </div>
            </div>
          </div>
        )}

        {/* Privacy modal */}
        {privacyOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setPrivacyOpen(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Privacy</h3>
                  <p className="text-sm text-gray-600 mt-1">Plain-English and minimal.</p>
                </div>
                <button className="text-gray-500 hover:text-gray-800" onClick={() => setPrivacyOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-700 space-y-3">
                <p><span className="font-semibold">We don’t track</span> which issues you click, which reps you contact, or whether you sent a message.</p>
                <p><span className="font-semibold">We do use</span> your ZIP/address to look up your reps and show relevant state bills.</p>
                <p><span className="font-semibold">If/when</span> “send from this site” is enabled, we’ll use a captcha and only store what’s needed to send the message.</p>
                <p className="text-xs text-gray-500">(You'll likely want to tighten this up once you add analytics or a backend.)</p>
                <p className="font-semibold text-gray-400 italic pt-2">Because silence is consent.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-400 italic">Because silence is consent.</p>
          <div>
            <button onClick={() => setPrivacyOpen(true)} className="underline">Privacy</button>
            <span className="mx-2">&bull;</span>
            <a href="#admin" className="underline">Admin</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicContactApp;