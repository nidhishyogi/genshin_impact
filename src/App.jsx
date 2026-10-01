import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const BG_URL = "https://launcher-webstatic.hoyoverse.com/launcher-public/2026/07/16/a8f2d1ba47637ec9c09b184cabd3e817_3426776196823022018.webp";

const ELEMENT_COLORS = {
  Pyro: { border: '#ff5c5c', bg: 'rgba(255, 92, 92, 0.25)', tag: '#ff4d4d' },
  Hydro: { border: '#4cc3ff', bg: 'rgba(76, 195, 255, 0.25)', tag: '#1e90ff' },
  Anemo: { border: '#5cf0ba', bg: 'rgba(92, 240, 186, 0.25)', tag: '#20b2aa' },
  Electro: { border: '#b870ff', bg: 'rgba(184, 112, 255, 0.25)', tag: '#9932cc' },
  Dendro: { border: '#8bd936', bg: 'rgba(139, 217, 54, 0.25)', tag: '#689f38' },
  Cryo: { border: '#98f5ff', bg: 'rgba(152, 245, 255, 0.25)', tag: '#00ced1' },
  Geo: { border: '#e8b54b', bg: 'rgba(232, 181, 75, 0.25)', tag: '#d4af37' },
  Default: { border: '#8892b0', bg: 'rgba(136, 146, 176, 0.25)', tag: '#666' }
};

