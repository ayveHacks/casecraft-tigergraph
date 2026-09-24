import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, FileText, Search, Maximize2, History, Target, AlertCircle, HelpCircle, Minimize2 } from 'lucide-react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:8000';

export default function App() {
  const [cases, setCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/cases`)
      .then(res => res.json())
      .then(data => setCases(data.cases || []))
      .catch(err => console.log('Error fetching cases', err));
  }, []);

  const loadCase = (caseId: string) => {
    fetch(`${API_BASE}/api/cases/${caseId}`)
      .then(res => res.json())
      .then(data => setSelectedCase(data))
      .catch(err => console.log('Error loading case', err));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold tracking-wider">CASECRAFT<span className="text-gray-400 font-light ml-2">INVESTIGATOR</span></h1>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-4 text-xs font-semibold px-4">
            <span className="text-green-400 flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>TIGERGRAPH: MOCK ADAPTER</span>
            <span className="text-green-400 flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>POLICY ENGINE: READY</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
            Run Benchmark
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Benchmark Cases</h2>
          <div className="space-y-2">
            {cases.map(c => (
              <button 
                key={c}
                onClick={() => loadCase(c)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCase?.case_id === c ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'hover:bg-gray-800 text-gray-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {!selectedCase ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <Activity className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Select an investigation to view results</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Case {selectedCase.case_id}</h2>
                  <div className="flex space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedCase.case.verdict === 'FRAUD' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-green-900/30 border-green-500 text-green-400'}`}>
                      {selectedCase.case.verdict}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-900/30 border-blue-500 text-blue-400">
                      PROBABILITY: {(selectedCase.case.fraud_probability * 100).toFixed(1)}%
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-800 border-gray-600 text-gray-300">
                      EXPOSURE: ${selectedCase.case.exposure_usd?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                
                {/* Left Column - Main Investigation */}
                <div className="col-span-8 space-y-6">
                  
                  {/* Hypothesis Board */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <Search className="w-4 h-4 mr-2" /> Hypothesis Board
                    </h3>
                    <div className="space-y-4">
                      {selectedCase.hypotheses?.map((hyp: any, i: number) => (
                        <div key={i} className="bg-gray-950 border border-gray-800 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-blue-400 uppercase tracking-wide">{hyp.hypothesis.replace(/_/g, ' ')}</span>
                            <span className="text-gray-400 text-sm">{Math.round(hyp.current_confidence * 100)}% Confidence</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="text-xs text-green-500 font-semibold mb-1">SUPPORTING (+)</div>
                              <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                                {hyp.supporting_evidence?.map((e: string, j: number) => <li key={j}>{e}</li>)}
                                {(!hyp.supporting_evidence || hyp.supporting_evidence.length === 0) && <li className="italic">None found</li>}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs text-red-500 font-semibold mb-1">CONTRADICTING (-)</div>
                              <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                                {hyp.contradicting_evidence?.map((e: string, j: number) => <li key={j}>{e}</li>)}
                                {(!hyp.contradicting_evidence || hyp.contradicting_evidence.length === 0) && <li className="italic">None found</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Ledger */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <FileText className="w-4 h-4 mr-2" /> Evidence Ledger
                    </h3>
                    <div className="space-y-2">
                      {selectedCase.case.evidence?.map((ev: any, i: number) => (
                        <div key={i} className="flex items-start p-3 bg-gray-950 border border-gray-800 rounded">
                          <div className={`mt-0.5 mr-3 px-2 py-0.5 text-[10px] font-bold rounded ${ev.type === 'SUPPORTING' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                            {ev.type}
                          </div>
                          <div>
                            <p className="text-sm text-gray-200">{ev.claim}</p>
                            <p className="text-xs text-gray-500 mt-1">Source: {ev.source} | Query: {ev.query}</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedCase.case.evidence || selectedCase.case.evidence.length === 0) && (
                         <div className="text-sm text-gray-500 italic">No evidence recorded.</div>
                      )}
                    </div>
                  </div>

                  {/* Graph Visualization */}
                  <div className={isFullscreen ? "fixed inset-0 z-[100] bg-gray-950 p-8 flex flex-col" : "bg-gray-900 rounded-lg border border-gray-800 p-5 h-[400px] flex flex-col"}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                        <Maximize2 className="w-4 h-4 mr-2" /> TigerGraph Traversal
                      </h3>
                      <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded transition-colors flex items-center"
                      >
                        {isFullscreen ? <><Minimize2 className="w-4 h-4 mr-2" /> Exit Fullscreen</> : <><Maximize2 className="w-4 h-4 mr-2" /> Fullscreen</>}
                      </button>
                    </div>
                    <div className="flex-1 rounded border border-gray-800 overflow-hidden bg-black relative">
                      {(() => {
                        const nodes: any[] = [];
                        const edges: any[] = [];
                        
                        // Root Customer
                        nodes.push({ id: 'customer', position: { x: 250, y: 20 }, data: { label: 'Customer' }, style: { background: '#3b82f6', color: '#fff', border: '1px solid #1e3a8a', borderRadius: '6px', padding: '10px', width: 140, textAlign: 'center', fontWeight: 'bold' } });
                        
                        // Cards
                        const cards = selectedCase.case.connected_card_ids || [];
                        const cardStartX = 250 - ((cards.length - 1) * 160) / 2;
                        cards.forEach((cId: any, idx: number) => {
                          const x = cardStartX + (idx * 160);
                          nodes.push({ id: `card-${cId}`, position: { x, y: 100 }, data: { label: `Card: ${cId}` }, style: { background: '#10b981', color: '#fff', border: '1px solid #065f46', borderRadius: '6px', padding: '10px', width: 140, textAlign: 'center' } });
                          edges.push({ id: `e-c-card${cId}`, source: 'customer', target: `card-${cId}`, animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } });
                        });
                        
                        // Transactions
                        const txns = selectedCase.case.affected_txn_ids || [];
                        const txnStartX = 250 - ((txns.length - 1) * 160) / 2;
                        txns.forEach((tId: any, idx: number) => {
                          const x = txnStartX + (idx * 160);
                          // Adjust Y position if there are prior cases to avoid overlap, or just put them in a row
                          nodes.push({ id: `txn-${tId}`, position: { x: x - 80, y: 200 }, data: { label: `Txn: ${tId}` }, style: { background: '#ef4444', color: '#fff', border: '1px solid #991b1b', borderRadius: '6px', padding: '10px', width: 140, textAlign: 'center' } });
                          // Connect txn to first card for visual simplicity
                          if (cards.length > 0) {
                            edges.push({ id: `e-card-tx${tId}`, source: `card-${cards[0]}`, target: `txn-${tId}`, animated: true, style: { stroke: '#34d399', strokeWidth: 2 } });
                          }
                        });

                        // Prior Cases
                        const priorCases = selectedCase.case.similar_prior_cases || [];
                        const pcStartX = 250 - ((priorCases.length - 1) * 160) / 2;
                        priorCases.forEach((pc: any, idx: number) => {
                           const x = pcStartX + (idx * 160);
                           nodes.push({ id: `pc-${pc.case_id}`, position: { x: x + 80, y: 200 }, data: { label: `Closed: ${pc.case_id}` }, style: { background: '#4b5563', color: '#fff', border: '1px solid #374151', borderRadius: '6px', padding: '10px', width: 140, textAlign: 'center' } });
                           if (cards.length > 0) {
                             edges.push({ id: `e-pc-card${pc.case_id}`, source: `card-${cards[0]}`, target: `pc-${pc.case_id}`, style: { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' } });
                           }
                        });

                        // Fallback if empty (e.g. Legitimate case with no txns)
                        if (nodes.length === 1 && txns.length === 0) {
                          nodes.push({ id: 'no-tx', position: { x: 250, y: 120 }, data: { label: 'No Fraudulent Activity' }, style: { background: '#374151', color: '#fff', border: '1px solid #1f2937', borderRadius: '6px', padding: '10px', width: 180, textAlign: 'center' } });
                          edges.push({ id: `e-c-notx`, source: 'customer', target: 'no-tx', style: { stroke: '#4b5563', strokeWidth: 2 } });
                        }

                        return (
                          <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                          >
                            <Background color="#374151" gap={16} size={1} />
                            <style>{`
                              .react-flow__controls-button svg { fill: black !important; }
                              .react-flow__controls-button { background: white !important; border-bottom: 1px solid #e5e7eb !important; }
                              .react-flow__controls-button:hover { background: #f3f4f6 !important; }
                            `}</style>
                            <Controls style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db' }} showInteractive={false} showZoom={true} showFitView={true} />
                          </ReactFlow>
                        );
                      })()}
                    </div>
                  </div>
                  
                </div>

                {/* Right Column - Timeline, Policy, Actions */}
                <div className="col-span-4 space-y-6">
                  
                  {/* Fingerprint */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" /> Investigation Fingerprint
                    </h3>
                    <div className="space-y-2">
                      {selectedCase.case.fingerprint && Object.entries(selectedCase.case.fingerprint).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">{k.replace(/_/g, ' ')}</span>
                          <span className={v ? "text-red-400 font-semibold" : "text-gray-600"}>{v ? 'DETECTED' : 'CLEARED'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision Planner */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" /> Decision Planner
                    </h3>
                    {selectedCase.evidence_requests?.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 mb-1">WHAT WOULD CHANGE MY DECISION?</div>
                        {selectedCase.evidence_requests.map((req: any, i: number) => (
                          <div key={i} className="bg-gray-950 border border-gray-800 rounded p-3">
                            <div className="text-sm font-bold text-blue-400 mb-1">{req.type}</div>
                            <div className="text-xs text-gray-400 mb-2">Impact: {req.expected_decision_impact}</div>
                            <div className="text-xs text-yellow-500 font-mono bg-yellow-900/10 p-2 border border-yellow-900/30 rounded">
                              {req.assumed_response}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No critical evidence gaps detected. Proceeding with current confidence.</div>
                    )}
                  </div>

                  {/* Policy Decision */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Policy Actions
                    </h3>
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">EXECUTED ROUTES</div>
                      <div className="flex flex-col gap-2">
                        {selectedCase.next_best_actions?.detailed_actions?.map((a: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-gray-950 border border-gray-800 p-2 rounded">
                            <span className="text-xs font-bold text-blue-300">{a.action}</span>
                            <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">{a.route}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SAR */}
                  {selectedCase.sar?.file && (
                    <div className="bg-yellow-900/10 rounded-lg border border-yellow-700/50 p-5">
                      <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> SAR Filed
                      </h3>
                      <p className="text-xs text-yellow-200/70">{selectedCase.sar.narrative}</p>
                    </div>
                  )}

                  {/* Timeline Replay */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <History className="w-4 h-4 mr-2" /> Investigation Replay
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-800">
                      {selectedCase.timeline?.map((event: any, i: number) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-700 bg-gray-900 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          </div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-950 p-2 rounded border border-gray-800">
                            <div className="text-[10px] font-bold text-blue-400 mb-1">{event.event}</div>
                            <div className="text-xs text-gray-400">{event.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
