'use client';

import { useState, useEffect } from 'react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Extract headings from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    const headingData = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent;
      const level = parseInt(heading.tagName.charAt(1));
      
      return { id, text, level };
    });
    
    setHeadings(headingData);
    
    // Add IDs to actual headings in the DOM after component mounts
    setTimeout(() => {
      const actualHeadings = document.querySelectorAll('.prose h2, .prose h3');
      actualHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }, 100);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    const headingElements = document.querySelectorAll('.prose h2, .prose h3');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length < 2) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all z-40 hidden lg:block"
        title="Table of Contents"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>

      {/* Table of Contents */}
      {isVisible && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 max-h-96 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Table of Contents</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav>
              <ul className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        activeId === heading.id
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } ${heading.level === 3 ? 'ml-4' : ''}`}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
}