const VISIONS = ['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'];
const WEAPONS = ['All', 'Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [characterDetails, setCharacterDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const listRes = await axios.get('https://genshin.jmp.blue/characters');
        const characterList = listRes.data;
        setCharacters(characterList);

        const detailPromises = characterList.map((name) =>
          axios
            .get(`https://genshin.jmp.blue/characters/${name}`)
            .then((res) => ({ name, data: res.data }))
            .catch(() => ({ name, data: null }))
        );

        const results = await Promise.all(detailPromises);
        const detailsMap = {};
        results.forEach((item) => {
          if (item.data) detailsMap[item.name] = item.data;
        });

        setCharacterDetails(detailsMap);
      } catch (err) {
        console.error('Failed to load character data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return (
    <BrowserRouter>
      <div
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.35), rgba(10, 15, 30, 0.35)), url(${BG_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'default'
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <CharacterList
                characters={characters}
                details={characterDetails}
                loading={loading}
              />
            }
          />
          <Route
            path="/character/:name"
            element={<CharacterDetail details={characterDetails} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function CharacterList({ characters, details, loading }) {
  const [selectedVision, setSelectedVision] = useState('All');
  const [selectedWeapon, setSelectedWeapon] = useState('All');
  const scrollRef = useRef(null);

  if (loading) {
    return (
      <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600 }}>
        Loading characters...
      </div>
    );
  }

  const filteredCharacters = characters.filter((name) => {
    const char = details[name];
    if (!char) return true;
    const matchVision = selectedVision === 'All' || char.vision === selectedVision;
    const matchWeapon = selectedWeapon === 'All' || char.weapon === selectedWeapon;
    return matchVision && matchWeapon;
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        padding: '20px'
      }}
    >
      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '35px',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '10px 24px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#ddd', fontSize: '0.9rem', fontWeight: 600 }}>Vision:</label>
          <select
            value={selectedVision}
            onChange={(e) => setSelectedVision(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#1e293b',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {VISIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#ddd', fontSize: '0.9rem', fontWeight: 600 }}>Weapon:</label>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#1e293b',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {WEAPONS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Slider Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: '5px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(80, 200, 255, 0.5)',
            color: '#fff',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)'
          }}
        >
          ‹
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '18px',
            overflowX: 'scroll',
            padding: '25px 55px',
            width: '100%',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {filteredCharacters.map((charName) => {
            const char = details[charName];
            const elem = ELEMENT_COLORS[char?.vision] || ELEMENT_COLORS.Default;

            return (
              <Link
                key={charName}
                to={`/character/${charName}`}
                style={{
                  textDecoration: 'none',
                  flexShrink: 0,
                  width: '145px',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: `2px solid ${elem.border}`,
                  boxShadow: `0 0 12px ${elem.bg}`,
                  borderRadius: '20px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${elem.border}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 0 12px ${elem.bg}`;
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: `2px solid ${elem.border}`,
                    overflow: 'hidden',
                    marginBottom: '10px',
                    background: elem.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={`https://genshin.jmp.blue/characters/${charName}/icon`}
                    alt={charName}
                    onError={(e) => {
                      e.target.src = 'https://genshin.jmp.blue/characters/amber/icon';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <span
                  style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textAlign: 'center',
                    marginBottom: '8px',
                    textTransform: 'capitalize'
                  }}
                >
                  {char?.name || charName}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: elem.tag,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {char?.vision || 'Unknown'}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: '5px',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(80, 200, 255, 0.5)',
            color: '#fff',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)'
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function CharacterDetail({ details }) {
  const { name } = useParams();
  const [character, setCharacter] = useState(details[name] || null);
  const [loading, setLoading] = useState(!details[name]);

  useEffect(() => {
    if (!character) {
      axios
        .get(`https://genshin.jmp.blue/characters/${name}`)
        .then((res) => {
          setCharacter(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [name, character]);

  if (loading) {
    return (
      <div style={{ color: '#fff', fontSize: '1.4rem' }}>
        Loading character details...
      </div>
    );
  }

  const elem = ELEMENT_COLORS[character?.vision] || ELEMENT_COLORS.Default;
  const rarityStars = '★'.repeat(character?.rarity || 4);

  return (
    <div style={{ maxWidth: '900px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '30px 10px', color: '#fff', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          color: '#e2f4ff',
          textDecoration: 'none',
          padding: '8px 18px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(80, 200, 255, 0.4)',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: 600
        }}
      >
        ← Back to Characters
      </Link>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          padding: '35px',
          borderRadius: '20px',
          border: `2px solid ${elem.border}`,
          boxShadow: `0 0 25px ${elem.bg}`,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '20px' }}>
          <img
            src={`https://genshin.jmp.blue/characters/${name}/icon`}
            alt={name}
            onError={(e) => {
              e.target.src = 'https://genshin.jmp.blue/characters/amber/icon';
            }}
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: `3px solid ${elem.border}`,
              backgroundColor: 'rgba(0,0,0,0.3)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '2.4rem',
                  cursor: 'default',
                  userSelect: 'none'
                }}
              >
                {character?.name || name}
              </h1>
              <span style={{ color: '#ffd700', fontSize: '1.4rem', letterSpacing: '2px' }}>
                {rarityStars}
              </span>
            </div>
            <p style={{ margin: '4px 0 10px 0', color: '#94a3b8', fontStyle: 'italic' }}>
              {character?.title || 'Unknown Title'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span
                style={{
                  background: elem.tag,
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {character?.vision}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}
              >
                Weapon: {character?.weapon}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}
              >
                Nation: {character?.nation}
              </span>
            </div>
          </div>
        </div>

        <p style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '1rem', marginBottom: '30px' }}>
          {character?.description}
        </p>

        {/* Skill Talents */}
        {character?.skillTalents && character.skillTalents.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                borderBottom: `2px solid ${elem.border}`,
                paddingBottom: '6px',
                marginBottom: '15px',
                cursor: 'default',
                userSelect: 'none'
              }}
            >
              Skill Talents
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {character.skillTalents.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${elem.border}`
                  }}
                >
                  <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>{skill.name}</strong>
                  <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    ({skill.unlock})
                  </span>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constellations */}
        {character?.constellations && character.constellations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                borderBottom: `2px solid ${elem.border}`,
                paddingBottom: '6px',
                marginBottom: '15px',
                cursor: 'default',
                userSelect: 'none'
              }}
            >
              Constellations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {character.constellations.map((con, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: `4px solid #ffd700`
                  }}
                >
                  <strong style={{ color: '#ffd700', fontSize: '1rem' }}>
                    {con.unlock}: {con.name}
                  </strong>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {con.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ascension Materials */}
        {character?.ascension_materials && (
          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                borderBottom: `2px solid ${elem.border}`,
                paddingBottom: '6px',
                marginBottom: '15px',
                cursor: 'default',
                userSelect: 'none'
              }}
            >
              Ascension Materials
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}
            >
              {Object.entries(character.ascension_materials).map(([category, items]) => (
                <div
                  key={category}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '14px',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'capitalize',
                      marginBottom: '8px'
                    }}
                  >
                    {category.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9' }}>
                    {Array.isArray(items) ? items.join(', ') : String(items)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}