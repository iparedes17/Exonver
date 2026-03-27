import React from 'react';
import { formatDateTime } from '../utils/helpers';

export function PipelineHistory({ history=[], stages=[] }) {
  const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));
  if (!history.length) return <p style={{ fontSize:12, color:'var(--text-3)' }}>Sin historial.</p>;

  return (
    <div style={{ position:'relative', paddingLeft:20 }}>
      <div style={{ position:'absolute', left:7, top:8, bottom:8, width:1, background:'var(--border)' }}/>
      {[...history].reverse().map((entry, i) => {
        const to          = stageMap[entry.to];
        const from        = stageMap[entry.from];
        const isTask      = !!entry.isTask;
        const dotColor    = isTask ? '#60a5fa' : (to?.dot || '#8f95a8');
        const borderColor = isTask ? 'rgba(167,139,250,0.25)' : 'var(--border)';

        return (
          <div key={i} style={{ position:'relative', marginBottom: i < history.length - 1 ? 14 : 0 }}>
            <div style={{
              position:'absolute', left:-13, top:6,
              width:9, height:9, borderRadius:'50%',
              background:dotColor, boxShadow:'0 0 6px ' + dotColor,
              border:'2px solid var(--bg-card)',
            }}/>
            <div style={{
              background:'var(--bg-deep)',
              boxShadow:'var(--neu-inset)',
              border:'1px solid ' + borderColor,
              borderRadius:10,
              padding:'10px 14px',
            }}>
              {isTask ? (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#60a5fa', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>
                    📋 Tarea
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:3, lineHeight:1.5 }}>
                    {entry.note}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5, flexWrap:'wrap' }}>
                    {entry.from && from && (
                      <span className="badge" style={{ background:from.color, color:from.textColor, border:'1px solid ' + from.textColor + '25', fontSize:10 }}>
                        <span style={{ width:4, height:4, borderRadius:'50%', background:from.dot, display:'inline-block', marginRight:4 }}/>
                        {from.label}
                      </span>
                    )}
                    {entry.from && (
                      <span style={{ fontSize:10, color:'var(--text-3)' }}>→</span>
                    )}
                    {to && (
                      <span className="badge" style={{ background:to.color, color:to.textColor, border:'1px solid ' + to.textColor + '25', fontSize:10 }}>
                        <span style={{ width:4, height:4, borderRadius:'50%', background:to.dot, display:'inline-block', marginRight:4 }}/>
                        {to.label}
                      </span>
                    )}
                  </div>
                  {entry.note && (
                    <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:3 }}>{entry.note}</div>
                  )}
                </div>
              )}
              <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>
                {formatDateTime(entry.date)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
