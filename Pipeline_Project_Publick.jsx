import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, X, AlignLeft, GripHorizontal, Package, User, Store, Clock } from 'lucide-react';

// ============================================================================
// 1. SYSTEM ONTOLOGY & DISTRIBUTED DATABASE INITIALIZATION
// ============================================================================

// Defensive initialization for embedded runtime environments
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { projectId: "demo-project" }; // Fallback for pure dev environments

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-pipeline-app';

// Static Ontology: Pipeline Phases
const PIPELINE_PHASES = [
  { index: 0, name: "Product Research", color: "bg-slate-100 border-slate-300" },
  { index: 1, name: "Selling Angles Refiner", color: "bg-blue-50 border-blue-200" },
  { index: 2, name: "Product Page Creation", color: "bg-indigo-50 border-indigo-200" },
  { index: 3, name: "UGC Creation", color: "bg-purple-50 border-purple-200" },
  { index: 4, name: "FB Ad Campaign", color: "bg-pink-50 border-pink-200" },
  { index: 5, name: "Launch / Live", color: "bg-emerald-50 border-emerald-300" }
];

// Static Ontology: Agents and Stores (Simulated for initial UI selection)
const AGENTS = [
  { id: "agent_01", name: "Partner A" },
  { id: "agent_02", name: "Partner B" }
];

const STORES = [
  { id: "store_A", name: "General Beauty" },
  { id: "store_B", name: "Niche Electronics" }
];

// ============================================================================
// 2. MAIN APPLICATION COMPONENT (STATE MACHINE)
// ============================================================================

