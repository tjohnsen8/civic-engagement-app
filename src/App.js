//   const API_BASE_URL = 'https://little-sun-0c07.civic-engagement-api.workers.dev';
import React, { useState } from 'react';
import { Search, Mail, Phone, Edit2, Send, MapPin, TrendingUp, AlertCircle, ExternalLink, Loader } from 'lucide-react';

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
  const [actionType, setActionType] = useState(null);
  const [emailMethod, setEmailMethod] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [federalBills, setFederalBills] = useState([]);
  const [stateBills, setStateBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [userState, setUserState] = useState('');

  // API Base URL
  const API_BASE_URL = 'https://little-sun-0c07.civic-engagement-api.workers.dev';

  // Curated featured issues - update these weekly/monthly
  const featuredIssues = [
    {
      id: 'featured-1',
      title: 'Abolish ICE / Immigration Reform',
      category: 'Immigration',
      supporters: 45230,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nI am writing to urge you to support comprehensive immigration reform and reconsider the role of Immigration and Customs Enforcement (ICE). The current immigration system is broken and causes immense suffering to families and communities.\n\nI ask that you:\n- Support humane immigration policies\n- Protect DACA recipients and Dreamers\n- End family separations and detention of children\n- Reform or abolish ICE in favor of a more humane approach\n\nOur nation was built by immigrants, and we must treat all people with dignity and compassion.\n\nThank you for your attention to this critical issue.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    },
    {
      id: 'featured-2',
      title: 'Protect Voting Rights',
      category: 'Voting Rights',
      supporters: 67890,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nVoting is the foundation of our democracy, yet millions of Americans face barriers to exercising this fundamental right. I urge you to support legislation that protects and expands voting rights.\n\nSpecifically, I ask you to:\n- Oppose voter suppression laws\n- Support automatic voter registration\n- Expand early voting and vote-by-mail options\n- Restore the Voting Rights Act\n- End partisan gerrymandering\n\nEvery eligible citizen should have equal access to the ballot box.\n\nThank you for your service.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    },
    {
      id: 'featured-3',
      title: 'Medicare for All',
      category: 'Healthcare',
      supporters: 52100,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nHealthcare is a human right. I am writing to urge you to support Medicare for All legislation that would guarantee healthcare coverage for every American.\n\nOur current system leaves millions uninsured or underinsured while medical debt bankrupts families. We need:\n- Universal healthcare coverage\n- Lower prescription drug costs\n- No medical bankruptcies\n- Comprehensive coverage including mental health and dental\n\nEvery other major nation provides healthcare to its citizens. America can and must do the same.\n\nThank you for considering this vital issue.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    },
    {
      id: 'featured-4',
      title: 'Civil Rights Protection for All',
      category: 'Civil Rights',
      supporters: 41560,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nI am writing to urge you to stand firmly for civil rights and equality for all Americans, especially minorities and disadvantaged communities who continue to face discrimination and systemic barriers.\n\nI ask that you support:\n- Stronger anti-discrimination laws\n- Equal protection under the law for LGBTQ+ individuals\n- Criminal justice reform and police accountability\n- Economic opportunity and fair housing\n- Protection of reproductive rights\n\nWe cannot claim to be a just society while any group faces discrimination.\n\nThank you for your commitment to equality.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    },
    {
      id: 'featured-5',
      title: 'Invest in Public Education',
      category: 'Education',
      supporters: 38920,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nPublic education is the foundation of opportunity and democracy. I urge you to support increased federal investment in our schools and oppose privatization efforts.\n\nOur students need:\n- Increased federal funding for public schools\n- Higher teacher salaries and better working conditions\n- Universal pre-K and affordable childcare\n- Debt-free college and trade school\n- Opposition to school voucher programs that drain public resources\n\nEvery child deserves a quality education regardless of their ZIP code.\n\nThank you for your attention.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    },
    {
      id: 'featured-6',
      title: 'Tax the Ultra-Wealthy',
      category: 'Economic Justice',
      supporters: 59340,
      billNumber: 'Featured',
      featured: true,
      template: 'Dear [Representative Name],\n\nEconomic inequality in America has reached crisis levels. I urge you to support progressive taxation that ensures the ultra-wealthy pay their fair share.\n\nI ask you to support:\n- Wealth taxes on billionaires\n- Higher marginal tax rates on the highest earners\n- Closing tax loopholes for corporations and the wealthy\n- Stronger IRS enforcement against tax evasion\n- Investment of tax revenue in public services and infrastructure\n\nNo one needs billions while families struggle to afford basic necessities. Tax justice is economic justice.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    }
  ];

  const trendingIssues = [
    {
      id: 1,
      title: 'Climate Action Now',
      category: 'Environment',
      supporters: 15420,
      billNumber: 'H.R. 1234',
      template: 'Dear [Representative Name],\n\nI am writing to urge you to support H.R. 1234, comprehensive climate legislation. The scientific consensus is clear: we must act now to reduce carbon emissions and transition to renewable energy sources.\n\nAs your constituent, I ask that you prioritize climate action in upcoming votes and work across the aisle to pass meaningful environmental protection measures.\n\nThank you for your service.\n\nSincerely,\n[Your Name]\n[Your City, State]'
    }
  ];

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

  const handleSendViaService = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setActionType('email');
      setStep('success');
    } catch (err) {
      setError('Failed to send email. Please try using your own email client instead.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCallInfo = () => {
    setActionType('call');
    setStep('success');
  };

  const filteredIssues = [...featuredIssues, ...trendingIssues].filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.billNumber && issue.billNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6 pb-20">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Make Your Voice Heard
          </h1>
          <p className="text-gray-600 text-lg">Connect with your representatives in seconds</p>
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

            {/* Featured Issues */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">Featured Issues</h2>
              </div>
              <div className="space-y-3">
                {filteredIssues.filter(i => i.featured).map(issue => (
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
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{issue.supporters.toLocaleString()} people have taken action</span>
                    </div>
                  </div>
                ))}
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

        {/* Continue with customize, enterEmail, and success steps as before */}
        {/* (The rest of the steps remain unchanged from your original code) */}
      </div>
    </div>
  );
};

export default CivicContactApp;