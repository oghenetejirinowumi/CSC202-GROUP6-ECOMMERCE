'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SmartphonesPage() {
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <div style={{ 
      padding: '20px',
      width: '100%'
    }}>
      {/* Sort and Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        marginBottom: '20px' 
      }}>
        {/* Sort Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSortMenu(!showSortMenu)}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#e5e7eb',
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            Sort
            <ChevronDown size={18} />
          </button>
          {showSortMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '5px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              minWidth: '150px',
              zIndex: 10,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <button onClick={() => { setSortBy('name'); setShowSortMenu(false); }} style={{width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', backgroundColor: sortBy === 'name' ? '#d1d5db' : 'white', cursor: 'pointer', borderRadius: '8px'}}>Name</button>
              <button onClick={() => { setSortBy('price-low'); setShowSortMenu(false); }} style={{width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', backgroundColor: sortBy === 'price-low' ? '#d1d5db' : 'white', cursor: 'pointer', borderRadius: '8px'}}>Price (Low)</button>
              <button onClick={() => { setSortBy('price-high'); setShowSortMenu(false); }} style={{width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', backgroundColor: sortBy === 'price-high' ? '#d1d5db' : 'white', cursor: 'pointer', borderRadius: '8px'}}>Price (High)</button>
              <button onClick={() => { setSortBy('rating'); setShowSortMenu(false); }} style={{width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', backgroundColor: sortBy === 'rating' ? '#d1d5db' : 'white', cursor: 'pointer', borderRadius: '8px'}}>Rating</button>
            </div>
          )}
        </div>

        {/* Filter Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: showFilters ? '#d1d5db' : '#e5e7eb',
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            Filter
            <ChevronDown size={18} />
          </button>
          {showFilterMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '5px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              minWidth: '150px',
              zIndex: 10,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '10px'
            }}>
              <p style={{margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500'}}>Filter options</p>
              <button onClick={() => setShowFilters(!showFilters)} style={{width: '100%', padding: '10px 15px', textAlign: 'left', border: 'none', backgroundColor: '#e5e7eb', cursor: 'pointer', borderRadius: '8px'}}>Show all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Filters</h3>
          <p>Filter options coming soon</p>
        </div>
      )}
    </div>
  );
}