export default function PipelineApp() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State Matrices
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null); // Holds product ID for deep editing

  // --------------------------------------------------------------------------
  // 2.1. Authentication & Security Handshake
  // --------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Authentication Matrix Failure:", err);
        setError("Failed to establish secure connection. Operational sync halted.");
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // 2.2. Distributed State Synchronization (WebSockets)
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Axiomatic Guardrail: Abort query if unauthenticated
    if (!user) return;

    // Path Rule 1 Enforcement: Strict centralized public data routing for multi-agent parity
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'pipeline_products');

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const synchronizedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Note: Sorting occurs in-memory per Rule 2 (No Complex Queries)
        const sortedData = synchronizedData.sort((a, b) => b.lastModified - a.lastModified);
        setProducts(sortedData);
      },
      (err) => {
        console.error("Synchronization Engine Error:", err);
        setError("Real-time data synchronization interrupted.");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --------------------------------------------------------------------------
  // 2.3. Data Mutators (Transition Controllers)
  // --------------------------------------------------------------------------
  const handleAddProduct = async (payload) => {
    if (!user) return;
    try {
      const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'pipeline_products');
      await addDoc(productsRef, {
        ...payload,
        currentPhase: 0, // Ingress always occurs at Phase 0
        dateAdded: Date.now(),
        lastModified: Date.now()
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Data Ingestion Failed:", err);
    }
  };

  const handleUpdatePhase = async (productId, newPhaseIndex) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pipeline_products', productId);
      await updateDoc(docRef, {
        currentPhase: newPhaseIndex,
        lastModified: Date.now()
      });
    } catch (err) {
      console.error("Phase Transition Failed:", err);
    }
  };

  const handleUpdateDetails = async (productId, updatedFields) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pipeline_products', productId);
      await updateDoc(docRef, {
        ...updatedFields,
        lastModified: Date.now()
      });
      setActiveProductModal(null);
    } catch (err) {
      console.error("Detailed Update Failed:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pipeline_products', productId);
      await deleteDoc(docRef);
      setActiveProductModal(null);
    } catch (err) {
      console.error("Entity Deletion Failed:", err);
    }
  };

  // --------------------------------------------------------------------------
  // 2.4. Drag & Drop Physics Engine (Native HTML5)
  // --------------------------------------------------------------------------
  const onDragStart = (e, productId) => {
    e.dataTransfer.setData("text/plain", productId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, targetPhaseIndex) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData("text/plain");
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product && product.currentPhase !== targetPhaseIndex) {
        handleUpdatePhase(productId, targetPhaseIndex);
      }
    }
  };

  // ============================================================================
  // 3. UI RENDER METHODOLOGY
  // ============================================================================

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-mono text-sm">
        [INITIALIZING DISTRIBUTED SYNCHRONIZATION ENGINE...]
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* 3.1. Master Control Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">GTM Pipeline Overview</h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Synchronized: WebSocket Active ({products.length} active nodes)
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Inject Product
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 text-sm font-semibold text-center border-b border-red-100">
          SYSTEM ERROR: {error}
        </div>
      )}

      {/* 3.2. Horizontal Node-Based Timeline */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50">
        <div className="flex gap-6 p-6 h-full min-w-max items-start">
          {PIPELINE_PHASES.map((phase) => {
            const phaseProducts = products.filter(p => p.currentPhase === phase.index);
            
            return (
              <div 
                key={phase.index}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, phase.index)}
                className={`w-80 flex-shrink-0 flex flex-col rounded-xl border ${phase.color} shadow-sm max-h-[calc(100vh-120px)] transition-colors duration-200 hover:border-slate-400`}
              >
                {/* Phase Header */}
                <div className="p-4 border-b border-black/5 bg-white/40 backdrop-blur-sm rounded-t-xl flex justify-between items-center sticky top-0 z-10">
                  <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{phase.name}</h2>
                  <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {phaseProducts.length}
                  </span>
                </div>

                {/* Drop Zone / Spatial Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {phaseProducts.map((product) => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, product.id)}
                      onClick={() => setActiveProductModal(product)}
                      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <GripHorizontal size={14} className="text-slate-300 group-hover:text-slate-500" />
                          <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* Store Indicator */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wide">
                          <Store size={10} />
                          {STORES.find(s => s.id === product.storeId)?.name || "Unknown Store"}
                        </span>
                        {/* Agent Indicator */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                          <User size={10} />
                          {AGENTS.find(a => a.id === product.agentId)?.name || "Unknown Agent"}
                        </span>
                      </div>

                      {product.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 line-clamp-2">
                          <AlignLeft size={12} className="inline mr-1 opacity-70" />
                          {product.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {phaseProducts.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                      Drop product here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3.3. Modal Modulators */}
      {isAddModalOpen && (
        <AddProductModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSubmit={handleAddProduct}
          stores={STORES}
          agents={AGENTS}
        />
      )}

      {activeProductModal && (
        <ProductDetailsModal
          product={activeProductModal}
          onClose={() => setActiveProductModal(null)}
          onUpdate={handleUpdateDetails}
          onDelete={handleDeleteProduct}
          stores={STORES}
          agents={AGENTS}
          phases={PIPELINE_PHASES}
        />
      )}
    </div>
  );
}

// ============================================================================
// 4. SUB-COMPONENTS (MODALS)
// ============================================================================

function AddProductModal({ onClose, onSubmit, stores, agents }) {
  const [formData, setFormData] = useState({
    name: '',
    storeId: stores[0].id,
    agentId: agents[0].id,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-indigo-500"/> Inject New Product
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Product Designation</label>
            <input 
              autoFocus
              type="text" 
              required
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm p-2.5 border"
              placeholder="e.g., Fayha Styling Tool GH12"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Assigned Store</label>
              <select 
                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring text-sm p-2.5 border"
                value={formData.storeId}
                onChange={e => setFormData({...formData, storeId: e.target.value})}
              >
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Attributed Agent</label>
              <select 
                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring text-sm p-2.5 border"
                value={formData.agentId}
                onChange={e => setFormData({...formData, agentId: e.target.value})}
              >
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Initial Brief / Notes</label>
            <textarea 
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring text-sm p-2.5 border min-h-[100px]"
              placeholder="Strategic notes..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Initialize Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductDetailsModal({ product, onClose, onUpdate, onDelete, stores, agents, phases }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    notes: product.notes || '',
    storeId: product.storeId || stores[0].id,
    agentId: product.agentId || agents[0].id,
    // Emergent granular fields
    driveLink: product.driveLink || '',
    competitorUrl: product.competitorUrl || ''
  });

  const handleSave = () => {
    onUpdate(product.id, formData);
  };

  const currentPhaseName = phases.find(p => p.index === product.currentPhase)?.name;
  const timeInSystem = product.dateAdded ? new Date(product.dateAdded).toLocaleDateString() : 'Unknown';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentPhaseName}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock size={12}/> Added {timeInSystem}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{product.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Designation</label>
              <input 
                type="text" 
                className="w-full font-semibold border-b border-slate-200 pb-2 focus:border-indigo-500 focus:outline-none text-slate-800 transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Assigned Agent</label>
               <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:ring focus:ring-indigo-100"
                value={formData.agentId}
                onChange={e => setFormData({...formData, agentId: e.target.value})}
              >
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Store</label>
             <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:ring focus:ring-indigo-100"
              value={formData.storeId}
              onChange={e => setFormData({...formData, storeId: e.target.value})}
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Granular Phase Assets</h3>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Google Drive / Assets Link</label>
              <input 
                type="url" 
                placeholder="https://drive.google.com/..."
                className="w-full border-slate-200 rounded-lg shadow-sm text-sm p-2 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600"
                value={formData.driveLink}
                onChange={e => setFormData({...formData, driveLink: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Competitor Reference URL</label>
              <input 
                type="url" 
                placeholder="https://..."
                className="w-full border-slate-200 rounded-lg shadow-sm text-sm p-2 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600"
                value={formData.competitorUrl}
                onChange={e => setFormData({...formData, competitorUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Strategic Notes / Copy Drafts</label>
            <textarea 
              className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-100 text-sm p-3 border min-h-[150px] leading-relaxed resize-y"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
          <button 
            onClick={() => {
              if(window.confirm("Are you certain you wish to purge this entity? This action cascades across all clients.")) {
                onDelete(product.id);
              }
            }}
            className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Purge Entity
          </button>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Commit Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
