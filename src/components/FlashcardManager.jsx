import { useState, useEffect } from 'react';
import { X, Plus, FolderOpen, Folder, ChevronLeft, RotateCcw, CheckCircle2, XCircle, Layers, Pencil, Trash2, BookOpen } from 'lucide-react';

function getStorageKey() {
  const userId = localStorage.getItem('pokus-user-id');
  return userId ? `pokus-flashcards-${userId}` : 'pokus-flashcards-guest';
}

function loadDecks() {
  try { 
    return JSON.parse(localStorage.getItem(getStorageKey()) || '[]'); 
  } catch { 
    return [];
   }
}
function saveDecks(decks) {
  localStorage.setItem(getStorageKey(), JSON.stringify(decks));
}

function FlipCard({ front, back, index, total, onKnow, onDontKnow }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [index]);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-slate-400 text-sm">{index + 1} / {total}</p>

      {}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          style={{
            transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            position: 'relative',
            height: '200px',
          }}
        >
          {}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-lg flex flex-col items-center justify-center p-6 shadow-2xl shadow-purple-500/10"
          >
            <div className="w-8 h-8 bg-purple-500/20 rounded-md flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-white text-lg font-semibold text-center leading-relaxed">{front}</p>
            <p className="text-slate-500 text-xs mt-4">Ketuk untuk balik kartu</p>
          </div>

          {}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 rounded-lg flex flex-col items-center justify-center p-6 shadow-2xl shadow-emerald-500/10"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-md flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-emerald-100 text-base text-center leading-relaxed">{back}</p>
          </div>
        </div>
      </div>

      {}
      <div
        style={{
          opacity: flipped ? 1 : 0,
          transform: flipped ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.3s ease',
          pointerEvents: flipped ? 'auto' : 'none',
        }}
        className="flex gap-3 w-full"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDontKnow(); }}
          className="flex-1 py-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/25 transition-all font-medium text-sm"
        >
          <XCircle className="w-4 h-4" /> Belum tahu
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onKnow(); }}
          className="flex-1 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-500/25 transition-all font-medium text-sm"
        >
          <CheckCircle2 className="w-4 h-4" /> Tahu!
        </button>
      </div>
    </div>
  );
}

function StudyMode({ deck, onBack }) {
  const [idx, setIdx] = useState(0);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [done, setDone] = useState(false);

  const cards = deck.cards;

  const handleKnow = () => {
    setKnown(k => k + 1);
    if (idx + 1 >= cards.length) setDone(true);
    else setIdx(i => i + 1);
  };

  const handleDontKnow = () => {
    setUnknown(u => u + 1);
    if (idx + 1 >= cards.length) setDone(true);
    else setIdx(i => i + 1);
  };

  const handleRestart = () => { setIdx(0); setKnown(0); setUnknown(0); setDone(false); };

  if (done) {
    const pct = Math.round((known / cards.length) * 100);
    return (
      <div className="text-center space-y-6 py-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-white text-xl font-bold mb-1">Sesi Selesai!</h3>
          <p className="text-slate-400 text-sm">Kamu sudah melalui semua kartu</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-5 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Tahu</span>
            <span className="text-emerald-400 font-bold">{known} kartu</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Belum tahu</span>
            <span className="text-red-400 font-bold">{unknown} kartu</span>
          </div>
          <div className="h-px bg-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Skor</span>
            <span className={`font-bold text-lg ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
          </div>
          {}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleRestart} className="flex-1 py-3 bg-slate-700/80 border border-slate-600/50 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-600/80 transition-all text-sm font-medium">
            <RotateCcw className="w-4 h-4" /> Ulangi
          </button>
          <button onClick={onBack} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h3 className="text-white font-semibold">{deck.name}</h3>
          <p className="text-slate-500 text-xs">{cards.length} kartu</p>
        </div>
      </div>

      {}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${((idx) / cards.length) * 100}%` }}
        />
      </div>

      <FlipCard
        front={cards[idx].front}
        back={cards[idx].back}
        index={idx}
        total={cards.length}
        onKnow={handleKnow}
        onDontKnow={handleDontKnow}
      />
    </div>
  );
}

function AddCardForm({ onAdd, onCancel }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onAdd({ id: Date.now().toString(), front: front.trim(), back: back.trim() });
    setFront(''); setBack('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-slate-400 text-xs mb-1.5">Pertanyaan / Depan Kartu</label>
        <textarea
          value={front}
          onChange={e => setFront(e.target.value)}
          placeholder="Tulis pertanyaan atau istilah..."
          rows={2}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-slate-400 text-xs mb-1.5">Jawaban / Belakang Kartu</label>
        <textarea
          value={back}
          onChange={e => setBack(e.target.value)}
          placeholder="Tulis jawaban atau definisi..."
          rows={2}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!front.trim() || !back.trim()}
          className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all text-sm font-medium">
          Tambah Kartu
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 bg-slate-700/80 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600/80 transition-all text-sm">
          Batal
        </button>
      </div>
    </form>
  );
}

// Deck Detail
function DeckDetail({ deck, onBack, onUpdate }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [studying, setStudying] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  if (studying) {
    if (deck.cards.length === 0) return null;
    return <StudyMode deck={deck} onBack={() => setStudying(false)} />;
  }

  const handleAddCard = (card) => {
    const updated = { ...deck, cards: [...deck.cards, card] };
    onUpdate(updated);
    setShowAddCard(false);
  };

  const handleDeleteCard = (cardId) => {
    const updated = { ...deck, cards: deck.cards.filter(c => c.id !== cardId) };
    onUpdate(updated);
    if (editingCardId === cardId) setEditingCardId(null);
  };

  const startEdit = (card) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setShowAddCard(false);
  };

  const cancelEdit = () => setEditingCardId(null);

  const saveEdit = () => {
    if (!editFront.trim() || !editBack.trim()) return;
    const updated = {
      ...deck,
      cards: deck.cards.map(c =>
        c.id === editingCardId ? { ...c, front: editFront.trim(), back: editBack.trim() } : c
      ),
    };
    onUpdate(updated);
    setEditingCardId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{deck.name}</h3>
          <p className="text-slate-500 text-xs">{deck.cards.length} kartu</p>
        </div>
        {deck.cards.length > 0 && (
          <button
            onClick={() => setStudying(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" /> Mulai Belajar
          </button>
        )}
      </div>

      {/* Card list */}
      {deck.cards.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {deck.cards.map((card, i) => (
            <div key={card.id}>
              {editingCardId === card.id ? (
                // Inline Edit Form
                <div className="bg-slate-800/80 border border-purple-500/40 rounded-lg p-4 space-y-3">
                  <p className="text-purple-400 text-xs font-semibold">Edit Kartu {i + 1}</p>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Pertanyaan / Depan</label>
                    <textarea
                      value={editFront}
                      onChange={e => setEditFront(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Jawaban / Belakang</label>
                    <textarea
                      value={editBack}
                      onChange={e => setEditBack(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editFront.trim() || !editBack.trim()}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:shadow-lg transition-all"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                // Normal Card Row
                <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3.5 flex items-start gap-3 group hover:border-slate-600/60 transition-all">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-purple-400 text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{card.front}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={() => startEdit(card)}
                      title="Edit kartu"
                      className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all text-purple-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      title="Hapus kartu"
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-700" />
          <p className="text-sm">Belum ada kartu</p>
          <p className="text-xs mt-1">Tambah kartu pertama kamu!</p>
        </div>
      )}

      {/* Add card section — hidden while editing */}
      {!editingCardId && (showAddCard ? (
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-white text-sm font-semibold mb-3">Kartu Baru</h4>
          <AddCardForm onAdd={handleAddCard} onCancel={() => setShowAddCard(false)} />
        </div>
      ) : (
        <button onClick={() => setShowAddCard(true)}
          className="w-full py-3 bg-slate-800/30 border-2 border-dashed border-slate-600/50 text-slate-400 rounded-lg hover:border-purple-500/40 hover:text-purple-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Kartu
        </button>
      ))}
    </div>
  );
}

// Main Component
export default function FlashcardManager({ onClose }) {
  const [decks, setDecks] = useState(loadDecks);
  const [activeDeck, setActiveDeck] = useState(null);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  useEffect(() => { saveDecks(decks); }, [decks]);

  const handleCreateDeck = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const deck = { id: Date.now().toString(), name: newDeckName.trim(), cards: [], createdAt: new Date().toISOString() };
    setDecks(d => [...d, deck]);
    setNewDeckName('');
    setShowNewDeck(false);
    setActiveDeck(deck);
  };

  const handleUpdateDeck = (updated) => {
    setDecks(d => d.map(deck => deck.id === updated.id ? updated : deck));
    setActiveDeck(updated);
  };

  const handleDeleteDeck = (deckId) => {
    setDecks(d => d.filter(deck => deck.id !== deckId));
    if (activeDeck?.id === deckId) setActiveDeck(null);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="bg-slate-800/80 border-b border-slate-700/60 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Flashcard</h2>
              <p className="text-slate-400 text-xs">Active Recall — {decks.length} deck</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/15 hover:text-red-400 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeDeck ? (
            <DeckDetail
              deck={activeDeck}
              onBack={() => setActiveDeck(null)}
              onUpdate={handleUpdateDeck}
            />
          ) : (
            <div className="space-y-4">
              {/* Deck list */}
              {decks.length > 0 ? (
                <div className="space-y-2">
                  {decks.map(deck => (
                    <div key={deck.id}
                      className="bg-slate-800/50 border border-slate-700/40 hover:border-purple-500/30 rounded-lg p-4 flex items-center gap-3 group cursor-pointer hover:bg-slate-800/80 transition-all"
                      onClick={() => setActiveDeck(deck)}
                    >
                      <div className="w-10 h-10 bg-purple-500/15 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-500/25 transition-colors">
                        <Folder className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{deck.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{deck.cards.length} kartu</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteDeck(deck.id); }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <FolderOpen className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-800/60 rounded-2xl flex items-center justify-center">
                    <Layers className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-sm">Belum ada deck</p>
                  <p className="text-xs mt-1">Buat deck pertama untuk mulai belajar!</p>
                </div>
              )}

              {/* New deck form */}
              {showNewDeck ? (
                <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-white text-sm font-semibold mb-3">Deck Baru</h4>
                  <form onSubmit={handleCreateDeck} className="flex gap-2">
                    <input
                      type="text"
                      value={newDeckName}
                      onChange={e => setNewDeckName(e.target.value)}
                      placeholder="Nama deck (mis: Biologi Sel)"
                      autoFocus
                      className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                    />
                    <button type="submit" disabled={!newDeckName.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg disabled:opacity-40 hover:shadow-lg transition-all text-sm font-medium">
                      Buat
                    </button>
                    <button type="button" onClick={() => { setShowNewDeck(false); setNewDeckName(''); }}
                      className="px-3 py-2.5 bg-slate-700/80 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600/80 transition-all text-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <button onClick={() => setShowNewDeck(true)}
                  className="w-full py-3.5 bg-slate-800/30 border-2 border-dashed border-slate-600/50 text-slate-400 rounded-lg hover:border-purple-500/50 hover:text-purple-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                  <Plus className="w-4 h-4" /> Buat Deck Baru
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
